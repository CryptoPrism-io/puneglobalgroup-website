"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { products, Product } from "@/lib/pgg-data";

/* ─── Merchant tokens ─────────────────────────────────────────────────────────── */
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#D4860E",
  dark:      "#141210",
  border:    "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};
const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');`;

const CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.cream}; color: ${C.charcoal}; font-family: ${F.body}; -webkit-font-smoothing: antialiased; }
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9998; opacity: 0.022;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ruleGrow { from { transform:scaleX(0); transform-origin:left; } to { transform:scaleX(1); transform-origin:left; } }
  .page-fade { animation: fadeUp 0.85s ease both; }
  .delay-1 { animation-delay: 0.12s; }
  .delay-2 { animation-delay: 0.26s; }
  .delay-3 { animation-delay: 0.4s; }
  .rule-anim { animation: ruleGrow 0.85s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
  .nav-link-m { position:relative; font-family:${F.body}; font-size:0.875rem; color:${C.warm}; cursor:pointer; padding:4px 0; transition:color 0.2s; }
  .nav-link-m::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px; background:${C.charcoal}; transition:width 0.28s; }
  .nav-link-m:hover { color:${C.charcoal}; }
  .nav-link-m:hover::after { width:100%; }
  .prod-card { transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s; }
  .prod-card:hover { border-color: ${C.charcoal} !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(28,26,23,0.08); }
  .btn-p { display:inline-flex; align-items:center; gap:8px; background:${C.charcoal}; color:${C.cream}; font-family:${F.body}; font-size:0.8rem; font-weight:500; letter-spacing:0.09em; text-transform:uppercase; padding:13px 28px; border:none; border-radius:1px; cursor:pointer; transition:background 0.2s, transform 0.15s; text-decoration:none; }
  .btn-p:hover { background:${C.dark}; transform:translateY(-1px); }
  .btn-o { display:inline-flex; align-items:center; gap:8px; background:transparent; color:${C.charcoal}; font-family:${F.body}; font-size:0.8rem; font-weight:500; letter-spacing:0.09em; text-transform:uppercase; padding:12px 28px; border:1px solid ${C.borderMid}; border-radius:1px; cursor:pointer; transition:all 0.2s; text-decoration:none; }
  .btn-o:hover { background:${C.charcoal}; color:${C.cream}; }
  @media(max-width:768px) { .prod-grid { grid-template-columns:1fr 1fr !important; } .hero-rule-wrap { display:none; } }
  @media(max-width:480px) { .prod-grid { grid-template-columns:1fr !important; } }
`;

/* ─── Filter tabs ─────────────────────────────────────────────────────────────── */
type FilterTab = "All" | "Paper & Board" | "PP Packaging";
const TABS: FilterTab[] = ["All", "Paper & Board", "PP Packaging"];

/* ─── Subpage Navbar ─────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: C.cream,
      borderBottom: scrolled ? `1px solid ${C.borderMid}` : `1px solid ${C.border}`,
      boxShadow: scrolled ? "0 1px 20px rgba(28,26,23,0.05)" : "none",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.5rem, 4vw, 3rem)", height: "68px",
      transition: "all 0.3s ease",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
        <span style={{ fontFamily: F.body, fontSize: "0.72rem", color: C.taupe, letterSpacing: "0.06em" }}>←</span>
        <span style={{ fontFamily: F.body, fontWeight: 600, color: C.charcoal, fontSize: "0.92rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Pune Global Group
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link href="/infrastructure" className="nav-link-m" style={{ textDecoration: "none" }}>Infrastructure</Link>
        <Link href="/blog" className="nav-link-m" style={{ textDecoration: "none" }}>Insights</Link>
        <Link href="/#contact" className="btn-p" style={{ padding: "9px 20px", fontSize: "0.75rem" }}>
          Get a Quote →
        </Link>
      </div>
    </nav>
  );
}

/* ─── Product Card ───────────────────────────────────────────────────────────── */
function ProductCard({ product, delay }: { product: Product; delay: number }) {
  const isPP = product.category === "PP Packaging";
  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
      <div className="prod-card" style={{
        background: "#fff", border: `1px solid ${C.border}`,
        borderRadius: "1px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
        animation: `fadeUp 0.7s ease ${delay}s both`,
      }}>
        {product.image ? (
          <div style={{ height: "180px", overflow: "hidden", background: C.parchment }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
              onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }} />
          </div>
        ) : (
          <div style={{ height: "6px", background: isPP ? "#8B1A1A" : C.saffron }} />
        )}

        <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <span style={{
            fontFamily: F.body, fontSize: "0.64rem", fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: isPP ? "#8B1A1A" : C.saffron,
            background: isPP ? "rgba(139,26,26,0.07)" : "rgba(212,134,14,0.08)",
            border: `1px solid ${isPP ? "rgba(139,26,26,0.18)" : "rgba(212,134,14,0.22)"}`,
            padding: "3px 8px", borderRadius: "1px", alignSelf: "flex-start",
          }}>
            {product.category}
          </span>

          <h3 style={{ fontFamily: F.display, fontSize: "1.15rem", fontWeight: 600,
            color: C.charcoal, lineHeight: 1.3 }}>
            {product.name}
          </h3>

          <p style={{ fontFamily: F.body, fontSize: "0.84rem", color: C.taupe,
            lineHeight: 1.7, flex: 1, fontWeight: 300 }}>
            {product.tagline}
          </p>

          {/* Spec pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {[product.gsmRange, product.thickness, product.surfaceResistivity]
              .filter(Boolean).map((s) => (
              <span key={s} style={{
                fontFamily: F.body, fontSize: "0.68rem", fontWeight: 400,
                color: C.taupe, background: C.parchment,
                border: `1px solid ${C.border}`, padding: "2px 8px", borderRadius: "1px",
              }}>{s}</span>
            ))}
          </div>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
            color: C.charcoal, borderBottom: `1px solid ${C.borderMid}`,
            paddingBottom: "1px", alignSelf: "flex-start", marginTop: "0.25rem",
          }}>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const filtered = activeTab === "All" ? products : products.filter(p => p.category === activeTab);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Navbar />

      {/* Hero */}
      <section style={{ background: C.cream, padding: "72px clamp(1.5rem, 5vw, 4rem) 60px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="page-fade" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <span style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "0.9rem", color: C.taupe, whiteSpace: "nowrap" }}>
              Our Products
            </span>
            <div className="rule-anim hero-rule-wrap" style={{ flex: 1, height: "1px", background: C.border }} />
            <span style={{ fontFamily: F.body, fontSize: "0.68rem", color: C.taupe, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              40+ Grades · 3 Business Lines
            </span>
          </div>

          <h1 className="page-fade delay-1" style={{
            fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2.4rem, 5.5vw, 5rem)",
            lineHeight: 1.02, color: C.charcoal, letterSpacing: "-0.025em",
            maxWidth: "760px",
          }}>
            Paper &amp; Board.<br />
            <em style={{ fontWeight: 400, color: C.warm }}>PP Packaging.</em>
          </h1>

          <div className="rule-anim" style={{ height: "1px", background: C.borderMid, margin: "2rem 0" }} />

          <p className="page-fade delay-2" style={{
            fontFamily: F.body, fontSize: "1rem", color: C.taupe, lineHeight: 1.8,
            maxWidth: "580px", fontWeight: 300,
          }}>
            From ITC FBB and Duplex Boards to imported Kraft Liners and high-performance
            PP corrugated packaging — Pune Global Group supplies, converts, and delivers
            across India with 200 tons/day processing capacity.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <div style={{
        background: C.parchment, borderTop: `1px solid ${C.borderMid}`,
        borderBottom: `1px solid ${C.borderMid}`,
        position: "sticky", top: "68px", zIndex: 90,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 4rem)", display: "flex", overflowX: "auto" }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontFamily: F.body, fontSize: "0.84rem", fontWeight: activeTab === tab ? 500 : 400,
              color: activeTab === tab ? C.charcoal : C.taupe,
              background: "none", border: "none",
              borderBottom: activeTab === tab ? `2px solid ${C.charcoal}` : "2px solid transparent",
              padding: "1rem 1.5rem", cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}>
              {tab}
              <span style={{
                marginLeft: "0.4rem", fontSize: "0.7rem", fontWeight: 400,
                background: activeTab === tab ? "rgba(28,26,23,0.08)" : C.parchment,
                color: C.taupe, padding: "1px 6px", borderRadius: "10px",
              }}>
                {tab === "All" ? products.length : products.filter(p => p.category === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem clamp(1.5rem, 5vw, 4rem) 5rem" }}>
        <p style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe, marginBottom: "2rem" }}>
          Showing <strong style={{ color: C.charcoal }}>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "product" : "products"}
          {activeTab !== "All" && ` in ${activeTab}`}
        </p>

        <div className="prod-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px", background: C.borderMid,
        }}>
          {filtered.map((product, i) => (
            <ProductCard key={product.slug} product={product} delay={0.05 * i} />
          ))}
        </div>

        {/* CTA Banner */}
        <div style={{
          marginTop: "4rem", background: C.charcoal, borderRadius: "1px",
          padding: "3rem 2.5rem", display: "grid",
          gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center",
        }}>
          <div>
            <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "0.9rem",
              color: "rgba(250,247,242,0.55)", marginBottom: "0.5rem" }}>
              Can&apos;t find your grade?
            </p>
            <h2 style={{ fontFamily: F.display, fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: 600, color: C.cream, lineHeight: 1.2, margin: "0 0 0.75rem" }}>
              We Source What Others Can&apos;t.
            </h2>
            <p style={{ fontFamily: F.body, fontSize: "0.9rem", color: "rgba(250,247,242,0.6)",
              maxWidth: "480px", lineHeight: 1.75, fontWeight: 300 }}>
              With direct mill relationships across India, Europe, and South America,
              we can source specialty grades, non-standard GSMs, and custom converting requirements.
            </p>
          </div>
          <Link href="/#contact" className="btn-o"
            style={{ borderColor: "rgba(250,247,242,0.25)", color: C.cream, whiteSpace: "nowrap" }}
            onMouseEnter={e => { const a = e.currentTarget; a.style.background = "rgba(250,247,242,0.1)"; a.style.borderColor = "rgba(250,247,242,0.5)"; }}
            onMouseLeave={e => { const a = e.currentTarget; a.style.background = "transparent"; a.style.borderColor = "rgba(250,247,242,0.25)"; }}>
            Send an Enquiry →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: C.dark, padding: "2rem clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: F.body, fontSize: "0.76rem", color: "rgba(250,247,242,0.38)" }}>
            © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO
          </span>
          <a href="mailto:contact.puneglobalgroup@gmail.com"
            style={{ fontFamily: F.body, fontSize: "0.76rem", color: "rgba(250,247,242,0.38)", textDecoration: "none" }}>
            contact.puneglobalgroup@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
