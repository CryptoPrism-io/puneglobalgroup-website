"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { machines, capabilities } from "@/lib/pgg-data";

// ————————————————————————————————————————————
// The Merchant — Design Tokens
// ————————————————————————————————————————————
const C = {
  cream: "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal: "#1C1A17",
  warm: "#4A4540",
  taupe: "#7A736D",
  saffron: "#E8960A", // numbers/stats/ordinals only
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
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ruleGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes eyebrowIn {
    from { opacity: 0; letter-spacing: 0.35em; }
    to   { opacity: 1; letter-spacing: 0.22em; }
  }

  .sr { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }

  .infra-nav-link {
    font-family: 'DM Sans', sans-serif;
    color: ${C.charcoal};
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.2s;
    letter-spacing: 0.01em;
  }
  .infra-nav-link:hover { opacity: 1; }

  .machine-card {
    background: #fff;
    border: 1px solid ${C.border};
    border-radius: 6px;
    padding: 1.75rem;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .machine-card:hover {
    border-color: ${C.borderMid};
    box-shadow: 0 12px 40px rgba(28,26,23,0.08);
    transform: translateY(-3px);
  }

  .cap-item + .cap-item { border-left: 1px solid ${C.border}; }
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
      { threshold: 0.12 }
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
          letterSpacing: "0.01em",
        }}
      >
        Pune Global Group
      </Link>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link href="/products" className="infra-nav-link">Products</Link>
        <Link href="/blog" className="infra-nav-link">Insights</Link>
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
// Machine Card
// ————————————————————————————————————————————
function MachineCard({ machine, delay }: { machine: typeof machines[0]; delay: number }) {
  return (
    <div
      className="machine-card sr"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          background: C.parchment,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
          marginBottom: "1.25rem",
          border: `1px solid ${C.border}`,
        }}
      >
        {machine.icon}
      </div>

      <h3
        style={{
          fontFamily: F.display,
          fontSize: "1.2rem",
          fontWeight: 600,
          color: C.charcoal,
          margin: "0 0 0.5rem",
          lineHeight: 1.25,
        }}
      >
        {machine.name}
      </h3>

      <p
        style={{
          fontFamily: F.body,
          fontSize: "0.84rem",
          color: C.taupe,
          margin: "0 0 1.25rem",
          lineHeight: 1.65,
        }}
      >
        {machine.description}
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {machine.specs.map((spec, i) => (
          <li
            key={i}
            style={{
              fontFamily: F.body,
              fontSize: "0.77rem",
              color: C.warm,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: C.saffron, fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>·</span>
            {spec}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ————————————————————————————————————————————
// Main Page
// ————————————————————————————————————————————
export default function InfrastructurePage() {
  useScrollReveal();

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: F.body }}>
      <style>{GLOBAL_CSS}</style>

      <Navbar />

      {/* ——— Hero ——— */}
      <section
        style={{
          background: C.cream,
          padding: "5rem 2.5rem 4rem",
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Paper grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.035 }} aria-hidden>
          <filter id="grain-infra"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-infra)" />
        </svg>

        <div style={{ position: "relative", maxWidth: "860px", margin: "0 auto" }}>
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: F.italic,
              fontStyle: "italic",
              fontSize: "1rem",
              fontWeight: 400,
              color: C.taupe,
              margin: "0 0 1.5rem",
              animation: "eyebrowIn 0.8s ease both",
            }}
          >
            Converting Infrastructure
          </p>

          {/* Rule */}
          <div
            style={{
              width: "48px",
              height: "2px",
              background: C.charcoal,
              marginBottom: "1.5rem",
              transformOrigin: "left",
              animation: "ruleGrow 0.6s ease 0.2s both",
            }}
          />

          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(2.4rem, 5vw, 3.75rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1.5rem",
              lineHeight: 1.08,
              animation: "fadeUp 0.8s ease 0.3s both",
            }}
          >
            Built for Speed.{" "}
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>Engineered for Precision.</em>
          </h1>

          <p
            style={{
              fontFamily: F.body,
              fontSize: "1.05rem",
              color: C.warm,
              lineHeight: 1.75,
              margin: "0 0 2rem",
              maxWidth: "620px",
              animation: "fadeUp 0.8s ease 0.45s both",
            }}
          >
            Our dedicated converting facility at BU Bhandari MIDC, Sanaswadi, Pune
            processes up to{" "}
            <strong style={{ color: C.saffron, fontFamily: F.display, fontWeight: 700 }}>200 tons per day</strong>
            {" "}— rewinding, sheeting, slitting, and pallet wrapping for same-city
            delivery or pan-India dispatch.
          </p>

          {/* Location badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              background: C.parchment,
              border: `1px solid ${C.borderMid}`,
              borderRadius: "3px",
              padding: "0.65rem 1.25rem",
              animation: "fadeUp 0.7s ease 0.6s both",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>📍</span>
            <span
              style={{
                fontFamily: F.body,
                fontSize: "0.84rem",
                fontWeight: 500,
                color: C.charcoal,
              }}
            >
              108 BU Bhandari MIDC, Sanaswadi, Pune 412208
            </span>
          </div>
        </div>
      </section>

      {/* ——— Capabilities Strip ——— */}
      <section style={{ background: "#fff", borderBottom: `1px solid ${C.border}` }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="cap-item"
              style={{
                flex: "1 1 160px",
                padding: "2rem 1.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{cap.icon}</div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: C.saffron,
                  lineHeight: 1,
                  marginBottom: "0.4rem",
                }}
              >
                {cap.value}
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: "0.71rem",
                  fontWeight: 500,
                  color: C.taupe,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {cap.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Machines Section ——— */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }} className="sr">
          <p
            style={{
              fontFamily: F.italic,
              fontStyle: "italic",
              fontSize: "1rem",
              color: C.taupe,
              margin: "0 0 0.75rem",
            }}
          >
            Equipment
          </p>
          <div
            style={{
              width: "32px",
              height: "2px",
              background: C.charcoal,
              margin: "0 auto 1.25rem",
              transformOrigin: "center",
            }}
          />
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1rem",
              lineHeight: 1.15,
            }}
          >
            Six Converting Machines.{" "}
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>One Integrated Facility.</em>
          </h2>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "0.95rem",
              color: C.taupe,
              maxWidth: "580px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            From master reel to pallet-wrapped finished goods — every process step is
            handled in-house at our Sanaswadi facility, eliminating inter-vendor delays.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {machines.map((machine, i) => (
            <MachineCard key={machine.name} machine={machine} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ——— Quality Section ——— */}
      <section
        style={{
          background: C.parchment,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "5rem 2.5rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5rem",
              alignItems: "start",
            }}
          >
            <div className="sr">
              <p
                style={{
                  fontFamily: F.italic,
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: C.taupe,
                  margin: "0 0 1rem",
                }}
              >
                Quality Assurance
              </p>
              <div style={{ width: "32px", height: "2px", background: C.charcoal, marginBottom: "1.25rem" }} />
              <h2
                style={{
                  fontFamily: F.display,
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  fontWeight: 700,
                  color: C.charcoal,
                  margin: "0 0 1.5rem",
                  lineHeight: 1.2,
                }}
              >
                Zero Defect{" "}
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 500 }}>Commitment</em>
              </h2>
              <p
                style={{
                  fontFamily: F.body,
                  fontSize: "0.9rem",
                  color: C.warm,
                  lineHeight: 1.8,
                  margin: "0 0 1.25rem",
                }}
              >
                Every reel that enters our facility is inspected against the mill&apos;s Certificate
                of Analysis before processing begins. Our sheeting and slitting operations
                maintain dimensional tolerances of ±0.3 mm, with every ream moisture-wrapped
                before despatch.
              </p>
              <p
                style={{
                  fontFamily: F.body,
                  fontSize: "0.9rem",
                  color: C.warm,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                For FSC-certified orders, full Chain of Custody documentation (FSC C064218)
                is maintained for every lot, enabling our clients to use the FSC logo on their
                finished packaging without separate certification.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }} className="sr">
              {[
                {
                  badge: "ISO 9001",
                  label: "Quality Management System",
                  desc: "Certified quality management across all processing and trading operations",
                  accent: "#2563EB",
                },
                {
                  badge: "FSC C064218",
                  label: "Chain of Custody Certification",
                  desc: "Full FSC traceability from mill to converted goods — enables FSC logo on client packaging",
                  accent: "#16A34A",
                },
                {
                  badge: "Zero Defect",
                  label: "Pre-Despatch Inspection",
                  desc: "100% visual and dimensional inspection before every shipment leaves our facility",
                  accent: C.charcoal,
                },
              ].map((item) => (
                <div
                  key={item.badge}
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    padding: "1.25rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.body,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#fff",
                      background: item.accent,
                      padding: "0.3rem 0.6rem",
                      borderRadius: "2px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: F.body,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: C.charcoal,
                        marginBottom: "0.3rem",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: F.body,
                        fontSize: "0.79rem",
                        color: C.taupe,
                        lineHeight: 1.55,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— Locations ——— */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }} className="sr">
          <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "1rem", color: C.taupe, margin: "0 0 0.75rem" }}>
            Our Locations
          </p>
          <div style={{ width: "32px", height: "2px", background: C.charcoal, margin: "0 auto 1.25rem" }} />
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Two Addresses.{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>One Point of Contact.</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Converting Facility — dark card */}
          <div
            className="sr"
            style={{
              background: C.dark,
              borderRadius: "6px",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: C.saffron,
              }}
            />
            <p
              style={{
                fontFamily: F.body,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(250,247,242,0.5)",
                margin: "0 0 1rem",
              }}
            >
              Converting Facility
            </p>
            <h3
              style={{
                fontFamily: F.display,
                fontSize: "1.45rem",
                fontWeight: 600,
                color: C.cream,
                margin: "0 0 0.75rem",
              }}
            >
              Sanaswadi Industrial Unit
            </h3>
            <p
              style={{
                fontFamily: F.body,
                fontSize: "0.875rem",
                color: "rgba(250,247,242,0.6)",
                lineHeight: 1.7,
                margin: "0 0 1.5rem",
              }}
            >
              108, BU Bhandari MIDC<br />
              Sanaswadi, Pune — 412 208<br />
              Maharashtra, India
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {["Rewinding & Sheeting", "Slitting & Guillotine", "Shrink & Stretch Wrapping", "200 Tons/Day Capacity"].map((item) => (
                <div
                  key={item}
                  style={{
                    fontFamily: F.body,
                    fontSize: "0.78rem",
                    color: "rgba(250,247,242,0.55)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ color: C.saffron, fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Office — cream card */}
          <div
            className="sr"
            style={{
              background: "#fff",
              borderRadius: "6px",
              padding: "2.5rem",
              border: `1px solid ${C.borderMid}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: C.charcoal,
              }}
            />
            <p
              style={{
                fontFamily: F.body,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.taupe,
                margin: "0 0 1rem",
              }}
            >
              Commercial Office
            </p>
            <h3
              style={{
                fontFamily: F.display,
                fontSize: "1.45rem",
                fontWeight: 600,
                color: C.charcoal,
                margin: "0 0 0.75rem",
              }}
            >
              Pune City Office
            </h3>
            <p
              style={{
                fontFamily: F.body,
                fontSize: "0.875rem",
                color: C.warm,
                lineHeight: 1.7,
                margin: "0 0 1.5rem",
              }}
            >
              206, Gulmohar Center Point<br />
              Pune — 411 006<br />
              Maharashtra, India
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a href="tel:+919823383230" style={{ fontFamily: F.body, fontSize: "0.875rem", color: C.charcoal, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                <span>📞</span> +91 98233 83230
              </a>
              <a href="mailto:contact.puneglobalgroup@gmail.com" style={{ fontFamily: F.body, fontSize: "0.875rem", color: C.charcoal, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                <span>✉</span> contact.puneglobalgroup@gmail.com
              </a>
              <div style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.taupe }}>
                GSTIN: 27FYYPS5999K1ZO
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Processing Workflow ——— */}
      <section
        style={{
          background: C.parchment,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "5rem 2.5rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }} className="sr">
            <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "1rem", color: C.taupe, margin: "0 0 0.75rem" }}>
              How We Work
            </p>
            <div style={{ width: "32px", height: "2px", background: C.charcoal, margin: "0 auto 1.25rem" }} />
            <h2
              style={{
                fontFamily: F.display,
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 700,
                color: C.charcoal,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              From Order to Despatch in{" "}
              <span style={{ color: C.saffron }}>24–36 Hours</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "0",
              position: "relative",
            }}
          >
            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                top: "22px",
                left: "10%",
                right: "10%",
                height: "1px",
                background: C.borderMid,
                zIndex: 0,
              }}
            />

            {[
              { step: "01", label: "Order\nConfirmed", icon: "📋" },
              { step: "02", label: "Stock\nAllocation", icon: "📦" },
              { step: "03", label: "Converting\n& Processing", icon: "⚙️" },
              { step: "04", label: "QC &\nWrapping", icon: "✅" },
              { step: "05", label: "Despatch\n& Delivery", icon: "🚚" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "0 0.5rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: C.charcoal,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: C.saffron,
                    marginBottom: "0.35rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: C.charcoal,
                    lineHeight: 1.4,
                    whiteSpace: "pre-line",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section
        style={{
          background: C.dark,
          padding: "5rem 2.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <p
            style={{
              fontFamily: F.italic,
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(250,247,242,0.55)",
              margin: 0,
            }}
          >
            Get Started
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: C.cream,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Ready to Place an Order?
          </h2>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "0.95rem",
              color: "rgba(250,247,242,0.6)",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            Share your grade, GSM, quantity, and timeline. We&apos;ll confirm availability
            and a processing schedule within 2 business hours.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/#contact"
              style={{
                fontFamily: F.body,
                background: C.cream,
                color: C.charcoal,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.9rem 2rem",
                borderRadius: "3px",
                letterSpacing: "0.02em",
              }}
            >
              Get a Quote →
            </Link>
            <a
              href="tel:+919823383230"
              style={{
                fontFamily: F.body,
                background: "transparent",
                color: C.cream,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 400,
                padding: "0.9rem 2rem",
                borderRadius: "3px",
                border: `1px solid rgba(250,247,242,0.2)`,
              }}
            >
              +91 98233 83230
            </a>
          </div>
        </div>
      </section>

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
          </a>{" "}
          · +91 98233 83230
        </p>
      </footer>
    </div>
  );
}
