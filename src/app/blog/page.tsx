"use client";

import { useState } from "react";
import Link from "next/link";
import { blogPosts, BlogPost } from "@/lib/pgg-data";

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
            fontSize: "0.875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Pune Global Group
        </span>
      </Link>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link
          href="/products"
          style={{
            fontFamily: FONT.outfit,
            color: "#FFFDF8",
            textDecoration: "none",
            fontSize: "0.875rem",
            opacity: 0.8,
          }}
        >
          Products
        </Link>
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
          }}
        >
          Get a Quote
        </Link>
      </div>
    </nav>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
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
        {/* Top accent bar */}
        <div
          style={{
            height: "4px",
            background: `linear-gradient(90deg, ${post.categoryColor}, ${post.categoryColor}88)`,
          }}
        />

        <div
          style={{
            padding: "1.75rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Category + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: post.categoryColor,
                background: `${post.categoryColor}15`,
                border: `1px solid ${post.categoryColor}30`,
                padding: "0.25rem 0.6rem",
                borderRadius: "3px",
              }}
            >
              {post.category}
            </span>
            <span
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.75rem",
                color: C.taupe,
              }}
            >
              {post.date} · {post.readTime} read
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "1.35rem",
              fontWeight: 700,
              color: C.charcoal,
              margin: 0,
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.875rem",
              color: C.taupe,
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {post.excerpt}
          </p>

          {/* Read more */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: FONT.outfit,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: C.saffron,
              letterSpacing: "0.04em",
              marginTop: "0.25rem",
            }}
          >
            Read Article
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
      </article>
    </Link>
  );
}

// ————————————————————————————————————————————
// Main Page
// ————————————————————————————————————————————
export default function BlogPage() {
  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: FONT.outfit }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <Navbar />

      {/* ——— Hero ——— */}
      <section
        style={{
          background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 60%)`,
          padding: "5rem 2rem 4.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 25% 60%, rgba(244,162,54,0.08) 0%, transparent 40%),
                              radial-gradient(circle at 75% 30%, rgba(244,162,54,0.05) 0%, transparent 35%)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto" }}>
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
            Industry Insights
          </p>
          <h1
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#FFFDF8",
              margin: "0 0 1.25rem",
              lineHeight: 1.12,
            }}
          >
            Packaging{" "}
            <span style={{ color: C.saffron }}>Knowledge Hub</span>
          </h1>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "1rem",
              color: "rgba(255,253,248,0.72)",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            Technical guides, compliance updates, and market intelligence for
            packaging buyers, procurement managers, and converting professionals
            across India&apos;s paper and board supply chain.
          </p>
        </div>
      </section>

      {/* ——— Blog Grid ——— */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 2rem 5rem" }}>
        {/* Featured post (first one) */}
        <div style={{ marginBottom: "3rem" }}>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.taupe,
              margin: "0 0 1.25rem",
            }}
          >
            Latest Articles
          </p>

          {/* Featured large card */}
          <Link
            href={`/blog/${blogPosts[0].slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article
              style={{
                background: "#FFFFFF",
                border: `1.5px solid ${C.border}`,
                borderRadius: "10px",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                marginBottom: "1.5rem",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = C.saffron;
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(58,53,48,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = C.border;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Left: visual */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 100%)`,
                  padding: "3rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: "260px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 30% 70%, rgba(244,162,54,0.12) 0%, transparent 50%)`,
                    pointerEvents: "none",
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: blogPosts[0].categoryColor,
                    background: `${blogPosts[0].categoryColor}20`,
                    border: `1px solid ${blogPosts[0].categoryColor}40`,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "3px",
                    display: "inline-block",
                    marginBottom: "0.75rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {blogPosts[0].category}
                </span>
                <h2
                  style={{
                    fontFamily: FONT.cormorant,
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#FFFDF8",
                    margin: 0,
                    lineHeight: 1.2,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {blogPosts[0].title}
                </h2>
              </div>

              {/* Right: content */}
              <div
                style={{
                  padding: "2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.78rem",
                    color: C.taupe,
                  }}
                >
                  {blogPosts[0].date} · {blogPosts[0].readTime} read
                </div>
                <p
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.95rem",
                    color: C.taupe,
                    margin: 0,
                    lineHeight: 1.7,
                  }}
                >
                  {blogPosts[0].excerpt}
                </p>
                <div
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: C.saffron,
                    letterSpacing: "0.04em",
                  }}
                >
                  Read Article →
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* ——— Remaining 3 posts grid ——— */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {blogPosts.slice(1).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* ——— Subscribe / CTA ——— */}
        <div
          style={{
            marginTop: "4rem",
            background: `linear-gradient(135deg, ${C.dark}, #3A3530)`,
            borderRadius: "12px",
            padding: "3rem 2.5rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "center",
            border: `1px solid rgba(244,162,54,0.2)`,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.saffron,
                margin: "0 0 0.5rem",
              }}
            >
              Need Expert Advice?
            </p>
            <h3
              style={{
                fontFamily: FONT.cormorant,
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#FFFDF8",
                margin: "0 0 0.75rem",
              }}
            >
              Talk to Our Technical Team
            </h3>
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.875rem",
                color: "rgba(255,253,248,0.65)",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Our sales team has hands-on experience across pharma, FMCG, automotive,
              and electronics packaging. If you have a board specification question,
              we will give you a direct, honest answer — not a sales pitch.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
            <Link
              href="/#contact"
              style={{
                fontFamily: FONT.outfit,
                background: C.saffron,
                color: C.dark,
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                padding: "0.9rem 1.75rem",
                borderRadius: "4px",
                whiteSpace: "nowrap",
              }}
            >
              Ask a Question →
            </Link>
            <a
              href="tel:+919823383230"
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.8rem",
                color: "rgba(255,253,248,0.55)",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              +91 98233 83230
            </a>
          </div>
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
            color: "rgba(255,253,248,0.4)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO ·{" "}
          <a href="mailto:contact.puneglobalgroup@gmail.com" style={{ color: "rgba(255,253,248,0.4)", textDecoration: "none" }}>
            contact.puneglobalgroup@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
