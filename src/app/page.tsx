"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Phone, Mail, MapPin, Factory, Package, Layers, Box,
  ChevronRight, Menu, X, ArrowRight, CheckCircle,
  Loader2, Car, Pill, ShoppingCart, Zap, Wrench,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
`;

/* ─── Color tokens ──────────────────────────────────────────────────────────── */
const C = {
  cream:       "#FFFDF8",
  charcoal:    "#3A3530",
  taupe:       "#5A534D",
  saffron:     "#F4A236",
  saffronDim:  "rgba(244,162,54,0.12)",
  saffronBorder:"rgba(244,162,54,0.35)",
  sindoor:     "#DC143C",
  dark:        "#2C2825",
  light:       "#F5F0E8",
  border:      "rgba(58,53,48,0.1)",
  borderMid:   "rgba(58,53,48,0.18)",
};

/* ─── Typography ────────────────────────────────────────────────────────────── */
const F = {
  outfit:     "'Outfit', sans-serif",
  cormorant:  "'Cormorant Garamond', Georgia, serif",
  baskerville:"'Libre Baskerville', Georgia, serif",
};

/* ─── Global CSS ────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    background: ${C.cream};
    color: ${C.charcoal};
    font-family: ${F.outfit};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  ::selection { background: ${C.saffron}; color: #fff; }
  a { text-decoration: none; color: inherit; }

  /* Scroll-reveal */
  .sr { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }
  .sr-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr-left.visible { opacity: 1; transform: translateX(0); }
  .sr-right { opacity: 0; transform: translateX(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr-right.visible { opacity: 1; transform: translateX(0); }
  .sr-scale { opacity: 0; transform: scale(0.93); transition: opacity 0.65s ease, transform 0.65s ease; }
  .sr-scale.visible { opacity: 1; transform: scale(1); }

  /* Marquee animation */
  @keyframes marqueeScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marqueeScroll 28s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  /* Navbar scroll border */
  .navbar-scrolled {
    border-bottom: 2px solid ${C.saffron} !important;
    box-shadow: 0 2px 20px rgba(58,53,48,0.08) !important;
  }

  /* Nav link hover */
  .nav-link {
    position: relative;
    font-family: ${F.outfit};
    font-size: 0.9rem;
    font-weight: 500;
    color: ${C.taupe};
    letter-spacing: 0.03em;
    padding: 4px 0;
    transition: color 0.25s;
    cursor: pointer;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0; bottom: -2px;
    width: 0; height: 2px;
    background: ${C.saffron};
    transition: width 0.3s ease;
  }
  .nav-link:hover { color: ${C.charcoal}; }
  .nav-link:hover::after { width: 100%; }

  /* Product card hover */
  .product-card {
    background: ${C.cream};
    border: 1px solid ${C.border};
    border-left: 5px solid ${C.saffron};
    padding: 2.5rem 2rem;
    border-radius: 2px;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-left-color 0.3s;
    cursor: default;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(58,53,48,0.1);
    border-left-color: ${C.saffron};
  }

  /* Industry tile hover */
  .industry-tile {
    background: ${C.cream};
    border: 1px solid ${C.border};
    padding: 2rem 1.75rem;
    border-radius: 2px;
    transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
    cursor: default;
  }
  .industry-tile:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(58,53,48,0.08);
    background: #fff;
  }

  /* CTA button */
  .btn-saffron {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${C.saffron};
    color: #fff;
    font-family: ${F.outfit};
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 13px 28px;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
  }
  .btn-saffron:hover {
    background: #e5941f;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(244,162,54,0.4);
  }
  .btn-saffron:active { transform: translateY(0); }

  /* Form inputs */
  .form-input {
    width: 100%;
    background: ${C.cream};
    border: 1.5px solid ${C.borderMid};
    border-radius: 2px;
    padding: 12px 16px;
    font-family: ${F.baskerville};
    font-size: 0.95rem;
    color: ${C.charcoal};
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .form-input:focus {
    border-color: ${C.saffron};
    box-shadow: 0 0 0 3px ${C.saffronDim};
  }
  .form-input::placeholder { color: ${C.taupe}; opacity: 0.65; }

  /* Section eyebrow */
  .eyebrow {
    font-family: ${F.cormorant};
    font-style: italic;
    font-size: 1.05rem;
    font-weight: 400;
    color: ${C.saffron};
    letter-spacing: 0.04em;
    display: block;
    margin-bottom: 12px;
  }

  /* Stat divider */
  .stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255,253,248,0.2);
  }

  /* Footer link hover */
  .footer-link {
    font-family: ${F.outfit};
    font-size: 0.88rem;
    color: rgba(255,253,248,0.6);
    transition: color 0.2s;
    cursor: pointer;
    display: block;
    margin-bottom: 10px;
  }
  .footer-link:hover { color: ${C.saffron}; }

  /* Tag pill */
  .variant-tag {
    display: inline-block;
    background: ${C.saffronDim};
    color: ${C.saffron};
    border: 1px solid ${C.saffronBorder};
    font-family: ${F.outfit};
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 4px 12px;
    border-radius: 100px;
    margin: 4px 4px 0 0;
  }

  /* Mobile nav */
  .mobile-nav {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${C.dark};
    z-index: 999;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 36px;
  }
  .mobile-nav.open { display: flex; }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-grid { flex-direction: column !important; }
    .hero-stat-panel { width: 100% !important; margin-top: 3rem !important; }
    .about-grid { flex-direction: column !important; }
    .contact-grid { flex-direction: column !important; }
    .footer-grid { flex-direction: column !important; gap: 3rem !important; }
    .footer-cols { flex-direction: column !important; gap: 2rem !important; }
  }
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .hero-headline { font-size: clamp(2.4rem, 10vw, 4.5rem) !important; }
    .products-grid { grid-template-columns: 1fr !important; }
    .industries-grid { grid-template-columns: 1fr 1fr !important; }
    .stats-row { flex-direction: column !important; gap: 1.5rem !important; }
    .stat-divider { display: none !important; }
  }
  @media (max-width: 480px) {
    .industries-grid { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Turiya Logo SVG ───────────────────────────────────────────────────────── */
function TuriyaLogo({ size = 40 }: { size?: number }) {
  const s = size;

  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Pune Global Group Logo Symbol">
      {/* Left-pointing triangle */}
      <polygon
        points={`22,13 22,27 10,20`}
        fill={C.charcoal}
        opacity="0.9"
      />
      {/* Right-pointing triangle */}
      <polygon
        points={`18,13 18,27 30,20`}
        fill={C.charcoal}
        opacity="0.9"
      />
      {/* Upward-pointing triangle (saffron) */}
      <polygon
        points={`20,6 12,22 28,22`}
        fill={C.saffron}
        opacity="0.95"
      />
      {/* Red dot — bindu at center */}
      <circle cx="20" cy="20" r="2.2" fill={C.sindoor} />
    </svg>
  );
}

/* ─── Full Logo (symbol + wordmark) ────────────────────────────────────────── */
function Logo({ inverted = false }: { inverted?: boolean }) {
  const textColor = inverted ? C.cream : C.charcoal;
  const subColor = inverted ? "rgba(255,253,248,0.65)" : C.taupe;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", userSelect: "none" }}>
      <TuriyaLogo size={44} />
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{
          fontFamily: F.outfit,
          fontWeight: 600,
          fontSize: "1.05rem",
          letterSpacing: "0.12em",
          color: textColor,
          lineHeight: 1.1,
          textTransform: "uppercase",
        }}>
          PUNE GLOBAL GROUP
        </span>
        <span style={{
          fontFamily: F.cormorant,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "0.82rem",
          color: subColor,
          letterSpacing: "0.04em",
          lineHeight: 1.2,
        }}>
          Your Trusted Packaging Partner
        </span>
      </div>
    </div>
  );
}

/* ─── Scroll-reveal hook ────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll(".sr, .sr-left, .sr-right, .sr-scale");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
            setTimeout(() => el.classList.add("visible"), delay * 1000);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
}

/* ─── Navbar ────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Products", href: "#products" },
    { label: "Industries", href: "#industries" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={scrolled ? "navbar-scrolled" : ""}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 900,
          background: C.cream,
          borderBottom: scrolled ? undefined : `1px solid ${C.border}`,
          transition: "all 0.3s ease",
          height: "72px",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Logo />
          </button>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map((l) => (
              <button key={l.href} className="nav-link" onClick={() => scrollTo(l.href)} style={{ background: "none", border: "none" }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn-saffron desktop-nav" onClick={() => scrollTo("#contact")} style={{ padding: "10px 22px", fontSize: "0.82rem" }}>
              Get Quote <ArrowRight size={14} />
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: C.charcoal }}
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", cursor: "pointer", color: C.cream }}>
          <X size={28} />
        </button>
        <Logo inverted />
        {links.map((l) => (
          <button
            key={l.href}
            onClick={() => scrollTo(l.href)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: F.outfit, fontSize: "1.6rem", fontWeight: 300,
              color: C.cream, letterSpacing: "0.08em",
            }}
          >
            {l.label}
          </button>
        ))}
        <button className="btn-saffron" onClick={() => scrollTo("#contact")}>
          Get Quote <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
function Hero() {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToProducts = () => {
    document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { label: "Est.", value: "1995" },
    { label: "Clients", value: "500+" },
    { label: "Product Lines", value: "3" },
    { label: "Reach", value: "Pan India" },
  ];

  return (
    <section style={{
      minHeight: "100vh",
      background: C.cream,
      display: "flex",
      alignItems: "center",
      padding: "100px clamp(1.5rem, 5vw, 4rem) 60px",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <div className="hero-grid" style={{ display: "flex", alignItems: "stretch", gap: "4rem" }}>

          {/* Left Content */}
          <div style={{ flex: "1 1 55%", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            <span className="sr eyebrow" data-delay="0.1" style={{ marginBottom: "1.5rem", fontSize: "1.15rem" }}>
              Paper & PP Packaging Solutions
            </span>

            <h1
              className="sr hero-headline"
              data-delay="0.2"
              style={{
                fontFamily: F.outfit,
                fontWeight: 700,
                fontSize: "clamp(2.8rem, 5.5vw, 5.5rem)",
                lineHeight: 1.05,
                color: C.charcoal,
                letterSpacing: "-0.02em",
                marginBottom: "1.75rem",
              }}
            >
              Your Trusted<br />
              <span style={{ color: C.saffron }}>Packaging</span>{" "}
              Partner
            </h1>

            <p
              className="sr"
              data-delay="0.35"
              style={{
                fontFamily: F.baskerville,
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: C.taupe,
                maxWidth: "520px",
                marginBottom: "2.5rem",
              }}
            >
              Pune Global Group has been crafting high-quality corrugated and PP
              packaging solutions since 1995. From 3-ply corrugated boxes to
              polypropylene sheets and FBB cartons, we serve India&apos;s most demanding
              industries with precision and reliability.

            </p>

            <div className="sr" data-delay="0.5" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button className="btn-saffron" onClick={scrollToContact}>
                Get a Quote <ArrowRight size={16} />
              </button>
              <button
                onClick={scrollToProducts}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "transparent",
                  color: C.charcoal,
                  fontFamily: F.outfit,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  padding: "13px 24px",
                  border: `1.5px solid ${C.borderMid}`,
                  borderRadius: "2px",
                  cursor: "pointer",
                  transition: "border-color 0.25s, color 0.25s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.saffron; (e.currentTarget as HTMLButtonElement).style.color = C.saffron; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderMid; (e.currentTarget as HTMLButtonElement).style.color = C.charcoal; }}
              >
                Our Products <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Right — Stat Panel */}
          <div
            className="sr-right hero-stat-panel"
            data-delay="0.3"
            style={{
              flex: "0 0 360px",
              background: C.dark,
              borderRadius: "4px",
              padding: "3rem 2.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative saffron accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "4px", background: C.saffron,
            }} />

            {/* Panel heading */}
            <div>
              <span style={{
                fontFamily: F.cormorant,
                fontStyle: "italic",
                fontSize: "1rem",
                color: "rgba(255,253,248,0.5)",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "6px",
              }}>
                Since 1995 — Pune, India
              </span>
              <h2 style={{
                fontFamily: F.outfit,
                fontWeight: 600,
                fontSize: "1.5rem",
                color: C.cream,
                lineHeight: 1.25,
              }}>
                Packaging Excellence.<br />
                <span style={{ color: C.saffron }}>Proven at Scale.</span>
              </h2>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {stats.map((stat) => (
                <div key={stat.label} style={{
                  background: "rgba(255,253,248,0.05)",
                  border: "1px solid rgba(255,253,248,0.1)",
                  borderRadius: "2px",
                  padding: "1.25rem 1rem",
                }}>
                  <div style={{
                    fontFamily: F.outfit,
                    fontWeight: 700,
                    fontSize: "1.9rem",
                    color: C.saffron,
                    lineHeight: 1.1,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: F.outfit,
                    fontWeight: 400,
                    fontSize: "0.8rem",
                    color: "rgba(255,253,248,0.55)",
                    marginTop: "4px",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Company tagline */}
            <p style={{
              fontFamily: F.baskerville,
              fontStyle: "italic",
              fontSize: "0.88rem",
              color: "rgba(255,253,248,0.45)",
              lineHeight: 1.6,
              borderTop: "1px solid rgba(255,253,248,0.1)",
              paddingTop: "1.5rem",
            }}>
              &ldquo;Serving India&apos;s automotive, pharmaceutical, e-commerce,
              FMCG and engineering sectors with packaging built to last.&rdquo;
            </p>

            {/* Decorative bottom corner */}
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: "80px", height: "80px",
              background: C.saffron,
              opacity: 0.08,
              borderRadius: "50%",
              transform: "translate(30px, 30px)",
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Marquee Ticker ────────────────────────────────────────────────────────── */
function MarqueeTicker() {
  const items = [
    "CORRUGATED BOXES",
    "PP BOXES & SHEETS",
    "FBB & DUPLEX CARTONS",
    "AUTOMOTIVE",
    "PHARMACEUTICAL",
    "E-COMMERCE",
    "FMCG",
    "ENGINEERING",
  ];
  const repeated = [...items, ...items];

  return (
    <div style={{
      background: C.dark,
      height: "52px",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      borderTop: `3px solid ${C.saffron}`,
      borderBottom: `1px solid rgba(255,253,248,0.08)`,
    }}>
      <div className="marquee-track" aria-hidden="true">
        {repeated.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center",
            fontFamily: F.outfit,
            fontWeight: 500,
            fontSize: "0.78rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,253,248,0.75)",
            whiteSpace: "nowrap",
            padding: "0 2.5rem",
          }}>
            {item}
            <span style={{ marginLeft: "2.5rem", color: C.saffron, fontSize: "0.6rem", opacity: 0.7 }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Products Section ──────────────────────────────────────────────────────── */
function ProductsSection() {
  const products = [
    {
      icon: <Box size={28} style={{ color: C.saffron }} />,
      name: "Corrugated Boxes",
      description:
        "Heavy-duty corrugated packaging engineered for industrial and export-grade requirements. Manufactured using premium kraft and test liner paper with precise fluting for maximum strength-to-weight ratio.",
      variants: ["3-Ply", "5-Ply", "7-Ply", "Die-Cut", "Custom Sizes", "Export Grade"],
      detail: "Ideal for industrial goods, engineering components and export consignments requiring robust protection in transit.",
    },
    {
      icon: <Layers size={28} style={{ color: C.saffron }} />,
      name: "PP Boxes & Sheets",
      description:
        "Polypropylene corrugated packaging built for reusability, chemical resistance and lightweight handling. Available as boxes, sheets, trays and partition systems for returnable logistics.",
      variants: ["PP Corrugated Boxes", "PP Sheets", "Trays", "Partitions", "Returnable Packs"],
      detail: "Perfect for automotive component trays, pharmaceutical handling and sustainable reusable logistics.",
    },
    {
      icon: <Package size={28} style={{ color: C.saffron }} />,
      name: "FBB & Duplex Cartons",
      description:
        "Premium fine bleached board and duplex board cartons for retail shelf presentation and pharmaceutical packaging. High printability surfaces for brand-forward packaging solutions.",
      variants: ["FBB Cartons", "Duplex Board", "Retail Boxes", "Pharma Cartons", "Custom Print"],
      detail: "Trusted by FMCG and pharmaceutical brands for impeccable print quality and structural integrity on retail shelves.",
    },
  ];

  return (
    <section id="products" style={{
      background: C.cream,
      padding: "100px clamp(1.5rem, 5vw, 4rem)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">What We Manufacture</span>
          <h2 style={{
            fontFamily: F.outfit,
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: C.charcoal,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            maxWidth: "600px",
          }}>
            Three Product Lines.<br />
            <span style={{ color: C.saffron }}>Infinite Applications.</span>
          </h2>
          <p style={{
            fontFamily: F.baskerville,
            fontSize: "1rem",
            color: C.taupe,
            lineHeight: 1.75,
            maxWidth: "560px",
            marginTop: "1rem",
          }}>
            From industrial corrugated boxes to premium retail cartons — Pune Global
            Group delivers packaging solutions that meet the exacting standards of
            India&apos;s most demanding sectors.
          </p>
        </div>

        <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.75rem" }}>
          {products.map((p, i) => (
            <div key={p.name} className="product-card sr" data-delay={`${0.15 * i}`}>
              {/* Icon */}
              <div style={{
                width: "52px", height: "52px",
                background: C.saffronDim,
                borderRadius: "2px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.5rem",
              }}>
                {p.icon}
              </div>

              {/* Name */}
              <h3 style={{
                fontFamily: F.outfit,
                fontWeight: 600,
                fontSize: "1.25rem",
                color: C.charcoal,
                marginBottom: "0.75rem",
                letterSpacing: "-0.01em",
              }}>
                {p.name}
              </h3>

              {/* Description */}
              <p style={{
                fontFamily: F.baskerville,
                fontSize: "0.92rem",
                lineHeight: 1.75,
                color: C.taupe,
                marginBottom: "1.25rem",
              }}>
                {p.description}
              </p>

              {/* Detail note */}
              <p style={{
                fontFamily: F.baskerville,
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: C.taupe,
                opacity: 0.75,
                lineHeight: 1.65,
                marginBottom: "1.5rem",
                paddingLeft: "12px",
                borderLeft: `2px solid ${C.saffronBorder}`,
              }}>
                {p.detail}
              </p>

              {/* Variant tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0" }}>
                {p.variants.map((v) => (
                  <span key={v} className="variant-tag">{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Industries Section ────────────────────────────────────────────────────── */
function IndustriesSection() {
  const industries = [
    {
      num: "01",
      icon: <Car size={26} style={{ color: C.saffron }} />,
      name: "Automotive",
      desc: "Component trays, part separators, returnable PP boxes and corrugated packaging for OEMs and Tier-1 suppliers.",
    },
    {
      num: "02",
      icon: <Pill size={26} style={{ color: C.saffron }} />,
      name: "Pharmaceutical",
      desc: "Clean-room compatible PP trays, FBB cartons and sterile-grade corrugated boxes meeting pharma packaging standards.",
    },
    {
      num: "03",
      icon: <ShoppingCart size={26} style={{ color: C.saffron }} />,
      name: "E-Commerce",
      desc: "Transit-ready corrugated boxes, custom-sized mailers and protective inserts for last-mile delivery reliability.",
    },
    {
      num: "04",
      icon: <Zap size={26} style={{ color: C.saffron }} />,
      name: "FMCG",
      desc: "High-speed line-compatible cartons, duplex retail boxes and SRP (shelf-ready packaging) for consumer goods brands.",
    },
    {
      num: "05",
      icon: <Wrench size={26} style={{ color: C.saffron }} />,
      name: "Engineering",
      desc: "Heavy-duty 7-ply corrugated crates, custom foam-fitted boxes and export-standard packaging for precision machinery.",
    },
  ];

  return (
    <section id="industries" style={{
      background: C.light,
      padding: "100px clamp(1.5rem, 5vw, 4rem)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Industries We Serve</span>
          <h2 style={{
            fontFamily: F.outfit,
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: C.charcoal,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            Trusted Across<br />
            <span style={{ color: C.saffron }}>Five Sectors</span>
          </h2>
        </div>

        <div className="industries-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.25rem" }}>
          {industries.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.1 * i}`}>
              {/* Number label */}
              <div style={{
                fontFamily: F.outfit,
                fontWeight: 700,
                fontSize: "2.2rem",
                color: C.saffron,
                lineHeight: 1,
                marginBottom: "1.25rem",
                opacity: 0.4,
              }}>
                {ind.num}
              </div>

              {/* Icon */}
              <div style={{
                width: "46px", height: "46px",
                background: C.saffronDim,
                borderRadius: "2px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
              }}>
                {ind.icon}
              </div>

              {/* Name */}
              <h3 style={{
                fontFamily: F.outfit,
                fontWeight: 600,
                fontSize: "1.05rem",
                color: C.charcoal,
                marginBottom: "0.6rem",
                letterSpacing: "-0.01em",
              }}>
                {ind.name}
              </h3>

              {/* Description */}
              <p style={{
                fontFamily: F.baskerville,
                fontSize: "0.85rem",
                lineHeight: 1.7,
                color: C.taupe,
              }}>
                {ind.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ─────────────────────────────────────────────────────────── */
function AboutSection() {
  const values = [
    { label: "Integrity", desc: "Honest pricing, transparent lead times, and commitments we keep." },
    { label: "Reliability", desc: "Consistent quality across every batch, every order, every time." },
    { label: "Quality", desc: "BIS-aligned raw materials and rigorous in-house testing on every production run." },
  ];

  return (
    <section id="about" style={{
      background: C.cream,
      padding: "100px clamp(1.5rem, 5vw, 4rem)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="about-grid" style={{ display: "flex", gap: "5rem", alignItems: "flex-start" }}>

          {/* Left column */}
          <div className="sr-left" style={{ flex: "1 1 55%", position: "relative" }}>
            {/* Watermark */}
            <div style={{
              position: "absolute",
              top: "-20px", left: "-10px",
              fontFamily: F.outfit,
              fontWeight: 700,
              fontSize: "clamp(6rem, 14vw, 11rem)",
              color: C.charcoal,
              opacity: 0.04,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
              letterSpacing: "-0.04em",
            }}>
              1995
            </div>

            <span className="eyebrow">Our Story</span>
            <h2 style={{
              fontFamily: F.outfit,
              fontWeight: 700,
              fontSize: "clamp(1.9rem, 3.5vw, 2.9rem)",
              color: C.charcoal,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: "1.75rem",
            }}>
              Three Decades of{" "}
              <span style={{ color: C.saffron }}>Packaging Excellence</span>
            </h2>

            <p style={{
              fontFamily: F.baskerville,
              fontSize: "1rem",
              lineHeight: 1.85,
              color: C.taupe,
              marginBottom: "1.25rem",
            }}>
              Founded in 1995 by Managing Director <strong style={{ color: C.charcoal, fontWeight: 700 }}>Umesh Sahu</strong>, Pune Global
              Group began as a focused corrugated box manufacturer in Pune, Maharashtra.
              Over three decades, the company evolved into a comprehensive packaging
              solutions provider, adding PP corrugated products and premium board cartons
              to serve a rapidly expanding industrial base.
            </p>

            <p style={{
              fontFamily: F.baskerville,
              fontSize: "1rem",
              lineHeight: 1.85,
              color: C.taupe,
              marginBottom: "1.75rem",
            }}>
              Operating from our manufacturing facility at BU Bhandari MIDC, Sanaswadi,
              and our commercial office in Gulmohar Center Point, Pune — we serve over
              500 clients across automotive, pharmaceutical, FMCG, e-commerce and
              engineering sectors throughout India.
            </p>

            <p style={{
              fontFamily: F.baskerville,
              fontStyle: "italic",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: C.taupe,
              paddingLeft: "1.25rem",
              borderLeft: `3px solid ${C.saffron}`,
            }}>
              &ldquo;Our commitment is simple — deliver packaging that protects what our
              customers have built, every single time.&rdquo; — Umesh Sahu, Managing Director
            </p>
          </div>

          {/* Right column — dark card */}
          <div className="sr-right" style={{ flex: "0 0 360px" }}>
            <div style={{
              background: C.dark,
              borderRadius: "4px",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "3px", background: C.saffron,
              }} />

              {/* Key stats */}
              <div style={{ marginBottom: "2rem" }}>
                <span style={{
                  fontFamily: F.cormorant,
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  color: "rgba(255,253,248,0.45)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "1.25rem",
                }}>
                  Key Figures
                </span>

                {[
                  { stat: "1995", label: "Year Established" },
                  { stat: "500+", label: "Active Clients" },
                  { stat: "3", label: "Product Lines" },
                  { stat: "2", label: "Locations — Pune" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid rgba(255,253,248,0.08)",
                  }}>
                    <span style={{
                      fontFamily: F.outfit, fontWeight: 300,
                      fontSize: "0.85rem", color: "rgba(255,253,248,0.5)",
                      letterSpacing: "0.03em",
                    }}>{item.label}</span>
                    <span style={{
                      fontFamily: F.outfit, fontWeight: 700,
                      fontSize: "1.4rem", color: C.saffron,
                    }}>{item.stat}</span>
                  </div>
                ))}
              </div>

              {/* Values */}
              <div>
                <span style={{
                  fontFamily: F.cormorant,
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  color: "rgba(255,253,248,0.45)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "1rem",
                }}>
                  Our Values
                </span>

                {values.map((v) => (
                  <div key={v.label} style={{
                    display: "flex", gap: "0.75rem",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}>
                    <CheckCircle size={16} style={{ color: C.saffron, marginTop: "3px", flexShrink: 0 }} />
                    <div>
                      <div style={{
                        fontFamily: F.outfit, fontWeight: 600,
                        fontSize: "0.9rem", color: C.cream,
                        marginBottom: "2px",
                      }}>{v.label}</div>
                      <div style={{
                        fontFamily: F.baskerville, fontSize: "0.82rem",
                        color: "rgba(255,253,248,0.45)", lineHeight: 1.6,
                      }}>{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GSTIN badge */}
              <div style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255,253,248,0.1)",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <div style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%",
                  background: C.saffron,
                }} />
                <span style={{
                  fontFamily: F.outfit, fontSize: "0.78rem",
                  color: "rgba(255,253,248,0.35)",
                  letterSpacing: "0.06em",
                }}>
                  GSTIN: 27FYYPS5999K1ZO
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Contact Section ───────────────────────────────────────────────────────── */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    try {
      await addDoc(collection(db, "contacts"), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        createdAt: serverTimestamp(),
        source: "website",
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const contactItems = [
    {
      icon: <Phone size={18} style={{ color: C.saffron }} />,
      label: "Phone",
      value: "+91 98233 83230",
      href: "tel:+919823383230",
    },
    {
      icon: <Mail size={18} style={{ color: C.saffron }} />,
      label: "Email",
      value: "contact.puneglobalgroup@gmail.com",
      href: "mailto:contact.puneglobalgroup@gmail.com",
    },
    {
      icon: <MapPin size={18} style={{ color: C.saffron }} />,
      label: "Office",
      value: "206 Gulmohar Center Point, Pune 411006, Maharashtra",
      href: null,
    },
    {
      icon: <Factory size={18} style={{ color: C.saffron }} />,
      label: "Factory",
      value: "108 BU Bhandari MIDC, Sanaswadi 412208, Pune",
      href: null,
    },
  ];

  return (
    <section id="contact" style={{
      background: C.light,
      padding: "100px clamp(1.5rem, 5vw, 4rem)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Get In Touch</span>
          <h2 style={{
            fontFamily: F.outfit,
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: C.charcoal,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            Start Your Packaging<br />
            <span style={{ color: C.saffron }}>Project Today</span>
          </h2>
        </div>

        <div className="contact-grid" style={{ display: "flex", gap: "4rem", alignItems: "flex-start" }}>

          {/* Left — Contact Info Document */}
          <div className="sr-left" style={{ flex: "1 1 45%" }}>
            <div style={{
              background: C.cream,
              border: `1px solid ${C.border}`,
              borderRadius: "2px",
              padding: "2.5rem",
            }}>
              {/* Document header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                paddingBottom: "1.5rem",
                borderBottom: `2px solid ${C.saffron}`,
                marginBottom: "2rem",
              }}>
                <TuriyaLogo size={36} />
                <div>
                  <div style={{
                    fontFamily: F.outfit, fontWeight: 600, fontSize: "0.95rem",
                    color: C.charcoal, letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    Pune Global Group
                  </div>
                  <div style={{
                    fontFamily: F.cormorant, fontStyle: "italic",
                    fontSize: "0.82rem", color: C.taupe,
                  }}>
                    Paper & PP Packaging Solutions
                  </div>
                </div>
              </div>

              {/* Contact items */}
              {contactItems.map((item) => (
                <div key={item.label} style={{
                  display: "flex", gap: "1rem", alignItems: "flex-start",
                  marginBottom: "1.5rem",
                }}>
                  <div style={{
                    width: "36px", height: "36px",
                    background: C.saffronDim,
                    borderRadius: "2px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: F.outfit, fontWeight: 500,
                      fontSize: "0.75rem", color: C.saffron,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      marginBottom: "3px",
                    }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} style={{
                        fontFamily: F.baskerville, fontSize: "0.92rem",
                        color: C.charcoal, lineHeight: 1.5,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.charcoal)}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div style={{
                        fontFamily: F.baskerville, fontSize: "0.92rem",
                        color: C.charcoal, lineHeight: 1.5,
                      }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* Business hours */}
              <div style={{
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: `1px solid ${C.border}`,
                fontFamily: F.baskerville,
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: C.taupe,
                lineHeight: 1.6,
              }}>
                Business Hours: Monday – Saturday, 9:30 AM – 6:30 PM IST
              </div>
            </div>
          </div>

          {/* Right — Contact Form */}
          <div className="sr-right" style={{ flex: "1 1 50%" }}>
            <div style={{
              background: C.cream,
              border: `1px solid ${C.border}`,
              borderTop: `3px solid ${C.saffron}`,
              borderRadius: "2px",
              padding: "2.5rem",
            }}>
              <h3 style={{
                fontFamily: F.outfit, fontWeight: 600, fontSize: "1.3rem",
                color: C.charcoal, marginBottom: "0.5rem",
              }}>
                Request a Quote
              </h3>
              <p style={{
                fontFamily: F.baskerville, fontSize: "0.88rem",
                color: C.taupe, lineHeight: 1.6, marginBottom: "2rem",
              }}>
                Share your packaging requirements and our team will respond within one business day.
              </p>

              {status === "success" ? (
                <div style={{
                  background: "rgba(244,162,54,0.08)",
                  border: `1px solid ${C.saffronBorder}`,
                  borderRadius: "2px",
                  padding: "2rem",
                  textAlign: "center",
                }}>
                  <CheckCircle size={40} style={{ color: C.saffron, marginBottom: "1rem" }} />
                  <div style={{
                    fontFamily: F.outfit, fontWeight: 600, fontSize: "1.1rem",
                    color: C.charcoal, marginBottom: "0.5rem",
                  }}>
                    Message Received!
                  </div>
                  <div style={{
                    fontFamily: F.baskerville, fontSize: "0.9rem",
                    color: C.taupe, lineHeight: 1.6,
                  }}>
                    Thank you for reaching out. We will get back to you within one business day.
                  </div>
                  <button
                    className="btn-saffron"
                    style={{ marginTop: "1.5rem" }}
                    onClick={() => setStatus("idle")}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <div>
                      <label style={{
                        display: "block",
                        fontFamily: F.outfit, fontWeight: 500, fontSize: "0.8rem",
                        color: C.charcoal, letterSpacing: "0.04em",
                        textTransform: "uppercase", marginBottom: "6px",
                      }}>
                        Name <span style={{ color: C.saffron }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontFamily: F.outfit, fontWeight: 500, fontSize: "0.8rem",
                        color: C.charcoal, letterSpacing: "0.04em",
                        textTransform: "uppercase", marginBottom: "6px",
                      }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontFamily: F.outfit, fontWeight: 500, fontSize: "0.8rem",
                      color: C.charcoal, letterSpacing: "0.04em",
                      textTransform: "uppercase", marginBottom: "6px",
                    }}>
                      Email <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontFamily: F.outfit, fontWeight: 500, fontSize: "0.8rem",
                      color: C.charcoal, letterSpacing: "0.04em",
                      textTransform: "uppercase", marginBottom: "6px",
                    }}>
                      Message <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <textarea
                      className="form-input"
                      rows={5}
                      placeholder="Describe your packaging requirements — product type, quantity, dimensions, material preferences..."
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      required
                      style={{ resize: "vertical", minHeight: "130px" }}
                    />
                  </div>

                  {status === "error" && (
                    <div style={{
                      background: "rgba(220,20,60,0.07)",
                      border: "1px solid rgba(220,20,60,0.25)",
                      borderRadius: "2px",
                      padding: "12px 16px",
                      fontFamily: F.baskerville, fontSize: "0.88rem",
                      color: "#DC143C",
                    }}>
                      Something went wrong. Please try again or call us directly.
                    </div>
                  )}

                  <button type="submit" className="btn-saffron" disabled={status === "submitting"} style={{ alignSelf: "flex-start", opacity: status === "submitting" ? 0.7 : 1 }}>
                    {status === "submitting" ? (
                      <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                    ) : (
                      <>Send Request <ArrowRight size={16} /></>
                    )}
                  </button>

                  <p style={{
                    fontFamily: F.baskerville, fontStyle: "italic",
                    fontSize: "0.8rem", color: C.taupe, opacity: 0.7,
                  }}>
                    We respect your privacy. Your information will never be shared.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer style={{
      background: C.dark,
      padding: "70px clamp(1.5rem, 5vw, 4rem) 0",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Top row */}
        <div className="footer-grid" style={{
          display: "flex",
          gap: "4rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid rgba(255,253,248,0.1)",
        }}>
          {/* Logo + blurb */}
          <div style={{ flex: "0 0 300px" }}>
            <Logo inverted />
            <p style={{
              fontFamily: F.baskerville,
              fontSize: "0.88rem",
              color: "rgba(255,253,248,0.45)",
              lineHeight: 1.75,
              marginTop: "1.25rem",
              maxWidth: "260px",
            }}>
              Manufacturing high-quality corrugated and PP packaging solutions
              from Pune since 1995. Serving industries across India.
            </p>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "12px" }}>
              <a href="tel:+919823383230" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontFamily: F.outfit, fontSize: "0.82rem",
                color: C.saffron, transition: "opacity 0.2s",
              }}>
                <Phone size={14} /> +91 98233 83230
              </a>
            </div>
          </div>

          {/* Cols */}
          <div className="footer-cols" style={{ display: "flex", gap: "3rem", flex: 1, justifyContent: "flex-end" }}>

            {/* Products */}
            <div>
              <div style={{
                fontFamily: F.outfit, fontWeight: 600, fontSize: "0.78rem",
                color: "rgba(255,253,248,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                Products
              </div>
              {["Corrugated Boxes", "PP Boxes & Sheets", "FBB & Duplex Cartons"].map((p) => (
                <button key={p} className="footer-link" onClick={() => scrollTo("#products")} style={{ background: "none", border: "none", textAlign: "left" }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Industries */}
            <div>
              <div style={{
                fontFamily: F.outfit, fontWeight: 600, fontSize: "0.78rem",
                color: "rgba(255,253,248,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                Industries
              </div>
              {["Automotive", "Pharmaceutical", "E-Commerce", "FMCG", "Engineering"].map((ind) => (
                <button key={ind} className="footer-link" onClick={() => scrollTo("#industries")} style={{ background: "none", border: "none", textAlign: "left" }}>
                  {ind}
                </button>
              ))}
            </div>

            {/* Info */}
            <div>
              <div style={{
                fontFamily: F.outfit, fontWeight: 600, fontSize: "0.78rem",
                color: "rgba(255,253,248,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                Company
              </div>
              {[
                { label: "About Us", href: "#about" },
                { label: "Contact", href: "#contact" },
                { label: "Get a Quote", href: "#contact" },
              ].map((l) => (
                <button key={l.label} className="footer-link" onClick={() => scrollTo(l.href)} style={{ background: "none", border: "none", textAlign: "left" }}>
                  {l.label}
                </button>
              ))}

              <div style={{ marginTop: "1.5rem" }}>
                <a href="mailto:contact.puneglobalgroup@gmail.com" style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontFamily: F.outfit, fontSize: "0.78rem",
                  color: "rgba(255,253,248,0.45)", transition: "color 0.2s",
                  marginBottom: "0.5rem",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,253,248,0.45)")}
                >
                  <Mail size={13} /> contact.puneglobalgroup@gmail.com
                </a>
                <div style={{
                  fontFamily: F.outfit, fontSize: "0.78rem",
                  color: "rgba(255,253,248,0.35)",
                  display: "flex", alignItems: "flex-start", gap: "6px",
                }}>
                  <MapPin size={13} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span>206 Gulmohar Center Point,<br />Pune 411006</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1.5rem 0",
        }}>
          <div style={{
            fontFamily: F.outfit, fontSize: "0.78rem",
            color: "rgba(255,253,248,0.3)",
          }}>
            © 2025 Pune Global Group. All rights reserved.
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: F.outfit, fontSize: "0.75rem",
            color: "rgba(255,253,248,0.3)",
          }}>
            <span>GSTIN:</span>
            <span style={{
              fontFamily: "'Courier New', monospace",
              color: "rgba(255,253,248,0.45)",
              letterSpacing: "0.06em",
            }}>
              27FYYPS5999K1ZO
            </span>
            <span style={{ color: "rgba(255,253,248,0.15)", margin: "0 4px" }}>|</span>
            <span>Pune, Maharashtra, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── HOME PAGE ─────────────────────────────────────────────────────────────── */
export default function HomePage() {
  useScrollReveal();

  return (
    <>
      {/* Global styles */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Spinner keyframe for loader */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
      `}} />

      <Navbar />
      <main>
        <Hero />
        <MarqueeTicker />
        <ProductsSection />
        <IndustriesSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
