"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Factory, Package, Layers,
  ChevronRight, Menu, X, ArrowRight, CheckCircle,
  Loader2, Car, Pill, ShoppingCart, Wrench,
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

  /* eyebrow is now handled in the new section below */

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

  /* Section eyebrow — gradient applied in new block below */
  .eyebrow {
    font-family: ${F.cormorant};
    font-style: italic;
    font-size: 1.05rem;
    font-weight: 400;
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
    .hero-stat-panel { width: 100% !important; margin-top: 3rem !important; flex: none !important; }
    .about-grid { flex-direction: column !important; }
    .contact-grid { flex-direction: column !important; }
    .footer-grid { flex-direction: column !important; gap: 3rem !important; }
    .footer-cols { flex-direction: column !important; gap: 2rem !important; }
    .infra-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .hero-headline { font-size: clamp(2rem, 9vw, 3.5rem) !important; }
    .products-grid { grid-template-columns: 1fr !important; }
    .products-detail-grid { grid-template-columns: 1fr 1fr !important; }
    .industries-grid { grid-template-columns: 1fr 1fr !important; }
    .stats-row { flex-direction: column !important; gap: 1.5rem !important; }
    .stat-divider { display: none !important; }
    .infra-callout-header { flex-direction: column !important; align-items: flex-start !important; gap: 1.25rem !important; }
    .infra-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .blog-teaser-grid { grid-template-columns: 1fr !important; }
    section { padding-top: 64px !important; padding-bottom: 64px !important; }
    .infra-section { padding-top: 44px !important; padding-bottom: 44px !important; }
  }
  @media (max-width: 480px) {
    .industries-grid { grid-template-columns: 1fr !important; }
    .products-detail-grid { grid-template-columns: 1fr !important; }
    .infra-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .blog-teaser-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
  }

  /* ── Gradient text ───────────────────────────────────── */
  .grad-accent {
    background: linear-gradient(130deg, #F4A236 0%, #E0601A 52%, #DC143C 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .grad-accent-light {
    background: linear-gradient(130deg, #FFD57A 0%, #F4A236 45%, #FF6B35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .eyebrow {
    background: linear-gradient(130deg, #F4A236 0%, #DC143C 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Shadow tokens ───────────────────────────────────── */
  .product-card {
    border-radius: 2px;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    cursor: default;
    box-shadow:
      0 1px 3px rgba(58,53,48,0.05),
      inset 0 1px 0 rgba(255,255,255,0.88);
  }
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow:
      0 4px 10px rgba(58,53,48,0.05),
      0 16px 36px rgba(58,53,48,0.1),
      0 2px 4px rgba(244,162,54,0.08),
      inset 0 1px 0 rgba(255,255,255,0.92);
  }
  .industry-tile {
    background: ${C.cream};
    border: 1px solid ${C.border};
    padding: 2rem 1.75rem;
    border-radius: 2px;
    transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
    cursor: default;
    box-shadow:
      0 1px 3px rgba(58,53,48,0.04),
      inset 0 1px 0 rgba(255,255,255,0.92);
  }
  .industry-tile:hover {
    transform: translateY(-4px);
    box-shadow:
      0 8px 24px rgba(58,53,48,0.09),
      0 2px 6px rgba(58,53,48,0.05),
      inset 0 1px 0 rgba(255,255,255,0.95);
    background: #fff;
  }
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
    box-shadow:
      0 2px 8px rgba(244,162,54,0.3),
      0 1px 2px rgba(244,162,54,0.2),
      inset 0 1px 0 rgba(255,255,255,0.22);
  }
  .btn-saffron:hover {
    background: #e5941f;
    transform: translateY(-2px);
    box-shadow:
      0 8px 24px rgba(244,162,54,0.45),
      0 3px 8px rgba(244,162,54,0.3),
      inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .btn-saffron:active { transform: translateY(0); }

  /* ── Carousel ────────────────────────────────────────── */
  @keyframes carouselSlideIn {
    from { opacity: 0; transform: translateX(24px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes carouselProgress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .carousel-card-enter {
    animation: carouselSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .carousel-card-enter:nth-child(2) { animation-delay: 0.07s; }
  .carousel-card-enter:nth-child(3) { animation-delay: 0.14s; }
  @media (max-width: 768px) {
    .carousel-track { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .carousel-track { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Turiya Logo SVG — exact paths from official brand kit ─────────────────── */
function TuriyaLogo({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  const main = onDark ? C.cream : C.charcoal;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Pune Global Group Logo Symbol" style={{ transform: "rotate(-45deg)", display: "block" }}>
      {/* Top-left shape — charcoal (on light) / cream (on dark) */}
      <path d="M6 6 L38 6 Q44 6, 44 12 L18 38 Q12 44, 6 44 L6 6 Z" fill={main} />
      {/* Top-right shape — saffron (accent) */}
      <path d="M56 6 L94 6 L94 38 Q94 44, 88 44 L56 12 Q56 6, 62 6 Z" fill={C.saffron} />
      {/* Bottom-right shape — charcoal / cream */}
      <path d="M94 56 L94 94 L62 94 Q56 94, 56 88 L82 62 Q88 56, 94 56 Z" fill={main} />
      {/* Bindu — bottom-left, saffron glow + sindoor centre */}
      <circle cx="25" cy="75" r="12" fill={C.saffron} opacity="0.15" />
      <circle cx="25" cy="75" r="5" fill={C.saffron} />
      <circle cx="25" cy="75" r="1.8" fill={C.sindoor} />
    </svg>
  );
}

/* ─── Full Logo (symbol + wordmark) ────────────────────────────────────────── */
function Logo({ inverted = false }: { inverted?: boolean }) {
  const textColor = inverted ? C.cream : C.charcoal;
  const subColor = inverted ? "rgba(255,253,248,0.65)" : C.taupe;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", userSelect: "none" }}>
      <TuriyaLogo size={44} onDark={inverted} />
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
    { label: "Products", href: "/products" },
    { label: "Infrastructure", href: "/infrastructure" },
    { label: "Blog", href: "/blog" },
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
            {links.map((l) => l.href.startsWith("#") ? (
              <button key={l.href} className="nav-link" onClick={() => scrollTo(l.href)} style={{ background: "none", border: "none" }}>
                {l.label}
              </button>
            ) : (
              <Link key={l.href} href={l.href} className="nav-link" style={{ textDecoration: "none" }}>
                {l.label}
              </Link>
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
        {links.map((l) => l.href.startsWith("#") ? (
          <button
            key={l.href}
            onClick={() => { setMobileOpen(false); scrollTo(l.href); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: F.outfit, fontSize: "1.6rem", fontWeight: 300,
              color: C.cream, letterSpacing: "0.08em",
            }}
          >
            {l.label}
          </button>
        ) : (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: F.outfit, fontSize: "1.6rem", fontWeight: 300,
              color: C.cream, letterSpacing: "0.08em", textDecoration: "none",
            }}
          >
            {l.label}
          </Link>
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
    { label: "Boxes Sold", value: "100M+" },
    { label: "States", value: "21" },
    { label: "Global Customers", value: "500+" },
    { label: "Est.", value: "1995" },
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
              PP Manufacturing · FBB Converting · Paper Trading
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
              Industrial PP Packaging.<br />
              <span className="grad-accent">Manufactured</span> to Export.
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
              Pune Global Group manufactures precision PP trays, separators, boxes
              and crates for automotive, pharma and electronics industries — export-ready,
              custom-spec, from our Pune facility. We also convert FBB sheets and
              trade paper &amp; board grades across 21 states.
            </p>

            <div className="sr" data-delay="0.5" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/products" className="btn-saffron" style={{ textDecoration: "none" }}>
                View Products <ArrowRight size={16} />
              </Link>
              <button
                onClick={scrollToContact}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "transparent",
                  color: C.charcoal,
                  fontFamily: F.outfit,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "13px 24px",
                  border: `1.5px solid ${C.charcoal}`,
                  borderRadius: "2px",
                  cursor: "pointer",
                  transition: "border-color 0.25s, color 0.25s, background 0.25s",
                }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.background = C.charcoal; b.style.color = C.cream; }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.background = "transparent"; b.style.color = C.charcoal; }}
              >
                Request RFQ <ChevronRight size={16} />
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
              boxShadow: "0 20px 60px rgba(44,40,37,0.22), 0 6px 20px rgba(44,40,37,0.14), inset 0 1px 0 rgba(255,255,255,0.07)",
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
                PP Manufacturer · Pune, India
              </span>
              <h2 style={{
                fontFamily: F.outfit,
                fontWeight: 600,
                fontSize: "1.5rem",
                color: C.cream,
                lineHeight: 1.25,
              }}>
                Export-Ready.<br />
                <span className="grad-accent-light">Custom to Spec.</span>
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
              color: "rgba(255,253,248,0.78)",
              lineHeight: 1.6,
              borderTop: "1px solid rgba(255,253,248,0.1)",
              paddingTop: "1.5rem",
              marginBottom: "1.25rem",
            }}>
              &ldquo;We manufacture PP packaging to your exact spec — and ship it
              anywhere in the world. 100 million boxes delivered. Counting.&rdquo;
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/infrastructure" style={{
                fontFamily: F.outfit, fontSize: "0.78rem", fontWeight: 500,
                color: C.saffron, textDecoration: "none", letterSpacing: "0.05em",
                display: "inline-flex", alignItems: "center", gap: "4px",
                borderBottom: `1px solid rgba(244,162,54,0.35)`, paddingBottom: "2px",
              }}>
                Our Facility <ChevronRight size={12} />
              </Link>
              <Link href="/blog" style={{
                fontFamily: F.outfit, fontSize: "0.78rem", fontWeight: 500,
                color: "rgba(255,253,248,0.55)", textDecoration: "none", letterSpacing: "0.05em",
                display: "inline-flex", alignItems: "center", gap: "4px",
                borderBottom: "1px solid rgba(255,253,248,0.15)", paddingBottom: "2px",
              }}>
                Knowledge Hub <ChevronRight size={12} />
              </Link>
            </div>

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
    "PP TRAYS · SEPARATORS · BOXES",
    "INDUSTRIAL PP PACKAGING",
    "EXPORT READY",
    "PP CRATES · LAYER PADS · ESD BINS",
    "CUSTOM PP MANUFACTURING",
    "FBB CONVERTING",
    "SHEETING · SLITTING · REWINDING",
    "ITC · TNPL · IMPORTED GRADES",
    "21 STATES · 500+ CUSTOMERS",
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

/* ─── Product Carousel ────────────────────────────────────────────────────────── */
const PP_PRODUCTS = [
  {
    name: "PP Foldable Boxes",
    spec: "Manufactured · Returnable",
    desc: "Custom-manufactured foldable PP boxes for automotive trays and returnable industrial logistics. Exported globally.",
    img: "https://www.brotherspackaging.in/assets/images/products/ppbox/9.webp",
    slug: "pp-foldable-boxes",
  },
  {
    name: "PP Corrugated Sheets",
    spec: "Manufactured · Custom Sizes",
    desc: "Waterproof, UV-stable PP hollow corrugated sheets for layer pads, partition dividers and protective wrapping.",
    img: "https://jppack.in/products/ppcorrugatedsheetssunpaksheetshollowsheetsfluteboardsheets_24_07_25_09_23_01_102592.png",
    slug: "pp-corrugated-sheets",
  },
  {
    name: "PP Corrugated Crates",
    spec: "Manufactured · Heavy Duty",
    desc: "Stackable returnable crates for automotive OEMs, engineering components and industrial material handling.",
    img: "https://jppack.in/products/corrugatedplasticpackagebins_24_07_25_07_55_30_122853.png",
    slug: "pp-foldable-boxes",
  },
  {
    name: "PP Layer Pads",
    spec: "Manufactured · Pallet-Ready",
    desc: "PP layer pads and slip sheets for pallet stacking, product separation and surface protection in transit.",
    img: "https://jppack.in/products/ppcorrugatedlayerpad_24_07_25_09_27_58_112075.png",
    slug: "pp-layer-pads",
  },
  {
    name: "ESD Packaging",
    spec: "Manufactured · Anti-Static",
    desc: "Anti-static PP bins and boxes for electronics manufacturers and PCB component handling. Export compliant.",
    img: "https://jppack.in/products/ppcorrugatedesdbin_24_07_25_09_29_20_111119.png",
    slug: "esd-packaging",
  },
];

function ProductCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [key, setKey] = useState(0);
  const n = PP_PRODUCTS.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIdx(i => (i + 1) % n);
      setKey(k => k + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [paused, n]);

  const go = (dir: number) => {
    setIdx(i => (i + dir + n) % n);
    setKey(k => k + 1);
  };

  const visible = [0, 1, 2].map(o => PP_PRODUCTS[(idx + o) % n]);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress bar */}
      {!paused && (
        <div style={{ height: "2px", background: C.border, marginBottom: "1.25rem", borderRadius: "1px", overflow: "hidden" }}>
          <div
            key={`bar-${key}`}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${C.saffron}, #DC143C)`,
              transformOrigin: "left center",
              animation: "carouselProgress 4s linear forwards",
              boxShadow: `0 0 8px rgba(244,162,54,0.5)`,
            }}
          />
        </div>
      )}

      {/* Cards */}
      <div
        key={key}
        className="carousel-track"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}
      >
        {visible.map((p, i) => (
          <Link
            key={`${p.name}-${i}`}
            href={`/products/${p.slug}`}
            className="carousel-card-enter product-card"
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderLeft: "none",
              borderRadius: "2px",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              padding: 0,
              textDecoration: "none",
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.saffron; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 28px rgba(244,162,54,0.15), 0 2px 6px rgba(244,162,54,0.1), inset 0 1px 0 rgba(255,255,255,0.9)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 1px 3px rgba(58,53,48,0.05), inset 0 1px 0 rgba(255,255,255,0.88)"; }}
          >
            <div style={{ height: "180px", overflow: "hidden", background: "#f0ede8", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
              {/* Gradient overlay on image */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "60px",
                background: "linear-gradient(to top, rgba(58,53,48,0.18) 0%, transparent 100%)",
              }} />
            </div>
            <div style={{ padding: "1.1rem 1.2rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
              <span style={{
                fontFamily: F.outfit, fontSize: "0.66rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: C.saffron, fontWeight: 600,
              }}>{p.spec}</span>
              <h4 style={{
                fontFamily: F.outfit, fontWeight: 600,
                fontSize: "0.98rem", color: C.charcoal, lineHeight: 1.25,
              }}>{p.name}</h4>
              <p style={{
                fontFamily: F.baskerville, fontSize: "0.8rem",
                color: C.taupe, lineHeight: 1.65, flex: 1,
              }}>{p.desc}</p>
              <span style={{
                marginTop: "0.75rem",
                display: "inline-flex", alignItems: "center", gap: "5px",
                color: C.charcoal, fontFamily: F.outfit,
                fontWeight: 600, fontSize: "0.76rem",
                letterSpacing: "0.05em",
                textDecoration: "underline",
                textDecorationColor: C.saffron,
                textUnderlineOffset: "3px",
              }}>
                View Details <ChevronRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem" }}>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {PP_PRODUCTS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); setKey(k => k + 1); }}
              style={{
                width: i === idx ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === idx ? C.saffron : C.border,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
                padding: 0,
                boxShadow: i === idx ? `0 0 8px rgba(244,162,54,0.4)` : "none",
              }}
            />
          ))}
        </div>

        {/* Prev/Next arrows */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[{ dir: -1, label: "‹" }, { dir: 1, label: "›" }].map(({ dir, label }) => (
            <button
              key={dir}
              onClick={() => go(dir)}
              style={{
                width: "38px", height: "38px",
                borderRadius: "50%",
                background: C.cream,
                border: `1.5px solid ${C.borderMid}`,
                cursor: "pointer",
                fontFamily: F.outfit,
                fontSize: "1.2rem",
                color: C.charcoal,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 4px rgba(58,53,48,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                lineHeight: 1,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.saffron; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = C.saffron; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 12px rgba(244,162,54,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.cream; (e.currentTarget as HTMLButtonElement).style.color = C.charcoal; (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderMid; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(58,53,48,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Products Section ───────────────────────────────────────────────────────── */
function ProductsSection() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  /* 4 business pillars — DS Smith hero-card style */
  const lines = [
    {
      eyebrow: "PP Manufacturing — Core Business",
      heading: "Trays · Separators · Boxes · Crates",
      desc: "We manufacture precision polypropylene packaging for automotive, pharma and electronics industries — industrial trays, separators, foldable boxes, crates and layer pads. Custom sizes. Export-ready documentation on every order.",
      tags: ["PP Trays", "Separators", "Foldable Boxes", "PP Crates", "Layer Pads", "ESD Bins"],
      bg: `linear-gradient(140deg, #1a2535 0%, #0f1a28 100%)`,
      href: "/products",
      cta: "View PP Products",
    },
    {
      eyebrow: "FBB Converting",
      heading: "Cut to Size. Press-Ready.",
      desc: "We cut FBB and board reels to your exact press sheet dimensions — sheeting, slitting, rewinding. Fast turnaround for printers, carton manufacturers and packaging converters across India.",
      tags: ["FBB Sheeting", "Duplex Cutting", "Slitting", "Rewinding", "Custom Dimensions", "Low MOQ"],
      bg: `linear-gradient(140deg, #252e26 0%, #1a2118 100%)`,
      href: "/infrastructure",
      cta: "See Converting Facility",
    },
    {
      eyebrow: "Paper & PP Sheet Trading",
      heading: "ITC · TNPL · Imported",
      desc: "Authorised distributor of ITC PSPD and TNPL board grades — FBB, duplex, kraft liner and test liner. We also supply PP corrugated sheets in standard and custom sizes from our Pune warehouse.",
      tags: ["ITC FBB", "TNPL Grades", "Kraft Liner", "Duplex Board", "PP Sheets", "Ready Stock"],
      bg: `linear-gradient(140deg, ${C.charcoal} 0%, #4a403a 100%)`,
      href: "/products",
      cta: "Browse All Grades",
    },
  ];

  /* Paper & board grades — no image, gradient bg */
  const paperProducts = [
    {
      name: "ITC FBB Boards",
      spec: "Traded · Cyber Oak · Cyber XLPac",
      desc: "ITC PSPD folding box boards — high stiffness, FSC certified, sheeted to press-ready sizes. 230–400 GSM.",
      bg: `linear-gradient(145deg, #e8d8b8 0%, #ddc99a 100%)`,
      icon: <Package size={28} color={C.charcoal} />,
      slug: "itc-fbb-boards",
    },
    {
      name: "Duplex Board",
      spec: "Traded · Cut to Size",
      desc: "Coated duplex boards 200–450 GSM for pharma cartons and retail packaging. Sheeted from reel.",
      bg: `linear-gradient(145deg, #e4e0d8 0%, #d8d4cc 100%)`,
      icon: <Package size={28} color={C.charcoal} />,
      slug: "duplex-board",
    },
    {
      name: "Kraft Liner",
      spec: "Traded · 100–440 GSM",
      desc: "100% fresh fibre imported kraft liner for heavy-duty corrugated and export packaging.",
      bg: `linear-gradient(145deg, #e0d0b8 0%, #d4c4a8 100%)`,
      icon: <Package size={28} color={C.charcoal} />,
      slug: "kraft-liner",
    },
    {
      name: "Test Liners & Fluting",
      spec: "Traded · 80–400 GSM",
      desc: "Recycled fibre test liners and fluting medium for corrugators and box manufacturers.",
      bg: `linear-gradient(145deg, #ddd8cc 0%, #d0cbc0 100%)`,
      icon: <Package size={28} color={C.charcoal} />,
      slug: "test-liners-fluting",
    },
  ];

  return (
    <section id="products" style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Section header */}
        <div className="sr" style={{ marginBottom: "4rem" }}>
          <span className="eyebrow">Three Business Lines</span>
          <h2 style={{
            fontFamily: F.outfit, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: C.charcoal, letterSpacing: "-0.02em", lineHeight: 1.1, maxWidth: "600px",
          }}>
            Manufacture. Convert.<br />
            <span className="grad-accent">Trade.</span>
          </h2>
          <p style={{
            fontFamily: F.baskerville, fontSize: "1rem",
            color: C.taupe, lineHeight: 1.75, maxWidth: "560px", marginTop: "1rem",
          }}>
            We manufacture industrial PP packaging to export spec. We convert FBB
            into press-ready sheets. We trade ITC, TNPL and imported board grades.
            One facility. One partner. 30 years.
          </p>
        </div>

        {/* ── DS Smith top: 3 large dark category cards ── */}
        <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "4rem" }}>
          {lines.map((line, i) => (
            <div key={line.eyebrow} className="sr" data-delay={`${0.1 * i}`} style={{
              background: line.bg,
              borderRadius: "2px",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 12px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
              transition: "transform 0.28s ease, box-shadow 0.28s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.25), 0 20px 56px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.18), 0 12px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.06)"; }}
            >
              {/* Saffron corner accent */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: "90px", height: "90px",
                background: C.saffron, opacity: 0.07,
                clipPath: "polygon(100% 0, 100% 100%, 0 0)",
              }} />

              <span style={{
                fontFamily: F.outfit, fontWeight: 600,
                fontSize: "0.68rem", letterSpacing: "0.16em",
                textTransform: "uppercase", color: C.saffron,
                marginBottom: "0.75rem",
              }}>
                {line.eyebrow}
              </span>

              <h3 style={{
                fontFamily: F.outfit, fontWeight: 700,
                fontSize: "1.45rem", color: C.cream,
                letterSpacing: "-0.01em", lineHeight: 1.2,
                marginBottom: "1rem",
              }}>
                {line.heading}
              </h3>

              <p style={{
                fontFamily: F.baskerville, fontSize: "0.88rem",
                color: "rgba(255,253,248,0.68)", lineHeight: 1.72,
                marginBottom: "1.25rem", flex: 1,
              }}>
                {line.desc}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.75rem" }}>
                {line.tags.map((t) => (
                  <span key={t} style={{
                    fontFamily: F.outfit, fontSize: "0.7rem",
                    padding: "3px 10px",
                    border: `1px solid rgba(244,162,54,0.3)`,
                    color: "rgba(255,253,248,0.6)",
                    borderRadius: "2px",
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              <Link href={line.href} style={{
                display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "1.5rem",
                fontFamily: F.outfit, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em",
                color: C.saffron, textDecoration: "none",
                borderBottom: "1px solid rgba(244,162,54,0.4)", paddingBottom: "2px",
              }}>
                {line.cta} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>

        {/* ── PP Products — auto-carousel ── */}
        <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ borderBottom: `2px solid ${C.saffron}`, paddingBottom: "0.6rem", display: "inline-block" }}>
            <span style={{
              fontFamily: F.outfit, fontWeight: 600,
              fontSize: "0.75rem", letterSpacing: "0.14em",
              textTransform: "uppercase", color: C.charcoal,
            }}>
              PP Products — Auto Showcase
            </span>
          </div>
          <Link href="/products" style={{
            fontFamily: F.outfit, fontSize: "0.76rem", fontWeight: 500,
            color: C.taupe, textDecoration: "none", letterSpacing: "0.05em",
            display: "inline-flex", alignItems: "center", gap: "4px",
          }}>
            View All <ChevronRight size={12} />
          </Link>
        </div>

        <div className="sr" data-delay="0.1">
          <ProductCarousel />
        </div>

        {/* ── Paper & Board grades grid ── */}
        <div style={{ marginTop: "3rem", marginBottom: "1.25rem", borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "0.6rem", display: "inline-block" }}>
          <span style={{
            fontFamily: F.outfit, fontWeight: 600,
            fontSize: "0.75rem", letterSpacing: "0.14em",
            textTransform: "uppercase", color: C.charcoal,
          }}>
            Paper &amp; Board Grades
          </span>
        </div>

        <div className="products-detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {paperProducts.map((p, i) => (
            <Link key={p.name} href={`/products/${p.slug}`} className="sr product-card" data-delay={`${0.07 * i}`} style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderLeft: "none",
              borderRadius: "2px",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              padding: 0,
              textDecoration: "none",
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.saffron; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px rgba(244,162,54,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 1px 3px rgba(58,53,48,0.05), inset 0 1px 0 rgba(255,255,255,0.88)"; }}
            >
              <div style={{
                background: p.bg,
                height: "130px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: "56px", height: "56px",
                  background: "rgba(255,255,255,0.65)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(58,53,48,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}>
                  {p.icon}
                </div>
              </div>
              <div style={{ padding: "1rem 1.1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1 }}>
                <span style={{ fontFamily: F.outfit, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>{p.spec}</span>
                <h4 style={{ fontFamily: F.outfit, fontWeight: 600, fontSize: "0.95rem", color: C.charcoal, lineHeight: 1.25 }}>{p.name}</h4>
                <p style={{ fontFamily: F.baskerville, fontSize: "0.78rem", color: C.taupe, lineHeight: 1.65, flex: 1 }}>{p.desc}</p>
                <span style={{ marginTop: "0.65rem", display: "inline-flex", alignItems: "center", gap: "5px", color: C.charcoal, fontFamily: F.outfit, fontWeight: 600, fontSize: "0.74rem", letterSpacing: "0.05em", textDecoration: "underline", textDecorationColor: C.saffron, textUnderlineOffset: "3px" }}>
                  View Details <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3.5rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/products" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: F.outfit, fontSize: "0.88rem", fontWeight: 600,
            letterSpacing: "0.05em", color: C.charcoal, textDecoration: "none",
            padding: "12px 24px", border: `1.5px solid ${C.borderMid}`, borderRadius: "2px",
            boxShadow: "0 1px 4px rgba(58,53,48,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
          }}>
            View Full Catalogue <ArrowRight size={14} />
          </Link>
          <button className="btn-saffron" onClick={scrollToContact}>
            Request a Custom Quote <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}

/* ─── Infrastructure Callout ─────────────────────────────────────────────────── */
function InfraCallout() {
  const metrics = [
    { value: "200 T/Day", label: "Processing Capacity" },
    { value: "±0.3 mm", label: "Sheet Tolerance" },
    { value: "2500 mm", label: "Max Reel Width" },
    { value: "15400 mm", label: "Max Sheet Length" },
    { value: "6 Machines", label: "In-House Equipment" },
    { value: "48 Hr", label: "Typical Turnaround" },
  ];

  return (
    <div className="infra-section" style={{ background: C.charcoal, padding: "56px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="infra-callout-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          <div>
            <span style={{ fontFamily: F.outfit, fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>Converting Facility · Pune</span>
            <h2 style={{ fontFamily: F.outfit, fontWeight: 700, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: C.cream, marginTop: "0.4rem", letterSpacing: "-0.01em" }}>
              Cut-to-size. Wound to spec. Shipped on time.
            </h2>
          </div>
          <Link href="/infrastructure" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: F.outfit, fontSize: "0.85rem", fontWeight: 600,
            color: C.saffron, textDecoration: "none", letterSpacing: "0.04em",
            border: `1px solid rgba(244,162,54,0.4)`,
            padding: "10px 20px", borderRadius: "2px",
            whiteSpace: "nowrap",
          }}>
            View Full Facility <ArrowRight size={14} />
          </Link>
        </div>
        <div className="infra-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1px", background: "rgba(255,253,248,0.08)" }}>
          {metrics.map((m) => (
            <div key={m.label} style={{
              background: C.charcoal,
              padding: "1.25rem 1rem",
              textAlign: "center",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.15)",
            }}>
              <div style={{ fontFamily: F.outfit, fontWeight: 700, fontSize: "1.4rem", color: C.saffron, lineHeight: 1.1 }}>{m.value}</div>
              <div style={{ fontFamily: F.outfit, fontSize: "0.68rem", color: "rgba(255,253,248,0.5)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "4px" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Who We Serve Section ──────────────────────────────────────────────────── */
function IndustriesSection() {
  const tradeCustomers = [
    {
      num: "01",
      icon: <Factory size={26} style={{ color: C.saffron }} />,
      name: "Corrugators",
      desc: "Kraft liner, test liner and fluting medium in ready stock. Sheeted or in rolls. Reliable supply for high-volume corrugated board production.",
    },
    {
      num: "02",
      icon: <Package size={26} style={{ color: C.saffron }} />,
      name: "Box Makers",
      desc: "Pre-cut corrugated sheets and boards delivered to size. Reduce waste and lead times for small and mid-size box manufacturers.",
    },
    {
      num: "03",
      icon: <Layers size={26} style={{ color: C.saffron }} />,
      name: "Printers & Converters",
      desc: "FBB, duplex, coated and specialty boards sheeted to press-ready sizes. ITC and TNPL grades with consistent caliper and whiteness.",
    },
  ];

  const endIndustries = [
    {
      num: "04",
      icon: <Car size={26} style={{ color: C.saffron }} />,
      name: "Automotive",
      desc: "Returnable PP boxes, component trays and corrugated packaging for OEMs and Tier-1 suppliers across Pune and MIDC belt.",
    },
    {
      num: "05",
      icon: <Pill size={26} style={{ color: C.saffron }} />,
      name: "Pharmaceutical",
      desc: "FBB cartons, duplex board and PP trays meeting pharma packaging compliance requirements.",
    },
    {
      num: "06",
      icon: <ShoppingCart size={26} style={{ color: C.saffron }} />,
      name: "E-Commerce & FMCG",
      desc: "Transit-ready corrugated boxes, retail cartons and shelf-ready packaging for consumer brands and last-mile delivery.",
    },
    {
      num: "07",
      icon: <Wrench size={26} style={{ color: C.saffron }} />,
      name: "Engineering",
      desc: "Heavy-duty 7-ply corrugated crates and export-standard packaging for precision machinery and industrial goods.",
    },
  ];

  return (
    <section id="industries" style={{
      background: C.light,
      padding: "100px clamp(1.5rem, 5vw, 4rem)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Who We Serve</span>
          <h2 style={{
            fontFamily: F.outfit,
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: C.charcoal,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            The Full Paper<br />
            <span className="grad-accent">Supply Chain.</span>
          </h2>
          <p style={{ fontFamily: F.baskerville, fontSize: "1rem", color: C.taupe, lineHeight: 1.75, maxWidth: "520px", marginTop: "1rem" }}>
            From paper traders and corrugators to automotive OEMs and pharma brands — we supply the right grade, converted to the right size, on time.
          </p>
        </div>

        {/* Trade customers — primary */}
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ fontFamily: F.outfit, fontWeight: 600, fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.saffron }}>
            Paper Trade Customers
          </span>
        </div>
        <div className="industries-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "3rem" }}>
          {tradeCustomers.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.1 * i}`}>
              <div style={{ fontFamily: F.outfit, fontWeight: 700, fontSize: "2rem", color: C.saffron, lineHeight: 1, marginBottom: "1rem", opacity: 0.35 }}>{ind.num}</div>
              <div style={{ width: "44px", height: "44px", background: C.saffronDim, borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>{ind.icon}</div>
              <h3 style={{ fontFamily: F.outfit, fontWeight: 600, fontSize: "1.05rem", color: C.charcoal, marginBottom: "0.6rem" }}>{ind.name}</h3>
              <p style={{ fontFamily: F.baskerville, fontSize: "0.85rem", lineHeight: 1.7, color: C.taupe }}>{ind.desc}</p>
            </div>
          ))}
        </div>

        {/* End-use industries */}
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ fontFamily: F.outfit, fontWeight: 600, fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.taupe }}>
            End-Use Industries
          </span>
        </div>
        <div className="industries-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {endIndustries.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.15 * i}`}>
              <div style={{ fontFamily: F.outfit, fontWeight: 700, fontSize: "2rem", color: C.saffron, lineHeight: 1, marginBottom: "1rem", opacity: 0.35 }}>{ind.num}</div>
              <div style={{ width: "44px", height: "44px", background: C.saffronDim, borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>{ind.icon}</div>
              <h3 style={{ fontFamily: F.outfit, fontWeight: 600, fontSize: "1.05rem", color: C.charcoal, marginBottom: "0.6rem" }}>{ind.name}</h3>
              <p style={{ fontFamily: F.baskerville, fontSize: "0.85rem", lineHeight: 1.7, color: C.taupe }}>{ind.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Blog Teaser ────────────────────────────────────────────────────────────── */
function BlogTeaser() {
  const posts = [
    {
      slug: "gsm-guide-paper-board",
      category: "Industry Guide",
      title: "Understanding GSM in Paper & Board — A Complete Buyer's Guide",
      excerpt: "GSM is the most fundamental specification in paper buying. Get it wrong and you're either over-spending or watching your cartons fail.",
      read: "6 min read",
    },
    {
      slug: "fbb-vs-duplex-board",
      category: "Product Guide",
      title: "FBB vs Duplex Board: Which is Right for Your Packaging?",
      excerpt: "Knowing when to use FBB vs Duplex could save 15–25% on board cost without compromising performance.",
      read: "5 min read",
    },
    {
      slug: "export-packaging-compliance-india",
      category: "Compliance",
      title: "Export Packaging Compliance for Indian Manufacturers in 2026",
      excerpt: "BIS, EU, US FDA and FSC — what Indian exporters need to know before their next shipment.",
      read: "8 min read",
    },
  ];

  return (
    <section style={{ background: C.dark, padding: "80px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="sr blog-teaser-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontFamily: F.outfit, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>Knowledge Hub</span>
            <h2 style={{ fontFamily: F.outfit, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: C.cream, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: "0.5rem" }}>
              Packaging Intelligence,<br />
              <span className="grad-accent-light">Free to Use.</span>
            </h2>
          </div>
          <Link href="/blog" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: F.outfit, fontSize: "0.82rem", fontWeight: 600,
            color: C.cream, textDecoration: "none", letterSpacing: "0.05em",
            borderBottom: "1px solid rgba(255,253,248,0.25)", paddingBottom: "3px",
            whiteSpace: "nowrap",
          }}>
            All Articles <ArrowRight size={13} />
          </Link>
        </div>

        <div className="blog-teaser-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {posts.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="sr" data-delay={`${0.1 * i}`} style={{
              display: "block", textDecoration: "none",
              background: "rgba(255,253,248,0.04)",
              border: "1px solid rgba(255,253,248,0.08)",
              borderRadius: "2px",
              padding: "1.75rem",
              transition: "border-color 0.25s, background 0.25s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(244,162,54,0.45)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,253,248,0.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,253,248,0.08)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,253,248,0.04)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontFamily: F.outfit, fontSize: "0.66rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.saffron }}>{post.category}</span>
                <span style={{ fontFamily: F.outfit, fontSize: "0.66rem", color: "rgba(255,253,248,0.4)", letterSpacing: "0.04em" }}>{post.read}</span>
              </div>
              <h3 style={{ fontFamily: F.outfit, fontWeight: 600, fontSize: "0.98rem", color: C.cream, lineHeight: 1.35, marginBottom: "0.75rem" }}>{post.title}</h3>
              <p style={{ fontFamily: F.baskerville, fontSize: "0.82rem", color: "rgba(255,253,248,0.6)", lineHeight: 1.65, marginBottom: "1.25rem" }}>{post.excerpt}</p>
              <span style={{ fontFamily: F.outfit, fontSize: "0.76rem", fontWeight: 600, color: C.saffron, letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Read Article <ChevronRight size={12} />
              </span>
            </Link>
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
              <span className="grad-accent">Packaging Excellence</span>
            </h2>

            <p style={{
              fontFamily: F.baskerville,
              fontSize: "1rem",
              lineHeight: 1.85,
              color: C.taupe,
              marginBottom: "1.25rem",
            }}>
              Founded in 1995 by Managing Director <strong style={{ color: C.charcoal, fontWeight: 700 }}>Umesh Sahu</strong>, Pune Global
              Group has been a trusted paper and board trader in Pune, Maharashtra —
              supplying corrugators, printers and box makers with ITC, TNPL and
              imported grades. Over three decades, we built in-house converting
              capabilities: sheeting, rewinding and slitting so customers get
              cut-to-size stock with fast turnaround and low MOQ.
            </p>

            <p style={{
              fontFamily: F.baskerville,
              fontSize: "1rem",
              lineHeight: 1.85,
              color: C.taupe,
              marginBottom: "1.75rem",
            }}>
              Today we operate from our converting facility at BU Bhandari MIDC, Sanaswadi,
              and our commercial office in Gulmohar Center Point, Pune. We supply
              corrugators, printers and box makers with ready-stock paper grades and
              PP packaging solutions — serving 500+ clients across India.
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
              &ldquo;The right paper grade, cut to size, delivered on time — that is the
              foundation everything else is built on.&rdquo; — Umesh Sahu, Managing Director
            </p>
            <div style={{ marginTop: "2.5rem" }}>
              <Link href="/infrastructure" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: F.outfit, fontSize: "0.85rem", fontWeight: 600,
                color: C.charcoal, textDecoration: "none", letterSpacing: "0.04em",
                padding: "11px 20px", border: `1.5px solid ${C.borderMid}`, borderRadius: "2px",
              }}>
                Our Converting Facility <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right column — dark card */}
          <div className="sr-right" style={{ flex: "0 0 360px" }}>
            <div style={{
              background: C.dark,
              borderRadius: "4px",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(44,40,37,0.22), 0 6px 20px rgba(44,40,37,0.14), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "3px", background: C.saffron,
              }} />

              {/* Key stats */}
              <div style={{ marginBottom: "2rem" }}>
                <span style={{
                  fontFamily: F.outfit,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  color: C.saffron,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "1.25rem",
                }}>
                  Key Figures
                </span>

                {[
                  { stat: "1995", label: "Year Established" },
                  { stat: "500+", label: "Active Clients" },
                  { stat: "40+", label: "Paper Grades" },
                  { stat: "2", label: "Locations — Pune" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid rgba(255,253,248,0.12)",
                  }}>
                    <span style={{
                      fontFamily: F.outfit, fontWeight: 400,
                      fontSize: "0.88rem", color: "rgba(255,253,248,0.82)",
                      letterSpacing: "0.02em",
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
                  fontFamily: F.outfit,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  color: C.saffron,
                  letterSpacing: "0.14em",
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
                        color: "rgba(255,253,248,0.78)", lineHeight: 1.6,
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
                  color: "rgba(255,253,248,0.72)",
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
            <span className="grad-accent">Project Today</span>
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
              boxShadow: "0 4px 16px rgba(58,53,48,0.06), 0 1px 4px rgba(58,53,48,0.04), inset 0 1px 0 rgba(255,255,255,0.95)",
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
              color: "rgba(255,253,248,0.8)",
              lineHeight: 1.75,
              marginTop: "1.25rem",
              maxWidth: "260px",
            }}>
              Paper trading, converting and PP packaging solutions from Pune since 1995.
              ITC, TNPL &amp; imported grades in ready stock.
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
                color: "rgba(255,253,248,0.72)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                Products
              </div>
              {["ITC Paper & Boards", "PP Boxes & Sheets", "Duplex Boards", "Kraft Liner"].map((p) => (
                <button key={p} className="footer-link" onClick={() => scrollTo("#products")} style={{ background: "none", border: "none", textAlign: "left" }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Industries */}
            <div>
              <div style={{
                fontFamily: F.outfit, fontWeight: 600, fontSize: "0.78rem",
                color: "rgba(255,253,248,0.72)", letterSpacing: "0.12em",
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
                color: "rgba(255,253,248,0.72)", letterSpacing: "0.12em",
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
                  color: "rgba(255,253,248,0.8)", transition: "color 0.2s",
                  marginBottom: "0.5rem",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,253,248,0.8)")}
                >
                  <Mail size={13} /> contact.puneglobalgroup@gmail.com
                </a>
                <div style={{
                  fontFamily: F.outfit, fontSize: "0.78rem",
                  color: "rgba(255,253,248,0.75)",
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
            color: "rgba(255,253,248,0.72)",
          }}>
            © 2025 Pune Global Group. All rights reserved.
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: F.outfit, fontSize: "0.75rem",
            color: "rgba(255,253,248,0.72)",
          }}>
            <span>GSTIN:</span>
            <span style={{
              fontFamily: "'Courier New', monospace",
              color: "rgba(255,253,248,0.8)",
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
        <InfraCallout />
        <IndustriesSection />
        <BlogTeaser />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
