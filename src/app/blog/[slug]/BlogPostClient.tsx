"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blogPosts, BlogPost, BlogSection } from "@/lib/pgg-data";
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
  prose: "'Cormorant Garamond', Georgia, serif",
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
        href="/blog"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "none",
        }}
      >
        <span style={{ color: C.taupe, fontSize: "0.9rem" }}>←</span>
        <span style={{ fontFamily: F.body, fontWeight: 500, color: C.charcoal, fontSize: "0.875rem", opacity: 0.8 }}>
          All Articles
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
// Section renderer
// ————————————————————————————————————————————
function RenderSection({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "paragraph":
      return (
        <p
          style={{
            fontFamily: F.prose,
            fontSize: "1.15rem",
            color: C.warm,
            lineHeight: 1.85,
            margin: "0 0 1.5rem",
          }}
        >
          {section.text}
        </p>
      );

    case "heading":
      return (
        <h2
          style={{
            fontFamily: F.display,
            fontSize: "1.6rem",
            fontWeight: 700,
            color: C.charcoal,
            margin: "2.75rem 0 1rem",
            paddingBottom: "0.5rem",
            borderBottom: `1px solid ${C.borderMid}`,
            lineHeight: 1.25,
          }}
        >
          {section.text}
        </h2>
      );

    case "subheading":
      return (
        <h3
          style={{
            fontFamily: F.display,
            fontSize: "1.2rem",
            fontWeight: 600,
            color: C.charcoal,
            margin: "1.75rem 0 0.75rem",
            lineHeight: 1.3,
          }}
        >
          {section.text}
        </h3>
      );

    case "list":
      return (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {(section.items || []).map((item, i) => (
            <li
              key={i}
              style={{
                fontFamily: F.prose,
                fontSize: "1.1rem",
                color: C.warm,
                lineHeight: 1.75,
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: C.charcoal,
                  marginTop: "0.6rem",
                  flexShrink: 0,
                }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div style={{ margin: "1.75rem 0", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
            <tbody>
              {(section.rows || []).map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: i < (section.rows || []).length - 1 ? `1px solid ${C.border}` : "none",
                    background: i === 0 ? C.charcoal : i % 2 === 0 ? "#fff" : C.cream,
                  }}
                >
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: i === 0 ? "0.72rem" : "0.83rem", fontWeight: i === 0 ? 600 : 600, color: i === 0 ? "rgba(250,247,242,0.65)" : C.taupe, width: "45%", textTransform: i === 0 ? "uppercase" : "none" as const, letterSpacing: i === 0 ? "0.07em" : "0" }}>
                    {row.label}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: i === 0 ? "0.72rem" : "0.9rem", fontWeight: i === 0 ? 600 : 400, color: i === 0 ? C.cream : C.charcoal, textTransform: i === 0 ? "uppercase" : "none" as const, letterSpacing: i === 0 ? "0.07em" : "0" }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "callout":
      return (
        <div
          style={{
            margin: "2rem 0",
            background: C.parchment,
            border: `1px solid ${C.borderMid}`,
            borderLeft: `3px solid ${C.charcoal}`,
            borderRadius: "0 4px 4px 0",
            padding: "1.25rem 1.5rem",
            fontFamily: F.italic,
            fontStyle: "italic",
            fontSize: "1.1rem",
            color: C.warm,
            lineHeight: 1.7,
          }}
        >
          {section.text}
        </div>
      );

    default:
      return null;
  }
}

// ————————————————————————————————————————————
// Blog Post Content
// ————————————————————————————————————————————
function BlogPostContent({ post }: { post: BlogPost }) {
  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* ——— Article Header ——— */}
      <header
        style={{
          background: C.cream,
          padding: "4.5rem 2.5rem 3.5rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Paper grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.035 }} aria-hidden>
          <filter id="grain-blog-post"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-blog-post)" />
        </svg>

        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link href="/" style={{ fontFamily: F.body, fontSize: "0.76rem", color: C.taupe, textDecoration: "none" }}>Home</Link>
            <span style={{ color: C.border, fontSize: "0.76rem" }}>/</span>
            <Link href="/blog" style={{ fontFamily: F.body, fontSize: "0.76rem", color: C.taupe, textDecoration: "none" }}>Insights</Link>
            <span style={{ color: C.border, fontSize: "0.76rem" }}>/</span>
            <span style={{ fontFamily: F.body, fontSize: "0.76rem", color: C.warm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>
              {post.title}
            </span>
          </nav>

          {/* Category tag */}
          <span
            style={{
              fontFamily: F.body,
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: post.categoryColor,
              background: `${post.categoryColor}14`,
              border: `1px solid ${post.categoryColor}30`,
              padding: "0.25rem 0.65rem",
              borderRadius: "2px",
              display: "inline-block",
              marginBottom: "1.25rem",
              animation: "fadeUp 0.6s ease both",
            }}
          >
            {post.category}
          </span>

          {/* Rule */}
          <div
            style={{
              width: "48px",
              height: "2px",
              background: C.charcoal,
              marginBottom: "1.25rem",
              transformOrigin: "left",
              animation: "ruleGrow 0.6s ease 0.15s both",
            }}
          />

          {/* Title */}
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1.5rem",
              lineHeight: 1.12,
              animation: "fadeUp 0.7s ease 0.25s both",
            }}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              animation: "fadeUp 0.7s ease 0.4s both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: C.charcoal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: C.cream,
                  fontFamily: F.body,
                }}
              >
                PG
              </div>
              <span style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.warm, fontWeight: 500 }}>
                Pune Global Group
              </span>
            </div>
            <span style={{ color: C.border }}>·</span>
            <span style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.taupe }}>{post.date}</span>
            <span style={{ color: C.border }}>·</span>
            <span style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.taupe }}>{post.readTime} read</span>
          </div>
        </div>
      </header>

      {/* ——— Article Body ——— */}
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>
        {/* Lead excerpt */}
        <div
          style={{
            fontFamily: F.italic,
            fontStyle: "italic",
            fontSize: "1.25rem",
            color: C.taupe,
            lineHeight: 1.75,
            borderLeft: `3px solid ${C.charcoal}`,
            paddingLeft: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {post.excerpt}
        </div>

        {/* Sections */}
        <div>
          {post.content.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
        </div>

        {/* Article footer */}
        <div style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.taupe }}>
              Published by Pune Global Group · {post.date}
            </span>
            <a href="/#contact" style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.charcoal, textDecoration: "none", fontWeight: 600 }}>
              Contact Us →
            </a>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["Paper & Board", "Packaging India", "Pune Global Group", post.category].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: F.body,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: C.taupe,
                  background: C.parchment,
                  border: `1px solid ${C.border}`,
                  padding: "0.25rem 0.6rem",
                  borderRadius: "20px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Enquiry CTA */}
        <div
          style={{
            marginTop: "3rem",
            background: C.dark,
            borderRadius: "6px",
            padding: "3rem 2.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "0.95rem", color: "rgba(250,247,242,0.5)", margin: "0 0 0.75rem" }}>
            Apply What You&apos;ve Learned
          </p>
          <h3 style={{ fontFamily: F.display, fontSize: "1.65rem", fontWeight: 700, color: C.cream, margin: "0 0 0.875rem", lineHeight: 1.2 }}>
            Talk to Our Packaging Experts
          </h3>
          <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: "rgba(250,247,242,0.55)", margin: "0 0 1.75rem", lineHeight: 1.7 }}>
            Have a specific board or packaging question? We give honest, technical answers — no
            upselling. Reach our team at any time.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/#contact"
              style={{
                fontFamily: F.body,
                background: C.cream,
                color: C.charcoal,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.875rem 1.75rem",
                borderRadius: "3px",
              }}
            >
              Send an Enquiry →
            </a>
            <a
              href="tel:+919823383230"
              style={{
                fontFamily: F.body,
                background: "transparent",
                color: C.cream,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 400,
                padding: "0.875rem 1.75rem",
                borderRadius: "3px",
                border: `1px solid rgba(250,247,242,0.2)`,
              }}
            >
              +91 98233 83230
            </a>
          </div>
        </div>

        {/* Related Reading */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: "4rem" }}>
            <h3
              style={{
                fontFamily: F.display,
                fontSize: "1.45rem",
                fontWeight: 700,
                color: C.charcoal,
                margin: "0 0 1.5rem",
                paddingBottom: "0.5rem",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              Related Reading
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="related-card">
                  <div style={{ height: "3px", background: related.categoryColor, borderRadius: "2px", marginBottom: "0.875rem" }} />
                  <span
                    style={{
                      fontFamily: F.body,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: related.categoryColor,
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {related.category}
                  </span>
                  <h4
                    style={{
                      fontFamily: F.display,
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: C.charcoal,
                      margin: "0 0 0.4rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {related.title}
                  </h4>
                  <span style={{ fontFamily: F.body, fontSize: "0.75rem", color: C.taupe }}>
                    {related.readTime} read →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: C.dark, borderTop: `1px solid rgba(250,247,242,0.07)`, padding: "2rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/blog" style={{ fontFamily: F.body, fontSize: "0.78rem", color: "rgba(250,247,242,0.4)", textDecoration: "none" }}>
            ← All Articles
          </Link>
          <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: "rgba(250,247,242,0.35)", margin: 0 }}>
            © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO
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
export default function BlogPostClient({ slug }: { slug: string }) {
  const post = blogPosts.find((p) => p.slug === slug);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {post ? (
        <>
          <Navbar />
          <BlogPostContent post={post} />
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
          <h1 style={{ fontFamily: F.display, fontSize: "2.5rem", color: C.charcoal, margin: 0 }}>
            Article Not Found
          </h1>
          <Link
            href="/blog"
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
            ← View All Articles
          </Link>
        </div>
      )}
    </>
  );
}
