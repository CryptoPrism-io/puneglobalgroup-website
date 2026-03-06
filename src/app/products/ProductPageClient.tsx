"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { products, Product } from "@/lib/pgg-data";
import { SiteLogo } from "@/components/SiteLogo";

// ————————————————————————————————————————————
// The Merchant — Design Tokens (Dark Theme)
// ————————————————————————————————————————————
const PP_THEME = {
  bg: "#111216",
  bgAlt: "#14161C",
  bgDeep: "#0C1424",
  accent: "#5B9BD5",
  accentLight: "rgba(91,155,213,0.10)",
  text: "#FAF7F2",
  textMuted: "rgba(250,247,242,0.60)",
  textFaint: "rgba(250,247,242,0.40)",
  border: "rgba(250,247,242,0.08)",
  borderMid: "rgba(250,247,242,0.14)",
};

const PAPER_THEME = {
  bg: "#1A2A1E",
  bgAlt: "#1F2D22",
  bgDeep: "#152119",
  accent: "#C8B89A",
  accentLight: "rgba(200,184,154,0.10)",
  text: "#FAF7F2",
  textMuted: "rgba(250,247,242,0.60)",
  textFaint: "rgba(250,247,242,0.40)",
  border: "rgba(250,247,242,0.08)",
  borderMid: "rgba(250,247,242,0.14)",
};

type Theme = typeof PP_THEME;

function getTheme(category: string): Theme {
  return category === "PP Packaging" ? PP_THEME : PAPER_THEME;
}

// Static tokens that don't change per theme
const C = {
  cream: "#FAF7F2",
  saffron: "#F5A623",
};

const F = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
  italic: "'Cormorant Garamond', Georgia, serif",
};

// ————————————————————————————————————————————
// Framer Motion Shared Config
// ————————————————————————————————————————————
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpViewport = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
};

function buildGlobalCSS(T: Theme) {
  return `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${T.bg}; }

  @keyframes ruleGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .prod-nav-link {
    font-family: 'DM Sans', sans-serif;
    color: ${T.text};
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  .prod-nav-link:hover { opacity: 1; }

  .app-card {
    background: ${T.bgAlt};
    border: 1px solid ${T.border};
    border-left: 3px solid ${T.accent};
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: ${T.text};
    line-height: 1.5;
    transition: border-left-color 0.2s ease;
  }
  .app-card:hover { border-left-color: ${C.saffron}; }

  .related-card {
    background: ${T.bgAlt};
    border: 1px solid ${T.border};
    border-radius: 4px;
    padding: 0;
    text-decoration: none;
    display: block;
    overflow: hidden;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .related-card:hover {
    border-color: ${T.borderMid};
    box-shadow: 0 10px 28px rgba(0,0,0,0.35);
  }
  .related-card-img {
    width: 100%; height: 160px; object-fit: cover; display: block;
    transition: transform 0.45s ease;
  }
  .related-card:hover .related-card-img { transform: scale(1.04); }
  .related-card-body { padding: 1rem 1.25rem 1.25rem; }
  .related-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }

  /* 3D emboss CTA buttons */
  .btn-cta-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(180deg, ${T.accent} 0%, color-mix(in srgb, ${T.accent} 75%, #000) 100%);
    color: ${T.bg}; text-decoration: none;
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 600;
    padding: 0.85rem 1.75rem; border-radius: 4px; border: none;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 0 color-mix(in srgb, ${T.accent} 50%, #000), 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    text-shadow: 0 1px 0 rgba(255,255,255,0.15);
    cursor: pointer;
  }
  .btn-cta-primary:hover {
    background: linear-gradient(180deg, color-mix(in srgb, ${T.accent} 80%, #fff) 0%, ${T.accent} 100%);
    box-shadow: 0 3px 0 color-mix(in srgb, ${T.accent} 50%, #000), 0 6px 20px color-mix(in srgb, ${T.accent} 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.35);
    transform: translateY(-2px);
  }
  .btn-cta-primary:active { transform: translateY(1px); box-shadow: 0 1px 0 color-mix(in srgb, ${T.accent} 50%, #000), 0 2px 4px rgba(0,0,0,0.2); }

  .btn-cta-outline {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(250,247,242,0.06); color: ${T.text}; text-decoration: none;
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 400;
    padding: 0.85rem 1.75rem; border-radius: 4px;
    border: 1px solid ${T.borderMid};
    box-shadow: 0 2px 0 rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(250,247,242,0.08);
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    cursor: pointer;
  }
  .btn-cta-outline:hover {
    background: rgba(250,247,242,0.14); border-color: rgba(250,247,242,0.35);
    box-shadow: 0 3px 0 rgba(0,0,0,0.25), 0 6px 16px rgba(250,247,242,0.08), inset 0 1px 0 rgba(250,247,242,0.12);
    transform: translateY(-2px);
  }
  .btn-cta-outline:active { transform: translateY(1px); box-shadow: 0 1px 0 rgba(0,0,0,0.2); }
  @media(max-width: 640px) { .related-grid { grid-template-columns: 1fr 1fr; } }

  /* === Mobile responsive === */
  @media(max-width: 768px) {
    .prod-hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .prod-main-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .prod-apps-grid { grid-template-columns: 1fr 1fr !important; }
    .prod-nav { padding: 0 1rem !important; }
    .prod-breadcrumb { overflow-x: auto; white-space: nowrap; }
  }
  @media(max-width: 480px) {
    .prod-apps-grid { grid-template-columns: 1fr !important; }
    .related-grid { grid-template-columns: 1fr 1fr !important; }
    .prod-cta-inner { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
  }
  @media(max-width: 360px) {
    .related-grid { grid-template-columns: 1fr !important; }
  }
`;
}

// ————————————————————————————————————————————
// Navbar
// ————————————————————————————————————————————
function SubpageNav({ T }: { T: Theme }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className="prod-nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? `${T.bg}cc` : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
        borderBottom: `1px solid ${scrolled ? T.borderMid : "transparent"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(1rem, 3vw, 2.5rem)",
        height: "64px",
        transition: "border-color 0.3s ease, background 0.3s ease",
      }}
    >
      <Link
        href="/products"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "none",
        }}
      >
        <span style={{ color: T.textFaint, fontSize: "0.9rem" }}>&#8592;</span>
        <span
          style={{
            fontFamily: F.body,
            fontWeight: 500,
            color: T.text,
            fontSize: "0.875rem",
            opacity: 0.8,
          }}
        >
          All Products
        </span>
      </Link>

      <SiteLogo href="/" inverted />

      <a href="/#contact" className="btn-cta-primary" style={{ fontSize: "0.82rem", padding: "0.5rem 1.25rem" }}>
        Get a Quote
      </a>
    </nav>
  );
}

// ————————————————————————————————————————————
// Product Hero Image Carousel
// ————————————————————————————————————————————
function ProductHeroCarousel({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const t = setInterval(() => setIdx(c => (c + 1) % images.length), 1500);
    return () => clearInterval(t);
  }, [paused, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        maxHeight: "380px",
        cursor: "pointer",
      }}
    >
      {images.map((src, j) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={src}
          src={src}
          alt={`${name} — view ${j + 1}`}
          style={{
            width: "100%",
            height: "380px",
            objectFit: "cover",
            display: "block",
            position: j === 0 ? "relative" : "absolute",
            top: 0,
            left: 0,
            opacity: j === idx ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}
        />
      ))}

      {/* Dot navigation */}
      {images.length > 1 && (
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
          zIndex: 2,
        }}>
          {images.map((_, j) => (
            <button
              key={j}
              onClick={() => setIdx(j)}
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: j === idx ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "background 0.25s, transform 0.25s",
                transform: j === idx ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}

      {/* Pause badge */}
      {paused && images.length > 1 && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: "rgba(0,0,0,0.55)",
          color: "rgba(250,247,242,0.85)",
          padding: "3px 8px",
          borderRadius: "99px",
          backdropFilter: "blur(4px)",
        }}>
          Paused
        </div>
      )}
    </motion.div>
  );
}

// ————————————————————————————————————————————
// Category Tag
// ————————————————————————————————————————————
function CategoryTag({ category, T }: { category: string; T: Theme }) {
  return (
    <span
      style={{
        fontFamily: F.body,
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background: T.accentLight,
        color: T.accent,
        padding: "0.28rem 0.7rem",
        borderRadius: "2px",
        border: `1px solid ${T.borderMid}`,
        display: "inline-block",
      }}
    >
      {category}
    </span>
  );
}

// ————————————————————————————————————————————
// Product Page Content
// ————————————————————————————————————————————
function ProductPageContent({ product }: { product: Product }) {
  const T = getTheme(product.category);

  return (
    <div className="section-dark" style={{ background: T.bg, minHeight: "100vh" }}>
      <SubpageNav T={T} />

      {/* ——— Hero ——— */}
      <section
        style={{
          background: T.bgDeep,
          padding: "4.5rem 2.5rem 4rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* Paper grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.04 }} aria-hidden>
          <filter id="grain-prod"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-prod)" />
        </svg>

        {/* Breadcrumb — slide in from left */}
        {(() => {
          const isPP = product.category === "PP Packaging";
          const catLabel = isPP ? "PP Corrugated Systems" : "Paper & Board Grades";
          const catHref  = isPP ? "/products/pp-corrugated" : "/products/paper-board";
          const sep = <span style={{ color: T.textFaint, margin: "0 0.35rem", fontSize: "0.7rem" }}>&rsaquo;</span>;
          const lk: React.CSSProperties = { fontFamily: F.body, fontSize: "0.72rem", color: T.textFaint, textDecoration: "none" };
          return (
            <motion.nav
              aria-label="breadcrumb"
              className="prod-breadcrumb"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ position: "relative", maxWidth: "1100px", margin: "0 auto 1.75rem", display: "flex", alignItems: "center" }}
            >
              <Link href="/" style={lk}>Home</Link>{sep}
              <Link href="/products" style={lk}>Products</Link>{sep}
              <Link href={catHref} style={lk}>{catLabel}</Link>{sep}
              <span style={{ fontFamily: F.body, fontSize: "0.72rem", color: T.text, fontWeight: 500 }}>{product.name}</span>
            </motion.nav>
          );
        })()}

        <div
          className="prod-hero-grid"
          style={{
            position: "relative",
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: (product.images?.length || product.image) ? "1fr 1fr" : "1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            {/* Category badge — staggered fade-up 0.3s */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
              style={{ marginBottom: "1.25rem" }}
            >
              <CategoryTag category={product.category} T={T} />
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              style={{
                width: "48px",
                height: "2px",
                background: T.accent,
                marginBottom: "1.25rem",
                transformOrigin: "left",
              }}
            />

            {/* Product name — staggered fade-up 0.2s */}
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              style={{
                fontFamily: F.display,
                fontSize: "clamp(2rem, 4.5vw, 3.1rem)",
                fontWeight: 700,
                color: T.text,
                margin: "0 0 1rem",
                lineHeight: 1.1,
              }}
            >
              {product.name}
            </motion.h1>

            {/* Description — staggered fade-up 0.5s */}
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              style={{
                fontFamily: F.body,
                fontSize: "1rem",
                color: T.textMuted,
                margin: "0 0 2rem",
                lineHeight: 1.7,
                maxWidth: "520px",
              }}
            >
              {product.tagline}
            </motion.p>

            {/* Key spec pills */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "2rem",
              }}
            >
              {product.gsmRange && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: T.text, background: T.bgAlt, border: `1px solid ${T.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: T.accent, fontWeight: 700 }}>GSM: </span>{product.gsmRange}
                </div>
              )}
              {product.thickness && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: T.text, background: T.bgAlt, border: `1px solid ${T.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: T.accent, fontWeight: 700 }}>Thickness: </span>{product.thickness}
                </div>
              )}
              {product.surfaceResistivity && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: T.text, background: T.bgAlt, border: `1px solid ${T.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: T.accent, fontWeight: 700 }}>Resistivity: </span>{product.surfaceResistivity}
                </div>
              )}
              {product.origin && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: T.text, background: T.bgAlt, border: `1px solid ${T.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: T.accent, fontWeight: 700 }}>Origin: </span>{product.origin}
                </div>
              )}
              {product.certifications && product.certifications.map((cert) => (
                <div key={cert} style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 600, color: T.text, background: T.accentLight, border: `1px solid ${T.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  {cert}
                </div>
              ))}
            </motion.div>

            {/* CTA buttons — fade up with delay after surrounding content */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <a href="/#contact" className="btn-cta-primary">
                Enquire Now &rarr;
              </a>
              <a href="/#contact" className="btn-cta-outline">
                Request Sample
              </a>
            </motion.div>
          </div>

          {(product.images?.length || product.image) && (
            <ProductHeroCarousel
              images={product.images?.length ? product.images : [product.image!]}
              name={product.name}
            />
          )}
        </div>
      </section>

      {/* ——— Brands / Variants Banner ——— */}
      {(product.brands || product.variants) && (
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}`, padding: "1.25rem 2.5rem" }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.body, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textFaint }}>
              {product.brands ? "Available Brands:" : "Variants:"}
            </span>
            {(product.brands || product.variants || []).map((item) => (
              <span key={item} style={{ fontFamily: F.body, fontSize: "0.82rem", fontWeight: 500, color: T.text, background: T.accentLight, border: `1px solid ${T.border}`, padding: "0.28rem 0.7rem", borderRadius: "2px" }}>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ——— Main Content ——— */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>
        <div className="prod-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem" }}>
          {/* Features — scroll-triggered stagger */}
          <motion.section
            {...fadeUpViewport}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <h2
              style={{
                fontFamily: F.display,
                fontSize: "1.65rem",
                fontWeight: 700,
                color: T.text,
                margin: "0 0 1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: `1px solid ${T.borderMid}`,
              }}
            >
              Key Features
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {product.features.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    fontFamily: F.body,
                    fontSize: "0.9rem",
                    color: T.textMuted,
                    lineHeight: 1.65,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "20px",
                      height: "20px",
                      background: T.accentLight,
                      color: T.accent,
                      borderRadius: "50%",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    &#10003;
                  </span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* Applications — scroll-triggered stagger */}
          <motion.section
            {...fadeUpViewport}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <h2
              style={{
                fontFamily: F.display,
                fontSize: "1.65rem",
                fontWeight: 700,
                color: T.text,
                margin: "0 0 1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: `1px solid ${T.borderMid}`,
              }}
            >
              Applications
            </h2>
            <div className="prod-apps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {product.applications.map((app, i) => (
                <motion.div
                  key={i}
                  className="app-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                >
                  {app}
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Specs Table — scroll-triggered, rows stagger */}
        <motion.section
          {...fadeUpViewport}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ marginTop: "3.5rem" }}
        >
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "1.65rem",
              fontWeight: 700,
              color: T.text,
              margin: "0 0 1.5rem",
              paddingBottom: "0.75rem",
              borderBottom: `1px solid ${T.borderMid}`,
            }}
          >
            Technical Specifications
          </h2>
          <div style={{ background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: "6px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
              <tbody>
                {product.specsTable.map((spec, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                    style={{
                      borderBottom: i < product.specsTable.length - 1 ? `1px solid ${T.border}` : "none",
                      background: i % 2 === 0 ? T.bgAlt : T.bgDeep,
                    }}
                  >
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.78rem", fontWeight: 600, color: T.textFaint, width: "40%", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {spec.label}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.88rem", fontWeight: 500, color: T.text }}>
                      {spec.value}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Export Compliance — scroll-triggered stagger */}
        <motion.section
          {...fadeUpViewport}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ marginTop: "3rem" }}
        >
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "1.65rem",
              fontWeight: 700,
              color: T.text,
              margin: "0 0 1.5rem",
              paddingBottom: "0.75rem",
              borderBottom: `1px solid ${T.borderMid}`,
            }}
          >
            Export Compliance &amp; Certifications
          </h2>
          <div
            style={{
              background: T.bgAlt,
              border: `1px solid ${T.border}`,
              borderRadius: "6px",
              padding: "1.75rem 2rem",
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {product.exportCompliance.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    fontFamily: F.body,
                    fontSize: "0.9rem",
                    color: T.textMuted,
                    lineHeight: 1.65,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "20px",
                      height: "20px",
                      background: T.accentLight,
                      color: T.accent,
                      borderRadius: "50%",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    &#10003;
                  </span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Related Products — cards stagger on scroll with spring hover */}
        {(() => {
          const related = products
            .filter(p => p.category === product.category && p.slug !== product.slug)
            .slice(0, 3);
          if (related.length === 0) return null;
          const isPP = product.category === "PP Packaging";
          const sectionLabel = isPP ? "More PP Systems" : "More Board Grades";
          const sectionHref  = isPP ? "/products/pp-corrugated" : "/products/paper-board";
          return (
            <motion.section
              {...fadeUpViewport}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ marginTop: "3.5rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div>
                  <p style={{ display: "inline-block", fontFamily: F.body, fontStyle: "normal", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textFaint, border: `1px solid ${T.border}`, borderRadius: "999px", padding: "0.3em 1em", margin: "0 0 0.6rem" }}>You may also like</p>
                  <h3 style={{ fontFamily: F.display, fontSize: "1.35rem", fontWeight: 700, color: T.text, margin: 0 }}>{sectionLabel}</h3>
                </div>
                <Link href={sectionHref} style={{ fontFamily: F.body, fontSize: "0.76rem", fontWeight: 500, color: T.accent, textDecoration: "none", borderBottom: `1px solid ${T.borderMid}`, paddingBottom: "1px", whiteSpace: "nowrap" }}>
                  View all &rarr;
                </Link>
              </div>
              <div className="related-grid">
                {related.map((p, i) => {
                  const thumb = (p.images?.[0]) ?? p.image ?? null;
                  return (
                    <motion.div
                      key={p.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                      whileHover={{ y: -3, scale: 1.015, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                    >
                      <Link href={p.category === "Paper & Board" ? `/products/paper-board/${p.slug}` : `/products/pp-corrugated/${p.slug}`} className="related-card">
                        {thumb && (
                          <div style={{ overflow: "hidden" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb} alt={p.name} className="related-card-img" />
                          </div>
                        )}
                        <div className="related-card-body">
                          <p style={{ fontFamily: F.body, fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textFaint, margin: "0 0 0.4rem" }}>{p.category}</p>
                          <h4 style={{ fontFamily: F.display, fontSize: "1rem", fontWeight: 600, color: T.text, margin: "0 0 0.35rem", lineHeight: 1.25 }}>{p.name}</h4>
                          <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: T.textMuted, margin: 0, lineHeight: 1.5 }}>{p.tagline}</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })()}

        {/* CTA — scroll-triggered fade-up */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="prod-cta-inner"
          style={{
            marginTop: "3.5rem",
            background: T.bgDeep,
            borderRadius: "6px",
            border: `1px solid ${T.borderMid}`,
            padding: "3.5rem 3rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ display: "inline-block", fontFamily: F.body, fontStyle: "normal", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, border: `1px solid ${T.borderMid}`, borderRadius: "999px", padding: "0.3em 1em", margin: "0 0 0.9rem" }}>
              Ready to proceed?
            </p>
            <h3 style={{ fontFamily: F.display, fontSize: "1.65rem", fontWeight: 700, color: C.cream, margin: "0 0 0.875rem", lineHeight: 1.2 }}>
              Request a Sample or Quotation
            </h3>
            <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: T.textFaint, margin: 0, lineHeight: 1.7 }}>
              Share your application requirements and we will send you a sample with full technical
              documentation — COA, FSC certificate, and food contact declarations where applicable.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}
          >
            <a href="/#contact" className="btn-cta-primary" style={{ whiteSpace: "nowrap" }}>
              Request Sample &rarr;
            </a>
            <a
              href={`mailto:yogesh.sahu@puneglobalgroup.in?subject=Enquiry: ${product.name}`}
              style={{ fontFamily: F.body, fontSize: "0.8rem", color: T.textFaint, textDecoration: "none", textAlign: "center" }}
            >
              yogesh.sahu@puneglobalgroup.in
            </a>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer style={{ background: T.bgDeep, borderTop: `1px solid ${T.border}`, padding: "2rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/products" style={{ fontFamily: F.body, fontSize: "0.78rem", color: T.textFaint, textDecoration: "none" }}>
            &#8592; All Products
          </Link>
          <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: T.textFaint, margin: 0 }}>
            &copy; {new Date().getFullYear()} Pune Global Group &middot; GSTIN 27FYYPS5999K1ZO &middot; +91 98233 83230
          </p>
          <a href="mailto:yogesh.sahu@puneglobalgroup.in" style={{ fontFamily: F.body, fontSize: "0.78rem", color: T.textFaint, textDecoration: "none" }}>
            yogesh.sahu@puneglobalgroup.in
          </a>
        </div>
      </footer>
    </div>
  );
}

// ————————————————————————————————————————————
// Main exported client component
// ————————————————————————————————————————————
export default function ProductPageClient({ slug }: { slug: string }) {
  const product = products.find((p) => p.slug === slug);
  const T = product ? getTheme(product.category) : PP_THEME;

  return (
    <>
      <style>{buildGlobalCSS(T)}</style>
      {product ? (
        <ProductPageContent product={product} />
      ) : (
        <div
          className="section-dark"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: T.bg,
            fontFamily: F.body,
            gap: "1rem",
          }}
        >
          <SubpageNav T={T} />
          <h1 style={{ fontFamily: F.display, fontSize: "2.5rem", color: T.text, margin: 0 }}>Product Not Found</h1>
          <Link
            href="/products"
            style={{
              fontFamily: F.body,
              background: T.accent,
              color: T.bg,
              textDecoration: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "3px",
              fontWeight: 500,
            }}
          >
            &#8592; View All Products
          </Link>
        </div>
      )}
    </>
  );
}
