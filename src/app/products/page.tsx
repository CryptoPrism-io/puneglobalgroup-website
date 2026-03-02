"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  dark:      "#141210",
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
  body { background: ${C.cream}; color: ${C.charcoal}; font-family: ${F.body}; -webkit-font-smoothing: antialiased; }

  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9998; opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp 0.8s ease both; }
  .d1 { animation-delay: 0.08s; } .d2 { animation-delay: 0.2s; } .d3 { animation-delay: 0.34s; }

  .nav-link { font-family:${F.body}; font-size:0.875rem; color:${C.warm}; text-decoration:none;
    position:relative; padding:4px 0; transition:color 0.2s; }
  .nav-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px;
    background:${C.charcoal}; transition:width 0.28s; }
  .nav-link:hover { color:${C.charcoal}; }
  .nav-link:hover::after { width:100%; }

  /* Category panels — expand on hover */
  .cat-panel {
    position: relative; overflow: hidden; cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column; justify-content: flex-end;
    flex: 1; transition: flex 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .cat-panel:hover { flex: 1.22; }
  .cat-panel .cat-img {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    filter: brightness(0.38);
    transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s ease;
  }
  .cat-panel:hover .cat-img { transform: scale(1.05); filter: brightness(0.30); }
  .cat-divider { width: 1px; background: rgba(250,247,242,0.12); flex-shrink: 0; }
  .cat-cta {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 2rem;
    font-family: ${F.body}; font-size: 0.78rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(250,247,242,0.6); border-bottom: 1px solid rgba(250,247,242,0.25);
    padding-bottom: 3px; transition: color 0.25s, border-color 0.25s;
  }
  .cat-panel:hover .cat-cta { color: #FAF7F2; border-color: rgba(250,247,242,0.65); }

  @media(max-width: 680px) {
    .cat-row { flex-direction: column !important; min-height: auto !important; }
    .cat-panel { min-height: 56vw !important; flex: 1 !important; }
    .cat-panel:hover { flex: 1 !important; }
    .cat-divider { width: 100%; height: 1px; }
  }
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
      <div style={{ padding: "3.5rem clamp(1.5rem, 5vw, 4rem) 2.25rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <p className="fade-up d1" style={{
            fontFamily: F.mono, fontSize: "0.64rem", fontWeight: 500,
            color: C.taupe, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.7rem",
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
            lineHeight: 1.75, fontWeight: 300, marginTop: "0.85rem", maxWidth: "440px",
          }}>
            We manufacture PP corrugated systems and trade paper & board grades.
            Select a category below.
          </p>
        </div>
      </div>

      {/* Two full-height category panels */}
      <div className="cat-row" style={{
        display: "flex", flex: 1, minHeight: "68vh",
        borderBottom: `1px solid ${C.border}`,
      }}>

        {/* ── 01 PP Corrugated Systems ────────────────────────── */}
        <Link href="/products/pp-corrugated" className="cat-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/products/pp/boxes/box-01-hero.jpg" alt="PP Corrugated Systems" className="cat-img" />

          <div style={{ position: "relative", zIndex: 2, padding: "clamp(2rem, 4vw, 3.5rem)" }}>
            {/* Top rule */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
              <span style={{ fontFamily: F.mono, fontSize: "0.6rem", color: "rgba(250,247,242,0.38)", letterSpacing: "0.22em" }}>01</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(250,247,242,0.12)" }} />
              <span style={{ fontFamily: F.body, fontSize: "0.6rem", color: "rgba(250,247,242,0.42)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Manufactured</span>
            </div>

            <p style={{ fontFamily: F.mono, fontSize: "0.63rem", color: "rgba(250,247,242,0.48)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              PP Corrugated Systems
            </p>

            <h2 style={{
              fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(2rem, 3.2vw, 3rem)",
              color: "#FAF7F2", lineHeight: 1.05, letterSpacing: "-0.024em", marginBottom: "1.25rem",
            }}>
              Boxes · Trays<br />
              <em style={{ fontWeight: 400 }}>Bins · Separators</em>
            </h2>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {["7 families", "20+ variants", "Custom to ±1 mm"].map(s => (
                <span key={s} style={{ fontFamily: F.mono, fontSize: "0.62rem", color: "rgba(250,247,242,0.48)", letterSpacing: "0.06em" }}>{s}</span>
              ))}
            </div>

            <span className="cat-cta">Explore PP Systems →</span>
          </div>
        </Link>

        <div className="cat-divider" />

        {/* ── 02 Paper & Board Grades ─────────────────────────── */}
        <Link href="/products/paper-board" className="cat-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/products/paper/fbb-board.jpg" alt="Paper & Board Grades" className="cat-img" />

          <div style={{ position: "relative", zIndex: 2, padding: "clamp(2rem, 4vw, 3.5rem)" }}>
            {/* Top rule */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
              <span style={{ fontFamily: F.mono, fontSize: "0.6rem", color: "rgba(250,247,242,0.38)", letterSpacing: "0.22em" }}>02</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(250,247,242,0.12)" }} />
              <span style={{ fontFamily: F.body, fontSize: "0.6rem", color: "rgba(250,247,242,0.42)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Traded</span>
            </div>

            <p style={{ fontFamily: F.mono, fontSize: "0.63rem", color: "rgba(250,247,242,0.48)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              Paper & Board Grades
            </p>

            <h2 style={{
              fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(2rem, 3.2vw, 3rem)",
              color: "#FAF7F2", lineHeight: 1.05, letterSpacing: "-0.024em", marginBottom: "1.25rem",
            }}>
              ITC · TNPL<br />
              <em style={{ fontWeight: 400 }}>· Imported</em>
            </h2>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {["5 board grades", "230–450 GSM", "Ready stock · Pune"].map(s => (
                <span key={s} style={{ fontFamily: F.mono, fontSize: "0.62rem", color: "rgba(250,247,242,0.48)", letterSpacing: "0.06em" }}>{s}</span>
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
