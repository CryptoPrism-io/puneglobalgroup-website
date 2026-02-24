"use client";

import Link from "next/link";
import { blogPosts, BlogPost, BlogSection } from "@/lib/pgg-data";

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
// Navbar
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
        href="/blog"
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
          All Articles
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
        }}
      >
        Get a Quote
      </a>
    </nav>
  );
}

// ————————————————————————————————————————————
// Article section renderer
// ————————————————————————————————————————————
function RenderSection({ section, index }: { section: BlogSection; index: number }) {
  switch (section.type) {
    case "paragraph":
      return (
        <p style={{ fontFamily: FONT.baskerville, fontSize: "1rem", color: C.charcoal, lineHeight: 1.85, margin: "0 0 1.5rem" }}>
          {section.text}
        </p>
      );

    case "heading":
      return (
        <h2 style={{ fontFamily: FONT.cormorant, fontSize: "1.65rem", fontWeight: 700, color: C.charcoal, margin: "2.5rem 0 1rem", paddingBottom: "0.5rem", borderBottom: `2px solid ${C.saffron}`, lineHeight: 1.25 }}>
          {section.text}
        </h2>
      );

    case "subheading":
      return (
        <h3 style={{ fontFamily: FONT.outfit, fontSize: "1.1rem", fontWeight: 600, color: C.charcoal, margin: "1.75rem 0 0.75rem" }}>
          {section.text}
        </h3>
      );

    case "list":
      return (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {(section.items || []).map((item, i) => (
            <li key={i} style={{ fontFamily: FONT.baskerville, fontSize: "0.95rem", color: C.charcoal, lineHeight: 1.75, display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: C.saffron, marginTop: "0.55rem", flexShrink: 0 }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div style={{ margin: "1.5rem 0", background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.outfit }}>
            <tbody>
              {(section.rows || []).map((row, i) => (
                <tr key={i} style={{ borderBottom: i < (section.rows || []).length - 1 ? `1px solid ${C.border}` : "none", background: i === 0 ? C.dark : i % 2 === 0 ? "#FFFFFF" : C.cream }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: i === 0 ? "0.78rem" : "0.85rem", fontWeight: i === 0 ? 700 : 600, color: i === 0 ? "rgba(255,253,248,0.7)" : C.taupe, width: "45%", textTransform: i === 0 ? "uppercase" : "none" as const, letterSpacing: i === 0 ? "0.06em" : "0" }}>
                    {row.label}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: i === 0 ? "0.78rem" : "0.9rem", fontWeight: i === 0 ? 700 : 400, color: i === 0 ? "#FFFDF8" : C.charcoal, textTransform: i === 0 ? "uppercase" : "none" as const, letterSpacing: i === 0 ? "0.06em" : "0" }}>
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
        <div style={{ margin: "2rem 0", background: "rgba(244,162,54,0.08)", border: `1px solid rgba(244,162,54,0.3)`, borderLeft: `4px solid ${C.saffron}`, borderRadius: "0 8px 8px 0", padding: "1.25rem 1.5rem", fontFamily: FONT.outfit, fontSize: "0.9rem", color: C.charcoal, lineHeight: 1.7 }}>
          {section.text}
        </div>
      );

    default:
      return null;
  }
}

// ————————————————————————————————————————————
// Blog post content
// ————————————————————————————————————————————
function BlogPostContent({ post }: { post: BlogPost }) {
  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* Article Header */}
      <header
        style={{
          background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 70%)`,
          padding: "3.5rem 2rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 70%, rgba(244,162,54,0.08) 0%, transparent 45%)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link href="/" style={{ fontFamily: FONT.outfit, fontSize: "0.78rem", color: "rgba(255,253,248,0.5)", textDecoration: "none" }}>Home</Link>
            <span style={{ color: "rgba(255,253,248,0.3)", fontSize: "0.78rem" }}>/</span>
            <Link href="/blog" style={{ fontFamily: FONT.outfit, fontSize: "0.78rem", color: "rgba(255,253,248,0.5)", textDecoration: "none" }}>Blog</Link>
            <span style={{ color: "rgba(255,253,248,0.3)", fontSize: "0.78rem" }}>/</span>
            <span style={{ fontFamily: FONT.outfit, fontSize: "0.78rem", color: "rgba(255,253,248,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
              {post.title}
            </span>
          </nav>

          <span style={{ fontFamily: FONT.outfit, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: post.categoryColor, background: `${post.categoryColor}18`, border: `1px solid ${post.categoryColor}35`, padding: "0.3rem 0.7rem", borderRadius: "3px", display: "inline-block", marginBottom: "1rem" }}>
            {post.category}
          </span>

          <h1 style={{ fontFamily: FONT.cormorant, fontSize: "clamp(1.8rem, 4.5vw, 2.75rem)", fontWeight: 700, color: "#FFFDF8", margin: "0 0 1.25rem", lineHeight: 1.15 }}>
            {post.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${C.saffron}, #f9c96e)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: C.dark, fontFamily: FONT.outfit }}>
                PG
              </div>
              <span style={{ fontFamily: FONT.outfit, fontSize: "0.82rem", color: "rgba(255,253,248,0.7)", fontWeight: 500 }}>Pune Global Group</span>
            </div>
            <span style={{ color: "rgba(255,253,248,0.3)" }}>·</span>
            <span style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.6)" }}>{post.date}</span>
            <span style={{ color: "rgba(255,253,248,0.3)" }}>·</span>
            <span style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.6)" }}>{post.readTime} read</span>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
        {/* Lead excerpt */}
        <div style={{ fontFamily: FONT.baskerville, fontSize: "1.1rem", color: C.taupe, lineHeight: 1.8, borderLeft: `4px solid ${C.saffron}`, paddingLeft: "1.5rem", marginBottom: "2.5rem", fontStyle: "italic" }}>
          {post.excerpt}
        </div>

        {/* Sections */}
        <div>
          {post.content.map((section, i) => (
            <RenderSection key={i} section={section} index={i} />
          ))}
        </div>

        {/* Article footer */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <span style={{ fontFamily: FONT.outfit, fontSize: "0.78rem", color: C.taupe }}>Published by Pune Global Group · {post.date}</span>
            <a href="/#contact" style={{ fontFamily: FONT.outfit, fontSize: "0.78rem", color: C.saffron, textDecoration: "none", fontWeight: 600 }}>Contact Us →</a>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["Paper & Board", "Packaging India", "Pune Global Group", post.category].map((tag) => (
              <span key={tag} style={{ fontFamily: FONT.outfit, fontSize: "0.72rem", fontWeight: 500, color: C.taupe, background: C.light, border: `1px solid ${C.border}`, padding: "0.25rem 0.6rem", borderRadius: "20px" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Enquiry CTA */}
        <div style={{ marginTop: "2.5rem", background: `linear-gradient(135deg, ${C.dark}, #3A3530)`, borderRadius: "10px", padding: "2.5rem", border: `1px solid rgba(244,162,54,0.2)`, textAlign: "center" }}>
          <p style={{ fontFamily: FONT.outfit, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: C.saffron, margin: "0 0 0.5rem" }}>
            Apply What You've Learned
          </p>
          <h3 style={{ fontFamily: FONT.cormorant, fontSize: "1.6rem", fontWeight: 700, color: "#FFFDF8", margin: "0 0 0.75rem" }}>
            Talk to Our Packaging Experts
          </h3>
          <p style={{ fontFamily: FONT.outfit, fontSize: "0.875rem", color: "rgba(255,253,248,0.65)", margin: "0 0 1.5rem", lineHeight: 1.7 }}>
            Have a specific board or packaging question? We give honest, technical answers — no upselling. Reach our team at any time.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" style={{ fontFamily: FONT.outfit, background: C.saffron, color: C.dark, textDecoration: "none", fontSize: "0.9rem", fontWeight: 700, padding: "0.85rem 1.75rem", borderRadius: "4px" }}>
              Send an Enquiry →
            </a>
            <a href="tel:+919823383230" style={{ fontFamily: FONT.outfit, background: "transparent", color: "#FFFDF8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, padding: "0.85rem 1.75rem", borderRadius: "4px", border: "1px solid rgba(255,253,248,0.3)" }}>
              +91 98233 83230
            </a>
          </div>
        </div>

        {/* Related Reading */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: "3.5rem" }}>
            <h3 style={{ fontFamily: FONT.cormorant, fontSize: "1.5rem", fontWeight: 700, color: C.charcoal, margin: "0 0 1.5rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${C.border}` }}>
              Related Reading
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.25rem", transition: "border-color 0.2s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.saffron; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
                  >
                    <div style={{ height: "3px", background: related.categoryColor, borderRadius: "2px", marginBottom: "0.75rem" }} />
                    <span style={{ fontFamily: FONT.outfit, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: related.categoryColor, display: "block", marginBottom: "0.4rem" }}>
                      {related.category}
                    </span>
                    <h4 style={{ fontFamily: FONT.cormorant, fontSize: "1.05rem", fontWeight: 700, color: C.charcoal, margin: "0 0 0.35rem", lineHeight: 1.3 }}>
                      {related.title}
                    </h4>
                    <span style={{ fontFamily: FONT.outfit, fontSize: "0.75rem", color: C.taupe }}>
                      {related.readTime} read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: C.dark, borderTop: `1px solid rgba(244,162,54,0.15)`, padding: "2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/blog" style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.5)", textDecoration: "none" }}>← All Articles</Link>
          <p style={{ fontFamily: FONT.outfit, fontSize: "0.8rem", color: "rgba(255,253,248,0.4)", margin: 0 }}>
            © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO
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
export default function BlogPostClient({ slug }: { slug: string }) {
  const post = blogPosts.find((p) => p.slug === slug);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
      {post ? (
        <>
          <Navbar />
          <BlogPostContent post={post} />
        </>
      ) : (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: FONT.outfit, gap: "1rem" }}>
          <h1 style={{ fontFamily: FONT.cormorant, fontSize: "2.5rem", color: C.charcoal, margin: 0 }}>Article Not Found</h1>
          <Link href="/blog" style={{ fontFamily: FONT.outfit, background: C.saffron, color: C.dark, textDecoration: "none", padding: "0.75rem 1.5rem", borderRadius: "4px", fontWeight: 600 }}>
            ← View All Articles
          </Link>
        </div>
      )}
    </>
  );
}
