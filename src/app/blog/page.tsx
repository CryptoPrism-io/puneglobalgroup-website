"use client";

import { useEffect } from "react";
import Link from "next/link";
import { blogPosts, BlogPost } from "@/lib/pgg-data";

const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  dark:      "#141210",
  border:    "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.18)",
};

const F = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body:    "'DM Sans', 'Plus Jakarta Sans', sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};

const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${C.cream}; }

  /* ── Animations ──────────────────── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ruleGrow {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  .sr { opacity: 0; transform: translateY(22px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }

  /* ── Featured post ───────────────── */
  .feat-wrap {
    display: grid;
    grid-template-columns: 55% 1fr;
    border: 1px solid ${C.border};
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    text-decoration: none;
    transition: box-shadow 0.35s ease, border-color 0.35s ease;
    min-height: 380px;
  }
  .feat-wrap:hover {
    box-shadow: 0 20px 60px rgba(28,26,23,0.11);
    border-color: ${C.borderMid};
  }
  .feat-img-wrap {
    position: relative;
    overflow: hidden;
    background: ${C.parchment};
  }
  .feat-img-wrap img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .feat-wrap:hover .feat-img-wrap img { transform: scale(1.05); }
  .feat-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(20,18,16,0.38) 0%, rgba(20,18,16,0.05) 100%);
  }

  /* ── Blog card grid ──────────────── */
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: ${C.border};
    border: 1px solid ${C.border};
    border-radius: 4px;
    overflow: hidden;
  }
  @media (max-width: 860px) {
    .blog-grid { grid-template-columns: repeat(2, 1fr); }
    .feat-wrap { grid-template-columns: 1fr; }
    .feat-img-wrap { min-height: 260px; }
    .blog-masthead-rule { display: none; }
  }
  @media (max-width: 560px) {
    .blog-grid { grid-template-columns: 1fr; }
  }

  .bcard {
    background: ${C.cream};
    text-decoration: none;
    display: flex;
    flex-direction: column;
    transition: background 0.25s ease;
    position: relative;
  }
  .bcard:hover { background: #fff; }

  /* Image thumbnail */
  .bcard-img {
    height: 210px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    background: ${C.parchment};
  }
  .bcard-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .bcard:hover .bcard-img img { transform: scale(1.06); }
  .bcard-accent {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
  }

  /* Card body */
  .bcard-body {
    padding: 1.5rem 1.5rem 1.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    border-top: 1px solid ${C.border};
  }

  /* Read arrow */
  .rarrow { display: inline-block; transition: transform 0.22s ease; }
  .bcard:hover .rarrow { transform: translateX(5px); }
  .feat-wrap:hover .rarrow { transform: translateX(5px); }

`;

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".sr").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link href={`/blog/${post.slug}`} className="bcard sr" style={{ transitionDelay: `${(index % 3) * 0.08}s` } as React.CSSProperties}>
      {/* Image */}
      <div className="bcard-img">
        {post.coverImage
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={post.coverImage} alt="" />
          : <div style={{ background: C.parchment, width: "100%", height: "100%" }} />
        }
        <div className="bcard-accent" style={{ background: post.categoryColor }} />
      </div>

      {/* Body */}
      <div className="bcard-body">
        {/* Category + read time */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span style={{
            fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
            letterSpacing: "0.11em", textTransform: "uppercase",
            color: post.categoryColor, background: `${post.categoryColor}14`,
            border: `1px solid ${post.categoryColor}28`, padding: "0.2rem 0.5rem", borderRadius: "2px",
          }}>
            {post.category}
          </span>
          <span style={{ fontFamily: F.body, fontSize: "0.72rem", color: C.taupe }}>
            {post.readTime} read
          </span>
        </div>

        {/* Date */}
        <div style={{ fontFamily: F.body, fontSize: "0.81rem", color: "#6B6B6B",
          letterSpacing: "0.04em", marginBottom: "0.5rem", fontWeight: 400 }}>
          {post.date}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: F.display, fontSize: "1.1rem", fontWeight: 700,
          color: C.charcoal, margin: 0, lineHeight: 1.35, flex: 1,
        }}>
          {post.title}
        </h2>

        {/* Excerpt — truncated */}
        <p style={{
          fontFamily: F.body, fontSize: "0.825rem", color: C.taupe,
          margin: 0, lineHeight: 1.65,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        } as React.CSSProperties}>
          {post.excerpt}
        </p>

        {/* CTA */}
        <div style={{
          fontFamily: F.body, fontSize: "0.78rem", fontWeight: 600,
          color: C.charcoal, letterSpacing: "0.03em", marginTop: "0.25rem",
          display: "flex", alignItems: "center", gap: "0.3rem",
        }}>
          Read Article <span className="rarrow">→</span>
        </div>
      </div>
    </Link>
  );
}

const monthOrder: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};
function parseDate(d: string) {
  const [month, year] = d.split(" ");
  return parseInt(year) * 100 + (monthOrder[month] ?? 0);
}

export default function BlogPage() {
  useScrollReveal();
  const sorted = [...blogPosts].sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const featured = sorted[0];
  const cards = sorted.slice(1);

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: F.body, paddingTop: "70px" }}>
      <style>{CSS}</style>

      {/* ══ Masthead ═══════════════════════════════════════════════════════ */}
      <section style={{
        padding: "5rem 2.5rem 3.5rem",
        borderBottom: `1px solid ${C.border}`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.03 }} aria-hidden>
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>

        {/* Large decorative numeral behind text */}
        <div aria-hidden style={{
          position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)",
          fontFamily: F.display, fontSize: "clamp(8rem, 18vw, 16rem)",
          fontWeight: 800, fontStyle: "italic",
          color: "rgba(28,26,23,0.035)", lineHeight: 1,
          pointerEvents: "none", userSelect: "none",
        }}>01</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>

          {/* Issue label */}
          <div style={{
            display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem",
            animation: "fadeUp 0.6s ease both",
          }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase", color: C.taupe,
            }}>
              Knowledge Hub
            </span>
            <div className="blog-masthead-rule" style={{
              flex: "0 0 48px", height: "1px", background: C.taupe, opacity: 0.4,
              animation: "ruleGrow 0.55s ease 0.2s both",
            }} />
            <span style={{
              fontFamily: F.italic, fontStyle: "italic",
              fontSize: "0.75rem", color: C.taupe, opacity: 0.7,
            }}>
              {blogPosts.length} Articles
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: F.display,
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            fontWeight: 800, color: C.charcoal,
            margin: "0 0 1.25rem", lineHeight: 1.05,
            animation: "fadeUp 0.75s ease 0.15s both",
            maxWidth: "680px",
          }}>
            Packaging<br />
            <em style={{ fontStyle: "italic", fontWeight: 500, color: C.warm }}>Intelligence</em>
          </h1>

          <p style={{
            fontFamily: F.body, fontSize: "0.95rem", color: C.warm,
            lineHeight: 1.75, margin: 0, maxWidth: "520px",
            animation: "fadeUp 0.75s ease 0.3s both",
          }}>
            Technical guides, compliance updates, and market intelligence
            for packaging buyers and converting professionals across India.
          </p>
        </div>
      </section>

      {/* ══ Content ════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>

        {/* ── Featured post ──────────────────────────── */}
        <div style={{ marginBottom: "1px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase", color: C.taupe,
            }}>Latest</span>
            <div style={{ flex: "0 0 32px", height: "1px", background: C.taupe, opacity: 0.35 }} />
            <span style={{
              fontFamily: F.italic, fontStyle: "italic",
              fontSize: "0.75rem", color: C.taupe, opacity: 0.6,
            }}>#01</span>
          </div>

          <Link href={`/blog/${featured.slug}`} className="feat-wrap sr">
            {/* Left: image */}
            <div className="feat-img-wrap">
              {featured.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.coverImage} alt="" />
              )}
              <div className="feat-overlay" />
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "3px", background: featured.categoryColor,
              }} />
            </div>

            {/* Right: content */}
            <div style={{
              padding: "3rem 2.75rem",
              display: "flex", flexDirection: "column", justifyContent: "center",
              gap: "1.25rem", borderLeft: `1px solid ${C.border}`,
            }}>
              {/* Category */}
              <span style={{
                fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
                letterSpacing: "0.13em", textTransform: "uppercase",
                color: featured.categoryColor,
              }}>
                {featured.category}
              </span>

              {/* Date */}
              <div style={{ fontFamily: F.body, fontSize: "0.81rem", color: "#6B6B6B",
                marginBottom: "0.75rem", fontWeight: 400 }}>
                {featured.date}
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: F.display,
                fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
                fontWeight: 800, color: C.charcoal,
                margin: 0, lineHeight: 1.18,
              }}>
                {featured.title}
              </h2>

              {/* Rule */}
              <div style={{ width: "36px", height: "2px", background: C.charcoal, opacity: 0.2 }} />

              {/* Excerpt */}
              <p style={{
                fontFamily: F.body, fontSize: "0.9rem", color: C.warm,
                margin: 0, lineHeight: 1.75,
              }}>
                {featured.excerpt}
              </p>

              {/* Meta + CTA */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <span style={{ fontFamily: F.body, fontSize: "0.75rem", color: C.taupe }}>
                  {featured.date} · {featured.readTime} read
                </span>
                <span style={{
                  fontFamily: F.body, fontSize: "0.82rem", fontWeight: 600,
                  color: C.charcoal, letterSpacing: "0.02em",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                  Read Article <span className="rarrow">→</span>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Cards grid ──────────────────────────────── */}
        <div style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase", color: C.taupe,
            }}>More Articles</span>
            <div style={{ flex: "0 0 32px", height: "1px", background: C.taupe, opacity: 0.35 }} />
          </div>

          <div className="blog-grid">
            {cards.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div className="sr" style={{
          marginTop: "4rem",
          background: C.dark,
          borderRadius: "4px",
          padding: "3.5rem",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "center",
        }}>
          <div>
            <p style={{ display: "inline-block", fontFamily: F.body, fontStyle: "normal", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,247,242,0.65)", border: "1px solid rgba(250,247,242,0.25)", borderRadius: "999px", padding: "0.3em 1em", margin: "0 0 0.9rem" }}>
              Need Expert Advice?
            </p>
            <h3 style={{
              fontFamily: F.display, fontSize: "1.75rem", fontWeight: 700,
              color: C.cream, margin: "0 0 0.75rem", lineHeight: 1.2,
            }}>
              Talk to Our Technical Team
            </h3>
            <p style={{
              fontFamily: F.body, fontSize: "0.875rem",
              color: "rgba(250,247,242,0.5)", margin: 0, lineHeight: 1.7,
            }}>
              Hands-on expertise across pharma, FMCG, automotive, and electronics packaging.
              Honest answers — not a sales pitch.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
            <Link href="/#contact" style={{
              fontFamily: F.body, background: C.cream, color: C.charcoal,
              textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
              padding: "0.9rem 1.75rem", borderRadius: "3px", whiteSpace: "nowrap",
            }}>
              Ask a Question →
            </Link>
            <a href="tel:+919823383230" style={{
              fontFamily: F.body, fontSize: "0.78rem",
              color: "rgba(250,247,242,0.35)", textDecoration: "none", textAlign: "center",
            }}>
              +91 98233 83230
            </a>
          </div>
        </div>
      </main>

      {/* ══ Footer ═════════════════════════════════════════════════════════ */}
      <footer style={{
        background: C.dark, borderTop: `1px solid rgba(250,247,242,0.07)`,
        padding: "2rem 2.5rem", textAlign: "center",
      }}>
        <p style={{
          fontFamily: F.body, fontSize: "0.75rem",
          color: "rgba(250,247,242,0.3)", margin: 0,
        }}>
          © {new Date().getFullYear()} Pune Global Group · GSTIN 27FYYPS5999K1ZO ·{" "}
          <a href="mailto:yogesh.sahu@puneglobalgroup.in" style={{ color: "rgba(250,247,242,0.3)", textDecoration: "none" }}>
            yogesh.sahu@puneglobalgroup.in
          </a>
        </p>
      </footer>
    </div>
  );
}
