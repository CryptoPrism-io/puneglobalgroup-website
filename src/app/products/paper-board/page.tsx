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
  borderStr: "rgba(28,26,23,0.28)",
  kraft:     "#6B4226",      // warm kraft accent
  kraftLight:"rgba(107,66,38,0.08)",
  kraftMid:  "rgba(107,66,38,0.18)",
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
  @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes ruleGrow { from { transform:scaleX(0); transform-origin:left; } to { transform:scaleX(1); transform-origin:left; } }

  .fade-up { animation: fadeUp 0.85s ease both; }
  .fade-in { animation: fadeIn 0.6s ease both; }
  .rule-grow { animation: ruleGrow 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
  .d1{animation-delay:0.08s;}.d2{animation-delay:0.18s;}.d3{animation-delay:0.3s;}.d4{animation-delay:0.44s;}

  .sr { opacity:0; transform:translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr.vis { opacity:1; transform:translateY(0); }

  .nav-link { font-family:${F.body}; font-size:0.875rem; color:${C.warm}; text-decoration:none;
    position:relative; padding:4px 0; transition:color 0.2s; }
  .nav-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px;
    background:${C.charcoal}; transition:width 0.28s; }
  .nav-link:hover { color:${C.charcoal}; }
  .nav-link:hover::after { width:100%; }

  /* Grade card */
  .grade-card { transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s; cursor:pointer; }
  .grade-card:hover { border-color:${C.kraft} !important; transform:translateY(-4px);
    box-shadow:0 12px 32px rgba(107,66,38,0.10); }

  /* Carousel */
  .carousel-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
    opacity:0; transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1); pointer-events:none; }
  .carousel-img.active { opacity:1; }
  .dot-pip { height:6px; border-radius:3px; border:none; cursor:pointer;
    transition: width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease; padding:0; display:block; }

  /* Spec pills */
  .spec-pill { font-family:${F.mono}; font-size:0.65rem; color:${C.taupe};
    background:${C.parchment}; border:1px solid ${C.border}; padding:2px 8px; border-radius:1px; white-space:nowrap; }
  .spec-pill-k { font-family:${F.mono}; font-size:0.65rem; color:${C.kraft};
    background:${C.kraftLight}; border:1px solid ${C.kraftMid}; padding:2px 8px; border-radius:1px; white-space:nowrap; }

  /* Buttons */
  .btn-kraft { display:inline-flex; align-items:center; gap:8px; background:${C.kraft}; color:${C.cream};
    font-family:${F.body}; font-size:0.78rem; font-weight:500; letter-spacing:0.09em; text-transform:uppercase;
    padding:13px 30px; border:none; border-radius:1px; cursor:pointer; transition:all 0.2s; text-decoration:none; }
  .btn-kraft:hover { background:#4e2f18; transform:translateY(-1px); }
  .btn-ghost { display:inline-flex; align-items:center; gap:6px; background:transparent; color:${C.charcoal};
    font-family:${F.body}; font-size:0.75rem; font-weight:500; letter-spacing:0.08em; text-transform:uppercase;
    padding:10px 20px; border:1px solid ${C.borderMid}; border-radius:1px; cursor:pointer;
    transition:all 0.2s; text-decoration:none; }
  .btn-ghost:hover { background:${C.charcoal}; color:${C.cream}; }

  /* Responsive */
  @media(max-width:900px) { .grade-grid { grid-template-columns: repeat(2,1fr) !important; } }
  @media(max-width:580px) { .grade-grid { grid-template-columns: 1fr !important; } .cap-grid-paper { grid-template-columns: 1fr 1fr !important; } }
`;

/* ─── Grade data ─────────────────────────────────────────────────────────────── */
const GRADES = [
  {
    code: "FBB",
    slug: "itc-fbb-boards",
    name: "ITC FBB Boards",
    source: "Traded · ITC PSPD",
    gsmRange: "230–400 GSM",
    brands: "Cyber Oak · Cyber XLPac · PearlXL",
    origin: "India (ITC)",
    certifications: "FSC · ISO 9001 · BRC",
    desc: "Premium folding box board for pharma cartons, FMCG retail and luxury packaging. Virgin fibre, consistent brightness, press-ready sheeted sizes.",
    useCases: ["Pharma cartons (primary & secondary)", "FMCG retail packaging and POS displays"],
    images: ["/products/paper/fbb-board.jpg", "/products/paper/fbb-board-2.jpg", "/products/paper/fbb-board-3.jpg"],
  },
  {
    code: "DPX",
    slug: "duplex-board",
    name: "Duplex Board",
    source: "Traded · Cut to Size",
    gsmRange: "200–450 GSM",
    brands: "Standard & premium grades",
    origin: "India",
    certifications: "BIS compliant",
    desc: "Coated duplex board for pharmaceutical packaging, carton manufacturing and retail secondary packaging. Sheeted from reel to press-ready dimensions.",
    useCases: ["Pharmaceutical secondary cartons", "FMCG mono-carton converting"],
    images: ["/products/paper/duplex-board.jpg", "/products/paper/duplex-board-2.jpg", "/products/paper/duplex-board-3.jpg"],
  },
  {
    code: "KLB",
    slug: "kraft-liner",
    name: "Kraft Liner Board",
    source: "Traded · Imported",
    gsmRange: "100–440 GSM",
    brands: "Virgin kraft · Recycled kraft",
    origin: "Imported (EU / SE Asia)",
    certifications: "ISPM-15 exempt",
    desc: "100% fresh fibre imported kraft liner for heavy-duty corrugated and export packaging. High burst and SCT strength for demanding transit applications.",
    useCases: ["Heavy-duty export corrugated boxes", "Industrial packaging requiring high burst strength"],
    images: ["/products/paper/kraft-liner.jpg", "/products/paper/kraft-liner-2.jpg", "/products/paper/kraft-liner-3.jpg"],
  },
  {
    code: "TLF",
    slug: "test-liners-fluting",
    name: "Test Liners & Fluting",
    source: "Traded · Recycled Fibre",
    gsmRange: "80–400 GSM",
    brands: "Standard recycled grades",
    origin: "India",
    certifications: "BIS IS 1763",
    desc: "Recycled fibre test liners and fluting medium for corrugators and box manufacturers. Cost-effective choice for secondary and tertiary packaging.",
    useCases: ["Corrugator feed for box manufacturers", "Secondary and tertiary transit packaging"],
    images: ["/products/paper/test-liner.jpg", "/products/paper/test-liner-2.jpg", "/products/paper/test-liner-3.jpg"],
  },
  {
    code: "WTK",
    slug: "white-top-kraft-liner",
    name: "White Top Kraft Liner",
    source: "Traded · Print-Ready",
    gsmRange: "120–200 GSM",
    brands: "FSC certified grades",
    origin: "Imported (Scandinavia)",
    certifications: "FSC · EU food contact",
    desc: "White coated top surface on kraft base — ideal for printed corrugated outer cases where retail shelf appeal matters. Direct print, offset and flexo compatible.",
    useCases: ["Retail-facing printed corrugated outers", "FMCG display-ready shipper cases"],
    images: ["/products/paper/kraft-liner.jpg", "/products/paper/kraft-liner-2.jpg", "/products/paper/kraft-liner-3.jpg"],
  },
];

const CAPS = [
  { stat: "5",          label: "Board grades",    sub: "FBB · Duplex · Kraft · Test · White Top" },
  { stat: "80–450",     label: "GSM range",        sub: "across all grades" },
  { stat: "Ready stock",label: "Pune warehouse",   sub: "fast turnaround" },
  { stat: "2–5 days",   label: "Lead time",        sub: "sheeted to size" },
];

/* ─── Scroll reveal ──────────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100, background: C.cream,
      borderBottom: `1px solid ${scrolled ? C.borderMid : C.border}`,
      boxShadow: scrolled ? "0 1px 20px rgba(28,26,23,0.05)" : "none",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.5rem, 4vw, 3rem)", height: "68px", transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link href="/products" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
          <span style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe }}>←</span>
          <span style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe }}>Products</span>
        </Link>
        <span style={{ color: C.border, fontSize: "1.2rem" }}>|</span>
        <SiteLogo href="/" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link href="/infrastructure" className="nav-link">Infrastructure</Link>
        <Link href="/#contact" className="btn-kraft" style={{ padding: "9px 22px", fontSize: "0.74rem" }}>
          Request a Quote →
        </Link>
      </div>
    </nav>
  );
}

/* ─── Grade Image Carousel ───────────────────────────────────────────────────── */
function GradeCarousel({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    if (paused) return;
    let t: ReturnType<typeof setTimeout>;
    const len = images.length;
    const advance = (current: number) => {
      const isLast = current === len - 1;
      t = setTimeout(() => { const next = (current + 1) % len; setIdx(next); advance(next); }, isLast ? 3000 : 2000);
    };
    const init = setTimeout(() => advance(0), 1500);
    return () => { clearTimeout(t); clearTimeout(init); };
  }, [paused, images.length]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 36) setIdx(c => dx < 0 ? (c + 1) % images.length : (c + 2) % images.length);
      }}
      style={{ position: "relative", height: "220px", overflow: "hidden", background: C.parchment }}
    >
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={`${name} ${i + 1}`} className={`carousel-img${i === idx ? " active" : ""}`} />
      ))}
      <div style={{ position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)" }}>
        <div style={{ display: "flex", gap: "5px", padding: "8px 12px" }}>
          {images.map((_, i) => (
            <button key={i} className="dot-pip"
              onClick={(e) => { e.preventDefault(); setIdx(i); }}
              style={{ width: i === idx ? "18px" : "6px", background: i === idx ? C.cream : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Grade Card ─────────────────────────────────────────────────────────────── */
function GradeCard({ grade, delay }: { grade: typeof GRADES[0]; delay: number }) {
  return (
    <Link href={`/products/${grade.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
      <div
        className="grade-card sr"
        style={{
          background: "#fff", border: `1px solid ${C.border}`, borderRadius: "1px",
          overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
          animationDelay: `${delay}s`,
        }}
      >
        <GradeCarousel images={grade.images} name={grade.name} />

        <div style={{ padding: "1.4rem 1.4rem 1.6rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Code + source */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: F.mono, fontSize: "0.68rem", fontWeight: 500,
              color: C.kraft, background: C.kraftLight, border: `1px solid ${C.kraftMid}`,
              padding: "3px 8px", borderRadius: "1px",
            }}>{grade.code}</span>
            <span style={{
              fontFamily: F.body, fontSize: "0.65rem", color: C.taupe,
              background: C.parchment, border: `1px solid ${C.border}`,
              padding: "3px 8px", borderRadius: "1px",
            }}>{grade.source}</span>
          </div>

          <h3 style={{ fontFamily: F.display, fontSize: "1.1rem", fontWeight: 600, color: C.charcoal, lineHeight: 1.25 }}>
            {grade.name}
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            <span className="spec-pill">{grade.gsmRange}</span>
            <span className="spec-pill">{grade.origin}</span>
            <span className="spec-pill-k">{grade.certifications}</span>
          </div>

          <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.taupe, fontWeight: 300 }}>
            Brands: <span style={{ color: C.charcoal, fontWeight: 400 }}>{grade.brands}</span>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
            {grade.useCases.map((uc, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span style={{ color: C.kraft, fontSize: "0.6rem", marginTop: "4px", flexShrink: 0 }}>▶</span>
                <span style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.warm, lineHeight: 1.5 }}>{uc}</span>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "6px", paddingTop: "0.5rem",
            borderTop: `1px solid ${C.border}`, marginTop: "0.25rem",
          }}>
            <span style={{ fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500, color: C.kraft, letterSpacing: "0.04em" }}>
              View Full Specs
            </span>
            <span style={{ color: C.kraft, fontSize: "0.78rem" }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function PaperBoardPage() {
  useScrollReveal();

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "80px clamp(1.5rem, 5vw, 4rem) 72px", background: C.cream }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="fade-up d1" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <span style={{
              fontFamily: F.mono, fontSize: "0.65rem", fontWeight: 500,
              color: C.kraft, background: C.kraftLight, border: `1px solid ${C.kraftMid}`,
              padding: "4px 10px", borderRadius: "1px", letterSpacing: "0.1em",
            }}>PAPER & BOARD GRADES</span>
            <div className="rule-grow" style={{ flex: 1, height: "1px", background: C.border, maxWidth: "300px" }} />
            <span style={{ fontFamily: F.body, fontSize: "0.65rem", color: C.taupe, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              5 grades · 80–450 GSM · Ready stock
            </span>
          </div>

          <h1 className="fade-up d2" style={{
            fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2.6rem, 6vw, 5.5rem)",
            lineHeight: 1.0, color: C.charcoal, letterSpacing: "-0.028em", maxWidth: "820px",
          }}>
            Paper grades,
            <br /><em style={{ fontWeight: 400, color: C.warm }}>press-ready.</em>
          </h1>

          <div style={{ height: "1px", background: C.borderMid, margin: "2rem 0", maxWidth: "820px" }} />

          <p className="fade-up d3" style={{
            fontFamily: F.body, fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
            color: C.taupe, lineHeight: 1.85, maxWidth: "560px", fontWeight: 300,
          }}>
            Authorised distributor of ITC PSPD and TNPL board grades — FBB, duplex, kraft liner,
            test liner and white top. Sheeted from reel to your exact press dimensions out of our
            Pune warehouse.
          </p>

          <div className="fade-up d4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2.5rem" }}>
            <Link href="/#contact" className="btn-kraft">Request Samples & Pricing →</Link>
            <Link href="/products" className="btn-ghost">← All Products</Link>
          </div>
        </div>
      </section>

      {/* Capability bar */}
      <section style={{ padding: "3rem clamp(1.5rem, 5vw, 4rem)", background: C.charcoal }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="cap-grid-paper" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
            {CAPS.map((cap, i) => (
              <div key={i} className="sr" style={{
                padding: "1.5rem 1.25rem",
                borderRight: i < CAPS.length - 1 ? "1px solid rgba(250,247,242,0.08)" : "none",
              }}>
                <div style={{
                  fontFamily: F.display, fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
                  fontWeight: 600, color: C.cream, lineHeight: 1.1, marginBottom: "0.4rem",
                }}>
                  {cap.stat}
                </div>
                <div style={{
                  fontFamily: F.body, fontSize: "0.76rem", fontWeight: 500,
                  color: "rgba(250,247,242,0.7)", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: "0.2rem",
                }}>
                  {cap.label}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: "0.62rem", color: "rgba(250,247,242,0.35)" }}>
                  {cap.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade cards */}
      <section style={{ padding: "4rem clamp(1.5rem, 5vw, 4rem)", background: C.cream, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="sr" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.68rem", fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase", color: C.kraft, whiteSpace: "nowrap",
            }}>Paper & Board Grades</span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
            <span style={{ fontFamily: F.mono, fontSize: "0.65rem", color: C.taupe, whiteSpace: "nowrap" }}>
              5 grades
            </span>
          </div>

          <div className="grade-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
            {GRADES.map((g, i) => (
              <GradeCard key={g.code} grade={g} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem clamp(1.5rem, 5vw, 4rem)", background: C.kraft }}>
        <div style={{
          maxWidth: "1400px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center",
        }}>
          <div>
            <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "0.9rem", color: "rgba(250,247,242,0.55)", marginBottom: "0.6rem" }}>
              Need a specific grade or GSM?
            </p>
            <h2 style={{
              fontFamily: F.display, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
              fontWeight: 600, color: C.cream, lineHeight: 1.2, marginBottom: "0.75rem",
            }}>
              We source what others can&apos;t.
            </h2>
            <p style={{
              fontFamily: F.body, fontSize: "0.9rem", color: "rgba(250,247,242,0.6)",
              maxWidth: "480px", lineHeight: 1.75, fontWeight: 300,
            }}>
              Send us your grade spec, GSM, and quantity — we&apos;ll quote from ITC, TNPL or
              imported sources and get samples to you within 2 working days.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flexShrink: 0 }}>
            <Link href="/#contact" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: C.cream, color: C.kraft,
              fontFamily: F.body, fontSize: "0.8rem", fontWeight: 600,
              letterSpacing: "0.09em", textTransform: "uppercase",
              padding: "14px 28px", borderRadius: "1px", textDecoration: "none",
            }}>
              Get Pricing →
            </Link>
            <a href="https://wa.me/919999999999" style={{
              display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center",
              background: "rgba(250,247,242,0.12)", color: C.cream,
              fontFamily: F.body, fontSize: "0.78rem", fontWeight: 400,
              padding: "11px 20px", borderRadius: "1px", textDecoration: "none",
              border: "1px solid rgba(250,247,242,0.2)",
            }}>
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.dark, padding: "2rem clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{
          maxWidth: "1400px", margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "1rem",
        }}>
          <span style={{ fontFamily: F.body, fontSize: "0.76rem", color: "rgba(250,247,242,0.38)" }}>
            © {new Date().getFullYear()} Pune Global Group · Paper & Board Trading
          </span>
          <Link href="/products" style={{ fontFamily: F.body, fontSize: "0.76rem", color: "rgba(250,247,242,0.38)", textDecoration: "none" }}>
            All Products
          </Link>
        </div>
      </footer>
    </div>
  );
}
