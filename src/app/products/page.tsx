"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { initial: { opacity: 0, y: 25 }, animate: { opacity: 1, y: 0 } };

const C = {
  cream: "#FAF7F2",
  parchment: "#14161C",
  charcoal: "#FAF7F2",
  warm: "rgba(250,247,242,0.60)",
  taupe: "rgba(250,247,242,0.60)",
  saffron: "#C8B89A",
  saffrondark: "#0A0B0E",
  dark: "#111216",
  deepWarm: "#111216",
  navy: "#0F1A2E",
  granite: "rgba(250,247,242,0.60)",
  goldStart: "#FAF7F2",
  goldEnd: "#C8B89A",
  border: "rgba(250,247,242,0.08)",
  borderMid: "rgba(250,247,242,0.14)",
};
const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
  mono:    "'DM Mono', 'Courier New', monospace",
};

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.dark}; color: ${C.charcoal}; font-family: ${F.body}; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

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
    background: ${C.saffron}; color: ${C.dark};
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
    font-family: ${F.body};
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(0,0,0,0.4);
  }

  /* ── Category Cards ─────────────────────────────── */
  .cat-row {
    display: flex;
    flex: 1;
    min-height: 58vh;
  }
  .cat-divider { width: 2px; background: ${C.border}; flex-shrink: 0; z-index: 2; }

  /* PP card — navy */
  .cat-pp {
    position: relative; overflow: hidden; cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column; justify-content: flex-end;
    flex: 1; transition: flex 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${C.navy};
  }
  .cat-pp:hover { flex: 1.18; }

  /* Paper card — dark parchment */
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
      linear-gradient(to top,  rgba(15,26,46,0.96) 0%, rgba(15,26,46,0.72) 38%, rgba(15,26,46,0.22) 68%, rgba(15,26,46,0.04) 100%),
      linear-gradient(to right, rgba(15,26,46,0.55) 0%, rgba(15,26,46,0.0) 55%);
  }
  .paper-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top,  rgba(20,22,28,0.96) 0%, rgba(20,22,28,0.78) 36%, rgba(20,22,28,0.30) 62%, rgba(20,22,28,0.0) 100%),
      linear-gradient(to right, rgba(20,22,28,0.60) 0%, rgba(20,22,28,0.0) 55%);
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

  /* PP text: light on dark */
  .cat-pp .cat-index-num   { color: rgba(250,247,242,0.35); }
  .cat-pp .cat-index-rule  { background: rgba(250,247,242,0.12); }
  .cat-pp .cat-index-tag   { color: rgba(250,247,242,0.40); }
  .cat-pp .cat-eyebrow     { color: rgba(250,247,242,0.48); }
  .cat-pp .cat-title       { color: #FAF7F2; }
  .cat-pp .cat-stats       { border-color: rgba(250,247,242,0.14); }
  .cat-pp .cat-stat        { color: rgba(250,247,242,0.50); border-color: rgba(250,247,242,0.14); }
  .cat-pp .cat-cta         { color: rgba(250,247,242,0.65); border-color: rgba(250,247,242,0.30); }
  .cat-pp:hover .cat-cta   { color: #FAF7F2; border-color: rgba(250,247,242,0.7); }

  /* Paper text: light on dark */
  .cat-paper .cat-index-num  { color: rgba(250,247,242,0.35); }
  .cat-paper .cat-index-rule { background: rgba(250,247,242,0.12); }
  .cat-paper .cat-index-tag  { color: rgba(250,247,242,0.40); }
  .cat-paper .cat-eyebrow    { color: rgba(250,247,242,0.48); }
  .cat-paper .cat-title      { color: #FAF7F2; }
  .cat-paper .cat-stats      { border-color: rgba(250,247,242,0.14); }
  .cat-paper .cat-stat       { color: rgba(250,247,242,0.50); border-color: rgba(250,247,242,0.14); }
  .cat-paper .cat-cta        { color: rgba(250,247,242,0.65); border-color: rgba(250,247,242,0.30); }
  .cat-paper:hover .cat-cta  { color: #FAF7F2; border-color: rgba(250,247,242,0.7); }

  /* Mobile */
  @media(max-width: 900px) {
    .hero-illustration { display: none !important; }
  }
  @media(max-width: 680px) {
    .cat-row { flex-direction: column; min-height: auto; }
    .cat-pp, .cat-paper { flex: 1 !important; min-height: 78vw; }
    .cat-divider { width: 100%; height: 2px; }
  }


`;

const PP_COMPOSITE   = "/hero-pp-family.jpg";
const PAPER_COMPOSITE = "/hero-paper-family.jpg";

export default function ProductsPage() {
  return (
    <div className="section-dark" style={{ background: C.dark, minHeight: "100vh", display: "flex", flexDirection: "column", paddingTop: "70px", paddingBottom: 0 }}>
      <style>{CSS}</style>

      {/* Heritage hero band */}
      <section style={{
        background: C.deepWarm,
        padding: "clamp(50px, 7vh, 80px) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 3vh, 2.5rem)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" }}>
          <div style={{ maxWidth: "800px", position: "relative", zIndex: 2 }}>
            <motion.span
              className="saffron-badge"
              style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(250,247,242,0.12)", color: C.cream, border: "1px solid rgba(250,247,242,0.20)" }}
              {...fadeUp}
              transition={{ duration: 0.6, ease, delay: 0 }}
            >
              Packaging Solutions
            </motion.span>
            <motion.h1
              style={{
                fontFamily: F.display, fontWeight: 900,
                fontSize: "clamp(3rem, 6vw, 5rem)", color: C.cream,
                lineHeight: 1.06, letterSpacing: "-0.02em",
                marginTop: "1rem", marginBottom: "1.25rem",
              }}
              {...fadeUp}
              transition={{ duration: 0.6, ease, delay: 0.08 }}
            >
              Our <span className="gold-text">Products</span>
            </motion.h1>
            <motion.p
              style={{
                fontFamily: F.italic, fontStyle: "italic",
                fontSize: "1.2rem", color: "rgba(250,247,242,0.65)",
                lineHeight: 1.6,
              }}
              {...fadeUp}
              transition={{ duration: 0.6, ease, delay: 0.16 }}
            >
              Precision-engineered packaging for automotive, pharma, FMCG and industrial sectors.
            </motion.p>
          </div>

          {/* Packaging illustration */}
          <motion.div
            className="hero-illustration"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.3 }}
            style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
          >
            <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.3))" }}>
              {/* Subtle glow */}
              <circle cx="150" cy="150" r="120" fill="rgba(91,155,213,0.04)" />

              {/* ── Open-top box (center, large) ── */}
              <path d="M110 110 L150 135 L190 110 L150 85 Z" fill="rgba(91,155,213,0.15)" stroke="rgba(91,155,213,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M110 110 L110 160 L150 185 L150 135 Z" fill="rgba(91,155,213,0.1)" stroke="rgba(91,155,213,0.4)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M190 110 L190 160 L150 185 L150 135 Z" fill="rgba(91,155,213,0.08)" stroke="rgba(91,155,213,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
              {/* Open lid flaps */}
              <path d="M110 110 L102 100 L140 78 L150 85" fill="rgba(91,155,213,0.06)" stroke="rgba(91,155,213,0.35)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M190 110 L198 100 L160 78 L150 85" fill="rgba(91,155,213,0.04)" stroke="rgba(91,155,213,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
              {/* Box stripes */}
              <line x1="120" y1="120" x2="140" y2="132" stroke="rgba(91,155,213,0.2)" strokeWidth="1" />
              <line x1="124" y1="117" x2="144" y2="129" stroke="rgba(91,155,213,0.2)" strokeWidth="1" />

              {/* ── Tray (top-left, shallow open) ── */}
              <path d="M30 105 L62 120 L94 105 L62 90 Z" fill="rgba(200,184,154,0.12)" stroke="rgba(200,184,154,0.45)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M30 105 L30 120 L62 135 L62 120 Z" fill="rgba(200,184,154,0.08)" stroke="rgba(200,184,154,0.35)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M94 105 L94 120 L62 135 L62 120 Z" fill="rgba(200,184,154,0.06)" stroke="rgba(200,184,154,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
              {/* Tray dividers (separator lines inside) */}
              <line x1="46" y1="98" x2="46" y2="112" stroke="rgba(200,184,154,0.3)" strokeWidth="0.8" />
              <line x1="62" y1="92" x2="62" y2="120" stroke="rgba(200,184,154,0.25)" strokeWidth="0.8" />
              <line x1="78" y1="98" x2="78" y2="112" stroke="rgba(200,184,154,0.3)" strokeWidth="0.8" />

              {/* ── Separator / layer pad (right, flat) ── */}
              <path d="M200 85 L240 100 L270 88 L230 73 Z" fill="rgba(91,155,213,0.1)" stroke="rgba(91,155,213,0.35)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M200 85 L200 90 L240 105 L240 100 Z" fill="rgba(91,155,213,0.07)" stroke="rgba(91,155,213,0.3)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M270 88 L270 93 L240 105 L240 100 Z" fill="rgba(91,155,213,0.05)" stroke="rgba(91,155,213,0.25)" strokeWidth="1" strokeLinejoin="round" />
              {/* Second layer pad stacked */}
              <path d="M203 80 L243 95 L273 83 L233 68 Z" fill="rgba(91,155,213,0.06)" stroke="rgba(91,155,213,0.25)" strokeWidth="1" strokeLinejoin="round" />

              {/* ── Paper reel (bottom-left) ── */}
              <ellipse cx="55" cy="210" rx="28" ry="10" fill="rgba(200,184,154,0.08)" stroke="rgba(200,184,154,0.35)" strokeWidth="1.2" />
              <path d="M27 210 L27 175 Q27 165, 55 165 Q83 165, 83 175 L83 210" fill="none" stroke="rgba(200,184,154,0.35)" strokeWidth="1.2" />
              <ellipse cx="55" cy="175" rx="28" ry="10" fill="rgba(200,184,154,0.1)" stroke="rgba(200,184,154,0.4)" strokeWidth="1.2" />
              {/* Core hole */}
              <ellipse cx="55" cy="175" rx="8" ry="3" fill="rgba(17,18,22,0.6)" stroke="rgba(200,184,154,0.25)" strokeWidth="0.8" />
              {/* Unrolling tail */}
              <path d="M83 185 Q95 185, 100 195 Q105 205, 115 208" stroke="rgba(200,184,154,0.3)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

              {/* ── Sheet stack (bottom-right) ── */}
              <path d="M195 205 L245 225 L275 210 L225 190 Z" fill="rgba(250,247,242,0.06)" stroke="rgba(250,247,242,0.2)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M197 200 L247 220 L277 205 L227 185 Z" fill="rgba(250,247,242,0.05)" stroke="rgba(250,247,242,0.18)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M199 195 L249 215 L279 200 L229 180 Z" fill="rgba(250,247,242,0.04)" stroke="rgba(250,247,242,0.15)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M201 190 L251 210 L281 195 L231 175 Z" fill="rgba(250,247,242,0.03)" stroke="rgba(250,247,242,0.12)" strokeWidth="1" strokeLinejoin="round" />

              {/* ── Small crate (top-center-right) ── */}
              <path d="M210 135 L235 148 L260 135 L235 122 Z" fill="rgba(91,155,213,0.1)" stroke="rgba(91,155,213,0.35)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M210 135 L210 158 L235 171 L235 148 Z" fill="rgba(91,155,213,0.07)" stroke="rgba(91,155,213,0.3)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M260 135 L260 158 L235 171 L235 148 Z" fill="rgba(91,155,213,0.05)" stroke="rgba(91,155,213,0.25)" strokeWidth="1" strokeLinejoin="round" />
              {/* Crate slots */}
              <line x1="215" y1="140" x2="215" y2="155" stroke="rgba(91,155,213,0.2)" strokeWidth="0.7" />
              <line x1="225" y1="144" x2="225" y2="162" stroke="rgba(91,155,213,0.2)" strokeWidth="0.7" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Two category panels */}
      <div className="cat-row" style={{ borderBottom: `1px solid ${C.border}` }}>

        {/* ── 01 PP Corrugated Systems — NAVY ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.6, ease, delay: 0 }}
          whileHover={{ y: -5 }}
          style={{ display: "flex", flex: 1 }}
        >
        <Link href="/products/pp-corrugated" className="cat-pp section-dark" style={{ flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PP_COMPOSITE} alt="" className="cat-bg-img" />

          {/* Dark gradient overlay lifting text */}
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
        </motion.div>

        <div className="cat-divider" />

        {/* ── 02 Paper & Board Grades — DARK ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.6, ease, delay: 0.08 }}
          whileHover={{ y: -5 }}
          style={{ display: "flex", flex: 1 }}
        >
        <Link href="/products/paper-board" className="cat-paper section-dark" style={{ flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PAPER_COMPOSITE} alt="" className="cat-bg-img" />

          {/* Dark gradient overlay */}
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
        </motion.div>
      </div>

      {/* Footer strip */}
      <div style={{
        padding: "1.4rem clamp(1.5rem, 5vw, 4rem)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem", background: C.parchment,
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
      <motion.section
        className="section-dark"
        style={{
          background: C.deepWarm,
          padding: "clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem)",
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.6, ease }}
      >
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
          background: C.saffron, color: C.dark,
          fontFamily: F.body, fontWeight: 600, fontSize: "0.82rem",
          letterSpacing: "0.09em", textTransform: "uppercase",
          padding: "13px 32px", borderRadius: "2px", textDecoration: "none",
        }}>
          Contact Us →
        </a>
      </motion.section>
    </div>
  );
}
