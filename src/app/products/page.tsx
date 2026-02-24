"use client";

import { useState } from "react";
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
// Category filter tabs
// ————————————————————————————————————————————
type FilterTab = "All" | "Paper & Board" | "PP Packaging";
const TABS: FilterTab[] = ["All", "Paper & Board", "PP Packaging"];

// ————————————————————————————————————————————
// Sub-components
// ————————————————————————————————————————————

function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: C.dark,
        borderBottom: `1px solid rgba(244,162,54,0.2)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        height: "64px",
      }}
    >
      <Link
        href="/"
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
            fontSize: "0.95rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Pune Global Group
        </span>
      </Link>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link
          href="/infrastructure"
          style={{
            fontFamily: FONT.outfit,
            color: "#FFFDF8",
            textDecoration: "none",
            fontSize: "0.875rem",
            opacity: 0.8,
          }}
        >
          Infrastructure
        </Link>
        <Link
          href="/blog"
          style={{
            fontFamily: FONT.outfit,
            color: "#FFFDF8",
            textDecoration: "none",
            fontSize: "0.875rem",
            opacity: 0.8,
          }}
        >
          Insights
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
      </div>
    </nav>
  );
}

function CategoryTag({ category }: { category: string }) {
  const isPP = category === "PP Packaging";
  return (
    <span
      style={{
        fontFamily: FONT.outfit,
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: isPP ? "rgba(220,20,60,0.1)" : "rgba(244,162,54,0.12)",
        color: isPP ? C.sindoor : "#C47E1A",
        padding: "0.25rem 0.6rem",
        borderRadius: "3px",
        border: `1px solid ${isPP ? "rgba(220,20,60,0.25)" : "rgba(244,162,54,0.3)"}`,
      }}
    >
      {category}
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: `1.5px solid ${hovered ? C.saffron : C.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          transition: "all 0.25s ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 12px 40px rgba(58,53,48,0.12)"
            : "0 2px 8px rgba(58,53,48,0.05)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Image strip */}
        {product.image ? (
          <div
            style={{
              width: "100%",
              height: "180px",
              overflow: "hidden",
              background: C.light,
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.35s ease",
                transform: hovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "8px",
              background: product.category === "PP Packaging"
                ? `linear-gradient(90deg, ${C.sindoor}, #ff6b8a)`
                : `linear-gradient(90deg, ${C.saffron}, #f9c96e)`,
            }}
          />
        )}

        {/* Content */}
        <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <CategoryTag category={product.category} />

          <h3
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "1.3rem",
              fontWeight: 700,
              color: C.charcoal,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>

          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.85rem",
              color: C.taupe,
              margin: 0,
              lineHeight: 1.6,
              flex: 1,
            }}
          >
            {product.tagline}
          </p>

          {/* Spec pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
            {product.gsmRange && (
              <span
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: C.taupe,
                  background: C.light,
                  border: `1px solid ${C.border}`,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "20px",
                }}
              >
                {product.gsmRange}
              </span>
            )}
            {product.thickness && (
              <span
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: C.taupe,
                  background: C.light,
                  border: `1px solid ${C.border}`,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "20px",
                }}
              >
                {product.thickness}
              </span>
            )}
            {product.surfaceResistivity && (
              <span
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: C.taupe,
                  background: C.light,
                  border: `1px solid ${C.border}`,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "20px",
                }}
              >
                {product.surfaceResistivity}
              </span>
            )}
          </div>

          {/* Arrow CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "0.5rem",
              fontFamily: FONT.outfit,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: C.saffron,
              letterSpacing: "0.04em",
            }}
          >
            View Details
            <span
              style={{
                transform: hovered ? "translateX(4px)" : "translateX(0)",
                transition: "transform 0.2s ease",
                display: "inline-block",
              }}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ————————————————————————————————————————————
// Main Page
// ————————————————————————————————————————————
export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered = activeTab === "All"
    ? products
    : products.filter((p) => p.category === activeTab);

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: FONT.outfit }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <Navbar />

      {/* ——— Hero Section ——— */}
      <section
        style={{
          background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 60%, #2C2825 100%)`,
          padding: "5rem 2rem 4rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(244,162,54,0.08) 0%, transparent 50%),
                              radial-gradient(circle at 80% 30%, rgba(244,162,54,0.06) 0%, transparent 40%)`,
          }}
        />
        <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.saffron,
              margin: "0 0 1.25rem",
            }}
          >
            Our Products
          </p>
          <h1
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#FFFDF8",
              margin: "0 0 1.25rem",
              lineHeight: 1.15,
            }}
          >
            40+ Grades.{" "}
            <span style={{ color: C.saffron }}>3 Business Lines.</span>
          </h1>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "1rem",
              color: "rgba(255,253,248,0.75)",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            From ITC FBB and Duplex Boards to imported Kraft Liners and high-performance
            PP corrugated packaging — Pune Global Group supplies, converts, and delivers
            across India with FSC Chain of Custody certification and 200 tons/day processing capacity.
          </p>
        </div>
      </section>

      {/* ——— Filter Tabs ——— */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: `1px solid ${C.border}`,
          position: "sticky",
          top: "64px",
          zIndex: 90,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            gap: "0",
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.875rem",
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? C.saffron : C.taupe,
                background: "none",
                border: "none",
                borderBottom: activeTab === tab
                  ? `2.5px solid ${C.saffron}`
                  : "2.5px solid transparent",
                padding: "1rem 1.5rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
              }}
            >
              {tab}
              <span
                style={{
                  marginLeft: "0.4rem",
                  fontSize: "0.72rem",
                  background: activeTab === tab ? "rgba(244,162,54,0.15)" : C.light,
                  color: activeTab === tab ? C.saffron : C.taupe,
                  padding: "0.1rem 0.4rem",
                  borderRadius: "10px",
                  fontWeight: 500,
                }}
              >
                {tab === "All"
                  ? products.length
                  : products.filter((p) => p.category === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ——— Product Grid ——— */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
        {/* Results count */}
        <p
          style={{
            fontFamily: FONT.outfit,
            fontSize: "0.875rem",
            color: C.taupe,
            margin: "0 0 2rem",
          }}
        >
          Showing {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {activeTab !== "All" && ` in ${activeTab}`}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.75rem",
            alignItems: "stretch",
          }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/* ——— CTA Banner ——— */}
        <div
          style={{
            marginTop: "4rem",
            background: `linear-gradient(135deg, ${C.dark}, #3A3530)`,
            borderRadius: "12px",
            padding: "3rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.25rem",
            border: `1px solid rgba(244,162,54,0.2)`,
          }}
        >
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.saffron,
              margin: 0,
            }}
          >
            Can't find your grade?
          </p>
          <h2
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 700,
              color: "#FFFDF8",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            We Source What Others Can't
          </h2>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.95rem",
              color: "rgba(255,253,248,0.7)",
              margin: 0,
              maxWidth: "520px",
              lineHeight: 1.7,
            }}
          >
            With direct mill relationships across India, Europe, and South America,
            we can source speciality grades, non-standard GSMs, and custom converting requirements.
            Tell us what you need.
          </p>
          <a
            href="/#contact"
            style={{
              fontFamily: FONT.outfit,
              background: C.saffron,
              color: C.dark,
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
              padding: "0.85rem 2rem",
              borderRadius: "4px",
              letterSpacing: "0.04em",
              transition: "opacity 0.2s",
            }}
          >
            Send an Enquiry →
          </a>
        </div>
      </main>

      {/* ——— Footer ——— */}
      <footer
        style={{
          background: C.dark,
          borderTop: `1px solid rgba(244,162,54,0.15)`,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: FONT.outfit,
            fontSize: "0.8rem",
            color: "rgba(255,253,248,0.45)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO ·{" "}
          <a href="mailto:contact.puneglobalgroup@gmail.com" style={{ color: "rgba(255,253,248,0.45)", textDecoration: "none" }}>
            contact.puneglobalgroup@gmail.com
          </a>{" "}
          · +91 98233 83230
        </p>
      </footer>
    </div>
  );
}
