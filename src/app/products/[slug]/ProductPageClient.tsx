"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { products, Product } from "@/lib/pgg-data";

// ————————————————————————————————————————————
// Brand constants
// ————————————————————————————————————————————
const C = {
  cream: "#FFFDF8",
  charcoal: "#3A3530",
  saffron: "#F4A236",
  sindoor: "#DC143C",
  taupe: "#5A534D",
  dark: "#2C2825",
  light: "#F5F0E8",
  border: "#E8E2D9",
};

const FONT = {
  outfit: "'Outfit', sans-serif",
  cormorant: "'Cormorant Garamond', Georgia, serif",
  baskerville: "'Libre Baskerville', Georgia, serif",
};

// ————————————————————————————————————————————
// Sub-components
// ————————————————————————————————————————————
function SubpageNav({ productName }: { productName: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? C.dark : "rgba(44,40,37,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(244,162,54,${scrolled ? "0.25" : "0.1"})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        height: "64px",
        transition: "all 0.3s ease",
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
        <span style={{ color: C.saffron, fontSize: "1.1rem" }}>←</span>
        <span
          style={{
            fontFamily: FONT.outfit,
            fontWeight: 700,
            color: "#FFFDF8",
            fontSize: "0.875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          All Products
        </span>
      </Link>

      <a
        href="/#contact"
        style={{
          fontFamily: FONT.outfit,
          background: C.saffron,
          color: C.dark,
          textDecoration: "none",
          fontSize: "0.875rem",
          fontWeight: 600,
          padding: "0.5rem 1.25rem",
          borderRadius: "4px",
          letterSpacing: "0.02em",
        }}
      >
        Get a Quote
      </a>
    </nav>
  );
}

function CategoryTag({ category }: { category: string }) {
  const isPP = category === "PP Packaging";
  return (
    <span
      style={{
        fontFamily: FONT.outfit,
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background: isPP ? "rgba(220,20,60,0.15)" : "rgba(244,162,54,0.15)",
        color: isPP ? C.sindoor : "#C47E1A",
        padding: "0.3rem 0.75rem",
        borderRadius: "3px",
        border: `1px solid ${isPP ? "rgba(220,20,60,0.3)" : "rgba(244,162,54,0.35)"}`,
        display: "inline-block",
      }}
    >
      {category}
    </span>
  );
}

function CheckIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        background: "rgba(244,162,54,0.15)",
        color: C.saffron,
        borderRadius: "50%",
        fontSize: "0.7rem",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function ShieldIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        background: "rgba(220,20,60,0.12)",
        color: C.sindoor,
        borderRadius: "50%",
        fontSize: "0.65rem",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function ProductPageContent({ product }: { product: Product }) {
  const isPP = product.category === "PP Packaging";

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: FONT.outfit }}>
      {/* ——— Hero Section ——— */}
      <section
        style={{
          background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 70%)`,
          padding: "4rem 2rem 3.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: isPP
              ? `radial-gradient(circle at 10% 60%, rgba(220,20,60,0.08) 0%, transparent 45%),
                 radial-gradient(circle at 90% 20%, rgba(244,162,54,0.06) 0%, transparent 35%)`
              : `radial-gradient(circle at 10% 60%, rgba(244,162,54,0.1) 0%, transparent 45%),
                 radial-gradient(circle at 90% 20%, rgba(244,162,54,0.06) 0%, transparent 35%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: product.image ? "1fr 1fr" : "1fr",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div>
            <CategoryTag category={product.category} />
            <h1
              style={{
                fontFamily: FONT.cormorant,
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontWeight: 700,
                color: "#FFFDF8",
                margin: "1rem 0 0.75rem",
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "1rem",
                color: "rgba(255,253,248,0.75)",
                margin: "0 0 1.75rem",
                lineHeight: 1.7,
                maxWidth: "520px",
              }}
            >
              {product.tagline}
            </p>

            {/* Key spec pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "2rem" }}>
              {product.gsmRange && (
                <div style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", fontWeight: 500, color: "#FFFDF8", background: "rgba(255,253,248,0.08)", border: "1px solid rgba(255,253,248,0.15)", padding: "0.4rem 0.9rem", borderRadius: "4px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>GSM: </span>{product.gsmRange}
                </div>
              )}
              {product.thickness && (
                <div style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", fontWeight: 500, color: "#FFFDF8", background: "rgba(255,253,248,0.08)", border: "1px solid rgba(255,253,248,0.15)", padding: "0.4rem 0.9rem", borderRadius: "4px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>Thickness: </span>{product.thickness}
                </div>
              )}
              {product.surfaceResistivity && (
                <div style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", fontWeight: 500, color: "#FFFDF8", background: "rgba(255,253,248,0.08)", border: "1px solid rgba(255,253,248,0.15)", padding: "0.4rem 0.9rem", borderRadius: "4px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>Resistivity: </span>{product.surfaceResistivity}
                </div>
              )}
              {product.origin && (
                <div style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", fontWeight: 500, color: "#FFFDF8", background: "rgba(255,253,248,0.08)", border: "1px solid rgba(255,253,248,0.15)", padding: "0.4rem 0.9rem", borderRadius: "4px" }}>
                  <span style={{ color: C.saffron, fontWeight: 700 }}>Origin: </span>{product.origin}
                </div>
              )}
              {product.certifications && product.certifications.map((cert) => (
                <div key={cert} style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", fontWeight: 600, color: C.saffron, background: "rgba(244,162,54,0.12)", border: "1px solid rgba(244,162,54,0.3)", padding: "0.4rem 0.9rem", borderRadius: "4px" }}>
                  {cert}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="/#contact" style={{ fontFamily: FONT.outfit, background: C.saffron, color: C.dark, textDecoration: "none", fontSize: "0.9rem", fontWeight: 700, padding: "0.85rem 1.75rem", borderRadius: "4px" }}>
                Enquire Now →
              </a>
              <a href="/#contact" style={{ fontFamily: FONT.outfit, background: "transparent", color: "#FFFDF8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, padding: "0.85rem 1.75rem", borderRadius: "4px", border: "1px solid rgba(255,253,248,0.3)" }}>
                Request Sample
              </a>
            </div>
          </div>

          {product.image && (
            <div style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.35)", maxHeight: "360px" }}>
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>
      </section>

      {/* ——— Brands / Variants Banner ——— */}
      {(product.brands || product.variants) && (
        <div style={{ background: "#FFFFFF", borderBottom: `1px solid ${C.border}`, padding: "1.25rem 2rem" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: FONT.outfit, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.taupe }}>
              {product.brands ? "Available Brands:" : "Variants:"}
            </span>
            {(product.brands || product.variants || []).map((item) => (
              <span key={item} style={{ fontFamily: FONT.outfit, fontSize: "0.82rem", fontWeight: 500, color: C.charcoal, background: C.light, border: `1px solid ${C.border}`, padding: "0.3rem 0.75rem", borderRadius: "3px" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ——— Main Content ——— */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          {/* Features */}
          <section>
            <h2 style={{ fontFamily: FONT.cormorant, fontSize: "1.75rem", fontWeight: 700, color: C.charcoal, margin: "0 0 1.5rem", paddingBottom: "0.75rem", borderBottom: `2px solid ${C.saffron}` }}>
              Key Features
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {product.features.map((feature, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontFamily: FONT.outfit, fontSize: "0.9rem", color: C.charcoal, lineHeight: 1.6 }}>
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Applications */}
          <section>
            <h2 style={{ fontFamily: FONT.cormorant, fontSize: "1.75rem", fontWeight: 700, color: C.charcoal, margin: "0 0 1.5rem", paddingBottom: "0.75rem", borderBottom: `2px solid ${C.saffron}` }}>
              Applications
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {product.applications.map((app, i) => (
                <div key={i} style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: "6px", padding: "0.75rem 1rem", fontFamily: FONT.outfit, fontSize: "0.82rem", color: C.charcoal, lineHeight: 1.5, borderLeft: `3px solid ${C.saffron}` }}>
                  {app}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Specs Table */}
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontFamily: FONT.cormorant, fontSize: "1.75rem", fontWeight: 700, color: C.charcoal, margin: "0 0 1.5rem", paddingBottom: "0.75rem", borderBottom: `2px solid ${C.saffron}` }}>
            Technical Specifications
          </h2>
          <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.outfit }}>
              <tbody>
                {product.specsTable.map((spec, i) => (
                  <tr key={i} style={{ borderBottom: i < product.specsTable.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "#FFFFFF" : C.cream }}>
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.82rem", fontWeight: 600, color: C.taupe, width: "40%", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {spec.label}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.9rem", fontWeight: 500, color: C.charcoal }}>
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Export Compliance */}
        <section style={{ marginTop: "3rem" }}>
          <h2 style={{ fontFamily: FONT.cormorant, fontSize: "1.75rem", fontWeight: 700, color: C.charcoal, margin: "0 0 1.5rem", paddingBottom: "0.75rem", borderBottom: `2px solid ${C.sindoor}` }}>
            Export Compliance & Certifications
          </h2>
          <div style={{ background: "rgba(220,20,60,0.03)", border: `1px solid rgba(220,20,60,0.15)`, borderRadius: "8px", padding: "1.5rem 2rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {product.exportCompliance.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontFamily: FONT.outfit, fontSize: "0.9rem", color: C.charcoal, lineHeight: 1.6 }}>
                  <ShieldIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section style={{ marginTop: "3rem", background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 100%)`, borderRadius: "12px", padding: "3rem 2.5rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center", border: `1px solid rgba(244,162,54,0.2)` }}>
          <div>
            <p style={{ fontFamily: FONT.outfit, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: C.saffron, margin: "0 0 0.5rem" }}>
              Ready to proceed?
            </p>
            <h3 style={{ fontFamily: FONT.cormorant, fontSize: "1.75rem", fontWeight: 700, color: "#FFFDF8", margin: "0 0 0.75rem" }}>
              Request a Sample or Quotation
            </h3>
            <p style={{ fontFamily: FONT.outfit, fontSize: "0.875rem", color: "rgba(255,253,248,0.65)", margin: 0, lineHeight: 1.7 }}>
              Share your application requirements and we will send you a sample with full technical documentation — COA, FSC certificate, and food contact declarations where applicable.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
            <a href="/#contact" style={{ fontFamily: FONT.outfit, background: C.saffron, color: C.dark, textDecoration: "none", fontSize: "0.9rem", fontWeight: 700, padding: "0.9rem 1.75rem", borderRadius: "4px", whiteSpace: "nowrap" }}>
              Request Sample →
            </a>
            <a href={`mailto:contact.puneglobalgroup@gmail.com?subject=Enquiry: ${product.name}`} style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.6)", textDecoration: "none", textAlign: "center" }}>
              contact.puneglobalgroup@gmail.com
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: C.dark, borderTop: `1px solid rgba(244,162,54,0.15)`, padding: "2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/products" style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.5)", textDecoration: "none" }}>
            ← All Products
          </Link>
          <p style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.45)", margin: 0 }}>
            © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO · +91 98233 83230
          </p>
          <a href="mailto:contact.puneglobalgroup@gmail.com" style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.5)", textDecoration: "none" }}>
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
      {product ? (
        <>
          <SubpageNav productName={product.name} />
          <ProductPageContent product={product} />
        </>
      ) : (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: FONT.outfit, gap: "1rem" }}>
          <h1 style={{ fontFamily: FONT.cormorant, fontSize: "2.5rem", color: C.charcoal, margin: 0 }}>Product Not Found</h1>
          <Link href="/products" style={{ fontFamily: FONT.outfit, background: C.saffron, color: C.dark, textDecoration: "none", padding: "0.75rem 1.5rem", borderRadius: "4px", fontWeight: 600 }}>
            ← View All Products
          </Link>
        </div>
      )}
    </>
  );
}
