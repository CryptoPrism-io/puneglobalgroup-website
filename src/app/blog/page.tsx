"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogPosts, BlogPost } from "@/lib/pgg-data";

const EASE = [0.22, 1, 0.36, 1] as const;

const C = {
  cream:     "#FAF7F2",
  navy:      "#0F1A2E",
  navyLight: "#152238",
  navyMid:   "#1A2A40",
  navyDark:  "#0A1220",
  steel:     "#5B9BD5",
  gold:      "#C8B89A",
  border:    "rgba(250,247,242,0.08)",
  borderMid: "rgba(250,247,242,0.12)",
  textMain:  "#FAF7F2",
  textMuted: "rgba(250,247,242,0.60)",
  textFaint: "rgba(250,247,242,0.40)",
  cardBg:    "rgba(250,247,242,0.04)",
};

const F = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body:    "'DM Sans', 'Plus Jakarta Sans', sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};

const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${C.navy}; }

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

  .gold-text {
    background: linear-gradient(135deg, ${C.cream} 0%, ${C.gold} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }

  .feat-wrap {
    display: grid;
    grid-template-columns: 55% 1fr;
    border: 1px solid ${C.borderMid};
    border-radius: 4px;
    overflow: hidden;
    background: ${C.navyMid};
    text-decoration: none;
    transition: box-shadow 0.35s ease, border-color 0.35s ease;
    min-height: 380px;
  }
  .feat-wrap:hover {
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    border-color: rgba(250,247,242,0.18);
  }
  .feat-img-wrap {
    position: relative;
    overflow: hidden;
    background: ${C.navyMid};
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
    background: linear-gradient(135deg, rgba(10,18,32,0.38) 0%, rgba(10,18,32,0.05) 100%);
  }

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
    background: ${C.navy};
    text-decoration: none;
    display: flex;
    flex-direction: column;
    transition: background 0.25s ease;
    position: relative;
  }
  .bcard:hover { background: ${C.navyLight}; }

  .bcard-img {
    height: 210px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    background: ${C.navyMid};
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

  .bcard-body {
    padding: 1.5rem 1.5rem 1.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    border-top: 1px solid ${C.border};
  }

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

const MotionLink = motion.create(Link);

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <MotionLink
      href={`/blog/${post.slug}`}
      className="bcard"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 25 } }}
    >
      <div className="bcard-img">
        {post.coverImage
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={post.coverImage} alt="" />
          : <div style={{ background: C.navyMid, width: "100%", height: "100%" }} />
        }
        <div className="bcard-accent" style={{ background: post.categoryColor }} />
      </div>
      <div className="bcard-body">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span style={{
            fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
            letterSpacing: "0.11em", textTransform: "uppercase",
            color: post.categoryColor, background: `${post.categoryColor}14`,
            border: `1px solid ${post.categoryColor}28`, padding: "0.2rem 0.5rem", borderRadius: "2px",
          }}>
            {post.category}
          </span>
          <span style={{ fontFamily: F.body, fontSize: "0.72rem", color: C.textMuted }}>
            {post.readTime} read
          </span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: "0.81rem", color: C.textFaint,
          letterSpacing: "0.04em", marginBottom: "0.5rem", fontWeight: 400 }}>
          {post.date}
        </div>
        <h2 style={{
          fontFamily: F.display, fontSize: "1.1rem", fontWeight: 700,
          color: C.cream, margin: 0, lineHeight: 1.35, flex: 1,
          WebkitTextFillColor: "inherit",
        } as React.CSSProperties}>
          {post.title}
        </h2>
        <p style={{
          fontFamily: F.body, fontSize: "0.825rem", color: C.textMuted,
          margin: 0, lineHeight: 1.65,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        } as React.CSSProperties}>
          {post.excerpt}
        </p>
        <div style={{
          fontFamily: F.body, fontSize: "0.78rem", fontWeight: 600,
          color: C.cream, letterSpacing: "0.03em", marginTop: "0.25rem",
          display: "flex", alignItems: "center", gap: "0.3rem",
        }}>
          Read Article <span className="rarrow">{"\u2192"}</span>
        </div>
      </div>
    </MotionLink>
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
    <div className="section-dark" style={{ background: C.navy, minHeight: "100vh", fontFamily: F.body, paddingTop: "70px" }}>
      <style>{CSS}</style>

      <section style={{
        background: C.navyDark,
        padding: "clamp(50px, 7vh, 80px) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 3vh, 2.5rem)",
        position: "relative", overflow: "hidden",
      }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.04 }} aria-hidden>
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
        <div aria-hidden style={{
          position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)",
          fontFamily: F.display, fontSize: "clamp(8rem, 18vw, 16rem)",
          fontWeight: 800, fontStyle: "italic",
          color: "rgba(250,247,242,0.035)", lineHeight: 1,
          pointerEvents: "none", userSelect: "none",
        }}>01</div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            style={{
              display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem",
            }}
          >
            <span style={{
              fontFamily: F.body, fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(250,247,242,0.55)",
            }}>
              Knowledge Hub
            </span>
            <div className="blog-masthead-rule" style={{
              flex: "0 0 48px", height: "1px", background: "rgba(250,247,242,0.3)",
              animation: "ruleGrow 0.55s ease 0.2s both",
            }} />
            <span style={{
              fontFamily: F.italic, fontStyle: "italic",
              fontSize: "0.75rem", color: "rgba(250,247,242,0.45)",
            }}>
              {blogPosts.length} Articles
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            style={{
              fontFamily: F.display,
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              fontWeight: 800, color: C.cream,
              margin: "0 0 1.25rem", lineHeight: 1.05,
              maxWidth: "680px",
            }}
          >
            Packaging<br />
            <em style={{ fontStyle: "italic", fontWeight: 500 }}><span className="gold-text">Intelligence</span></em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            style={{
              fontFamily: F.body, fontSize: "0.95rem", color: "rgba(250,247,242,0.65)",
              lineHeight: 1.75, margin: 0, maxWidth: "520px",
            }}
          >
            Technical guides, compliance updates, and market intelligence
            for packaging buyers and converting professionals across India.
          </motion.p>
        </div>
      </section>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>
        <div style={{ marginBottom: "1px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase", color: C.textFaint,
            }}>Latest</span>
            <div style={{ flex: "0 0 32px", height: "1px", background: C.steel, opacity: 0.5 }} />
            <span style={{
              fontFamily: F.italic, fontStyle: "italic",
              fontSize: "0.75rem", color: C.textFaint, opacity: 0.6,
            }}>#01</span>
          </div>
          <MotionLink
            href={`/blog/${featured.slug}`}
            className="feat-wrap"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
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
            <div style={{
              padding: "3rem 2.75rem",
              display: "flex", flexDirection: "column", justifyContent: "center",
              gap: "1.25rem", borderLeft: `1px solid ${C.border}`,
            }}>
              <span style={{
                fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
                letterSpacing: "0.13em", textTransform: "uppercase",
                color: featured.categoryColor,
              }}>
                {featured.category}
              </span>
              <div style={{ fontFamily: F.body, fontSize: "0.81rem", color: C.textFaint,
                marginBottom: "0.75rem", fontWeight: 400 }}>
                {featured.date}
              </div>
              <h2 className="h2-dark" style={{
                fontFamily: F.display,
                fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
                fontWeight: 800, color: C.cream,
                margin: 0, lineHeight: 1.18,
              }}>
                {featured.title}
              </h2>
              <div style={{ width: "36px", height: "2px", background: C.gold, opacity: 0.35 }} />
              <p style={{
                fontFamily: F.body, fontSize: "0.9rem", color: "rgba(250,247,242,0.75)",
                margin: 0, lineHeight: 1.75,
              }}>
                {featured.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <span style={{ fontFamily: F.body, fontSize: "0.75rem", color: C.textMuted }}>
                  {featured.date} {"\u00B7"} {featured.readTime} read
                </span>
                <span style={{
                  fontFamily: F.body, fontSize: "0.82rem", fontWeight: 600,
                  color: C.cream, letterSpacing: "0.02em",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                  Read Article <span className="rarrow">{"\u2192"}</span>
                </span>
              </div>
            </div>
          </MotionLink>
        </div>

        <div style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span style={{
              fontFamily: F.body, fontSize: "0.63rem", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase", color: C.textFaint,
            }}>More Articles</span>
            <div style={{ flex: "0 0 32px", height: "1px", background: C.steel, opacity: 0.5 }} />
          </div>
          <div className="blog-grid">
            {cards.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            marginTop: "4rem",
            background: C.navyDark,
            borderRadius: "4px",
            padding: "3.5rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "center",
          }}
        >
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
              Honest answers {"\u2014"} not a sales pitch.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
            <Link href="/#contact" style={{
              fontFamily: F.body, background: C.gold, color: C.navy,
              textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
              padding: "0.9rem 1.75rem", borderRadius: "3px", whiteSpace: "nowrap",
            }}>
              Ask a Question {"\u2192"}
            </Link>
            <a href="tel:+919823383230" style={{
              fontFamily: F.body, fontSize: "0.78rem",
              color: "rgba(250,247,242,0.35)", textDecoration: "none", textAlign: "center",
            }}>
              +91 98233 83230
            </a>
          </div>
        </motion.div>
      </main>

      <footer style={{
        background: C.navyDark, borderTop: `1px solid ${C.border}`,
        padding: "2rem 2.5rem", textAlign: "center",
      }}>
        <p style={{
          fontFamily: F.body, fontSize: "0.75rem",
          color: "rgba(250,247,242,0.3)", margin: 0,
        }}>
          {"\u00A9"} {new Date().getFullYear()} Pune Global Group {"\u00B7"} GSTIN 27FYYPS5999K1ZO {"\u00B7"}{" "}
          <a href="mailto:yogesh.sahu@puneglobalgroup.in" style={{ color: "rgba(250,247,242,0.3)", textDecoration: "none" }}>
            yogesh.sahu@puneglobalgroup.in
          </a>
        </p>
      </footer>
    </div>
  );
}
