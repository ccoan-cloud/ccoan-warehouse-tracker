/**
 * CCOAN WAREHOUSE TRACKER - GOOGLE APPS SCRIPT BACKEND V6
 *
 * CHANGES IN V6:
 * - Added CreatedAt as column O in Inventory sheet
 * - addItem() now saves createdAt timestamp
 * - getInventoryData() now reads and returns createdAt
 * - Added updateItem() — required for Edit Asset feature in the web app
 * - addCreatedAtColumn() — run once to add header to existing sheet
 * - backfillCreatedAt() — run once to set dates on existing rows
 *
 * SHEET COLUMN STRUCTURE (Inventory):
 * A=ID | B=Name | C=Brand | D=Model | E=SerialNo | F=Category | G=Type |
 * H=Cabinet | I=Shelf | J=Qty | K=Status | L=CheckedOutBy | M=CheckedOutDate |
 * N=PhotoURL | O=CreatedAt  <- NEW
 *
 * UPGRADING FROM V5:
 * 1. Replace ALL code with this file, Save
 * 2. Run addCreatedAtColumn() once from the editor
 * 3. Run backfillCreatedAt() and fill in your known dates (see function below)
 * 4. Re-deploy as new deployment, copy new URL to App.jsx
 */

const PHOTO_FOLDER_NAME = "CCOAN Warehouse Photos";

// ── CORS ──────────────────────────────────────────────────────────────────────
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    initializeSheets();
    switch (data.action) {
      case "login":        return makeResponse(...validateLogin(data.userName, data.pin));
      case "getAll":       return makeResponse(true, getAllData());
      case "checkOut":     return makeResponse(...checkOutTool(data.itemId, data.userName, data.notes));
      case "returnItem":   return makeResponse(...returnTool(data.itemId, data.userName));
      case "useConsumable":return makeResponse(...useConsumable(data.itemId, data.userName, data.qty, data.notes));
      case "restockItem":  return makeResponse(...restockItem(data.itemId, data.qty, data.userName));
      case "logAccess":    return makeResponse(...logAccess(data.userName, data.reason));
      case "addItem":      return makeResponse(...addItem(data.item));
      case "updateItem":   return makeResponse(...updateItem(data.item));
      case "deleteItem":   return makeResponse(...deleteItem(data.itemId));
      case "addUser":      return makeResponse(...addUser(data.userName, data.role, data.pin));
      case "deleteUser":   return makeResponse(...deleteUser(data.userName));
      case "uploadPhoto":  return makeResponse(...uploadPhoto(data.fileName, data.mimeType, data.base64Data));
      default:             return makeResponse(false, { message: "Unknown action: " + data.action });
    }
  } catch (err) {
    return makeResponse(false, { message: "Server error: " + err.toString() });
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "ping")
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "API running." })).setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput("CCOAN Warehouse Tracker API. Use POST requests only.");
}

function makeResponse(success, data) {
  return ContentService.createTextOutput(JSON.stringify({ success, ...(data || {}) })).setMimeType(ContentService.MimeType.JSON);
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function validateLogin(userName, pin) {
  try {
    if (!userName || !pin) return [false, { message: "Name and PIN are required" }];
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    if (!sheet) return [false, { message: "Users sheet not found." }];
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const name = String(data[i][0] || "").trim();
      if (!name) continue;
      if (name.toLowerCase() === userName.trim().toLowerCase()) {
        const active = (data[i][3] === true || String(data[i][3]).toUpperCase() === "TRUE");
        if (!active) return [false, { message: "Account inactive. Contact warehouse manager." }];
        if (String(data[i][2]).trim() === String(pin).trim())
          return [true, { message: "Login successful", userName: name, role: String(data[i][1] || "") }];
        return [false, { message: "Incorrect PIN." }];
      }
    }
    return [false, { message: `User "${userName}" not found.` }];
  } catch (err) { return [false, { message: "Login error: " + err }]; }
}

// ── SHEET INIT ────────────────────────────────────────────────────────────────
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName("Inventory")) {
    const s = ss.insertSheet("Inventory");
    s.appendRow(["ID","Name","Brand","Model","SerialNo","Category","Type","Cabinet","Shelf","Qty","Status","CheckedOutBy","CheckedOutDate","PhotoURL","CreatedAt"]);
    s.getRange("A1:O1").setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    s.setFrozenRows(1);
  }
  if (!ss.getSheetByName("TransactionLog")) {
    const s = ss.insertSheet("TransactionLog");
    s.appendRow(["Timestamp","Action","ItemID","ItemName","UserName","Quantity","Notes"]);
    s.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    s.setFrozenRows(1);
  }
  if (!ss.getSheetByName("AccessLog")) {
    const s = ss.insertSheet("AccessLog");
    s.appendRow(["Timestamp","UserName","Reason"]);
    s.getRange("A1:C1").setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    s.setFrozenRows(1);
  }
  if (!ss.getSheetByName("Users")) {
    const s = ss.insertSheet("Users");
    s.appendRow(["Name","Role","PIN","Active"]);
    s.getRange("A1:D1").setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
    s.setFrozenRows(1);
    s.appendRow(["Samuel","Warehouse Manager / Admin","8721",true]);
  }
}

/**
 * STEP 1 — Run once after upgrading from V5.
 * Adds "CreatedAt" header in column O without touching any existing data.
 */
function addCreatedAtColumn() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  if (!sheet) { Logger.log("Inventory sheet not found"); return; }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (headers.includes("CreatedAt")) { Logger.log("CreatedAt already exists at col " + (headers.indexOf("CreatedAt")+1)); return; }
  const col = sheet.getLastColumn() + 1;
  sheet.getRange(1, col).setValue("CreatedAt").setFontWeight("bold").setBackground("#d4af37").setFontColor("#000000");
  Logger.log("CreatedAt added at column " + col);
}

// ── BACKFILL ──────────────────────────────────────────────────────────────────
/**
 * STEP 2 — Run once to backfill creation dates on existing inventory items.
 *
 * HOW TO USE:
 * 1. Add your item IDs and known dates to the DATES object below.
 *    Find IDs in column A of the Inventory sheet.
 *    Format:  "ITEM_ID": "YYYY-MM-DD"
 *
 * 2. Set FALLBACK_DATE to cover items you don't know the exact date for,
 *    or leave "" to keep them blank.
 *
 * 3. Click Run. Items that already have a date are skipped automatically.
 */
function backfillCreatedAt() {

  // ===== EDIT BELOW: add your known item IDs and dates ======================
  const DATES = {
    // "999999930":     "2024-06-15",
    // "4004722637250": "2024-06-20",
    // Add as many as you know...
  };
  const FALLBACK_DATE = ""; // e.g. "2024-06-01" — used for items not listed above
  // ===== END OF EDIT SECTION ================================================

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  if (!sheet) { Logger.log("Inventory sheet not found"); return; }
  const data = sheet.getDataRange().getValues();
  const colIdx = data[0].indexOf("CreatedAt");
  if (colIdx === -1) { Logger.log("CreatedAt column not found. Run addCreatedAtColumn() first."); return; }

  let updated = 0, skipped = 0;
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0] || "").trim();
    if (!id) continue;
    if (String(data[i][colIdx] || "").trim()) { skipped++; continue; }
    const d = DATES[id] || FALLBACK_DATE;
    if (d) { sheet.getRange(i + 1, colIdx + 1).setValue(d); updated++; }
  }
  Logger.log("Backfill complete: " + updated + " updated, " + skipped + " already had dates.");
}

// ── PHOTO UPLOAD ──────────────────────────────────────────────────────────────
function uploadPhoto(fileName, mimeType, base64Data) {
  try {
    const folder = (() => { const f = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME); return f.hasNext() ? f.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME); })();
    const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return [true, { photoUrl: file.getUrl() }];
  } catch (err) { return [false, { message: "Photo upload failed: " + err }]; }
}

// ── DATA RETRIEVAL ────────────────────────────────────────────────────────────
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ud = ss.getSheetByName("Users").getDataRange().getValues();
  const users = [];
  for (let i = 1; i < ud.length; i++) {
    if (ud[i][0]) users.push({ name: String(ud[i][0]), role: String(ud[i][1]||""), active: (ud[i][3]===true||String(ud[i][3]).toUpperCase()==="TRUE") });
  }
  return { inventory: getInventoryData(ss.getSheetByName("Inventory")), transactions: sheetToJson(ss.getSheetByName("TransactionLog")), accessLog: sheetToJson(ss.getSheetByName("AccessLog")), users };
}

// V6: index 14 = CreatedAt
function getInventoryData(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  return data.slice(1).filter(r => r[0]).map(r => ({
    id: String(r[0]||""), item: String(r[1]||""), brand: String(r[2]||""), model: String(r[3]||""),
    serialNo: String(r[4]||""), category: String(r[5]||""), type: String(r[6]||"Tool"),
    cabinet: String(r[7]||""), shelf: String(r[8]||""), qty: Number(r[9]||0),
    status: String(r[10]||""), checkedOutBy: r[11]?String(r[11]):null, checkedOutAt: r[12]?String(r[12]):null,
    photoUrl: String(r[13]||""), createdAt: r[14] ? (r[14] instanceof Date ? Utilities.formatDate(r[14], "Europe/Amsterdam", "yyyy-MM-dd") : String(r[14]).slice(0,10)) : ""
  }));
}

function sheetToJson(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const h = data[0];
  return data.slice(1).filter(r => r[0]).map(r => { const o={}; h.forEach((k,i)=>{ o[k]=r[i]; }); return o; });
}

// ── COL CONSTANTS ─────────────────────────────────────────────────────────────
const COL = { ID:1, NAME:2, BRAND:3, MODEL:4, SERIALNO:5, CATEGORY:6, TYPE:7, CABINET:8, SHELF:9, QTY:10, STATUS:11, CHECKEDBY:12, CHECKEDAT:13, PHOTO:14, CREATEDAT:15 };

// ── CHECKOUT / RETURN ─────────────────────────────────────────────────────────
function checkOutTool(itemId, userName, notes) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(itemId)) {
      if (data[i][10] === "Checked Out") return [false, { message: data[i][1]+" already checked out by "+data[i][11] }];
      sheet.getRange(i+1,COL.STATUS).setValue("Checked Out");
      sheet.getRange(i+1,COL.CHECKEDBY).setValue(userName);
      sheet.getRange(i+1,COL.CHECKEDAT).setValue(new Date().toISOString());
      sheet.getRange(i+1,1,1,sheet.getLastColumn()).setBackground("#ffcccc");
      logTransaction("checkout",itemId,data[i][1],userName,1,notes||"");
      return [true, { message: "Checked out" }];
    }
  }
  return [false, { message: "Item not found: "+itemId }];
}

function returnTool(itemId, userName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(itemId)) {
      sheet.getRange(i+1,COL.STATUS).setValue("Available");
      sheet.getRange(i+1,COL.CHECKEDBY).setValue("");
      sheet.getRange(i+1,COL.CHECKEDAT).setValue("");
      sheet.getRange(i+1,1,1,sheet.getLastColumn()).setBackground(null);
      logTransaction("return",itemId,data[i][1],data[i][11]||userName,1,"");
      return [true, { message: "Returned" }];
    }
  }
  return [false, { message: "Item not found: "+itemId }];
}

// ── CONSUMABLES ───────────────────────────────────────────────────────────────
function useConsumable(itemId, userName, qty, notes) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(itemId)) {
      const newQty = Math.max(0,(Number(data[i][9])||0)-(qty||1));
      sheet.getRange(i+1,COL.QTY).setValue(newQty);
      sheet.getRange(i+1,1,1,sheet.getLastColumn()).setBackground(newQty===0?"#ffe6cc":null);
      logTransaction("used",itemId,data[i][1],userName,qty,notes||"");
      return [true, { message: "Logged. Remaining: "+newQty }];
    }
  }
  return [false, { message: "Item not found: "+itemId }];
}

function restockItem(itemId, qty, userName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(itemId)) {
      const newQty = (Number(data[i][9])||0)+(qty||1);
      sheet.getRange(i+1,COL.QTY).setValue(newQty);
      sheet.getRange(i+1,1,1,sheet.getLastColumn()).setBackground(null);
      logTransaction("restocked",itemId,data[i][1],userName,qty,"Added "+qty);
      return [true, { message: "Restocked. New qty: "+newQty }];
    }
  }
  return [false, { message: "Item not found: "+itemId }];
}

// ── ACCESS LOG ────────────────────────────────────────────────────────────────
function logAccess(userName, reason) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AccessLog").appendRow([new Date().toISOString(),userName,reason||""]);
  return [true, { message: "Logged" }];
}

// ── ITEM MANAGEMENT ───────────────────────────────────────────────────────────
function addItem(item) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(item.id)) return [false, { message: "ID already exists: "+item.id }];
  }
  sheet.appendRow([item.id, item.item, item.brand||"", item.model||"", item.serialNo||"", item.category||"", item.type||"Tool",
    item.cabinet||"", item.shelf||"", item.qty||1, item.type==="Tool"?"Available":"", "","",
    item.photoUrl||"", item.createdAt||new Date().toISOString()]);
  return [true, { message: "Added: "+item.item }];
}

/**
 * NEW in V6 — Edit Asset handler.
 * Updates all editable fields. Never touches CheckedOutBy/CheckedOutDate.
 * Preserves an existing CreatedAt; only fills it if blank.
 */
function updateItem(item) {
  if (!item || !item.id) return [false, { message: "No item ID provided" }];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(item.id)) {
      sheet.getRange(i+1,COL.ID).setValue(item.id);
      sheet.getRange(i+1,COL.NAME).setValue(item.item||"");
      sheet.getRange(i+1,COL.BRAND).setValue(item.brand||"");
      sheet.getRange(i+1,COL.MODEL).setValue(item.model||"");
      sheet.getRange(i+1,COL.SERIALNO).setValue(item.serialNo||"");
      sheet.getRange(i+1,COL.CATEGORY).setValue(item.category||"");
      sheet.getRange(i+1,COL.TYPE).setValue(item.type||"Tool");
      sheet.getRange(i+1,COL.CABINET).setValue(item.cabinet||"");
      sheet.getRange(i+1,COL.SHELF).setValue(item.shelf||"");
      sheet.getRange(i+1,COL.QTY).setValue(item.qty||0);
      sheet.getRange(i+1,COL.STATUS).setValue(item.status||"Available");
      sheet.getRange(i+1,COL.PHOTO).setValue(item.photoUrl||"");
      if (item.createdAt && !String(data[i][14]||"").trim())
        sheet.getRange(i+1,COL.CREATEDAT).setValue(item.createdAt);
      return [true, { message: "Updated: "+item.item }];
    }
  }
  return [false, { message: "Item not found: "+item.id }];
}

function deleteItem(itemId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(itemId)) { sheet.deleteRow(i+1); return [true, { message: "Deleted: "+data[i][1] }]; }
  }
  return [false, { message: "Item not found: "+itemId }];
}

// ── USER MANAGEMENT ───────────────────────────────────────────────────────────
function addUser(userName, role, pin) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === String(userName).toLowerCase()) return [false, { message: "User exists: "+userName }];
  }
  const p = String(pin||"");
  if (p.length !== 4 || isNaN(p)) return [false, { message: "PIN must be 4 digits" }];
  sheet.appendRow([userName, role||"Volunteer", p, true]);
  return [true, { message: "Added: "+userName }];
}

function deleteUser(userName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userName)) { sheet.deleteRow(i+1); return [true, { message: "Deleted: "+userName }]; }
  }
  return [false, { message: "User not found: "+userName }];
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function logTransaction(action, itemId, itemName, userName, quantity, notes) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TransactionLog")
    .appendRow([new Date().toISOString(), action, String(itemId), String(itemName), String(userName), quantity||1, notes||""]);
}

// ── DIAGNOSTICS ───────────────────────────────────────────────────────────────
function testLogin() {
  Logger.log(JSON.stringify(validateLogin("Samuel","8721")));
}

// ── OVERDUE ALERTS (optional) ─────────────────────────────────────────────────
function checkOverdueCheckouts() {
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory").getDataRange().getValues();
  const now = new Date(); const overdue = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][10]==="Checked Out" && data[i][12]) {
      const days = (now-new Date(data[i][12]))/(864e5);
      if (days>7) overdue.push({ id:data[i][0], name:data[i][1], user:data[i][11], days:Math.floor(days) });
    }
  }
  if (overdue.length) Logger.log("Overdue:\n"+overdue.map(o=>`${o.id} - ${o.name} (${o.user}, ${o.days} days)`).join("\n"));
  // MailApp.sendEmail("you@example.com","Overdue Items",msg);
}
