"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { products, Product } from "@/lib/pgg-data";
import { SiteLogo } from "@/components/SiteLogo";

// ————————————————————————————————————————————
// The Merchant — Design Tokens
// ————————————————————————————————————————————
const C = {
  cream: "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal: "#1C1A17",
  warm: "#4A4540",
  taupe: "#7A736D",
  saffron: "#F5A623",
  dark: "#141210",
  border: "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};

const F = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
  italic: "'Cormorant Garamond', Georgia, serif",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #FAF7F2; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ruleGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .sr { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }

  .prod-nav-link {
    font-family: 'DM Sans', sans-serif;
    color: ${C.charcoal};
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  .prod-nav-link:hover { opacity: 1; }

  .app-card {
    background: #fff;
    border: 1px solid ${C.border};
    border-left: 3px solid ${C.charcoal};
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: ${C.charcoal};
    line-height: 1.5;
    transition: border-left-color 0.2s ease;
  }
  .app-card:hover { border-left-color: ${C.saffron}; }

  .related-card {
    background: #fff;
    border: 1px solid ${C.border};
    border-radius: 4px;
    padding: 1.25rem;
    text-decoration: none;
    display: block;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .related-card:hover {
    border-color: ${C.borderMid};
    box-shadow: 0 8px 24px rgba(28,26,23,0.07);
  }
`;

// ————————————————————————————————————————————
// Scroll reveal
// ————————————————————————————————————————————
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ————————————————————————————————————————————
// Navbar
// ————————————————————————————————————————————
function SubpageNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(250,247,242,0.97)" : C.cream,
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${scrolled ? C.borderMid : C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
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
        <span style={{ color: C.taupe, fontSize: "0.9rem" }}>←</span>
        <span
          style={{
            fontFamily: F.body,
            fontWeight: 500,
            color: C.charcoal,
            fontSize: "0.875rem",
            opacity: 0.8,
          }}
        >
          All Products
        </span>
      </Link>

      <SiteLogo href="/" />

      <a
        href="/#contact"
        style={{
          fontFamily: F.body,
          background: C.charcoal,
          color: C.cream,
          textDecoration: "none",
          fontSize: "0.82rem",
          fontWeight: 500,
          padding: "0.5rem 1.25rem",
          borderRadius: "3px",
          letterSpacing: "0.03em",
        }}
      >
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
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(28,26,23,0.12)",
        maxHeight: "380px",
        animation: "fadeUp 0.8s ease 0.3s both",
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
          background: "rgba(28,26,23,0.55)",
          color: "rgba(250,247,242,0.85)",
          padding: "3px 8px",
          borderRadius: "99px",
          backdropFilter: "blur(4px)",
        }}>
          Paused
        </div>
      )}
    </div>
  );
}

// ————————————————————————————————————————————
// Category Tag
// ————————————————————————————————————————————
function CategoryTag({ category }: { category: string }) {
  const isPP = category === "PP Packaging";
  return (
    <span
      style={{
        fontFamily: F.body,
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background: isPP ? "rgba(139,26,26,0.1)" : "rgba(212,134,14,0.1)",
        color: isPP ? "#8B1A1A" : C.saffron,
        padding: "0.28rem 0.7rem",
        borderRadius: "2px",
        border: `1px solid ${isPP ? "rgba(139,26,26,0.2)" : "rgba(212,134,14,0.25)"}`,
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
  useScrollReveal();

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* ——— Hero ——— */}
      <section
        style={{
          background: C.cream,
          padding: "4.5rem 2.5rem 4rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Paper grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.035 }} aria-hidden>
          <filter id="grain-prod"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-prod)" />
        </svg>

        <div
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
            <div style={{ marginBottom: "1.25rem", animation: "fadeUp 0.6s ease both" }}>
              <CategoryTag category={product.category} />
            </div>

            <div
              style={{
                width: "48px",
                height: "2px",
                background: C.charcoal,
                marginBottom: "1.25rem",
                transformOrigin: "left",
                animation: "ruleGrow 0.5s ease 0.15s both",
              }}
            />

            <h1
              style={{
                fontFamily: F.display,
                fontSize: "clamp(2rem, 4.5vw, 3.1rem)",
                fontWeight: 700,
                color: C.charcoal,
                margin: "0 0 1rem",
                lineHeight: 1.1,
                animation: "fadeUp 0.7s ease 0.2s both",
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                fontFamily: F.body,
                fontSize: "1rem",
                color: C.warm,
                margin: "0 0 2rem",
                lineHeight: 1.7,
                maxWidth: "520px",
                animation: "fadeUp 0.7s ease 0.35s both",
              }}
            >
              {product.tagline}
            </p>

            {/* Key spec pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "2rem",
                animation: "fadeUp 0.7s ease 0.5s both",
              }}
            >
              {product.gsmRange && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: C.charcoal, background: C.parchment, border: `1px solid ${C.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>GSM: </span>{product.gsmRange}
                </div>
              )}
              {product.thickness && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: C.charcoal, background: C.parchment, border: `1px solid ${C.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>Thickness: </span>{product.thickness}
                </div>
              )}
              {product.surfaceResistivity && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: C.charcoal, background: C.parchment, border: `1px solid ${C.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>Resistivity: </span>{product.surfaceResistivity}
                </div>
              )}
              {product.origin && (
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 500, color: C.charcoal, background: C.parchment, border: `1px solid ${C.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>Origin: </span>{product.origin}
                </div>
              )}
              {product.certifications && product.certifications.map((cert) => (
                <div key={cert} style={{ fontFamily: F.body, fontSize: "0.78rem", fontWeight: 600, color: C.charcoal, background: "#fff", border: `1px solid ${C.borderMid}`, padding: "0.38rem 0.85rem", borderRadius: "3px" }}>
                  {cert}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.6s both" }}>
              <a
                href="/#contact"
                style={{
                  fontFamily: F.body,
                  background: C.charcoal,
                  color: C.cream,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  padding: "0.85rem 1.75rem",
                  borderRadius: "3px",
                  letterSpacing: "0.02em",
                }}
              >
                Enquire Now →
              </a>
              <a
                href="/#contact"
                style={{
                  fontFamily: F.body,
                  background: "transparent",
                  color: C.charcoal,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  padding: "0.85rem 1.75rem",
                  borderRadius: "3px",
                  border: `1px solid ${C.borderMid}`,
                }}
              >
                Request Sample
              </a>
            </div>
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
        <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "1.25rem 2.5rem" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.body, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.taupe }}>
              {product.brands ? "Available Brands:" : "Variants:"}
            </span>
            {(product.brands || product.variants || []).map((item) => (
              <span key={item} style={{ fontFamily: F.body, fontSize: "0.82rem", fontWeight: 500, color: C.charcoal, background: C.parchment, border: `1px solid ${C.border}`, padding: "0.28rem 0.7rem", borderRadius: "2px" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ——— Main Content ——— */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem" }}>
          {/* Features */}
          <section className="sr">
            <h2
              style={{
                fontFamily: F.display,
                fontSize: "1.65rem",
                fontWeight: 700,
                color: C.charcoal,
                margin: "0 0 1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: `1px solid ${C.borderMid}`,
              }}
            >
              Key Features
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {product.features.map((feature, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    fontFamily: F.body,
                    fontSize: "0.9rem",
                    color: C.warm,
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
                      background: C.parchment,
                      color: C.charcoal,
                      borderRadius: "50%",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Applications */}
          <section className="sr">
            <h2
              style={{
                fontFamily: F.display,
                fontSize: "1.65rem",
                fontWeight: 700,
                color: C.charcoal,
                margin: "0 0 1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: `1px solid ${C.borderMid}`,
              }}
            >
              Applications
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {product.applications.map((app, i) => (
                <div key={i} className="app-card">
                  {app}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Specs Table */}
        <section style={{ marginTop: "3.5rem" }} className="sr">
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "1.65rem",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1.5rem",
              paddingBottom: "0.75rem",
              borderBottom: `1px solid ${C.borderMid}`,
            }}
          >
            Technical Specifications
          </h2>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
              <tbody>
                {product.specsTable.map((spec, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < product.specsTable.length - 1 ? `1px solid ${C.border}` : "none",
                      background: i % 2 === 0 ? "#fff" : C.cream,
                    }}
                  >
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.78rem", fontWeight: 600, color: C.taupe, width: "40%", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {spec.label}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.88rem", fontWeight: 500, color: C.charcoal }}>
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Export Compliance */}
        <section style={{ marginTop: "3rem" }} className="sr">
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "1.65rem",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1.5rem",
              paddingBottom: "0.75rem",
              borderBottom: `1px solid ${C.borderMid}`,
            }}
          >
            Export Compliance &amp; Certifications
          </h2>
          <div
            style={{
              background: C.parchment,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              padding: "1.75rem 2rem",
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {product.exportCompliance.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    fontFamily: F.body,
                    fontSize: "0.9rem",
                    color: C.warm,
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
                      background: "#fff",
                      color: C.charcoal,
                      borderRadius: "50%",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            marginTop: "3.5rem",
            background: C.dark,
            borderRadius: "6px",
            padding: "3.5rem 3rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "center",
          }}
          className="sr"
        >
          <div>
            <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "0.95rem", color: "rgba(250,247,242,0.5)", margin: "0 0 0.75rem" }}>
              Ready to proceed?
            </p>
            <h3 style={{ fontFamily: F.display, fontSize: "1.65rem", fontWeight: 700, color: C.cream, margin: "0 0 0.875rem", lineHeight: 1.2 }}>
              Request a Sample or Quotation
            </h3>
            <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: "rgba(250,247,242,0.55)", margin: 0, lineHeight: 1.7 }}>
              Share your application requirements and we will send you a sample with full technical
              documentation — COA, FSC certificate, and food contact declarations where applicable.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
            <a
              href="/#contact"
              style={{
                fontFamily: F.body,
                background: C.cream,
                color: C.charcoal,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.9rem 1.75rem",
                borderRadius: "3px",
                whiteSpace: "nowrap",
              }}
            >
              Request Sample →
            </a>
            <a
              href={`mailto:contact.puneglobalgroup@gmail.com?subject=Enquiry: ${product.name}`}
              style={{ fontFamily: F.body, fontSize: "0.8rem", color: "rgba(250,247,242,0.4)", textDecoration: "none", textAlign: "center" }}
            >
              contact.puneglobalgroup@gmail.com
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: C.dark, borderTop: `1px solid rgba(250,247,242,0.07)`, padding: "2rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/products" style={{ fontFamily: F.body, fontSize: "0.78rem", color: "rgba(250,247,242,0.4)", textDecoration: "none" }}>
            ← All Products
          </Link>
          <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: "rgba(250,247,242,0.35)", margin: 0 }}>
            © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO · +91 98233 83230
          </p>
          <a href="mailto:contact.puneglobalgroup@gmail.com" style={{ fontFamily: F.body, fontSize: "0.78rem", color: "rgba(250,247,242,0.4)", textDecoration: "none" }}>
            contact.puneglobalgroup@gmail.com
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

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {product ? (
        <>
          <SubpageNav />
          <ProductPageContent product={product} />
        </>
      ) : (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: C.cream,
            fontFamily: F.body,
            gap: "1rem",
          }}
        >
          <h1 style={{ fontFamily: F.display, fontSize: "2.5rem", color: C.charcoal, margin: 0 }}>Product Not Found</h1>
          <Link
            href="/products"
            style={{
              fontFamily: F.body,
              background: C.charcoal,
              color: C.cream,
              textDecoration: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "3px",
              fontWeight: 500,
            }}
          >
            ← View All Products
          </Link>
        </div>
      )}
    </>
  );
}
