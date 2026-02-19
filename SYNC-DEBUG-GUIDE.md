# Warehouse Tracker — Backend Sync Debugging Guide

## 🔴 Current Problem

**Symptoms:**
- Mobile shows 180 items, desktop shows 176 (4 items not syncing)
- Mobile shows 7 transactions, desktop shows 0 (all transactions not syncing)
- Mobile shows 3 access entries, desktop shows 0 (all access not syncing)

**Root Cause:**  
`callBackend()` is being called but requests are failing silently. Google Sheets never receives the data.

---

## 🔍 Step 1: Check Apps Script URL

**In your local `src/App.jsx`:**

```javascript
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
const IS_DEMO = false;
```

**Verify:**
- [ ] APPS_SCRIPT_URL is NOT the placeholder
- [ ] IS_DEMO is `false` (not `true`, not auto-calculated)
- [ ] URL ends with `/exec` (not `/dev`)

---

## 🔍 Step 2: Test Backend Directly

Open this URL in your browser:
```
https://script.google.com/macros/s/YOUR_ID/exec?action=ping
```

**Expected response:**
```json
{"success":true,"message":"CCOAN Warehouse Tracker API is running."}
```

**If you get:**
- `Authorization required` → Apps Script deployment needs fixing (Step 3)
- `404 Not Found` → Wrong URL (check deployment URL)
- CORS error → Browser security, but the app should handle this

---

## 🔍 Step 3: Check Apps Script Deployment

**In Google Sheets → Extensions → Apps Script:**

1. **Click Deploy → Manage deployments**
2. **Check settings:**
   - Execute as: **Me (your email)**
   - Who has access: **Anyone**
3. **If wrong, edit and update:**
   - Click pencil icon → Change settings → Deploy
4. **Copy the Web App URL** and paste into `src/App.jsx`

---

## 🔍 Step 4: Check Browser Console for Errors

**On mobile (Chrome):**
1. Open the app
2. Tap the hamburger menu (⋮) → More tools → Remote devices
3. On desktop Chrome → chrome://inspect → Find your device
4. Click "inspect" → Console tab

**On desktop:**
1. Press F12 → Console tab
2. Add an item or log access
3. Look for red errors like:
   - `❌ Backend sync failed: ...`
   - `CORS error`
   - `Failed to fetch`

**If you see errors, copy them and send to Claude for analysis.**

---

## 🔍 Step 5: Verify Apps Script is Receiving Requests

**In Apps Script Editor:**

1. Click **Executions** (⏱️ icon on left sidebar)
2. Add an item in the app
3. Refresh Executions page
4. **You should see:**
   - A new execution for `doPost`
   - Status: **Completed** or **Failed**

**If NO executions appear:**  
→ Frontend isn't reaching the backend at all (check URL)

**If executions show FAILED:**  
→ Click the failed execution to see the error message

---

## 🔍 Step 6: Test a Specific Backend Call

**Open browser console on the app page, paste this:**

```javascript
fetch("https://script.google.com/macros/s/YOUR_ID/exec", {
  method: "POST",
  redirect: "follow",
  body: JSON.stringify({ 
    action: "addItem", 
    item: {
      id: "TEST123",
      item: "Test Item",
      brand: "Test Brand",
      model: "Test Model",
      serialNo: "123",
      category: "Equipment",
      type: "Tool",
      cabinet: "Test Cabinet",
      shelf: "Test Shelf",
      qty: 1,
      photoUrl: ""
    }
  })
})
.then(r => r.text())
.then(text => console.log("✅ Response:", text))
.catch(err => console.error("❌ Error:", err));
```

**Expected response:**
```json
{"success":true,"message":"Item added: Test Item"}
```

**If it works:**  
→ Check your Google Sheet → Inventory tab → "TEST123" should appear

**If it fails:**  
→ Copy the error and send to Claude

---

## 🔍 Step 7: Check Google Sheets Structure

**Open your Google Sheet and verify tabs exist:**

- [ ] **Inventory** (columns: ID, Name, Brand, Model, SerialNo, Category, Type, Cabinet, Shelf, Qty, Status, CheckedOutBy, CheckedOutDate, PhotoURL)
- [ ] **TransactionLog** (columns: Timestamp, Action, ItemID, ItemName, UserName, Quantity, Notes)
- [ ] **AccessLog** (columns: Timestamp, UserName, Reason)
- [ ] **Users** (columns: Name, Role, PIN, Active)

**If tabs are missing:**  
→ Run `initializeSheets()` manually in Apps Script:
1. In Apps Script editor, find the function `initializeSheets`
2. Click Run (▶️ icon at top)
3. Authorize if prompted
4. Check logs for "Inventory sheet created" messages

---

## 🔍 Step 8: Check Network Tab

**Desktop Chrome → F12 → Network tab:**

1. Clear the log
2. Add an item in the app
3. Look for a POST request to `script.google.com`
4. Click it → **Preview** tab to see the response

**If response is empty or shows an error:**  
→ Screenshot it and send to Claude

---

## 🛠️ Quick Fixes

### Fix 1: If IS_DEMO is still true

**In `src/App.jsx`:**
```javascript
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec";
const IS_DEMO = false;  // ← MUST be false, not calculated
```

### Fix 2: If Apps Script has wrong column indices

The updated backend expects these columns in **Inventory** sheet:
```
A=ID, B=Name, C=Brand, D=Model, E=SerialNo, F=Category, G=Type,
H=Cabinet, I=Shelf, J=Qty, K=Status, L=CheckedOutBy, M=CheckedOutDate, N=PhotoURL
```

**If your sheet has a different order:**  
→ Either rearrange columns to match, or update the Apps Script `getInventoryData` function

### Fix 3: Manual sync button

**On desktop dashboard, click the "🔄 Sync Now" button** — this will:
1. Pull all data from Google Sheets
2. Merge with local data
3. Show errors if any

---

## 🎯 Most Likely Culprits

**In order of likelihood:**

1. **APPS_SCRIPT_URL is wrong** (90% chance)  
   → Double-check it ends with `/exec` and matches your deployment URL

2. **IS_DEMO is still true** (80% chance)  
   → Set it to `false` explicitly

3. **Apps Script deployment settings** (50% chance)  
   → Should be "Execute as: Me" + "Who has access: Anyone"

4. **Google Sheets structure mismatch** (30% chance)  
   → Sheet tabs or columns don't match what the script expects

5. **CORS/Network issue** (10% chance)  
   → Usually shows error in console

---

## 📤 What to Send to Claude

If you're still stuck, send:

1. **Screenshot of browser console** (with errors visible)
2. **Screenshot of Apps Script Executions page**
3. **Screenshot of your Google Sheets tabs** (showing tab names)
4. **Result of the "Test a Specific Backend Call" from Step 6**
5. **First few lines of `src/App.jsx`** showing APPS_SCRIPT_URL and IS_DEMO

---

## ✅ Success Checklist

Once fixed, you should see:

- [ ] Browser console shows: `✅ Response: {"success":true,...}`
- [ ] Apps Script Executions shows: **Completed** executions
- [ ] Google Sheets Inventory tab has new items
- [ ] Google Sheets TransactionLog tab has entries
- [ ] Desktop dashboard matches mobile after clicking "🔄 Sync Now"

---

## 🔧 Emergency: Clear Everything and Start Fresh

**If completely broken:**

1. **Clear localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Redeploy Apps Script:**
   - Apps Script → Deploy → New deployment → Web app
   - Copy the NEW URL
   - Update `src/App.jsx`
   - Rebuild: `npm run build && npx gh-pages -d dist`

3. **Re-import the 176 items CSV** into Google Sheets

4. **Test with one item** before adding more
