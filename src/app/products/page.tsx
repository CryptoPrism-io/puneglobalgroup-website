"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  navy:      "#0D1B2E",
  navyMid:   "#132238",
  border:    "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.16)",
};
const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
  mono:    "'DM Mono', 'Courier New', monospace",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
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

  /* ── Category Cards ─────────────────────────────── */
  .cat-row {
    display: flex;
    flex: 1;
    min-height: 72vh;
  }
  .cat-divider { width: 2px; background: ${C.cream}; flex-shrink: 0; z-index: 2; }

  /* PP card — navy */
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
      linear-gradient(to top,  rgba(13,27,46,0.96) 0%, rgba(13,27,46,0.72) 38%, rgba(13,27,46,0.22) 68%, rgba(13,27,46,0.04) 100%),
      linear-gradient(to right, rgba(13,27,46,0.55) 0%, rgba(13,27,46,0.0) 55%);
  }
  .paper-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top,  rgba(240,234,224,0.98) 0%, rgba(240,234,224,0.80) 36%, rgba(240,234,224,0.32) 62%, rgba(240,234,224,0.0) 100%),
      linear-gradient(to right, rgba(240,234,224,0.65) 0%, rgba(240,234,224,0.0) 55%);
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

  /* Navbar */
  .prod-nav-links { display: flex; align-items: center; gap: 2rem; }
  .prod-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer;
    background: none; border: none; padding: 4px; }
  .prod-hamburger span { display: block; width: 22px; height: 1.5px; background: ${C.charcoal}; transition: opacity 0.2s; }
  .prod-dropdown { display: none; position: absolute; top: 68px; right: 0; left: 0;
    background: ${C.cream}; border-bottom: 1px solid ${C.borderMid};
    padding: 1rem clamp(1.5rem, 4vw, 3rem); flex-direction: column; gap: 0.85rem;
    box-shadow: 0 4px 20px rgba(28,26,23,0.07); }
  .prod-dropdown.open { display: flex; }
  @media (max-width: 600px) {
    .prod-nav-links { display: none !important; }
    .prod-hamburger { display: flex !important; }
  }
`;

const PP_COMPOSITE   = "/hero-pp-family.jpg";
const PAPER_COMPOSITE = "/hero-paper-family.jpg";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: C.cream,
      borderBottom: `1px solid ${scrolled ? C.borderMid : C.border}`,
      boxShadow: scrolled ? "0 1px 20px rgba(28,26,23,0.05)" : "none",
      transition: "all 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1.5rem, 4vw, 3rem)", height: "68px" }}>
        <SiteLogo href="/" />
        <div className="prod-nav-links">
          <Link href="/infrastructure" className="nav-link">Infrastructure</Link>
          <Link href="/blog" className="nav-link">Insights</Link>
          <Link href="/#contact" style={{
            fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500,
            letterSpacing: "0.09em", textTransform: "uppercase",
            background: C.charcoal, color: C.cream,
            padding: "9px 22px", borderRadius: "1px", textDecoration: "none",
          }}>
            Request a Quote →
          </Link>
        </div>
        <button className="prod-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <div className={`prod-dropdown${menuOpen ? " open" : ""}`}>
        <Link href="/infrastructure" className="nav-link" onClick={() => setMenuOpen(false)}>Infrastructure</Link>
        <Link href="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>Insights</Link>
        <Link href="/#contact" onClick={() => setMenuOpen(false)} style={{
          fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500,
          letterSpacing: "0.09em", textTransform: "uppercase",
          background: C.charcoal, color: C.cream,
          padding: "9px 22px", borderRadius: "1px", textDecoration: "none",
          alignSelf: "flex-start",
        }}>
          Request a Quote →
        </Link>
      </div>
    </nav>
  );
}

export default function ProductsPage() {
  return (
    <div style={{ background: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>
      <Navbar />

      {/* Page header */}
      <div style={{ padding: "3.25rem clamp(1.5rem, 5vw, 4rem) 2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <p className="fade-up d1" style={{
            fontFamily: F.mono, fontSize: "0.63rem", fontWeight: 500,
            color: C.taupe, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.65rem",
          }}>
            Pune Global Group · Product Range
          </p>
          <h1 className="fade-up d2" style={{
            fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(1.9rem, 4vw, 3rem)",
            color: C.charcoal, lineHeight: 1.1, letterSpacing: "-0.022em",
          }}>
            Two categories.{" "}
            <em style={{ fontWeight: 400, color: C.warm }}>Built to spec.</em>
          </h1>
          <p className="fade-up d3" style={{
            fontFamily: F.body, fontSize: "0.92rem", color: C.taupe,
            lineHeight: 1.75, fontWeight: 300, marginTop: "0.8rem", maxWidth: "440px",
          }}>
            We manufacture PP corrugated systems and trade premium paper &amp; board grades.
          </p>
        </div>
      </div>

      {/* Two category panels */}
      <div className="cat-row" style={{ borderBottom: `1px solid ${C.border}` }}>

        {/* ── 01 PP Corrugated Systems — NAVY ── */}
        <Link href="/products/pp-corrugated" className="cat-pp">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PP_COMPOSITE} alt="" className="cat-bg-img" />

          {/* Navy gradient overlay lifting text */}
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
              ITC · TNPL<br />
              <em style={{ fontWeight: 400 }}>· Imported</em>
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
        <Link href="/#contact" style={{
          fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
          color: C.charcoal, textDecoration: "none", letterSpacing: "0.04em",
          borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "1px",
        }}>
          Request a Quote →
        </Link>
      </div>
    </div>
  );
}
