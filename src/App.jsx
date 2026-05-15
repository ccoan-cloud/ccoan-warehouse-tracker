import { useState, useEffect, useCallback, useRef } from "react";
import { INITIAL_INVENTORY } from './demoData';

// ============================================================
// CONFIGURATION
// ============================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxNfnq1O1w686gX3Uapy-8fpnVijW9fXBApBb0yFwGscCwhKYajXjbyvgI-iJaS1ag/exec";
const IS_DEMO = false;

// ============================================================
// BACKEND SYNC - Simple functions at top level (no scope issues)
// ============================================================

async function callBackend(payload) {
  if (IS_DEMO) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "POST", redirect: "follow", body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = JSON.parse(await res.text());
    if (!result.success) console.error("Backend error:", result.message);
  } catch (err) {
    console.error("Sync failed:", err.message);
  }
}

async function syncFromBackend(setInventory, setLog, setAccessLog, setUsers) {
  if (IS_DEMO) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "POST", redirect: "follow", body: JSON.stringify({ action: "getAll" }) });
    const result = JSON.parse(await res.text());
    if (!result.success) return;

    // Helper to derive a readable date from a timestamp string
const deriveDate = (ts) => {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString("sv-SE", { timeZone: TZ });
  } catch { return ts.slice(0, 10) || ""; }
};

// Helper to format timestamp for display (convert to CET)
const formatTs = (ts) => {
  if (!ts) return "";
  // Already a readable format like "2026-02-20 14:21:45"? Return as-is
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(ts)) return ts;
  try {
    const d = new Date(ts);
    const opts = { 
      timeZone: TZ, 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    };
    const parts = new Intl.DateTimeFormat('sv-SE', opts).formatToParts(d);
    const get = (type) => parts.find(p => p.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  } catch { return ts; }
};

    // Backend is the source of truth â€” but preserve any local edits
    // that haven't yet been persisted to the backend (e.g. photo URL edits)
    if (result.inventory?.length > 0) {
      const pendingEdits = JSON.parse(localStorage.getItem('warehousePendingEdits') || '{}');
      const merged = result.inventory.map(item => {
        const localEdit = pendingEdits[item.id];
        return localEdit ? { ...item, ...localEdit } : item;
      });
      setInventory(merged);
      localStorage.setItem('warehouseInventory', JSON.stringify(merged));
    }

    if (result.transactions?.length > 0) {
      const trans = result.transactions.map(t => ({
        timestamp: formatTs(t.Timestamp || t.timestamp || ""),
        user: t.UserName || t.user || "",
        action: t.Action || t.action || "",
        itemId: t.ItemID || t.itemId || "",
        itemName: t.ItemName || t.itemName || "",
        qty: t.Quantity || t.qty || 1,
        notes: t.Notes || t.notes || "",
        location: t.location || ""
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLog(trans);
      localStorage.setItem('warehouseLog', JSON.stringify(trans));
    }

    if (result.accessLog?.length > 0) {
      const access = result.accessLog.map(a => {
        const ts = formatTs(a.Timestamp || a.timestamp || "");
        return {
          timestamp: ts,
          date: deriveDate(a.Timestamp || a.timestamp || ""),
          user: a.UserName || a.user || "",
          purpose: a.Reason || a.reason || a.Purpose || a.purpose || ""
        };
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAccessLog(access);
      localStorage.setItem('warehouseAccessLog', JSON.stringify(access));
    }

    if (result.users?.length > 0 && setUsers) {
      setUsers(result.users);
      localStorage.setItem('warehouseUsers', JSON.stringify(result.users));
    }
  } catch (err) {
    console.error("Sync error:", err.message);
  }
}


// Demo mode credentials for testing
const DEMO_CREDENTIALS = {
  "Sammy": "1234",
  "Peter": "5678",
  "John": "9012",
  "Maria": "3456",
  "David": "7890",
  "Sarah": "2468",
  "Michael": "1357",
  "Anna": "9876"
};

// CCOAN Logo
const CCOAN_LOGO_WHITE = "https://ccoan.com/almere/wp-content/uploads/sites/12/2024/04/CCOAN-Logo-White-950w-With-Shadow-2.png";

// ============================================================
// CCOAN Brand Colors
// ============================================================
const C = {
  brand: "#1E2470",
  brandLight: "#2A32A0",
  brandBright: "#3D48C8",
  brandDim: "rgba(30,36,112,0.18)",
  brandBorder: "rgba(30,36,112,0.45)",
  brandSoft: "rgba(61,72,200,0.12)",
  accent: "#4A6CF7",
  accentDim: "rgba(74,108,247,0.14)",
  accentBorder: "rgba(74,108,247,0.35)",
  bg: "#0B0D14",
  surface: "#12151E",
  surfaceRaised: "#181C28",
  border: "#1E2230",
  borderLight: "#282E40",
  text: "#E8E8EC",
  textMuted: "#8890A4",
  textDim: "#5A6178",
  white: "#FFFFFF",
  red: "#E04040",
  redDim: "rgba(224,64,64,0.12)",
  green: "#2EAA5A",
  greenDim: "rgba(46,170,90,0.12)",
  orange: "#E8922A",
  orangeDim: "rgba(232,146,42,0.12)",
};


const INITIAL_USERS = [
  { name: "Samuel", role: "Warehouse Manager / Admin", active: true },
  { name: "Timotheos", role: "Group Leader", active: true },
  { name: "MOG Stavros", role: "Department Leader", active: true },
  { name: "Nikos", role: "Group Leader", active: true },
  { name: "Davide", role: "Group Leader", active: true },
  { name: "Orlando", role: "Maintenance", active: true },
  { name: "Angelos", role: "Maintenance", active: true },
  { name: "Sergei", role: "Maintenance", active: true },
  { name: "MOG George", role: "Department Leader", active: true },
  { name: "MOG Giannis", role: "Department Leader", active: true },
  { name: "MOG Harry", role: "Overseer", active: true },
  ];

const TZ = "Europe/Amsterdam";
const now = () => {
  const d = new Date();
  // Format: 2026-05-01 14:30:45 (CET)
  const opts = { 
    timeZone: TZ, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  };
  const parts = new Intl.DateTimeFormat('sv-SE', opts).formatToParts(d);
  const get = (type) => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
};
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: TZ });
// ============================================================
// SEARCHABLE MULTI-SELECT COMPONENT
// ============================================================
function SearchableMultiSelect({ items, selectedIds, onChange, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sid => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  return (
    <div ref={containerRef} style={S.multiSelectContainer}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ ...S.multiSelectTrigger, ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
      >
        <div style={S.multiSelectDisplay}>
          {selectedIds.length === 0 ? (
            <span style={{ color: C.textDim }}>{placeholder}</span>
          ) : (
            <div style={S.multiSelectTags}>
              {selectedItems.map(item => (
                <span key={item.id} style={S.multiSelectTag}>
                  {item.shortLabel || item.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(item.id);
                    }}
                    style={S.multiSelectTagX}
                  >
                    âœ•
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <span style={S.multiSelectArrow}>{isOpen ? "â–²" : "â–¼"}</span>
      </div>

      {isOpen && (
        <div style={S.multiSelectDropdown}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            style={S.multiSelectSearch}
            autoFocus
          />
          <div style={S.multiSelectOptions}>
            {filteredItems.length === 0 ? (
              <div style={S.multiSelectEmpty}>No matches found</div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    ...S.multiSelectOption,
                    ...(selectedIds.includes(item.id) ? S.multiSelectOptionSelected : {})
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => {}}
                    style={S.multiSelectCheckbox}
                  />
                  <span>{item.label}</span>
                </div>
              ))
            )}
          </div>
          {selectedIds.length > 0 && (
            <div style={S.multiSelectFooter}>
              <button onClick={() => onChange([])} style={S.multiSelectClear}>
                Clear All ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SEARCHABLE SINGLE SELECT COMPONENT  
// ============================================================
function SearchableSelect({ options, value, onChange, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={S.searchSelectContainer}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ ...S.searchSelectTrigger, ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
      >
        <span style={selectedOption ? {} : { color: C.textDim }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={S.searchSelectArrow}>{isOpen ? "â–²" : "â–¼"}</span>
      </div>

      {isOpen && (
        <div style={S.searchSelectDropdown}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            style={S.searchSelectInput}
            autoFocus
          />
          <div style={S.searchSelectOptions}>
            {filteredOptions.length === 0 ? (
              <div style={S.searchSelectEmpty}>No matches found</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    ...S.searchSelectOption,
                    ...(opt.value === value ? S.searchSelectOptionActive : {})
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LOGIN SCREEN COMPONENT
// ============================================================
function LoginScreen({ onLogin }) {
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!userName.trim() || !pin.trim()) {
      setError("Please enter both name and PIN");
      return;
    }

    setLoading(true);
    const result = await onLogin(userName.trim(), pin.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div style={S.loginContainer}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{margin:0;background:${C.bg}}
        input,button{font-family:'DM Sans',sans-serif}
      `}</style>
      
      <div style={S.loginBox}>
        <img src={CCOAN_LOGO_WHITE} alt="CCOAN" style={S.loginLogo} onError={e => { e.target.style.display = "none"; }} />
        
        <div style={S.loginTitle}>WAREHOUSE TRACKER</div>
        <div style={S.loginSub}>CCOAN â€” Almere</div>
        
        {IS_DEMO && (
          <div style={S.demoInfo}>
            <strong>Demo Mode</strong><br/>
            Test Credentials:<br/>
            Sammy / 1234 â€¢ Peter / 5678<br/>
            John / 9012 â€¢ David / 7890
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={S.loginForm}>
          <div style={S.loginField}>
            <label style={S.loginLabel}>Name</label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Enter your name"
              style={S.loginInput}
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div style={S.loginField}>
            <label style={S.loginLabel}>PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter your 4-digit PIN"
              maxLength="4"
              pattern="[0-9]*"
              inputMode="numeric"
              style={S.loginInput}
              disabled={loading}
            />
          </div>
          
          {error && <div style={S.loginError}>{error}</div>}
          
          <button type="submit" style={S.loginBtn} disabled={loading}>
            {loading ? "Logging in..." : "ðŸ”“ Login"}
          </button>
        </form>
        
        <div style={S.loginFooter}>
          Secure Access â€¢ V4 Enhanced
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Modal
// ============================================================
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, ...(wide ? { maxWidth: 680 } : {}) }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <h3 style={S.modalTitle}>{title}</h3>
          <button onClick={onClose} style={S.modalX}>âœ•</button>
        </div>
        <div style={S.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// Main App Wrapper with Auth
// ============================================================
export default function WarehouseTrackerWithAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    const expiry = localStorage.getItem("warehouseSessionExpiry");
    if (expiry && Date.now() > parseInt(expiry)) {
      // Session expired (7 days), clear everything
      localStorage.removeItem("warehouseUser");
      localStorage.removeItem("warehouseUserRole");
      localStorage.removeItem("warehouseSessionExpiry");
      return;
    }
    const savedUser = localStorage.getItem("warehouseUser");
    const savedRole = localStorage.getItem("warehouseUserRole");
    if (savedUser) {
      // If the user was deactivated while their session was still valid, force logout
      const savedUsers = JSON.parse(localStorage.getItem('warehouseUsers') || '[]');
      const userRecord = savedUsers.find(u => u.name === savedUser);
      if (userRecord && userRecord.active === false) {
        localStorage.removeItem("warehouseUser");
        localStorage.removeItem("warehouseUserRole");
        localStorage.removeItem("warehouseSessionExpiry");
        return;
      }
      setCurrentUser(savedUser);
      setCurrentUserRole(savedRole || "");
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (userName, pin) => {
    if (IS_DEMO) {
      if (DEMO_CREDENTIALS[userName] === pin) {
        // Find user role
        const user = INITIAL_USERS.find(u => u.name === userName);
        const role = user ? user.role : "";
        
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        localStorage.setItem("warehouseUser", userName);
        localStorage.setItem("warehouseUserRole", role);
        localStorage.setItem("warehouseSessionExpiry", (Date.now() + sevenDays).toString());
        setCurrentUser(userName);
        setCurrentUserRole(role);
        setIsLoggedIn(true);
          syncFromBackend(setInventory, setLog, setAccessLog);
        return { success: true };
      } else {
        return { success: false, message: "Invalid name or PIN" };
      }
    } else {
      try {
        // CORS fix: omit Content-Type header so this stays a "simple request"
        // Apps Script cannot handle CORS preflight (OPTIONS) triggered by application/json
        const response = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          redirect: "follow",
          body: JSON.stringify({
            action: "login",
            userName: userName,
            pin: pin
          }),
        });
        
        const text = await response.text();
        const result = JSON.parse(text);
        
        if (result.success) {
          // Block deactivated users even if their PIN is correct
          const savedUsers = JSON.parse(localStorage.getItem('warehouseUsers') || '[]');
          const userRecord = savedUsers.find(u => u.name.toLowerCase() === userName.toLowerCase());
          if (userRecord && userRecord.active === false) {
            return { success: false, message: "Your account has been deactivated. Contact the administrator." };
          }
          localStorage.setItem("warehouseUser", userName);
          localStorage.setItem("warehouseUserRole", result.role || "");
          setCurrentUser(userName);
          setCurrentUserRole(result.role || "");
          setIsLoggedIn(true);
          // Pull all data from Google Sheets so this device sees everyone's activity
          syncFromBackend();
          return { success: true };
        } else {
          return { success: false, message: result.message || "Invalid name or PIN" };
        }
      } catch (err) {
        console.error("Login error:", err);
        return { success: false, message: "Cannot reach server. Check your internet connection or try again." };
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("warehouseUser");
    localStorage.removeItem("warehouseUserRole");
    localStorage.removeItem("warehouseSessionExpiry");
    setCurrentUser("");
    setCurrentUserRole("");
    setIsLoggedIn(false);
  };


  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <WarehouseTracker currentUser={currentUser} currentUserRole={currentUserRole} onLogout={handleLogout} />;
}

// ============================================================
// Main App Component (Protected)
// ============================================================
function WarehouseTracker({ currentUser, currentUserRole, onLogout }) {
  const isAdmin = currentUserRole === "Warehouse Manager / Admin";
  const [view, setView] = useState("dashboard");
  
  // Load from localStorage or use initial data
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('warehouseInventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('warehouseUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [log, setLog] = useState(() => {
    const saved = localStorage.getItem('warehouseLog');
    return saved ? JSON.parse(saved) : [];
  });
  const [accessLog, setAccessLog] = useState(() => {
    const saved = localStorage.getItem('warehouseAccessLog');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Forms - auto-fill with current user
  const [formUser, setFormUser] = useState(currentUser);
  const [onBehalfOfUser, setOnBehalfOfUser] = useState(""); // Admin can act on behalf of others
  const [formItems, setFormItems] = useState([]); // Multi-select
  const [formAction, setFormAction] = useState("checkout");
  const [formNotes, setFormNotes] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [accessUser, setAccessUser] = useState(currentUser);
  const [accessPurpose, setAccessPurpose] = useState("");
  
  // For consumables
  const [consumableItems, setConsumableItems] = useState([]); // Multi-select
  const [consumableUser, setConsumableUser] = useState(currentUser);
  const [consumableNotes, setConsumableNotes] = useState("");

  // Filters
  const [filterCab, setFilterCab] = useState("All");
  const [search, setSearch] = useState("");
  const [logFilter, setLogFilter] = useState("");

  // Modals
  const [addItemModal, setAddItemModal] = useState(false);
  const [editItemModal, setEditItemModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [assetDetailItem, setAssetDetailItem] = useState(null);
  const [addUserModal, setAddUserModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(null);
  const [scanModal, setScanModal] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(1);

  // New item / user forms
  const [ni, setNi] = useState({ 
    id: "", 
    item: "", 
    brand: "", 
    model: "", 
    serialNo: "",
    category: "Equipment", 
    type: "Tool",
    cabinet: "", 
    shelf: "", 
    qty: 1, 
    photoUrl: "" 
  });
  const [nu, setNu] = useState({ name: "", role: "Maintenance", pin: "" });
  const [photoUrl, setPhotoUrl] = useState("");
  const [scanInput, setScanInput] = useState("");

  // V4: Barcode & Photo States
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const videoRef = useRef(null);          // For Add Item modal barcode
  const checkoutVideoRef = useRef(null);  // For Checkout/Return scanner
  const streamRef = useRef(null);
  const checkoutStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const barcodeIntervalRef = useRef(null);
  const checkoutBarcodeRef = useRef(null);
  // Refs to track active state inside async loops (avoids stale closure)
  const scannerActiveRef = useRef(false);
  const checkoutScannerActiveRef = useRef(false);
  const [checkoutScannerActive, setCheckoutScannerActive] = useState(false);

  const flash = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  // Auto-detect type from category
  const detectType = (category) => {
    const toolCategories = ['Equipment', 'Electrical', 'Furniture and fixtures', 'Networking equipment (router/VPN gateway)', 'Door/Hardware'];
    return toolCategories.includes(category) ? 'Tool' : 'Consumable';
  };


  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('warehouseInventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('warehouseUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('warehouseLog', JSON.stringify(log));
  }, [log]);

  useEffect(() => {
    localStorage.setItem('warehouseAccessLog', JSON.stringify(accessLog));
  }, [accessLog]);

  // â”€â”€ Auto-sync from backend every 60 seconds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (IS_DEMO) return;
    // Initial sync on mount
    syncFromBackend(setInventory, setLog, setAccessLog, setUsers);
    const interval = setInterval(() => {
      syncFromBackend(setInventory, setLog, setAccessLog, setUsers);
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeUsers = users.filter(u => u.active);

  // â”€â”€ Add Item barcode scanner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startBarcodeScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      flash("Camera not available on this browser.", "error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      scannerActiveRef.current = true;
      setScannerActive(true);
      // Assign stream to video â€” use a short delay so React renders the <video> first
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          if ('BarcodeDetector' in window) {
            const det = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'] });
            detectBarcode(det);
          } else {
            // BarcodeDetector not supported (Samsung Internet, Firefox)
            // Camera is live but detection unavailable â€” user can still see the barcode
            // and type it manually. Show a helpful message.
            flash("Live barcode detection not supported on this browser. You can still use the camera to view the barcode and type it below.", "info");
          }
        } else {
          flash("Camera error: video element not ready. Try again.", "error");
          stopBarcodeScanner();
        }
      }, 150);
    } catch (err) {
      console.error("Camera error:", err);
      scannerActiveRef.current = false;
      setScannerActive(false);
      if (err.name === 'NotAllowedError') {
        flash("Camera permission denied. Go to browser settings â†’ Site settings â†’ Camera â†’ Allow.", "error");
      } else if (err.name === 'NotFoundError') {
        flash("No camera found on this device.", "error");
      } else {
        flash("Camera failed: " + err.message, "error");
      }
    }
  };

  const detectBarcode = async (detector) => {
    // Use ref not state â€” avoids stale closure in the async loop
    if (!scannerActiveRef.current || !videoRef.current) return;
    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        stopBarcodeScanner();
        
        // âœ… Check for duplicates immediately after scanning
        const exists = inventory.find(i => String(i.id).toUpperCase() === String(barcode).toUpperCase());
        if (exists) {
          flash(`âš ï¸ Item ID "${barcode}" already exists: ${exists.item}. Choose a different item or edit the existing one.`, "error");
          setScannedBarcode("");
          setNi(prev => ({ ...prev, id: "" }));
          return;
        }
        
        // ID is unique â€” proceed
        setScannedBarcode(barcode);
        setNi(prev => ({ ...prev, id: barcode }));
        flash(`âœ“ Barcode scanned: ${barcode}`);
        return;
      }
    } catch (err) { /* keep scanning */ }
    barcodeIntervalRef.current = setTimeout(() => detectBarcode(detector), 200);
  };

  const stopBarcodeScanner = () => {
    scannerActiveRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (barcodeIntervalRef.current) {
      clearTimeout(barcodeIntervalRef.current);
      barcodeIntervalRef.current = null;
    }
    setScannerActive(false);
  };

  // V4: Photo Capture & Upload Functions
  const handlePhotoCapture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      flash("Only JPG, PNG, GIF allowed", "error");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setPhotoFile(file);
    
    if (!IS_DEMO) {
      setUploadingPhoto(true);
      const uploadedUrl = await uploadPhotoToDrive(file);
      setUploadingPhoto(false);
      
      if (uploadedUrl) {
        setNi(prev => ({ ...prev, photoUrl: uploadedUrl }));
        flash("Photo uploaded successfully!");
      } else {
        flash("Photo upload failed", "error");
      }
    } else {
      const demoUrl = `https://drive.google.com/file/d/DEMO_${Date.now()}/view`;
      setNi(prev => ({ ...prev, photoUrl: demoUrl }));
      flash("Photo ready (demo mode - not actually uploaded)");
    }
  };

  const uploadPhotoToDrive = async (file) => {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;
      
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify({
          action: "uploadPhoto",
          fileName: file.name,
          mimeType: file.type,
          base64Data: base64Data
        }),
      });
      
      const text = await response.text();
      const result = JSON.parse(text);
      return result.success ? result.photoUrl : null;
    } catch (err) {
      console.error("Photo upload error:", err);
      return null;
    }
  };

  const triggerPhotoCapture = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      stopBarcodeScanner();
      stopCheckoutScanner();
    };
  }, []);

  // Handlers - MULTI-ITEM TRANSACTIONS
  const doMultiTransaction = () => {
    if (!formUser.trim() || formItems.length === 0) {
      return flash("Select at least one item", "error");
    }

    let successCount = 0;
    let errorMessages = [];

    formItems.forEach(itemId => {
      const it = inventory.find(i => i.id === itemId);
      if (!it) {
        errorMessages.push(`${itemId} not found`);
        return;
      }

      if (formAction === "checkout") {
        if (it.status === "Checked Out") {
          errorMessages.push(`${it.item} already checked out`);
          return;
        }
        const actualUser = onBehalfOfUser || formUser.trim();
        const logNotes = onBehalfOfUser 
          ? `${formNotes.trim()} [by ${currentUser} on behalf of ${onBehalfOfUser}]`.trim()
          : formNotes.trim();
        setInventory(p => p.map(i => 
          i.id === itemId 
            ? { ...i, status: "Checked Out", checkedOutBy: actualUser, checkedOutAt: now() }
            : i
        ));
        setLog(p => [{ 
          timestamp: now(), 
          user: actualUser, 
          action: "checkout", 
          itemId: it.id, 
          itemName: it.item, 
          qty: 1, 
          notes: logNotes, 
          location: `${it.cabinet}-${it.shelf}` 
        }, ...p]);
        // Sync to Google Sheets so all devices see this
        callBackend({ action: "checkOut", itemId: it.id, userName: actualUser, notes: logNotes });
        successCount++;
      } else if (formAction === "return") {
        const actualUser = onBehalfOfUser || formUser.trim();
        const logNotes = onBehalfOfUser 
          ? `${formNotes.trim()} [by ${currentUser} on behalf of ${onBehalfOfUser}]`.trim()
          : formNotes.trim();
        setInventory(p => p.map(i => 
          i.id === itemId 
            ? { ...i, status: "Available", checkedOutBy: null, checkedOutAt: null }
            : i
        ));
        setLog(p => [{ 
          timestamp: now(), 
          user: actualUser, 
          action: "return", 
          itemId: it.id, 
          itemName: it.item, 
          qty: 1, 
          notes: logNotes, 
          location: `${it.cabinet}-${it.shelf}` 
        }, ...p]);
        // Sync to Google Sheets so all devices see this
        callBackend({ action: "returnItem", itemId: it.id, userName: actualUser });
        successCount++;
      }
    });

    if (errorMessages.length > 0) {
      flash(errorMessages.join(", "), "error");
    }
    
    if (successCount > 0) {
      flash(`${successCount} item(s) ${formAction === "checkout" ? "checked out" : "returned"} successfully`);
      setFormItems([]);
      setFormNotes("");
    }
  };

  // Handler - MULTI-ITEM CONSUMABLES
  const doMultiConsumable = () => {
    if (!consumableUser.trim() || consumableItems.length === 0) {
      return flash("Select at least one consumable", "error");
    }

    let successCount = 0;
    consumableItems.forEach(itemId => {
      const it = inventory.find(i => i.id === itemId);
      if (!it) return;

      setInventory(p => p.map(i => 
        i.id === itemId 
          ? { ...i, qty: Math.max(0, i.qty - formQty) }
          : i
      ));
      setLog(p => [{ 
        timestamp: now(), 
        user: consumableUser.trim(), 
        action: "used", 
        itemId: it.id, 
        itemName: it.item, 
        qty: formQty, 
        notes: consumableNotes.trim(), 
        location: `${it.cabinet}-${it.shelf}` 
      }, ...p]);
      // Sync to Google Sheets so all devices see this
      callBackend({ action: "useConsumable", itemId: it.id, userName: consumableUser.trim(), qty: formQty, notes: consumableNotes.trim() });
      successCount++;
    });

    flash(`${successCount} consumable(s) usage logged`);
    setConsumableItems([]);
    setConsumableNotes("");
    setFormQty(1);
  };

  const doAccess = () => {
    if (!accessUser.trim() || !accessPurpose.trim()) return flash("Enter name and purpose", "error");
    setAccessLog(p => [{ timestamp: now(), user: accessUser.trim(), purpose: accessPurpose.trim(), date: today() }, ...p]);
    callBackend({ action: "logAccess", userName: accessUser.trim(), reason: accessPurpose.trim() });
    flash(`Access logged for ${accessUser.trim()}`);
    setAccessPurpose("");
  };

  const doAddItem = () => {
    if (!ni.id.trim() || !ni.item.trim()) return flash("ID and item name required", "error");
    if (inventory.find(i => i.id === ni.id.trim())) return flash("Item ID already exists", "error");
    const newItem = { ...ni, id: ni.id.trim(), item: ni.item.trim(), status: "Available", checkedOutBy: null, checkedOutAt: null, createdAt: now() };
    setInventory(p => [...p, newItem]);
    // Save to pending edits so createdAt survives sync
    const pending = JSON.parse(localStorage.getItem('warehousePendingEdits') || '{}');
    pending[newItem.id] = newItem;
    localStorage.setItem('warehousePendingEdits', JSON.stringify(pending));
    setLog(p => [{ timestamp: now(), user: currentUser, action: "added", itemId: ni.id.trim(), itemName: ni.item.trim(), qty: ni.qty, notes: `New item. Brand: ${ni.brand || "none"}. Model: ${ni.model || "none"}. Photo: ${ni.photoUrl || "none"}. Barcode: ${scannedBarcode || "none"}`, location: (ni.cabinet || ni.shelf) ? `${ni.cabinet}-${ni.shelf}` : "No location" }, ...p]);
    // âœ… Sync to Google Sheets so all devices see the new item
    callBackend({ action: "addItem", item: newItem });
    flash(`${ni.item.trim()} added successfully!`);
    
    setNi({ id: "", item: "", brand: "", model: "", serialNo: "", category: "Equipment", type: "Tool", cabinet: "", shelf: "", qty: 1, photoUrl: "" });
    setPhotoPreview("");
    setPhotoFile(null);
    setScannedBarcode("");
    setAddItemModal(false);
  };

  const doEditItem = () => {
    if (!editItem) return;
    if (!editItem.id.trim() || !editItem.item.trim()) return flash("ID and item name required", "error");
    const conflict = inventory.find(i => i.id === editItem.id.trim() && i.id !== editItem._originalId);
    if (conflict) return flash("Another item already uses this ID", "error");
    const updatedItem = { ...editItem, id: editItem.id.trim(), item: editItem.item.trim(), type: detectType(editItem.category), updatedAt: now() };
    delete updatedItem._originalId;
    setInventory(p => p.map(i => i.id === editItem._originalId ? updatedItem : i));
    setLog(p => [{ timestamp: now(), user: currentUser, action: "edited", itemId: updatedItem.id, itemName: updatedItem.item, qty: updatedItem.qty, notes: `Item updated`, location: "" }, ...p]);
    // Save edit locally so it survives backend sync overwrites
    const pending = JSON.parse(localStorage.getItem('warehousePendingEdits') || '{}');
    pending[updatedItem.id] = updatedItem;
    if (editItem._originalId !== updatedItem.id) delete pending[editItem._originalId];
    localStorage.setItem('warehousePendingEdits', JSON.stringify(pending));
    callBackend({ action: "updateItem", item: updatedItem });
    flash(`${updatedItem.item} updated`);
    setEditItemModal(false);
    setEditItem(null);
  };

  const doDeleteItem = (id) => {
    const it = inventory.find(i => i.id === id);
    setInventory(p => p.filter(i => i.id !== id));
    setLog(p => [{ timestamp: now(), user: currentUser, action: "deleted", itemId: id, itemName: it?.item || id, qty: 0, notes: "Removed", location: "" }, ...p]);
    // Clear from pending edits
    const pending = JSON.parse(localStorage.getItem('warehousePendingEdits') || '{}');
    delete pending[id];
    localStorage.setItem('warehousePendingEdits', JSON.stringify(pending));
    callBackend({ action: "deleteItem", itemId: id });
    flash(`${it?.item || id} removed`);
    setConfirmDel(null);
  };

  const doAddUser = () => {
    if (!nu.name.trim()) return flash("Name required", "error");
    if (!nu.pin.trim() || nu.pin.length !== 4) return flash("4-digit PIN required", "error");
    if (users.find(u => u.name.toLowerCase() === nu.name.trim().toLowerCase())) return flash("User exists", "error");
    setUsers(p => [...p, { name: nu.name.trim(), role: nu.role, pin: nu.pin, active: true }]);
    // âœ… Sync to Google Sheets so the new user can log in from any device
    callBackend({ action: "addUser", userName: nu.name.trim(), role: nu.role, pin: nu.pin });
    flash(`${nu.name.trim()} added`);
    setNu({ name: "", role: "Maintenance", pin: "" });
    setAddUserModal(false);
  };

  const doSetPhoto = (itemId) => {
    if (!photoUrl.trim()) return flash("Enter a photo URL", "error");
    setInventory(p => p.map(i => i.id === itemId ? { ...i, photoUrl: photoUrl.trim() } : i));
    flash("Photo linked"); setPhotoUrl(""); setPhotoModal(null);
  };

  const doRestock = () => {
    if (!restockQty || restockQty < 1) return flash("Enter valid quantity", "error");
    const item = inventory.find(i => i.id === restockModal);
    if (!item) return;
    
    setInventory(p => p.map(i => 
      i.id === restockModal 
        ? { ...i, qty: i.qty + restockQty }
        : i
    ));
    setLog(p => [{ 
      timestamp: now(), 
      user: currentUser, 
      action: "restocked", 
      itemId: item.id, 
      itemName: item.item, 
      qty: restockQty, 
      notes: `Added ${restockQty} units`, 
      location: `${item.cabinet}-${item.shelf}` 
    }, ...p]);
    callBackend({ action: "restockItem", itemId: restockModal, qty: restockQty, userName: currentUser });
    callBackend({ action: "restockItem", itemId: restockModal, qty: restockQty, userName: currentUser });
    flash(`${item.item} restocked: +${restockQty} units`);
    setRestockQty(1);
    setRestockModal(null);
  };

  // â”€â”€ Checkout/Return barcode scanner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startCheckoutScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      flash("Camera not available on this browser.", "error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      checkoutStreamRef.current = stream;
      checkoutScannerActiveRef.current = true;
      setCheckoutScannerActive(true);
      // Short delay so React renders the <video> element before we assign srcObject
      setTimeout(() => {
        if (checkoutVideoRef.current) {
          checkoutVideoRef.current.srcObject = stream;
          checkoutVideoRef.current.play().catch(() => {});
          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'] });
            detectCheckoutBarcode(detector);
          } else {
            // No BarcodeDetector â€” camera is live so user can see barcode and type it
            flash("Live scanning not supported on this browser â€” camera is open so you can read the code and type it below.", "info");
          }
        } else {
          flash("Camera error: video element not ready. Try again.", "error");
          stopCheckoutScanner();
        }
      }, 150);
    } catch (err) {
      checkoutScannerActiveRef.current = false;
      setCheckoutScannerActive(false);
      if (err.name === 'NotAllowedError') {
        flash("Camera permission denied. Go to browser settings â†’ Site settings â†’ Camera â†’ Allow.", "error");
      } else {
        flash("Camera failed: " + err.message, "error");
      }
    }
  };

  const detectCheckoutBarcode = async (detector) => {
    // Use ref not state â€” avoids stale closure
    if (!checkoutScannerActiveRef.current || !checkoutVideoRef.current) return;
    try {
      const barcodes = await detector.detect(checkoutVideoRef.current);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        stopCheckoutScanner();
        handleScannedCode(code);
        return;
      }
    } catch (e) { /* keep scanning */ }
    checkoutBarcodeRef.current = setTimeout(() => detectCheckoutBarcode(detector), 200);
  };

  const stopCheckoutScanner = () => {
    checkoutScannerActiveRef.current = false;
    if (checkoutStreamRef.current) {
      checkoutStreamRef.current.getTracks().forEach(t => t.stop());
      checkoutStreamRef.current = null;
    }
    if (checkoutBarcodeRef.current) {
      clearTimeout(checkoutBarcodeRef.current);
      checkoutBarcodeRef.current = null;
    }
    setCheckoutScannerActive(false);
  };

  const handleScannedCode = (code) => {
    const it = inventory.find(i => String(i.id) === String(code) || String(i.id).toUpperCase() === code.toUpperCase());
    if (it) {
      setFormItems(prev => prev.includes(it.id) ? prev : [...prev, it.id]);
      setScanInput("");
      setScanModal(false);
      flash(`âœ“ Scanned: ${it.item}`);
    } else {
      setScanInput(code);
      flash(`Code "${code}" not found â€” check manually`, "error");
    }
  };

  const doScan = () => {
    const code = scanInput.trim();
    if (!code) return;
    handleScannedCode(code);
    setScanInput("");
  };

  // Filters
  const filteredInv = inventory.filter(i => {
    const cab = filterCab === "All" || i.cabinet === filterCab;
    const s = !search || [i.item, i.id, i.category, i.brand || "", i.model || ""].some(f => String(f).toLowerCase().includes(search.toLowerCase()));
    return cab && s;
  });
  const checkedOut = inventory.filter(i => i.status === "Checked Out");
  const filteredLog = log.filter(l => !logFilter || [l.user, l.itemName, l.action].some(f => f.toLowerCase().includes(logFilter.toLowerCase())));

  // Prepare options for multi-select
  const toolOptions = inventory
    .filter(i => i.type === "Tool")
    .filter(i => formAction === "checkout" ? i.status === "Available" : (i.status === "Checked Out" && i.checkedOutBy === (onBehalfOfUser || formUser)))
    .map(i => ({
      id: i.id,
      label: `[${i.id}] ${i.item}`,
      shortLabel: i.id
    }));

  const consumableOptions = inventory
    .filter(i => i.type === "Consumable")
    .map(i => ({
      id: i.id,
      label: `[${i.id}] ${i.item} (qty: ${i.qty})`,
      shortLabel: i.id
    }));

  const userOptions = activeUsers.map(u => ({
    value: u.name,
    label: `${u.name} (${u.role})`
  }));

  const TABS = [
    { key: "dashboard", label: "Dashboard", icon: "âŠž" },
    { key: "checkout", label: "Check Out / Return", icon: "â‡„" },
    { key: "consumables", label: "Consumables", icon: "â–¼" },
    { key: "access", label: "Access Log", icon: "ðŸ”‘" },
    { key: "inventory", label: "Inventory", icon: "â˜°" },
    { key: "users", label: "Users", icon: "ðŸ‘¤" },
    { key: "history", label: "Activity Log", icon: "ðŸ“‹" },
  ];

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{margin:0;background:${C.bg}}
        input,select,textarea,button{font-family:'DM Sans',sans-serif}
        input::placeholder,textarea::placeholder{color:${C.textDim}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.borderLight};border-radius:3px}
        @keyframes slideDown{from{transform:translateY(-16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* Gallery picker â€” no capture attr so Android shows Photos/Files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handlePhotoCapture}
        style={{ display: "none" }}
      />
      {/* Camera input â€” capture forces direct camera open */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        capture="environment"
        onChange={handlePhotoCapture}
        style={{ display: "none" }}
      />

      {toast && <div style={{ ...S.toast, background: toast.type === "error" ? C.red : toast.type === "info" ? C.accent : C.green }}>{toast.msg}</div>}

      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logoRow}>
            <img src={CCOAN_LOGO_WHITE} alt="CCOAN" style={S.logoImg} onError={e => { e.target.style.display = "none"; }} />
            <div>
              <div style={S.headerTitle}>WAREHOUSE TRACKER</div>
              <div style={S.headerSub}>CCOAN â€” Almere</div>
            </div>
          </div>
          <div style={S.headerRight}>
            <span style={S.userBadge}>ðŸ‘¤ {currentUser} {currentUserRole && `(${currentUserRole})`}</span>
            {IS_DEMO && <span style={S.demoBadge}>DEMO</span>}
            <button onClick={onLogout} style={S.logoutBtn} title="Logout">ðŸ”“</button>
            <button style={S.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
              <span style={S.bar}/><span style={S.bar}/><span style={S.bar}/>
            </button>
          </div>
        </div>
      </header>

      <nav style={{ ...S.nav, ...(menuOpen ? S.navOpen : {}) }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setView(t.key); setMenuOpen(false); }}
            style={{ ...S.navBtn, ...(view === t.key ? S.navAct : {}) }}>
            <span style={{ marginRight: 6, fontSize: 13 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      <main style={S.main}>

        {/* ---- DASHBOARD ---- */}
        {view === "dashboard" && (<div>
          <h2 style={S.pageTitle}>Dashboard</h2>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
            <button onClick={() => {
              if (!window.confirm("Clear local cache and re-sync from server? This will discard any unsynced local-only data.")) return;
              localStorage.removeItem('warehouseInventory');
              localStorage.removeItem('warehouseLog');
              localStorage.removeItem('warehouseAccessLog');
              flash("Cache cleared â€” syncing from server...", "info");
              syncFromBackend(setInventory, setLog, setAccessLog, setUsers);
              setTimeout(() => flash("âœ“ Synced fresh from server"), 1500);
            }} style={{ ...S.smBtn, color: C.orange, borderColor: C.orange }}>
              ðŸ—‘ Clear Local Cache
            </button>
            <button onClick={async () => {
              flash("Syncing...", "info");
              await syncFromBackend(setInventory, setLog, setAccessLog, setUsers);
              flash("âœ“ Synced");
            }} style={{ ...S.smBtn, color: C.accent, borderColor: C.accent }}>
              ðŸ”„ Sync Now
            </button>
          </div>
          <div style={S.statsGrid}>
            {[
              { n: inventory.length, l: "Total Items", c: C.accent },
              { n: inventory.filter(i => i.type === "Tool" ? i.status === "Available" : i.qty > 0).length, l: "Available", c: C.green },
              { n: checkedOut.length, l: "Checked Out", c: C.red },
              { n: inventory.filter(i => i.qty === 0).length, l: "Empty Items", c: C.orange },
              { n: log.length, l: "Transactions", c: C.brandBright },
              { n: accessLog.length, l: "Access Entries", c: C.accent },
            ].map((s, i) => (
              <div key={i} style={{ ...S.stat, borderLeftColor: s.c }}>
                <div style={{ ...S.statN, color: s.c }}>{s.n}</div>
                <div style={S.statL}>{s.l}</div>
              </div>
            ))}
          </div>
          {checkedOut.length > 0 && (
            <div style={S.card}><h3 style={S.cardT}>Currently Checked Out</h3>
              <div style={S.tw}><table style={S.tbl}><thead><tr>
                <th style={S.th}>Item</th><th style={S.th}>Code</th><th style={S.th}>By</th><th style={S.th}>Since</th>
              </tr></thead><tbody>
              {checkedOut.map(i => <tr key={i.id}>
                <td style={S.td}>{i.item}</td>
                <td style={S.td}>
                  <button 
                    onClick={() => setAssetDetailItem(i)} 
                    style={{ ...S.lnkBtn, fontFamily: "monospace", fontWeight: 700, fontSize: 11, background: C.accentDim, padding: "2px 7px", borderRadius: 3, textDecoration: "none" }}>
                    {i.id}
                  </button>
                </td>
              <td style={{ ...S.td, color: C.accent, fontWeight: 600 }}>{i.checkedOutBy}</td>
              <td style={S.td}>{i.checkedOutAt}</td>
          </tr>)}
              </tbody></table></div>
            </div>
          )}
          <div style={S.card}><h3 style={S.cardT}>Recent Activity</h3>
            {log.length === 0 ? <p style={S.empty}>No activity yet.</p> : (
              <div style={S.tw}><table style={S.tbl}><thead><tr>
                <th style={S.th}>Time</th><th style={S.th}>User</th><th style={S.th}>Action</th><th style={S.th}>Item</th><th style={S.th}>Notes</th>
              </tr></thead><tbody>
                {log.slice(0, 8).map((l, i) => <tr key={i}>
                  <td style={S.td}>{l.timestamp}</td><td style={S.td}>{l.user}</td>
                  <td style={S.td}><ABadge a={l.action}/></td>
                  <td style={S.td}>{l.itemName}</td><td style={S.td}>{l.notes || "â€”"}</td>
                </tr>)}
              </tbody></table></div>
            )}
          </div>
        </div>)}

        {/* ---- CHECKOUT (MULTI-SELECT) ---- */}
        {view === "checkout" && (<div>
          <h2 style={S.pageTitle}>Check Out / Return Tool</h2>
          <div style={S.card}>
            <div style={S.fg}>
              <div style={S.f}>
                <label style={S.lbl}>Your Name *</label>
                <SearchableSelect
                  options={userOptions}
                  value={formUser}
                  onChange={setFormUser}
                  placeholder="Select user..."
                />
              </div>
              <div style={S.f}>
                <label style={S.lbl}>What do you want to do? *</label>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, border: `2px solid ${formAction === "checkout" ? C.red : C.borderLight}`, background: formAction === "checkout" ? "rgba(224,64,64,0.12)" : C.surface, cursor: "pointer", userSelect: "none" }}
                    onClick={() => { setFormAction("checkout"); setFormItems([]); }}>
                    <span style={{ fontSize: 20 }}>{formAction === "checkout" ? "ðŸ”´" : "âšª"}</span>
                    <span>
                      <strong style={{ color: C.text, display: "block" }}>Check Out</strong>
                      <span style={{ color: C.textMuted, fontSize: 11 }}>Taking a tool from warehouse</span>
                    </span>
                  </label>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, border: `2px solid ${formAction === "return" ? C.green : C.borderLight}`, background: formAction === "return" ? "rgba(46,170,90,0.12)" : C.surface, cursor: "pointer", userSelect: "none" }}
                    onClick={() => { setFormAction("return"); setFormItems([]); }}>
                    <span style={{ fontSize: 20 }}>{formAction === "return" ? "ðŸŸ¢" : "âšª"}</span>
                    <span>
                      <strong style={{ color: C.text, display: "block" }}>Return</strong>
                      <span style={{ color: C.textMuted, fontSize: 11 }}>Bringing a tool back</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
			
            
            {/* Admin: Act on Behalf Of */}
            {(currentUserRole === "Warehouse Manager / Admin" || currentUserRole === "Admin" || currentUserRole === "Warehouse Manager") && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <label style={{ ...S.lbl, display: "flex", alignItems: "center", gap: 8 }}>
                  ðŸ‘¥ Act On Behalf Of (Admin Only)
                  <button 
                    onClick={() => {
                      setOnBehalfOfUser("");
                      setFormUser(currentUser);
                    }} 
                    style={{ ...S.smBtn, padding: "4px 8px", fontSize: 11, opacity: onBehalfOfUser ? 1 : 0.3 }}
                    disabled={!onBehalfOfUser}>
                    âœ• Clear
                  </button>
                </label>
                <SearchableSelect
                  options={userOptions}
                  value={onBehalfOfUser}
                  onChange={val => {
                    setOnBehalfOfUser(val);
                    setFormUser(val || currentUser);
                    setFormItems([]); // Clear selections when switching users
                  }}
                  placeholder="-- Select user (optional) --"
                />
                {onBehalfOfUser && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(255,193,7,0.15)", borderRadius: 6, border: "1px solid #ffc107", fontSize: 13, color: C.text }}>
                    âš ï¸ Acting as <strong>{onBehalfOfUser}</strong>
                    {formAction === "return" && ` â€” Showing only ${onBehalfOfUser}'s checked-out items`}
                  </div>
                )}
              </div>
            )}
   
            
            <div style={S.f}>
              <label style={S.lbl}>Select Item(s) * (can select multiple)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <SearchableMultiSelect
                    items={toolOptions}
                    selectedIds={formItems}
                    onChange={setFormItems}
                    placeholder="Choose tool(s)..."
                  />
                </div>
                <button onClick={() => setScanModal(true)} style={S.scanBtn} title="Scan QR">ðŸ“·</button>
              </div>
            </div>
            
            <div style={S.f}>
              <label style={S.lbl}>Notes (optional)</label>
              <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="e.g. Bathroom repair, Room 201" style={S.inp}/>
            </div>
            
            <div style={{ marginTop: 8, padding: "12px 16px", background: C.surfaceRaised, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 8px 0" }}>
                âœ… {formItems.length > 0 ? `${formItems.length} item(s) selected â€” press the button below to confirm` : "Select item(s) above, then press the button below"}
              </p>
              <button onClick={doMultiTransaction} 
                style={{ ...S.pBtn, background: formAction === "checkout" ? C.red : C.green, fontSize: 16, padding: "14px 20px", opacity: formItems.length === 0 ? 0.5 : 1 }}>
                {formAction === "checkout" ? "â¬† CONFIRM CHECK OUT" : "â¬‡ CONFIRM RETURN"} ({formItems.length} item{formItems.length !== 1 ? "s" : ""})
              </button>
            </div>
          </div>
        </div>)}

        {/* ---- CONSUMABLES (MULTI-SELECT) ---- */}
        {view === "consumables" && (<div>
          <h2 style={S.pageTitle}>Log Consumable Usage</h2>
          <p style={S.sub}>Track sealants, adhesives, and other items that get used up.</p>
          <div style={S.card}>
            <div style={S.fg}>
              <div style={S.f}>
                <label style={S.lbl}>Your Name *</label>
                <SearchableSelect
                  options={userOptions}
                  value={consumableUser}
                  onChange={setConsumableUser}
                  placeholder="Select user..."
                />
              </div>
              
              <div style={S.f}>
                <label style={S.lbl}>Consumable Item(s) * (can select multiple)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <SearchableMultiSelect
                      items={consumableOptions}
                      selectedIds={consumableItems}
                      onChange={setConsumableItems}
                      placeholder="Choose item(s)..."
                    />
                  </div>
                  <button onClick={() => setScanModal(true)} style={S.scanBtn}>ðŸ“·</button>
                </div>
              </div>
              
              <div style={S.f}>
                <label style={S.lbl}>Quantity Used (per item)</label>
                <input type="number" min="1" value={formQty} onChange={e => setFormQty(parseInt(e.target.value) || 1)} style={S.inp}/>
              </div>
            </div>
            
            <div style={S.f}>
              <label style={S.lbl}>Purpose / Notes</label>
              <input type="text" value={consumableNotes} onChange={e => setConsumableNotes(e.target.value)} placeholder="e.g. Sealed window, Room 105" style={S.inp}/>
            </div>
            
            <button onClick={doMultiConsumable} style={{ ...S.pBtn, background: C.orange }}>
              â–¼ Log Consumable Usage ({consumableItems.length} item{consumableItems.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>)}

        {/* REST OF VIEWS STAY THE SAME - ACCESS, INVENTORY, USERS, HISTORY */}
        
        {/* ---- ACCESS LOG ---- */}
        {view === "access" && (<div>
          <h2 style={S.pageTitle}>Log Warehouse Access</h2>
          <p style={S.sub}>Record every warehouse visit, even if nothing is taken.</p>
          <div style={S.card}>
            <div style={S.fg}>
              <div style={S.f}>
                <label style={S.lbl}>Your Name *</label>
                <SearchableSelect
                  options={userOptions}
                  value={accessUser}
                  onChange={setAccessUser}
                  placeholder="Select user..."
                />
              </div>
              <div style={S.f}>
                <label style={S.lbl}>Purpose of Visit *</label>
                <input type="text" value={accessPurpose} onChange={e => setAccessPurpose(e.target.value)} placeholder="e.g. Picking up drill for maintenance" style={S.inp}/>
              </div>
            </div>
            <button onClick={doAccess} style={S.pBtn}>ðŸ”‘ Log Warehouse Entry</button>
          </div>
          <div style={{ ...S.card, marginTop: 20 }}><h3 style={S.cardT}>Access History</h3>
            {accessLog.length === 0 ? <p style={S.empty}>No access entries yet.</p> : (
              <div style={S.tw}><table style={S.tbl}><thead><tr>
                <th style={S.th}>Date</th><th style={S.th}>Time</th><th style={S.th}>Person</th><th style={S.th}>Purpose</th>
              </tr></thead><tbody>
                {accessLog.map((a, i) => <tr key={i}>
                  <td style={S.td}>{a.date || (a.timestamp ? a.timestamp.slice(0, 10) : "")}</td><td style={S.td}>{a.timestamp}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{a.user}</td><td style={S.td}>{a.purpose || a.reason || ""}</td>
                </tr>)}
              </tbody></table></div>
            )}
          </div>
        </div>)}

        {/* ---- INVENTORY ---- */}
        {view === "inventory" && (<div>
          <div style={S.titleRow}>
            <h2 style={{ ...S.pageTitle, marginBottom: 0 }}>Inventory</h2>
            {isAdmin && <button onClick={() => setAddItemModal(true)} style={S.pBtn}>+ Add Item</button>}
          </div>
          <div style={S.filterBar}>
            <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.inp, maxWidth: 280, flex: 1 }}/>
            <div style={S.chips}>
              {["All", "A", "B", "Door", "Floor"].map(c => (
                <button key={c} onClick={() => setFilterCab(c)} style={{ ...S.chip, ...(filterCab === c ? S.chipAct : {}) }}>
                  {c === "All" ? "All" : c === "A" ? "Cab A" : c === "B" ? "Cab B" : c}
                </button>
              ))}
            </div>
          </div>
          <div style={S.tw}><table style={S.tbl}><thead><tr>
            <th style={S.th}>Code</th><th style={S.th}>Description</th><th style={S.th}>Brand</th>
            <th style={S.th}>Status</th><th style={S.th}>Model</th><th style={S.th}>Category</th>
            <th style={S.th}>Date Created</th><th style={S.th}>Qty</th><th style={S.th}>Photo</th><th style={S.th}>Actions</th>
          </tr></thead><tbody>
            {filteredInv.map(i => (
              <tr key={i.id} style={i.status === "Checked Out" ? { background: C.redDim } : i.qty === 0 ? { background: C.orangeDim } : {}}>
                <td style={S.td}>
                  <button onClick={() => setAssetDetailItem(i)} style={{ ...S.lnkBtn, fontFamily: "monospace", fontWeight: 700, fontSize: 11, background: C.accentDim, padding: "2px 7px", borderRadius: 3, textDecoration: "none" }}>{i.id}</button>
                </td>
                <td style={{ ...S.td, fontWeight: 500, maxWidth: 220, whiteSpace: "normal", lineHeight: 1.3 }}>{i.item}</td>
                <td style={S.td}>{i.brand || "â€”"}</td>
                <td style={S.td}><SBadge status={i.status} qty={i.qty}/></td>
                <td style={S.td}>{i.model || "â€”"}</td>
                <td style={S.td}>{i.category}</td>
                <td style={{ ...S.td, fontSize: 11, color: C.textMuted }}>{i.createdAt ? i.createdAt.slice(0, 10) : "â€”"}</td>
                <td style={S.td}>{i.qty}</td>
                <td style={S.td}>
                  {i.photoUrl
                    ? <a 
                        href={(() => {
                          const url = i.photoUrl;
                          if (url.includes('drive.google.com/file/d/')) {
                            const match = url.match(/\/file\/d\/([^\/]+)/);
                            if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
                          }
                          return url;
                          })()} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={S.photoLnk}>ðŸ“¸ View</a>
                      : <button onClick={() => { setPhotoModal(i.id); setPhotoUrl(""); }} style={S.lnkBtn}>+ Photo</button>}
                </td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {isAdmin && <button onClick={() => { setEditItem({ ...i, _originalId: i.id }); setEditItemModal(true); }} style={{ ...S.tiny, color: C.accent, borderColor: C.accent }} title="Edit">âœï¸</button>}
                    <button onClick={() => { setPhotoModal(i.id); setPhotoUrl(i.photoUrl || ""); }} style={S.tiny} title="Photo">ðŸ“·</button>
                    {i.type === "Consumable" && (
                      <button onClick={() => { setRestockModal(i.id); setRestockQty(1); }} style={{ ...S.tiny, color: C.green, borderColor: C.green }} title="Restock">+</button>
                    )}
                    {isAdmin && <button onClick={() => setConfirmDel(i.id)} style={{ ...S.tiny, color: C.red }} title="Delete">âœ•</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody></table></div>
          <p style={S.foot}>{filteredInv.length} of {inventory.length} items</p>
        </div>)}

        {/* ---- USERS ---- */}
        {view === "users" && (<div>
          <div style={S.titleRow}>
            <h2 style={{ ...S.pageTitle, marginBottom: 0 }}>User Management</h2>
            {isAdmin && <button onClick={() => setAddUserModal(true)} style={S.pBtn}>+ Add User</button>}
          </div>
          <div style={S.card}><div style={S.tw}><table style={S.tbl}><thead><tr>
            <th style={S.th}>Name</th><th style={S.th}>Role</th><th style={S.th}>Status</th><th style={S.th}>Actions</th>
          </tr></thead><tbody>
            {users.map(u => (
              <tr key={u.name} style={!u.active ? { opacity: 0.4 } : {}}>
                <td style={{ ...S.td, fontWeight: 600 }}>{u.name}</td>
                <td style={S.td}>{u.role}</td>
                <td style={S.td}><span style={{ ...S.badge, background: u.active ? C.green : C.textDim }}>{u.active ? "Active" : "Inactive"}</span></td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {isAdmin && <button onClick={async () => {
                      const newActive = !u.active;
                      setUsers(p => p.map(x => x.name === u.name ? { ...x, active: newActive } : x));
                      await callBackend({ action: "setUserActive", userName: u.name, active: newActive });
                      flash(`${u.name} ${newActive ? "activated" : "deactivated"}`);
                    }} style={S.smBtn}>
                      {u.active ? "Deactivate" : "Activate"}
                    </button>}
                    {isAdmin && <button onClick={() => { setUsers(p => p.filter(x => x.name !== u.name)); flash(`${u.name} removed`); }} style={{ ...S.smBtn, color: C.red, borderColor: C.red }}>Delete</button>}
                    {!isAdmin && <span style={{ color: C.textDim, fontSize: 11, fontStyle: "italic" }}>View only</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody></table></div></div>
        </div>)}

        {/* ---- ACTIVITY LOG ---- */}
        {view === "history" && (<div>
          <h2 style={S.pageTitle}>Activity Log</h2>
          <input type="text" placeholder="Filter by user, item, or action..." value={logFilter} onChange={e => setLogFilter(e.target.value)} style={{ ...S.inp, maxWidth: 400, marginBottom: 20 }}/>
          {filteredLog.length === 0 ? <p style={S.empty}>No activity recorded yet.</p> : (
            <div style={S.tw}><table style={S.tbl}><thead><tr>
              <th style={S.th}>Timestamp</th><th style={S.th}>User</th><th style={S.th}>Action</th><th style={S.th}>Item</th>
              <th style={S.th}>Code</th><th style={S.th}>Qty</th><th style={S.th}>Notes</th>
            </tr></thead><tbody>
              {filteredLog.map((l, i) => <tr key={i}>
                <td style={S.td}>{l.timestamp}</td><td style={{ ...S.td, fontWeight: 600 }}>{l.user}</td>
                <td style={S.td}><ABadge a={l.action}/></td>
                <td style={S.td}>{l.itemName}</td><td style={S.td}><code style={S.code}>{l.itemId}</code></td>
                <td style={S.td}>{l.qty}</td><td style={S.td}>{l.notes || "â€”"}</td>
              </tr>)}
            </tbody></table></div>
          )}
          <p style={S.foot}>{filteredLog.length} entries</p>
        </div>)}
      </main>

      <footer style={S.footer}>
        <img src={CCOAN_LOGO_WHITE} alt="" style={{ height: 18, opacity: 0.4 }} onError={e => { e.target.style.display = "none"; }}/>
        <span>CCOAN Warehouse Tracker</span>
        <span style={{ opacity: 0.25 }}>â€¢</span>
        <span>V4 Enhanced â€¢ Logged in as {currentUser}</span>
      </footer>

      {/* ========== MODALS ========== */}

      {/* V4 ENHANCED: Add Item Modal with Barcode Scanner & Photo Upload */}
      <Modal open={addItemModal} onClose={() => { setAddItemModal(false); stopBarcodeScanner(); setPhotoPreview(""); setScannedBarcode(""); }} title="Add New Inventory Item" wide>
        <div style={S.mf}>
          
          {/* Barcode Scanner Section â€” video always in DOM so ref is always available */}
          <div style={{ ...S.scannerSection, marginBottom: 16 }}>
            <label style={S.lbl}>ðŸ“· Scan Product Barcode (Optional)</label>
            {/* Video always rendered, just hidden â€” this ensures videoRef.current is never null */}
            <div style={{ display: scannerActive ? "block" : "none" }}>
              <div style={S.scannerContainer}>
                <video ref={videoRef} autoPlay playsInline muted style={S.scannerVideo} />
                <div style={S.scannerOverlay} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: C.green, fontSize: 13 }}>ðŸ“· Scanningâ€¦ point at barcode</span>
                <button onClick={stopBarcodeScanner} style={{ ...S.smBtn, color: C.red, borderColor: C.red }}>Stop</button>
              </div>
            </div>
            {!scannerActive && (
              <button onClick={startBarcodeScanner} style={{ ...S.pBtn, background: C.brandBright }}>
                Start Barcode Scanner
              </button>
            )}
            {scannedBarcode && (
              <p style={{ color: C.green, marginTop: 8, fontSize: 12 }}>
                âœ“ Scanned: <strong>{scannedBarcode}</strong>
              </p>
            )}
          </div>

          <div style={S.mRow}>
            <div style={S.f}><label style={S.lbl}>Item ID / Code *</label>
              <input type="text" value={ni.id} onChange={e => setNi({ ...ni, id: e.target.value })} placeholder="e.g. 999999930 (or scan barcode)" style={S.inp}/>
              <span style={S.hint}>Asset Tag ID or barcode {scannedBarcode && "(Auto-filled from barcode)"}</span>
            </div>
            <div style={S.f}><label style={S.lbl}>Description *</label>
              <input type="text" value={ni.item} onChange={e => setNi({ ...ni, item: e.target.value })} placeholder="e.g. Cordless drill/driver" style={S.inp}/>
            </div>
          </div>

          <div style={S.mRow}>
            <div style={S.f}><label style={S.lbl}>Brand (optional)</label>
              <input type="text" value={ni.brand || ''} onChange={e => setNi({ ...ni, brand: e.target.value })} placeholder="e.g. Makita, GAMMA, Bison" style={S.inp}/>
            </div>
            <div style={S.f}><label style={S.lbl}>Model (optional)</label>
              <input type="text" value={ni.model || ''} onChange={e => setNi({ ...ni, model: e.target.value })} placeholder="e.g. DF457D (18V Li-ion)" style={S.inp}/>
            </div>
          </div>

          <div style={S.f}><label style={S.lbl}>Serial Number (optional)</label>
            <input type="text" value={ni.serialNo || ''} onChange={e => setNi({ ...ni, serialNo: e.target.value })} placeholder="Optional serial number for tracking" style={S.inp}/>
          </div>

          <div style={S.mRow}>
            <div style={S.f}><label style={S.lbl}>Category</label>
              <select value={ni.category} onChange={e => setNi({ ...ni, category: e.target.value, type: detectType(e.target.value) })} style={S.sel}>
                {["Adhesive","Cleaner","Door/Hardware","Electrical","Equipment","Filler & Putty","Floor Care/Wood & Parquet Wax","Furniture and fixtures","Lubricant","Networking equipment (router/VPN gateway)","Paint","Paint Remover","Sealant","Spray","Tiling materials","Wood Oil/Finish","Wood Stain"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={S.f}><label style={S.lbl}>Cabinet (optional)</label>
              <input type="text" value={ni.cabinet} onChange={e => setNi({ ...ni, cabinet: e.target.value })}
                placeholder="e.g. A, B, Door, Floor" style={S.inp}/>
            </div>
            <div style={S.f}><label style={S.lbl}>Shelf (optional)</label>
              <input type="text" value={ni.shelf} onChange={e => setNi({ ...ni, shelf: e.target.value })}
                placeholder="e.g. Top, Middle, Rack 3" style={S.inp}/>
            </div>
          </div>

          <div style={S.mRow}>
            <div style={S.f}><label style={S.lbl}>Quantity</label>
              <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                value={ni.qty} 
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setNi({ ...ni, qty: parseInt(val) || 1 });
                }}
                style={{ ...S.inp, fontSize: 16 }}
                placeholder="1"
              />
            </div>
          </div>

          {/* V4: Photo Capture Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={S.lbl}>ðŸ“¸ Item Photo (Optional)</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingPhoto}
                style={{ ...S.pBtn, background: uploadingPhoto ? C.textDim : C.brandBright, flex: 1 }}
              >
                {uploadingPhoto ? "Uploading..." : "ðŸ“· Take Photo"}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                style={{ ...S.pBtn, background: uploadingPhoto ? C.textDim : C.brand, flex: 1 }}
              >
                ðŸ–¼ Choose from Gallery
              </button>
            </div>
            {photoPreview && (
              <div style={{ marginTop: 10 }}>
                <img src={photoPreview} alt="Preview" style={S.photoPreview} />
              </div>
            )}
            {ni.photoUrl && !uploadingPhoto && (
              <p style={{ color: C.green, fontSize: 12, marginTop: 8 }}>
                âœ“ Photo uploaded: <a href={ni.photoUrl} target="_blank" rel="noopener noreferrer" style={S.photoLnk}>View</a>
              </p>
            )}
            <span style={S.hint}>
              {IS_DEMO
                ? "Demo mode: Photo preview works, but not saved to Drive"
                : "Photo will be uploaded to Google Drive and linked to this item"}
            </span>
          </div>

          <button onClick={doAddItem} style={S.pBtn}>Add to Inventory</button>
        </div>
      </Modal>

      {/* â”€â”€ Edit Inventory Item Modal â”€â”€ */}
      <Modal open={editItemModal} onClose={() => { setEditItemModal(false); setEditItem(null); }} title="Edit Inventory Item" wide>
        {editItem && (
          <div style={S.mf}>
            <div style={S.mRow}>
              <div style={S.f}><label style={S.lbl}>Item ID / Code</label>
                <input type="text" value={editItem.id} onChange={e => setEditItem({ ...editItem, id: e.target.value })} style={S.inp}/>
                <span style={S.hint}>Changing the ID will update it everywhere</span>
              </div>
              <div style={S.f}><label style={S.lbl}>Description *</label>
                <input type="text" value={editItem.item} onChange={e => setEditItem({ ...editItem, item: e.target.value })} style={S.inp}/>
              </div>
            </div>
            <div style={S.mRow}>
              <div style={S.f}><label style={S.lbl}>Brand</label>
                <input type="text" value={editItem.brand || ''} onChange={e => setEditItem({ ...editItem, brand: e.target.value })} style={S.inp}/>
              </div>
              <div style={S.f}><label style={S.lbl}>Model</label>
                <input type="text" value={editItem.model || ''} onChange={e => setEditItem({ ...editItem, model: e.target.value })} style={S.inp}/>
              </div>
            </div>
            <div style={S.f}><label style={S.lbl}>Serial Number</label>
              <input type="text" value={editItem.serialNo || ''} onChange={e => setEditItem({ ...editItem, serialNo: e.target.value })} style={S.inp}/>
            </div>
            <div style={S.mRow}>
              <div style={S.f}><label style={S.lbl}>Category</label>
                <select value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value, type: detectType(e.target.value) })} style={S.sel}>
                  {["Adhesive","Cleaner","Door/Hardware","Electrical","Equipment","Filler & Putty","Floor Care/Wood & Parquet Wax","Furniture and fixtures","Lubricant","Networking equipment (router/VPN gateway)","Paint","Paint Remover","Sealant","Spray","Tiling materials","Wood Oil/Finish","Wood Stain"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={S.f}><label style={S.lbl}>Quantity</label>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*"
                  value={editItem.qty}
                  onChange={e => setEditItem({ ...editItem, qty: parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0 })}
                  style={{ ...S.inp, fontSize: 16 }}
                />
              </div>
              <div style={S.f}><label style={S.lbl}>Status</label>
                <select value={editItem.status || 'Available'} onChange={e => setEditItem({ ...editItem, status: e.target.value })} style={S.sel}>
                  {["Available","Checked Out","Under Maintenance","Retired"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={S.mRow}>
              <div style={S.f}><label style={S.lbl}>Cabinet (optional)</label>
                <input type="text" value={editItem.cabinet || ''} onChange={e => setEditItem({ ...editItem, cabinet: e.target.value })} placeholder="e.g. A, B, Door, Floor" style={S.inp}/>
              </div>
              <div style={S.f}><label style={S.lbl}>Shelf (optional)</label>
                <input type="text" value={editItem.shelf || ''} onChange={e => setEditItem({ ...editItem, shelf: e.target.value })} placeholder="e.g. Top, Middle, Rack 3" style={S.inp}/>
              </div>
            </div>
            <div style={S.f}><label style={S.lbl}>Photo URL</label>
              <input type="text" value={editItem.photoUrl || ''} onChange={e => setEditItem({ ...editItem, photoUrl: e.target.value })} placeholder="https://..." style={S.inp}/>
              <span style={S.hint}>Paste a direct link or leave as-is to keep existing photo</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={doEditItem} style={S.pBtn}>ðŸ’¾ Save Changes</button>
              <button onClick={() => { setEditItemModal(false); setEditItem(null); }} style={S.smBtn}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>


      {/* â”€â”€ Asset Detail Popup (Code hyperlink click) â”€â”€ */}
      {assetDetailItem && (
        <div style={S.overlay} onClick={() => setAssetDetailItem(null)}>
          <div style={{ ...S.modal, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <h3 style={{ ...S.modalTitle, fontSize: 13, color: C.textMuted, fontFamily: "monospace" }}>{assetDetailItem.id}</h3>
              <button onClick={() => setAssetDetailItem(null)} style={S.modalX}>âœ•</button>
            </div>
            <div style={S.modalBody}>
              <p style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14, marginTop: 0 }}>{assetDetailItem.item}</p>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                {assetDetailItem.photoUrl ? (
                  <img 
                    src={(() => {
                      const url = assetDetailItem.photoUrl;
                      // Auto-convert Google Drive sharing links to direct image links
                      if (url.includes('drive.google.com/file/d/')) {
                        const match = url.match(/\/file\/d\/([^\/]+)/);
                        if (match) {
                          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
                        }
                      }
                    return url; // Return as-is if not a Drive link
                  })()} 
                  alt={assetDetailItem.item}
                  style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 8, border: `2px solid ${C.borderLight}`, flexShrink: 0 }}
                  onError={e => { 
                    console.log("Image failed to load:", assetDetailItem.photoUrl);
                    e.target.style.display = "none"; 
                  }}
                />
            ) : (
                  <div style={{ width: 130, height: 130, borderRadius: 8, border: `2px dashed ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 11, flexShrink: 0 }}>
                    No Photo
                  </div>
                )}
                <table style={{ fontSize: 12, width: "100%", borderCollapse: "collapse" }}>
                  {[
                    ["Brand", assetDetailItem.brand],
                    ["Model", assetDetailItem.model],
                    ["Category", assetDetailItem.category],
                    ["Type", assetDetailItem.type],
                    ["Status", <SBadge status={assetDetailItem.status} qty={assetDetailItem.qty}/>],
                    ["Qty", assetDetailItem.qty],
                    ["Cabinet", assetDetailItem.cabinet],
                    ["Shelf", assetDetailItem.shelf],
                    ["Held By", assetDetailItem.checkedOutBy],
                    ["Serial No", assetDetailItem.serialNo],
                    ["Date Created", assetDetailItem.createdAt ? assetDetailItem.createdAt.slice(0, 10) : "â€”"],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: `1px solid ${C.border}18` }}>
                      <td style={{ padding: "5px 8px 5px 0", color: C.textMuted, fontWeight: 600, whiteSpace: "nowrap", verticalAlign: "top" }}>{label}</td>
                      <td style={{ padding: "5px 0", color: C.text }}>{value || "â€”"}</td>
                    </tr>
                  ))}
                </table>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {isAdmin && (
                  <button onClick={() => { setEditItem({ ...assetDetailItem, _originalId: assetDetailItem.id }); setEditItemModal(true); setAssetDetailItem(null); }}
                    style={{ ...S.pBtn, flex: 1 }}>âœï¸ Edit Asset</button>
                )}
                <button onClick={() => setAssetDetailItem(null)} style={{ ...S.smBtn, flex: 1, textAlign: "center" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={addUserModal} onClose={() => setAddUserModal(false)} title="Add New User">
        <div style={S.mf}>
          <div style={S.f}><label style={S.lbl}>Full Name *</label>
            <input type="text" value={nu.name} onChange={e => setNu({ ...nu, name: e.target.value })} placeholder="e.g. Emmanuel" style={S.inp}/>
          </div>
          <div style={S.f}><label style={S.lbl}>Role</label>
            <select value={nu.role} onChange={e => setNu({ ...nu, role: e.target.value })} style={S.sel}>
              {["Warehouse Manager","Maintenance","Admin","Volunteer","Pastor","Group Leader","Other"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={S.f}><label style={S.lbl}>4-Digit PIN *</label>
            <input type="password" maxLength="4" pattern="[0-9]*" inputMode="numeric" value={nu.pin} onChange={e => setNu({ ...nu, pin: e.target.value })} placeholder="Enter 4-digit PIN" style={S.inp}/>
          </div>
          <button onClick={doAddUser} style={S.pBtn}>Add User</button>
        </div>
      </Modal>

      <Modal open={!!photoModal} onClose={() => setPhotoModal(null)} title="Link Photo to Item">
        <div style={S.mf}>
          <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 14 }}>
            Upload the photo to Google Drive, then paste the sharing link here.
          </p>
          <div style={S.f}><label style={S.lbl}>Google Drive Photo URL</label>
            <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." style={S.inp}/>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => doSetPhoto(photoModal)} style={S.pBtn}>Save Photo Link</button>
            {inventory.find(i => i.id === photoModal)?.photoUrl && (
              <button onClick={() => { setInventory(p => p.map(i => i.id === photoModal ? { ...i, photoUrl: "" } : i)); setPhotoModal(null); flash("Photo removed"); }}
                style={{ ...S.smBtn, color: C.red, borderColor: C.red }}>Remove</button>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={scanModal} onClose={() => { setScanModal(false); stopCheckoutScanner(); }} title="ðŸ“· Scan Item Barcode">
        <div style={S.mf}>
          {/* Camera scanner â€” video always in DOM so ref is always available */}
          <div style={{ marginBottom: 16 }}>
            {/* Always rendered, toggled via CSS display */}
            <div style={{ display: checkoutScannerActive ? "block" : "none" }}>
              <video ref={checkoutVideoRef} autoPlay playsInline muted
                style={{ width: "100%", borderRadius: 8, maxHeight: 260, objectFit: "cover", background: "#000", display: "block" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ color: C.green, fontSize: 13 }}>ðŸ“· Scanningâ€¦ point camera at barcode</span>
                <button onClick={stopCheckoutScanner} style={{ ...S.smBtn, color: C.red, borderColor: C.red }}>Stop</button>
              </div>
            </div>
            {!checkoutScannerActive && (
              <div style={{ textAlign: "center" }}>
                <button onClick={startCheckoutScanner} style={{ ...S.pBtn, background: C.brandBright, fontSize: 15 }}>
                  ðŸ“· Open Camera Scanner
                </button>
                <p style={{ color: C.textMuted, fontSize: 12, marginTop: 8 }}>
                  Point your camera at the item's barcode or QR code
                </p>
              </div>
            )}
          </div>
          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ color: C.textDim, fontSize: 12 }}>or enter manually</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          {/* Manual fallback */}
          <div style={S.f}><label style={S.lbl}>Item Code / Asset Tag ID</label>
            <input type="text" value={scanInput} onChange={e => setScanInput(e.target.value)}
              placeholder="e.g. 999999930" style={{ ...S.inp, fontSize: 16, textAlign: "center", letterSpacing: 1 }}
              onKeyDown={e => e.key === "Enter" && doScan()} autoFocus/>
          </div>
          <button onClick={doScan} style={S.pBtn}>Look Up Item</button>
        </div>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirm Delete">
        <div style={S.mf}>
          <p style={{ color: C.text, marginBottom: 16 }}>
            Remove <strong>{inventory.find(i => i.id === confirmDel)?.item || confirmDel}</strong> from inventory?
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => doDeleteItem(confirmDel)} style={{ ...S.pBtn, background: C.red }}>Yes, Delete</button>
            <button onClick={() => setConfirmDel(null)} style={S.smBtn}>Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!restockModal} onClose={() => setRestockModal(null)} title="Restock Item">
        <div style={S.mf}>
          <p style={{ color: C.text, marginBottom: 16 }}>
            Add quantity to <strong>{inventory.find(i => i.id === restockModal)?.item || restockModal}</strong>
          </p>
          <div style={S.f}>
            <label style={S.lbl}>Quantity to Add</label>
            <input 
              type="number" 
              min="1" 
              value={restockQty} 
              onChange={e => setRestockQty(parseInt(e.target.value) || 1)} 
              style={S.inp}
              autoFocus
            />
            <span style={S.hint}>
              Current qty: {inventory.find(i => i.id === restockModal)?.qty || 0}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={doRestock} style={{ ...S.pBtn, background: C.green }}>âœ“ Restock</button>
            <button onClick={() => setRestockModal(null)} style={S.smBtn}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Badge helpers
function ABadge({ a }) {
  const m = { 
    checkout: { bg: C.red, t: "CHECK OUT" }, 
    return: { bg: C.green, t: "RETURN" }, 
    used: { bg: C.orange, t: "USED" }, 
    added: { bg: C.accent, t: "ADDED" }, 
    deleted: { bg: C.textDim, t: "DELETED" },
    restocked: { bg: C.green, t: "RESTOCKED" }
  };
  const v = m[a] || { bg: C.textDim, t: a?.toUpperCase() };
  return <span style={{ ...S.badge, background: v.bg }}>{v.t}</span>;
}
function SBadge({ status, qty }) {
  if (status === "Checked Out") return <span style={{ ...S.badge, background: C.red }}>CHECKED OUT</span>;
  if (qty === 0) return <span style={{ ...S.badge, background: C.orange }}>EMPTY</span>;
  if (qty > 0 && qty <= 2) return <span style={{ ...S.badge, background: C.orange }}>LOW STOCK</span>;
  return <span style={{ ...S.badge, background: C.green }}>AVAILABLE</span>;
}

// ============================================================
// STYLES
// ============================================================
const S = {
  app: { fontFamily: "'DM Sans',-apple-system,sans-serif", background: C.bg, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column" },

  // Login Styles
  loginContainer: { minHeight: "100vh", background: `linear-gradient(135deg, ${C.brand} 0%, #0a0c1a 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans',sans-serif" },
  loginBox: { background: C.surfaceRaised, borderRadius: 16, border: `1px solid ${C.borderLight}`, padding: 40, maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  loginLogo: { width: 80, height: "auto", margin: "0 auto 20px", display: "block" },
  loginTitle: { fontSize: 20, fontWeight: 800, letterSpacing: 2, color: C.accent, textAlign: "center", marginBottom: 4 },
  loginSub: { fontSize: 11, color: C.textMuted, textAlign: "center", marginBottom: 24, letterSpacing: 1 },
  demoInfo: { background: C.orangeDim, border: `1px solid ${C.orange}`, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 12, color: C.text, textAlign: "center", lineHeight: 1.6 },
  loginForm: { display: "flex", flexDirection: "column", gap: 16 },
  loginField: { display: "flex", flexDirection: "column", gap: 6 },
  loginLabel: { fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6 },
  loginInput: { padding: "12px 14px", background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 8, color: C.text, fontSize: 15, outline: "none" },
  loginError: { background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 6, padding: 10, color: C.red, fontSize: 13, fontWeight: 500 },
  loginBtn: { padding: "14px 20px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, marginTop: 8 },
  loginFooter: { marginTop: 24, textAlign: "center", fontSize: 11, color: C.textDim },

  // Header
  header: { background: `linear-gradient(135deg, ${C.brand} 0%, #151940 100%)`, borderBottom: `2px solid ${C.accent}`, padding: "10px 16px", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", width: "100%" },
  logoRow: { display: "flex", alignItems: "center", gap: 12 },
  logoImg: { height: 44, width: "auto", objectFit: "contain" },
  headerTitle: { fontSize: 15, fontWeight: 800, letterSpacing: 2.5, color: C.accent, lineHeight: 1.2 },
  headerSub: { fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1, textTransform: "uppercase" },
  headerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  userBadge: { background: C.brandDim, color: C.accent, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 4, border: `1px solid ${C.accentBorder}` },
  demoBadge: { background: C.orange, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: 1 },
  logoutBtn: { background: "transparent", border: `1px solid rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.7)", padding: "6px 10px", borderRadius: 4, cursor: "pointer", fontSize: 14, lineHeight: 1 },
  hamburger: { display: "flex", flexDirection: "column", gap: 4, padding: 8, background: "transparent", border: "none", cursor: "pointer" },
  bar: { display: "block", width: 20, height: 2, background: "rgba(255,255,255,0.6)", borderRadius: 1 },

  // Multi-Select Styles
  multiSelectContainer: { position: "relative", width: "100%" },
  multiSelectTrigger: { padding: "8px 11px", background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 6, color: C.text, fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40 },
  multiSelectDisplay: { flex: 1, overflow: "hidden" },
  multiSelectTags: { display: "flex", flexWrap: "wrap", gap: 4 },
  multiSelectTag: { background: C.accentDim, color: C.accent, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 },
  multiSelectTagX: { background: "none", border: "none", color: C.accent, cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 },
  multiSelectArrow: { marginLeft: 8, fontSize: 10, color: C.textMuted },
  multiSelectDropdown: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 1000, maxHeight: 300, display: "flex", flexDirection: "column" },
  multiSelectSearch: { padding: "10px 12px", background: C.bg, border: "none", borderBottom: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none" },
  multiSelectOptions: { flex: 1, overflowY: "auto", padding: "4px 0" },
  multiSelectOption: { padding: "8px 12px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 },
  multiSelectOptionSelected: { background: C.accentDim },
  multiSelectCheckbox: { width: 16, height: 16, cursor: "pointer" },
  multiSelectEmpty: { padding: "16px 12px", color: C.textDim, fontSize: 13, textAlign: "center", fontStyle: "italic" },
  multiSelectFooter: { borderTop: `1px solid ${C.border}`, padding: "8px 12px" },
  multiSelectClear: { background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0 },

  // Searchable Select Styles
  searchSelectContainer: { position: "relative", width: "100%" },
  searchSelectTrigger: { padding: "8px 11px", background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 6, color: C.text, fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" },
  searchSelectArrow: { marginLeft: 8, fontSize: 10, color: C.textMuted },
  searchSelectDropdown: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 1000, maxHeight: 300, display: "flex", flexDirection: "column" },
  searchSelectInput: { padding: "10px 12px", background: C.bg, border: "none", borderBottom: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none" },
  searchSelectOptions: { flex: 1, overflowY: "auto", padding: "4px 0" },
  searchSelectOption: { padding: "8px 12px", cursor: "pointer", fontSize: 13 },
  searchSelectOptionActive: { background: C.accentDim, color: C.accent },
  searchSelectEmpty: { padding: "16px 12px", color: C.textDim, fontSize: 13, textAlign: "center", fontStyle: "italic" },

  // Nav
  nav: { display: "flex", gap: 3, padding: "7px 16px", background: C.surface, borderBottom: `1px solid ${C.border}`, overflowX: "auto", flexWrap: "nowrap" },
  navOpen: { flexWrap: "wrap" },
  navBtn: { padding: "6px 13px", border: "1px solid transparent", borderRadius: 6, background: "transparent", color: C.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", display: "flex", alignItems: "center", transition: "all .15s" },
  navAct: { background: C.brandDim, color: C.accent, borderColor: C.accentBorder },

  // Main
  main: { flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "18px 16px 48px" },
  pageTitle: { fontSize: 19, fontWeight: 700, color: C.accent, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}` },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 10 },
  sub: { color: C.textMuted, fontSize: 13, marginTop: -8, marginBottom: 16 },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 22 },
  stat: { background: C.surface, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}`, borderLeft: "3px solid" },
  statN: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  statL: { fontSize: 9, color: C.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 },

  // Card
  card: { background: C.surface, borderRadius: 10, padding: "16px 14px", border: `1px solid ${C.border}`, marginBottom: 14 },
  cardT: { fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 10 },

  // Forms
  fg: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, marginBottom: 18 },
  f: { marginBottom: 10, flex: 1, minWidth: 150 },
  lbl: { display: "block", fontSize: 10, fontWeight: 600, color: C.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: .6 },
  inp: { width: "100%", padding: "8px 11px", background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 6, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" },
  sel: { width: "100%", padding: "8px 11px", background: C.bg, border: `1px solid ${C.borderLight}`, borderRadius: 6, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" },
  hint: { fontSize: 10, color: C.textDim, marginTop: 3, display: "block" },
  tRow: { display: "flex", gap: 6 },
  tBtn: { flex: 1, padding: "8px 12px", border: `1px solid ${C.borderLight}`, borderRadius: 6, background: C.bg, color: C.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: .5, transition: "all .15s" },

  // Buttons
  pBtn: { padding: "9px 26px", background: C.accent, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: .5 },
  scanBtn: { padding: "7px 12px", background: C.brandDim, border: `1px solid ${C.accentBorder}`, borderRadius: 6, cursor: "pointer", fontSize: 15, lineHeight: 1 },
  smBtn: { padding: "5px 12px", border: `1px solid ${C.borderLight}`, borderRadius: 4, background: "transparent", color: C.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 600 },
  tiny: { padding: "3px 7px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", fontSize: 12, lineHeight: 1, color: C.textMuted },
  lnkBtn: { background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 11, fontWeight: 500, textDecoration: "underline", padding: 0 },

  // Filters
  filterBar: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 },
  chips: { display: "flex", gap: 4, flexWrap: "wrap" },
  chip: { padding: "4px 11px", border: `1px solid ${C.borderLight}`, borderRadius: 4, background: "transparent", color: C.textMuted, cursor: "pointer", fontSize: 11, fontWeight: 600 },
  chipAct: { background: C.brandDim, color: C.accent, borderColor: C.accentBorder },

  // Table
  tw: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
  tbl: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { textAlign: "left", padding: "7px 9px", borderBottom: `1px solid ${C.border}`, color: C.textMuted, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" },
  td: { padding: "7px 9px", borderBottom: `1px solid ${C.border}18`, whiteSpace: "nowrap" },
  badge: { display: "inline-block", padding: "2px 7px", borderRadius: 3, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: .7 },
  code: { background: C.accentDim, color: C.accent, padding: "2px 6px", borderRadius: 3, fontSize: 11, fontWeight: 600 },
  photoLnk: { color: C.accent, fontSize: 11, textDecoration: "none", fontWeight: 500 },

  // V4: Scanner & Photo Styles
  scannerSection: { background: C.surfaceRaised, padding: 14, borderRadius: 8, border: `1px solid ${C.borderLight}` },
  scannerContainer: { position: "relative", width: "100%", maxWidth: 400, margin: "10px auto", backgroundColor: "#000", borderRadius: 8, overflow: "hidden" },
  scannerVideo: { width: "100%", display: "block", borderRadius: 8 },
  scannerOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, border: `2px solid ${C.accent}`, borderRadius: 8, pointerEvents: "none" },
  photoPreview: { width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: `2px solid ${C.borderLight}`, marginTop: 8 },

  // Misc
  empty: { color: C.textDim, fontStyle: "italic", padding: 18, textAlign: "center", fontSize: 13 },
  foot: { color: C.textDim, fontSize: 11, marginTop: 8 },

  // Footer
  footer: { padding: "12px 16px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontSize: 11, color: C.textDim, flexWrap: "wrap" },

  // Toast
  toast: { position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", padding: "9px 22px", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 6px 28px rgba(0,0,0,.5)", animation: "slideDown .25s ease", maxWidth: "90vw", textAlign: "center" },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16, animation: "fadeIn .15s ease" },
  modal: { background: C.surfaceRaised, borderRadius: 12, border: `1px solid ${C.borderLight}`, maxWidth: 480, width: "100%", maxHeight: "85vh", overflow: "auto", animation: "slideDown .2s ease" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${C.border}` },
  modalTitle: { fontSize: 15, fontWeight: 700, color: C.accent, margin: 0 },
  modalX: { background: "none", border: "none", color: C.textMuted, fontSize: 17, cursor: "pointer", padding: 4, lineHeight: 1 },
  modalBody: { padding: 18 },
  mf: { display: "flex", flexDirection: "column", gap: 10 },
  mRow: { display: "flex", gap: 10, flexWrap: "wrap" },
};
