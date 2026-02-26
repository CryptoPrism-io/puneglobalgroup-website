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

/* ─── Fonts ─────────────────────────────────────────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Cormorant+Garamond:ital,wght@1,300;1,400;1,500&display=swap');
`;

/* ─── Tokens ─────────────────────────────────────────────────────────────────── */
const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#F5A623",   /* reserved: decorative accents, labels */
  saffrondark: "#B8720D", /* WCAG AA large text (3.65:1 on cream) — use for stat numbers */
  dark:      "#141210",
  border:    "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};

const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};

/* ─── Global CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    background: ${C.cream};
    color: ${C.charcoal};
    font-family: ${F.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Paper grain */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.025;
    pointer-events: none;
    z-index: 9998;
  }

  ::selection { background: ${C.saffron}; color: #fff; }
  a { text-decoration: none; color: inherit; }

  /* ── Hero entrance animations ────────────────── */
  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ruleGrow {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  @keyframes statReveal {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes eyebrowSlide {
    from { opacity: 0; letter-spacing: 0.18em; }
    to   { opacity: 1; letter-spacing: 0.03em; }
  }
  .hero-eyebrow-anim {
    animation: eyebrowSlide 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }
  .hero-h1-line1 {
    display: block;
    animation: heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.22s both;
  }
  .hero-h1-line2 {
    display: block;
    animation: heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both;
  }
  .hero-rule-anim {
    animation: ruleGrow 0.85s cubic-bezier(0.22,1,0.36,1) 0.55s both;
  }
  .hero-body-anim {
    animation: heroFadeUp 0.85s ease 0.65s both;
  }
  .hero-cta-anim {
    animation: heroFadeUp 0.85s ease 0.8s both;
  }
  .hero-stat-anim-0 { animation: statReveal 0.7s ease 0.9s  both; }
  .hero-stat-anim-1 { animation: statReveal 0.7s ease 1.0s  both; }
  .hero-stat-anim-2 { animation: statReveal 0.7s ease 1.1s  both; }
  .hero-stat-anim-3 { animation: statReveal 0.7s ease 1.2s  both; }

  /* ── Section number pulse ────────────────────── */
  @keyframes numFade {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 0.4; transform: translateY(0); }
  }
  .prod-num-anim { opacity: 0; }
  .prod-num-anim.visible { animation: numFade 0.7s ease forwards; }

  /* Scroll reveal */
  .sr { opacity: 0; transform: translateY(26px); transition: opacity 0.85s ease, transform 0.85s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }
  .sr-left { opacity: 0; transform: translateX(-24px); transition: opacity 0.85s ease, transform 0.85s ease; max-width: 100%; }
  .sr-left.visible { opacity: 1; transform: translateX(0); }
  .sr-right { opacity: 0; transform: translateX(24px); transition: opacity 0.85s ease, transform 0.85s ease; max-width: 100%; }
  .sr-right.visible { opacity: 1; transform: translateX(0); }
  .sr-scale { opacity: 0; transform: scale(0.97); transition: opacity 0.75s ease, transform 0.75s ease; }
  .sr-scale.visible { opacity: 1; transform: scale(1); }

  /* Marquee */
  @keyframes marqueeScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marqueeScroll 40s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  /* Navbar */
  .navbar-scrolled {
    border-bottom: 1px solid ${C.borderMid} !important;
    box-shadow: 0 1px 20px rgba(28,26,23,0.05) !important;
  }

  .nav-link {
    position: relative;
    font-family: ${F.body};
    font-size: 0.875rem;
    font-weight: 400;
    color: ${C.warm};
    letter-spacing: 0.01em;
    padding: 4px 0;
    transition: color 0.2s;
    cursor: pointer;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0; bottom: -2px;
    width: 0; height: 1px;
    background: ${C.charcoal};
    transition: width 0.28s ease;
  }
  .nav-link:hover { color: ${C.charcoal}; }
  .nav-link:hover::after { width: 100%; }

  /* Eyebrow */
  .eyebrow {
    font-family: ${F.italic};
    font-style: italic;
    font-size: 1.18rem;
    font-weight: 400;
    color: ${C.taupe};
    letter-spacing: 0.03em;
    display: block;
    margin-bottom: 16px;
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.charcoal}; color: ${C.cream};
    font-family: ${F.body}; font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase;
    padding: 13px 28px; border: none; border-radius: 1px;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: ${C.dark}; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: ${C.charcoal};
    font-family: ${F.body}; font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase;
    padding: 12px 28px; border: 1px solid ${C.borderMid}; border-radius: 1px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-outline:hover { background: ${C.charcoal}; color: ${C.cream}; border-color: ${C.charcoal}; }

  /* Form */
  .form-input {
    width: 100%;
    background: #fff; border: 1px solid ${C.borderMid}; border-radius: 1px;
    padding: 11px 15px; font-family: ${F.body}; font-size: 0.9rem; color: ${C.charcoal};
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus { border-color: ${C.charcoal}; box-shadow: 0 0 0 3px rgba(28,26,23,0.05); }
  .form-input::placeholder { color: ${C.taupe}; opacity: 0.55; }

  /* Cards */
  .product-card { border-radius: 1px; transition: border-color 0.22s, box-shadow 0.22s; }
  .product-card:hover { border-color: ${C.charcoal} !important; box-shadow: 0 6px 22px rgba(28,26,23,0.07); }

  .industry-tile {
    background: ${C.cream}; border: 1px solid ${C.border};
    padding: 2rem 1.75rem; border-radius: 1px; transition: border-color 0.22s, background 0.22s;
  }
  .industry-tile:hover { border-color: ${C.borderMid}; background: #fff; }

  /* Footer link */
  .footer-link {
    font-family: ${F.body}; font-size: 0.84rem; color: rgba(250,247,242,0.52);
    transition: color 0.2s; cursor: pointer; display: block; margin-bottom: 10px;
    text-decoration: none; background: none; border: none; padding: 0; text-align: left;
  }
  .footer-link:hover { color: ${C.cream}; }

  /* Carousel */
  @keyframes carouselSlideIn {
    from { opacity: 0; transform: translateX(18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes carouselProgress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .carousel-card-enter { animation: carouselSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .carousel-card-enter:nth-child(2) { animation-delay: 0.06s; }
  .carousel-card-enter:nth-child(3) { animation-delay: 0.12s; }
  @media (max-width: 768px) { .carousel-track { grid-template-columns: 1fr 1fr !important; } }
  @media (max-width: 480px) { .carousel-track { grid-template-columns: 1fr !important; } }

  /* Mobile nav */
  .mobile-nav {
    display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: ${C.dark}; z-index: 999; flex-direction: column;
    align-items: center; justify-content: center; gap: 36px;
  }
  .mobile-nav.open { display: flex; }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-stats-row { flex-wrap: wrap !important; width: 100% !important; }
    .hero-stat-box { flex: 1 1 40% !important; border-left: 1px solid ${C.borderMid} !important; border-right: none !important; margin-bottom: 1rem; }
    .about-grid { flex-direction: column !important; }
    .contact-grid { flex-direction: column !important; }
    .footer-grid { flex-direction: column !important; gap: 3rem !important; }
    .footer-cols { flex-direction: column !important; gap: 2rem !important; }
    .infra-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .hero-headline { font-size: clamp(2.2rem, 9vw, 3.2rem) !important; }
    .products-grid { grid-template-columns: 1fr !important; }
    .products-detail-grid { grid-template-columns: 1fr 1fr !important; }
    .industries-grid { grid-template-columns: 1fr 1fr !important; }
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
`;

/* ─── Turiya Logo ─────────────────────────────────────────────────────────── */
function TuriyaLogo({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  const main = onDark ? C.cream : C.charcoal;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="Pune Global Group logo symbol"
      style={{ transform: "rotate(-45deg)", display: "block" }}>
      <path d="M6 6 L38 6 Q44 6, 44 12 L18 38 Q12 44, 6 44 L6 6 Z" fill={main} />
      <path d="M56 6 L94 6 L94 38 Q94 44, 88 44 L56 12 Q56 6, 62 6 Z" fill={C.saffron} />
      <path d="M94 56 L94 94 L62 94 Q56 94, 56 88 L82 62 Q88 56, 94 56 Z" fill={main} />
      <circle cx="25" cy="75" r="12" fill={C.saffron} opacity="0.15" />
      <circle cx="25" cy="75" r="5" fill={C.saffron} />
      <circle cx="25" cy="75" r="1.8" fill="#8B1A1A" />
    </svg>
  );
}

function Logo({ inverted = false }: { inverted?: boolean }) {
  const textColor = inverted ? C.cream : C.charcoal;
  const subColor  = inverted ? "rgba(250,247,242,0.55)" : C.taupe;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", userSelect: "none" }}>
      <TuriyaLogo size={42} onDark={inverted} />
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.98rem",
          letterSpacing: "0.13em", color: textColor, lineHeight: 1.1, textTransform: "uppercase" }}>
          Pune Global Group
        </span>
        <span style={{ fontFamily: F.italic, fontStyle: "italic", fontWeight: 400,
          fontSize: "0.98rem", color: subColor, letterSpacing: "0.03em", lineHeight: 1.2 }}>
          Your Trusted Packaging Partner
        </span>
      </div>
    </div>
  );
}

/* ─── Stat counter hook ──────────────────────────────────────────────────────── */
function useCountUp(end: number, duration = 1400, enabled = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) { setVal(end); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, enabled]);
  return val;
}

/* ─── Scroll reveal hook ─────────────────────────────────────────────────────── */
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
}

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Products",       href: "/products" },
    { label: "Infrastructure", href: "/infrastructure" },
    { label: "Blog",           href: "/blog" },
    { label: "About",          href: "#about" },
    { label: "Contact",        href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={scrolled ? "navbar-scrolled" : ""}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 900,
          background: C.cream,
          borderBottom: scrolled ? undefined : `1px solid ${C.border}`,
          transition: "all 0.3s ease",
          height: "70px", display: "flex", alignItems: "center",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Logo />
          </button>

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map((l) => l.href.startsWith("#") ? (
              <button key={l.href} className="nav-link"
                onClick={() => scrollTo(l.href)} style={{ background: "none", border: "none" }}>
                {l.label}
              </button>
            ) : (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn-primary desktop-nav"
              onClick={() => scrollTo("#contact")}
              style={{ padding: "9px 20px", fontSize: "0.76rem" }}>
              Get Quote <ArrowRight size={13} />
            </button>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}
              style={{ display: "none", background: "none", border: "none",
                cursor: "pointer", color: C.charcoal }}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        <button onClick={() => setMobileOpen(false)}
          style={{ position: "absolute", top: "22px", right: "22px",
            background: "none", border: "none", cursor: "pointer", color: C.cream }}>
          <X size={26} />
        </button>
        <Logo inverted />
        {links.map((l) => l.href.startsWith("#") ? (
          <button key={l.href}
            onClick={() => { setMobileOpen(false); scrollTo(l.href); }}
            style={{ background: "none", border: "none", cursor: "pointer",
              fontFamily: F.display, fontStyle: "italic", fontSize: "1.8rem",
              fontWeight: 400, color: C.cream, letterSpacing: "0.03em" }}>
            {l.label}
          </button>
        ) : (
          <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
            style={{ fontFamily: F.display, fontStyle: "italic", fontSize: "1.8rem",
              fontWeight: 400, color: C.cream, letterSpacing: "0.03em" }}>
            {l.label}
          </Link>
        ))}
        <button className="btn-primary" onClick={() => scrollTo("#contact")}>
          Get Quote <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}

/* ─── Animated stat ──────────────────────────────────────────────────────────── */
function AnimatedStat({ raw, label, note, animClass }: {
  raw: string; label: string; note: string; animClass: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 900); return () => clearTimeout(t); }, []);
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  const suffix = raw.replace(/[0-9]/g, "");
  const counted = useCountUp(num, 1600, ready);
  const display = ready ? `${counted}${suffix}` : raw;

  return (
    <div className={animClass} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <div style={{ fontFamily: F.display, fontWeight: 700,
        fontSize: "2.2rem", color: C.saffrondark, lineHeight: 1,
        transition: "color 0.3s" }}>
        {display}
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.7rem",
        color: C.charcoal, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: F.italic, fontStyle: "italic",
        fontSize: "1.15rem", color: C.taupe }}>
        {note}
      </div>
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */
function Hero() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  const stats = [
    { raw: "100M+", label: "Boxes Delivered", note: "and counting" },
    { raw: "500+",  label: "Active Clients",  note: "across India" },
    { raw: "21",    label: "States Served",   note: "nationwide" },
    { raw: "1995",  label: "Established",     note: "Pune, Maharashtra" },
  ];

  return (
    <section style={{
      minHeight: "100vh", background: C.cream,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "clamp(50px, 8vh, 90px) clamp(1.5rem, 5vw, 4rem) clamp(48px, 8vh, 80px)",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>

        {/* Eyebrow — CSS animation */}
        <div className="hero-eyebrow-anim"
          style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
          <span className="hero-eyebrow-text" style={{ fontFamily: F.italic, fontStyle: "italic",
            fontSize: "1.15rem", color: C.taupe, whiteSpace: "nowrap" }}>
            PP Manufacturing · FBB Converting · Paper Trading
          </span>
          <div className="hero-eyebrow-divider" style={{ flex: 1, height: "1px", background: C.border }} />
          <span className="hero-eyebrow-est" style={{ fontFamily: F.body, fontSize: "0.7rem", color: C.taupe,
            letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Pune, India · Est. 1995
          </span>
        </div>

        {/* Headline — staggered lines */}
        <h1 className="hero-headline" style={{
          fontFamily: F.display, fontWeight: 700,
          fontSize: "clamp(2.8rem, 5vw, 5rem)",
          lineHeight: 1.08, color: C.charcoal,
          letterSpacing: "-0.02em", maxWidth: "820px", marginBottom: "0",
        }}>
          <span className="hero-h1-line1" style={{ display: "block" }}>
            Engineered for Industry.
          </span>
          <span className="hero-h1-line2" style={{
            display: "block",
            fontSize: "0.72em",
            fontWeight: 400,
            letterSpacing: "0em",
            color: C.charcoal,
            marginTop: "0.18em",
          }}>
            Trusted{" "}
            <span style={{ color: C.saffron, fontWeight: 600 }}>Across India.</span>
          </span>
        </h1>

        {/* Rule — grows from left */}
        <div className="hero-rule-anim"
          style={{ height: "1px", background: C.borderMid, margin: "2.75rem 0" }} />

        {/* Body */}
        <div style={{ display: "flex", gap: "4rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="hero-body-anim" style={{ flex: "1 1 400px", maxWidth: "520px" }}>
            <p style={{ fontFamily: F.body, fontSize: "1.05rem", lineHeight: 1.85,
              color: C.taupe, marginBottom: "2.5rem", fontWeight: 300 }}>
              Pune Global Group manufactures precision PP trays, separators, boxes
              and crates for automotive, pharma and electronics industries — export-ready,
              custom-spec, from our Pune facility. We also convert FBB sheets and
              trade paper &amp; board grades across 21 states.
            </p>
            <div className="hero-cta-anim" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>
                View Products <ArrowRight size={14} />
              </Link>
              <button className="btn-outline" onClick={scrollToContact}>
                Request RFQ <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Stats — animated counters */}
          <div className="hero-stats-row"
            style={{ display: "flex", flex: "0 0 auto", alignSelf: "flex-end" }}>
            {stats.map((stat, i) => (
              <div key={stat.label} className="hero-stat-box" style={{
                padding: "0 2.25rem",
                borderLeft: `1px solid ${C.borderMid}`,
                borderRight: i === stats.length - 1 ? `1px solid ${C.borderMid}` : "none",
              }}>
                <AnimatedStat
                  raw={stat.raw} label={stat.label} note={stat.note}
                  animClass={`hero-stat-anim-${i}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Marquee Ticker ─────────────────────────────────────────────────────────── */
function MarqueeTicker() {
  const items = [
    "PP Trays · Separators · Boxes",
    "Industrial PP Packaging",
    "Export Ready",
    "PP Crates · Layer Pads · ESD Bins",
    "Custom PP Manufacturing",
    "FBB Converting",
    "Sheeting · Slitting · Rewinding",
    "ITC · TNPL · Imported Grades",
    "21 States · 500+ Customers",
  ];
  const repeated = [...items, ...items];

  return (
    <div style={{
      background: C.parchment, height: "54px", overflow: "hidden",
      display: "flex", alignItems: "center",
      borderTop: `1px solid ${C.borderMid}`, borderBottom: `1px solid ${C.borderMid}`,
    }}>
      <div className="marquee-track" aria-hidden="true">
        {repeated.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center",
            fontFamily: F.italic, fontStyle: "italic",
            fontSize: "1.08rem", letterSpacing: "0.01em",
            color: C.warm, whiteSpace: "nowrap", padding: "0 2.5rem",
          }}>
            {item}
            <span style={{ marginLeft: "2.5rem", color: C.saffron, fontSize: "0.5rem" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── PP Product Grid (multi-image carousel + hover expand, matches Paper cards) ── */
const PP_PRODUCTS = [
  {
    name: "PP Foldable Boxes",
    spec: "Manufactured · Returnable",
    desc: "Custom-manufactured foldable PP boxes for automotive trays and returnable industrial logistics. Exported globally.",
    imgs: [
      "https://www.brotherspackaging.in/assets/images/products/ppbox/9.webp",
      "/products/pp/pp-foldable-boxes-2.jpg",
      "/products/pp/pp-foldable-boxes-3.jpg",
    ],
    slug: "pp-foldable-boxes",
  },
  {
    name: "PP Corrugated Sheets",
    spec: "Manufactured · Custom Sizes",
    desc: "Waterproof, UV-stable PP hollow corrugated sheets for layer pads, partition dividers and protective wrapping.",
    imgs: [
      "https://jppack.in/products/ppcorrugatedsheetssunpaksheetshollowsheetsfluteboardsheets_24_07_25_09_23_01_102592.png",
      "/products/pp/pp-corrugated-sheets-2.jpg",
      "/products/pp/pp-corrugated-sheets-3.jpg",
    ],
    slug: "pp-corrugated-sheets",
  },
  {
    name: "PP Corrugated Crates",
    spec: "Manufactured · Heavy Duty",
    desc: "Stackable returnable crates for automotive OEMs, engineering components and industrial material handling.",
    imgs: [
      "https://jppack.in/products/corrugatedplasticpackagebins_24_07_25_07_55_30_122853.png",
      "/products/pp/pp-corrugated-crates-2.jpg",
      "/products/pp/pp-corrugated-crates-3.jpg",
    ],
    slug: "pp-foldable-boxes",
  },
  {
    name: "PP Layer Pads",
    spec: "Manufactured · Pallet-Ready",
    desc: "PP layer pads and slip sheets for pallet stacking, product separation and surface protection in transit.",
    imgs: [
      "https://jppack.in/products/ppcorrugatedlayerpad_24_07_25_09_27_58_112075.png",
      "/products/pp/pp-layer-pads-2.jpg",
      "/products/pp/pp-layer-pads-3.jpg",
    ],
    slug: "pp-layer-pads",
  },
  {
    name: "ESD Packaging",
    spec: "Manufactured · Anti-Static",
    desc: "Anti-static PP bins and boxes for electronics manufacturers and PCB component handling. Export compliant.",
    imgs: [
      "https://jppack.in/products/ppcorrugatedesdbin_24_07_25_09_29_20_111119.png",
      "/products/pp/pp-esd-packaging-2.jpg",
      "/products/pp/pp-esd-packaging-3.jpg",
    ],
    slug: "esd-packaging",
  },
];

function PPProductCard({ p, i }: { p: typeof PP_PRODUCTS[0]; i: number }) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => setIdx(c => (c + 1) % p.imgs.length), 1500);
    }, i * 375);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [hovered, i, p.imgs.length]);

  return (
    <Link href={`/products/${p.slug}`}
      className="sr product-card" data-delay={`${0.07 * i}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fff" : C.cream,
        border: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        transition: "background 0.25s",
      }}>
      {/* Image area — expands on hover */}
      <div style={{
        height: hovered ? "190px" : "110px",
        overflow: "hidden",
        position: "relative",
        transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}>
        {p.imgs.map((src, j) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={src} src={src} alt={`${p.name} — ${j + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: j === idx ? 1 : 0,
              transition: "opacity 0.55s ease",
            }} />
        ))}
        {/* Dot indicators — visible on hover */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "4px",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
          zIndex: 2,
        }}>
          {p.imgs.map((_, j) => (
            <span key={j} style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: j === idx ? "#fff" : "rgba(255,255,255,0.45)",
              transition: "background 0.2s, transform 0.2s",
              transform: j === idx ? "scale(1.3)" : "scale(1)",
              display: "block",
            }} />
          ))}
        </div>
      </div>

      {/* Text body */}
      <div style={{ padding: "1.25rem 1.25rem 1.5rem",
        display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        <span style={{ fontFamily: F.body, fontSize: "0.63rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>
          {p.spec}
        </span>
        <h4 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "0.98rem",
          color: C.charcoal, lineHeight: 1.25 }}>
          {p.name}
        </h4>
        <p style={{ fontFamily: F.body, fontSize: "0.79rem", color: C.taupe,
          lineHeight: 1.7, flex: 1, fontWeight: 300 }}>
          {p.desc}
        </p>
        <span style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center",
          gap: "4px", color: C.charcoal, fontFamily: F.body, fontWeight: 500,
          fontSize: "0.74rem", letterSpacing: "0.04em",
          borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "1px",
          alignSelf: "flex-start" }}>
          View Details <ChevronRight size={11} />
        </span>
      </div>
    </Link>
  );
}

function PPProductGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1px",
      background: C.borderMid }}>
      {PP_PRODUCTS.map((p, i) => (
        <PPProductCard key={p.name} p={p} i={i} />
      ))}
    </div>
  );
}

/* ─── Paper Product Card (multi-image carousel + hover expand) ────────────────── */
type PaperProduct = {
  name: string; spec: string; desc: string;
  imgs: string[]; slug: string;
};

function PaperProductCard({ p, i }: { p: PaperProduct; i: number }) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => setIdx(c => (c + 1) % p.imgs.length), 1500);
    }, i * 375);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [hovered, i, p.imgs.length]);

  return (
    <Link href={`/products/${p.slug}`}
      className="sr product-card" data-delay={`${0.07 * i}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fff" : C.cream,
        border: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        transition: "background 0.25s",
      }}>
      {/* Image area — expands on hover */}
      <div style={{
        height: hovered ? "190px" : "110px",
        overflow: "hidden",
        position: "relative",
        transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}>
        {p.imgs.map((src, j) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={src} src={src} alt={`${p.name} — ${j + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: j === idx ? 1 : 0,
              transition: "opacity 0.55s ease",
            }} />
        ))}
        {/* Dot indicators — visible on hover */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "4px",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
          zIndex: 2,
        }}>
          {p.imgs.map((_, j) => (
            <span key={j} style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: j === idx ? "#fff" : "rgba(255,255,255,0.45)",
              transition: "background 0.2s, transform 0.2s",
              transform: j === idx ? "scale(1.3)" : "scale(1)",
              display: "block",
            }} />
          ))}
        </div>
      </div>

      {/* Text body */}
      <div style={{ padding: "1.25rem 1.25rem 1.5rem",
        display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        <span style={{ fontFamily: F.body, fontSize: "0.63rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>
          {p.spec}
        </span>
        <h4 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "0.98rem",
          color: C.charcoal, lineHeight: 1.25 }}>
          {p.name}
        </h4>
        <p style={{ fontFamily: F.body, fontSize: "0.79rem", color: C.taupe,
          lineHeight: 1.7, flex: 1, fontWeight: 300 }}>
          {p.desc}
        </p>
        <span style={{ marginTop: "0.65rem", display: "inline-flex", alignItems: "center",
          gap: "4px", color: C.charcoal, fontFamily: F.body, fontWeight: 500,
          fontSize: "0.72rem", letterSpacing: "0.04em", borderBottom: `1px solid ${C.borderMid}`,
          paddingBottom: "1px", alignSelf: "flex-start" }}>
          View Details <ChevronRight size={11} />
        </span>
      </div>
    </Link>
  );
}

/* ─── Products Section ───────────────────────────────────────────────────────── */
function ProductsSection() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  const lines = [
    {
      num: "01",
      eyebrow: "PP Manufacturing — Core Business",
      heading: "Trays · Separators · Boxes · Crates",
      desc: "We manufacture precision polypropylene packaging for automotive, pharma and electronics industries — industrial trays, separators, foldable boxes, crates and layer pads. Custom sizes. Export-ready documentation on every order.",
      tags: ["PP Trays", "Separators", "Foldable Boxes", "PP Crates", "Layer Pads", "ESD Bins"],
      href: "/products",
      cta: "View PP Products",
    },
    {
      num: "02",
      eyebrow: "FBB Converting",
      heading: "Cut to Size. Press-Ready.",
      desc: "We cut FBB and board reels to your exact press sheet dimensions — sheeting, slitting, rewinding. Fast turnaround for printers, carton manufacturers and packaging converters across India.",
      tags: ["FBB Sheeting", "Duplex Cutting", "Slitting", "Rewinding", "Custom Dimensions", "Low MOQ"],
      href: "/infrastructure",
      cta: "See Converting Facility",
    },
    {
      num: "03",
      eyebrow: "Paper & PP Sheet Trading",
      heading: "ITC · TNPL · Imported",
      desc: "Authorised distributor of ITC PSPD and TNPL board grades — FBB, duplex, kraft liner and test liner. We also supply PP corrugated sheets in standard and custom sizes from our Pune warehouse.",
      tags: ["ITC FBB", "TNPL Grades", "Kraft Liner", "Duplex Board", "PP Sheets", "Ready Stock"],
      href: "/products",
      cta: "Browse All Grades",
    },
  ];

  const paperProducts = [
    {
      name: "ITC FBB Boards",
      spec: "Traded · Cyber Oak · Cyber XLPac",
      desc: "ITC PSPD folding box boards — high stiffness, FSC certified, sheeted to press-ready sizes. 230–400 GSM.",
      imgs: ["/products/paper/fbb-board.jpg", "/products/paper/fbb-board-2.jpg", "/products/paper/fbb-board-3.jpg"],
      slug: "itc-fbb-boards",
    },
    {
      name: "Duplex Board",
      spec: "Traded · Cut to Size",
      desc: "Coated duplex boards 200–450 GSM for pharma cartons and retail packaging. Sheeted from reel.",
      imgs: ["/products/paper/duplex-board.jpg", "/products/paper/duplex-board-2.jpg", "/products/paper/duplex-board-3.jpg"],
      slug: "duplex-board",
    },
    {
      name: "Kraft Liner",
      spec: "Traded · 100–440 GSM",
      desc: "100% fresh fibre imported kraft liner for heavy-duty corrugated and export packaging.",
      imgs: ["/products/paper/kraft-liner.jpg", "/products/paper/kraft-liner-2.jpg", "/products/paper/kraft-liner-3.jpg"],
      slug: "kraft-liner",
    },
    {
      name: "Test Liners & Fluting",
      spec: "Traded · 80–400 GSM",
      desc: "Recycled fibre test liners and fluting medium for corrugators and box manufacturers.",
      imgs: ["/products/paper/test-liner.jpg", "/products/paper/test-liner-2.jpg", "/products/paper/test-liner-3.jpg"],
      slug: "test-liners-fluting",
    },
  ];

  return (
    <section id="products" style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Header */}
        <div className="sr" style={{ marginBottom: "4rem" }}>
          <span className="eyebrow">Three Business Lines</span>
          <h2 style={{ fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.4rem)", color: C.charcoal,
            letterSpacing: "-0.02em", lineHeight: 1.1, maxWidth: "560px" }}>
            Manufacture. Convert. Trade.
          </h2>
          <p style={{ fontFamily: F.body, fontSize: "1rem", color: C.taupe,
            lineHeight: 1.8, maxWidth: "520px", marginTop: "1rem", fontWeight: 300 }}>
            We manufacture industrial PP packaging to export spec. We convert FBB
            into press-ready sheets. We trade ITC, TNPL and imported board grades.
            One facility. One partner. 30 years.
          </p>
        </div>

        {/* 3 Business line cards — light parchment */}
        <div className="products-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
            background: C.borderMid, marginBottom: "4rem" }}>
          {lines.map((line, i) => (
            <div key={line.eyebrow} className="sr" data-delay={`${0.1 * i}`}
              style={{
                background: C.cream,
                padding: "2.75rem",
                display: "flex", flexDirection: "column",
                transition: "background 0.25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = C.cream; }}>

              <div className="sr prod-num-anim" data-delay={`${0.05 + 0.1 * i}`}
                style={{ fontFamily: F.display, fontWeight: 700, fontSize: "3.5rem",
                  color: C.saffron, lineHeight: 1, marginBottom: "1.5rem" }}>
                {line.num}
              </div>

              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.65rem",
                letterSpacing: "0.14em", textTransform: "uppercase", color: C.taupe,
                marginBottom: "0.75rem" }}>
                {line.eyebrow}
              </span>

              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.4rem",
                color: C.charcoal, letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: "1rem" }}>
                {line.heading}
              </h3>

              <p style={{ fontFamily: F.body, fontSize: "1.08rem", color: C.warm,
                lineHeight: 1.78, marginBottom: "1.5rem", flex: 1, fontWeight: 300 }}>
                {line.desc}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "2rem" }}>
                {line.tags.map((t) => (
                  <span key={t} style={{
                    fontFamily: F.body, fontSize: "0.68rem", padding: "3px 10px",
                    border: `1px solid ${C.borderMid}`, color: C.warm, borderRadius: "1px",
                    letterSpacing: "0.02em",
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              <Link href={line.href} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontFamily: F.body, fontSize: "1.15rem", fontWeight: 500,
                letterSpacing: "0.06em", color: C.charcoal, textDecoration: "none",
                borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "2px",
                alignSelf: "flex-start",
              }}>
                {line.cta} <ArrowRight size={11} />
              </Link>
            </div>
          ))}
        </div>

        {/* PP Carousel subheading */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
              letterSpacing: "0.12em", textTransform: "uppercase", color: C.charcoal }}>
              PP Products
            </span>
            <div style={{ width: "32px", height: "1px", background: C.saffron }} />
          </div>
          <Link href="/products" style={{
            fontFamily: F.body, fontSize: "0.74rem", fontWeight: 400,
            color: C.taupe, textDecoration: "none", letterSpacing: "0.04em",
            display: "inline-flex", alignItems: "center", gap: "4px",
          }}>
            View All <ChevronRight size={11} />
          </Link>
        </div>
        <div className="sr" data-delay="0.1"><PPProductGrid /></div>

        {/* Paper grades */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem",
          margin: "3.5rem 0 1.25rem" }}>
          <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
            letterSpacing: "0.12em", textTransform: "uppercase", color: C.charcoal }}>
            Paper &amp; Board Grades
          </span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>

        <div className="products-detail-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px",
            background: C.borderMid }}>
          {paperProducts.map((p, i) => (
            <PaperProductCard key={p.name} p={p} i={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3.5rem",
          display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/products" className="btn-outline" style={{ textDecoration: "none" }}>
            View Full Catalogue <ArrowRight size={13} />
          </Link>
          <button className="btn-primary" onClick={scrollToContact}>
            Request a Custom Quote <ArrowRight size={14} />
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
    { value: "±0.3 mm",  label: "Sheet Tolerance" },
    { value: "2500 mm",  label: "Max Reel Width" },
    { value: "15400 mm", label: "Max Sheet Length" },
    { value: "6",        label: "In-House Machines" },
    { value: "48 Hr",    label: "Typical Turnaround" },
  ];

  return (
    <div className="infra-section" style={{ background: C.charcoal, padding: "64px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="infra-callout-header" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "2rem", flexWrap: "wrap", marginBottom: "3rem",
        }}>
          <div>
            <span style={{ fontFamily: F.italic, fontStyle: "italic",
              fontSize: "1.1rem", color: "rgba(250,247,242,0.5)", display: "block", marginBottom: "8px" }}>
              Converting Facility · BU Bhandari MIDC, Sanaswadi
            </span>
            <h2 style={{ fontFamily: F.display, fontWeight: 600,
              fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: C.cream,
              lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Cut-to-size. Wound to spec.<br />
              <em style={{ fontWeight: 400, opacity: 0.75 }}>Shipped on time.</em>
            </h2>
          </div>
          <Link href="/infrastructure" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: F.body, fontSize: "0.98rem", fontWeight: 500,
            color: C.cream, textDecoration: "none", letterSpacing: "0.07em",
            textTransform: "uppercase",
            border: `1px solid rgba(250,247,242,0.25)`,
            padding: "11px 22px", borderRadius: "1px", whiteSpace: "nowrap",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => { const a = e.currentTarget; a.style.borderColor = "rgba(250,247,242,0.5)"; a.style.background = "rgba(250,247,242,0.07)"; }}
          onMouseLeave={e => { const a = e.currentTarget; a.style.borderColor = "rgba(250,247,242,0.25)"; a.style.background = "transparent"; }}>
            View Full Facility <ArrowRight size={13} />
          </Link>
        </div>

        <div className="infra-metrics-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
          gap: "1px", background: "rgba(250,247,242,0.08)",
        }}>
          {metrics.map((m) => (
            <div key={m.label} style={{
              background: C.charcoal, padding: "1.5rem 1rem", textAlign: "center",
            }}>
              <div style={{ fontFamily: F.display, fontWeight: 700,
                fontSize: "1.5rem", color: C.saffron, lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontFamily: F.body, fontSize: "0.66rem",
                color: "rgba(250,247,242,0.45)", letterSpacing: "0.07em",
                textTransform: "uppercase", marginTop: "6px" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Industries Section ─────────────────────────────────────────────────────── */
function IndustriesSection() {
  const tradeCustomers = [
    {
      num: "01",
      icon: <Factory size={22} color={C.saffron} />,
      name: "Corrugators",
      desc: "Kraft liner, test liner and fluting medium in ready stock. Sheeted or in rolls. Reliable supply for high-volume corrugated board production.",
    },
    {
      num: "02",
      icon: <Package size={22} color={C.saffron} />,
      name: "Box Makers",
      desc: "Pre-cut corrugated sheets and boards delivered to size. Reduce waste and lead times for small and mid-size box manufacturers.",
    },
    {
      num: "03",
      icon: <Layers size={22} color={C.saffron} />,
      name: "Printers & Converters",
      desc: "FBB, duplex, coated and specialty boards sheeted to press-ready sizes. ITC and TNPL grades with consistent caliper and whiteness.",
    },
  ];

  const endIndustries = [
    {
      num: "04",
      icon: <Car size={22} color={C.saffron} />,
      name: "Automotive",
      desc: "Returnable PP boxes, component trays and corrugated packaging for OEMs and Tier-1 suppliers across Pune and MIDC belt.",
    },
    {
      num: "05",
      icon: <Pill size={22} color={C.saffron} />,
      name: "Pharmaceutical",
      desc: "FBB cartons, duplex board and PP trays meeting pharma packaging compliance requirements.",
    },
    {
      num: "06",
      icon: <ShoppingCart size={22} color={C.saffron} />,
      name: "E-Commerce & FMCG",
      desc: "Transit-ready corrugated boxes, retail cartons and shelf-ready packaging for consumer brands and last-mile delivery.",
    },
    {
      num: "07",
      icon: <Wrench size={22} color={C.saffron} />,
      name: "Engineering",
      desc: "Heavy-duty 7-ply corrugated crates and export-standard packaging for precision machinery and industrial goods.",
    },
  ];

  return (
    <section id="industries" style={{ background: C.parchment, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Who We Serve</span>
          <h2 style={{ fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C.charcoal,
            letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            The Full Paper Supply Chain.
          </h2>
          <p style={{ fontFamily: F.body, fontSize: "1rem", color: C.taupe,
            lineHeight: 1.8, maxWidth: "500px", marginTop: "1rem", fontWeight: 300 }}>
            From paper traders and corrugators to automotive OEMs and pharma brands —
            we supply the right grade, converted to the right size, on time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
            letterSpacing: "0.12em", textTransform: "uppercase", color: C.taupe }}>
            Paper Trade Customers
          </span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>

        <div className="industries-grid" style={{ display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
          background: C.borderMid, marginBottom: "3rem" }}>
          {tradeCustomers.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.1 * i}`}
              style={{ background: C.parchment }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "2.8rem",
                color: C.saffron, lineHeight: 1, marginBottom: "1.25rem", opacity: 0.4 }}>
                {ind.num}
              </div>
              <div style={{ width: "38px", height: "38px", background: "rgba(212,134,14,0.08)",
                borderRadius: "1px", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: "1rem" }}>
                {ind.icon}
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
                color: C.charcoal, marginBottom: "0.6rem" }}>
                {ind.name}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "0.85rem", lineHeight: 1.75,
                color: C.taupe, fontWeight: 300 }}>
                {ind.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
            letterSpacing: "0.12em", textTransform: "uppercase", color: C.taupe }}>
            End-Use Industries
          </span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>

        <div className="industries-grid" style={{ display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: C.borderMid }}>
          {endIndustries.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.1 * i}`}
              style={{ background: C.parchment }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "2.8rem",
                color: C.saffron, lineHeight: 1, marginBottom: "1.25rem", opacity: 0.4 }}>
                {ind.num}
              </div>
              <div style={{ width: "38px", height: "38px", background: "rgba(212,134,14,0.08)",
                borderRadius: "1px", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: "1rem" }}>
                {ind.icon}
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
                color: C.charcoal, marginBottom: "0.6rem" }}>
                {ind.name}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "0.85rem", lineHeight: 1.75,
                color: C.taupe, fontWeight: 300 }}>
                {ind.desc}
              </p>
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
      read: "6 min",
    },
    {
      slug: "fbb-vs-duplex-board",
      category: "Product Guide",
      title: "FBB vs Duplex Board: Which is Right for Your Packaging?",
      excerpt: "Knowing when to use FBB vs Duplex could save 15–25% on board cost without compromising performance.",
      read: "5 min",
    },
    {
      slug: "export-packaging-compliance-india",
      category: "Compliance",
      title: "Export Packaging Compliance for Indian Manufacturers in 2026",
      excerpt: "BIS, EU, US FDA and FSC — what Indian exporters need to know before their next shipment.",
      read: "8 min",
    },
  ];

  return (
    <section style={{ background: C.cream, padding: "80px clamp(1.5rem, 5vw, 4rem)",
      borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr blog-teaser-header" style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: "3rem", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <span className="eyebrow">Knowledge Hub</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Packaging Intelligence,<br />
              <em style={{ fontWeight: 400 }}>Free to Use.</em>
            </h2>
          </div>
          <Link href="/blog" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: F.body, fontSize: "1.15rem", fontWeight: 500,
            color: C.warm, textDecoration: "none", letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "3px",
            whiteSpace: "nowrap",
          }}>
            All Articles <ArrowRight size={12} />
          </Link>
        </div>

        <div className="blog-teaser-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px", background: C.borderMid }}>
          {posts.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="sr" data-delay={`${0.1 * i}`}
              style={{
                display: "block", textDecoration: "none",
                background: C.cream, padding: "2rem",
                transition: "background 0.22s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.parchment; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.cream; }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "1.25rem" }}>
                <span style={{ fontFamily: F.body, fontSize: "0.64rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: C.saffron }}>
                  {post.category}
                </span>
                <span style={{ fontFamily: F.italic, fontStyle: "italic",
                  fontSize: "1.15rem", color: C.taupe }}>
                  {post.read} read
                </span>
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1rem",
                color: C.charcoal, lineHeight: 1.4, marginBottom: "0.75rem" }}>
                {post.title}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "1.02rem", color: C.taupe,
                lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 300 }}>
                {post.excerpt}
              </p>
              <span style={{ fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
                color: C.charcoal, letterSpacing: "0.05em", display: "inline-flex",
                alignItems: "center", gap: "4px",
                borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "1px" }}>
                Read Article <ChevronRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ──────────────────────────────────────────────────────────── */
function AboutSection() {
  const values = [
    { label: "Integrity",   desc: "Honest pricing, transparent lead times, and commitments we keep." },
    { label: "Reliability", desc: "Consistent quality across every batch, every order, every time." },
    { label: "Quality",     desc: "BIS-aligned raw materials and rigorous in-house testing on every production run." },
  ];

  return (
    <section id="about" style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="about-grid" style={{ display: "flex", gap: "5rem", alignItems: "flex-start" }}>

          {/* Left */}
          <div className="sr-left" style={{ flex: "1 1 55%", position: "relative" }}>
            <div style={{
              position: "absolute", top: "-10px", left: "-10px",
              fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(6rem, 14vw, 11rem)",
              color: C.charcoal, opacity: 0.03, lineHeight: 1,
              userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
            }}>
              1995
            </div>

            <span className="eyebrow">Our Story</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.9rem, 3.5vw, 3rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "2rem" }}>
              Three Decades of<br />
              <em style={{ fontWeight: 400 }}>Packaging Excellence.</em>
            </h2>

            <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
              color: C.taupe, marginBottom: "1.25rem", fontWeight: 300 }}>
              Founded in 1995 by Managing Director{" "}
              <strong style={{ color: C.charcoal, fontWeight: 600 }}>Umesh Sahu</strong>,
              Pune Global Group has been a trusted paper and board trader in Pune,
              Maharashtra — supplying corrugators, printers and box makers with ITC, TNPL
              and imported grades. Over three decades, we built in-house converting
              capabilities: sheeting, rewinding and slitting so customers get
              cut-to-size stock with fast turnaround and low MOQ.
            </p>

            <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
              color: C.taupe, marginBottom: "2.5rem", fontWeight: 300 }}>
              Today we operate from our converting facility at BU Bhandari MIDC, Sanaswadi,
              and our commercial office in Gulmohar Center Point, Pune — serving
              500+ clients across India.
            </p>

            {/* Pull quote */}
            <div style={{ borderLeft: `3px solid ${C.saffron}`, paddingLeft: "1.5rem",
              marginBottom: "2.5rem" }}>
              <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "1.1rem",
                lineHeight: 1.7, color: C.warm }}>
                &ldquo;The right paper grade, cut to size, delivered on time — that is the
                foundation everything else is built on.&rdquo;
              </p>
              <span style={{ fontFamily: F.body, fontSize: "1.15rem", color: C.taupe,
                letterSpacing: "0.04em", marginTop: "8px", display: "block" }}>
                — Umesh Sahu, Managing Director
              </span>
            </div>

            <Link href="/infrastructure" className="btn-outline" style={{ textDecoration: "none" }}>
              Our Converting Facility <ArrowRight size={13} />
            </Link>
          </div>

          {/* Right — key figures card */}
          <div className="sr-right" style={{ flex: "0 0 340px" }}>
            <div style={{
              background: C.parchment, border: `1px solid ${C.borderMid}`,
              borderTop: `3px solid ${C.saffron}`, padding: "2.5rem",
            }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                color: C.taupe, letterSpacing: "0.14em", textTransform: "uppercase",
                display: "block", marginBottom: "1.5rem" }}>
                Key Figures
              </span>

              {[
                { stat: "1995", label: "Year Established" },
                { stat: "500+", label: "Active Clients" },
                { stat: "40+",  label: "Paper Grades in Stock" },
                { stat: "2",    label: "Locations — Pune" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", padding: "0.85rem 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontFamily: F.body, fontWeight: 400,
                    fontSize: "1.1rem", color: C.warm }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: F.display, fontWeight: 700,
                    fontSize: "1.5rem", color: C.saffron }}>
                    {item.stat}
                  </span>
                </div>
              ))}

              {/* Values */}
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                color: C.taupe, letterSpacing: "0.14em", textTransform: "uppercase",
                display: "block", marginBottom: "1rem", marginTop: "2rem" }}>
                Our Values
              </span>
              {values.map((v) => (
                <div key={v.label} style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.9rem",
                }}>
                  <CheckCircle size={15} style={{ color: C.saffron, marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "1.08rem",
                      color: C.charcoal, marginBottom: "2px" }}>
                      {v.label}
                    </div>
                    <div style={{ fontFamily: F.body, fontSize: "0.98rem", color: C.taupe,
                      lineHeight: 1.6, fontWeight: 300 }}>
                      {v.desc}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Contact Section ────────────────────────────────────────────────────────── */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    try {
      await addDoc(collection(db, "contacts"), {
        name: form.name, email: form.email, phone: form.phone,
        message: form.message, createdAt: serverTimestamp(), source: "website",
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const contactItems = [
    { icon: <Phone size={16} color={C.saffron} />, label: "Phone",
      value: "+91 98233 83230", href: "tel:+919823383230" },
    { icon: <Mail size={16} color={C.saffron} />, label: "Email",
      value: "contact.puneglobalgroup@gmail.com", href: "mailto:contact.puneglobalgroup@gmail.com" },
    { icon: <MapPin size={16} color={C.saffron} />, label: "Office",
      value: "206 Gulmohar Center Point, Pune 411006, Maharashtra", href: null },
    { icon: <Factory size={16} color={C.saffron} />, label: "Factory",
      value: "108 BU Bhandari MIDC, Sanaswadi 412208, Pune", href: null },
  ];

  return (
    <section id="contact" style={{ background: C.parchment, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Get In Touch</span>
          <h2 style={{ fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C.charcoal,
            letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Start Your Packaging Project.
          </h2>
        </div>

        <div className="contact-grid" style={{ display: "flex", gap: "4rem", alignItems: "flex-start" }}>

          {/* Contact info */}
          <div className="sr-left" style={{ flex: "1 1 40%" }}>
            <div style={{ background: C.cream, border: `1px solid ${C.borderMid}`, padding: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px",
                paddingBottom: "1.5rem", borderBottom: `2px solid ${C.saffron}`, marginBottom: "2rem" }}>
                <TuriyaLogo size={34} />
                <div>
                  <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "1.1rem",
                    color: C.charcoal, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Pune Global Group
                  </div>
                  <div style={{ fontFamily: F.italic, fontStyle: "italic",
                    fontSize: "0.98rem", color: C.taupe }}>
                    Paper &amp; PP Packaging Solutions
                  </div>
                </div>
              </div>

              {contactItems.map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "1rem",
                  alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div style={{ width: "34px", height: "34px",
                    background: "rgba(212,134,14,0.08)", borderRadius: "1px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
                      color: C.saffron, textTransform: "uppercase", letterSpacing: "0.08em",
                      marginBottom: "3px" }}>
                      {item.label}
                    </div>
                    {item.href ? (
                      <a href={item.href} style={{ fontFamily: F.body, fontSize: "1.1rem",
                        color: C.charcoal, lineHeight: 1.5, transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.charcoal)}>
                        {item.value}
                      </a>
                    ) : (
                      <div style={{ fontFamily: F.body, fontSize: "1.1rem",
                        color: C.charcoal, lineHeight: 1.5 }}>
                        {item.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: `1px solid ${C.border}`,
                fontFamily: F.italic, fontStyle: "italic", fontSize: "1.02rem",
                color: C.taupe, lineHeight: 1.6 }}>
                Monday – Saturday · 9:30 AM – 6:30 PM IST
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="sr-right" style={{ flex: "1 1 55%" }}>
            <div style={{ background: C.cream, border: `1px solid ${C.borderMid}`,
              borderTop: `3px solid ${C.charcoal}`, padding: "2.5rem" }}>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.4rem",
                color: C.charcoal, marginBottom: "0.5rem" }}>
                Request a Quote
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "1.08rem", color: C.taupe,
                lineHeight: 1.65, marginBottom: "2rem", fontWeight: 300 }}>
                Share your packaging requirements and our team will respond within one business day.
              </p>

              {status === "success" ? (
                <div style={{ background: "rgba(212,134,14,0.06)", border: `1px solid rgba(212,134,14,0.25)`,
                  padding: "2rem", textAlign: "center" }}>
                  <CheckCircle size={38} style={{ color: C.saffron, marginBottom: "1rem" }} />
                  <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.15rem",
                    color: C.charcoal, marginBottom: "0.5rem" }}>
                    Message Received
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: "1.1rem", color: C.taupe,
                    lineHeight: 1.6, fontWeight: 300 }}>
                    Thank you for reaching out. We will respond within one business day.
                  </div>
                  <button className="btn-primary" style={{ marginTop: "1.5rem" }}
                    onClick={() => setStatus("idle")}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                        fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: "6px" }}>
                        Name <span style={{ color: C.saffron }}>*</span>
                      </label>
                      <input type="text" className="form-input" placeholder="Your full name"
                        value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                        fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: "6px" }}>
                        Phone
                      </label>
                      <input type="tel" className="form-input" placeholder="+91 XXXXX XXXXX"
                        value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                      fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                      textTransform: "uppercase", marginBottom: "6px" }}>
                      Email <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <input type="email" className="form-input" placeholder="your@email.com"
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                      fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                      textTransform: "uppercase", marginBottom: "6px" }}>
                      Message <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <textarea className="form-input" rows={5}
                      placeholder="Describe your packaging requirements — product type, quantity, dimensions, material preferences..."
                      value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      required style={{ resize: "vertical", minHeight: "130px" }} />
                  </div>

                  {status === "error" && (
                    <div style={{ background: "rgba(180,30,30,0.05)", border: "1px solid rgba(180,30,30,0.2)",
                      padding: "11px 15px", fontFamily: F.body, fontSize: "0.86rem", color: "#B41E1E" }}>
                      Something went wrong. Please try again or call us directly.
                    </div>
                  )}

                  <button type="submit" className="btn-primary"
                    disabled={status === "submitting"}
                    style={{ alignSelf: "flex-start", opacity: status === "submitting" ? 0.7 : 1 }}>
                    {status === "submitting"
                      ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                      : <>Send Request <ArrowRight size={14} /></>}
                  </button>

                  <p style={{ fontFamily: F.italic, fontStyle: "italic",
                    fontSize: "1.15rem", color: C.taupe, opacity: 0.7 }}>
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

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
function Footer() {
  const productLinks = [
    { label: "ITC Paper & Boards", href: "/products/itc-fbb-boards/" },
    { label: "PP Boxes & Sheets",  href: "/products/pp-foldable-boxes/" },
    { label: "Duplex Boards",      href: "/products/duplex-board/" },
    { label: "Kraft Liner",        href: "/products/kraft-liner/" },
  ];
  const industryLinks = [
    { label: "Automotive",     href: "/#industries" },
    { label: "Pharmaceutical", href: "/#industries" },
    { label: "E-Commerce",     href: "/#industries" },
    { label: "FMCG",           href: "/#industries" },
    { label: "Engineering",    href: "/#industries" },
  ];
  const companyLinks = [
    { label: "About Us",    href: "/#about" },
    { label: "Contact",     href: "/#contact" },
    { label: "Get a Quote", href: "/#contact" },
  ];

  return (
    <footer style={{ background: C.dark, padding: "70px clamp(1.5rem, 5vw, 4rem) 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="footer-grid" style={{
          display: "flex", gap: "4rem",
          paddingBottom: "3rem", borderBottom: `1px solid rgba(250,247,242,0.08)`,
        }}>
          <div style={{ flex: "0 0 300px" }}>
            <Logo inverted />
            <p style={{ fontFamily: F.body, fontSize: "0.86rem",
              color: "rgba(250,247,242,0.55)", lineHeight: 1.8,
              marginTop: "1.25rem", maxWidth: "260px", fontWeight: 300 }}>
              Paper trading, converting and PP packaging solutions from Pune since 1995.
              ITC, TNPL &amp; imported grades in ready stock.
            </p>
            <a href="tel:+919823383230" style={{ display: "inline-flex",
              alignItems: "center", gap: "6px", marginTop: "1.5rem",
              fontFamily: F.body, fontSize: "0.82rem",
              color: "rgba(250,247,242,0.75)", textDecoration: "none" }}>
              <Phone size={13} /> +91 98233 83230
            </a>
          </div>

          <div className="footer-cols" style={{ display: "flex", gap: "3rem", flex: 1, justifyContent: "flex-end" }}>
            <div>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
                color: "rgba(250,247,242,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem" }}>
                Products
              </div>
              {productLinks.map(({ label, href }) => (
                <Link key={label} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
                color: "rgba(250,247,242,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem" }}>
                Industries
              </div>
              {industryLinks.map(({ label, href }) => (
                <Link key={label} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
                color: "rgba(250,247,242,0.4)", letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: "1.25rem" }}>
                Company
              </div>
              {companyLinks.map(({ label, href }) => (
                <Link key={label} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
              <div style={{ marginTop: "1.5rem" }}>
                <a href="mailto:contact.puneglobalgroup@gmail.com"
                  style={{ display: "flex", alignItems: "center", gap: "6px",
                    fontFamily: F.body, fontSize: "0.76rem",
                    color: "rgba(250,247,242,0.55)", transition: "color 0.2s", marginBottom: "0.5rem" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.cream)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,247,242,0.55)")}>
                  <Mail size={12} /> contact.puneglobalgroup@gmail.com
                </a>
                <div style={{ fontFamily: F.body, fontSize: "0.76rem",
                  color: "rgba(250,247,242,0.55)",
                  display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <MapPin size={12} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span>206 Gulmohar Center Point,<br />Pune 411006</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "1rem", padding: "1.5rem 0" }}>
          <div style={{ fontFamily: F.body, fontSize: "0.76rem",
            color: "rgba(250,247,242,0.38)" }}>
            © {new Date().getFullYear()} Pune Global Group. All rights reserved.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px",
            fontFamily: F.body, fontSize: "0.73rem", color: "rgba(250,247,242,0.38)" }}>
            <span>GSTIN:</span>
            <span style={{ fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>
              27FYYPS5999K1ZO
            </span>
            <span style={{ color: "rgba(250,247,242,0.12)", margin: "0 4px" }}>|</span>
            <span>Pune, Maharashtra, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  useScrollReveal();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <style dangerouslySetInnerHTML={{ __html:
        `@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }` }} />
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
