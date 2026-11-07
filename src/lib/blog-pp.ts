// PP-focused guides (November 2026). Product facts come from the catalogue in
// pp-data.ts / pgg-data.ts; everything else is general technical knowledge.
import type { BlogPost } from "@/lib/pgg-data";

export const ppPosts: BlogPost[] = [
  // ——————————————————————————————————————————
  // ESD / anti-static PP packaging
  // ——————————————————————————————————————————
  {
    slug: "esd-antistatic-pp-corrugated",
    title: "ESD-Safe PP Corrugated Packaging: Conductive, Dissipative and Anti-Static Explained",
    category: "Product Guide",
    categoryColor: "#7C3AED",
    date: "November 2026",
    readTime: "6 min",
    coverImage: "/blog/esd-antistatic-pp-corrugated.png",
    answer:
      "ESD-safe PP corrugated packaging is made from carbon-loaded polypropylene sheet, so static charge drains away instead of building up and jumping into electronic parts. Ask for surface resistivity data: conductive material is usually below about 10⁵ Ω/sq and dissipative material up to about 10¹¹ Ω/sq. Our ESD tray measures 10⁴–10⁶ Ω/sq.",
    excerpt:
      "Black PP boxes are not automatically ESD-safe. What conductive, dissipative and anti-static actually mean, and what to ask your supplier before parts go in.",
    relatedProducts: ["pp-tray-esd-antistatic", "pp-sep-cross-partition", "pp-box-ultrasonic-weld"],
    content: [
      { type: "paragraph", text: "Electrostatic discharge damages components long before anyone sees a spark. A charge of a few hundred volts, far below what a person can feel, is enough to weaken a sensitive chip so that it fails weeks later in the field. Packaging that moves PCBs, sensors and modules around a plant is one of the places charge builds up, which is why electronics customers specify ESD-safe trays, bins and partitions." },
      { type: "heading", text: "Conductive, dissipative and anti-static are different things" },
      { type: "paragraph", text: "Packaging materials are grouped by how easily charge moves across their surface, measured as surface resistivity in ohms per square (Ω/sq). Lower numbers mean charge drains faster." },
      { type: "table", rows: [
        { label: "Type", value: "What it does" },
        { label: "Conductive (about 10³–10⁵ Ω/sq)", value: "Charge drains almost immediately to ground. Typical for carbon-loaded black PP." },
        { label: "Dissipative (about 10⁵–10¹¹ Ω/sq)", value: "Charge drains slowly and in a controlled way, so there is no sudden discharge." },
        { label: "Anti-static / low-charging", value: "Resists building up charge when rubbed, but does not drain it. Often a surface additive or coating." },
        { label: "Insulative (above about 10¹¹ Ω/sq)", value: "Holds charge. Ordinary PP, cardboard and most plastics." },
      ] },
      { type: "paragraph", text: "The exact limits and test methods depend on the standard your plant works to, usually IEC 61340-5-1 or ANSI/ESD S20.20, with ANSI/ESD S541 covering packaging. Treat the ranges above as a guide and check them against your own ESD control plan." },
      { type: "heading", text: "How ESD PP corrugated sheet is made" },
      { type: "paragraph", text: "ESD PP corrugated sheet is extruded with carbon black mixed through the polymer. Because the conductive material runs through the whole sheet rather than sitting on the surface, the property does not wear off with handling or washing, and it does not depend on the humidity in the room. That is the main difference from pink anti-static film or coated products, which can lose performance over time or in dry air." },
      { type: "callout", text: "A black colour on its own proves nothing. Ordinary PP is often black too. Always ask for measured resistivity, not just a colour or a label." },
      { type: "heading", text: "What to ask your supplier" },
      { type: "list", items: [
        "Measured surface resistivity, the test method used and the humidity at the time of testing.",
        "Whether the property runs through the sheet or is a surface coating.",
        "Whether partitions, inserts and lids are made from the same ESD sheet as the box or tray.",
        "Whether rivets, foam or labels added to the packaging are also ESD-safe. One insulating part can undo the rest.",
        "How often they re-test production batches.",
      ] },
      { type: "heading", text: "Using ESD packaging on the shop floor" },
      { type: "paragraph", text: "ESD packaging only protects parts inside an ESD protected area that is set up properly: grounded benches and operators, and no ordinary plastic bags or foam left near sensitive parts. Mark ESD trays and bins clearly so they do not get mixed with standard packaging, and include them in your periodic resistivity checks." },
      { type: "heading", text: "Our ESD tray" },
      { type: "paragraph", text: "Our ESD anti-static tray (TRY-05) is made from 4 mm conductive-flute PP with a measured surface resistivity of 10⁴–10⁶ Ω/sq. The standard size is 450×350×50 mm and it can be made to your part size, with ESD partitions cut to hold each part separately. Send us the part dimensions and quantity per tray for a quote." },
    ],
    faqs: [
      { q: "Is black PP packaging always ESD-safe?", a: "No. Ordinary PP is often black as well. Only packaging with measured surface resistivity in the conductive or dissipative range is ESD-safe, so ask for the test data." },
      { q: "What is the difference between anti-static and conductive packaging?", a: "Anti-static material resists building up a charge but does not drain one away. Conductive material drains charge to ground quickly. For sensitive electronics, conductive or dissipative packaging is normally required." },
      { q: "Can partitions and inserts be ESD-safe too?", a: "Yes. They can be cut from the same conductive PP sheet as the tray, so every surface that touches the part drains charge." },
      { q: "What surface resistivity does your ESD tray have?", a: "Our ESD anti-static tray measures 10⁴–10⁶ Ω/sq and is made from 4 mm conductive-flute PP." },
    ],
  },

  // ——————————————————————————————————————————
  // How to specify a PP box or tray
  // ——————————————————————————————————————————
  {
    slug: "pp-corrugated-specification-guide",
    title: "How to Specify a PP Corrugated Box or Tray (and Get an Accurate Quote)",
    category: "Industry Guide",
    categoryColor: "#2563EB",
    date: "November 2026",
    readTime: "6 min",
    coverImage: "/blog/pp-corrugated-specification-guide.png",
    answer:
      "To get an accurate quote for a PP corrugated box or tray, give the supplier the internal dimensions, the weight of the parts and how many go in each box, the sheet thickness you need (usually 3–6 mm), the joining method, how boxes are stacked and moved, and the yearly quantity. A drawing or photo of the part removes most of the guesswork.",
    excerpt:
      "Most quote delays come from missing information. This is the checklist we use: dimensions, thickness, joining, load, inserts, printing and quantity.",
    relatedProducts: ["pp-box-open-top-riveted", "pp-box-collapsible", "pp-tray-stackable-interlock"],
    content: [
      { type: "paragraph", text: "A PP corrugated box looks simple, but the price and the service life depend on a handful of choices: size, sheet thickness, how the seams are joined, what goes inside and how it is handled. Getting these right the first time saves a round of samples and a week or two of back and forth." },
      { type: "heading", text: "1. Internal or external dimensions?" },
      { type: "paragraph", text: "Always say which you mean. Your parts care about the inside of the box; your racks, trolleys and pallets care about the outside. Each wall adds its sheet thickness, so a box made from 4 mm sheet is about 8 mm larger on the outside in each direction than on the inside. If space on a pallet or shelf is tight, give us both numbers and we will work out the closest fit." },
      { type: "heading", text: "2. Sheet thickness" },
      { type: "paragraph", text: "PP corrugated sheet comes in several thicknesses. Thicker sheet is stiffer and carries more load, but it costs more and takes more space. As a starting point, these are the thicknesses used across our standard range:" },
      { type: "table", rows: [
        { label: "Thickness", value: "Typically used for" },
        { label: "3 mm", value: "Partitions, separators and standard layer pads" },
        { label: "4 mm", value: "Most boxes and trays, ESD trays" },
        { label: "5 mm", value: "Stackable trays, bins and floor protection sheets" },
        { label: "6 mm", value: "Large, heavy-duty boxes (our 800×600×500 mm riveted box is rated up to 25 kg static load)" },
      ] },
      { type: "heading", text: "3. How the box is joined" },
      { type: "table", rows: [
        { label: "Joining method", value: "Best for" },
        { label: "Riveted seams", value: "Heavy loads and rough handling; easy to repair" },
        { label: "Ultrasonic weld", value: "Pharma and clean areas: no rivet heads, smooth inside, wipe-clean" },
        { label: "Top-flap interlock", value: "Frequent opening and closing on assembly lines" },
        { label: "Detachable lid / Velcro closure", value: "Dust protection and kitting" },
        { label: "Collapsible", value: "Return loops where empty boxes travel back folded flat" },
      ] },
      { type: "heading", text: "4. Load, stacking and handling" },
      { type: "paragraph", text: "Tell us the weight of the contents, how many boxes are stacked on top of each other, and whether they move by hand, on conveyors, on trolleys or by forklift. Hand-carried boxes need hand holes; conveyor boxes need a smooth base without protruding rivets; stacked boxes may need reinforced corners or interlocking lids." },
      { type: "heading", text: "5. Inserts and partitions" },
      { type: "paragraph", text: "If parts must not touch each other, describe the part and how many go in each box. Cross-partition grids work for regular shapes; die-cut inserts hold irregular parts in a fixed position. A photo of the part next to a ruler is often enough for a first design." },
      { type: "heading", text: "6. Colour and printing" },
      { type: "paragraph", text: "Colour is a cheap way to separate lines, customers or part families. Part numbers, logos and handling instructions can be screen printed in our plant, up to four colours." },
      { type: "heading", text: "7. Quantity" },
      { type: "paragraph", text: "Give the first order quantity and the expected yearly volume. Catalogue boxes start at 25 units. Custom sizes and printed boxes are priced better at higher volumes because set-up is shared across more pieces." },
      { type: "heading", text: "The quote checklist" },
      { type: "list", items: [
        "Internal (and if relevant external) dimensions in mm",
        "Weight of contents and quantity per box",
        "Sheet thickness, or let us recommend one",
        "Joining method and whether you need a lid",
        "Stacking height and how the box is moved",
        "Inserts or partitions, with a part photo or drawing",
        "Colour and any printing",
        "First order and yearly quantity, and delivery city",
      ] },
    ],
    faqs: [
      { q: "What sheet thickness should I choose?", a: "4 mm suits most boxes and trays. Use 3 mm for partitions and layer pads, 5 mm for bins and stackable trays, and 6 mm for large heavy-duty boxes." },
      { q: "Do I need a drawing to get a quote?", a: "No. Internal dimensions, the part weight and quantity per box, and a photo of the part are enough for a first quote. A drawing helps for inserts and tight fits." },
      { q: "Can you print our part numbers or logo on the boxes?", a: "Yes. We screen print on PP corrugated in our Pune plant, up to four colours." },
      { q: "What is the minimum order for PP boxes?", a: "Catalogue boxes start at 25 units. Custom sizes and printed boxes are quoted on quantity." },
    ],
  },

  // ——————————————————————————————————————————
  // PP layer pads
  // ——————————————————————————————————————————
  {
    slug: "pp-layer-pads-palletisation",
    title: "PP Layer Pads for Pallets: Sizes, Thickness and When They Beat Paper Slip Sheets",
    category: "Product Guide",
    categoryColor: "#7C3AED",
    date: "November 2026",
    readTime: "5 min",
    coverImage: "/blog/pp-layer-pads-palletisation.png",
    answer:
      "PP layer pads are flat polypropylene corrugated sheets placed between layers of cartons, bottles or parts on a pallet. They spread the load and keep each layer stable, and unlike paper slip sheets they do not soften with moisture and can be reused hundreds of times. Common sizes match the pallet, such as 1200×1000 mm or 1000×1000 mm, in 3–4 mm sheet.",
    excerpt:
      "What layer pads do, how PP compares with paper and board slip sheets, and how to pick size, thickness and colour.",
    relatedProducts: ["pp-layer-pad-heavy-duty", "pp-sep-cross-partition", "pp-flooring-protection-sheet"],
    content: [
      { type: "paragraph", text: "A layer pad, also called a tier sheet or slip sheet, sits between each layer of goods on a pallet. It gives the next layer a flat, even surface, spreads the weight so lower layers are not crushed at the edges, and stops products from shifting during transport. Bottling plants, glass and container makers, and anyone stacking cartons several layers high use them." },
      { type: "heading", text: "PP versus paper and board" },
      { type: "table", rows: [
        { label: "Feature", value: "PP layer pad | Paper or board slip sheet" },
        { label: "Moisture", value: "PP does not absorb water | Board softens and warps when damp" },
        { label: "Reuse", value: "PP: 200–500 trips in our range | Board: usually one or a few uses" },
        { label: "Cleaning", value: "PP can be washed or wiped | Board cannot" },
        { label: "Dust and fibres", value: "PP sheds none | Board can shed fibres" },
        { label: "Upfront cost", value: "PP costs more per piece | Board is cheaper per piece" },
      ] },
      { type: "paragraph", text: "The trade-off is simple. If pads come back to you, PP costs less per trip within a short time and removes a steady stream of waste board. If pallets leave your loop for good, for example on export shipments, a paper slip sheet is usually the practical choice." },
      { type: "heading", text: "Choosing the size" },
      { type: "paragraph", text: "Match the pad to the pallet footprint. 1200×1000 mm and 1000×1000 mm are the most common in India. Many users go a few millimetres under the pallet size so pads do not overhang and get caught by forklifts or stretch-wrap machines. Rounded corners also reduce snagging and edge damage." },
      { type: "heading", text: "Choosing the thickness" },
      { type: "list", items: [
        "3 mm: standard cartons and lighter loads. Our standard pad, 1200×1000 mm, is rated for 200–500 trips.",
        "4 mm: heavier or more fragile layers such as glass sheets and bottles. Our heavy-duty pad, 1000×1000 mm, is rated for 300–500 trips.",
      ] },
      { type: "heading", text: "Colour coding" },
      { type: "paragraph", text: "Standard pads are available in blue, green, red, yellow and black. Different colours for different customers, plants or product lines make it easy to sort returns and spot pads that have gone to the wrong place." },
      { type: "heading", text: "Keeping the return loop working" },
      { type: "list", items: [
        "Print or emboss your company name and a return address on each pad.",
        "Count pads out and in at each site; small losses add up over a year.",
        "Wash pads used with food or pharma products before they go back into service.",
        "Retire pads with cracked flutes or broken edges, and send them for PP recycling.",
      ] },
    ],
    faqs: [
      { q: "What size PP layer pad do I need?", a: "Match the pallet footprint, usually 1200×1000 mm or 1000×1000 mm, often a few millimetres smaller so the pad does not overhang. We also cut custom sizes." },
      { q: "How many times can a PP layer pad be reused?", a: "Our standard 3 mm pad is rated for 200–500 trips and the 4 mm heavy-duty pad for 300–500 trips, depending on load and handling." },
      { q: "Can PP layer pads be washed?", a: "Yes. PP does not absorb water, so pads can be washed or wiped clean between uses." },
      { q: "What colours are available?", a: "Standard pads come in blue, green, red, yellow and black, which helps with colour coding by customer or line." },
    ],
  },

  // ——————————————————————————————————————————
  // ESG / sustainability measurement
  // ——————————————————————————————————————————
  {
    slug: "pp-corrugated-esg-sustainability",
    title: "Returnable PP Packaging and Your ESG Report: How to Measure the Difference Honestly",
    category: "Industry Trends",
    categoryColor: "#059669",
    date: "November 2026",
    readTime: "6 min",
    coverImage: "/blog/pp-corrugated-esg-sustainability.png",
    answer:
      "Switching one-way cardboard to returnable PP corrugated cuts packaging waste because each PP box replaces many single-use boxes over its life. The honest way to report it is per trip: divide the weight of packaging you buy each year by the number of trips it supports, before and after the switch, and include losses and end-of-life recycling. PP is recyclable as resin code 5.",
    excerpt:
      "A simple per-trip method for measuring the waste reduction from returnable PP packaging, the factors that shrink the benefit, and what to report.",
    relatedProducts: ["pp-box-collapsible", "pp-bin-nesting-tapered", "pp-picking-bin-open-front"],
    content: [
      { type: "paragraph", text: "Many manufacturers now report packaging waste to customers, auditors or their own ESG teams. Returnable PP packaging can make a real difference to those numbers, but only if it is measured properly. Claims based on the best possible case tend to fall apart in an audit." },
      { type: "heading", text: "Measure packaging per trip" },
      { type: "paragraph", text: "The fair comparison is how much packaging material is used each time goods move from one point to another." },
      { type: "list", items: [
        "One-way packaging: weight per trip = weight of one box (it is used once).",
        "Returnable packaging: weight per trip = weight of one box ÷ the number of trips it actually completes.",
      ] },
      { type: "paragraph", text: "An illustration, with round numbers you should replace with your own weighed figures: a single-use carton weighing 0.8 kg uses 0.8 kg of material per trip. A PP box weighing 2.4 kg that completes 100 trips uses 0.024 kg per trip. Even if the PP box only lasts half as long as planned, the difference stays large." },
      { type: "heading", text: "What shrinks the benefit" },
      { type: "list", items: [
        "Losses: boxes that never come back have to be replaced. Track the return rate; it is often the biggest variable.",
        "Return transport: empty boxes travel back. Collapsible and nesting designs reduce the space they take on the way back.",
        "Cleaning: washing uses water and energy, which matters for food and pharma loops.",
        "Over-specification: a thicker, heavier box than the load needs adds material without adding trips.",
      ] },
      { type: "heading", text: "End of life" },
      { type: "paragraph", text: "PP is a single polymer, resin identification code 5, and can be mechanically recycled where collection exists. Retire damaged boxes to a plastics recycler rather than general waste, and keep a record of the weight sent. Rivets and labels should be removed where possible to keep the material clean." },
      { type: "heading", text: "Regulation in India" },
      { type: "paragraph", text: "India's Plastic Waste Management Rules place Extended Producer Responsibility (EPR) obligations on producers, importers and brand owners that put plastic packaging on the market. How these apply to industrial returnable packaging that stays inside a closed loop depends on your situation, so check with your compliance team or consultant and keep records of quantities bought, in circulation and recycled." },
      { type: "heading", text: "What to collect each year" },
      { type: "table", rows: [
        { label: "Data", value: "Why it matters" },
        { label: "Packaging bought (pieces and kg)", value: "Total material entering the loop" },
        { label: "Trips completed", value: "Turns material into material per trip" },
        { label: "Boxes lost or scrapped", value: "Shows the real service life" },
        { label: "Weight sent for recycling", value: "End-of-life reporting" },
        { label: "One-way packaging avoided", value: "The headline waste reduction" },
      ] },
      { type: "paragraph", text: "If you are planning a switch, start with one closed loop between two sites, measure it for three to six months, and use those numbers rather than estimates in your report." },
    ],
    faqs: [
      { q: "Is PP corrugated recyclable?", a: "Yes. PP corrugated is a single polymer, resin code 5, and can be mechanically recycled where a collection route exists." },
      { q: "Does returnable packaging always reduce waste?", a: "Only when boxes actually come back. If many are lost, or return journeys are very long, the benefit falls. Measure the return rate before claiming savings." },
      { q: "How do I calculate packaging waste per trip?", a: "Divide the weight of one box by the number of trips it completes. For one-way packaging the number of trips is one." },
    ],
  },

  // ——————————————————————————————————————————
  // Cold rooms and condensation
  // ——————————————————————————————————————————
  {
    slug: "cold-chain-board-packaging",
    title: "Packaging for Cold Rooms and Condensation: PP Corrugated vs Paper Board",
    category: "Industry Guide",
    categoryColor: "#2563EB",
    date: "November 2026",
    readTime: "5 min",
    coverImage: "/blog/cold-chain-board-packaging.png",
    answer:
      "Paper board loses much of its strength as it absorbs moisture, so cartons moving in and out of cold rooms can sag or collapse when condensation forms on them. PP corrugated does not absorb water, so it keeps its strength through repeated cold and humid cycles; our PP boxes are rated for −10 °C to +60 °C. For one-way export shipments, board with a moisture-resistant coating is still the practical choice.",
    excerpt:
      "Why cartons fail when they leave the cold room, how PP corrugated behaves, and when coated board is still the right answer.",
    relatedProducts: ["pp-box-ultrasonic-weld", "pp-box-detachable-lid", "pp-layer-pad-heavy-duty"],
    content: [
      { type: "paragraph", text: "Cold rooms are hard on packaging, but the damage usually happens on the way out. When a cold box meets warm, humid air, water condenses on every surface. In Pune's monsoon months that can mean a wet carton within minutes of leaving the chiller." },
      { type: "heading", text: "What moisture does to board" },
      { type: "paragraph", text: "Paper and board are made of cellulose fibres that take up water. As moisture content rises, the fibres soften, stiffness and compression strength drop, and boxes at the bottom of a stack start to bulge and lean. Repeated cold and warm cycles make it worse because the board never fully dries out." },
      { type: "heading", text: "How PP corrugated behaves" },
      { type: "list", items: [
        "PP does not absorb water, so condensation sits on the surface and can be wiped off.",
        "Strength stays the same through repeated cold, warm and humid cycles.",
        "Boxes can be washed between uses, which matters for food and pharma loops.",
        "Our PP boxes are rated for −10 °C to +60 °C.",
      ] },
      { type: "callout", text: "Below its rated temperature, PP becomes more brittle and can crack under impact. For freezer use below −10 °C, tell us the temperature and how the boxes are handled before ordering." },
      { type: "heading", text: "When coated board is still the right choice" },
      { type: "paragraph", text: "If cartons leave your hands for good, such as export shipments or retail packs, returnable PP makes little sense. In that case use board with wet-strength liners or moisture-resistant coatings, store it dry before use, and let packed goods come up to temperature in a controlled area before they meet humid air." },
      { type: "heading", text: "Choosing PP boxes for cold rooms" },
      { type: "table", rows: [
        { label: "Need", value: "Option" },
        { label: "Hygiene, wipe-clean inside", value: "Ultrasonic-welded box (no rivet heads)" },
        { label: "Keep out dust and drips", value: "Box with detachable lid" },
        { label: "Stable pallets of cold goods", value: "Heavy-duty PP layer pads between layers" },
        { label: "Air flow for cooling", value: "Vent holes cut into the sides (specify size and position)" },
      ] },
    ],
    faqs: [
      { q: "Can PP corrugated boxes be used in cold rooms?", a: "Yes. PP does not absorb condensation, so it keeps its strength in and out of cold rooms. Our PP boxes are rated for −10 °C to +60 °C." },
      { q: "Can PP boxes go in a freezer?", a: "Our boxes are rated down to −10 °C. Below that PP becomes more brittle, so tell us the temperature and handling before ordering for freezer use." },
      { q: "Why do cardboard boxes collapse after cold storage?", a: "Condensation forms when cold cartons meet warm, humid air. Board absorbs the water, loses stiffness and compression strength, and stacks begin to lean or collapse." },
      { q: "Can you add vent holes to PP boxes?", a: "Yes. Give us the size and position you need and we cut them during production." },
    ],
  },

  // ——————————————————————————————————————————
  // FSC chain of custody
  // ——————————————————————————————————————————
  {
    slug: "fsc-certification-india-guide",
    title: "FSC Chain of Custody for Packaging Buyers in India: What It Means and What to Ask",
    category: "Compliance",
    categoryColor: "#DC2626",
    date: "November 2026",
    readTime: "5 min",
    coverImage: "/blog/fsc-certification-india-guide.png",
    answer:
      "FSC chain of custody (CoC) certification tracks certified wood fibre from the forest to the finished product. To print the FSC label on cartons, the company that makes and labels them, usually the carton printer, must hold its own CoC certificate and buy board with the FSC claim stated on the invoice. Pune Global Group's FSC chain of custody code is FSC C064218.",
    excerpt:
      "Who needs an FSC certificate, what has to appear on invoices, and how to check a supplier's code before you print the logo.",
    relatedProducts: ["cyber-xlpac-gc1", "pearlxl-packaging", "cyber-premium"],
    content: [
      { type: "paragraph", text: "More export customers and global brands now ask for FSC-labelled packaging. The rules behind the label are strict, and mistakes usually show up during a customer audit rather than at the printing press." },
      { type: "heading", text: "What chain of custody means" },
      { type: "paragraph", text: "Forest Stewardship Council (FSC) certification has two parts. Forest management certification covers how a forest is run. Chain of custody certification covers every company that buys, processes and sells the material afterwards, so that certified fibre can be traced all the way to the finished carton." },
      { type: "heading", text: "Who needs a certificate" },
      { type: "table", rows: [
        { label: "Company", value: "Needs its own FSC CoC?" },
        { label: "Board mill", value: "Yes" },
        { label: "Board trader or distributor (like us)", value: "Yes, if it sells board with an FSC claim" },
        { label: "Carton printer or converter that applies the label", value: "Yes" },
        { label: "Brand that buys finished, labelled cartons", value: "No CoC, but needs an FSC trademark licence to promote FSC on its own materials" },
      ] },
      { type: "heading", text: "The three FSC claims" },
      { type: "list", items: [
        "FSC 100%: all fibre comes from FSC-certified forests.",
        "FSC Mix: a mix of certified fibre, recycled fibre and controlled wood.",
        "FSC Recycled: all fibre is reclaimed or recycled.",
      ] },
      { type: "heading", text: "What must appear on the invoice" },
      { type: "paragraph", text: "Every invoice and delivery document for FSC material must show the FSC claim (for example FSC Mix Credit) and the seller's CoC code. Without both, the material cannot be sold on as FSC, even if it came from a certified mill." },
      { type: "heading", text: "How to check a supplier" },
      { type: "list", items: [
        "Ask for the CoC code. It looks like FSC C000000. Ours is FSC C064218.",
        "Look the code up in FSC's public certificate database and check that it is valid and covers the products you buy.",
        "Check that the claim on the invoice matches what you intend to print on the carton.",
        "Keep invoices on file; auditors trace claims back through them.",
      ] },
      { type: "paragraph", text: "We supply ITC PSPD FBB grades with FSC claims and our CoC code on every invoice. If your printer needs board with a specific claim, tell us when you order." },
    ],
    faqs: [
      { q: "Do I need FSC certification to put the FSC logo on my cartons?", a: "The company that makes and labels the cartons, usually your printer, needs FSC chain of custody certification. A brand that only buys finished labelled cartons needs an FSC trademark licence to promote FSC, not a CoC certificate." },
      { q: "What is Pune Global Group's FSC code?", a: "Our FSC chain of custody code is FSC C064218." },
      { q: "What should an FSC invoice show?", a: "The FSC claim, such as FSC Mix Credit, and the seller's chain of custody code." },
      { q: "How do I check if an FSC certificate is valid?", a: "Search the supplier's CoC code in FSC's public certificate database and confirm it is valid and covers the products you are buying." },
    ],
  },
];
