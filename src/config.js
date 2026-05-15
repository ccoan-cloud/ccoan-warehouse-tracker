// =============================================================================
// CCOAN Warehouse Tracker — Branch Configuration
// =============================================================================
// HOW TO ADD A NEW BRANCH:
//   1. Add a new entry to the BRANCHES object below (copy an existing one)
//   2. Fill in the correct appsScriptUrl, timezone, logo, etc.
//   3. Save the file, rebuild, and deploy.
//   The branch selector dropdown updates automatically.
// =============================================================================

const BRANCHES = {

  // ---------------------------------------------------------------------------
  // 🇳🇱 ALMERE — Netherlands (Default Branch)
  // ---------------------------------------------------------------------------
  almere: {
    id: 'almere',
    name: 'CCOAN Almere',
    location: 'Almere, Netherlands',
    country: '🇳🇱',
    timezone: 'Europe/Amsterdam',
    currency: '€',
    language: 'nl-NL',

    // Backend — Google Apps Script Web App URL
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzxNfnq1O1w686gX3Uapy-8fpnVijW9fXBApBb0yFwGscCwhKYajXjbyvgI-iJaS1ag/exec',

    // Branding
    logo: 'https://ccoan.com/almere/wp-content/uploads/sites/12/2024/04/CCOAN-Logo-White-950w-With-Shadow-2.png',

    // UI Colors — Almere uses default dark navy theme
    colors: {
        brand:        "#1E2470",
        brandLight:   "#2A32A0",
        brandBright:  "#3D48C8",
        brandDim:     "rgba(30,36,112,0.18)",
        brandBorder:  "rgba(30,36,112,0.45)",
        brandSoft:    "rgba(61,72,200,0.12)",
        accent:       "#4A6CF7",
        accentDim:    "rgba(74,108,247,0.14)",
        accentBorder: "rgba(74,108,247,0.35)",
        bg:           "#0B0D14",
        surface:      "#12151E",
        surfaceRaised:"#181C28",
        border:       "#1E2230",
        borderLight:  "#282E40",
        text:         "#E8E8EC",
        textMuted:    "#8890A4",
        textDim:      "#5A6178",
        white:        "#FFFFFF",
        red:          "#E04040",
        redDim:       "rgba(224,64,64,0.12)",
        green:        "#2EAA5A",
        greenDim:     "rgba(46,170,90,0.12)",
        orange:       "#E8922A",
        orangeDim:    "rgba(232,146,42,0.12)",
},
  },

  // ---------------------------------------------------------------------------
  // 🇺🇸 NEW YORK — United States
  // ---------------------------------------------------------------------------
  newyork: {
    id: 'newyork',
    name: 'CCOAN New York',
    location: 'New York, USA',
    country: '🇺🇸',
    timezone: 'America/New_York',
    currency: '$',
    language: 'en-US',

    // Backend — TODO: Replace with NY Apps Script Web App URL after deployment
    // Steps to get this URL:
    //   1. Open NY Google Sheet → Extensions → Apps Script
    //   2. Deploy → New deployment → Web app
    //   3. Execute as: Me | Who has access: Anyone
    //   4. Copy the Web App URL and paste it below
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxmsbH4fllYYnGdz5XrUOuLelqiSctAJUTwtfn1REeHOlnilLLQSY_oHDo5o9M88Jc/exec',

    // Branding — TODO: Replace with actual NY logo URL
    // If NY uses the same logo as Almere, copy the Almere logo URL above
    logo: 'https://ccoan.com/almere/wp-content/uploads/sites/12/2024/04/CCOAN-Logo-White-950w-With-Shadow-2.png',

    // UI Colors — NY uses the same color scheme as Almere
    // To give NY a different look, change the accent colors below
    colors: {
        brand:        "#1E2470",
        brandLight:   "#2A32A0",
        brandBright:  "#3D48C8",
        brandDim:     "rgba(30,36,112,0.18)",
        brandBorder:  "rgba(30,36,112,0.45)",
        brandSoft:    "rgba(61,72,200,0.12)",
        accent:       "#4A6CF7",
        accentDim:    "rgba(74,108,247,0.14)",
        accentBorder: "rgba(74,108,247,0.35)",
        bg:           "#0B0D14",
        surface:      "#12151E",
        surfaceRaised:"#181C28",
        border:       "#1E2230",
        borderLight:  "#282E40",
        text:         "#E8E8EC",
        textMuted:    "#8890A4",
        textDim:      "#5A6178",
        white:        "#FFFFFF",
        red:          "#E04040",
        redDim:       "rgba(224,64,64,0.12)",
        green:        "#2EAA5A",
        greenDim:     "rgba(46,170,90,0.12)",
        orange:       "#E8922A",
        orangeDim:    "rgba(232,146,42,0.12)",
},
  },

  // ---------------------------------------------------------------------------
  // 🌍 FUTURE BRANCH TEMPLATE — Copy this block to add a new city
  // ---------------------------------------------------------------------------
  // example: {
  //   id: 'example',
  //   name: 'CCOAN Example',
  //   location: 'City, Country',
  //   country: '🌍',
  //   timezone: 'Europe/London',         // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  //   currency: '£',
  //   language: 'en-GB',
  //   appsScriptUrl: 'https://script.google.com/macros/s/[SCRIPT_ID]/exec',
  //   logo: 'https://ccoan.com/example/logo.png',
  //   colors: { ...same as above... }
  // },

};

// =============================================================================
// Branch Detection — Determines which branch to load
// Priority: URL param → localStorage → default (almere)
// =============================================================================

/**
 * Returns the currently active branch ID (e.g. "almere" or "newyork").
 */
export function detectBranch() {
  // Priority 1: URL parameter  (?branch=newyork)
  // Use case: Bookmarked URL per team, e.g. shared in WhatsApp or email
  const urlParams = new URLSearchParams(window.location.search);
  const urlBranch = urlParams.get('branch');
  if (urlBranch && BRANCHES[urlBranch]) {
    return urlBranch;
  }

  // Priority 2: Last selection saved in localStorage
  // Use case: User manually switched branches — remember their choice
  const savedBranch = localStorage.getItem('warehouseBranch');
  if (savedBranch && BRANCHES[savedBranch]) {
    return savedBranch;
  }

  // Priority 3: Default branch
  return 'almere';
}

/**
 * Returns the full configuration object for the currently active branch.
 */
export function getCurrentBranch() {
  return BRANCHES[detectBranch()];
}

/**
 * Switches to a different branch.
 * Saves choice to localStorage, updates URL, and reloads the app.
 * @param {string} branchId - Must match a key in BRANCHES
 */
export function switchBranch(branchId) {
  if (!BRANCHES[branchId]) {
    console.error('[CCOAN Config] Unknown branch:', branchId);
    return;
  }

  // Save the new branch choice FIRST
  localStorage.setItem('warehouseBranch', branchId);

  // Clear session credentials
  localStorage.removeItem('warehouseUser');
  localStorage.removeItem('warehouseUserRole');
  localStorage.removeItem('warehouseSessionExpiry');

  // Clear ALL cached warehouse data so the new branch
  // loads fresh from its own backend, not the previous branch's cache
  localStorage.removeItem('warehouseInventory');
  localStorage.removeItem('warehouseLog');
  localStorage.removeItem('warehouseAccessLog');
  localStorage.removeItem('warehouseUsers');
  localStorage.removeItem('warehouseLastSync');

  // Update URL to reflect the branch (makes it bookmarkable)
  const url = new URL(window.location.href);
  url.searchParams.set('branch', branchId);
  window.history.replaceState({}, '', url.toString());

  // Reload to apply the new backend, timezone, and branding
  window.location.reload();
}

/**
 * Returns an array of all configured branches.
 * Used to populate the branch selector dropdown.
 */
export function getAllBranches() {
  return Object.values(BRANCHES);
}

/**
 * Returns true if the NY Apps Script URL has been configured.
 * Used to warn admins that setup is incomplete.
 */
export function isBranchReady(branchId) {
  const branch = BRANCHES[branchId];
  if (!branch) return false;
  return !branch.appsScriptUrl.includes('PLACEHOLDER');
}

// =============================================================================
// Default export — current branch config
// Import this in App.jsx:
//   import CONFIG, { switchBranch, getAllBranches, detectBranch } from './config';
// =============================================================================
export default getCurrentBranch();
