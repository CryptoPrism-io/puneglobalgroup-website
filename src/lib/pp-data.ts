// ============================================================
// PP Corrugated — Product Families & Variants
// ============================================================

export interface PPVariant {
  code: string;           // "BOX-01"
  slug: string;           // → /products/[slug]
  name: string;           // "Open Top Riveted"
  joining: string;        // "Riveted vertical seams"
  dimensions: string;     // "800×600×500 mm"
  thickness: string;      // "6 mm single flute"
  color: string;          // "Industrial Blue"
  reuseCycles: string;    // "50–100 trips"
  useCases: string[];     // exactly 2
  features: string[];     // 3–4 bullet points
  images: [string, string, string]; // [hero, engineering, usecase]
}

export interface PPFamily {
  id: string;
  name: string;
  descriptor: string;
  variants: PPVariant[];
}

export const ppFamilies: PPFamily[] = [

  // ─────────────────────────────────────────────
  // 1. BOXES
  // ─────────────────────────────────────────────
  {
    id: "boxes",
    name: "Boxes",
    descriptor: "Six closure systems. One material. Engineered for industrial handling, not single-use disposal.",
    variants: [
      {
        code: "BOX-01",
        slug: "pp-box-open-top-riveted",
        name: "Open Top Riveted",
        joining: "Riveted vertical seams",
        dimensions: "800×600×500 mm",
        thickness: "6 mm single flute",
        color: "Industrial Blue",
        reuseCycles: "50–100 trips",
        useCases: ["WIP transfer between production lines", "Bulk automotive component storage"],
        features: [
          "Open top for rapid loading and unloading",
          "Rivet spacing 80–100 mm — industrial load rating",
          "Moisture absorption: negligible",
          "Stackable for vertical warehouse storage",
        ],
        images: [
          "/products/pp/boxes/box-01-hero.jpg",
          "/products/pp/boxes/box-01-engineering.jpg",
          "/products/pp/boxes/box-01-usecase.jpg",
        ],
      },
      {
        code: "BOX-02",
        slug: "pp-box-ultrasonic-weld",
        name: "Open Top Ultrasonic Weld",
        joining: "Ultrasonic welded seams",
        dimensions: "600×400×400 mm",
        thickness: "4 mm single flute",
        color: "Industrial Grey",
        reuseCycles: "100–200 trips",
        useCases: ["Pharma component transit", "Cleanroom-compatible handling"],
        features: [
          "Seamless weld — no rivet heads, no contamination risk",
          "FDA-compatible PP substrate",
          "Smooth interior — easy wipe-clean",
          "Higher cycle life than riveted equivalent",
        ],
        images: [
          "/products/pp/boxes/box-02-hero.jpg",
          "/products/pp/boxes/box-02-engineering.jpg",
          "/products/pp/boxes/box-02-usecase.jpg",
        ],
      },
      {
        code: "BOX-03",
        slug: "pp-box-top-flap-interlock",
        name: "Top Flap Interlock",
        joining: "Folded flap interlock",
        dimensions: "600×400×400 mm",
        thickness: "4 mm single flute",
        color: "Bright Yellow",
        reuseCycles: "50–100 trips",
        useCases: ["Closed component transport", "Internal factory logistics"],
        features: [
          "Self-locking lid — no separate fastener",
          "Visual identification by colour coding",
          "Stackable closed configuration",
          "Rapid open/close for assembly line use",
        ],
        images: [
          "/products/pp/boxes/box-03-hero.jpg",
          "/products/pp/boxes/box-03-engineering.jpg",
          "/products/pp/boxes/box-03-usecase.jpg",
        ],
      },
      {
        code: "BOX-04",
        slug: "pp-box-detachable-lid",
        name: "Detachable Lid",
        joining: "Rivet body + removable lid",
        dimensions: "600×400×400 mm",
        thickness: "4 mm single flute",
        color: "Light Green",
        reuseCycles: "50–80 trips",
        useCases: ["Export packaging", "Kitting transport"],
        features: [
          "Lid ships separately — flat-pack return",
          "Rivet-reinforced body handles 15 kg static",
          "Stackable with lid seated",
          "Custom internal divider compatible",
        ],
        images: [
          "/products/pp/boxes/box-04-hero.jpg",
          "/products/pp/boxes/box-04-engineering.jpg",
          "/products/pp/boxes/box-04-usecase.jpg",
        ],
      },
      {
        code: "BOX-05",
        slug: "pp-box-velcro-closure",
        name: "Velcro Closure",
        joining: "Velcro (black) + rivet reinforcement",
        dimensions: "450×300×300 mm",
        thickness: "4 mm single flute",
        color: "Industrial Grey",
        reuseCycles: "50–100 trips",
        useCases: ["Precision component storage", "CNC machined parts transport"],
        features: [
          "Repeat-access closure — no tools required",
          "Velcro rated 500+ open/close cycles",
          "Rivet corners prevent lateral distortion",
          "Compatible with foam/ESD insert lining",
        ],
        images: [
          "/products/pp/boxes/box-05-hero.jpg",
          "/products/pp/boxes/box-05-engineering.jpg",
          "/products/pp/boxes/box-05-usecase.jpg",
        ],
      },
      {
        code: "BOX-06",
        slug: "pp-box-collapsible",
        name: "Collapsible",
        joining: "Fold + rivet hinge",
        dimensions: "600×400×400 mm",
        thickness: "4 mm single flute",
        color: "Industrial Grey",
        reuseCycles: "80–150 trips",
        useCases: ["Returnable logistics", "Automotive reverse logistics"],
        features: [
          "Folds flat — saves 70% return freight volume",
          "Collapsed stack height: 80 mm per unit",
          "Hinge rated 200+ fold cycles",
          "Pallet-friendly collapsed stack",
        ],
        images: [
          "/products/pp/boxes/box-06-hero.jpg",
          "/products/pp/boxes/box-06-engineering.jpg",
          "/products/pp/boxes/box-06-usecase.jpg",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. SEPARATORS & INSERTS
  // ─────────────────────────────────────────────
  {
    id: "separators",
    name: "Separators & Inserts",
    descriptor: "Custom-engineered protection for parts that cannot touch. Die-cut, interlocked, and dimensioned to your component.",
    variants: [
      {
        code: "SEP-01",
        slug: "pp-sep-cross-partition",
        name: "Cross Partition Grid",
        joining: "Interlocking slots",
        dimensions: "400×300×200 mm",
        thickness: "3 mm single flute",
        color: "Light Grey",
        reuseCycles: "80–120 trips",
        useCases: ["Glass bottle separation", "Automotive small parts protection"],
        features: [
          "Modular slot-lock — no adhesive",
          "Grid pitch: 50–150 mm (custom)",
          "Compatible with standard box sizes",
          "Anti-static variant available",
        ],
        images: [
          "/products/pp/separators/sep-01-hero.jpg",
          "/products/pp/separators/sep-01-engineering.jpg",
          "/products/pp/separators/sep-01-usecase.jpg",
        ],
      },
      {
        code: "SEP-02",
        slug: "pp-sep-die-cut-insert",
        name: "Custom Die-Cut Insert",
        joining: "Precision die-cut",
        dimensions: "500×400 mm",
        thickness: "4 mm single flute",
        color: "Light Grey",
        reuseCycles: "60–100 trips",
        useCases: ["Precision machined components", "Automotive export kits"],
        features: [
          "Contour cavities to ±1 mm tolerance",
          "Cavity depth: up to 80 mm",
          "Multiple parts per insert — one-shot kitting",
          "Foam and ESD lamination available",
        ],
        images: [
          "/products/pp/separators/sep-02-hero.jpg",
          "/products/pp/separators/sep-02-engineering.jpg",
          "/products/pp/separators/sep-02-usecase.jpg",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. LAYER PADS
  // ─────────────────────────────────────────────
  {
    id: "layer-pads",
    name: "Layer Pads",
    descriptor: "Pallet-level load distribution. Five colours standard. Moisture proof, reusable, and lighter than every alternative.",
    variants: [
      {
        code: "PAD-01",
        slug: "pp-layer-pads",
        name: "Standard Pallet Layer Pad",
        joining: "Single sheet — no join",
        dimensions: "1200×1000 mm",
        thickness: "3 mm single flute",
        color: "Blue / Green / Red / Yellow / Black",
        reuseCycles: "200–500 trips",
        useCases: ["Carton pallet stacking", "FMCG pallet stabilisation"],
        features: [
          "Load capacity: up to 1.5 tonnes per layer",
          "Moisture absorption: zero",
          "Weight: 220 g per pad (3 mm)",
          "Colour coding for SKU segregation",
        ],
        images: [
          "/products/pp/layer-pads/layerpad-hero.jpg",
          "/products/pp/layer-pads/layerpad-engineering.jpg",
          "/products/pp/layer-pads/layerpad-usecase.jpg",
        ],
      },
      {
        code: "PAD-02",
        slug: "pp-layer-pads",
        name: "Heavy Duty Layer Pad",
        joining: "Single sheet — no join",
        dimensions: "1000×1000 mm",
        thickness: "4 mm single flute",
        color: "Black",
        reuseCycles: "300–500 trips",
        useCases: ["Glass sheet stacking", "Automotive load separation"],
        features: [
          "Load capacity: up to 2 tonnes per layer",
          "4 mm flute — higher compression resistance",
          "Anti-slip embossed surface available",
          "ISPM-15 exempt — no wood content",
        ],
        images: [
          "/products/pp/layer-pads/layerpad-alt.jpg",
          "/products/pp/layer-pads/layerpad-stacked.jpg",
          "/products/pp/layer-pads/layerpad-hero.jpg",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. TRAYS
  // ─────────────────────────────────────────────
  {
    id: "trays",
    name: "Trays",
    descriptor: "Assembly staging to optical protection. Five tray configurations including foam-laminated and ESD-rated variants.",
    variants: [
      {
        code: "TRY-01",
        slug: "pp-corrugated-sheets",
        name: "Folded Corner Tray",
        joining: "Folded corner",
        dimensions: "600×400×120 mm",
        thickness: "4 mm single flute",
        color: "Grey",
        reuseCycles: "60–100 trips",
        useCases: ["Assembly staging", "Component transfer"],
        features: [
          "No tooling cost — fold-and-cut construction",
          "Custom depth: 60–180 mm",
          "Stackable open configuration",
          "Printable base for part identification",
        ],
        images: [
          "/products/pp/trays/tray-folded-corner-hero.jpg",
          "/products/pp/trays/tray-folded-corner-cad.jpg",
          "/products/pp/trays/tray-folded-corner-usecase1.jpg",
        ],
      },
      {
        code: "TRY-02",
        slug: "pp-corrugated-sheets",
        name: "Stackable Interlock Tray",
        joining: "Interlock ribs",
        dimensions: "600×400×120 mm",
        thickness: "5 mm single flute",
        color: "Blue",
        reuseCycles: "80–150 trips",
        useCases: ["Stacked transport", "Pallet stacking"],
        features: [
          "Interlock ribs prevent lateral shift at 6G",
          "Tested to 8-high stack",
          "Load per tray: up to 20 kg dynamic",
          "Fork/hand truck compatible base",
        ],
        images: [
          "/products/pp/trays/tray-stackable-interlocking-hero.jpg",
          "/products/pp/trays/tray-stackable-interlocking-cad.jpg",
          "/products/pp/trays/tray-stackable-interlocking-usecase1.jpg",
        ],
      },
      {
        code: "TRY-03",
        slug: "pp-corrugated-sheets",
        name: "Fixed Divider Tray",
        joining: "Rivet + slot dividers",
        dimensions: "600×400×120 mm",
        thickness: "4 mm single flute",
        color: "Yellow",
        reuseCycles: "60–100 trips",
        useCases: ["Kitting", "Inspection staging"],
        features: [
          "Fixed grid: 2×2 to 4×4 compartments",
          "Divider height: 80–110 mm",
          "Colour-coded per BOM position",
          "Compatible with SEP-01 cross partitions",
        ],
        images: [
          "/products/pp/trays/tray-fixed-dividers-hero.jpg",
          "/products/pp/trays/tray-fixed-dividers-cad.jpg",
          "/products/pp/trays/tray-fixed-dividers-usecase1.jpg",
        ],
      },
      {
        code: "TRY-04",
        slug: "pp-corrugated-sheets",
        name: "Foam Laminated Tray",
        joining: "Adhesive lamination",
        dimensions: "500×400×80 mm",
        thickness: "4 mm PP + 3 mm EVA",
        color: "Grey + Black foam",
        reuseCycles: "50–80 trips",
        useCases: ["Optical component protection", "Export vibration control"],
        features: [
          "EVA foam: 30 Shore A — vibration damping",
          "Shock absorption: up to 50G",
          "Custom foam profile: CNC routed",
          "Meets MIL-STD-2073 transit requirements",
        ],
        images: [
          "/products/pp/trays/tray-foam-laminated-hero.jpg",
          "/products/pp/trays/tray-foam-laminated-cad.jpg",
          "/products/pp/trays/tray-foam-laminated-usecase1.jpg",
        ],
      },
      {
        code: "TRY-05",
        slug: "pp-corrugated-sheets",
        name: "ESD Anti-Static Tray",
        joining: "Die-cut",
        dimensions: "450×350×50 mm",
        thickness: "4 mm conductive flute",
        color: "Black",
        reuseCycles: "60–100 trips",
        useCases: ["PCB transport", "Electronics assembly"],
        features: [
          "Surface resistivity: 10⁴–10⁶ Ω/sq",
          "ANSI/ESD S20.20 compatible",
          "Conductive through-sheet — no coating",
          "Compatible with ESD-safe conveyor systems",
        ],
        images: [
          "/products/pp/trays/tray-esd-antistatic-hero.jpg",
          "/products/pp/trays/tray-esd-antistatic-cad.jpg",
          "/products/pp/trays/tray-esd-antistatic-usecase1.jpg",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. INDUSTRIAL BINS
  // ─────────────────────────────────────────────
  {
    id: "bins",
    name: "Industrial Bins",
    descriptor: "Factory-floor scrap and parts management. Colour-coded, labelled, and built for forklift environments.",
    variants: [
      {
        code: "BIN-01",
        slug: "pp-corrugated-crates",
        name: "Open Top Scrap Bin",
        joining: "Rivet",
        dimensions: "500×500×900 mm",
        thickness: "5 mm single flute",
        color: "Green",
        reuseCycles: "100–200 trips",
        useCases: ["Factory scrap collection", "Dry waste segregation"],
        features: [
          "900 mm tall — high-volume scrap capacity",
          "Base plate reinforced for forklift tine entry",
          "Printable surface for waste labelling",
          "Stacks 3-high when empty",
        ],
        images: [
          "/products/pp/bins/bin-01-hero.jpg",
          "/products/pp/bins/bin-01-engineering.jpg",
          "/products/pp/bins/bin-01-usecase.jpg",
        ],
      },
      {
        code: "BIN-02",
        slug: "pp-corrugated-crates",
        name: "Hopper Front Bin",
        joining: "Rivet",
        dimensions: "600×400×400 mm",
        thickness: "5 mm single flute",
        color: "Yellow",
        reuseCycles: "100–200 trips",
        useCases: ["Small part picking", "Assembly line storage"],
        features: [
          "Hopper front — ergonomic part extraction",
          "Label holder slot — kanban compatible",
          "Racking and shelving compatible",
          "Modular: same footprint as BIN-03",
        ],
        images: [
          "/products/pp/bins/bin-02-hero.jpg",
          "/products/pp/bins/bin-02-engineering.jpg",
          "/products/pp/bins/bin-02-usecase.jpg",
        ],
      },
      {
        code: "BIN-03",
        slug: "pp-corrugated-crates",
        name: "Nesting Tapered Bin",
        joining: "Rivet",
        dimensions: "600×450×400 mm",
        thickness: "5 mm single flute",
        color: "Blue",
        reuseCycles: "100–200 trips",
        useCases: ["Bulk scrap sorting", "Return logistics"],
        features: [
          "Tapered walls — 30% nesting space saving",
          "Nest ratio: 10 bins in 3× single-bin height",
          "Colour-coded for material stream",
          "Compatible with standard pallet grid",
        ],
        images: [
          "/products/pp/bins/bin-03-hero.jpg",
          "/products/pp/bins/bin-03-engineering.jpg",
          "/products/pp/bins/bin-03-usecase.jpg",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. PICKING BINS
  // ─────────────────────────────────────────────
  {
    id: "picking-bins",
    name: "Picking Bins",
    descriptor: "Warehouse inventory shelving and order fulfilment. Open-front, stackable, and kanban-ready.",
    variants: [
      {
        code: "PKG-01",
        slug: "pp-corrugated-crates",
        name: "Stackable Open Front Picking Bin",
        joining: "Rivet",
        dimensions: "500×350×300 mm",
        thickness: "4 mm single flute",
        color: "Industrial Blue",
        reuseCycles: "150–300 trips",
        useCases: ["Warehouse inventory shelving", "Component picking"],
        features: [
          "Open front — full contents visibility",
          "Interlocking stack — no lateral slip",
          "Label window: 80×40 mm front face",
          "Shelving rail compatible",
        ],
        images: [
          "/products/pp/picking-bins/pkgbin-01-hero.jpg",
          "/products/pp/picking-bins/pkgbin-01-engineering.jpg",
          "/products/pp/picking-bins/pkgbin-01-usecase.jpg",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. FLOORING SHEETS
  // ─────────────────────────────────────────────
  {
    id: "flooring",
    name: "Flooring Sheets",
    descriptor: "Temporary surface protection for construction, fit-out, and warehouse forklift paths.",
    variants: [
      {
        code: "FLR-01",
        slug: "pp-corrugated-sheets",
        name: "Temporary Protection Sheet",
        joining: "Single sheet",
        dimensions: "2400×1200 mm",
        thickness: "5 mm single flute",
        color: "Light Grey",
        reuseCycles: "10–30 trips",
        useCases: ["Construction floor protection", "Warehouse forklift path protection"],
        features: [
          "Covers 2.88 m² per sheet",
          "Forklift rated: 2-tonne wheel load",
          "Tape-jointed for seamless coverage",
          "Lightweight — one person install",
        ],
        images: [
          "/products/pp/flooring/flr-01-hero.jpg",
          "/products/pp/flooring/flr-01-engineering.jpg",
          "/products/pp/flooring/flr-01-usecase.jpg",
        ],
      },
    ],
  },
];
