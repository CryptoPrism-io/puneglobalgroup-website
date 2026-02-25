"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blogPosts, BlogPost } from "@/lib/pgg-data";

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

  .blog-nav-link {
    font-family: 'DM Sans', sans-serif;
    color: ${C.charcoal};
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  .blog-nav-link:hover { opacity: 1; }

  .blog-card {
    background: #fff;
    border: 1px solid ${C.border};
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
    text-decoration: none;
  }
  .blog-card:hover {
    border-color: ${C.borderMid};
    box-shadow: 0 12px 40px rgba(28,26,23,0.08);
    transform: translateY(-4px);
  }

  .read-arrow {
    display: inline-block;
    transition: transform 0.2s ease;
  }
  .blog-card:hover .read-arrow { transform: translateX(4px); }
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
function Navbar() {
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
        href="/"
        style={{
          fontFamily: F.display,
          fontWeight: 700,
          color: C.charcoal,
          textDecoration: "none",
          fontSize: "1.05rem",
        }}
      >
        Pune Global Group
      </Link>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link href="/products" className="blog-nav-link">Products</Link>
        <Link href="/infrastructure" className="blog-nav-link">Infrastructure</Link>
        <Link
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
        </Link>
      </div>
    </nav>
  );
}

// ————————————————————————————————————————————
// Blog Card
// ————————————————————————————————————————————
function BlogCard({ post, delay }: { post: BlogPost; delay: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-card sr"
      style={{ animationDelay: `${delay}s` } as React.CSSProperties}
    >
      {/* Category accent bar */}
      <div style={{ height: "3px", background: post.categoryColor, flexShrink: 0 }} />

      <div
        style={{
          padding: "1.75rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
        }}
      >
        {/* Category + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: F.body,
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: post.categoryColor,
              background: `${post.categoryColor}15`,
              border: `1px solid ${post.categoryColor}30`,
              padding: "0.22rem 0.55rem",
              borderRadius: "2px",
            }}
          >
            {post.category}
          </span>
          <span style={{ fontFamily: F.body, fontSize: "0.74rem", color: C.taupe }}>
            {post.date} · {post.readTime} read
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: F.display,
            fontSize: "1.25rem",
            fontWeight: 600,
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
            fontFamily: F.body,
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
            gap: "0.35rem",
            fontFamily: F.body,
            fontSize: "0.8rem",
            fontWeight: 600,
            color: C.charcoal,
            letterSpacing: "0.02em",
            marginTop: "0.25rem",
          }}
        >
          Read Article
          <span className="read-arrow">→</span>
        </div>
      </div>
    </Link>
  );
}

// ————————————————————————————————————————————
// Main Page
// ————————————————————————————————————————————
export default function BlogPage() {
  useScrollReveal();

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: F.body }}>
      <style>{GLOBAL_CSS}</style>

      <Navbar />

      {/* ——— Hero ——— */}
      <section
        style={{
          background: C.cream,
          padding: "5.5rem 2.5rem 4rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Paper grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.035 }} aria-hidden>
          <filter id="grain-blog"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-blog)" />
        </svg>

        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: F.italic,
              fontStyle: "italic",
              fontSize: "1rem",
              color: C.taupe,
              margin: "0 0 1.25rem",
              animation: "fadeUp 0.7s ease both",
            }}
          >
            Industry Insights
          </p>
          <div
            style={{
              width: "48px",
              height: "2px",
              background: C.charcoal,
              marginBottom: "1.5rem",
              transformOrigin: "left",
              animation: "ruleGrow 0.6s ease 0.15s both",
            }}
          />
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1.5rem",
              lineHeight: 1.1,
              animation: "fadeUp 0.8s ease 0.25s both",
            }}
          >
            Packaging{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>Knowledge Hub</em>
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "1rem",
              color: C.warm,
              lineHeight: 1.75,
              margin: 0,
              animation: "fadeUp 0.8s ease 0.4s both",
            }}
          >
            Technical guides, compliance updates, and market intelligence for
            packaging buyers, procurement managers, and converting professionals
            across India&apos;s paper and board supply chain.
          </p>
        </div>
      </section>

      {/* ——— Blog Grid ——— */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2.5rem 5rem" }}>

        {/* Featured post */}
        <div style={{ marginBottom: "3.5rem" }}>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.taupe,
              margin: "0 0 1.5rem",
            }}
          >
            Latest Articles
          </p>

          <Link
            href={`/blog/${blogPosts[0].slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article
              style={{
                background: "#fff",
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                marginBottom: "1.5rem",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = C.borderMid;
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(28,26,23,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = C.border;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Left: parchment visual panel */}
              <div
                style={{
                  background: C.parchment,
                  padding: "3rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: "280px",
                  position: "relative",
                  overflow: "hidden",
                  borderRight: `1px solid ${C.border}`,
                }}
              >
                {/* Category accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: blogPosts[0].categoryColor,
                  }}
                />
                {/* Large italic number */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    fontFamily: F.display,
                    fontSize: "8rem",
                    fontWeight: 700,
                    color: C.border,
                    lineHeight: 1,
                    fontStyle: "italic",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  01
                </div>
                <span
                  style={{
                    fontFamily: F.body,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: blogPosts[0].categoryColor,
                    background: `${blogPosts[0].categoryColor}18`,
                    border: `1px solid ${blogPosts[0].categoryColor}35`,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "2px",
                    display: "inline-block",
                    marginBottom: "1rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {blogPosts[0].category}
                </span>
                <h2
                  style={{
                    fontFamily: F.display,
                    fontSize: "1.65rem",
                    fontWeight: 700,
                    color: C.charcoal,
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
                  padding: "3rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.taupe }}>
                  {blogPosts[0].date} · {blogPosts[0].readTime} read
                </div>
                <p
                  style={{
                    fontFamily: F.body,
                    fontSize: "0.95rem",
                    color: C.warm,
                    margin: 0,
                    lineHeight: 1.7,
                  }}
                >
                  {blogPosts[0].excerpt}
                </p>
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: C.charcoal,
                    letterSpacing: "0.02em",
                  }}
                >
                  Read Article →
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* Remaining posts grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {blogPosts.slice(1).map((post, i) => (
            <BlogCard key={post.slug} post={post} delay={i * 0.1} />
          ))}
        </div>

        {/* ——— CTA Banner ——— */}
        <div
          className="sr"
          style={{
            marginTop: "4.5rem",
            background: C.dark,
            borderRadius: "6px",
            padding: "3.5rem 3rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: F.italic,
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: "rgba(250,247,242,0.5)",
                margin: "0 0 0.75rem",
              }}
            >
              Need Expert Advice?
            </p>
            <h3
              style={{
                fontFamily: F.display,
                fontSize: "1.75rem",
                fontWeight: 700,
                color: C.cream,
                margin: "0 0 0.875rem",
                lineHeight: 1.2,
              }}
            >
              Talk to Our Technical Team
            </h3>
            <p
              style={{
                fontFamily: F.body,
                fontSize: "0.875rem",
                color: "rgba(250,247,242,0.55)",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Our sales team has hands-on experience across pharma, FMCG, automotive,
              and electronics packaging. Honest answers — not a sales pitch.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
            <Link
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
              Ask a Question →
            </Link>
            <a
              href="tel:+919823383230"
              style={{
                fontFamily: F.body,
                fontSize: "0.8rem",
                color: "rgba(250,247,242,0.4)",
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
          borderTop: `1px solid rgba(250,247,242,0.07)`,
          padding: "2rem 2.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: F.body,
            fontSize: "0.78rem",
            color: "rgba(250,247,242,0.35)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO ·{" "}
          <a href="mailto:contact.puneglobalgroup@gmail.com" style={{ color: "rgba(250,247,242,0.35)", textDecoration: "none" }}>
            contact.puneglobalgroup@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
