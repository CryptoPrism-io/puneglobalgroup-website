"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  ArrowRight, Menu, X, Globe, TrendingUp, Building2,
  Banknote, Truck, Code2, CheckCircle, Loader2,
  MapPin, Mail, Phone, Shield, Zap, Award, ChevronDown,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
`;

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
  white:      "#ffffff",
  offwhite:   "#f8f9fa",
  offwhite2:  "#f1f3f5",
  near:       "#111827",
  mid:        "#374151",
  subtle:     "#6b7280",
  faint:      "#9ca3af",
  line:       "#e5e7eb",
  accent:     "#00c46a",
  accentMid:  "#00a857",
  accentTint: "rgba(0,196,106,0.08)",
  accentBorder:"rgba(0,196,106,0.25)",
  display:    "'DM Serif Display', Georgia, serif",
  body:       "'DM Sans', system-ui, sans-serif",
};

/* ─── Global styles ─────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${T.white}; color: ${T.near}; font-family: ${T.body}; -webkit-font-smoothing: antialiased; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(36px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes pulse    { 0%,100% { opacity:.6; } 50% { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
  @keyframes marquee  { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  .nav-link {
    background: none; border: none; cursor: pointer;
    font-family: ${T.body}; font-size: .875rem; font-weight: 500;
    color: ${T.mid}; letter-spacing: .01em; padding: 0;
    position: relative; transition: color .2s;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
    height: 1.5px; background: ${T.accent}; transform: scaleX(0);
    transform-origin: left; transition: transform .25s cubic-bezier(.22,1,.36,1);
  }
  .nav-link:hover { color: ${T.near}; }
  .nav-link:hover::after { transform: scaleX(1); }

  .cta-btn {
    display: inline-flex; align-items: center; gap: .55rem;
    background: ${T.accent}; color: #000; border: none; border-radius: 4px;
    padding: .6rem 1.35rem; cursor: pointer;
    font-family: ${T.body}; font-size: .875rem; font-weight: 600;
    letter-spacing: .01em; transition: background .2s, transform .2s, box-shadow .2s;
  }
  .cta-btn:hover {
    background: ${T.accentMid}; transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,196,106,.3);
  }
  .cta-btn-outline {
    display: inline-flex; align-items: center; gap: .55rem;
    background: transparent; color: ${T.near}; border: 1.5px solid ${T.near};
    border-radius: 4px; padding: .6rem 1.35rem; cursor: pointer;
    font-family: ${T.body}; font-size: .875rem; font-weight: 500;
    letter-spacing: .01em; transition: background .2s, color .2s;
  }
  .cta-btn-outline:hover { background: ${T.near}; color: ${T.white}; }

  .service-card {
    background: ${T.white}; border: 1px solid ${T.line};
    border-top: 3px solid transparent;
    padding: 2.25rem; transition: border-top-color .25s, box-shadow .25s, transform .25s;
    cursor: default;
  }
  .service-card:hover {
    border-top-color: ${T.accent};
    box-shadow: 0 8px 32px rgba(0,0,0,.07);
    transform: translateY(-3px);
  }

  .stat-block {
    border-left: 3px solid ${T.accent}; padding: 1.25rem 2rem;
    transition: background .2s;
  }
  .stat-block:hover { background: ${T.accentTint}; }

  .form-input {
    width: 100%; background: ${T.white}; border: 1.5px solid ${T.line};
    border-radius: 4px; padding: .8rem 1rem; color: ${T.near};
    font-family: ${T.body}; font-size: .9rem; outline: none;
    transition: border-color .2s; box-sizing: border-box;
  }
  .form-input:focus { border-color: ${T.accent}; }
  .form-input::placeholder { color: ${T.faint}; }

  .footer-link {
    color: rgba(255,255,255,.5); text-decoration: none; font-size: .875rem;
    transition: color .2s;
  }
  .footer-link:hover { color: ${T.white}; }

  @media (max-width: 768px) {
    .desktop-nav  { display: none !important; }
    .hamburger    { display: flex !important; }
    .hero-cta-row { flex-direction: column; align-items: flex-start !important; }
    .stat-row     { gap: 2rem !important; }
    .services-grid{ grid-template-columns: 1fr !important; }
    .about-grid   { grid-template-columns: 1fr !important; gap: 3.5rem !important; }
    .contact-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
    .footer-grid  { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
    .hero-headline{ font-size: clamp(2.8rem, 11vw, 5rem) !important; }
    .form-name-row{ grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .stat-row { flex-wrap: wrap !important; gap: 1.5rem 2.5rem !important; }
  }
`;

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s,
                 transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
  };
}

/* ─── Navbar ────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Services", "About", "Contact"];
  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: T.white,
        borderBottom: scrolled ? `1px solid ${T.line}` : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,.06)" : "none",
        padding: "0 5vw",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "border-color .3s, box-shadow .3s",
        fontFamily: T.body,
      }}>
        {/* Logo */}
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: ".65rem" }}
        >
          <span style={{
            width: 34, height: 34, background: T.near, borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.display, fontWeight: 400, fontSize: "1rem",
            color: T.accent, letterSpacing: "-.01em", flexShrink: 0,
          }}>PGG</span>
          <span style={{
            fontFamily: T.body, fontSize: ".95rem", fontWeight: 600,
            color: T.near, letterSpacing: "-.01em", lineHeight: 1,
          }}>
            Pune Global <span style={{ color: T.subtle, fontWeight: 400 }}>Group</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.25rem" }}>
          {links.map(l => (
            <button key={l} className="nav-link" onClick={() => scrollTo(l)}>{l}</button>
          ))}
          <div style={{ width: 1, height: 20, background: T.line }} />
          <button className="cta-btn" onClick={() => scrollTo("Contact")} style={{ padding: ".5rem 1.15rem", fontSize: ".82rem" }}>
            Get in Touch <ArrowRight size={14} />
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setOpen(!open)}
          style={{
            display: "none", background: "none", border: `1px solid ${T.line}`,
            borderRadius: 4, padding: ".4rem .5rem", cursor: "pointer", color: T.near,
            alignItems: "center", justifyContent: "center",
          }}
        >{open ? <X size={18} /> : <Menu size={18} />}</button>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 199,
        background: T.white, borderBottom: `1px solid ${T.line}`,
        padding: "1.5rem 5vw",
        display: "flex", flexDirection: "column", gap: ".75rem",
        transform: open ? "translateY(0)" : "translateY(-110%)",
        opacity: open ? 1 : 0,
        transition: "transform .3s cubic-bezier(.22,1,.36,1), opacity .3s",
      }}>
        {links.map(l => (
          <button key={l} onClick={() => scrollTo(l)} style={{
            background: "none", border: `1px solid ${T.line}`, borderRadius: 4,
            padding: ".85rem 1.25rem", cursor: "pointer",
            fontFamily: T.body, fontSize: "1rem", fontWeight: 500,
            color: T.near, textAlign: "left",
          }}>{l}</button>
        ))}
        <button className="cta-btn" onClick={() => scrollTo("Contact")} style={{ padding: ".9rem", fontSize: "1rem", justifyContent: "center", borderRadius: 4 }}>
          Get in Touch <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}

/* ─── Ticker / Brand strip ──────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "Consulting", "·", "Export & Import", "·", "Real Estate", "·",
  "Financial Services", "·", "Logistics", "·", "IT Solutions", "·",
  "Consulting", "·", "Export & Import", "·", "Real Estate", "·",
  "Financial Services", "·", "Logistics", "·", "IT Solutions", "·",
];

function Ticker() {
  return (
    <div style={{
      background: T.near, overflow: "hidden",
      padding: "0", height: 42,
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        display: "flex", gap: "2.5rem",
        animation: "marquee 28s linear infinite",
        whiteSpace: "nowrap", willChange: "transform",
      }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{
            fontFamily: T.body,
            fontSize: ".72rem",
            fontWeight: item === "·" ? 700 : 500,
            letterSpacing: item === "·" ? 0 : ".1em",
            textTransform: "uppercase",
            color: item === "·" ? T.accent : "rgba(255,255,255,.45)",
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      background: T.white,
      paddingTop: 64,
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      <Ticker />

      {/* Main hero body */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center",
        padding: "5vw 5vw 0",
        position: "relative",
      }}>
        {/* Large decorative rule */}
        <div style={{
          position: "absolute", top: 0, right: "5vw",
          width: 1, height: "100%",
          background: `linear-gradient(to bottom, ${T.line}, transparent)`,
        }} />

        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "4rem", alignItems: "center" }}>

            {/* Left: Text */}
            <div>
              {/* Eyebrow */}
              <div style={{
                ...reveal(mounted, 0),
                display: "inline-flex", alignItems: "center", gap: ".6rem",
                marginBottom: "2rem",
              }}>
                <span style={{
                  width: 28, height: 2, background: T.accent, display: "inline-block",
                }} />
                <span style={{
                  fontFamily: T.body, fontSize: ".72rem", fontWeight: 600,
                  letterSpacing: ".14em", textTransform: "uppercase", color: T.accent,
                }}>Pune, India — Since 2004</span>
              </div>

              {/* Headline */}
              <h1 className="hero-headline" style={{
                ...reveal(mounted, .08),
                fontFamily: T.display, fontWeight: 400,
                fontSize: "clamp(3.5rem, 6.5vw, 6.2rem)",
                lineHeight: 1.03, letterSpacing: "-.025em",
                color: T.near, marginBottom: ".7em",
              }}>
                Global Business,{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <em style={{ fontStyle: "italic", color: T.near }}>Pune&apos;s Pride.</em>
                  <span style={{
                    position: "absolute", left: 0, right: 0, bottom: "-.08em",
                    height: ".14em", background: T.accent, borderRadius: 2,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform .7s cubic-bezier(.22,1,.36,1) .5s, opacity .1s .5s",
                  }} />
                </span>
              </h1>

              {/* Sub */}
              <p style={{
                ...reveal(mounted, .18),
                fontFamily: T.body, fontWeight: 300,
                fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                lineHeight: 1.78, color: T.mid,
                maxWidth: 540, marginBottom: "2.75rem",
              }}>
                A diversified business group delivering world-class solutions across
                consulting, real estate, finance, logistics, and technology.
              </p>

              {/* CTAs */}
              <div className="hero-cta-row" style={{ ...reveal(mounted, .26), display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                <button className="cta-btn" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ padding: ".8rem 1.75rem", fontSize: ".9rem" }}>
                  Start a Conversation <ArrowRight size={16} />
                </button>
                <button className="cta-btn-outline" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ padding: ".8rem 1.75rem", fontSize: ".9rem" }}>
                  Our Services
                </button>
              </div>
            </div>

            {/* Right: Decorative stat panel */}
            <div style={{ ...reveal(mounted, .14) }}>
              <div style={{
                border: `1px solid ${T.line}`, borderRadius: 2,
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  background: T.near, padding: "1.5rem 1.75rem",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontFamily: T.body, fontSize: ".72rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.5)" }}>Group Overview</span>
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    {[T.accent, "#fbbf24", "#f87171"].map(c => (
                      <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                </div>

                {/* Stats */}
                {[
                  { num: "20+", label: "Years of Excellence", sub: "Since 2004" },
                  { num: "500+", label: "Clients Served", sub: "Across India & Global" },
                  { num: "12", label: "Cities Active", sub: "Pan-India Presence" },
                  { num: "6", label: "Business Sectors", sub: "Diversified Portfolio" },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    padding: "1.25rem 1.75rem",
                    borderTop: `1px solid ${T.line}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: i % 2 === 0 ? T.white : T.offwhite,
                    transition: "background .2s",
                  }}>
                    <div>
                      <div style={{ fontFamily: T.display, fontSize: "1.9rem", fontWeight: 400, color: T.near, lineHeight: 1 }}>{s.num}</div>
                      <div style={{ fontFamily: T.body, fontSize: ".8rem", fontWeight: 500, color: T.mid, marginTop: ".2rem" }}>{s.label}</div>
                    </div>
                    <span style={{
                      fontFamily: T.body, fontSize: ".68rem", fontWeight: 500,
                      letterSpacing: ".06em", textTransform: "uppercase",
                      color: T.accent, background: T.accentTint,
                      padding: ".25rem .65rem", borderRadius: 100,
                    }}>{s.sub}</span>
                  </div>
                ))}

                {/* Footer strip */}
                <div style={{
                  background: T.accentTint, borderTop: `1px solid ${T.accentBorder}`,
                  padding: "1rem 1.75rem",
                  display: "flex", alignItems: "center", gap: ".6rem",
                }}>
                  <Globe size={13} color={T.accent} />
                  <span style={{ fontFamily: T.body, fontSize: ".75rem", color: T.accent, fontWeight: 500 }}>
                    Redefining Business for a Changing World
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        padding: "3rem 5vw 2.5rem",
        display: "flex", alignItems: "center", gap: "1rem",
        opacity: mounted ? 1 : 0,
        transition: "opacity .6s .8s",
      }}>
        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <div style={{ width: 1, height: 36, background: T.line }} />
            <span style={{ fontFamily: T.body, fontSize: ".7rem", fontWeight: 500, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint }}>
              Scroll to explore
            </span>
            <ChevronDown size={14} color={T.faint} style={{ animation: "pulse 2s ease-in-out infinite" }} />
          </div>
          <span style={{ fontFamily: T.body, fontSize: ".72rem", color: T.faint }}>puneglobalgroup.in</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Services ──────────────────────────────────────────────────────────── */
const SERVICES = [
  {
    icon: TrendingUp,
    title: "Consulting",
    desc: "Strategic advisory that transforms business challenges into competitive advantages. We bring deep domain expertise across manufacturing, FMCG, and services.",
    tag: "Strategy",
  },
  {
    icon: Globe,
    title: "Export & Import",
    desc: "Seamless global trade facilitation with end-to-end documentation, customs compliance, and multi-modal logistics. Connecting Indian businesses to world markets.",
    tag: "Trade",
  },
  {
    icon: Building2,
    title: "Real Estate",
    desc: "Premium residential and commercial property development across Maharashtra. From land acquisition through delivery — quality built into every square foot.",
    tag: "Property",
  },
  {
    icon: Banknote,
    title: "Financial Services",
    desc: "Tailored financial solutions spanning investments, corporate finance, working capital, and wealth management. Disciplined capital allocation for sustainable growth.",
    tag: "Finance",
  },
  {
    icon: Truck,
    title: "Logistics",
    desc: "Reliable, tech-enabled supply chain and last-mile delivery solutions. Real-time visibility, optimised routes, and consistent performance across India.",
    tag: "Supply Chain",
  },
  {
    icon: Code2,
    title: "IT Solutions",
    desc: "Custom software, cloud architecture, and digital transformation for modern enterprises. We build technology that scales with your ambition.",
    tag: "Technology",
  },
];

function Services() {
  const { ref, visible } = useInView(0.1);

  return (
    <section
      id="services"
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: T.offwhite, padding: "7rem 5vw" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Section label */}
        <div style={{ ...reveal(visible, 0), display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem" }}>
          <span style={{ width: 28, height: 2, background: T.accent, display: "inline-block" }} />
          <span style={{ fontFamily: T.body, fontSize: ".72rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.accent }}>What We Do</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <h2 style={{
            ...reveal(visible, .08),
            fontFamily: T.display, fontWeight: 400,
            fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
            lineHeight: 1.08, letterSpacing: "-.02em",
            color: T.near, maxWidth: 520,
          }}>
            Six Pillars of<br /><em>Sustained Growth</em>
          </h2>
          <p style={{
            ...reveal(visible, .14),
            fontFamily: T.body, fontWeight: 300,
            fontSize: ".95rem", lineHeight: 1.75,
            color: T.subtle, maxWidth: 380,
          }}>
            Each business vertical is operated with dedicated teams, deep market knowledge, and a singular commitment to client outcomes.
          </p>
        </div>

        {/* Grid */}
        <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: T.line }}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="service-card"
                style={{
                  ...reveal(visible, .08 + i * .06),
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}>
                  <div style={{
                    width: 44, height: 44,
                    background: T.offwhite2,
                    borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color={T.mid} strokeWidth={1.5} />
                  </div>
                  <span style={{
                    fontFamily: T.body, fontSize: ".65rem", fontWeight: 600,
                    letterSpacing: ".1em", textTransform: "uppercase",
                    color: T.faint, border: `1px solid ${T.line}`,
                    padding: ".2rem .6rem", borderRadius: 100,
                  }}>{s.tag}</span>
                </div>

                <h3 style={{
                  fontFamily: T.display, fontWeight: 400,
                  fontSize: "1.45rem", letterSpacing: "-.01em",
                  color: T.near, marginBottom: ".75rem", lineHeight: 1.2,
                }}>{s.title}</h3>

                <p style={{
                  fontFamily: T.body, fontSize: ".875rem",
                  lineHeight: 1.72, color: T.subtle, fontWeight: 300,
                }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─────────────────────────────────────────────────────────────── */
const VALUES = [
  { icon: Shield, label: "Integrity", desc: "Transparency and ethical conduct in every interaction, every decision, every relationship." },
  { icon: Zap,    label: "Innovation", desc: "Forward-thinking approaches that redefine how business gets done in a changing world." },
  { icon: Award,  label: "Excellence", desc: "Relentless pursuit of quality — in outcomes, client relationships, and the services we deliver." },
];

function About() {
  const { ref, visible } = useInView(0.1);

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: T.white, padding: "7rem 5vw", position: "relative", overflow: "hidden" }}
    >
      {/* Decorative large text watermark */}
      <div style={{
        position: "absolute", top: "50%", right: "-2vw",
        transform: "translateY(-50%)",
        fontFamily: T.display, fontSize: "clamp(8rem, 18vw, 16rem)",
        fontWeight: 400, color: T.offwhite,
        userSelect: "none", pointerEvents: "none", lineHeight: 1,
        letterSpacing: "-.04em",
      }}>PGG</div>

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Label */}
        <div style={{ ...reveal(visible, 0), display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem" }}>
          <span style={{ width: 28, height: 2, background: T.accent, display: "inline-block" }} />
          <span style={{ fontFamily: T.body, fontSize: ".72rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.accent }}>About Us</span>
        </div>

        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>

          {/* Left */}
          <div>
            <h2 style={{
              ...reveal(visible, .08),
              fontFamily: T.display, fontWeight: 400,
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              lineHeight: 1.1, letterSpacing: "-.02em",
              color: T.near, marginBottom: "1.75rem",
            }}>
              Built on Trust.<br /><em>Driven by Purpose.</em>
            </h2>

            <p style={{ ...reveal(visible, .14), fontFamily: T.body, fontSize: ".95rem", lineHeight: 1.8, color: T.mid, fontWeight: 300, marginBottom: "1.25rem" }}>
              Founded in Pune, Pune Global Group has grown from a regional consulting firm into a diversified conglomerate serving clients across India and internationally. Our roots in Maharashtra give us deep market insight; our global partnerships give us the scale to deliver.
            </p>
            <p style={{ ...reveal(visible, .2), fontFamily: T.body, fontSize: ".95rem", lineHeight: 1.8, color: T.mid, fontWeight: 300, marginBottom: "3rem" }}>
              We believe that business done right uplifts communities, creates lasting value, and opens doors for future generations. This belief drives every venture we undertake — across every sector, in every city we operate.
            </p>

            {/* Values */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={v.label} style={{ ...reveal(visible, .26 + i * .08), display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 4,
                      background: T.offwhite, border: `1px solid ${T.line}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={17} color={T.accent} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: T.body, fontSize: ".9rem",
                        fontWeight: 600, color: T.near, marginBottom: ".3rem",
                      }}>{v.label}</div>
                      <div style={{
                        fontFamily: T.body, fontSize: ".85rem",
                        color: T.subtle, lineHeight: 1.7, fontWeight: 300,
                      }}>{v.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Stat blocks */}
          <div style={{ ...reveal(visible, .12) }}>
            {/* Large decorative stat */}
            <div style={{
              border: `1px solid ${T.line}`,
              borderTop: `4px solid ${T.near}`,
              padding: "2.5rem",
              marginBottom: "1px",
              background: T.white,
            }}>
              <div style={{ fontFamily: T.display, fontSize: "clamp(4rem, 7vw, 5.5rem)", fontWeight: 400, color: T.near, lineHeight: .9, letterSpacing: "-.03em" }}>
                20<span style={{ color: T.accent }}>+</span>
              </div>
              <div style={{ fontFamily: T.body, fontSize: ".8rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: T.mid, marginTop: "1rem" }}>
                Years Delivering Results
              </div>
              <div style={{ fontFamily: T.body, fontSize: ".85rem", color: T.subtle, fontWeight: 300, lineHeight: 1.7, marginTop: ".6rem", maxWidth: 280 }}>
                Two decades of navigating India&apos;s dynamic business landscape — and emerging stronger every time.
              </div>
            </div>

            {/* Row of 2 stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: T.line }}>
              {[
                { num: "500+", label: "Clients", sub: "Pan-India" },
                { num: "12", label: "Cities", sub: "Active Presence" },
              ].map(s => (
                <div key={s.label} className="stat-block" style={{
                  background: T.offwhite, padding: "1.75rem 1.5rem",
                }}>
                  <div style={{ fontFamily: T.display, fontSize: "2.6rem", fontWeight: 400, color: T.near, lineHeight: 1 }}>
                    {s.num}
                  </div>
                  <div style={{ fontFamily: T.body, fontSize: ".78rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: T.mid, marginTop: ".5rem" }}>{s.label}</div>
                  <div style={{ fontFamily: T.body, fontSize: ".72rem", color: T.faint, marginTop: ".2rem" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Quote strip */}
            <div style={{
              background: T.near, padding: "1.75rem 2rem", marginTop: "1px",
              borderBottom: `3px solid ${T.accent}`,
            }}>
              <p style={{
                fontFamily: T.display, fontStyle: "italic",
                fontSize: "1.2rem", lineHeight: 1.55,
                color: "rgba(255,255,255,.85)", marginBottom: ".75rem",
              }}>
                &ldquo;Redefining Business for a Changing World.&rdquo;
              </p>
              <span style={{ fontFamily: T.body, fontSize: ".72rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: T.accent }}>
                Pune Global Group — Mission Statement
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Contact ───────────────────────────────────────────────────────────── */
function Contact() {
  const { ref, visible } = useInView(0.1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "contacts"), {
        ...form,
        createdAt: serverTimestamp(),
        source: "website",
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: T.offwhite, padding: "7rem 5vw" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Label */}
        <div style={{ ...reveal(visible, 0), display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem" }}>
          <span style={{ width: 28, height: 2, background: T.accent, display: "inline-block" }} />
          <span style={{ fontFamily: T.body, fontSize: ".72rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.accent }}>Contact</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <h2 style={{
            ...reveal(visible, .08),
            fontFamily: T.display, fontWeight: 400,
            fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
            lineHeight: 1.1, letterSpacing: "-.02em",
            color: T.near,
          }}>
            Let&apos;s Build Something<br /><em>Remarkable Together</em>
          </h2>
        </div>

        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "4rem", alignItems: "start" }}>

          {/* Info panel */}
          <div style={{ ...reveal(visible, .1) }}>
            <p style={{ fontFamily: T.body, fontWeight: 300, fontSize: ".95rem", lineHeight: 1.8, color: T.mid, marginBottom: "2.5rem" }}>
              Whether you&apos;re exploring a partnership, seeking our services, or have a business proposition — our team is ready to listen and respond promptly.
            </p>

            {[
              { icon: MapPin, label: "Headquarters", value: "Pune, Maharashtra, India" },
              { icon: Mail,   label: "Email",        value: "contact@puneglobalgroup.in" },
              { icon: Phone,  label: "Phone",        value: "+91 20 0000 0000" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: "flex", gap: "1rem", alignItems: "flex-start",
                padding: "1.25rem 0",
                borderBottom: `1px solid ${T.line}`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 4,
                  background: T.white, border: `1px solid ${T.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={15} color={T.accent} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: T.faint, marginBottom: ".25rem" }}>{label}</div>
                  <div style={{ fontFamily: T.body, fontSize: ".9rem", color: T.near, fontWeight: 400 }}>{value}</div>
                </div>
              </div>
            ))}

            {/* Tagline block */}
            <div style={{
              marginTop: "2rem",
              padding: "1.5rem",
              background: T.near,
              borderLeft: `3px solid ${T.accent}`,
            }}>
              <p style={{
                fontFamily: T.body, fontSize: ".85rem",
                lineHeight: 1.7, color: "rgba(255,255,255,.65)",
                fontWeight: 300,
              }}>
                We typically respond to all enquiries within <strong style={{ color: T.white, fontWeight: 500 }}>one business day</strong>. For urgent matters, please call us directly.
              </p>
            </div>
          </div>

          {/* Form */}
          <div style={{ ...reveal(visible, .16) }}>
            <div style={{
              background: T.white, border: `1px solid ${T.line}`,
              borderRadius: 2, padding: "2.5rem",
              boxShadow: "0 2px 24px rgba(0,0,0,.04)",
            }}>
              {status === "success" ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: T.accentTint, border: `1px solid ${T.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem",
                  }}>
                    <CheckCircle size={26} color={T.accent} strokeWidth={1.75} />
                  </div>
                  <h3 style={{ fontFamily: T.display, fontSize: "1.8rem", fontWeight: 400, color: T.near, marginBottom: ".75rem" }}>
                    Message Received
                  </h3>
                  <p style={{ fontFamily: T.body, fontWeight: 300, fontSize: ".9rem", color: T.subtle, lineHeight: 1.7, marginBottom: "2rem" }}>
                    Thank you for reaching out. Our team will get back to you within one business day.
                  </p>
                  <button className="cta-btn-outline" onClick={() => setStatus("idle")} style={{ borderRadius: 4, padding: ".65rem 1.5rem", fontSize: ".875rem" }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-name-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: T.mid, marginBottom: ".4rem" }}>Full Name *</label>
                      <input
                        className="form-input" required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: T.mid, marginBottom: ".4rem" }}>Email *</label>
                      <input
                        className="form-input" required type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: T.mid, marginBottom: ".4rem" }}>Phone</label>
                    <input
                      className="form-input" type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div style={{ marginBottom: "1.75rem" }}>
                    <label style={{ display: "block", fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: T.mid, marginBottom: ".4rem" }}>Message *</label>
                    <textarea
                      className="form-input" required rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us about your business need…"
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {status === "error" && (
                    <div style={{
                      marginBottom: "1rem", padding: ".75rem 1rem",
                      background: "rgba(220,38,38,.06)", border: "1px solid rgba(220,38,38,.2)",
                      borderRadius: 4, fontFamily: T.body, fontSize: ".875rem", color: "#dc2626",
                    }}>
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit" disabled={status === "loading"}
                    className="cta-btn"
                    style={{
                      width: "100%", justifyContent: "center",
                      padding: ".9rem", fontSize: ".9rem",
                      opacity: status === "loading" ? .7 : 1,
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      borderRadius: 4,
                    }}
                  >
                    {status === "loading"
                      ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Sending…</>
                      : <>Send Message <ArrowRight size={15} /></>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer style={{ background: T.near, fontFamily: T.body }}>

      {/* Main footer */}
      <div style={{ padding: "4rem 5vw", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div className="footer-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "3rem" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: "1.25rem" }}>
              <span style={{
                width: 34, height: 34, background: T.accent, borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.display, fontWeight: 400, fontSize: "1rem", color: "#000",
              }}>PGG</span>
              <span style={{ fontFamily: T.body, fontSize: ".95rem", fontWeight: 600, color: T.white }}>
                Pune Global Group
              </span>
            </div>
            <p style={{ fontFamily: T.body, fontWeight: 300, fontSize: ".85rem", color: "rgba(255,255,255,.45)", lineHeight: 1.75, maxWidth: 260 }}>
              A diversified business group redefining what&apos;s possible from Pune, India — to the world.
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <Globe size={13} color={T.accent} />
              <span style={{ fontFamily: T.body, fontSize: ".75rem", color: T.accent, fontWeight: 500 }}>puneglobalgroup.in</span>
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "1.25rem" }}>Company</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {[{ label: "About", id: "about" }, { label: "Services", id: "services" }, { label: "Contact", id: "contact" }].map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)} style={{
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  padding: 0,
                  fontFamily: T.body, fontSize: ".875rem", color: "rgba(255,255,255,.5)",
                  transition: "color .2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = T.white)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.5)")}
                >{l.label}</button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "1.25rem" }}>Sectors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {["Consulting", "Real Estate", "Logistics", "IT Solutions", "Finance", "Trade"].map(s => (
                <span key={s} className="footer-link" style={{ fontFamily: T.body, fontSize: ".875rem" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: T.body, fontSize: ".7rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "1.25rem" }}>Reach Us</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: MapPin, val: "Pune, Maharashtra, India" },
                { icon: Mail,   val: "contact@puneglobalgroup.in" },
                { icon: Phone,  val: "+91 20 0000 0000" },
              ].map(({ icon: Icon, val }) => (
                <div key={val} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start" }}>
                  <Icon size={13} color={T.accent} strokeWidth={2} style={{ marginTop: ".15rem", flexShrink: 0 }} />
                  <span style={{ fontFamily: T.body, fontSize: ".82rem", color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "1.25rem 5vw" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: T.body, fontSize: ".78rem", color: "rgba(255,255,255,.3)" }}>
            &copy; {new Date().getFullYear()} Pune Global Group. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "1.75rem" }}>
            {["Privacy Policy", "Terms of Use", "Sitemap"].map(l => (
              <a key={l} href="#" className="footer-link" style={{ fontSize: ".78rem" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main style={{ fontFamily: T.body, background: T.white, minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
