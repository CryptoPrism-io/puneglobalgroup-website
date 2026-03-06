"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogPosts, BlogPost, BlogSection, products } from "@/lib/pgg-data";
import { SiteLogo } from "@/components/SiteLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

const C = {
  cream: "#FAF7F2",
  navy: "#0F1A2E",
  navyLight: "#152238",
  navyMid: "#1A2A40",
  navyDark: "#0A1220",
  steel: "#5B9BD5",
  gold: "#C8B89A",
  border: "rgba(250,247,242,0.08)",
  borderMid: "rgba(250,247,242,0.12)",
  textMain: "#FAF7F2",
  textMuted: "rgba(250,247,242,0.60)",
  textFaint: "rgba(250,247,242,0.40)",
  textBody: "rgba(250,247,242,0.80)",
  cardBg: "rgba(250,247,242,0.04)",
};

const F = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
  italic: "'Cormorant Garamond', Georgia, serif",
  prose: "'Cormorant Garamond', Georgia, serif",
};

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${C.navy}; }

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
    color: ${C.cream};
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  .blog-nav-link:hover { opacity: 1; }

  .related-card {
    background: ${C.navyMid};
    border: 1px solid ${C.borderMid};
    border-radius: 4px;
    padding: 1.25rem;
    text-decoration: none;
    display: block;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .related-card:hover {
    border-color: rgba(250,247,242,0.2);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  @media(max-width: 768px) {
    .blog-nav { padding: 0 1rem !important; }
    .blog-content-wrap { padding: 0 1.25rem 3rem !important; }
    .blog-related-products { grid-template-columns: 1fr 1fr !important; }
    .blog-sidebar-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
  }
  @media(max-width: 480px) {
    .blog-related-products { grid-template-columns: 1fr 1fr !important; }
    .blog-related-reading { grid-template-columns: 1fr !important; }
  }
  @media(max-width: 360px) {
    .blog-related-products { grid-template-columns: 1fr !important; }
  }
`;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className="blog-nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(15,26,46,0.95)" : C.navy,
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${scrolled ? C.borderMid : C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(1rem, 3vw, 2.5rem)",
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
        <span style={{ color: C.steel, fontSize: "0.9rem" }}>{"\u2190"}</span>
        <span style={{ fontFamily: F.body, fontWeight: 500, color: C.cream, fontSize: "0.875rem", opacity: 0.8 }}>
          All Articles
        </span>
      </Link>

      <SiteLogo href="/" />

      <a
        href="/contact"
        style={{
          fontFamily: F.body,
          background: C.gold,
          color: C.navy,
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

function RenderSection({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "paragraph":
      return (
        <p
          style={{
            fontFamily: F.prose,
            fontSize: "1.15rem",
            color: C.textBody,
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
          className="h2-dark"
          style={{
            fontFamily: F.display,
            fontSize: "1.6rem",
            fontWeight: 700,
            color: C.cream,
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
            color: C.cream,
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
                color: C.textBody,
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
                  background: C.gold,
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
        <div style={{ margin: "1.75rem 0", background: C.cardBg, border: `1px solid ${C.borderMid}`, borderRadius: "6px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
            <tbody>
              {(section.rows || []).map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: i < (section.rows || []).length - 1 ? `1px solid ${C.border}` : "none",
                    background: i === 0 ? C.navyDark : i % 2 === 0 ? "transparent" : "rgba(250,247,242,0.02)",
                  }}
                >
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: i === 0 ? "0.72rem" : "0.83rem", fontWeight: i === 0 ? 600 : 600, color: i === 0 ? "rgba(250,247,242,0.65)" : C.textMuted, width: "45%", textTransform: i === 0 ? "uppercase" : "none" as const, letterSpacing: i === 0 ? "0.07em" : "0" }}>
                    {row.label}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: i === 0 ? "0.72rem" : "0.9rem", fontWeight: i === 0 ? 600 : 400, color: i === 0 ? C.cream : C.cream, textTransform: i === 0 ? "uppercase" : "none" as const, letterSpacing: i === 0 ? "0.07em" : "0" }}>
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
            background: C.navyLight,
            border: `1px solid ${C.borderMid}`,
            borderLeft: `3px solid ${C.gold}`,
            borderRadius: "0 4px 4px 0",
            padding: "1.25rem 1.5rem",
            fontFamily: F.italic,
            fontStyle: "italic",
            fontSize: "1.1rem",
            color: C.textBody,
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

function BlogPostContent({ post }: { post: BlogPost }) {
  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="section-dark" style={{ background: C.navy, minHeight: "100vh" }}>
      <header
        style={{
          background: C.navyDark,
          padding: "4.5rem 2.5rem 3.5rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.035 }} aria-hidden>
          <filter id="grain-blog-post"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-blog-post)" />
        </svg>

        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}>
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Link href="/" style={{ fontFamily: F.body, fontSize: "0.76rem", color: C.textMuted, textDecoration: "none" }}>Home</Link>
            <span style={{ color: C.textFaint, fontSize: "0.76rem" }}>/</span>
            <Link href="/blog" style={{ fontFamily: F.body, fontSize: "0.76rem", color: C.textMuted, textDecoration: "none" }}>Insights</Link>
            <span style={{ color: C.textFaint, fontSize: "0.76rem" }}>/</span>
            <span style={{ fontFamily: F.body, fontSize: "0.76rem", color: C.cream, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>
              {post.title}
            </span>
          </motion.nav>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
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
            }}
          >
            {post.category}
          </motion.span>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            style={{
              width: "48px",
              height: "2px",
              background: C.gold,
              marginBottom: "1.25rem",
              transformOrigin: "left",
            }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            style={{
              fontFamily: F.display,
              fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)",
              fontWeight: 700,
              color: C.cream,
              margin: "0 0 1.5rem",
              lineHeight: 1.12,
            }}
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: C.gold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: C.navyDark,
                  fontFamily: F.body,
                }}
              >
                PG
              </div>
              <span style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.cream, fontWeight: 500 }}>
                Pune Global Group
              </span>
            </div>
            <span style={{ color: C.textFaint }}>{"\u00B7"}</span>
            <span style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.textMuted }}>{post.date}</span>
            <span style={{ color: C.textFaint }}>{"\u00B7"}</span>
            <span style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.textMuted }}>{post.readTime} read</span>
          </motion.div>
        </div>
      </header>

      {post.coverImage && (
        <div style={{ width: "100%", maxHeight: "480px", overflow: "hidden", lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <main className="blog-content-wrap" style={{ maxWidth: "760px", margin: "0 auto", padding: "3.5rem clamp(1rem, 4vw, 2.5rem) 5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
        >
          <div
            style={{
              fontFamily: F.italic,
              fontStyle: "italic",
              fontSize: "1.25rem",
              color: C.textMuted,
              lineHeight: 1.75,
              borderLeft: `3px solid ${C.gold}`,
              paddingLeft: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            {post.excerpt}
          </div>

          <div>
            {post.content.map((section, i) => (
              <RenderSection key={i} section={section} />
            ))}
          </div>
        </motion.div>

        <div style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.textMuted }}>
              Published by Pune Global Group {"\u00B7"} {post.date}
            </span>
            <a href="/contact" style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.gold, textDecoration: "none", fontWeight: 600 }}>
              Contact Us {"\u2192"}
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
                  color: C.textMuted,
                  background: C.cardBg,
                  border: `1px solid ${C.borderMid}`,
                  padding: "0.25rem 0.6rem",
                  borderRadius: "20px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {post.relatedProducts && post.relatedProducts.length > 0 && (() => {
          const related = post.relatedProducts!
            .map(slug => products.find(p => p.slug === slug))
            .filter(Boolean) as typeof products;
          if (related.length === 0) return null;
          return (
            <div style={{ marginTop: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "28px", height: "2px", background: C.gold, flexShrink: 0 }} />
                <h3 style={{ fontFamily: F.display, fontSize: "1.15rem", fontWeight: 700, color: C.cream, margin: 0 }}>
                  Explore Related Products
                </h3>
              </div>
              <div className="blog-related-products" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.875rem" }}>
                {related.map(p => {
                  const thumb = (p.images?.[0]) ?? p.image ?? null;
                  const isPP = p.category === "PP Packaging";
                  return (
                    <Link key={p.slug} href={p.category === "Paper & Board" ? `/products/paper-board/${p.slug}` : `/products/pp-corrugated/${p.slug}`} style={{ textDecoration: "none", background: C.navyMid, border: `1px solid ${C.borderMid}`, borderRadius: "4px", overflow: "hidden", display: "block", transition: "box-shadow 0.2s, transform 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                      {thumb && (
                        <div style={{ height: "130px", overflow: "hidden" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                      <div style={{ padding: "0.875rem 1rem 1rem" }}>
                        <p style={{ fontFamily: F.body, fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: isPP ? "#D4766A" : C.gold, margin: "0 0 0.3rem" }}>{p.category}</p>
                        <h4 style={{ fontFamily: F.display, fontSize: "0.95rem", fontWeight: 600, color: C.cream, margin: "0 0 0.25rem", lineHeight: 1.25 }}>{p.name}</h4>
                        <p style={{ fontFamily: F.body, fontSize: "0.74rem", color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{p.tagline}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            marginTop: "3rem",
            background: C.navyDark,
            borderRadius: "6px",
            padding: "3rem 2.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ display: "inline-block", fontFamily: F.body, fontStyle: "normal", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,247,242,0.65)", border: "1px solid rgba(250,247,242,0.25)", borderRadius: "999px", padding: "0.3em 1em", margin: "0 0 1rem" }}>
            Apply What You&apos;ve Learned
          </p>
          <h3 style={{ fontFamily: F.display, fontSize: "1.65rem", fontWeight: 700, color: C.cream, margin: "0 0 0.875rem", lineHeight: 1.2 }}>
            Talk to Our Packaging Experts
          </h3>
          <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: "rgba(250,247,242,0.55)", margin: "0 0 1.75rem", lineHeight: 1.7 }}>
            Have a specific board or packaging question? We give honest, technical answers {"\u2014"} no
            upselling. Reach our team at any time.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/contact"
              style={{
                fontFamily: F.body,
                background: C.gold,
                color: C.navy,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.875rem 1.75rem",
                borderRadius: "3px",
              }}
            >
              Send an Enquiry {"\u2192"}
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
                border: "1px solid rgba(250,247,242,0.2)",
              }}
            >
              +91 98233 83230
            </a>
          </div>
        </motion.div>

        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ marginTop: "4rem" }}
          >
            <h3
              style={{
                fontFamily: F.display,
                fontSize: "1.45rem",
                fontWeight: 700,
                color: C.cream,
                margin: "0 0 1.5rem",
                paddingBottom: "0.5rem",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              Related Reading
            </h3>
            <div className="blog-related-reading" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {relatedPosts.map((related, idx) => (
                <motion.div
                  key={related.slug}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, ease: EASE, delay: idx * 0.08 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                >
                  <Link href={`/blog/${related.slug}`} className="related-card">
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
                        color: C.cream,
                        margin: "0 0 0.4rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {related.title}
                    </h4>
                    <span style={{ fontFamily: F.body, fontSize: "0.75rem", color: C.textMuted }}>
                      {related.readTime} read {"\u2192"}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

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
            background: C.navy,
            fontFamily: F.body,
            gap: "1rem",
          }}
        >
          <h1 style={{ fontFamily: F.display, fontSize: "2.5rem", color: C.cream, margin: 0 }}>
            Article Not Found
          </h1>
          <Link
            href="/blog"
            style={{
              fontFamily: F.body,
              background: C.gold,
              color: C.navy,
              textDecoration: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "3px",
              fontWeight: 500,
            }}
          >
            {"\u2190"} View All Articles
          </Link>
        </div>
      )}
    </>
  );
}
