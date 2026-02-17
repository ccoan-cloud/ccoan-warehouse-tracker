import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// CONFIGURATION
// ============================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkHaRhLjr3WEaHZyBVkGdYLPDKo-DIbdGhtMXSP_Wb2AIdupN92mIUQndVzNJ9O6Wz/exec";
const IS_DEMO = false;

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

// ============================================================
// Demo Data
// ============================================================
const INITIAL_INVENTORY = [
  {
    "id": "999999930",
    "item": "Cordless drill/driver (13mm chuck)",
    "brand": "Makita",
    "model": "DF457D (18V Li-ion)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e21c6ea3-448c-449e-84a8-4e16b30551c3.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4004722637250",
    "item": "Floor repair kit / laminate & wooden floor repair set (wax melt repair set)",
    "brand": "Werkzeyt",
    "model": "Bodenreparaturset (Floor repair set) — Code: B2769",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/84e08e8c-cc59-4dcc-89f0-3d0d736635f9.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999929",
    "item": "WERCKMANN – Professional Tools.",
    "brand": "WERCKMANN – Professional Tools.",
    "model": "WERCKMANN – Professional Tools.",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/aca416e1-ee36-4d81-88e4-d8c12e6090ad.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247880172",
    "item": "Drill & bit set (Boren- & Bitset)",
    "brand": "GAMMA",
    "model": "101x” — GAMMA “Boren- & Bitset” 101-piece",
    "category": "Equipment",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fc489bff-b942-4646-85c8-9e9e0a0d53bd.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999928",
    "item": "Electric space heater / fan heater (portable, tabletop)",
    "brand": "Sencys",
    "model": "Model No. 10390320 (NF20-18UR) Power/Specs: 220–24",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/da8849fc-4cb6-4ef4-9c50-5568c637b8af.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999927",
    "item": "Electric finishing sander (sheet/palm sander)",
    "brand": "SKIL",
    "model": "SKIL 7280 (corded, 230V)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/2c2a71b5-e9ff-47a5-b9cf-1a3ac6ff8207.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999926",
    "item": "Paint spray gun (electric spray painter)",
    "brand": "HBM",
    "model": "HBM Spray Gun (electric spray system with paint cu",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/1670112e-5cc4-475c-83e4-6009aabaf0a1.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247214083",
    "item": "Angle grinder (hand grinder)",
    "brand": "GAMMA",
    "model": "Haakse slijper HS-115HP (115mm disc)",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/dc7f473c-03cf-46af-b273-de02ebb0c8df.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710439259635",
    "item": "Sanitary silicone sealant (for bathroom/kitchen joints & sealing)",
    "brand": "Bison",
    "model": "Super Silicone — Sanitair (100% silicone)",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f722c9ff-4e8d-450a-811a-c39ef3a95743.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5414628072953",
    "item": "Sanitary silicone sealant (for bathroom/kitchen joints & sealing)",
    "brand": "Sencys",
    "model": "Siliconenkit — Sanitair Universeel (Mastic silicon",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/33538e5f-2666-4acb-9787-4baae45963a4.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5400107576807",
    "item": "Hout & Vloer (Kit/Mastic) — Universele Houtkit (Classiek / Classique)",
    "brand": "Base Line",
    "model": "Acrylaatkit (Acrylic sealant / Mastic acrylique)",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/28fdf72b-a287-4914-87ee-b13a2539271f.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "3146439086028",
    "item": "Wood & floor sealant / wood filler mastic (for laminate, parquet & wood)",
    "brand": "BISON",
    "model": "Hout & Vloer (Kit/Mastic) — Universele Houtkit (Cl",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4b0add07-4630-4202-86e1-6b906e302f61.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8011564251427",
    "item": "Miniature circuit breaker / installation automatic (MCB), B16 (16A), 1P+N, 6kA, 230V~",
    "brand": "GEWISS",
    "model": "GEWISS GW90328 (MCB installatieautomaat (nul) B16,",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/6a99e593-996c-4143-9d12-20022a696b70.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247894537",
    "item": "Sandpaper roll (finishing) — grit P320",
    "brand": "GAMMA",
    "model": "Schuurrol “Afwerken / Finition” (finishing sandpap",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e9bafd54-c663-44d8-9727-970e45b8248e.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5010559436187",
    "item": "Digital moisture meter (pin-type) for wood & building materials",
    "brand": "Draper",
    "model": "Moisture Meter — 43618",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/09ede061-d61c-444e-a5ad-09b8f6296ad4.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4002593003068",
    "item": "Torque wrench set (click-type) with sockets and extension",
    "brand": "Powerfix Profi",
    "model": "Drehmomentschlüssel-Set (torque wrench set) — 1/2\"",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/53120e45-feaf-4402-b1c0-7d898216ccc5.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999925",
    "item": "Oil filter wrench/cap set (cup-style oil filter sockets) + 3-jaw oil filter wrench",
    "brand": "Wiltec Wildanger Technik GmbH",
    "model": "30-piece oil filter cap socket set (various sizes)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/7bcabc98-73ea-47c8-a030-6c23750c0abe.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999924",
    "item": "Electricians Toolbox / tool storage box (with organizer compartments)",
    "brand": "Patrol Group",
    "model": "Formula A700",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/7c15bca2-b990-41fa-95db-4d0f95ef10f6.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999923",
    "item": "Folding try square / adjustable carpenter’s square (metal angle ruler",
    "brand": "",
    "model": "Folding right-angle square with integrated spirit ",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a46c932e-2c75-4e29-b569-15de17bbd913.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "9999999221",
    "item": "Tube/box spanner wrench set (double-ended tubular wrenches)",
    "brand": "",
    "model": "Tubular wrench set — sizes: 8 mm, 10 mm, 12 mm, 13",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ca6f770d-8a99-4047-823b-4a9ffd054134.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999921",
    "item": "Electric impact wrench set (corded) with sockets & carry case",
    "brand": "Einhell",
    "model": "Einhell corded impact wrench (socket set included)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/28a0ccd1-e904-4da5-b77a-29ffb3f6b465.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999920",
    "item": "L-square / carpenter’s framing square (right-angle measuring ruler)",
    "brand": "MILWAUKEE",
    "model": "Metric framing square with angle/degree markings",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fd34de83-d3db-4aa7-9272-9becf6630734.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999919",
    "item": "Socket wrench set",
    "brand": "Brüder Mannesmann",
    "model": "215-piece socket set (Steckschlüsselsatz), Art.-Nr",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4917d605-0ddf-4143-bf70-344e54432ee7.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999918",
    "item": "Cordless circular saw (handheld)",
    "brand": "SKIL",
    "model": "20V Max (brushless-style housing) circular saw — b",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8faf3b5f-d79a-450b-b55c-e57b577e325b.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4048962245639",
    "item": "Universal wall plug set (for solid + hollow walls incl. drywall/plasterboard)",
    "brand": "fischer",
    "model": "DUOPOWER (assorted plugs in carry case — “280x” se",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/38e0be26-59c2-4ea4-b66c-4930c7618523.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247018551",
    "item": "Furniture glides / nail-on felt glides (white)",
    "brand": "HANDSON",
    "model": "24 pcs by 20mm",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/16dbabe5-6974-403b-8924-8b8b0cc88a68.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999917",
    "item": "Wood chisel set",
    "brand": "Stanley",
    "model": "Chisel set – 5 pcs",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fc8f2d10-d887-43fd-83d3-1cee9d7ff5cc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711969043466",
    "item": "Roundup AC Totaal weed killer (ready-to-use sprayer)",
    "brand": "Roundup",
    "model": "Roundup AC – Onkruidvrij Totaal",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f3f597ed-c0ab-4cec-9886-f5cae2d58454.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711332174117",
    "item": "Plastic wall plugs / drywall anchors (self-drilling type, coarse thread)",
    "brand": "",
    "model": "Self-drilling plastic “plasterboard” anchor plugs ",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/0eaedf96-dd27-4a29-ba7c-e12d9c1828f1.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999916",
    "item": "Mixed metal nuts & washers set (assorted hex nuts / fittings)",
    "brand": "",
    "model": "Assorted hex nuts + washers/spacers (various sizes",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f63b0b29-81f8-4ba0-9549-2276f170cd44.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999915",
    "item": "Measuring tape / tape measure (retractable)",
    "brand": "",
    "model": "Hand tape measure with locking button and belt cli",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8bc1b8e3-6455-4762-a807-07abb88f8774.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247058601",
    "item": "Curtain rail runners/gliders (for U-rail)",
    "brand": "GAMMA",
    "model": "Runners voor U-rail — wit — pack of 10",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f486a5e4-6f5e-4727-9d69-f901c6076ff1.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999914",
    "item": "Metal plasterboard anchors / drywall plugs (gipsplaatpluggen)",
    "brand": "GAMMA",
    "model": "Gipsplaatplug Ø 7 mm (metaal) — pack of 8 Finish/C",
    "category": "Equipment",
    "type": "Tool",
    "qty": 3,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/72bf3192-aef1-4b6d-8171-576dfd8780c0.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999913",
    "item": "Heavy-duty extension cable / power extension lead (EU Schuko)",
    "brand": "",
    "model": "Long Schuko extension lead (male plug to female)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/42cb7dd2-2502-49d4-99b9-aefc9a881acb.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "999999912",
    "item": "3-socket extension lead / power strip with on/off switch (EU Schuko)",
    "brand": "IKEA",
    "model": "3-way Schuko extension block with rocker switch",
    "category": "Equipment",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/471c8eee-316e-4d1d-879a-5b8401796b2b.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "9999999919",
    "item": "One-hand bar clamp / quick-grip clamp (trigger clamp)",
    "brand": "Werckmann (Professional Tools)",
    "model": "Quick-grip / one-hand clamp (ratchet bar clamp wit",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e700423e-b00d-4833-aa67-61cfe891b14d.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8717344993197",
    "item": "Suction lifter / suction cup handle (for lifting glass, tiles, smooth panels)",
    "brand": "Benson Tools",
    "model": "Super Zuignap (suction cup lifter) — 1 cup",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8e029093-6641-4718-94a0-3024a4910b7c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718546652257",
    "item": "Jumper cables / booster cables set (start cables) — for jump-starting vehicles",
    "brand": "TUV",
    "model": "Startkabelset 12/24V — 3m, 16mm², 220A",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/52947606-0611-475f-8e38-6be90ff5ea5f.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718853018517",
    "item": "Hydraulic bottle jack (lifting jack) — 2.0 ton",
    "brand": "Bottle Jack",
    "model": "Hydraulic Bottle Jack 2.0 Ton (Art. 9200264)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/b7ac9752-2673-466c-96e9-1a4fd415209d.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4019641025972",
    "item": "Car battery charger (6V/12V) with LED control display",
    "brand": "Ultimate Speed",
    "model": "KFZ-Batterieladegerät ULG 3.8 A1)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/c7ced2e5-8102-47b1-9fbb-9d08851a513c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "23W4610339",
    "item": "Cordless tool battery charger (for SKIL 20V system)",
    "brand": "SKIL",
    "model": "20V battery charger (plug-in type)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/78500578-17a4-45f5-9689-5c2017452c42.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718964213603",
    "item": "Jigsaw blades set (15 pcs), T-shank",
    "brand": "ACTION",
    "model": "“15x Jigsaw Blades” – mixed set (T111B, T111D, T11",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/3d056b34-5664-451d-8f22-7f4881d275dd.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "AQR2410705",
    "item": "Digital multimeter (with test leads)",
    "brand": "Laserliner",
    "model": "MultiMeter ECO",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/eade9ab4-1e05-462d-acde-b913f75abd41.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4007871960545",
    "item": "20V Li-ion rechargeable battery pack (4.0Ah)",
    "brand": "LUX-TOOLS",
    "model": "AK-20/4.0 — High Performance (1 PowerSystem max. 2",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/7fea09a5-f3b5-44e8-8509-535c79e40dc4.jpg",
    "serialNo": "4007871960521",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5010559916481",
    "item": "WiFi inspection endoscope camera (waterproof; smartphone-compatible)",
    "brand": "Draper",
    "model": "WiFi Endoscope — 91648 Finish/Color: Black",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/572b9c01-6db5-4927-ab3a-384f6dea7391.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "7311490055863",
    "item": "Sandpaper roll",
    "brand": "FSC",
    "model": "Sand paper roll — 12 cm × 5 m — Grit 120 (Medium)",
    "category": "Filler & Putty",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/9b76f79d-cb1c-4d71-811c-2e36866139ab.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113911085",
    "item": "Wood filler",
    "brand": "TCX",
    "model": "Wood repair filler",
    "category": "Filler & Putty",
    "type": "Consumable",
    "qty": 3,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/09ae99e4-0d5c-4d56-b4b1-c9d81a13d7ba.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710345880992",
    "item": "Eurocol 880",
    "brand": "Eurocol ",
    "model": "Eurocol 880 euroseal silicone",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/6b81a463-c169-460d-a394-96de921a7b2c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718347111090",
    "item": "360 HIGH-TACK (Solvent-Free Hybrid)",
    "brand": "Seal-It",
    "model": "360 HIGH-TACK (Solvent-Free Hybrid)",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/2a85e164-3a6e-4733-81c3-4adfcd78a48b.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5411183179509",
    "item": "PU foam) — gap filling & insulation",
    "brand": "TCX",
    "model": "Construction Foam (straw/applicator nozzle) — 750 ",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/bd2bb9cc-37e8-4b64-8f50-8c69f90ca664.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4064824002943",
    "item": "Epoxy resin hardener (Part B) for clear casting/coating",
    "brand": "EPODEX",
    "model": "2-component (2K) epoxy system",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/6f5e16bc-7fc6-470d-aec0-866d85d3fcbe.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247153528",
    "item": "Acrylic sealant / acrylic caulk (paintable; for filling small cracks and joints)",
    "brand": "OK",
    "model": "Acrylaat Kit (French: Mastic Acrylique) — paintabl",
    "category": "Equipment",
    "type": "Tool",
    "qty": 6,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4af6d3b2-c7ae-41a9-9e49-67c2ad23a243.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711595217040",
    "item": "Silicone sealant / sanitary silicone caulk (flexible, waterproof sealing for joints)",
    "brand": "Den Braven",
    "model": "Siliconenkit – Sanitair (sanitary silicone sealant",
    "category": "Equipment",
    "type": "Tool",
    "qty": 5,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/c009f5fd-a50b-4073-9b88-ced1b21c0ab1.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113126076",
    "item": "Exterior wood stain / protective wood finish for doors & window frames (weather-resistant, long-last",
    "brand": "CetaBever (AkzoNobel)",
    "model": "Buiten Deur & Kozijn – Meesterbeits (transparent e",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4a35f60e-fdaa-46ac-b971-1555afecc70b.jpg",
    "serialNo": "8711113126076",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113911092",
    "item": "Ready-mix wall filler / crack & hole repair filler (quick-drying, paintable)",
    "brand": "TCX",
    "model": "Instant Filler – White (bucket/paste filler)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/3aee779b-6e3a-4fec-94ea-837945614cc7.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247191155",
    "item": "Palm/detail sander (hand sander) – for sanding corners/edges and small surfaces",
    "brand": "GAMMA",
    "model": "Handpalmschuurmachine / Ponceuse de détail – HPS-2",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/85bc9b58-6fac-4e68-b8cc-5b02ff4a837e.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247186908",
    "item": "Wall primer / pre-coat fixer | Transparent — coverage approx. ± 40 m²",
    "brand": "GAMMA",
    "model": "Voorstrijk Primer – Fixeer / Fixation (transparent",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/b5557b4c-4320-45e3-adf7-d76c6048c3cc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711149002238",
    "item": "Ready-mix joint filler & finishing compound for drywall (Gyproc plasterboard)| White paste (filler/f",
    "brand": "Gyproc (Saint-Gobain)",
    "model": "Vul & Finish (ready-to-use jointing compound)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247718390",
    "item": "Manual tile cutter (small model)|Cutting Tool",
    "brand": "GAMMA",
    "model": "Tegelsnijder klein (French: Coupe-carrelage petit)",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/6a4cf45a-bbfd-4209-98a1-e7fe2a19beba.jpg",
    "serialNo": "1",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "71607290",
    "item": "White Paint",
    "brand": "",
    "model": "",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/6106f5ba-9d30-4769-9c0a-e23b685cf434.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247019312",
    "item": "Interior satin enamel / lacquer paint (wood/trim paint)",
    "brand": "OK",
    "model": "Zijdeglanslak (French: Laque satinée), 1L",
    "category": "Paint",
    "type": "Consumable",
    "qty": 13,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/383a2cee-2025-42a5-b336-82e217afaadc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247001522",
    "item": "GAMMA Wood & Wall – Klassiek / Classique (Extra Mat)",
    "brand": "GAMMA",
    "model": "Wood & Wall – Klassiek/Classicque Extra Mat",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/bc953a3d-f758-4fdc-9120-af5504bd06b3.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247020226",
    "item": "white primer/grondverf",
    "brand": "GAMMA",
    "model": "",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8acde368-8d27-4bc4-9a39-064ad8850f22.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8716242906728",
    "item": "Wood enamel / wood lacquer paint (scratch & wear resistant) u",
    "brand": "Histor",
    "model": "Perfect Finish – Houtlak (French: Laque pour bois)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/623e3143-cd28-4d2c-903c-c6faaa3a5a06.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "87111130996",
    "item": "Interior enamel/trim paint (smooth “lacquer” paint)",
    "brand": "Flexa",
    "model": "Strak in de Lak — Binnen (color: Goud / Gold)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a41eff8f-4761-4474-a8d8-60296cb615f5.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5204410811033",
    "item": " (for cleaning brushes + thinning solvent-based paints) u",
    "brand": "Vitex",
    "model": "T-300 (Brush Solvent / Diluent Universal T-300)",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/529fcdce-0003-4632-9d6b-ebd9b0315df2.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710439305370",
    "item": "Sanitary silicone sealant (for joints in bathrooms/kitchens)",
    "brand": "Griffon",
    "model": "SILPAT (DVGW / EN 751-2",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/50b2d1b2-aa8f-4059-84d6-66bd18c5c4f8.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710345008822",
    "item": "Ready-mixed wall tile adhesive (tile paste)",
    "brand": "Eurocol",
    "model": "690 Tegelpasta (pasteuze wandtegelijm)",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/47d96291-e6d6-4b89-ba78-0d7d59639580.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247958888",
    "item": "High-gloss paint/lacquer (tint base)",
    "brand": "Leurtster",
    "model": "Lakverf / Laque – Hoogglans (TR)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f4b2e069-5686-497d-8635-7c06e5c2064e.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113869102",
    "item": "Wood oil (water-based) – semi-transparent “Bangkirai”",
    "brand": "Spectrum",
    "model": "Wood Oil (Semi Transparent – Bangkirai) ",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 16,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f2c9e170-2220-4e39-a736-f49506128006.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "07235023",
    "item": "Verfafbijt, Paint remover / paint stripper (removes existing paint layers)",
    "brand": "GAMMA",
    "model": "Verfafbijt (drip-free)",
    "category": "Paint Remover",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ba355204-49d5-4a52-aff5-266ab6b43e8a.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247002284",
    "item": "Interior lacquer paint (matte finish)",
    "brand": "GAMMA",
    "model": "Lakverf (Interior) – Matte (Mat) – “Kras- en stoot",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4bff2046-6313-47ee-a875-c5d45f760f71.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247021643",
    "item": "Outdoor lacquer / exterior gloss paint",
    "brand": "GAMMA",
    "model": "Buitenlak (Exterior lacquer) – High gloss (Hooggla",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e29bf26a-0a2c-4f81-98e1-137ece01d6bf.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113910040",
    "item": "Clear wood varnish (transparent, matte)",
    "brand": "Spectrum",
    "model": "Water-based (Mat/Transparent)",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4118c745-2b0c-44f2-a90b-a9c94e0510a3.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "17108328",
    "item": "Wood filler (natural color)",
    "brand": "Alabastine",
    "model": "Houtvuller (Natural/“Naturel”)",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e431c824-c08d-4585-bea5-3729bf0f8f16.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5200106820730",
    "item": "Fireplace / stove glass cleaner (soot remover spray)",
    "brand": "Mister Barbeque",
    "model": "Spray",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/775adc79-022a-42ef-b0e0-fbc25e2e084f.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247153559",
    "item": "White mounting adhesive (construction glue)",
    "brand": "OK",
    "model": "Montagekit (solvent-free)",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8637d0cc-1864-4963-8529-94c96cbc5de8.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247001737",
    "item": "Interior lacquer paint (matte)",
    "brand": "GAMMA",
    "model": "Lakverf (Mat / Matte, indoor)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/20b1e73b-b870-40e1-8cc2-0872fd47d9eb.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247003366",
    "item": "Roest Verwijderaar (Rust Remover)",
    "brand": "GAMMA",
    "model": "Muurverf (Mat / Matte)",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fba98d1c-9111-4590-903f-3e9c9a67ef05.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711577189860",
    "item": "Rust remover (rust removal liquid), 500 ml",
    "brand": "HG",
    "model": "Roest Verwijderaar (Rust Remover) - 500ml",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/bf5dca25-9c20-44fa-977f-9d9392aa6cde.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247869177",
    "item": "Matte spray paint (aerosol lacquer), 400 ml",
    "brand": "OK",
    "model": "Spuitlak Mat (matte aerosol lacquer)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/89795e90-09b9-49ad-8a95-5aa310fe44bc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711577190439",
    "item": "Professional oven, grill & BBQ cleaner (foam spray)",
    "brand": "XG2",
    "model": "Oven/Grill/BBQ Reiniger (foam spray)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/5eced6a0-6dcc-4621-bc2a-2d04e8358122.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718801357057",
    "item": "Professional oven, grill & BBQ cleaner (foam spray)",
    "brand": "XG2",
    "model": "Oven/Grill/BBQ Reiniger (foam spray)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/76344574-33bb-47d4-a5c1-eaca3f7f2e6c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4056232545792",
    "item": "Bicycle chain cleaner spray (removes dirt & grease)",
    "brand": "Powerfix Profi+",
    "model": "Kettenreiniger (400 ml)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ae544652-913a-436a-94b5-7ef5615bf09b.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247049111",
    "item": "Exterior primer paint (white)",
    "brand": "GAMMA",
    "model": "Grondverf / Primer (voor buiten)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/aa12eaf1-8287-4201-83cc-b5190dd7bad4.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247026662",
    "item": "Outdoor wood stain (shed & garden house), transparent mahogany",
    "brand": "GAMMA",
    "model": "Tuinbeits (Lasur pour extérieur) – “tuinhuis en sc",
    "category": "Wood Stain",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/29e2e0b1-6fe8-4226-b896-4a741150f7ae.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710839110277",
    "item": "Super floor-glue remover (for removing tough adhesive residues)",
    "brand": "Alabastine (AkzoNobel)",
    "model": "Super Vloerlijmafbijt",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/796cd24d-b7dd-4e26-84b4-32c702e7be5c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8716242902096",
    "item": "Interior wood lacquer (high gloss)",
    "brand": "Sigma Coatings",
    "model": "Houtlak / Laque Interieur – Hoogglans (Brillant)",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a004d8ec-27c9-424c-87e4-4cb54a209bda.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113911818",
    "item": "Interior wall paint (tint base)",
    "brand": "SPS",
    "model": "Collections Muurverf – Basis 00",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/7bb8795b-0fa5-4c0c-98d8-0a6b001b1bcd.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "7711154704968",
    "item": "Flexa Interior wall paint (tint base)",
    "brand": "AkzoNobel",
    "model": "Collections Muurverf – Basis W00/W05",
    "category": "Paint",
    "type": "Consumable",
    "qty": 3,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/d866de13-265f-4db0-87ed-b081e409b5dc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "00464404",
    "item": "Wood lacquer / wood varnish (White)",
    "brand": "Histor",
    "model": "Houtlak (Perfect Finish) – White",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/7026edfa-1c36-41e0-a3ec-afb5983c70b0.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113911436",
    "item": "Water-based 2-in-1 gloss paint (Black)",
    "brand": "Spectrum",
    "model": "2-in-1 Gloss Paint (primer + finish), Black",
    "category": "Paint",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/6dcf4a63-56e8-41f3-bc8c-982fa4a3cd7b.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710259020187",
    "item": "Chrome effect decorative spray paint (Gold)",
    "brand": "Chrome",
    "model": "Deco Spray – Gold, 200 ml",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/713d3caf-12f0-4e92-a717-72a816d7f925.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710259020118",
    "item": "Chrome effect decorative spray paint (Silver)",
    "brand": "Chrome",
    "model": "Deco Spray – Silver, 200 ml",
    "category": "Spray",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/17caae03-b900-4cf0-9932-4858cb729348.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8716242888192",
    "item": "Rambo, Clear protective varnish (wood)",
    "brand": "Rambo",
    "model": "Pantser Vernis – Colorless (Kleurloos 0000), Satin",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/33ca3473-f355-4e5c-bbd8-2d048840abb3.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711297466623",
    "item": "Clear Primer / Sealer (Interior)",
    "brand": "OK",
    "model": "Voorstrijk Transparant (2.5L)",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e07d9c6b-d45b-4e2d-9f5e-604d4bdedbaf.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "2329747298098",
    "item": "Meister Polar – Wit Plus. Wall/ceiling paint (“muurverf”)",
    "brand": "Hornbach",
    "model": "1L",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/1937090c-5294-407e-a822-81a93e6ee9fb.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4004014972328",
    "item": "2-in-1 Wood Paint (primer + topcoat in one), Urban Green",
    "brand": "Spectrum",
    "model": "Urban Green, Water-based, Matte",
    "category": "Paint",
    "type": "Consumable",
    "qty": 4,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/eea9c671-65e4-4a2f-9367-ca462a1c793d.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247019459",
    "item": "Zijdeglanslak (satin/gloss “lacquer” paint), 1L",
    "brand": "OK",
    "model": "1L, about ±16 m² (per coat, depending on surface)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/66f3e759-cca6-4119-a35c-1ce78d2361f4.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113911399",
    "item": "2-in-1 Satin paint (primer + finish in one), Water-based (low odour, quick dry)",
    "brand": "Spectrum",
    "model": "RAL 9010 (a common “pure/bright white”)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 5,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/cc12c8e7-523d-450b-a6fe-79288d9d8499.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711577000721",
    "item": "Vloeibare was naturel (natural liquid wax)",
    "brand": "HG",
    "model": "Parket & Hout – Vloeibare Was Naturel, product 65,",
    "category": "Floor Care/Wood & Parquet Wax",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/cd38b96b-bebc-474a-a3d4-12ab4dbe2ea0.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "3418081887774",
    "item": "Acrylic paint (tube), Titanium White",
    "brand": "Van Bleiswijck Holland",
    "model": "Acrylic — Titanium White No. 81",
    "category": "Paint",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/b4755275-248e-4007-a160-b37f9c7e2556.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5011867025407",
    "item": "Metaallak (Direct over Roest) = metal paint you can apply directly over rust",
    "brand": "Hammerite",
    "model": "Standgroen (S038), Finish: Hoogglans (high gloss)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8f4a138a-9733-48ee-b76b-f178bc5170ce.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5411183196285",
    "item": "Roof Repair – Bitumen (Black) (roof/leak sealant)",
    "brand": "TCX",
    "model": "Roof Repair – Bitumen Black, 290 ml",
    "category": "Sealant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a23497ae-44d4-41f3-a49a-ca6f01271325.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "2117144970705",
    "item": "Easy to Clean Wallpaint (washable wall paint)",
    "brand": "Spectrum",
    "model": "RAL 9010 (a warm/off-white)",
    "category": "Paint",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e32588de-f1ca-4f4d-9752-34e7a9434845.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113127585",
    "item": "Decking & terrace oil (for Bangkirai / hardwood)",
    "brand": "CetaBever",
    "model": "Tuin Vlonder & Terras Bangkirai Olie (Blank — tran",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/2774d5bb-df53-4757-bfe6-0c6f7b133263.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8717853121265",
    "item": "Pure Tung Oil (Special)",
    "brand": "ACQ",
    "model": "Specials – Pure Tung Oil, 250 m",
    "category": "Wood Oil/Finish",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/9a15f345-9139-43a5-b901-bf0d4f9bb7f8.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8714181480996",
    "item": "Acrylic paint (black)",
    "brand": "Van Bleiswijck Holland (ACTION)",
    "model": "Acrylic — Black No. 99",
    "category": "Paint",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/439e9eb4-6d74-49c4-89cb-97ee529b0133.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8716462006130",
    "item": "Rolith Professional",
    "brand": "Rolith (Rolith Professional)",
    "model": "RB1 (Kalk- en cementsluierverwijderaar) — 1000 ml",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/af3b9e7e-421f-4277-9bda-2a546a36a6fa.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711347243600",
    "item": "Decorative effect spray paint (bronze look)",
    "brand": "MOTIP",
    "model": "Effect – Bronze (spray paint)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/98220116-597d-4169-8256-9fa37502467f.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247026747",
    "item": "Binnenbeits (interior wood stain), transparent, color Donker Eiken (Dark Oak).",
    "brand": "GAMMA",
    "model": "",
    "category": "Wood Stain",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8a6c2639-9900-46f4-b73a-0929eba5d3ce.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247869191",
    "item": "OK Spuitlak Hoogglans (spray lacquer/paint, high gloss), 400 ml",
    "brand": "Ok",
    "model": "",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/f784f086-6f17-4eb6-a652-109eac2a4d4d.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8715743013195",
    "item": "Rust-Oleum CombiColor Original Spray Paint (Gloss), RAL 9006",
    "brand": "Rust-Oleum",
    "model": "Color: White aluminium / silver-grey(metallic)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/87630ab2-2c85-4eae-af5a-c6c3f2a69f2b.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5011867042862",
    "item": "Radiator Paint (spray) — High Gloss, White",
    "brand": "Hammerite (AkzoNobel)",
    "model": "Radiatorlak (spray paint)",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/244d5674-4774-46b9-8fb2-508c28b6d0d7.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711595189842",
    "item": "Paint Stripper Spray",
    "brand": "Den Braven (Zwaluw",
    "model": "Afbijtspray — P6118 Maintenance",
    "category": "Paint Remover",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/3afad790-94b7-4090-b401-22654e647e22.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710259022259",
    "item": "Spectrum Clear Varnish (Matte) – Spray",
    "brand": "SPECTRUM",
    "model": "Clear Varnish Matt — spray paint",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ea55eba3-962c-4ca8-b1b7-4585a5b3001c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "9718577000477",
    "item": "HG Mold Remover / Mold Cleaner",
    "brand": "HG",
    "model": "Schimmel Reiniger (Bathroom) — spray bottle 500 ml",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/b4e5b306-f68f-42b6-8ce6-376cc483e274.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718951545267",
    "item": "Ajax All-Purpose Cleaner (Floor Cleaner) – Energizing Freshness (Lime & White Tea)",
    "brand": "AJAX",
    "model": "",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/afdb2e24-4316-478e-aab2-4c0a7ccb05b4.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5410091325879",
    "item": "Pattex Wood Glue Waterproof (D3)",
    "brand": "Pattex (Henkel)",
    "model": "",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/c0b5ee83-6efa-4e54-bca8-d12f15898cb8.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8719992551163",
    "item": "Super Degreaser",
    "brand": "Airolube",
    "model": "Super Degreaser — spray bottle 500 ml",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/0eb788fc-a4e8-4fd0-8637-056e91619388.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710259022938",
    "item": "Primer spray paint (spray primer)",
    "brand": "SPECTRUM",
    "model": "Primer spray paint — matt, grey",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/338f348b-5b6e-4e49-9bbc-14c5efb67a99.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711577308728",
    "item": "Mold Protector (anti-mould protective spray)",
    "brand": "HG",
    "model": "",
    "category": "Spray",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/1fa50bb8-6cce-4a2f-b55f-8cb6a2cfdecc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711577000417",
    "item": "Mould Cleaner / Mold Remover (for damp & weather stains)",
    "brand": "HG",
    "model": "",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ff7a1486-cbd5-4efb-891d-6c8fd9da9fb5.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711577190088",
    "item": "Insect Remover (insect stain remover / bug remover for vehicles)",
    "brand": "HG",
    "model": "Insecten Verwijderaar / Décol Insectes, spray bott",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/b7e33413-7635-42d9-bce0-b22e4bc93ed3.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "7242029411815",
    "item": "Clear Varnish (for wood)",
    "brand": "SPECTRUM",
    "model": "",
    "category": "Paint",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e990a9d4-62a6-403b-a528-412816806305.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711113911443",
    "item": "2-in-1 Matt Paint (primer + topcoat in one)",
    "brand": "SPECTRUM",
    "model": "",
    "category": "Paint",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/7dcae10f-fa1d-4ae3-884b-11f2be710094.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711613875474",
    "item": "concealed cabinet hinge with spring",
    "brand": "HANDSON",
    "model": "",
    "category": "Door/Hardware",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fea84959-b21b-446a-b0a2-d49853d043fc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "9002843412867",
    "item": "cabinet/door handle (pull handle)",
    "brand": "SIRO",
    "model": "",
    "category": "Door/Hardware",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/eb6cd903-c890-4af8-ac88-20a836d52afe.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "88785127A00000050",
    "item": "Big roller wheels",
    "brand": "",
    "model": "",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 8,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/abcbb4a1-30d0-4ab9-88bf-bb01aa30351e.jpg",
    "serialNo": "8 big roller wheels",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4042448885029",
    "item": "Tesa Protect, Furniture felt pads / floor protectors (round), extra strong (12 pcs)",
    "brand": "TESA",
    "model": "tesa Protect – Ø 22 mm, black, 12x",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/69c28872-de31-436f-b62b-bac62d3eef85.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247000006",
    "item": "self-adhesive furniture felt pads (48 pcs), white.",
    "brand": "Handson",
    "model": "Meubelvilt zelfklevend wit (48 stuks)",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/37452b0f-06dc-4d8e-bd63-7b3adccfe4e7.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247795988",
    "item": "M5 Rampa nuts / threaded insert nuts (zinc-plated).",
    "brand": "Gamma",
    "model": "M5 Rampamoer, verzinkt (galvanized), 10x",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a26aa9be-14d3-448e-81a6-a477819d6a86.jpg",
    "serialNo": "7 Screws",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718848229751",
    "item": "Broom holder clamp (size M), white.",
    "brand": "Duraline ",
    "model": "",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 8,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/0a075ea5-983f-43e1-8a5a-cac568b07dbc.jpg",
    "serialNo": "8 clamps",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8715342043913",
    "item": "Plate-mounted swivel caster set (4 pcs)",
    "brand": "Dayes",
    "model": "",
    "category": "Furniture and fixtures",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/58dac46f-104a-44db-bfc4-749a20f0127a.jpg",
    "serialNo": "4 roller wheels (4 Spare Wheels)",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8712259060057",
    "item": "conduit junction box (5/8\")",
    "brand": "",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 7,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/1e89d94a-6ac3-4b09-8a3a-58e5b3a47bec.jpg",
    "serialNo": "6 Pieces",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4008224669016",
    "item": "Cable trunking end piece ",
    "brand": "Heinrich Kopp",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e3526ed1-4de0-4c37-af35-3e816d010e76.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4008224605182",
    "item": "Empty junction box (89 × 43 mm) / inline splice box",
    "brand": "Heinrich Kopp",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e4ad0369-d832-4739-bc3a-a3641636900a.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8712507131461",
    "item": "IP65 waterproof junction box / weatherproof junction box).",
    "brand": "ABB",
    "model": "Kabeldoos 3665B (supplied with 4 cable glands/lock",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a9156510-441a-4b05-96d5-cd2105da3992.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8712259061825",
    "item": "ARTEMA AK1 junction box (IP40)",
    "brand": "ARTEMA",
    "model": "AK1 IP40",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/b4225770-c5bb-4800-afd8-ea47e177b624.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8712259061832",
    "item": "ARTEMA AK1 junction box (IP65)",
    "brand": "ARTEMA",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 3,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ae83e41d-a6c5-4758-952b-9f920a1af014.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247964841",
    "item": "GAMMA plug-in wall spotlight",
    "brand": "GAMMA (Verona)",
    "model": "GU10",
    "category": "Electrical",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fd8fd6d0-46b0-4493-9cd8-0612afe906a2.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711297078239",
    "item": "Handson LED spotlight bulb (GU5.3 / MR16)",
    "brand": "Handson",
    "model": "LED GU5.3, 3W (≈20W), 207 lm, dimmable",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/bab58125-630c-45a8-9112-d10d5ba3d884.jpg",
    "serialNo": "1 Bulb",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5999570717805",
    "item": "Modee LED Spot MR16 bulb",
    "brand": "modee (smart lighting)",
    "model": "LED Spot MR16, 2700K warm white",
    "category": "Electrical",
    "type": "Tool",
    "qty": 4,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/27e962c7-effb-472a-8406-485f2e4143b7.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718699762490",
    "item": "Philips LED E27 bulb, Cool White",
    "brand": "Philips",
    "model": "LED E27, EyeComfort, 4000K cool white, 4.5W, 470 l",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/0c6adea2-7165-4f00-9551-9c75b34484da.jpg",
    "serialNo": "1 bulb",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4306517566760",
    "item": "FLAIR LED A67 (E27) dimmable bulb.",
    "brand": "FLAIR",
    "model": "LED A67 / E27, 2700K warm white, 11W, 1521 lm, 220",
    "category": "Electrical",
    "type": "Tool",
    "qty": 3,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/a8c45ccb-3f04-4b44-878d-bf0148cd8f54.jpg",
    "serialNo": "2 bulbs",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8720707000234",
    "item": "Ledvion LED dimmer.",
    "brand": "",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 4,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/fabe88c6-3f47-46e3-bc7c-ae651fb1c82b.jpg",
    "serialNo": "1 Led Dimmer",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5059303002377",
    "item": "Wessex Electrical GU10 LED spotlight bulb (multi-pack)",
    "brand": "Wessex Electrical",
    "model": "LED GU10, 2700K, 3.6W (≈50W), 345 lm",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/9b46c1c0-8377-4c45-b9f0-a1dd3eba9490.jpg",
    "serialNo": "2 bulbs",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "22000873",
    "item": "Cable TV Connection",
    "brand": "Technetix",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/39066dc8-f773-492a-b297-60e6c1b32f4c.jpg",
    "serialNo": "3 Items",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4008224186469",
    "item": "AP-Standard double switch, Arctic White.",
    "brand": "Heinrich Kopp GmbH",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ab1d7a39-5278-466a-96f5-d234afc9e511.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4008224186483",
    "item": "Kopp (Heinrich Kopp GmbH) AP-Standard cross switch, Arctic White.",
    "brand": "Heinrich Kopp GmbH",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/ff68b602-1476-455e-b926-85a680b23d13.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5410288292298",
    "item": "RefLED Superia Retro MR16, LED reflector/spot bulb (MR16 style), daylight",
    "brand": "Sylvania",
    "model": "LED GU5.3, 12V AC/DC, 4.3W (≈35W), 380 lm, 36°, 65",
    "category": "Electrical",
    "type": "Tool",
    "qty": 3,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/e935f12c-4757-4405-832c-ae7b61ab4882.jpg",
    "serialNo": "1 bulb",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "88785127A0000050",
    "item": "Paper tape",
    "brand": "",
    "model": "",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/03f05907-7975-477d-9259-5eb8dc2f4709.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247788652",
    "item": "white surface-mounted two-way / single-pole light switch.",
    "brand": "",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 4,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/bbc0868c-161e-4f0f-bc3f-b7ed8c5167cc.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "88785127A0000003",
    "item": "Paper tape",
    "brand": "",
    "model": "",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/847b5ee4-14dc-479b-8043-a77a18ea3524.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4058408121633",
    "item": "IKEA SOLHETTA LED bulb set (3 pieces).",
    "brand": "IKEA",
    "model": "SOLHETTA LED, 2W, 230 lm (≈35W equivalent), energy",
    "category": "Electrical",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/c08c03f7-a4e9-448d-bc9a-989a2c42362d.jpg",
    "serialNo": "3 bulbs",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718739073913",
    "item": "Special PL compact fluorescent lamp",
    "brand": "",
    "model": "11W, 830 (warm white), CRI >80, 8000 hours",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/cfdbac6c-fa9c-4768-bb21-dbfb8e53fc16.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "88785127A0000026",
    "item": "Light ",
    "brand": "OSRAM",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 2,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/79410a63-2f02-4fe9-89b9-ad4338124382.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "05035700",
    "item": "OSRAM DULUX S 11W",
    "brand": "OSRAM",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/afc89152-d9bc-4d40-af00-71181b70d3fd.jpg",
    "serialNo": "1 Item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4050300437545",
    "item": "OSRAM Powerstar HQI-TS 150W/ND (Daylight) metal halide lamp.",
    "brand": "OSRAM",
    "model": "Powerstar HQI-TS, 150W/D (Daylight)",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/923cf529-d696-4279-94ef-d432e9a55eee.jpg",
    "serialNo": "1 item",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710439123349",
    "item": "HARD PVC GLUE 100ml",
    "brand": "BISON",
    "model": "",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 3,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/861c8a41-e8f4-4f37-b84c-4a7a6665ab7c.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "3838895000068",
    "item": "ETI DII 16A gG 500V fuse links (5-pack)",
    "brand": "ETI",
    "model": "DII, gG, 16A, 500V (Art. 0023124005)",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/09e751a8-de96-430d-92f2-ca16a12ca3f3.jpg",
    "serialNo": "5 Items",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247039235",
    "item": " holder (pendant fitting) with lead/connector (3 pcs).",
    "brand": "",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/cd7fb362-6d34-47a9-a77a-e7ee81f8c4fb.jpg",
    "serialNo": "2 items",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247153368",
    "item": "HandsOn Spray Adhesive (Spray Glue).",
    "brand": "",
    "model": "Handson",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/33619004-b7b9-4edd-a63b-6ed208027083.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "4100420018169",
    "item": "Rapid Cleaner",
    "brand": "LIQUI MOLY",
    "model": "Schnell-Reiniger",
    "category": "Cleaner",
    "type": "Consumable",
    "qty": 2,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/0a172d5e-5965-4a00-843f-ccd0cee0d279.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710128030040",
    "item": "MP LITHEP GREASE EP2, Multi-purpose lithium grease (cartridge)",
    "brand": "KROON OIL",
    "model": "MP Lithep Grease EP2",
    "category": "Lubricant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/799d6fbe-4bad-4b5b-9ad5-e337ebd5dd17.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "80287989",
    "item": "IKEA LEDARE LED bulb, LED reflector bulb, warm white",
    "brand": "IKEA",
    "model": "E14 LED, 200 lm, 3.6W, 2700K",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/cb2b2866-8644-430c-8c87-c476dc9227c5.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "5032227310353",
    "item": "WD-40 Multi-purpose lubricant / penetrating oil spray",
    "brand": "WD-40",
    "model": "WD-40 Multi-Use (spray), 150 ml",
    "category": "Lubricant",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/c2324292-eb2f-4b77-bc85-ede7f2c9d553.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "11782186",
    "item": "Grouting Mortar Additive",
    "brand": "Handson",
    "model": "Voegmiddel / Mortier de jointoyage (for wand- en v",
    "category": "Tiling materials",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/bd5545ce-2e7e-4470-b508-e5b6b9619759.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "88785127",
    "item": "square white ceiling plate (113 × 113 mm).",
    "brand": "Zanza (Hama)",
    "model": "",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/adee06b8-d6f5-4c15-921c-d342adfb573f.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8718964200641",
    "item": "LSC Efficient LED – E14 – 3000K Warm White – 470 lumen – 3.4W (3 bulbs).",
    "brand": "LSC - Efficient Led",
    "model": "LSC Efficient LED E14, 3.4W, 470 lumen, 360°",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/67bd73f5-5143-4ba2-8d1d-b38189714de1.jpg",
    "serialNo": "3 bulbs",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "322298208361",
    "item": "LED Warm White— 2700K",
    "brand": "Philips",
    "model": "Philips LED G4, 1W (≈10W), 100 lumen, 12V AC (elec",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/1d6c389d-8393-4515-8f58-0be4583a29a1.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8711247169277",
    "item": "HANDSON LED – G4 – dimmable – 2W (≈21W) – 200 lumen – helder wit (3000K) – 12V.",
    "brand": "Handson",
    "model": "G4 LED capsule, 2W (≈21W equivalent)",
    "category": "Electrical",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/5f66211f-c088-41b2-84dd-581f873672f1.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "B085T6C9V5",
    "item": "Locked door hasp silver 3 inch (2 pack)",
    "brand": "",
    "model": "X002HMFQXB",
    "category": "Door/Hardware",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/8660315d-e273-4adf-8f22-ad1bf85c216d.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "02820118",
    "item": "Surface-mounted cross switch, Arctic White.",
    "brand": "",
    "model": "",
    "category": "Equipment",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/67181979-552f-4489-a029-895d9d915586.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "8710439123363",
    "item": "Hard PVC Glue (250 ML)",
    "brand": "Bison",
    "model": "Hard PVC-Lijm (French: Colle PVC Rigide) – with br",
    "category": "Adhesive",
    "type": "Consumable",
    "qty": 1,
    "status": "",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/be112749-aa42-480b-a2cb-44463a3719ad.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  },
  {
    "id": "6935364072391",
    "item": "Gigabit VPN gateway (network router/firewall)",
    "brand": "TP-Link (Omada)",
    "model": "ER7206 (Omada Gigabit VPN Gateway)",
    "category": "Networking equipment (router/VPN gateway)",
    "type": "Tool",
    "qty": 1,
    "status": "Available",
    "cabinet": "",
    "shelf": "",
    "photoUrl": "https://www.assettiger.com/xp2/MAT/144549/Gallery/4ecded6e-a72e-48ca-92d9-6f291f1af94f.jpg",
    "serialNo": "",
    "checkedOutBy": null,
    "checkedOutAt": null
  }
];

const INITIAL_USERS = [
  { name: "Samuel", role: "Warehouse Manager / Admin", active: true },
  { name: "Timotheos", role: "Group Leader", active: true },
  { name: "MOG Stavros", role: "Department Leader", active: true },
  { name: "Nikos", role: "Group Leader", active: true },
  { name: "Davide", role: "Group Leader", active: true },
  { name: "Orlando", role: "Maintenance", active: true },
  { name: "MOG George", role: "Department Leader", active: true },
  { name: "MOG Giannis", role: "Department Leader", active: true },
  { name: "MOG Harry", role: "Overseer", active: true },
  ];

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const today = () => new Date().toISOString().slice(0, 10);

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
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <span style={S.multiSelectArrow}>{isOpen ? "▲" : "▼"}</span>
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
        <span style={S.searchSelectArrow}>{isOpen ? "▲" : "▼"}</span>
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
        <div style={S.loginSub}>CCOAN — Almere</div>
        
        {IS_DEMO && (
          <div style={S.demoInfo}>
            <strong>Demo Mode</strong><br/>
            Test Credentials:<br/>
            Sammy / 1234 • Peter / 5678<br/>
            John / 9012 • David / 7890
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
            {loading ? "Logging in..." : "🔓 Login"}
          </button>
        </form>
        
        <div style={S.loginFooter}>
          Secure Access • V4 Enhanced
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
          <button onClick={onClose} style={S.modalX}>✕</button>
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
    const savedUser = sessionStorage.getItem("warehouseUser");
    const savedRole = sessionStorage.getItem("warehouseUserRole");
    if (savedUser) {
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
        
        sessionStorage.setItem("warehouseUser", userName);
        sessionStorage.setItem("warehouseUserRole", role);
        setCurrentUser(userName);
        setCurrentUserRole(role);
        setIsLoggedIn(true);
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
          sessionStorage.setItem("warehouseUser", userName);
          sessionStorage.setItem("warehouseUserRole", result.role || "");
          setCurrentUser(userName);
          setCurrentUserRole(result.role || "");
          setIsLoggedIn(true);
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
    sessionStorage.removeItem("warehouseUser");
    sessionStorage.removeItem("warehouseUserRole");
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
  const [view, setView] = useState("dashboard");
  
  // Load from localStorage or use initial data
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('warehouseInventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('warehouseUsers');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
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
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const barcodeIntervalRef = useRef(null);

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

  const activeUsers = users.filter(u => u.active);

  // V4: Barcode Scanning Functions
  const startBarcodeScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      flash("Camera not available. Try using HTTPS or testing on desktop (localhost).", "error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScannerActive(true);
        
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });
          detectBarcode(barcodeDetector);
        } else {
          flash("Barcode detection not supported on this browser. Try Chrome or Edge.", "error");
          stopBarcodeScanner();
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError') {
        flash("Camera permission denied. Please allow camera access in browser settings.", "error");
      } else if (err.name === 'NotFoundError') {
        flash("No camera found on this device.", "error");
      } else {
        flash("Camera access failed: " + err.message, "error");
      }
      setScannerActive(false);
    }
  };

  const detectBarcode = async (detector) => {
    if (!scannerActive || !videoRef.current) return;
    
    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        setScannedBarcode(barcode);
        setNi(prev => ({ ...prev, id: barcode }));
        stopBarcodeScanner();
        flash(`Barcode scanned: ${barcode}`);
        return;
      }
    } catch (err) {
      console.error("Barcode detection error:", err);
    }
    
    barcodeIntervalRef.current = setTimeout(() => detectBarcode(detector), 200);
  };

  const stopBarcodeScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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
        setInventory(p => p.map(i => 
          i.id === itemId 
            ? { ...i, status: "Checked Out", checkedOutBy: formUser.trim(), checkedOutAt: now() }
            : i
        ));
        setLog(p => [{ 
          timestamp: now(), 
          user: formUser.trim(), 
          action: "checkout", 
          itemId: it.id, 
          itemName: it.item, 
          qty: 1, 
          notes: formNotes.trim(), 
          location: `${it.cabinet}-${it.shelf}` 
        }, ...p]);
        successCount++;
      } else if (formAction === "return") {
        setInventory(p => p.map(i => 
          i.id === itemId 
            ? { ...i, status: "Available", checkedOutBy: null, checkedOutAt: null }
            : i
        ));
        setLog(p => [{ 
          timestamp: now(), 
          user: formUser.trim(), 
          action: "return", 
          itemId: it.id, 
          itemName: it.item, 
          qty: 1, 
          notes: formNotes.trim(), 
          location: `${it.cabinet}-${it.shelf}` 
        }, ...p]);
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
    flash(`Access logged for ${accessUser.trim()}`);
    setAccessPurpose("");
  };

  const doAddItem = () => {
    if (!ni.id.trim() || !ni.item.trim()) return flash("ID and item name required", "error");
    if (inventory.find(i => i.id === ni.id.trim())) return flash("Item ID already exists", "error");
    setInventory(p => [...p, { ...ni, id: ni.id.trim(), item: ni.item.trim(), status: "Available", checkedOutBy: null, checkedOutAt: null }]);
    setLog(p => [{ timestamp: now(), user: currentUser, action: "added", itemId: ni.id.trim(), itemName: ni.item.trim(), qty: ni.qty, notes: `New item. Brand: ${ni.brand || "none"}. Model: ${ni.model || "none"}. Photo: ${ni.photoUrl || "none"}. Barcode: ${scannedBarcode || "none"}`, location: (ni.cabinet || ni.shelf) ? `${ni.cabinet}-${ni.shelf}` : "No location" }, ...p]);
    flash(`${ni.item.trim()} added successfully!`);
    
    setNi({ id: "", item: "", brand: "", model: "", serialNo: "", category: "Equipment", type: "Tool", cabinet: "", shelf: "", qty: 1, photoUrl: "" });
    setPhotoPreview("");
    setPhotoFile(null);
    setScannedBarcode("");
    setAddItemModal(false);
  };

  const doDeleteItem = (id) => {
    const it = inventory.find(i => i.id === id);
    setInventory(p => p.filter(i => i.id !== id));
    setLog(p => [{ timestamp: now(), user: currentUser, action: "deleted", itemId: id, itemName: it?.item || id, qty: 0, notes: "Removed", location: "" }, ...p]);
    flash(`${it?.item || id} removed`);
    setConfirmDel(null);
  };

  const doAddUser = () => {
    if (!nu.name.trim()) return flash("Name required", "error");
    if (!nu.pin.trim() || nu.pin.length !== 4) return flash("4-digit PIN required", "error");
    if (users.find(u => u.name.toLowerCase() === nu.name.trim().toLowerCase())) return flash("User exists", "error");
    setUsers(p => [...p, { name: nu.name.trim(), role: nu.role, pin: nu.pin, active: true }]);
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
    flash(`${item.item} restocked: +${restockQty} units`);
    setRestockQty(1);
    setRestockModal(null);
  };

  const doScan = () => {
    const code = scanInput.trim().toUpperCase();
    const it = inventory.find(i => i.id.toUpperCase() === code);
    if (it) { 
      setFormItems([it.id]); 
      setScanModal(false); 
      setScanInput(""); 
      flash(`Found: ${it.item}`); 
    }
    else flash(`No item with code "${code}"`, "error");
  };

  // Filters
  const filteredInv = inventory.filter(i => {
    const cab = filterCab === "All" || i.cabinet === filterCab;
    const s = !search || [i.item, i.id, i.category].some(f => f.toLowerCase().includes(search.toLowerCase()));
    return cab && s;
  });
  const checkedOut = inventory.filter(i => i.status === "Checked Out");
  const filteredLog = log.filter(l => !logFilter || [l.user, l.itemName, l.action].some(f => f.toLowerCase().includes(logFilter.toLowerCase())));

  // Prepare options for multi-select
  const toolOptions = inventory
    .filter(i => !["Chemicals", "Hardware Bins"].includes(i.category))
    .filter(i => formAction === "checkout" ? i.status === "Available" : i.status === "Checked Out")
    .map(i => ({
      id: i.id,
      label: `[${i.id}] ${i.item}`,
      shortLabel: i.id
    }));

  const consumableOptions = inventory
    .filter(i => ["Chemicals", "Hardware Bins"].includes(i.category))
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
    { key: "dashboard", label: "Dashboard", icon: "⊞" },
    { key: "checkout", label: "Check Out / Return", icon: "⇄" },
    { key: "consumables", label: "Consumables", icon: "▼" },
    { key: "access", label: "Access Log", icon: "🔑" },
    { key: "inventory", label: "Inventory", icon: "☰" },
    { key: "users", label: "Users", icon: "👤" },
    { key: "history", label: "Activity Log", icon: "📋" },
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handlePhotoCapture}
        style={{ display: "none" }}
      />

      {toast && <div style={{ ...S.toast, background: toast.type === "error" ? C.red : C.green }}>{toast.msg}</div>}

      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logoRow}>
            <img src={CCOAN_LOGO_WHITE} alt="CCOAN" style={S.logoImg} onError={e => { e.target.style.display = "none"; }} />
            <div>
              <div style={S.headerTitle}>WAREHOUSE TRACKER</div>
              <div style={S.headerSub}>CCOAN — Almere</div>
            </div>
          </div>
          <div style={S.headerRight}>
            <span style={S.userBadge}>👤 {currentUser} {currentUserRole && `(${currentUserRole})`}</span>
            {IS_DEMO && <span style={S.demoBadge}>DEMO</span>}
            <button onClick={onLogout} style={S.logoutBtn} title="Logout">🔓</button>
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
          <div style={S.statsGrid}>
            {[
              { n: inventory.length, l: "Total Items", c: C.accent },
              { n: inventory.filter(i => i.status === "Available").length, l: "Available", c: C.green },
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
                  <td style={S.td}>{i.item}</td><td style={S.td}><code style={S.code}>{i.id}</code></td>
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
                  <td style={S.td}>{l.itemName}</td><td style={S.td}>{l.notes || "—"}</td>
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
                <label style={S.lbl}>Action *</label>
                <div style={S.tRow}>
                  <button onClick={() => { setFormAction("checkout"); setFormItems([]); }}
                    style={{ ...S.tBtn, ...(formAction === "checkout" ? { background: C.red, color: "#fff", borderColor: C.red } : {}) }}>
                    ↗ CHECK OUT
                  </button>
                  <button onClick={() => { setFormAction("return"); setFormItems([]); }}
                    style={{ ...S.tBtn, ...(formAction === "return" ? { background: C.green, color: "#fff", borderColor: C.green } : {}) }}>
                    ↙ RETURN
                  </button>
                </div>
              </div>
            </div>
            
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
                <button onClick={() => setScanModal(true)} style={S.scanBtn} title="Scan QR">📷</button>
              </div>
            </div>
            
            <div style={S.f}>
              <label style={S.lbl}>Notes (optional)</label>
              <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="e.g. Bathroom repair, Room 201" style={S.inp}/>
            </div>
            
            <button onClick={doMultiTransaction} style={{ ...S.pBtn, background: formAction === "checkout" ? C.red : C.green }}>
              {formAction === "checkout" ? "⬆ Confirm Check Out" : "⬇ Confirm Return"} ({formItems.length} item{formItems.length !== 1 ? 's' : ''})
            </button>
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
                  <button onClick={() => setScanModal(true)} style={S.scanBtn}>📷</button>
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
              ▼ Log Consumable Usage ({consumableItems.length} item{consumableItems.length !== 1 ? 's' : ''})
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
            <button onClick={doAccess} style={S.pBtn}>🔑 Log Warehouse Entry</button>
          </div>
          <div style={{ ...S.card, marginTop: 20 }}><h3 style={S.cardT}>Access History</h3>
            {accessLog.length === 0 ? <p style={S.empty}>No access entries yet.</p> : (
              <div style={S.tw}><table style={S.tbl}><thead><tr>
                <th style={S.th}>Date</th><th style={S.th}>Time</th><th style={S.th}>Person</th><th style={S.th}>Purpose</th>
              </tr></thead><tbody>
                {accessLog.map((a, i) => <tr key={i}>
                  <td style={S.td}>{a.date}</td><td style={S.td}>{a.timestamp}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{a.user}</td><td style={S.td}>{a.purpose}</td>
                </tr>)}
              </tbody></table></div>
            )}
          </div>
        </div>)}

        {/* ---- INVENTORY ---- */}
        {view === "inventory" && (<div>
          <div style={S.titleRow}>
            <h2 style={{ ...S.pageTitle, marginBottom: 0 }}>Inventory</h2>
            <button onClick={() => setAddItemModal(true)} style={S.pBtn}>+ Add Item</button>
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
            <th style={S.th}>Code</th><th style={S.th}>Item</th><th style={S.th}>Brand</th><th style={S.th}>Model</th><th style={S.th}>Category</th><th style={S.th}>Location</th>
            <th style={S.th}>Qty</th><th style={S.th}>Status</th><th style={S.th}>Photo</th><th style={S.th}>Held By</th><th style={S.th}>Actions</th>
          </tr></thead><tbody>
            {filteredInv.map(i => (
              <tr key={i.id} style={i.status === "Checked Out" ? { background: C.redDim } : i.qty === 0 ? { background: C.orangeDim } : {}}>
                <td style={S.td}><code style={S.code}>{i.id}</code></td>
                <td style={{ ...S.td, fontWeight: 500 }}>{i.item}</td>
                <td style={S.td}>{i.brand || "—"}</td>
                <td style={S.td}>{i.model || "—"}</td>
                <td style={S.td}>{i.category}</td>
                <td style={S.td}>{i.cabinet && i.shelf ? `${i.cabinet} / ${i.shelf}` : i.cabinet || i.shelf || "—"}</td>
                <td style={S.td}>{i.qty}</td>
                <td style={S.td}><SBadge status={i.status} qty={i.qty}/></td>
                <td style={S.td}>
                  {i.photoUrl
                    ? <a href={i.photoUrl} target="_blank" rel="noopener noreferrer" style={S.photoLnk}>📸 View</a>
                    : <button onClick={() => { setPhotoModal(i.id); setPhotoUrl(""); }} style={S.lnkBtn}>+ Photo</button>}
                </td>
                <td style={S.td}>{i.checkedOutBy || "—"}</td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <button onClick={() => { setPhotoModal(i.id); setPhotoUrl(i.photoUrl || ""); }} style={S.tiny} title="Photo">📷</button>
                    {["Chemicals", "Hardware Bins", "Kits"].includes(i.category) && (
                      <button onClick={() => { setRestockModal(i.id); setRestockQty(1); }} style={{ ...S.tiny, color: C.green, borderColor: C.green }} title="Restock">+</button>
                    )}
                    <button onClick={() => setConfirmDel(i.id)} style={{ ...S.tiny, color: C.red }} title="Delete">✕</button>
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
            <button onClick={() => setAddUserModal(true)} style={S.pBtn}>+ Add User</button>
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
                    <button onClick={() => setUsers(p => p.map(x => x.name === u.name ? { ...x, active: !x.active } : x))} style={S.smBtn}>
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => { setUsers(p => p.filter(x => x.name !== u.name)); flash(`${u.name} removed`); }} style={{ ...S.smBtn, color: C.red, borderColor: C.red }}>Delete</button>
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
                <td style={S.td}>{l.qty}</td><td style={S.td}>{l.notes || "—"}</td>
              </tr>)}
            </tbody></table></div>
          )}
          <p style={S.foot}>{filteredLog.length} entries</p>
        </div>)}
      </main>

      <footer style={S.footer}>
        <img src={CCOAN_LOGO_WHITE} alt="" style={{ height: 18, opacity: 0.4 }} onError={e => { e.target.style.display = "none"; }}/>
        <span>CCOAN Warehouse Tracker</span>
        <span style={{ opacity: 0.25 }}>•</span>
        <span>V4 Enhanced • Logged in as {currentUser}</span>
      </footer>

      {/* ========== MODALS ========== */}

      {/* V4 ENHANCED: Add Item Modal with Barcode Scanner & Photo Upload */}
      <Modal open={addItemModal} onClose={() => { setAddItemModal(false); stopBarcodeScanner(); setPhotoPreview(""); setScannedBarcode(""); }} title="Add New Inventory Item" wide>
        <div style={S.mf}>
          
          {/* V4: Barcode Scanner Section */}
          <div style={{ ...S.scannerSection, marginBottom: 16 }}>
            <label style={S.lbl}>📷 Scan Product Barcode (Optional)</label>
            {!scannerActive ? (
              <button onClick={startBarcodeScanner} style={{ ...S.pBtn, background: C.brandBright }}>
                Start Barcode Scanner
              </button>
            ) : (
              <div>
                <div style={S.scannerContainer}>
                  <video ref={videoRef} autoPlay playsInline style={S.scannerVideo} />
                  <div style={S.scannerOverlay} />
                </div>
                <button onClick={stopBarcodeScanner} style={{ ...S.smBtn, marginTop: 8, color: C.red, borderColor: C.red }}>
                  Stop Scanner
                </button>
              </div>
            )}
            {scannedBarcode && (
              <p style={{ color: C.green, marginTop: 8, fontSize: 12 }}>
                ✓ Scanned: <strong>{scannedBarcode}</strong>
              </p>
            )}
          </div>

          <div style={S.mRow}>
            <div style={S.f}><label style={S.lbl}>Item ID / Code *</label>
              <input type="text" value={ni.id} onChange={e => setNi({ ...ni, id: e.target.value })} placeholder="e.g. 999999930 (or scan barcode)" style={S.inp}/>
              <span style={S.hint}>Asset Tag ID or barcode {scannedBarcode && "(Auto-filled from barcode)"}</span>
            </div>
            <div style={S.f}><label style={S.lbl}>Item Name *</label>
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
            <div style={S.f}><label style={S.lbl}>Cabinet (optional)</label>
              <input type="text" value={ni.cabinet} onChange={e => setNi({ ...ni, cabinet: e.target.value })} 
                placeholder="e.g. Main Warehouse, Storage Room 2" style={S.inp}/>
              <span style={S.hint}>Leave blank if item has no specific location</span>
            </div>
            <div style={S.f}><label style={S.lbl}>Shelf (optional)</label>
              <input type="text" value={ni.shelf} onChange={e => setNi({ ...ni, shelf: e.target.value })} 
                placeholder="e.g. Top Shelf, Rack 3" style={S.inp}/>
              <span style={S.hint}>Leave blank if not applicable</span>
            </div>
            <div style={S.f}><label style={S.lbl}>Category</label>
              <select value={ni.category} onChange={e => setNi({ ...ni, category: e.target.value, type: detectType(e.target.value) })} style={S.sel}>
                {["Adhesive","Cleaner","Door/Hardware","Electrical","Equipment","Filler & Putty","Floor Care/Wood & Parquet Wax","Furniture and fixtures","Lubricant","Networking equipment (router/VPN gateway)","Paint","Paint Remover","Sealant","Spray","Tiling materials","Wood Oil/Finish","Wood Stain"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={S.mRow}>
            <div style={S.f}><label style={S.lbl}>Quantity</label>
              <input type="number" min="1" value={ni.qty} onChange={e => setNi({ ...ni, qty: parseInt(e.target.value) || 1 })} style={S.inp}/>
            </div>
          </div>

          {/* V4: Photo Capture Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={S.lbl}>📸 Item Photo (Optional)</label>
            <button onClick={triggerPhotoCapture} disabled={uploadingPhoto} style={{ ...S.pBtn, background: uploadingPhoto ? C.textDim : C.brandBright }}>
              {uploadingPhoto ? "Uploading..." : "Take / Upload Photo"}
            </button>
            {photoPreview && (
              <div style={{ marginTop: 10 }}>
                <img src={photoPreview} alt="Preview" style={S.photoPreview} />
              </div>
            )}
            {ni.photoUrl && !uploadingPhoto && (
              <p style={{ color: C.green, fontSize: 12, marginTop: 8 }}>
                ✓ Photo uploaded: <a href={ni.photoUrl} target="_blank" rel="noopener noreferrer" style={S.photoLnk}>View</a>
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

      <Modal open={scanModal} onClose={() => setScanModal(false)} title="Scan or Enter Item Code">
        <div style={S.mf}>
          <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 14 }}>
            Scan the QR code or type the item code manually.
          </p>
          <div style={S.f}><label style={S.lbl}>Item Code</label>
            <input type="text" value={scanInput} onChange={e => setScanInput(e.target.value)}
              placeholder="e.g. A-T-01" style={{ ...S.inp, fontSize: 18, textAlign: "center", letterSpacing: 2 }}
              onKeyDown={e => e.key === "Enter" && doScan()} autoFocus/>
          </div>
          <button onClick={doScan} style={S.pBtn}>Look Up Item</button>
          <p style={{ color: C.textDim, fontSize: 11, marginTop: 10, textAlign: "center" }}>
            Tip: A QR scanner app can type the code directly into the field above.
          </p>
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
            <button onClick={doRestock} style={{ ...S.pBtn, background: C.green }}>✓ Restock</button>
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
