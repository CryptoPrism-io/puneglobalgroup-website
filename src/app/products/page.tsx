"use client";

import Link from "next/link";

const C = {
  cream: "#FAF7F2",
  parchment: "#EDE5D8",
  charcoal: "#1C1A17",
  warm: "#7A736D",
  taupe: "#7A736D",
  saffron: "#1C1A17",
  saffrondark: "#0D0B09",
  dark: "#1C1A17",
  deepWarm: "#1C1A17",
  navy: "#1C1A17",
  granite: "#7A736D",
  goldStart: "#FAF7F2",
  goldEnd: "#C8B89A",
  border: "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.18)",
};
const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
  mono:    "'DM Mono', 'Courier New', monospace",
};

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.cream}; color: ${C.charcoal}; font-family: ${F.body}; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9998; opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp 0.72s ease both; }
  .d1 { animation-delay: 0.06s; } .d2 { animation-delay: 0.18s; } .d3 { animation-delay: 0.3s; }

  /* Navbar */
  .nav-link { font-family:${F.body}; font-size:0.875rem; color:${C.warm}; text-decoration:none;
    position:relative; padding:4px 0; transition:color 0.2s; }
  .nav-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px;
    background:${C.charcoal}; transition:width 0.28s; }
  .nav-link:hover { color:${C.charcoal}; }
  .nav-link:hover::after { width:100%; }

  /* ── Heritage Premium ─────────────────────────────── */
  .gold-text {
    background: linear-gradient(135deg, ${C.goldStart} 0%, ${C.goldEnd} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .saffron-badge {
    display: inline-flex; align-items: center;
    background: ${C.saffron}; color: #fff;
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
    font-family: ${F.body};
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(28,26,23,0.07);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(28,26,23,0.13);
  }

  /* ── Category Cards ─────────────────────────────── */
  .cat-row {
    display: flex;
    flex: 1;
    min-height: 58vh;
  }
  .cat-divider { width: 2px; background: ${C.cream}; flex-shrink: 0; z-index: 2; }

  /* PP card — charcoal */
  .cat-pp {
    position: relative; overflow: hidden; cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column; justify-content: flex-end;
    flex: 1; transition: flex 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${C.navy};
  }
  .cat-pp:hover { flex: 1.18; }

  /* Paper card — warm cream */
  .cat-paper {
    position: relative; overflow: hidden; cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column; justify-content: flex-end;
    flex: 1; transition: flex 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${C.parchment};
  }
  .cat-paper:hover { flex: 1.18; }

  /* Full-bleed composite image fills card */
  .cat-bg-img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 0.85s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .cat-pp:hover .cat-bg-img,
  .cat-paper:hover .cat-bg-img {
    transform: scale(1.04);
  }

  /* Overlay — tinted gradient lifting text from image */
  .pp-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top,  rgba(28,26,23,0.96) 0%, rgba(28,26,23,0.72) 38%, rgba(28,26,23,0.22) 68%, rgba(28,26,23,0.04) 100%),
      linear-gradient(to right, rgba(28,26,23,0.55) 0%, rgba(28,26,23,0.0) 55%);
  }
  .paper-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top,  rgba(232,245,204,0.98) 0%, rgba(232,245,204,0.80) 36%, rgba(232,245,204,0.32) 62%, rgba(232,245,204,0.0) 100%),
      linear-gradient(to right, rgba(232,245,204,0.65) 0%, rgba(232,245,204,0.0) 55%);
  }

  /* Text content */
  .cat-content {
    position: relative; z-index: 2;
    padding: clamp(1.4rem, 4.5vw, 3.5rem);
  }

  .cat-index-row {
    display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
  }
  .cat-index-num { font-family: ${F.mono}; font-size: 0.58rem; letter-spacing: 0.22em; }
  .cat-index-rule { flex: 1; height: 1px; }
  .cat-index-tag { font-family: ${F.body}; font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; }

  .cat-eyebrow { font-family: ${F.mono}; font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.65rem; display: block; }

  .cat-title {
    font-family: ${F.display}; font-weight: 700;
    font-size: clamp(1.55rem, 3.4vw, 3.2rem);
    line-height: 1.04; letter-spacing: -0.025em; margin-bottom: 1.4rem;
  }

  .cat-stats {
    display: flex; gap: 0; flex-wrap: wrap;
    margin-bottom: 2rem;
    border-top: 1px solid; padding-top: 1rem;
  }
  .cat-stat {
    font-family: ${F.mono}; font-size: 0.62rem; letter-spacing: 0.06em;
    padding-right: 1.4rem; margin-right: 1.4rem;
    border-right: 1px solid;
  }
  .cat-stat:last-child { border-right: none; padding-right: 0; margin-right: 0; }

  .cat-cta {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: ${F.body}; font-size: 0.78rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    border-bottom: 1px solid; padding-bottom: 3px;
    transition: gap 0.25s, opacity 0.25s;
  }
  .cat-pp:hover .cat-cta,
  .cat-paper:hover .cat-cta { gap: 14px; }

  /* PP text: white */
  .cat-pp .cat-index-num   { color: rgba(250,247,242,0.35); }
  .cat-pp .cat-index-rule  { background: rgba(250,247,242,0.12); }
  .cat-pp .cat-index-tag   { color: rgba(250,247,242,0.40); }
  .cat-pp .cat-eyebrow     { color: rgba(250,247,242,0.48); }
  .cat-pp .cat-title       { color: #FAF7F2; }
  .cat-pp .cat-stats       { border-color: rgba(250,247,242,0.14); }
  .cat-pp .cat-stat        { color: rgba(250,247,242,0.50); border-color: rgba(250,247,242,0.14); }
  .cat-pp .cat-cta         { color: rgba(250,247,242,0.65); border-color: rgba(250,247,242,0.30); }
  .cat-pp:hover .cat-cta   { color: #FAF7F2; border-color: rgba(250,247,242,0.7); }

  /* Paper text: dark charcoal */
  .cat-paper .cat-index-num  { color: rgba(28,26,23,0.30); }
  .cat-paper .cat-index-rule { background: rgba(28,26,23,0.12); }
  .cat-paper .cat-index-tag  { color: rgba(28,26,23,0.38); }
  .cat-paper .cat-eyebrow    { color: rgba(28,26,23,0.48); }
  .cat-paper .cat-title      { color: ${C.charcoal}; }
  .cat-paper .cat-stats      { border-color: rgba(28,26,23,0.14); }
  .cat-paper .cat-stat       { color: rgba(28,26,23,0.50); border-color: rgba(28,26,23,0.14); }
  .cat-paper .cat-cta        { color: rgba(28,26,23,0.60); border-color: rgba(28,26,23,0.28); }
  .cat-paper:hover .cat-cta  { color: ${C.charcoal}; border-color: rgba(28,26,23,0.65); }

  /* Mobile */
  @media(max-width: 680px) {
    .cat-row { flex-direction: column; min-height: auto; }
    .cat-pp, .cat-paper { flex: 1 !important; min-height: 78vw; }
    .cat-divider { width: 100%; height: 2px; }
  }

  /* ── Hero flex layout ─────────────────────────────── */
  .hero-band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(2rem, 5vw, 4rem);
  }
  .hero-text { flex: 1; min-width: 0; }
  .hero-anim {
    flex-shrink: 0;
    width: 240px;
    opacity: 0.9;
  }
  @media (max-width: 680px) {
    .hero-anim { display: none; }
  }

  /* ── Process animation ────────────────────────────── */
  /* 9s loop: 0-33% sheet, 33-66% die-cut, 66-100% box */

  /* Stage 1 — flat sheet */
  @keyframes stg-sheet-in  { 0%{opacity:0;transform:translateX(-24px)} 8%{opacity:1;transform:translateX(0)} 30%{opacity:1} 36%{opacity:0} 100%{opacity:0} }
  .anim-sheet { animation: stg-sheet-in 9s linear infinite; }

  /* Stage 2 — die-cut outline */
  @keyframes stg-cut-in    { 0%,30%{opacity:0} 38%{opacity:1} 62%{opacity:1} 68%{opacity:0} 100%{opacity:0} }
  .anim-cut   { animation: stg-cut-in 9s linear infinite; }

  /* Stage 3 — finished box */
  @keyframes stg-box-in    { 0%,64%{opacity:0} 72%{opacity:1} 92%{opacity:1} 98%{opacity:0} 100%{opacity:0} }
  .anim-box   { animation: stg-box-in 9s linear infinite; }

  /* Stage dots */
  @keyframes dot-active { 0%{transform:scale(1)} 50%{transform:scale(1.5)} 100%{transform:scale(1)} }
  .dot-1 { animation: dot-active 9s linear infinite 0s; }
  .dot-2 { animation: dot-active 9s linear infinite 3s; }
  .dot-3 { animation: dot-active 9s linear infinite 6s; }

`;

const PP_COMPOSITE   = "/hero-pp-family.jpg";
const PAPER_COMPOSITE = "/hero-paper-family.jpg";

export default function ProductsPage() {
  return (
    <div style={{ background: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column", paddingTop: "70px", paddingBottom: 0 }}>
      <style>{CSS}</style>

      {/* Heritage hero band */}
      <section style={{
        background: C.deepWarm,
        padding: "clamp(50px, 7vh, 80px) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 3vh, 2.5rem)",
      }}>
        <div className="hero-band" style={{ maxWidth: "900px" }}>
          <div className="hero-text">
            <span className="saffron-badge" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(250,247,242,0.12)", color: C.cream, border: "1px solid rgba(250,247,242,0.20)" }}>
              Packaging Solutions
            </span>
            <h1 style={{
              fontFamily: F.display, fontWeight: 900,
              fontSize: "clamp(3rem, 6vw, 5rem)", color: C.cream,
              lineHeight: 1.06, letterSpacing: "-0.02em",
              marginTop: "1rem", marginBottom: "1.25rem",
            }}>
              Our <span className="gold-text">Products</span>
            </h1>
            <p style={{
              fontFamily: F.italic, fontStyle: "italic",
              fontSize: "1.2rem", color: "rgba(250,247,242,0.65)",
              lineHeight: 1.6,
            }}>
              Precision-engineered packaging for automotive, pharma, FMCG and industrial sectors.
            </p>
          </div>
          <div className="hero-anim">
            <svg viewBox="0 0 240 130" width="240" height="130"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ display: "block", overflow: "visible" }}>

              {/* Stage 1: Flat Sheet */}
              <g className="anim-sheet">
                <rect x="20" y="30" width="90" height="70"
                  fill="none" stroke="rgba(250,247,242,0.65)" strokeWidth="1.2" rx="1"/>
                <line x1="50" y1="30" x2="50" y2="100" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
                <line x1="80" y1="30" x2="80" y2="100" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
                <line x1="20" y1="58" x2="110" y2="58" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
                <line x1="20" y1="78" x2="110" y2="78" stroke="rgba(250,247,242,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
                <rect x="20" y="30" width="3" height="70" fill="rgba(250,247,242,0.18)"/>
              </g>

              {/* Stage 2: Die-Cut Cross */}
              <g className="anim-cut">
                <rect x="75" y="40" width="50" height="50"
                  fill="none" stroke="rgba(250,247,242,0.70)" strokeWidth="1.2" strokeDasharray="5 3"/>
                <rect x="75" y="18" width="50" height="22"
                  fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
                <rect x="75" y="90" width="50" height="20"
                  fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
                <rect x="50" y="40" width="25" height="50"
                  fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
                <rect x="125" y="40" width="22" height="50"
                  fill="none" stroke="rgba(250,247,242,0.35)" strokeWidth="1" strokeDasharray="5 3"/>
              </g>

              {/* Stage 3: Finished Box */}
              <g className="anim-box">
                <rect x="95" y="52" width="58" height="52"
                  fill="none" stroke="rgba(250,247,242,0.70)" strokeWidth="1.4" rx="1"/>
                <polygon points="95,52 153,52 168,38 110,38"
                  fill="none" stroke="rgba(250,247,242,0.50)" strokeWidth="1.2"/>
                <polygon points="153,52 168,38 168,90 153,104"
                  fill="none" stroke="rgba(250,247,242,0.40)" strokeWidth="1.2"/>
                <circle cx="124" cy="78" r="9"
                  fill="none" stroke="rgba(250,247,242,0.45)" strokeWidth="1"/>
                <path d="M118,78 L122,83 L130,71"
                  fill="none" stroke="rgba(250,247,242,0.80)" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </g>

              {/* Stage dots */}
              <g>
                <circle className="dot-1" cx="108" cy="122" r="2.5" fill="rgba(250,247,242,0.55)"/>
                <circle className="dot-2" cx="120" cy="122" r="2.5" fill="rgba(250,247,242,0.55)"/>
                <circle className="dot-3" cx="132" cy="122" r="2.5" fill="rgba(250,247,242,0.55)"/>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Two category panels */}
      <div className="cat-row" style={{ borderBottom: `1px solid ${C.border}` }}>

        {/* ── 01 PP Corrugated Systems — CHARCOAL ── */}
        <Link href="/products/pp-corrugated" className="cat-pp">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PP_COMPOSITE} alt="" className="cat-bg-img" />

          {/* Charcoal gradient overlay lifting text */}
          <div className="pp-overlay" />

          {/* Text */}
          <div className="cat-content">
            <div className="cat-index-row">
              <span className="cat-index-num">01</span>
              <div className="cat-index-rule" />
              <span className="cat-index-tag">Manufactured</span>
            </div>

            <span className="cat-eyebrow">PP Corrugated Systems</span>

            <h2 className="cat-title">
              Boxes · Trays<br />
              <em style={{ fontWeight: 400 }}>Bins · Separators</em>
            </h2>

            <div className="cat-stats">
              {["7 product families", "20+ variants", "Custom to ±1 mm"].map(s => (
                <span key={s} className="cat-stat">{s}</span>
              ))}
            </div>

            <span className="cat-cta">Explore PP Systems →</span>
          </div>
        </Link>

        <div className="cat-divider" />

        {/* ── 02 Paper & Board Grades — CREAM ── */}
        <Link href="/products/paper-board" className="cat-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PAPER_COMPOSITE} alt="" className="cat-bg-img" />

          {/* Cream gradient overlay */}
          <div className="paper-overlay" />

          {/* Text */}
          <div className="cat-content">
            <div className="cat-index-row">
              <span className="cat-index-num">02</span>
              <div className="cat-index-rule" />
              <span className="cat-index-tag">Traded</span>
            </div>

            <span className="cat-eyebrow">Paper &amp; Board Grades</span>

            <h2 className="cat-title">
              Kraft · FBB<br />
              <em style={{ fontWeight: 400 }}>Duplex · Coated</em>
            </h2>

            <div className="cat-stats">
              {["10 ITC PSPD grades", "200–400 GSM", "Ready stock · Pune"].map(s => (
                <span key={s} className="cat-stat">{s}</span>
              ))}
            </div>

            <span className="cat-cta">Browse Board Grades →</span>
          </div>
        </Link>
      </div>

      {/* Footer strip */}
      <div style={{
        padding: "1.4rem clamp(1.5rem, 5vw, 4rem)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem", background: C.cream,
      }}>
        <span style={{ fontFamily: F.body, fontSize: "0.73rem", color: C.taupe, fontWeight: 300 }}>
          Custom specifications on all products · Lead time 7–14 working days
        </span>
        <Link href="/contact" style={{
          fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
          color: C.charcoal, textDecoration: "none", letterSpacing: "0.04em",
          borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "1px",
        }}>
          Request a Quote →
        </Link>
      </div>

      {/* Catalogue CTA band */}
      <section style={{
        background: C.deepWarm,
        padding: "clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem)",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: F.display, fontWeight: 700,
          fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
          color: C.cream, marginBottom: "1rem", lineHeight: 1.1,
        }}>
          Request a <span className="gold-text">Product Catalogue</span>
        </h2>
        <p style={{ fontFamily: F.body, fontSize: "1rem",
          color: "rgba(250,247,242,0.65)", marginBottom: "2rem" }}>
          Get our full range specifications delivered to your inbox.
        </p>
        <a href="/#contact" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: C.saffron, color: "#fff",
          fontFamily: F.body, fontWeight: 600, fontSize: "0.82rem",
          letterSpacing: "0.09em", textTransform: "uppercase",
          padding: "13px 32px", borderRadius: "2px", textDecoration: "none",
        }}>
          Contact Us →
        </a>
      </section>
    </div>
  );
}
