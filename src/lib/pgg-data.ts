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
    image: "https://www.brotherspackaging.in/assets/images/products/ppbox/9.webp",
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
    image: "https://jppack.in/products/ppcorrugatedsheetssunpaksheetshollowsheetsfluteboardsheets_24_07_25_09_23_01_102592.png",
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
    image: "https://jppack.in/products/ppcorrugatedlayerpad_24_07_25_09_27_58_112075.png",
  },

  // ——————————————————————————————————————————
  // 9. ESD Packaging
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
    image: "https://jppack.in/products/ppcorrugatedesdbin_24_07_25_09_29_20_111119.png",
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
