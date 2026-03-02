// ============================================================
// PGG Data — Products, Blog Posts, Infrastructure
// ============================================================

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  category: "Paper & Board" | "PP Packaging";
  tagline: string;
  gsmRange?: string;
  brands?: string[];
  variants?: string[];
  origin?: string;
  thickness?: string;
  surfaceResistivity?: string;
  features: string[];
  applications: string[];
  specsTable: ProductSpec[];
  exportCompliance: string[];
  certifications?: string[];
  image?: string;
  images?: string[];
}

export const products: Product[] = [
  // ——————————————————————————————————————————
  // 1. ITC FBB Boards
  // ——————————————————————————————————————————
  {
    slug: "itc-fbb-boards",
    name: "ITC FBB Boards",
    category: "Paper & Board",
    tagline: "Premium Folding Box Board for high-impact retail and pharma packaging",
    gsmRange: "230–400 GSM",
    brands: ["Cyber Oak", "Cyber XLPac", "PearlXL"],
    features: [
      "High stiffness for superior box integrity",
      "Superior caliper consistency across reels and sheets",
      "Excellent print reproduction — offset, digital, flexo",
      "FSC certified — responsibly sourced fibre",
      "Virgin fibre multi-ply construction",
      "Consistent brightness and whiteness levels",
      "Compatible with water-based and UV coatings",
      "Low moisture sensitivity for stable converting",
    ],
    applications: [
      "Pharma cartons (primary & secondary)",
      "FMCG retail packaging",
      "Cosmetics & personal care",
      "Food packaging (direct food contact compliant)",
      "Luxury gifting & premium folding cartons",
      "Consumer electronics cartons",
    ],
    specsTable: [
      { label: "GSM Range", value: "230 – 400 GSM" },
      { label: "Brightness (ISO)", value: "82 – 88 %" },
      { label: "Stiffness MD (mNm)", value: "As per ITC spec sheet" },
      { label: "Stiffness CD (mNm)", value: "As per ITC spec sheet" },
      { label: "Moisture Content", value: "7 – 9 %" },
      { label: "Available Brands", value: "Cyber Oak, Cyber XLPac, PearlXL" },
      { label: "Reel Width", value: "Up to 2500 mm (custom slit available)" },
      { label: "Sheet Sizes", value: "Standard & custom cut-to-size" },
    ],
    exportCompliance: [
      "FSC C064218 — Chain of Custody certified",
      "BIS IS 14927 compliant",
      "EU Food Contact compliant (Regulation EC 1935/2004)",
      "US FDA compliant for food-contact applications",
    ],
    certifications: ["FSC", "ISO 9001", "BRC"],
    images: [
      "/products/paper/fbb-board.jpg",
      "/products/paper/fbb-board-2.jpg",
      "/products/paper/fbb-board-3.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 2. Duplex Board
  // ——————————————————————————————————————————
  {
    slug: "duplex-board",
    name: "Duplex Board",
    category: "Paper & Board",
    tagline: "Cost-effective, multi-layer board for secondary packaging and retail display",
    gsmRange: "200–450 GSM",
    variants: [
      "Grey Back — Eco Supreme",
      "Grey Back — Eco Indigo",
      "White Back — Eco Polar",
    ],
    features: [
      "8-layer composition for superior bulk and stiffness",
      "Uniform coating for consistent ink absorption",
      "Cost-effective alternative to FBB for secondary packaging",
      "100% recyclable — circular economy compatible",
      "Good folding endurance with minimal cracking",
      "Available in grey back and white back variants",
      "Wide GSM range covers diverse application needs",
      "Consistent reel and sheet quality from BIS-certified mills",
    ],
    applications: [
      "Pharmaceutical secondary packaging",
      "Garments and hosiery packaging",
      "Industrial product packaging",
      "Retail shelf display packaging",
      "Stationery and book binding",
      "Game and toy packaging",
    ],
    specsTable: [
      { label: "GSM Range", value: "200 – 450 GSM" },
      { label: "Grey Back Variants", value: "Eco Supreme, Eco Indigo" },
      { label: "White Back Variant", value: "Eco Polar" },
      { label: "Top Surface", value: "Clay-coated white" },
      { label: "Back Surface", value: "Grey or white (uncoated)" },
      { label: "Moisture Content", value: "8 – 10 %" },
      { label: "Reel & Sheet", value: "Both available" },
      { label: "MOQ", value: "500 kg (reel or sheet)" },
    ],
    exportCompliance: [
      "BIS IS 1397 compliant",
      "REACH compliant — no restricted substances",
    ],
    images: [
      "/products/paper/duplex-board.jpg",
      "/products/paper/duplex-board-2.jpg",
      "/products/paper/duplex-board-3.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 3. Kraft Liner
  // ——————————————————————————————————————————
  {
    slug: "kraft-liner",
    name: "Kraft Liner Board",
    category: "Paper & Board",
    tagline: "Virgin fibre kraft liner for heavy-duty corrugated and industrial export packaging",
    gsmRange: "100–440 GSM",
    origin: "Imported (European & South American mills)",
    features: [
      "100% fresh/virgin fibre for maximum strength",
      "High Ring Crush Test (RCT) and Short Column Test (SCT) values",
      "Optimal runnability on high-speed corrugators",
      "Natural brown or bleached white surface options",
      "Excellent moisture resistance profile",
      "Consistent tensile strength MD and CD",
      "Low COD — environmentally responsible production",
      "Available in B/C/E flute configurations",
    ],
    applications: [
      "Heavy-duty corrugated box manufacturing",
      "E-commerce secondary packaging",
      "Industrial and machinery export packaging",
      "Agricultural produce export cartons",
      "Chemical and hazmat compliant outer packaging",
      "Master carton liners for FMCG",
    ],
    specsTable: [
      { label: "GSM Range", value: "100 – 440 GSM" },
      { label: "Fibre Source", value: "100% virgin kraft fibre" },
      { label: "Origin", value: "European & South American mills" },
      { label: "Surface", value: "Natural brown / Bleached white" },
      { label: "RCT (kN/m)", value: "Grade-dependent — as per COA" },
      { label: "Moisture", value: "8 – 10 %" },
      { label: "Reel Width", value: "Up to 2400 mm" },
      { label: "Available Forms", value: "Reels and sheets" },
    ],
    exportCompliance: [
      "EUTR (EU Timber Regulation) compliant — legal timber sourcing",
      "FSC certification available on request",
      "ISPM-15 not applicable (no solid wood component)",
    ],
    images: [
      "/products/paper/kraft-liner.jpg",
      "/products/paper/kraft-liner-2.jpg",
      "/products/paper/kraft-liner-3.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 4. Test Liners & Fluting Medium
  // ——————————————————————————————————————————
  {
    slug: "test-liners-fluting",
    name: "Test Liners & Fluting Medium",
    category: "Paper & Board",
    tagline: "Recycled fibre liners and fluting for cost-conscious corrugated converters",
    gsmRange: "Test Liner: 180–400 GSM | Fluting: 80–150 GSM",
    features: [
      "100% recycled fibre — sustainable packaging chain",
      "Cost-effective solution for domestic corrugated manufacturing",
      "Consistent Concora Medium Test (CMT) values for fluting",
      "Consistent Concora Crush Test (CCT) values for liner",
      "Good bonding with standard corrugator adhesives",
      "Available in surface-sized grades for improved printability",
      "Wide GSM range for B, C, E flute applications",
      "Regular mill schedules ensure consistent supply",
    ],
    applications: [
      "Corrugated box manufacturers (CBOs)",
      "Packaging converters — domestic supply chain",
      "FMCG secondary packaging (non-critical)",
      "E-commerce protective packaging",
      "Agricultural and grain cartons",
      "Industrial bulk packaging",
    ],
    specsTable: [
      { label: "Test Liner GSM", value: "180 – 400 GSM" },
      { label: "Fluting Medium GSM", value: "80 – 150 GSM" },
      { label: "Fibre Source", value: "100% recycled fibre" },
      { label: "Surface", value: "Natural brown / Machine finish" },
      { label: "CMT (fluting)", value: "As per IS 1397 / COA" },
      { label: "CCT (liner)", value: "As per IS 1397 / COA" },
      { label: "Moisture", value: "8 – 10 %" },
      { label: "Available Forms", value: "Reels and sheets" },
    ],
    exportCompliance: [
      "BIS IS 1397 compliant",
    ],
    images: [
      "/products/paper/test-liner.jpg",
      "/products/paper/test-liner-2.jpg",
      "/products/paper/test-liner-3.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 5. White Top Kraft Liner
  // ——————————————————————————————————————————
  {
    slug: "white-top-kraft-liner",
    name: "White Top Kraft Liner",
    category: "Paper & Board",
    tagline: "Printable white top surface over a strong kraft base — retail-ready corrugated packaging",
    gsmRange: "170–200 GSM",
    variants: ["Virgin back (high strength)", "Recycled back (cost-optimised)"],
    features: [
      "Superior printability on white top surface",
      "Excellent ink holdout for sharp graphics",
      "Strong kraft base provides good RCT and box compression",
      "Fresh fibre top layer ensures consistent whiteness",
      "Compatible with flexo, offset and digital printing",
      "Suitable for retail-ready packaging (RRP / shelf-ready)",
      "Virgin and recycled back variants for cost flexibility",
      "Good fold resistance without top surface cracking",
    ],
    applications: [
      "Retail-ready packaging (supermarket shelf display)",
      "Consumer durables outer packaging",
      "Food & beverage corrugated cases",
      "FMCG promotional and seasonal packaging",
      "Branded outer cartons for export",
      "E-commerce branded mailers",
    ],
    specsTable: [
      { label: "GSM Range", value: "170 – 200 GSM" },
      { label: "Top Layer", value: "Bleached white — virgin fibre" },
      { label: "Back Layer", value: "Virgin or Recycled kraft" },
      { label: "Brightness (Top)", value: "≥ 82 % ISO" },
      { label: "Surface", value: "White coated top / Brown uncoated back" },
      { label: "Moisture", value: "7 – 9 %" },
      { label: "Available Forms", value: "Reels and sheets" },
      { label: "Typical Applications", value: "B, C flute corrugated" },
    ],
    exportCompliance: [
      "BIS IS 1397 compliant",
      "FSC available on request",
    ],
    images: [
      "/products/paper/fbb-board.jpg",
      "/products/paper/kraft-liner-2.jpg",
      "/products/paper/duplex-board-2.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 6. PP Foldable Boxes
  // ——————————————————————————————————————————
  {
    slug: "pp-foldable-boxes",
    name: "PP Foldable Boxes",
    category: "PP Packaging",
    tagline: "Reusable, foldable PP corrugated boxes for industrial and pharma returnable packaging",
    thickness: "3–10 mm PP corrugated sheet",
    features: [
      "Foldable design — flat storage saves 70% warehouse space",
      "Reusable for 500+ trips with proper handling",
      "Chemical resistant — compatible with most industrial environments",
      "Lightweight — reduces per-trip logistics cost",
      "Customisable with printed logos and part numbers",
      "Stackable design for vertical storage efficiency",
      "Available with ESD (anti-static) coating on request",
      "Corner reinforcement options for heavy components",
    ],
    applications: [
      "Automotive component trays and part containers",
      "Pharma and medical device packaging",
      "Electronics and PCB component storage",
      "Textile and garment transit packaging",
      "FMCG returnable tray systems",
      "Aerospace and precision engineering components",
    ],
    specsTable: [
      { label: "Sheet Thickness", value: "3 – 10 mm PP corrugated" },
      { label: "Standard Sizes", value: "300×200×150 mm to 1200×800×800 mm" },
      { label: "Custom Sizes", value: "Available on request" },
      { label: "Reusability", value: "500+ trips under normal conditions" },
      { label: "Colour Options", value: "Standard: Black, Grey, Yellow, Blue, Green, Red" },
      { label: "Printing", value: "1-2 colour screen print / UV print available" },
      { label: "MOQ", value: "50 boxes per size" },
      { label: "Lead Time", value: "7–10 working days (standard sizes)" },
    ],
    exportCompliance: [
      "REACH compliant polypropylene substrate",
      "RoHS compliant for electronics applications",
      "ESD variant: ANSI/ESD S20.20 compatible",
    ],
    certifications: ["ISO 9001"],
    image: "/products/pp/pp-foldable-boxes-1.jpg",
  },

  // ——————————————————————————————————————————
  // 7. PP Corrugated Sheets
  // ——————————————————————————————————————————
  {
    slug: "pp-corrugated-sheets",
    name: "PP Corrugated Sheets",
    category: "PP Packaging",
    tagline: "Waterproof, UV-stable PP corrugated sheets for protective and display packaging",
    thickness: "2–12 mm",
    features: [
      "Waterproof — unaffected by humidity and moisture",
      "UV resistant — suitable for outdoor and transit applications",
      "Reusable and washable — lower cost per use",
      "Printable surface — offset and screen print compatible",
      "Lightweight — 75% lighter than equivalent corrugated cardboard",
      "Custom slit and cut to exact dimensions",
      "Available in full colour range",
      "Chemical resistant — suitable for industrial environments",
    ],
    applications: [
      "Layer pads and partition boards in packaging",
      "Protective padding inside cartons",
      "Display boards and exhibition panels",
      "Signage and POP display materials",
      "Agriculture — nursery and greenhouse applications",
      "Stationery and project boards",
    ],
    specsTable: [
      { label: "Thickness", value: "2 – 12 mm" },
      { label: "Standard Sheet Size", value: "Up to 2400 × 1200 mm" },
      { label: "Custom Sizes", value: "Custom slit and cut available" },
      { label: "Weight", value: "Approx. 600 – 900 g/m² (thickness-dependent)" },
      { label: "Colour", value: "White, Black, Grey + custom colours" },
      { label: "UV Resistance", value: "500+ hrs (standard grade)" },
      { label: "Temperature Range", value: "-10 °C to +60 °C" },
      { label: "MOQ", value: "500 kg per colour/thickness" },
    ],
    exportCompliance: [
      "REACH compliant",
      "RoHS compliant for electronics-adjacent applications",
    ],
    image: "/products/pp/pp-corrugated-sheets-1.jpg",
  },

  // ——————————————————————————————————————————
  // 8. PP Layer Pads
  // ——————————————————————————————————————————
  {
    slug: "pp-layer-pads",
    name: "PP Layer Pads",
    category: "PP Packaging",
    tagline: "High load-bearing PP layer pads for pallet separation and stack protection",
    thickness: "2–6 mm",
    features: [
      "Anti-slip surface option available (embossed or coated)",
      "Reusable — lower per-pallet cost vs paperboard slip sheets",
      "High load-bearing capacity for heavy pallet stacking",
      "Moisture proof — unaffected by humidity in cold chain",
      "Consistent flatness — no warping or delamination",
      "Lightweight — reduces gross pallet weight",
      "Customisable with die-cut holes or corner cutouts",
      "Stackable and returnable in closed loop supply chains",
    ],
    applications: [
      "Pallet layer separation in warehouses",
      "Slip sheets for pallet movement",
      "Stack protection for fragile goods",
      "Cold chain logistics — refrigerated warehouses",
      "Automotive and tyre industry pallet layers",
      "FMCG distribution — beverage and food pallets",
    ],
    specsTable: [
      { label: "Thickness", value: "2 – 6 mm PP corrugated" },
      { label: "Standard Sizes", value: "1200 × 800 mm, 1000 × 1200 mm (Euro & ISO pallet)" },
      { label: "Custom Sizes", value: "Available on request" },
      { label: "Load Capacity", value: "Up to 2 tonnes per layer (4 mm grade)" },
      { label: "Surface Options", value: "Smooth, Embossed anti-slip, Coated anti-slip" },
      { label: "Colour", value: "Black, Grey, Yellow, custom" },
      { label: "Reusability", value: "200–500 trips depending on load" },
      { label: "MOQ", value: "200 pads per size" },
    ],
    exportCompliance: [
      "REACH compliant",
      "ISPM-15 not applicable (no wood content)",
      "EU Pallet standard (1200×800 mm) available",
    ],
    image: "/products/pp/pp-layer-pads-1.jpg",
  },

  // ——————————————————————————————————————————
  // 9. PP Corrugated Crates
  // ——————————————————————————————————————————
  {
    slug: "pp-corrugated-crates",
    name: "PP Corrugated Crates",
    category: "PP Packaging",
    tagline: "Heavy-duty stackable PP corrugated crates for returnable industrial and automotive logistics",
    thickness: "4–10 mm PP corrugated sheet",
    features: [
      "Heavy-duty construction — handles up to 30 kg static load",
      "Stackable design — safe multi-level stacking in warehouses",
      "Foldable variants available for return logistics",
      "Reusable for 500+ cycles under normal handling conditions",
      "Interlocking lid and base options for secure transit",
      "Waterproof and chemical resistant — suitable for industrial environments",
      "Customisable sizes, colours, and printed labelling",
      "Lightweight — reduces freight cost vs metal or wooden crates",
    ],
    applications: [
      "Automotive OEM and Tier-1 component logistics",
      "Engineering and precision parts transit",
      "Warehouse and intra-plant material handling",
      "Pharma bulk packaging and transit containers",
      "FMCG distribution and retail replenishment",
      "Export packaging for heavy industrial goods",
    ],
    specsTable: [
      { label: "Sheet Thickness", value: "4 – 10 mm PP corrugated" },
      { label: "Standard Sizes", value: "400×300×250 mm to 1200×800×600 mm" },
      { label: "Custom Sizes", value: "Available on request" },
      { label: "Static Load Capacity", value: "Up to 30 kg (configuration-dependent)" },
      { label: "Reusability", value: "500+ cycles under normal conditions" },
      { label: "Colour Options", value: "Black, Grey, Blue, Yellow, Green, Red" },
      { label: "Printing", value: "1–2 colour screen print / barcode labelling" },
      { label: "MOQ", value: "50 units per size" },
      { label: "Lead Time", value: "7–12 working days (standard sizes)" },
    ],
    exportCompliance: [
      "REACH compliant polypropylene substrate",
      "RoHS compliant for electronics-adjacent applications",
    ],
    certifications: ["ISO 9001"],
    image: "/products/pp/pp-corrugated-crates-1.jpg",
    images: [
      "/products/pp/pp-corrugated-crates-1.jpg",
      "/products/pp/pp-corrugated-crates-2.jpg",
      "/products/pp/pp-corrugated-crates-3.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 11–16. PP Box Variants (BOX-01 → BOX-06)
  // ——————————————————————————————————————————
  {
    slug: "pp-box-open-top-riveted",
    name: "PP Box — Open Top Riveted",
    category: "PP Packaging",
    tagline: "Heavy-duty open-top PP corrugated box with riveted vertical seams for bulk industrial handling",
    thickness: "6 mm single flute",
    features: [
      "Rivet spacing 80–100 mm — industrial load rating",
      "Open top for rapid loading and unloading cycles",
      "Moisture absorption: negligible — suitable for damp warehouses",
      "Stackable — 4-high under 20 kg load",
      "Colour coding available for logistics identification",
    ],
    applications: [
      "WIP transfer between production lines",
      "Bulk automotive component storage",
      "Reverse logistics sorting",
      "Moisture-prone warehouse environments",
    ],
    specsTable: [
      { label: "Dimensions", value: "800×600×500 mm (custom available)" },
      { label: "Sheet Thickness", value: "6 mm single flute PP corrugated" },
      { label: "Joining", value: "Riveted vertical seams, 80–100 mm pitch" },
      { label: "Colour", value: "Industrial Blue (standard)" },
      { label: "Static Load Capacity", value: "Up to 25 kg" },
      { label: "Reuse Cycles", value: "50–100 trips under normal conditions" },
      { label: "Operating Temp", value: "-10 °C to +60 °C" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant polypropylene", "RoHS compliant"],
    images: [
      "/products/pp/boxes/box-01-hero.jpg",
      "/products/pp/boxes/box-01-engineering.jpg",
      "/products/pp/boxes/box-01-usecase.jpg",
      "/products/pp/boxes/box-01-alt.jpg",
    ],
  },
  {
    slug: "pp-box-ultrasonic-weld",
    name: "PP Box — Ultrasonic Weld",
    category: "PP Packaging",
    tagline: "Seamless ultrasonic-welded PP corrugated box for pharma and cleanroom applications",
    thickness: "4 mm single flute",
    features: [
      "Seamless weld — no rivet heads, no particle contamination",
      "FDA-compatible PP substrate",
      "Smooth interior — easy wipe-clean between uses",
      "Higher cycle life than riveted equivalent",
      "Cleanroom compatible grades available",
    ],
    applications: [
      "Pharma component transit",
      "Cleanroom-compatible handling",
      "Medical device packaging",
      "High-hygiene food-adjacent logistics",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Ultrasonic welded seams" },
      { label: "Colour", value: "Industrial Grey (standard)" },
      { label: "Reuse Cycles", value: "100–200 trips" },
      { label: "Surface", value: "Smooth interior — wipe-clean" },
      { label: "Operating Temp", value: "-10 °C to +60 °C" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant", "FDA-compatible substrate"],
    images: [
      "/products/pp/boxes/box-02-hero.jpg",
      "/products/pp/boxes/box-02-engineering.jpg",
      "/products/pp/boxes/box-02-usecase.jpg",
      "/products/pp/boxes/box-02-alt.jpg",
    ],
  },
  {
    slug: "pp-box-top-flap-interlock",
    name: "PP Box — Top Flap Interlock",
    category: "PP Packaging",
    tagline: "Self-locking top-flap PP corrugated box for rapid open/close in assembly line environments",
    thickness: "4 mm single flute",
    features: [
      "Self-locking lid — no separate fastener required",
      "Visual identification by colour coding",
      "Stackable in closed configuration",
      "Rapid open/close for assembly line use",
    ],
    applications: [
      "Closed component transport",
      "Internal factory logistics",
      "Assembly line part delivery",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Folded flap interlock" },
      { label: "Colour", value: "Bright Yellow (standard)" },
      { label: "Reuse Cycles", value: "50–100 trips" },
      { label: "Operating Temp", value: "-10 °C to +60 °C" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/boxes/box-03-hero.jpg",
      "/products/pp/boxes/box-03-engineering.jpg",
      "/products/pp/boxes/box-03-usecase.jpg",
    ],
  },
  {
    slug: "pp-box-detachable-lid",
    name: "PP Box — Detachable Lid",
    category: "PP Packaging",
    tagline: "Riveted PP corrugated box with removable lid — stackable, kitting-ready, export-grade",
    thickness: "4 mm single flute",
    features: [
      "Lid ships separately — flat-pack return logistics",
      "Rivet-reinforced body handles 15 kg static load",
      "Stackable with lid seated",
      "Custom internal divider compatible",
    ],
    applications: [
      "Export packaging",
      "Kitting transport",
      "Precision parts delivery",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Rivet body + removable lid" },
      { label: "Colour", value: "Light Green (standard)" },
      { label: "Static Load", value: "15 kg body" },
      { label: "Reuse Cycles", value: "50–80 trips" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/boxes/box-04-hero.jpg",
      "/products/pp/boxes/box-04-engineering.jpg",
      "/products/pp/boxes/box-04-usecase.jpg",
      "/products/pp/boxes/box-04-alt.jpg",
    ],
  },
  {
    slug: "pp-box-velcro-closure",
    name: "PP Box — Velcro Closure",
    category: "PP Packaging",
    tagline: "Repeat-access PP corrugated box with Velcro closure for precision components and CNC parts",
    thickness: "4 mm single flute",
    features: [
      "Repeat-access closure — no tools required",
      "Velcro rated 500+ open/close cycles",
      "Rivet corners prevent lateral distortion",
      "Compatible with foam/ESD insert lining",
    ],
    applications: [
      "Precision component storage",
      "CNC machined parts transport",
      "Repeat-access parts kits",
    ],
    specsTable: [
      { label: "Dimensions", value: "450×300×300 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Velcro (black) + rivet reinforcement" },
      { label: "Colour", value: "Industrial Grey (standard)" },
      { label: "Velcro Rating", value: "500+ open/close cycles" },
      { label: "Reuse Cycles", value: "50–100 trips" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/boxes/box-05-hero.jpg",
      "/products/pp/boxes/box-05-engineering.jpg",
      "/products/pp/boxes/box-05-usecase.jpg",
      "/products/pp/boxes/box-05-alt.jpg",
    ],
  },
  {
    slug: "pp-box-collapsible",
    name: "PP Box — Collapsible",
    category: "PP Packaging",
    tagline: "Fold-flat returnable PP corrugated box — saves 70% return freight volume",
    thickness: "4 mm single flute",
    features: [
      "Folds flat — saves 70% return freight volume",
      "Collapsed stack height: 80 mm per unit",
      "Hinge rated 200+ fold cycles",
      "Pallet-friendly collapsed stack configuration",
    ],
    applications: [
      "Automotive reverse logistics",
      "Returnable packaging programmes",
      "Export with flat-pack return",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Fold + rivet hinge" },
      { label: "Colour", value: "Industrial Grey (standard)" },
      { label: "Collapsed Height", value: "80 mm per unit" },
      { label: "Hinge Rating", value: "200+ fold cycles" },
      { label: "Reuse Cycles", value: "80–150 trips" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/boxes/box-06-hero.jpg",
      "/products/pp/boxes/box-06-engineering.jpg",
      "/products/pp/boxes/box-06-usecase.jpg",
      "/products/pp/boxes/box-06-alt.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 17–18. PP Separator Variants (SEP-01, SEP-02)
  // ——————————————————————————————————————————
  {
    slug: "pp-sep-cross-partition",
    name: "PP Cross Partition Grid",
    category: "PP Packaging",
    tagline: "Interlocking slot-lock PP corrugated grid divider for glass, bottles, and small parts",
    thickness: "3 mm single flute",
    features: [
      "Modular slot-lock assembly — no adhesive",
      "Grid pitch: 50–150 mm (custom)",
      "Compatible with standard box sizes",
      "Anti-static variant available (SEP-05)",
    ],
    applications: [
      "Glass bottle and jar separation",
      "Automotive small parts protection",
      "Electronics component packaging",
      "Pharmaceutical vial transit",
    ],
    specsTable: [
      { label: "Dimensions", value: "400×300×200 mm (custom available)" },
      { label: "Sheet Thickness", value: "3 mm single flute PP corrugated" },
      { label: "Joining", value: "Interlocking slots — no adhesive" },
      { label: "Grid Pitch", value: "50–150 mm (custom)" },
      { label: "Colour", value: "Light Grey (standard)" },
      { label: "Reuse Cycles", value: "80–120 trips" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/separators/sep-01-hero.jpg",
      "/products/pp/separators/sep-01-engineering.jpg",
      "/products/pp/separators/sep-01-usecase.jpg",
    ],
  },
  {
    slug: "pp-sep-die-cut-insert",
    name: "PP Custom Die-Cut Insert",
    category: "PP Packaging",
    tagline: "Precision die-cut PP corrugated contour insert for component-specific protection",
    thickness: "4 mm single flute",
    features: [
      "Contour cavities to ±1 mm die-cut tolerance",
      "Cavity depth: up to 80 mm",
      "Multiple parts per insert — one-shot kitting",
      "Foam and ESD lamination available",
    ],
    applications: [
      "Precision machined components",
      "Automotive export kits",
      "Medical instrument trays",
      "Defence and aerospace component transit",
    ],
    specsTable: [
      { label: "Dimensions", value: "500×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Precision die-cut — no join" },
      { label: "Tolerance", value: "±1 mm die-cut accuracy" },
      { label: "Max Cavity Depth", value: "80 mm" },
      { label: "Colour", value: "Light Grey (standard)" },
      { label: "Reuse Cycles", value: "60–100 trips" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/separators/sep-02-hero.jpg",
      "/products/pp/separators/sep-02-engineering.jpg",
      "/products/pp/separators/sep-02-usecase.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // 10. ESD Packaging
  // ——————————————————————————————————————————
  {
    slug: "esd-packaging",
    name: "ESD Packaging",
    category: "PP Packaging",
    tagline: "Anti-static PP corrugated packaging for sensitive electronics and PCB protection",
    surfaceResistivity: "10⁶ – 10⁹ Ohm",
    features: [
      "Anti-static PP corrugated — surface resistivity 10⁶ – 10⁹ Ohm",
      "Protects sensitive electronic components from electrostatic discharge",
      "Stackable design for space-efficient storage",
      "Reusable — supports closed-loop electronics supply chains",
      "Custom dividers and inserts for component segregation",
      "Cleanroom compatible grades available",
      "Available in standard and custom sizes",
      "Compatible with ESD-safe workstations and conveyor systems",
    ],
    applications: [
      "PCB storage and inter-departmental transit",
      "Electronics manufacturing and assembly lines",
      "Semiconductor component handling",
      "Automotive electronics (ECU, sensors, modules)",
      "Medical device electronics packaging",
      "Data centre equipment transit",
    ],
    specsTable: [
      { label: "Surface Resistivity", value: "10⁶ – 10⁹ Ohm" },
      { label: "Sheet Thickness", value: "3 – 10 mm ESD PP corrugated" },
      { label: "Colour", value: "Black (standard ESD), Grey" },
      { label: "ESD Standard", value: "ANSI/ESD S20.20 compatible" },
      { label: "Temperature Range", value: "-10 °C to +60 °C" },
      { label: "Custom Sizes", value: "Available — standard tote sizes also available" },
      { label: "Insert Options", value: "Foam, dividers, custom thermoformed inserts" },
      { label: "MOQ", value: "25 units per configuration" },
    ],
    exportCompliance: [
      "ANSI/ESD S20.20 compatible",
      "RoHS compliant",
      "REACH compliant",
      "IEC 61340-5-1 guideline compatible",
    ],
    certifications: ["ISO 9001"],
    image: "/products/pp/pp-esd-packaging-1.jpg",
  },

  // ——————————————————————————————————————————
  // PAD-02 — Heavy Duty Layer Pad
  // ——————————————————————————————————————————
  {
    slug: "pp-layer-pad-heavy-duty",
    name: "PP Heavy Duty Layer Pad",
    category: "PP Packaging",
    tagline: "4 mm PP corrugated layer pad for glass, automotive and high-load pallet stacking",
    thickness: "4 mm single flute",
    features: [
      "Load capacity: up to 2 tonnes per layer",
      "4 mm flute — higher compression resistance than standard 3 mm",
      "Anti-slip embossed surface available",
      "ISPM-15 exempt — no wood content, no fumigation required",
    ],
    applications: [
      "Glass sheet and automotive component stacking",
      "Heavy FMCG pallet separation",
      "Export load building with high static loads",
      "Cold chain pallet insulation layer",
    ],
    specsTable: [
      { label: "Dimensions", value: "1000×1000 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Colour", value: "Black (standard)" },
      { label: "Reuse Cycles", value: "300–500 trips" },
      { label: "Load per Layer", value: "Up to 2 tonnes" },
      { label: "Weight", value: "~310 g per pad" },
      { label: "MOQ", value: "100 units" },
    ],
    exportCompliance: [
      "ISPM-15 exempt (no wood content)",
      "REACH compliant",
      "RoHS compliant",
    ],
    images: [
      "/products/pp/layer-pads/layerpad-alt.jpg",
      "/products/pp/layer-pads/layerpad-stacked.jpg",
      "/products/pp/layer-pads/layerpad-hero.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // TRY-01 — Folded Corner Tray
  // ——————————————————————————————————————————
  {
    slug: "pp-tray-folded-corner",
    name: "PP Folded Corner Tray",
    category: "PP Packaging",
    tagline: "No-tooling-cost PP corrugated fold-and-cut tray for assembly staging and WIP transfer",
    thickness: "4 mm single flute",
    features: [
      "No tooling cost — fold-and-cut construction, no die required",
      "Custom depth: 60–180 mm to order",
      "Stackable open configuration for line-side storage",
      "Printable base for part identification and barcode",
    ],
    applications: [
      "Assembly line staging trays",
      "WIP component transfer between cells",
      "Inbound goods receiving trays",
      "Returnable packaging for sub-assemblies",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×120 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Folded corner — no fastener" },
      { label: "Colour", value: "Grey (standard)" },
      { label: "Reuse Cycles", value: "60–100 trips" },
      { label: "Custom Depth", value: "60–180 mm" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/trays/tray-folded-corner-hero.jpg",
      "/products/pp/trays/tray-folded-corner-cad.jpg",
      "/products/pp/trays/tray-folded-corner-usecase1.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // TRY-02 — Stackable Interlock Tray
  // ——————————————————————————————————————————
  {
    slug: "pp-tray-stackable-interlock",
    name: "PP Stackable Interlock Tray",
    category: "PP Packaging",
    tagline: "Interlocking rib PP tray engineered for 8-high pallet stacking and 20 kg dynamic loads",
    thickness: "5 mm single flute",
    features: [
      "Interlock ribs prevent lateral shift at 6G — tested to 8-high stack",
      "Load per tray: up to 20 kg dynamic",
      "Fork/hand truck compatible reinforced base",
      "5 mm flute for maximum compression resistance",
    ],
    applications: [
      "Multi-level pallet stacking",
      "Automotive component transport",
      "Stacked storage in AS/RS racking systems",
      "Returnable transit packaging for exports",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×120 mm (custom available)" },
      { label: "Sheet Thickness", value: "5 mm single flute PP corrugated" },
      { label: "Joining", value: "Interlock ribs" },
      { label: "Max Stack Height", value: "8 trays loaded" },
      { label: "Dynamic Load", value: "Up to 20 kg per tray" },
      { label: "Colour", value: "Blue (standard)" },
      { label: "Reuse Cycles", value: "80–150 trips" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/trays/tray-stackable-interlocking-hero.jpg",
      "/products/pp/trays/tray-stackable-interlocking-cad.jpg",
      "/products/pp/trays/tray-stackable-interlocking-usecase1.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // TRY-03 — Fixed Divider Tray
  // ——————————————————————————————————————————
  {
    slug: "pp-tray-fixed-divider",
    name: "PP Fixed Divider Tray",
    category: "PP Packaging",
    tagline: "Colour-coded PP corrugated kitting tray with rivet-and-slot fixed grid dividers",
    thickness: "4 mm single flute",
    features: [
      "Fixed grid: 2×2 to 4×4 compartments — specify at order",
      "Divider height: 80–110 mm to suit component depth",
      "Colour-coded per BOM position for visual management",
      "Compatible with SEP-01 cross partition inserts",
    ],
    applications: [
      "Kitting and BOM assembly staging",
      "Inspection and quality hold trays",
      "Supermarket/line-feed systems",
      "Component despatch in fixed-quantity sets",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×120 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Rivet + slot dividers" },
      { label: "Grid Options", value: "2×2, 3×3, 4×4 (custom)" },
      { label: "Divider Height", value: "80–110 mm" },
      { label: "Colour", value: "Yellow (standard)" },
      { label: "Reuse Cycles", value: "60–100 trips" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/trays/tray-fixed-dividers-hero.jpg",
      "/products/pp/trays/tray-fixed-dividers-cad.jpg",
      "/products/pp/trays/tray-fixed-dividers-usecase1.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // TRY-04 — Foam Laminated Tray
  // ——————————————————————————————————————————
  {
    slug: "pp-tray-foam-laminated",
    name: "PP Foam Laminated Tray",
    category: "PP Packaging",
    tagline: "EVA foam-laminated PP corrugated tray for vibration-sensitive optical and precision components",
    thickness: "4 mm PP + 3 mm EVA",
    features: [
      "EVA foam: 30 Shore A — calibrated vibration damping",
      "Shock absorption rating: up to 50G",
      "CNC routed custom foam profile to component shape",
      "Meets MIL-STD-2073 transit packaging requirements",
    ],
    applications: [
      "Optical component and lens protection",
      "Export vibration control for precision instruments",
      "Medical device transit trays",
      "Defence and aerospace component packaging",
    ],
    specsTable: [
      { label: "Dimensions", value: "500×400×80 mm (custom available)" },
      { label: "Shell Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Foam Layer", value: "3 mm EVA, 30 Shore A" },
      { label: "Shock Rating", value: "Up to 50G absorption" },
      { label: "Foam Profile", value: "CNC routed to component" },
      { label: "Colour", value: "Grey + Black foam" },
      { label: "Reuse Cycles", value: "50–80 trips" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: [
      "MIL-STD-2073 compatible",
      "REACH compliant",
      "RoHS compliant",
    ],
    images: [
      "/products/pp/trays/tray-foam-laminated-hero.jpg",
      "/products/pp/trays/tray-foam-laminated-cad.jpg",
      "/products/pp/trays/tray-foam-laminated-usecase1.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // TRY-05 — ESD Anti-Static Tray
  // ——————————————————————————————————————————
  {
    slug: "pp-tray-esd-antistatic",
    name: "PP ESD Anti-Static Tray",
    category: "PP Packaging",
    tagline: "Conductive PP corrugated tray with 10⁴–10⁶ Ω/sq surface resistivity for PCB and electronics handling",
    thickness: "4 mm conductive flute",
    surfaceResistivity: "10⁴–10⁶ Ω/sq",
    features: [
      "Surface resistivity: 10⁴–10⁶ Ω/sq — ANSI/ESD S20.20 compatible",
      "Conductive through-sheet — not a surface coating, does not wear off",
      "Compatible with ESD-safe conveyor and grounded racking systems",
      "Die-cut to tray form — no assembly seams",
    ],
    applications: [
      "PCB and bare die transit",
      "Electronics sub-assembly handling",
      "Semiconductor component staging",
      "ESD-controlled warehouse picking",
    ],
    specsTable: [
      { label: "Dimensions", value: "450×350×50 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm conductive flute PP corrugated" },
      { label: "Surface Resistivity", value: "10⁴–10⁶ Ω/sq" },
      { label: "ESD Standard", value: "ANSI/ESD S20.20 compatible" },
      { label: "Colour", value: "Black" },
      { label: "Reuse Cycles", value: "60–100 trips" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: [
      "ANSI/ESD S20.20 compatible",
      "RoHS compliant",
      "REACH compliant",
      "IEC 61340-5-1 guideline compatible",
    ],
    certifications: ["ISO 9001"],
    images: [
      "/products/pp/trays/tray-esd-antistatic-hero.jpg",
      "/products/pp/trays/tray-esd-antistatic-cad.jpg",
      "/products/pp/trays/tray-esd-antistatic-usecase1.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // BIN-01 — Open Top Scrap Bin
  // ——————————————————————————————————————————
  {
    slug: "pp-bin-scrap-open-top",
    name: "PP Open Top Scrap Bin",
    category: "PP Packaging",
    tagline: "900 mm tall riveted PP corrugated scrap bin for forklift environments and dry waste segregation",
    thickness: "5 mm single flute",
    features: [
      "900 mm tall — high-volume scrap capacity for shift-end collection",
      "Base plate reinforced for forklift tine entry",
      "Printable surface for waste stream labelling and GHS compliance",
      "Stacks 3-high when empty for return logistics",
    ],
    applications: [
      "Factory scrap and swarf collection",
      "Dry waste segregation at source",
      "Recyclable material collection points",
      "Warehouse returns and damaged goods segregation",
    ],
    specsTable: [
      { label: "Dimensions", value: "500×500×900 mm (custom available)" },
      { label: "Sheet Thickness", value: "5 mm single flute PP corrugated" },
      { label: "Joining", value: "Rivet" },
      { label: "Colour", value: "Green (standard)" },
      { label: "Reuse Cycles", value: "100–200 trips" },
      { label: "Base Reinforcement", value: "Forklift tine rated" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/bins/bin-01-hero.jpg",
      "/products/pp/bins/bin-01-engineering.jpg",
      "/products/pp/bins/bin-01-usecase.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // BIN-02 — Hopper Front Bin
  // ——————————————————————————————————————————
  {
    slug: "pp-bin-hopper-front",
    name: "PP Hopper Front Bin",
    category: "PP Packaging",
    tagline: "Kanban-compatible PP corrugated hopper bin for assembly line small-part picking and shelving",
    thickness: "5 mm single flute",
    features: [
      "Hopper front panel — ergonomic part extraction without tipping",
      "Label holder slot on front face — kanban and barcode compatible",
      "Racking and shelving compatible — standard footprint",
      "Modular: same footprint as BIN-03 for mixed-bin shelving rows",
    ],
    applications: [
      "Assembly line small-part storage and picking",
      "Kanban supermarket shelving",
      "Warehouse bin racking systems",
      "Maintenance spare parts storage",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×400×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "5 mm single flute PP corrugated" },
      { label: "Joining", value: "Rivet" },
      { label: "Colour", value: "Yellow (standard)" },
      { label: "Reuse Cycles", value: "100–200 trips" },
      { label: "Label Slot", value: "80×40 mm front face" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/bins/bin-02-hero.jpg",
      "/products/pp/bins/bin-02-engineering.jpg",
      "/products/pp/bins/bin-02-usecase.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // BIN-03 — Nesting Tapered Bin
  // ——————————————————————————————————————————
  {
    slug: "pp-bin-nesting-tapered",
    name: "PP Nesting Tapered Bin",
    category: "PP Packaging",
    tagline: "30% space-saving tapered PP corrugated bin — 10 units nest in 3× single-bin height for reverse logistics",
    thickness: "5 mm single flute",
    features: [
      "Tapered walls — 30% nesting space saving vs straight-wall bins",
      "Nest ratio: 10 bins in 3× single-bin height",
      "Colour-coded for material stream segregation",
      "Compatible with standard 1200×1000 mm pallet grid",
    ],
    applications: [
      "Bulk scrap sorting and material segregation",
      "Returnable logistics with high empty return volumes",
      "Colour-coded waste streams (ISO 14001 compliant systems)",
      "Inbound goods and goods-in receiving bins",
    ],
    specsTable: [
      { label: "Dimensions", value: "600×450×400 mm (custom available)" },
      { label: "Sheet Thickness", value: "5 mm single flute PP corrugated" },
      { label: "Joining", value: "Rivet" },
      { label: "Nest Ratio", value: "10 bins in 3× single-bin height" },
      { label: "Colour", value: "Blue (standard); custom available" },
      { label: "Reuse Cycles", value: "100–200 trips" },
      { label: "MOQ", value: "25 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/bins/bin-03-hero.jpg",
      "/products/pp/bins/bin-03-engineering.jpg",
      "/products/pp/bins/bin-03-usecase.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // PKG-01 — Picking Bin
  // ——————————————————————————————————————————
  {
    slug: "pp-picking-bin-open-front",
    name: "PP Stackable Open Front Picking Bin",
    category: "PP Packaging",
    tagline: "Shelving-rail compatible PP corrugated open-front bin with interlocking stack for warehouse inventory picking",
    thickness: "4 mm single flute",
    features: [
      "Open front — full contents visibility without removing from shelf",
      "Interlocking stack — no lateral slip under vibration",
      "Label window: 80×40 mm on front face for kanban or barcode",
      "Shelving rail compatible — mounts directly to standard warehouse racking",
    ],
    applications: [
      "Warehouse inventory shelving and order picking",
      "Component picking in assembly supermarkets",
      "Pharmacy and medical consumable storage",
      "E-commerce fulfilment picking faces",
    ],
    specsTable: [
      { label: "Dimensions", value: "500×350×300 mm (custom available)" },
      { label: "Sheet Thickness", value: "4 mm single flute PP corrugated" },
      { label: "Joining", value: "Rivet" },
      { label: "Colour", value: "Industrial Blue (standard)" },
      { label: "Reuse Cycles", value: "150–300 trips" },
      { label: "Label Window", value: "80×40 mm front face" },
      { label: "MOQ", value: "50 units" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/picking-bins/pkgbin-01-hero.jpg",
      "/products/pp/picking-bins/pkgbin-01-engineering.jpg",
      "/products/pp/picking-bins/pkgbin-01-usecase.jpg",
    ],
  },

  // ——————————————————————————————————————————
  // FLR-01 — Flooring Protection Sheet
  // ——————————————————————————————————————————
  {
    slug: "pp-flooring-protection-sheet",
    name: "PP Temporary Floor Protection Sheet",
    category: "PP Packaging",
    tagline: "2.4 m × 1.2 m forklift-rated PP corrugated floor protection for construction, fit-out and warehouse paths",
    thickness: "5 mm single flute",
    features: [
      "Covers 2.88 m² per sheet — fast full-floor coverage",
      "Forklift rated: 2-tonne wheel load per sheet",
      "Tape-jointed edge-to-edge for seamless large-area protection",
      "Lightweight at ~800 g — one-person install, no cutting required",
    ],
    applications: [
      "Construction site floor protection during fit-out",
      "Warehouse forklift traffic path protection",
      "Event and exhibition floor covering",
      "Temporary protection over finished tiles and hardwood",
    ],
    specsTable: [
      { label: "Dimensions", value: "2400×1200 mm (standard)" },
      { label: "Sheet Thickness", value: "5 mm single flute PP corrugated" },
      { label: "Coverage", value: "2.88 m² per sheet" },
      { label: "Wheel Load Rating", value: "2 tonnes (forklift rated)" },
      { label: "Colour", value: "Light Grey" },
      { label: "Reuse Cycles", value: "10–30 trips" },
      { label: "MOQ", value: "10 sheets" },
    ],
    exportCompliance: ["REACH compliant", "RoHS compliant"],
    images: [
      "/products/pp/flooring/flr-01-hero.jpg",
      "/products/pp/flooring/flr-01-engineering.jpg",
      "/products/pp/flooring/flr-01-usecase.jpg",
    ],
  },
];

// ============================================================
// Blog Posts
// ============================================================

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: BlogSection[];
  /** Slugs of related products to cross-link at end of post */
  relatedProducts?: string[];
}

export interface BlogSection {
  type: "paragraph" | "heading" | "subheading" | "list" | "table" | "callout";
  text?: string;
  items?: string[];
  rows?: { label: string; value: string }[];
}

export const blogPosts: BlogPost[] = [
  // ——————————————————————————————————————————
  // 1. GSM Guide
  // ——————————————————————————————————————————
  {
    slug: "gsm-guide-paper-board",
    title: "Understanding GSM in Paper & Board — A Complete Buyer's Guide",
    category: "Industry Guide",
    categoryColor: "#2563EB",
    date: "February 2026",
    readTime: "6 min",
    excerpt:
      "GSM is the most fundamental specification in paper and board buying. Get it wrong and you're either over-spending or watching your cartons fail on the shelf.",
    content: [
      {
        type: "paragraph",
        text: "If you've ever received a quote for packaging board and wondered what '300 GSM FBB' actually means for your finished carton, you're not alone. GSM — grams per square metre — is the single most important specification in paper and board procurement. It directly determines cost, strength, printability, and converting performance. Yet it remains widely misunderstood by buyers outside the packaging supply chain.",
      },
      {
        type: "heading",
        text: "What Does GSM Actually Mean?",
      },
      {
        type: "paragraph",
        text: "GSM measures the mass of a one-square-metre sheet of paper or board in grams. A 300 GSM board weighs 300 grams per square metre. This number tells you — at a glance — whether you're dealing with a lightweight sheet suitable for flexible packaging or a heavyweight board engineered for rigid cartons and pharmaceutical secondary packaging.",
      },
      {
        type: "paragraph",
        text: "Crucially, GSM does not tell the whole story. Two boards at 300 GSM can have very different stiffness, caliper (thickness), and surface properties depending on the fibre source, number of plies, and coating weight. That is why experienced buyers always read GSM alongside caliper, stiffness (MD and CD), and brightness specifications.",
      },
      {
        type: "heading",
        text: "GSM Ranges by Board Type",
      },
      {
        type: "table",
        rows: [
          { label: "Board Type", value: "Typical GSM Range" },
          { label: "Folding Box Board (FBB)", value: "230 – 400 GSM" },
          { label: "Duplex Board (Grey Back)", value: "200 – 450 GSM" },
          { label: "Duplex Board (White Back)", value: "200 – 400 GSM" },
          { label: "Kraft Liner", value: "100 – 440 GSM" },
          { label: "Test Liner", value: "180 – 400 GSM" },
          { label: "Fluting Medium", value: "80 – 150 GSM" },
          { label: "White Top Kraft Liner", value: "170 – 200 GSM" },
        ],
      },
      {
        type: "heading",
        text: "Choosing the Right GSM for Your Application",
      },
      {
        type: "subheading",
        text: "Pharmaceutical Cartons",
      },
      {
        type: "paragraph",
        text: "Pharma secondary packaging — the folding carton that holds a blister pack or vial — typically uses FBB or Duplex Board in the 300–350 GSM range. The critical requirement here is not just GSM but stiffness, which ensures the carton maintains its shape through automated packing lines running at 400–600 cartons per minute. A board that is too light will cause jams; a board that is too heavy will fail the fold score.",
      },
      {
        type: "subheading",
        text: "FMCG Retail Packaging",
      },
      {
        type: "paragraph",
        text: "Consumer goods packaging spans a wide range. A breakfast cereal carton may use 250–280 GSM duplex, while a premium cosmetics brand may specify 350–400 GSM FBB to achieve shelf rigidity and a premium tactile feel. Retail shelf impact — the ability of the carton to stand upright and maintain its shape at ambient humidity — is directly correlated to GSM combined with caliper.",
      },
      {
        type: "subheading",
        text: "Corrugated Packaging",
      },
      {
        type: "paragraph",
        text: "For corrugated box manufacturers, liner GSM determines the box compression strength (BCT). Kraft liner in the 150–200 GSM range is standard for a single-wall B or C flute box. Heavy export cartons for machinery or industrial components may use 250–440 GSM virgin kraft liner to achieve the required BCT. Fluting medium at 100–120 GSM is standard for domestic corrugated.",
      },
      {
        type: "heading",
        text: "Common Mistakes When Specifying GSM",
      },
      {
        type: "list",
        items: [
          "Specifying GSM alone without caliper: Two boards at the same GSM can vary by 15–20% in thickness, which directly affects carton rigidity.",
          "Choosing the lowest GSM to save cost without testing: Borderline GSM selections fail under humidity, especially in monsoon storage conditions common in India.",
          "Using duplex board where FBB is required: Duplex is cost-effective but has lower stiffness per GSM. For automated packing lines, FBB is almost always the right choice.",
          "Ignoring brightness specifications: For high-quality print, board brightness below 82% ISO will show colour variation, especially in light backgrounds.",
          "Over-specifying: Brands routinely use 350 GSM where 280 GSM would meet the mechanical requirement. This is a significant cost opportunity.",
        ],
      },
      {
        type: "heading",
        text: "How to Get the Right Specification",
      },
      {
        type: "paragraph",
        text: "At Pune Global Group, we work with our clients' packaging engineers and converters to identify the optimal GSM-caliper combination before any stock is committed. We provide mill test certificates (MTCs) and Certificate of Analysis (COA) documents for all grades. If you're replacing an existing grade or optimising an over-spec'd board, we can run comparison samples before you commit to a full lot.",
      },
      {
        type: "callout",
        text: "Need help specifying the right board GSM for your application? Contact our technical sales team at contact.puneglobalgroup@gmail.com or call +91 98233 83230.",
      },
    ],
    relatedProducts: ["itc-fbb-boards", "duplex-board", "kraft-liner"],
  },

  // ——————————————————————————————————————————
  // 2. FBB vs Duplex
  // ——————————————————————————————————————————
  {
    slug: "fbb-vs-duplex-board",
    title: "FBB vs Duplex Board: Which is Right for Your Packaging?",
    category: "Product Guide",
    categoryColor: "#7C3AED",
    date: "February 2026",
    readTime: "5 min",
    excerpt:
      "Folding Box Board and Duplex Board are the two workhorses of folding carton manufacturing. Knowing when to use each could save you 15–25% on board cost without compromising performance.",
    content: [
      {
        type: "paragraph",
        text: "Folding Box Board (FBB) and Duplex Board are both used to manufacture folding cartons — the familiar rectangular boxes used in pharma, FMCG, cosmetics, and food packaging. They look similar. They convert on the same equipment. But they are fundamentally different materials, and choosing the wrong one is one of the most expensive mistakes a packaging buyer can make.",
      },
      {
        type: "heading",
        text: "FBB: What It Is and Why It Commands a Premium",
      },
      {
        type: "paragraph",
        text: "Folding Box Board — sold under brands like ITC's Cyber Oak and Cyber XLPac in the Indian market — is a multi-ply virgin fibre board with a mechanical groundwood middle ply. This construction gives FBB an exceptional stiffness-to-weight ratio. At the same GSM, FBB is significantly stiffer than duplex board, which directly translates to faster running speeds on packaging lines, fewer creasing defects, and better shelf presentation.",
      },
      {
        type: "paragraph",
        text: "FBB is also characterised by its superior surface quality. The coated top layer offers consistent ink holdout, which is critical for premium print — gravure, offset, or digital. For pharmaceutical packaging where text legibility and colour consistency are regulatory requirements, FBB is the industry default.",
      },
      {
        type: "heading",
        text: "Duplex Board: The Cost-Effective Workhorse",
      },
      {
        type: "paragraph",
        text: "Duplex board is produced from recycled fibre (grey back variants) or a combination of recycled and virgin fibre (white back). The grey back reveals the recycled content; the white back is coated on both sides, offering a cleaner appearance on the inner surfaces of a box. Duplex board is typically 20–35% cheaper than equivalent GSM FBB, making it the dominant choice for secondary packaging where print quality and stiffness demands are moderate.",
      },
      {
        type: "paragraph",
        text: "Indian pharmaceutical companies commonly use duplex for outer shipper cartons and folding cartons for generic formulations. Garment and hosiery manufacturers almost exclusively use grey back duplex for their packaging boxes. The economics are compelling: when you're running millions of units and the board doesn't need to stand on a lit retail shelf, duplex is the logical choice.",
      },
      {
        type: "heading",
        text: "Head-to-Head Comparison",
      },
      {
        type: "table",
        rows: [
          { label: "Property", value: "FBB vs Duplex" },
          { label: "Stiffness (same GSM)", value: "FBB: Higher | Duplex: Lower" },
          { label: "Print quality", value: "FBB: Excellent | Duplex: Good to Very Good" },
          { label: "Relative cost", value: "FBB: Higher (premium) | Duplex: Lower" },
          { label: "Fibre source", value: "FBB: Virgin | Duplex: Recycled / Mixed" },
          { label: "Back surface", value: "FBB: White/Cream | Duplex: Grey or White" },
          { label: "Machine runnability", value: "FBB: Excellent | Duplex: Good" },
          { label: "Humidity resistance", value: "FBB: Better | Duplex: Moderate" },
        ],
      },
      {
        type: "heading",
        text: "When to Use FBB",
      },
      {
        type: "list",
        items: [
          "Pharmaceutical primary and secondary cartons with regulatory print requirements",
          "Premium retail packaging — cosmetics, fine foods, luxury goods",
          "High-speed automated packing lines (above 300 cartons/minute)",
          "Export cartons where high humidity during transit is a concern",
          "Packaging with complex multi-colour print, embossing, or hot foil",
        ],
      },
      {
        type: "heading",
        text: "When to Use Duplex Board",
      },
      {
        type: "list",
        items: [
          "Generic pharmaceutical secondary packaging (institutional, government supply)",
          "Garments, textiles, hosiery packaging",
          "Stationery, office supplies, and general retail",
          "Industrial packaging where appearance is secondary to functionality",
          "Applications with moderate print complexity (1–2 colour) on offset or flexo",
        ],
      },
      {
        type: "heading",
        text: "The Right Conversation to Have",
      },
      {
        type: "paragraph",
        text: "The FBB vs Duplex decision should be driven by your packing line speed, your print specification, and your retailer or regulatory requirement — not by what your previous supplier quoted. At Pune Global Group, we regularly help clients audit their current board specification against their actual application requirements. In over 30% of cases, we find a cost optimisation opportunity — either substituting duplex where FBB is over-specified, or switching to FBB where duplex is causing line downtime or print rejects.",
      },
      {
        type: "callout",
        text: "Talk to us about running a board specification audit for your packaging line. Call +91 98233 83230 or email contact.puneglobalgroup@gmail.com.",
      },
    ],
    relatedProducts: ["itc-fbb-boards", "duplex-board", "white-top-kraft"],
  },

  // ——————————————————————————————————————————
  // 3. Export Compliance
  // ——————————————————————————————————————————
  {
    slug: "export-packaging-compliance-india",
    title: "Export Packaging Compliance for Indian Manufacturers in 2026",
    category: "Compliance",
    categoryColor: "#DC2626",
    date: "January 2026",
    readTime: "8 min",
    excerpt:
      "Export packaging compliance is no longer just about durability. In 2026, Indian manufacturers face a complex web of BIS requirements, EU regulations, US FDA standards, and FSC certification demands.",
    content: [
      {
        type: "paragraph",
        text: "India's export packaging landscape has changed significantly in the past three years. The combination of EU deforestation regulations, tightening US FDA import standards, and domestic BIS enforcement has created a compliance environment that catches many Indian manufacturers off-guard — particularly those moving into new export markets. This guide covers the key requirements your packaging supply chain must meet in 2026.",
      },
      {
        type: "heading",
        text: "1. DGFT Regulations — Packaging and Labelling",
      },
      {
        type: "paragraph",
        text: "The Directorate General of Foreign Trade (DGFT) prescribes packaging and labelling requirements for various export product categories. Under the Foreign Trade Policy 2023, exporters must ensure packaging is adequate to protect goods during transit and meets the importing country's labelling standards. For packaged food, the Food Safety and Standards Authority of India (FSSAI) export labelling requirements must be met, including ingredient declaration in the language of the destination country.",
      },
      {
        type: "paragraph",
        text: "Practically, this means your paper and board packaging must carry correct country of origin marking, net weight, and batch/lot identification. For pharmaceutical exports, Schedule D of the Drugs and Cosmetics Act requires specific labelling on outer cartons, including shelf life, storage conditions, and licence number.",
      },
      {
        type: "heading",
        text: "2. BIS Requirements for Paper and Board",
      },
      {
        type: "paragraph",
        text: "The Bureau of Indian Standards (BIS) has mandatory standards for paper and board used in specific applications. IS 1397 covers duplex board and kraft liner specifications. IS 14927 covers folding box board. While these standards are not always mandatory for domestically-sourced packaging, export-facing procurement departments in major FMCG and pharma companies increasingly require BIS-compliant board as a quality baseline.",
      },
      {
        type: "paragraph",
        text: "Importantly, BIS compliance provides legal protection in the event of a packaging failure. If you can demonstrate that your board met IS specifications at the time of purchase (via mill Certificate of Analysis), you have a defensible position in any quality dispute with your customer or logistics provider.",
      },
      {
        type: "heading",
        text: "3. EU Import Standards — What Has Changed",
      },
      {
        type: "paragraph",
        text: "The EU Deforestation Regulation (EUDR), which entered into force in stages from 2024, requires that wood-derived products — including paper and board — be traceable to legally harvested sources. For Indian exporters using imported kraft liner or FBB from European mills, this traceability is typically already in place via FSC or PEFC chain of custody. For boards sourced from non-certified Indian mills, EUDR compliance requires due diligence documentation proving legal timber origin.",
      },
      {
        type: "paragraph",
        text: "Food packaging exported to the EU must comply with EC Regulation 1935/2004 on materials and articles in contact with food. This applies to any paper or board that will be in direct or functional contact with food. Mill-issued food contact compliance declarations are required, and heavy metal migration tests may be requested by EU importers.",
      },
      {
        type: "heading",
        text: "4. US FDA Standards for Paper Packaging",
      },
      {
        type: "paragraph",
        text: "For Indian manufacturers exporting food or pharmaceutical products to the United States, the FDA's requirements for packaging materials are codified under 21 CFR (Code of Federal Regulations). Specifically, 21 CFR 176 covers paper and paperboard components for food contact. The board used in direct-food-contact applications must use only FDA-approved substances.",
      },
      {
        type: "paragraph",
        text: "ITC FBB (Cyber Oak, Cyber XLPac, PearlXL) carries US FDA compliance documentation for food contact applications. If you are exporting to the US using Indian-manufactured FBB, request the FDA compliance letter from your board supplier — Pune Global Group provides this documentation routinely for FBB orders.",
      },
      {
        type: "heading",
        text: "5. FSC Certification — Now a Commercial Requirement",
      },
      {
        type: "paragraph",
        text: "Forest Stewardship Council (FSC) certification has shifted from a 'nice to have' to a commercial necessity for many export categories. Major UK and EU retailers — Tesco, Marks & Spencer, IKEA, Unilever — require FSC-labelled packaging from their global supply chain. If your packaging carton carries an FSC logo, your board must trace to an FSC Chain of Custody certified supplier.",
      },
      {
        type: "paragraph",
        text: "Pune Global Group holds FSC Chain of Custody certification (FSC C064218). This means we can supply FSC-certified ITC FBB with full chain of custody documentation, enabling our clients to display the FSC logo on their export packaging without separately obtaining their own certification.",
      },
      {
        type: "heading",
        text: "6. ISPM-15 — Wood Packaging Material",
      },
      {
        type: "paragraph",
        text: "The International Standards for Phytosanitary Measures No. 15 (ISPM-15) applies to solid wood packaging — pallets, crates, dunnage — used in international trade. It does not apply to paper, board, or PP corrugated packaging. However, if your export shipment uses wooden pallets, those pallets must be heat-treated and marked with the IPPC logo. Failure to comply will result in rejection or fumigation at the destination port at your expense.",
      },
      {
        type: "heading",
        text: "Export Packaging Documentation Checklist",
      },
      {
        type: "list",
        items: [
          "Mill Certificate of Analysis (COA) / Mill Test Certificate (MTC) for board",
          "FSC Chain of Custody certificate (if FSC logo is displayed)",
          "Food contact compliance declaration (for food/pharma applications)",
          "BIS conformity documentation (IS 1397 / IS 14927 as applicable)",
          "EUDR due diligence documentation (for EU-bound shipments)",
          "ISPM-15 certificate for wooden pallet/packaging used in transit",
          "Country of origin declaration for packaging materials",
          "Packaging validation report (drop test, compression test) for fragile goods",
        ],
      },
      {
        type: "paragraph",
        text: "Compliance documentation management is one of the least glamorous but most consequential parts of export packaging procurement. Pune Global Group maintains a document repository for all grades we supply, and we proactively share updated compliance documents with every repeat order.",
      },
      {
        type: "callout",
        text: "Need compliance documentation for your current board supply? Email contact.puneglobalgroup@gmail.com with your board grade and destination market.",
      },
    ],
    relatedProducts: ["pp-box-open-top-riveted", "pp-layer-pad-heavy-duty", "pp-tray-esd-antistatic"],
  },

  // ——————————————————————————————————————————
  // 4. PP Corrugated Returnable Packaging
  // ——————————————————————————————————————————
  {
    slug: "pp-corrugated-returnable-packaging",
    title: "Why PP Corrugated is Replacing Cardboard in Returnable Packaging",
    category: "Industry Trends",
    categoryColor: "#059669",
    date: "January 2026",
    readTime: "5 min",
    excerpt:
      "Automotive OEMs, electronics manufacturers, and pharma companies across India are quietly replacing cardboard with PP corrugated for internal and closed-loop logistics. Here's the economics.",
    content: [
      {
        type: "paragraph",
        text: "Walk through the inbound logistics dock of any Tier-1 automotive supplier in Pune's Chakan or Talegaon clusters, and you'll notice something has changed in the past five years. The brown corrugated boxes that once dominated are increasingly replaced by black, grey, and yellow polypropylene containers. This is not an aesthetic choice — it is driven by hard economics and a shift in how manufacturers think about packaging as a capital asset rather than a consumable.",
      },
      {
        type: "heading",
        text: "The Cost Per Trip Calculation",
      },
      {
        type: "paragraph",
        text: "The fundamental case for PP corrugated returnable packaging is the cost-per-trip analysis. A standard corrugated cardboard tray for automotive components costs approximately Rs 80–120 per unit. It lasts 1–3 trips under factory conditions before structural integrity is compromised. A comparable PP corrugated foldable box costs Rs 450–700 per unit but survives 500+ trips under normal handling.",
      },
      {
        type: "table",
        rows: [
          { label: "Metric", value: "Cardboard vs PP Corrugated" },
          { label: "Unit cost", value: "Cardboard: Rs 100 | PP: Rs 550" },
          { label: "Expected trips", value: "Cardboard: 2 | PP: 500" },
          { label: "Cost per trip", value: "Cardboard: Rs 50 | PP: Rs 1.10" },
          { label: "Annual cost (1000 trips)", value: "Cardboard: Rs 50,000 | PP: Rs 1,100" },
          { label: "Waste generated", value: "Cardboard: High | PP: Minimal" },
          { label: "Storage (flat-folded)", value: "Cardboard: Bulky | PP: 70% space saving" },
        ],
      },
      {
        type: "paragraph",
        text: "This is not a marginal improvement. At scale, for a manufacturer running 5,000 trips per month across 20 part numbers, the switch from corrugated to PP returnable packaging can generate Rs 20–50 lakh in annual savings — before accounting for disposal costs, procurement overhead, and the labour cost of managing cardboard waste.",
      },
      {
        type: "heading",
        text: "Automotive: The Earliest Adopter",
      },
      {
        type: "paragraph",
        text: "The Indian automotive sector — led by Tier-1 suppliers to Maruti, Tata Motors, Mahindra, and Bajaj — began adopting PP corrugated returnable packaging seriously around 2018–2019. The trigger was the Toyota Production System requirement for standardised returnable packaging in supply chains, which was progressively adopted by domestic OEMs. Today, most Tier-1 automotive suppliers in Pune, Chennai, and NCR have standardised returnable packaging for their top 20–30 part numbers by volume.",
      },
      {
        type: "paragraph",
        text: "PP foldable boxes are particularly well-suited to automotive: they can be customised with foam inserts or dividers to protect machined components from scratching, they are chemical resistant (oil and coolant splash are constants in a machining environment), and they are easily identifiable with printed part numbers and barcodes.",
      },
      {
        type: "heading",
        text: "Electronics and Pharma: The Next Wave",
      },
      {
        type: "paragraph",
        text: "After automotive, the electronics manufacturing sector is showing the highest growth in PP corrugated adoption. PCB assembly lines need ESD-safe packaging — a requirement that cardboard cannot meet. Anti-static PP corrugated (ESD packaging) fills this gap, with surface resistivity in the 10⁶–10⁹ Ohm range that protects sensitive components from electrostatic discharge. As India's electronics manufacturing base expands under the PLI scheme, this segment is expected to grow rapidly.",
      },
      {
        type: "paragraph",
        text: "Pharmaceutical companies are also beginning to adopt PP corrugated for internal WIP (work-in-progress) movement — the transit of partially assembled products between production departments. The hygiene advantage (PP can be wiped clean with IPA or standard sanitisers) and moisture resistance (critical in humidity-controlled pharma environments) make PP corrugated a compelling choice for GMP-compliant facilities.",
      },
      {
        type: "heading",
        text: "The Sustainability Angle",
      },
      {
        type: "paragraph",
        text: "PP corrugated returnable packaging reduces packaging waste significantly. A closed-loop system with 500-trip PP boxes eliminates approximately 498 corrugated boxes that would otherwise have been purchased, used once, and sent to waste. For manufacturers with ESG reporting requirements — increasingly common for export-facing businesses and publicly listed companies — this waste reduction is reportable as a direct contribution to Scope 3 emission reductions.",
      },
      {
        type: "paragraph",
        text: "It's important to note that PP corrugated is not infinitely circular. At end-of-life, PP can be mechanically recycled, and several recyclers in India's major industrial clusters now accept PP corrugated for reprocessing. The sustainability case is strong but depends on a managed end-of-life process.",
      },
      {
        type: "heading",
        text: "When Cardboard Still Makes Sense",
      },
      {
        type: "list",
        items: [
          "One-way or open-loop logistics: If packaging cannot be reliably returned, cardboard's lower per-unit cost wins.",
          "Irregular or seasonal products: Where volumes are too low to justify a custom PP mould or die-cut tool.",
          "Export packaging: Where packaging cannot be recovered (overseas shipments), corrugated is typically standard.",
          "Very large or very small sizes: Extreme dimensions in PP corrugated carry tool costs that may not be justified.",
          "Short shelf-life products: Where packaging is destroyed on opening, the reusability benefit is irrelevant.",
        ],
      },
      {
        type: "paragraph",
        text: "The PP vs cardboard decision is not universal. It requires a trip-analysis, a volume assessment, and an evaluation of your logistics loop. Pune Global Group can help you model the economics for your specific application before you make any capital commitment.",
      },
      {
        type: "callout",
        text: "Interested in a returnable packaging cost analysis for your facility? Contact us at +91 98233 83230 or contact.puneglobalgroup@gmail.com.",
      },
    ],
    relatedProducts: ["pp-bin-hopper-front", "pp-tray-folded-corner", "pp-bin-scrap-open-top"],
  },
];

// ============================================================
// Infrastructure Data
// ============================================================

export interface Machine {
  name: string;
  icon: string;
  description: string;
  specs: string[];
}

export const machines: Machine[] = [
  {
    name: "Rewinder",
    icon: "⟳",
    description: "Roll-to-roll rewinding for precise tension control and master reel splitting",
    specs: [
      "Max working width: 2500 mm",
      "Digital tension control system",
      "Variable speed drive — up to 600 m/min",
      "Automatic edge guiding",
      "Suitable for all paper and board grades",
    ],
  },
  {
    name: "Sheeter",
    icon: "▤",
    description: "Precision rotary sheeting for consistent, square-cut sheets at high throughput",
    specs: [
      "Sheet length: up to 1540 mm",
      "Working width: up to 2400 mm",
      "Tolerance: ±0.5 mm",
      "Automatic pile stacking",
      "Suitable for 80 – 450 GSM",
    ],
  },
  {
    name: "Synchro Sheeter",
    icon: "◫",
    description: "High-speed sheeting with synchronized register for demanding print-grade sheets",
    specs: [
      "Roll width: up to 1800 mm",
      "Output: up to 300 sheets/min",
      "24–36 hour turnaround on standard jobs",
      "Print-quality surface handling",
      "Automated register and quality check",
    ],
  },
  {
    name: "Guillotine",
    icon: "▬",
    description: "Precision guillotine cutting to exact finished dimensions for converters",
    specs: [
      "Cutting width: up to 1800 mm",
      "Tolerance: ±0.3 mm",
      "Programmable cut sequences",
      "Air-table material handling",
      "Suitable for all board grades up to 450 GSM",
    ],
  },
  {
    name: "Heat Shrink Wrap",
    icon: "◈",
    description: "Ream and bundle wrapping with heat shrink film for moisture-protected delivery",
    specs: [
      "Fully sealed moisture barrier",
      "Handles 50-sheet to 500-sheet reams",
      "Ream labelling and batch marking",
      "LDPE shrink film — compliant with transit standards",
      "Output: up to 20 reams/min",
    ],
  },
  {
    name: "Stretch Wrap",
    icon: "⊡",
    description: "Automated pallet stretch wrapping for secure, transit-ready pallet despatch",
    specs: [
      "Semi-automatic rotary arm system",
      "Film overlap 50–80% adjustable",
      "Handles pallets up to 1200 × 1200 mm",
      "Pre-stretch ratio up to 250%",
      "Integrated pallet weighing",
    ],
  },
];

export const capabilities = [
  { label: "Processing Capacity", value: "200 Tons/Day", icon: "⚡" },
  { label: "Minimum Order Quantity", value: "500 kg", icon: "📦" },
  { label: "Lead Time", value: "2 Business Days", icon: "🕐" },
  { label: "Processing Turnaround", value: "24–36 Hours", icon: "⏱" },
  { label: "Sheet Tolerance", value: "±0.3 mm", icon: "🎯" },
  { label: "Max Reel Width", value: "2500 mm", icon: "📐" },
];
