"use client";

import { useState } from "react";
import Link from "next/link";
import { machines, capabilities } from "@/lib/pgg-data";

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
          }}
        >
          Get a Quote
        </a>
      </div>
    </nav>
  );
}

function MachineCard({ machine }: { machine: typeof machines[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${hovered ? C.saffron : C.border}`,
        borderRadius: "8px",
        padding: "1.75rem",
        transition: "all 0.25s ease",
        boxShadow: hovered
          ? "0 12px 32px rgba(58,53,48,0.1)"
          : "0 2px 8px rgba(58,53,48,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "48px",
          height: "48px",
          background: hovered ? "rgba(244,162,54,0.15)" : C.light,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          marginBottom: "1.25rem",
          transition: "background 0.25s ease",
          border: `1px solid ${hovered ? "rgba(244,162,54,0.3)" : C.border}`,
        }}
      >
        {machine.icon}
      </div>

      <h3
        style={{
          fontFamily: FONT.cormorant,
          fontSize: "1.3rem",
          fontWeight: 700,
          color: C.charcoal,
          margin: "0 0 0.5rem",
        }}
      >
        {machine.name}
      </h3>

      <p
        style={{
          fontFamily: FONT.outfit,
          fontSize: "0.85rem",
          color: C.taupe,
          margin: "0 0 1.25rem",
          lineHeight: 1.6,
        }}
      >
        {machine.description}
      </p>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.45rem",
        }}
      >
        {machine.specs.map((spec, i) => (
          <li
            key={i}
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.78rem",
              color: C.charcoal,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                color: C.saffron,
                fontWeight: 700,
                marginTop: "1px",
                flexShrink: 0,
              }}
            >
              ·
            </span>
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
          background: `linear-gradient(135deg, ${C.dark} 0%, #3A3530 60%, #2C2825 100%)`,
          padding: "5rem 2rem 4.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 15% 40%, rgba(244,162,54,0.09) 0%, transparent 45%),
                              radial-gradient(circle at 85% 70%, rgba(244,162,54,0.06) 0%, transparent 35%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
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
            Converting Infrastructure
          </p>
          <h1
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              fontWeight: 700,
              color: "#FFFDF8",
              margin: "0 0 1.25rem",
              lineHeight: 1.1,
            }}
          >
            Built for Speed.{" "}
            <span style={{ color: C.saffron }}>Engineered for Precision.</span>
          </h1>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "1.05rem",
              color: "rgba(255,253,248,0.75)",
              lineHeight: 1.75,
              margin: "0 0 2rem",
              maxWidth: "680px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Our dedicated converting facility at BU Bhandari MIDC, Sanaswadi, Pune
            processes up to 200 tons per day — rewinding, sheeting, slitting, and pallet
            wrapping for same-city delivery or pan-India dispatch.
          </p>

          {/* Location badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(244,162,54,0.12)",
              border: "1px solid rgba(244,162,54,0.3)",
              borderRadius: "4px",
              padding: "0.6rem 1.25rem",
            }}
          >
            <span style={{ fontSize: "1rem" }}>📍</span>
            <span
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "#FFFDF8",
              }}
            >
              108 BU Bhandari MIDC, Sanaswadi, Pune 412208
            </span>
          </div>
        </div>
      </section>

      {/* ——— Capabilities Strip ——— */}
      <section
        style={{
          background: "#FFFFFF",
          borderBottom: `1px solid ${C.border}`,
          padding: "0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          {capabilities.map((cap, i) => (
            <div
              key={i}
              style={{
                padding: "1.75rem 1.25rem",
                textAlign: "center",
                borderRight: i < capabilities.length - 1 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{cap.icon}</div>
              <div
                style={{
                  fontFamily: FONT.cormorant,
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: C.charcoal,
                  lineHeight: 1.1,
                  marginBottom: "0.3rem",
                }}
              >
                {cap.value}
              </div>
              <div
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: C.taupe,
                  letterSpacing: "0.06em",
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
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.saffron,
              margin: "0 0 0.75rem",
            }}
          >
            Equipment
          </p>
          <h2
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: "0 0 1rem",
              lineHeight: 1.2,
            }}
          >
            Six Converting Machines.{" "}
            <span style={{ color: C.saffron }}>One Integrated Facility.</span>
          </h2>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.95rem",
              color: C.taupe,
              maxWidth: "600px",
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
            gap: "1.5rem",
          }}
        >
          {machines.map((machine) => (
            <MachineCard key={machine.name} machine={machine} />
          ))}
        </div>
      </section>

      {/* ——— Quality Section ——— */}
      <section
        style={{
          background: C.light,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "4rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.saffron,
                  margin: "0 0 0.75rem",
                }}
              >
                Quality Assurance
              </p>
              <h2
                style={{
                  fontFamily: FONT.cormorant,
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 700,
                  color: C.charcoal,
                  margin: "0 0 1.25rem",
                  lineHeight: 1.2,
                }}
              >
                Zero Defect Commitment
              </h2>
              <p
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.9rem",
                  color: C.taupe,
                  lineHeight: 1.75,
                  margin: "0 0 1.5rem",
                }}
              >
                Every reel that enters our facility is inspected against the mill's Certificate
                of Analysis before processing begins. Our sheeting and slitting operations
                maintain dimensional tolerances of ±0.3 mm, with every ream moisture-wrapped
                before despatch to preserve paper condition.
              </p>
              <p
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.9rem",
                  color: C.taupe,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                For FSC-certified orders, full Chain of Custody documentation (FSC C064218)
                is maintained for every lot, enabling our clients to use the FSC logo on their
                finished packaging without separate certification.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                {
                  badge: "ISO 9001",
                  label: "Quality Management System",
                  desc: "Certified quality management across all processing and trading operations",
                  color: "#2563EB",
                },
                {
                  badge: "FSC C064218",
                  label: "Chain of Custody Certification",
                  desc: "Full FSC traceability from mill to converted goods — enables FSC logo on client packaging",
                  color: "#16A34A",
                },
                {
                  badge: "Zero Defect",
                  label: "Pre-Despatch Inspection",
                  desc: "100% visual and dimensional inspection before every shipment leaves our facility",
                  color: C.saffron,
                },
              ].map((item) => (
                <div
                  key={item.badge}
                  style={{
                    background: "#FFFFFF",
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    padding: "1.25rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.outfit,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#FFFFFF",
                      background: item.color,
                      padding: "0.3rem 0.6rem",
                      borderRadius: "3px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: FONT.outfit,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: C.charcoal,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT.outfit,
                        fontSize: "0.8rem",
                        color: C.taupe,
                        lineHeight: 1.5,
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
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.saffron,
              margin: "0 0 0.75rem",
            }}
          >
            Our Locations
          </p>
          <h2
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 700,
              color: C.charcoal,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Two Addresses. One Point of Contact.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Converting Facility */}
          <div
            style={{
              background: C.dark,
              borderRadius: "10px",
              padding: "2.25rem",
              border: `1px solid rgba(244,162,54,0.2)`,
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
                height: "3px",
                background: `linear-gradient(90deg, ${C.saffron}, #f9c96e)`,
              }}
            />
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.saffron,
                margin: "0 0 1rem",
              }}
            >
              Converting Facility
            </p>
            <h3
              style={{
                fontFamily: FONT.cormorant,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#FFFDF8",
                margin: "0 0 0.75rem",
              }}
            >
              Sanaswadi Industrial Unit
            </h3>
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.875rem",
                color: "rgba(255,253,248,0.7)",
                lineHeight: 1.7,
                margin: "0 0 1.5rem",
              }}
            >
              108, BU Bhandari MIDC<br />
              Sanaswadi, Pune — 412 208<br />
              Maharashtra, India
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {["Rewinding & Sheeting", "Slitting & Guillotine", "Shrink & Stretch Wrapping", "200 Tons/Day Capacity"].map((item) => (
                <div
                  key={item}
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.78rem",
                    color: "rgba(255,253,248,0.65)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span style={{ color: C.saffron }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Office */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "2.25rem",
              border: `1px solid ${C.border}`,
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
                height: "3px",
                background: `linear-gradient(90deg, ${C.sindoor}, #ff6b8a)`,
              }}
            />
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.sindoor,
                margin: "0 0 1rem",
              }}
            >
              Commercial Office
            </p>
            <h3
              style={{
                fontFamily: FONT.cormorant,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: C.charcoal,
                margin: "0 0 0.75rem",
              }}
            >
              Pune City Office
            </h3>
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.875rem",
                color: C.taupe,
                lineHeight: 1.7,
                margin: "0 0 1.5rem",
              }}
            >
              206, Gulmohar Center Point<br />
              Pune — 411 006<br />
              Maharashtra, India
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href="tel:+919823383230"
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.875rem",
                  color: C.charcoal,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: C.saffron }}>📞</span> +91 98233 83230
              </a>
              <a
                href="mailto:contact.puneglobalgroup@gmail.com"
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.875rem",
                  color: C.charcoal,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: C.saffron }}>✉</span> contact.puneglobalgroup@gmail.com
              </a>
              <div
                style={{
                  fontFamily: FONT.outfit,
                  fontSize: "0.78rem",
                  color: C.taupe,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: C.taupe }}>GSTIN:</span> 27FYYPS5999K1ZO
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Processing Workflow ——— */}
      <section
        style={{
          background: C.light,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "4rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p
              style={{
                fontFamily: FONT.outfit,
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.saffron,
                margin: "0 0 0.75rem",
              }}
            >
              How We Work
            </p>
            <h2
              style={{
                fontFamily: FONT.cormorant,
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 700,
                color: C.charcoal,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              From Order to Despatch in 24–36 Hours
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
                top: "28px",
                left: "10%",
                right: "10%",
                height: "2px",
                background: `linear-gradient(90deg, ${C.saffron}, rgba(244,162,54,0.2))`,
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
                    width: "56px",
                    height: "56px",
                    background: C.saffron,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    marginBottom: "1rem",
                    boxShadow: "0 4px 16px rgba(244,162,54,0.3)",
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: C.saffron,
                    marginBottom: "0.35rem",
                  }}
                >
                  STEP {item.step}
                </div>
                <div
                  style={{
                    fontFamily: FONT.outfit,
                    fontSize: "0.8rem",
                    fontWeight: 600,
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
          padding: "4.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "620px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.saffron,
              margin: 0,
            }}
          >
            Get Started
          </p>
          <h2
            style={{
              fontFamily: FONT.cormorant,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "#FFFDF8",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Ready to Place an Order?
          </h2>
          <p
            style={{
              fontFamily: FONT.outfit,
              fontSize: "0.95rem",
              color: "rgba(255,253,248,0.7)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Share your grade, GSM, quantity, and timeline. We'll confirm availability
            and a processing schedule within 2 business hours.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="/#contact"
              style={{
                fontFamily: FONT.outfit,
                background: C.saffron,
                color: C.dark,
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                padding: "0.9rem 2rem",
                borderRadius: "4px",
                letterSpacing: "0.02em",
              }}
            >
              Get a Quote →
            </a>
            <a
              href="tel:+919823383230"
              style={{
                fontFamily: FONT.outfit,
                background: "transparent",
                color: "#FFFDF8",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                padding: "0.9rem 2rem",
                borderRadius: "4px",
                border: "1px solid rgba(255,253,248,0.3)",
              }}
            >
              📞 +91 98233 83230
            </a>
          </div>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer
        style={{
          background: C.dark,
          borderTop: `1px solid rgba(244,162,54,0.12)`,
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
          </a>{" "}
          · +91 98233 83230
        </p>
      </footer>
    </div>
  );
}
