"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ppFamilies, PPVariant } from "@/lib/pp-data";

/* ─── Design Tokens (matches site) ──────────────────────────────────────────── */
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  dark:      "#141210",
  border:    "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.16)",
  borderStr: "rgba(28,26,23,0.28)",
  pp:        "#1A3A5C",     // deep engineering blue — PP accent
  ppLight:   "rgba(26,58,92,0.08)",
  ppMid:     "rgba(26,58,92,0.18)",
  saffron:   "#F5A623",
};
const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
  mono:    "'DM Mono', 'Courier New', monospace",
};

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.cream}; color: ${C.charcoal}; font-family: ${F.body}; -webkit-font-smoothing: antialiased; }

  /* Grain overlay */
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9998; opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes ruleGrow { from { transform:scaleX(0); transform-origin:left; } to { transform:scaleX(1); transform-origin:left; } }
  .fade-up   { animation: fadeUp 0.85s ease both; }
  .fade-in   { animation: fadeIn 0.6s ease both; }
  .rule-grow { animation: ruleGrow 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
  .d1 { animation-delay: 0.08s; }
  .d2 { animation-delay: 0.18s; }
  .d3 { animation-delay: 0.30s; }
  .d4 { animation-delay: 0.44s; }
  .d5 { animation-delay: 0.58s; }

  /* Scroll reveal */
  .sr { opacity:0; transform:translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr.vis { opacity:1; transform:translateY(0); }

  /* Nav */
  .nav-link { font-family:${F.body}; font-size:0.875rem; color:${C.warm}; text-decoration:none;
    position:relative; padding:4px 0; transition:color 0.2s; }
  .nav-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px;
    background:${C.charcoal}; transition:width 0.28s; }
  .nav-link:hover { color:${C.charcoal}; }
  .nav-link:hover::after { width:100%; }

  /* Buttons */
  .btn-primary { display:inline-flex; align-items:center; gap:8px; background:${C.charcoal}; color:${C.cream};
    font-family:${F.body}; font-size:0.78rem; font-weight:500; letter-spacing:0.09em; text-transform:uppercase;
    padding:13px 30px; border:none; border-radius:1px; cursor:pointer; transition:background 0.2s, transform 0.15s;
    text-decoration:none; }
  .btn-primary:hover { background:${C.dark}; transform:translateY(-1px); }
  .btn-ghost { display:inline-flex; align-items:center; gap:6px; background:transparent; color:${C.charcoal};
    font-family:${F.body}; font-size:0.75rem; font-weight:500; letter-spacing:0.08em; text-transform:uppercase;
    padding:10px 20px; border:1px solid ${C.borderMid}; border-radius:1px; cursor:pointer;
    transition:all 0.2s; text-decoration:none; }
  .btn-ghost:hover { background:${C.charcoal}; color:${C.cream}; }
  .btn-pp { display:inline-flex; align-items:center; gap:8px; background:${C.pp}; color:${C.cream};
    font-family:${F.body}; font-size:0.78rem; font-weight:500; letter-spacing:0.09em; text-transform:uppercase;
    padding:13px 30px; border:none; border-radius:1px; cursor:pointer; transition:all 0.2s; text-decoration:none; }
  .btn-pp:hover { background:#102742; transform:translateY(-1px); }

  /* Product cards */
  .variant-card { transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s; cursor:pointer; }
  .variant-card:hover { border-color:${C.pp} !important; transform:translateY(-4px);
    box-shadow:0 12px 32px rgba(26,58,92,0.10); }

  /* Image crossfade — all 3 images stacked, opacity toggled via .active */
  .carousel-img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; opacity: 0;
    transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }
  .carousel-img.active { opacity: 1; }

  /* Dot touch area — invisible padding for 44px tap target */
  .dot-wrap { display:flex; gap:5px; padding: 8px 12px; cursor:pointer; }
  .dot-pip {
    height: 6px; border-radius: 3px; border: none; cursor: pointer;
    transition: width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease;
    padding: 0; display: block;
  }

  /* Spec pills */
  .spec-pill { font-family:${F.mono}; font-size:0.65rem; font-weight:400; color:${C.taupe};
    background:${C.parchment}; border:1px solid ${C.border}; padding:2px 8px; border-radius:1px;
    white-space:nowrap; }
  .spec-pill-pp { font-family:${F.mono}; font-size:0.65rem; font-weight:500; color:${C.pp};
    background:${C.ppLight}; border:1px solid ${C.ppMid}; padding:2px 8px; border-radius:1px;
    white-space:nowrap; }

  /* Systems diagram */
  .sys-node-card { transition: background 0.2s, border-color 0.2s; }

  /* Family divider */
  .family-rule { display:flex; align-items:center; gap:1.5rem; margin-bottom:2.5rem; }
  .family-label { font-family:${F.body}; font-size:0.68rem; font-weight:600; letter-spacing:0.18em;
    text-transform:uppercase; color:${C.pp}; white-space:nowrap; }
  .family-line { flex:1; height:1px; background:${C.border}; }
  .family-count { font-family:${F.mono}; font-size:0.65rem; color:${C.taupe}; white-space:nowrap; }

  /* Lifecycle table */
  .lc-table { width:100%; border-collapse:collapse; }
  .lc-table th { font-family:${F.body}; font-size:0.72rem; font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${C.taupe}; padding:0.9rem 1.2rem; text-align:left;
    border-bottom:2px solid ${C.borderMid}; }
  .lc-table td { font-family:${F.body}; font-size:0.88rem; color:${C.charcoal};
    padding:1rem 1.2rem; border-bottom:1px solid ${C.border}; }
  .lc-table tr:last-child td { border-bottom:none; }
  .lc-table tr.pp-row td { background:${C.ppLight}; font-weight:500; }
  .lc-table tr.pp-row td:first-child { border-left:3px solid ${C.pp}; }

  /* Responsive */
  @media(max-width:960px) { .hero-img-col { display: none !important; } .pp-hero-grid { grid-template-columns: 1fr !important; } }
  @media(max-width:520px) { .pp-eyebrow-row { flex-wrap: wrap !important; gap: 0.5rem !important; } .pp-eyebrow-rule { display: none !important; } .pp-eyebrow-tag { display: none !important; } }
  @media(max-width:900px) {
    .family-grid { grid-template-columns: repeat(2,1fr) !important; }
    .cap-grid { grid-template-columns: repeat(2,1fr) !important; }
    .sys-flow { flex-direction:column !important; align-items:stretch !important; }
    .sys-flow > div { flex: 1 0 auto !important; width: 100%; }
    .lc-wrap { overflow-x:auto; }
  }
  @media(max-width:580px) {
    /* Family grid: horizontal scroll carousel instead of single column */
    .family-grid {
      display: flex !important;
      overflow-x: auto !important;
      scroll-snap-type: x mandatory !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important;
      gap: 12px !important;
      padding-bottom: 1rem !important;
    }
    .family-grid::-webkit-scrollbar { display: none; }
    .family-grid > * { flex: 0 0 85vw !important; max-width: 320px !important; scroll-snap-align: start !important; }
    .cap-grid { grid-template-columns: 1fr 1fr !important; }
    /* Carousel: taller hit area on small screens */
    .carousel-wrap { height: 248px !important; }
    /* CTA: stack vertically */
    .cta-grid { grid-template-columns: 1fr !important; }
    .cta-btn-group { flex-direction: column !important; }
    /* Hero: tighter vertical rhythm */
    .hero-section { padding-top: 48px !important; padding-bottom: 44px !important; }
  }
  @media(max-width:380px) {
    .cap-grid { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Scroll reveal hook ─────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); obs.unobserve(e.target); } }); },
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── 3-Image Card Carousel ──────────────────────────────────────────────────── */
function VariantCarousel({ images, name }: { images: [string, string, string]; name: string }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(c => (c + 1) % 3), 4000);
    return () => clearInterval(t);
  }, [paused]);

  const labels = ["Studio", "Engineering", "In Use"];

  return (
    <div
      className="carousel-wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 36) setIdx(c => dx < 0 ? (c + 1) % 3 : (c + 2) % 3);
      }}
      style={{ position: "relative", height: "220px", overflow: "hidden", background: C.parchment }}
    >
      {/* All 3 images stacked — crossfade via CSS opacity transition */}
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={`${name} — ${labels[i]}`}
          className={`carousel-img${i === idx ? " active" : ""}`}
        />
      ))}

      {/* Dot indicators — large touch target via .dot-wrap padding */}
      <div style={{
        position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)",
      }}>
        <div className="dot-wrap">
          {[0, 1, 2].map(i => (
            <button
              key={i}
              className="dot-pip"
              onClick={(e) => { e.preventDefault(); setIdx(i); }}
              aria-label={labels[i]}
              style={{
                width: i === idx ? "18px" : "6px",
                background: i === idx ? C.cream : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Label badge */}
      <div style={{
        position: "absolute", top: "10px", right: "10px",
        fontFamily: F.mono, fontSize: "0.58rem", fontWeight: 500,
        color: C.cream, background: "rgba(28,26,23,0.55)",
        padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.08em",
        textTransform: "uppercase", backdropFilter: "blur(4px)",
      }}>
        {labels[idx]}
      </div>
    </div>
  );
}

/* ─── Variant Card ───────────────────────────────────────────────────────────── */
function VariantCard({ variant, delay }: { variant: PPVariant; delay: number }) {
  return (
    <Link href={`/products/pp-corrugated/${variant.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
      <div
        className="variant-card sr"
        style={{
          background: "#fff", border: `1px solid ${C.border}`, borderRadius: "1px",
          overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
          animationDelay: `${delay}s`,
        }}
      >
        <VariantCarousel images={variant.images} name={variant.name} />

        <div style={{ padding: "1.4rem 1.4rem 1.6rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Code + joining */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: F.mono, fontSize: "0.68rem", fontWeight: 500,
              color: C.pp, background: C.ppLight, border: `1px solid ${C.ppMid}`,
              padding: "3px 8px", borderRadius: "1px",
            }}>
              {variant.code}
            </span>
            <span style={{
              fontFamily: F.body, fontSize: "0.65rem", color: C.taupe,
              background: C.parchment, border: `1px solid ${C.border}`,
              padding: "3px 8px", borderRadius: "1px",
            }}>
              {variant.joining}
            </span>
          </div>

          {/* Name */}
          <h3 style={{
            fontFamily: F.display, fontSize: "1.1rem", fontWeight: 600,
            color: C.charcoal, lineHeight: 1.25,
          }}>
            {variant.name}
          </h3>

          {/* Spec pills row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            <span className="spec-pill">{variant.dimensions}</span>
            <span className="spec-pill">{variant.thickness}</span>
            <span className="spec-pill-pp">{variant.reuseCycles}</span>
          </div>

          {/* Color */}
          <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.taupe, fontWeight: 300 }}>
            Colour: <span style={{ color: C.charcoal, fontWeight: 400 }}>{variant.color}</span>
          </p>

          {/* Use cases */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
            {variant.useCases.map((uc, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span style={{ color: C.pp, fontSize: "0.6rem", marginTop: "4px", flexShrink: 0 }}>▶</span>
                <span style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.warm, lineHeight: 1.5 }}>{uc}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px", paddingTop: "0.5rem",
            borderTop: `1px solid ${C.border}`, marginTop: "0.25rem",
          }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
              color: C.pp, letterSpacing: "0.04em",
            }}>
              View Full Specs
            </span>
            <span style={{ color: C.pp, fontSize: "0.78rem" }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Family Section ─────────────────────────────────────────────────────────── */
function FamilySection({ family, index }: { family: typeof ppFamilies[0]; index: number }) {
  return (
    <section
      id={family.id}
      style={{
        padding: "4rem clamp(1.5rem, 5vw, 4rem)",
        background: index % 2 === 0 ? C.cream : "#F5F1EA",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Family header */}
        <div className="family-rule sr">
          <span className="family-label">{family.name}</span>
          <div className="family-line" />
          <span className="family-count">{family.variants.length} {family.variants.length === 1 ? "variant" : "variants"}</span>
        </div>

        <p className="sr" style={{
          fontFamily: F.body, fontSize: "0.95rem", color: C.taupe, lineHeight: 1.75,
          maxWidth: "640px", fontWeight: 300, marginBottom: "2.5rem",
        }}>
          {family.descriptor}
        </p>

        {/* Variants grid */}
        <div
          className="family-grid"
          style={{
            display: "grid",
            gridTemplateColumns: family.variants.length === 1
              ? "repeat(1, minmax(0, 480px))"
              : family.variants.length === 2
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
        >
          {family.variants.map((v, i) => (
            <VariantCard key={v.code} variant={v} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}


/* ─── Capability Stats ───────────────────────────────────────────────────────── */
const CAPS = [
  { stat: "2–10 mm",            label: "Sheet thickness",     sub: "single flute PP" },
  { stat: "3 methods",          label: "Joining systems",     sub: "rivet · ultrasonic · stitch" },
  { stat: "50–500",             label: "Reuse cycles",        sub: "per product family" },
  { stat: "4 sectors",          label: "Industries served",   sub: "auto · pharma · FMCG · export" },
  { stat: "Custom",             label: "Sheet size",          sub: "Indian market max availability" },
];

function CapabilityBar() {
  return (
    <section style={{
      padding: "3rem clamp(1.5rem, 5vw, 4rem)",
      background: C.charcoal, borderTop: `1px solid rgba(250,247,242,0.06)`,
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          className="cap-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0" }}
        >
          {CAPS.map((c, i) => (
            <div
              key={i}
              className="sr"
              style={{
                padding: "1.5rem 1.25rem",
                borderRight: i < CAPS.length - 1 ? "1px solid rgba(250,247,242,0.08)" : "none",
              }}
            >
              <div style={{
                fontFamily: F.display, fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
                fontWeight: 600, color: C.cream, lineHeight: 1.1, marginBottom: "0.4rem",
              }}>
                {c.stat}
              </div>
              <div style={{
                fontFamily: F.body, fontSize: "0.76rem", fontWeight: 500,
                color: "rgba(250,247,242,0.7)", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: "0.2rem",
              }}>
                {c.label}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: "0.62rem", color: "rgba(250,247,242,0.35)" }}>
                {c.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Lifecycle Table ────────────────────────────────────────────────────────── */
function LifecycleTable() {
  const rows = [
    { material: "Single-use corrugated carton", cost: "₹ 18–35 / unit", cycles: "1–3", perUse: "₹ 10–35", highlight: false },
    { material: "Moulded HDPE crate",           cost: "₹ 800–2,200 / unit", cycles: "200+", perUse: "₹ 4–11", highlight: false },
    { material: "PP corrugated (ours)",          cost: "₹ 120–650 / unit", cycles: "50–500", perUse: "₹ 1–13", highlight: true },
  ];

  return (
    <section style={{
      padding: "5rem clamp(1.5rem, 5vw, 4rem)",
      background: C.cream, borderTop: `1px solid ${C.border}`,
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="sr" style={{ marginBottom: "0.6rem" }}>
          <span style={{
            fontFamily: F.body, fontSize: "0.65rem", fontWeight: 600,
            letterSpacing: "0.18em", textTransform: "uppercase", color: C.pp,
          }}>
            Cost per cycle
          </span>
        </div>
        <h2 className="sr" style={{
          fontFamily: F.display, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
          fontWeight: 700, color: C.charcoal, lineHeight: 1.15,
          marginBottom: "0.75rem",
        }}>
          The Case for PP Corrugated
        </h2>
        <p className="sr" style={{
          fontFamily: F.body, fontSize: "0.95rem", color: C.taupe, lineHeight: 1.75,
          maxWidth: "540px", fontWeight: 300, marginBottom: "2.5rem",
        }}>
          Procurement teams switch when the lifecycle cost is undeniable.
          Here is the structure of that argument.
        </p>

        <div className="lc-wrap sr">
          <table className="lc-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Unit cost</th>
                <th>Typical reuse cycles</th>
                <th>Est. cost per trip</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.highlight ? "pp-row" : ""}>
                  <td style={{ fontWeight: r.highlight ? 500 : 400 }}>
                    {r.highlight && (
                      <span style={{
                        fontFamily: F.mono, fontSize: "0.62rem", color: C.pp,
                        background: C.ppLight, border: `1px solid ${C.ppMid}`,
                        padding: "1px 6px", borderRadius: "2px", marginRight: "8px",
                      }}>
                        OUR PRODUCT
                      </span>
                    )}
                    {r.material}
                  </td>
                  <td style={{ fontFamily: F.mono, fontSize: "0.82rem" }}>{r.cost}</td>
                  <td style={{ fontFamily: F.mono, fontSize: "0.82rem" }}>{r.cycles}</td>
                  <td style={{
                    fontFamily: F.mono, fontSize: "0.88rem",
                    fontWeight: r.highlight ? 600 : 400,
                    color: r.highlight ? C.pp : C.charcoal,
                  }}>
                    {r.perUse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="sr" style={{
          fontFamily: F.body, fontSize: "0.76rem", color: C.taupe,
          marginTop: "1rem", fontStyle: "italic",
        }}>
          * Indicative ranges based on standard configurations. Contact us for a cycle-cost analysis specific to your use case.
        </p>
      </div>
    </section>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero-section" style={{ padding: "48px clamp(1.5rem, 5vw, 4rem) 40px", background: C.cream }}>
      <div className="pp-hero-grid" style={{ maxWidth: "1400px", margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "clamp(2rem,5vw,5rem)", alignItems: "center" }}>

        {/* LEFT */}
        <div>
          <div className="fade-up d1 pp-eyebrow-row" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <span style={{
              fontFamily: F.mono, fontSize: "0.65rem", fontWeight: 500,
              color: C.pp, background: C.ppLight, border: `1px solid ${C.ppMid}`,
              padding: "4px 10px", borderRadius: "1px", letterSpacing: "0.1em",
            }}>
              PP CORRUGATED SYSTEMS
            </span>
            <div className="rule-grow pp-eyebrow-rule" style={{ flex: 1, height: "1px", background: C.border, maxWidth: "300px" }} />
            <span className="pp-eyebrow-tag" style={{ fontFamily: F.body, fontSize: "0.65rem", color: C.taupe,
              letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Single-flute · 7 families · 20+ variants
            </span>
          </div>

          <h1 className="fade-up d2" style={{
            fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.8rem)",
            lineHeight: 1.05, color: C.charcoal, letterSpacing: "-0.028em",
          }}>
            Industrial handling
            <br />
            <em style={{ fontWeight: 400, color: C.warm }}>&amp; protection systems.</em>
          </h1>

          <div style={{ height: "1px", background: C.borderMid, margin: "2rem 0" }} />

          <p className="fade-up d3" style={{
            fontFamily: F.body, fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
            color: C.taupe, lineHeight: 1.85, maxWidth: "580px", fontWeight: 300,
          }}>
            We convert single-flute PP corrugated sheet into returnable
            industrial packaging — boxes, trays, separators, layer pads,
            bins, and flooring — engineered for your plant, not your catalogue.
          </p>

          <div className="fade-up d4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2.5rem" }}>
            <Link href="/contact" className="btn-pp">Request a System Quote →</Link>
            <Link href="/products" className="btn-ghost">← All Products</Link>
          </div>
        </div>

        {/* RIGHT — PP product image + badge */}
        <div className="hero-img-col" style={{
          position: "relative",
          height: "clamp(380px, 55vh, 560px)",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(28,26,23,0.10)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-pp-family.jpg"
            alt="PP corrugated product family — boxes, trays, bins, layer pads, separators"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", bottom: "1.5rem", right: "1.5rem",
            background: "rgba(20,18,16,0.88)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            borderRadius: "8px", padding: "0.8rem 1.1rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
            border: "1px solid rgba(250,247,242,0.10)",
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#F5A623" strokeWidth="1.5"/>
              <polyline points="5,9 8,12 13,6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontFamily: F.body, fontSize: "0.56rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(250,247,242,0.45)", marginBottom: "3px" }}>
                Precision Manufacturing
              </div>
              <div style={{ fontFamily: F.body, fontSize: "0.76rem", fontWeight: 500,
                color: "#FAF7F2", letterSpacing: "0.01em" }}>
                Custom to ±1 mm · Export Ready
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function PPCorrugatedPage() {
  useScrollReveal();

  return (
    <div style={{ background: C.cream, minHeight: "100vh", paddingTop: "70px" }}>
      <style>{CSS}</style>
      <Hero />
      <CapabilityBar />

      {/* Product families — above the fold priority */}
      {ppFamilies.map((family, i) => (
        <FamilySection key={family.id} family={family} index={i} />
      ))}

      <LifecycleTable />

      {/* Final CTA */}
      <section style={{
        padding: "5rem clamp(1.5rem, 5vw, 4rem)",
        background: C.pp,
      }}>
        <div className="cta-grid" style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center" }}>
          <div>
            <p style={{ display: "inline-block", fontFamily: F.body, fontStyle: "normal", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,247,242,0.65)", border: "1px solid rgba(250,247,242,0.25)", borderRadius: "999px", padding: "0.3em 1em", marginBottom: "0.9rem" }}>
              Ready to engineer your system?
            </p>
            <h2 style={{
              fontFamily: F.display, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
              fontWeight: 600, color: C.cream, lineHeight: 1.2, marginBottom: "0.75rem",
            }}>
              Tell us your part. We design the system.
            </h2>
            <p style={{
              fontFamily: F.body, fontSize: "0.9rem", color: "rgba(250,247,242,0.6)",
              maxWidth: "480px", lineHeight: 1.75, fontWeight: 300,
            }}>
              Send your component drawing, pallet layout, or handling spec.
              We will quote the full system — box, insert, tray, and layer pad — in one proposal.
            </p>
          </div>
          <div className="cta-btn-group" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flexShrink: 0 }}>
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: C.cream, color: C.pp,
              fontFamily: F.body, fontSize: "0.8rem", fontWeight: 600,
              letterSpacing: "0.09em", textTransform: "uppercase",
              padding: "14px 28px", borderRadius: "1px", textDecoration: "none",
              transition: "all 0.2s",
            }}>
              Get a System Quote →
            </Link>
            <a href="https://wa.me/919823383230" style={{
              display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center",
              background: "rgba(250,247,242,0.12)", color: C.cream,
              fontFamily: F.body, fontSize: "0.78rem", fontWeight: 400,
              padding: "11px 20px", borderRadius: "1px", textDecoration: "none",
              border: "1px solid rgba(250,247,242,0.2)", transition: "all 0.2s",
            }}>
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
