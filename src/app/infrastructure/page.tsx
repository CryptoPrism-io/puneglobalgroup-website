"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { machines, capabilities } from "@/lib/pgg-data";

// ————————————————————————————————————————————
// Image data
// ————————————————————————————————————————————
const MACHINE_IMAGES: Record<string, string[]> = {
  "Flat Bed Punch Press":             ["/infrastructure/machines/flat-bed-punch-press-wide.jpg",       "/infrastructure/machines/flat-bed-punch-press-detail.jpg",       "/infrastructure/machines/flat-bed-punch-press-operation.jpg"],
  "Plastic Ultrasonic Welder":        ["/infrastructure/machines/ultrasonic-welder-wide.jpg",          "/infrastructure/machines/ultrasonic-welder-detail.jpg",          "/infrastructure/machines/ultrasonic-welder-operation.jpg"],
  "Screen Printing Unit":             ["/infrastructure/machines/screen-printing-wide.jpg",            "/infrastructure/machines/screen-printing-detail.jpg",            "/infrastructure/machines/screen-printing-operation.jpg"],
  "Guillotine Sheeter":               ["/infrastructure/machines/guillotine-sheeter-wide.jpg",         "/infrastructure/machines/guillotine-sheeter-detail.jpg",         "/infrastructure/machines/guillotine-sheeter-operation.jpg"],
  "Synchro Sheeter":                  ["/infrastructure/machines/synchro-sheeter-wide.jpg",            "/infrastructure/machines/synchro-sheeter-detail.jpg",            "/infrastructure/machines/synchro-sheeter-operation.jpg"],
  "Stretch Wrap & Forklift Despatch": ["/infrastructure/machines/stretch-wrap-forklift-wide.jpg",      "/infrastructure/machines/stretch-wrap-forklift-detail.jpg",      "/infrastructure/machines/stretch-wrap-forklift-operation.jpg"],
};
const MC_LABELS = ["Wide View", "Detail", "In Operation"];

const FACILITY_SHOTS = [
  { src: "/infrastructure/facility/converting-floor.jpg",  label: "Converting Floor"    },
  { src: "/infrastructure/facility/storage-warehouse.jpg", label: "Storage & Warehouse" },
  { src: "/infrastructure/facility/dispatch-area.jpg",     label: "Dispatch Area"       },
  { src: "/infrastructure/facility/quality-control.jpg",   label: "Quality Control"     },
  { src: "/infrastructure/facility/freight-lift.jpg",      label: "Freight Lift"        },
  { src: "/infrastructure/facility/forklift.jpg",          label: "Forklift"            },
];

// ————————————————————————————————————————————
// The Merchant — Design Tokens
// ————————————————————————————————————————————
const C = {
  cream: "#FAF7F2",
  parchment: "#EDE5D8",
  charcoal: "#1C1A17",
  warm: "#7A736D",
  taupe: "#7A736D",
  saffron: "#1C1A17",
  saffrondark: "#0D0B09",
  dark: "#1C1A17",
  deepWarm: "#1C1A17",
  navy: "#1C1A17",
  granite: "#7A736D",
  goldStart: "#FAF7F2",
  goldEnd: "#C8B89A",
  border: "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.18)",
};

const F = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', 'Plus Jakarta Sans', sans-serif",
  italic: "'Cormorant Garamond', Georgia, serif",
};

const GLOBAL_CSS = `
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

  /* ── Heritage Premium ─────────────────────────────── */
  .gold-text {
    background: linear-gradient(135deg, ${C.goldStart} 0%, ${C.goldEnd} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .saffron-badge {
    display: inline-flex; align-items: center;
    background: ${C.saffron}; color: #fff;
    font-family: ${F.body}; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(28,26,23,0.07);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(28,26,23,0.13);
  }

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
    border-radius: 6px;
    padding: 1.75rem;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .machine-card:hover {
    border-color: ${C.borderMid};
  }

  .cap-item + .cap-item { border-left: 1px solid ${C.border}; }

  /* Machine card carousel */
  .machine-card.has-carousel { padding: 0; }
  .machine-card.has-carousel .mc-content { padding: 1.5rem 1.75rem 1.75rem; }
  .mc-carousel { position: relative; width: 100%; height: 210px; overflow: hidden; border-radius: 5px 5px 0 0; background: ${C.parchment}; }
  .mc-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1); pointer-events: none; }
  .mc-img.active { opacity: 1; }
  .mc-label { position: absolute; bottom: 8px; left: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.58rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(250,247,242,0.85); background: rgba(20,18,16,0.5); padding: 2px 8px; border-radius: 2px; }
  .mc-dots { display: flex; gap: 5px; align-items: center; justify-content: center; padding: 8px 0 2px; }
  .mc-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(28,26,23,0.18); border: none; padding: 0; cursor: pointer; transition: background 0.25s, width 0.25s, border-radius 0.25s; }
  .mc-dot.active { background: ${C.charcoal}; width: 14px; border-radius: 3px; }

  /* Facility gallery */
  .fac-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  @media(max-width: 960px) { .hero-img-col { display: none !important; } .infra-hero-grid { grid-template-columns: 1fr !important; } }
  @media(max-width: 768px) { .fac-grid { grid-template-columns: repeat(2, 1fr); } }
  .fac-item { position: relative; border-radius: 4px; overflow: hidden; aspect-ratio: 4/3; }
  .fac-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.55s ease; }
  .fac-item:hover img { transform: scale(1.04); }
  .fac-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.55rem 0.8rem; font-family: 'DM Sans', sans-serif; font-size: 0.68rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(250,247,242,0.9); background: linear-gradient(to top, rgba(20,18,16,0.68) 0%, transparent 100%); }

  .infra-nav-links { display: flex; gap: 2rem; align-items: center; }
  .infra-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer;
    background: none; border: none; padding: 4px; }
  .infra-hamburger span { display: block; width: 22px; height: 1.5px; background: ${C.charcoal}; }
  .infra-dropdown { display: none; position: absolute; top: 64px; left: 0; right: 0;
    background: ${C.cream}; border-bottom: 1px solid ${C.borderMid};
    padding: 1rem clamp(1rem, 3vw, 2.5rem); flex-direction: column; gap: 0.85rem;
    box-shadow: 0 4px 20px rgba(28,26,23,0.07); z-index: 99; }
  .infra-dropdown.open { display: flex; }

  /* === Mobile responsive === */
  @media(max-width: 600px) {
    .infra-nav-links { display: none !important; }
    .infra-hamburger { display: flex !important; }
  }
  @media(max-width: 768px) {
    .infra-nav { padding: 0 1rem !important; position: relative; }
    .infra-quality-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
    .infra-locations-grid { grid-template-columns: 1fr !important; }
    .infra-workflow { grid-template-columns: repeat(3, 1fr) !important; gap: 1.5rem 0 !important; }
    .infra-bridge-grid { grid-template-columns: 1fr !important; }
    .fac-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .infra-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
  }
  @media(max-width: 480px) {
    .infra-workflow { grid-template-columns: repeat(2, 1fr) !important; }
    .fac-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
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
// Machine Card (with image carousel)
// ————————————————————————————————————————————
function MachineCard({ machine, delay }: { machine: typeof machines[0]; delay: number }) {
  const imgs = MACHINE_IMAGES[machine.name] ?? [];
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (imgs.length < 2) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % imgs.length), 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [imgs.length]);

  const hasImgs = imgs.length > 0;

  return (
    <div className={`machine-card card-heritage sr${hasImgs ? " has-carousel" : ""}`} style={{ animationDelay: `${delay}s` }}>
      {hasImgs && (
        <div className="mc-carousel">
          {imgs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`${machine.name} — ${MC_LABELS[i]}`} className={`mc-img${i === idx ? " active" : ""}`} />
          ))}
          <span className="mc-label">{MC_LABELS[idx]}</span>
        </div>
      )}

      <div className={hasImgs ? "mc-content" : ""}>
        {hasImgs && (
          <div className="mc-dots">
            {imgs.map((_, i) => (
              <button
                key={i}
                className={`mc-dot${i === idx ? " active" : ""}`}
                onClick={() => { setIdx(i); if (timerRef.current) clearInterval(timerRef.current); }}
                aria-label={MC_LABELS[i]}
              />
            ))}
          </div>
        )}

        {!hasImgs && (
          <div style={{ width: "44px", height: "44px", background: C.parchment, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", marginBottom: "1.25rem", border: `1px solid ${C.border}` }}>
            {machine.icon}
          </div>
        )}

        <h3 style={{ fontFamily: F.display, fontSize: "1.2rem", fontWeight: 600, color: C.charcoal, margin: "0 0 0.5rem", lineHeight: 1.25 }}>
          {machine.name}
        </h3>

        <p style={{ fontFamily: F.body, fontSize: "0.84rem", color: C.taupe, margin: "0 0 1.25rem", lineHeight: 1.65 }}>
          {machine.description}
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {machine.specs.map((spec, i) => (
            <li key={i} style={{ fontFamily: F.body, fontSize: "0.77rem", color: C.warm, display: "flex", alignItems: "flex-start", gap: "0.5rem", lineHeight: 1.5 }}>
              <span style={{ color: C.saffron, fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>·</span>
              {spec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————
// Facility Gallery
// ————————————————————————————————————————————
function FacilityGallery() {
  return (
    <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2.5rem 5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }} className="sr">
        <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "1rem", color: C.taupe, margin: "0 0 0.75rem" }}>
          Inside the Facility
        </p>
        <div style={{ width: "32px", height: "2px", background: C.charcoal, margin: "0 auto 1.25rem" }} />
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: C.charcoal, margin: 0, lineHeight: 1.15 }}>
          10,000 sq ft.{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>Purpose-Built.</em>
        </h2>
      </div>
      <div className="fac-grid sr">
        {FACILITY_SHOTS.map(({ src, label }) => (
          <div key={src} className="fac-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={label} loading="lazy" />
            <div className="fac-caption">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ————————————————————————————————————————————
// Main Page
// ————————————————————————————————————————————
export default function InfrastructurePage() {
  useScrollReveal();

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: F.body, paddingTop: "70px" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ——— Hero ——— */}
      <section
        style={{
          background: C.deepWarm,
          padding: "clamp(100px, 15vh, 140px) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 8vh, 7rem)",
          clipPath: "polygon(0 0, 100% 0, 100% 94%, 0 100%)",
          marginBottom: "-2rem",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Paper grain */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.035 }} aria-hidden>
          <filter id="grain-infra"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#grain-infra)" />
        </svg>

        <div className="infra-hero-grid" style={{
          position: "relative", maxWidth: "1400px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "clamp(2rem,5vw,5rem)", alignItems: "center",
        }}>

          {/* LEFT */}
          <div>
            <span className="saffron-badge" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
              Manufacturing · Converting · Trading
            </span>

            <div style={{ width: "48px", height: "2px", background: C.cream,
              marginBottom: "1.5rem", transformOrigin: "left",
              animation: "ruleGrow 0.6s ease 0.2s both" }} />

            <h1 style={{ fontFamily: F.display, fontSize: "clamp(3rem, 6vw, 5rem)",
              fontWeight: 900, color: C.cream, margin: "0 0 1.5rem",
              lineHeight: 1.08, animation: "fadeUp 0.8s ease 0.3s both" }}>
              Built for Speed.{" "}<br />
              <em style={{ fontStyle: "italic", fontWeight: 500 }}><span className="gold-text">Infrastructure</span> for Precision.</em>
            </h1>

            <p style={{ fontFamily: F.body, fontSize: "1.05rem", color: "rgba(250,247,242,0.72)",
              lineHeight: 1.75, margin: "0 0 2rem", maxWidth: "560px",
              animation: "fadeUp 0.8s ease 0.45s both" }}>
              Our dedicated manufacturing facility at BU Bhandari MIDC, Sanaswadi, Pune
              produces up to{" "}
              <strong style={{ color: C.cream, fontFamily: F.display, fontWeight: 700 }}>50,000 units per day</strong>
              {" "}— PP corrugated box fabrication, ITC board sheet cutting, screen printing,
              and pallet despatch for same-city delivery or pan-India dispatch.
            </p>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem",
              background: C.parchment, border: `1px solid ${C.borderMid}`,
              borderRadius: "3px", padding: "0.65rem 1.25rem",
              animation: "fadeUp 0.7s ease 0.6s both" }}>
              <span style={{ fontSize: "0.9rem" }}>📍</span>
              <span style={{ fontFamily: F.body, fontSize: "0.84rem", fontWeight: 500, color: C.charcoal }}>
                108 BU Bhandari MIDC, Sanaswadi, Pune 412208
              </span>
            </div>
          </div>

          {/* RIGHT — facility image + capacity badge */}
          <div className="hero-img-col" style={{
            position: "relative",
            height: "clamp(380px, 55vh, 560px)",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 8px 48px rgba(28,26,23,0.10)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-infrastructure.jpg"
              alt="PGG manufacturing facility — PP box welding, punching and sheet cutting, MIDC Pune"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", bottom: "1.5rem", right: "1.5rem",
              background: "rgba(20,18,16,0.88)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: "8px", padding: "0.8rem 1.1rem",
              display: "flex", alignItems: "center", gap: "0.75rem",
              border: "1px solid rgba(250,247,242,0.10)",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#F5A623" strokeWidth="1.5"/>
                <polyline points="5,9 8,12 13,6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <div style={{ fontFamily: F.body, fontSize: "0.56rem", letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "rgba(250,247,242,0.45)", marginBottom: "3px" }}>
                  Certified Facility
                </div>
                <div style={{ fontFamily: F.body, fontSize: "0.76rem", fontWeight: 500,
                  color: "#FAF7F2", letterSpacing: "0.01em" }}>
                  ISO 9001:2015 · 50K Units/Day · MIDC Pune
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ——— Capabilities Strip ——— */}
      <section style={{ background: C.parchment, borderBottom: `1px solid ${C.border}` }}>
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
              <div style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>{cap.icon}</div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: "clamp(1.4rem, 2vw, 1.9rem)",
                  fontWeight: 700,
                  color: C.charcoal,
                  lineHeight: 1.1,
                  marginBottom: "0.4rem",
                }}
              >
                {cap.value}
              </div>
              <div
                style={{
                  fontFamily: F.body,
                  fontSize: "0.67rem",
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
      <section className="infra-section" style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2.5rem" }}>
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

      <FacilityGallery />

      {/* ——— Quality Section ——— */}
      <section
        className="infra-section"
        style={{
          background: C.parchment,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "5rem 2.5rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            className="infra-quality-grid"
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
      <section className="infra-section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 2.5rem" }}>
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

        <div className="infra-locations-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
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
              {["PP Box Welding & Punching", "Screen Printing", "ITC Board Sheet Cutting", "50,000 Units/Day Capacity"].map((item) => (
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
              <a href="mailto:yogesh.sahu@puneglobalgroup.in" style={{ fontFamily: F.body, fontSize: "0.875rem", color: C.charcoal, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                <span>✉</span> yogesh.sahu@puneglobalgroup.in
              </a>
              <div style={{ fontFamily: F.body, fontSize: "0.78rem", color: C.taupe }}>
                GSTIN: 27FYYPS5999K1ZO
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Processing Workflow ——— */}
      {/* ——— Products Bridge ——— */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2.5rem 5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }} className="sr">
          <p style={{ fontFamily: F.italic, fontStyle: "italic", fontSize: "1rem", color: C.taupe, margin: "0 0 0.5rem" }}>See what we make with it</p>
          <div style={{ width: "28px", height: "2px", background: C.charcoal, margin: "0 auto" }} />
        </div>
        <div className="infra-bridge-grid sr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <Link href="/products/pp-corrugated" style={{ textDecoration: "none", background: C.dark, borderRadius: "6px", padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "200px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "rgba(250,247,242,0.25)" }} />
            <div>
              <p style={{ fontFamily: F.body, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,247,242,0.45)", margin: "0 0 0.75rem" }}>Manufactured</p>
              <h3 style={{ fontFamily: F.display, fontSize: "clamp(1.4rem,2.5vw,1.9rem)", fontWeight: 700, color: C.cream, margin: "0 0 0.6rem", lineHeight: 1.15 }}>PP Corrugated Systems</h3>
              <p style={{ fontFamily: F.body, fontSize: "0.83rem", color: "rgba(250,247,242,0.55)", margin: 0, lineHeight: 1.6 }}>Boxes, trays, bins, separators — custom to ±1 mm, made at this facility.</p>
            </div>
            <span style={{ fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500, color: "rgba(250,247,242,0.75)", marginTop: "1.5rem", letterSpacing: "0.04em" }}>Explore PP Systems →</span>
          </Link>
          <Link href="/products/paper-board" style={{ textDecoration: "none", background: "#fff", border: `1px solid ${C.borderMid}`, borderRadius: "6px", padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "200px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: C.charcoal }} />
            <div>
              <p style={{ fontFamily: F.body, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.taupe, margin: "0 0 0.75rem" }}>Traded &amp; Converted</p>
              <h3 style={{ fontFamily: F.display, fontSize: "clamp(1.4rem,2.5vw,1.9rem)", fontWeight: 700, color: C.charcoal, margin: "0 0 0.6rem", lineHeight: 1.15 }}>Paper &amp; Board Grades</h3>
              <p style={{ fontFamily: F.body, fontSize: "0.83rem", color: C.taupe, margin: 0, lineHeight: 1.6 }}>ITC FBB, Duplex, Kraft, TNPL — sheeted and rewound here to your spec.</p>
            </div>
            <span style={{ fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500, color: C.charcoal, marginTop: "1.5rem", letterSpacing: "0.04em" }}>Browse Board Grades →</span>
          </Link>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section
        className="infra-section"
        style={{
          background: C.deepWarm,
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

      {/* ——— Three Business Lines ——— */}
      <section style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          <div style={{ marginBottom: "4rem" }}>
            <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: C.taupe, display: "block", marginBottom: "1rem" }}>
              Three Business Lines
            </span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.4rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 1.25rem" }}>
              Manufacture. Convert. Trade.
            </h2>
            <p style={{ fontFamily: F.body, fontSize: "1rem", color: C.taupe,
              lineHeight: 1.8, maxWidth: "520px", margin: 0, fontWeight: 300 }}>
              We manufacture industrial PP packaging to export spec. We convert FBB into
              press-ready sheets. We trade ITC, TNPL and imported board grades.
              One facility. One partner. 30 years.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
            gap: "1px", background: C.borderMid }}>
            {[
              {
                num: "01",
                eyebrow: "PP Manufacturing — Core Business",
                heading: "Trays · Separators · Boxes · Crates",
                desc: "Precision polypropylene packaging for automotive, pharma and electronics — custom sizes, export-ready documentation on every order.",
                tags: [
                  { label: "PP Trays",      href: "/products/pp-corrugated/pp-tray-folded-corner" },
                  { label: "Separators",    href: "/products/pp-corrugated/pp-sep-cross-partition" },
                  { label: "Foldable Boxes",href: "/products/pp-corrugated/pp-box-collapsible" },
                  { label: "PP Crates",     href: "/products/pp-corrugated/pp-bin-scrap-open-top" },
                  { label: "Layer Pads",    href: "/products/pp-corrugated/pp-layer-pad-heavy-duty" },
                  { label: "ESD Bins",      href: "/products/pp-corrugated/pp-tray-esd-antistatic" },
                ],
                href: "/products/pp-corrugated",
                cta: "View PP Products",
              },
              {
                num: "02",
                eyebrow: "Board Converting",
                heading: "Cut to Size. Press-Ready.",
                desc: "Sheeting, slitting and rewinding to exact press dimensions. Fast turnaround, low MOQ, for printers and converters across India.",
                tags: [
                  { label: "FBB Sheeting",       href: "/infrastructure" },
                  { label: "Duplex Cutting",      href: "/infrastructure" },
                  { label: "Slitting",            href: "/infrastructure" },
                  { label: "Rewinding",           href: "/infrastructure" },
                  { label: "Custom Dimensions",   href: "/infrastructure" },
                  { label: "Low MOQ",             href: "/infrastructure" },
                ],
                href: "/infrastructure",
                cta: "See Converting Facility",
              },
              {
                num: "03",
                eyebrow: "Paper & PP Sheet Trading",
                heading: "ITC · TNPL · Imported",
                desc: "Trusted traders of ITC PSPD and TNPL — FBB, duplex, kraft and test liner. PP corrugated sheets also available ex-stock from our Pune warehouse.",
                tags: [
                  { label: "Cyber XLPac",    href: "/products/paper-board/cyber-xlpac-gc1" },
                  { label: "Carte Lumina",   href: "/products/paper-board/carte-lumina" },
                  { label: "Safire Graphik", href: "/products/paper-board/safire-graphik" },
                  { label: "Eco Natura",     href: "/products/paper-board/eco-natura" },
                  { label: "PP Sheets",      href: "/products/pp-corrugated" },
                  { label: "Ready Stock",    href: "/contact" },
                ],
                href: "/products",
                cta: "Browse All Grades",
              },
            ].map((line) => (
              <div key={line.num} style={{ background: C.cream, padding: "2.75rem",
                display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "3.5rem",
                  color: C.saffron, lineHeight: 1, marginBottom: "1.5rem" }}>
                  {line.num}
                </div>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.64rem",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  color: C.taupe, display: "block", marginBottom: "0.5rem" }}>
                  {line.eyebrow}
                </span>
                <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.25rem",
                  color: C.charcoal, marginBottom: "1rem", lineHeight: 1.3 }}>
                  {line.heading}
                </h3>
                <p style={{ fontFamily: F.body, fontSize: "0.9rem", lineHeight: 1.8,
                  color: C.taupe, fontWeight: 300, marginBottom: "1.5rem", flex: 1 }}>
                  {line.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "2rem" }}>
                  {line.tags.map((tag) => (
                    <Link key={tag.label} href={tag.href} style={{ fontFamily: F.body, fontSize: "0.72rem",
                      fontWeight: 500, color: C.warm, background: C.parchment,
                      border: `1px solid ${C.border}`, borderRadius: "2px",
                      padding: "0.3rem 0.6rem", textDecoration: "none", cursor: "pointer",
                      transition: "background 0.2s, color 0.2s, border-color 0.2s" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = C.parchment;
                        (e.currentTarget as HTMLAnchorElement).style.color = C.charcoal;
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = C.borderMid;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = C.parchment;
                        (e.currentTarget as HTMLAnchorElement).style.color = C.warm;
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border;
                      }}>
                      {tag.label}
                    </Link>
                  ))}
                </div>
                <Link href={line.href} style={{ fontFamily: F.body, fontWeight: 600,
                  fontSize: "0.8rem", color: C.charcoal, textDecoration: "none",
                  letterSpacing: "0.05em", borderBottom: `1px solid ${C.charcoal}`,
                  paddingBottom: "2px", alignSelf: "flex-start" }}>
                  {line.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage CTA band */}
      <section style={{
        background: C.deepWarm,
        padding: "clamp(3rem, 6vh, 5rem) clamp(1.5rem, 5vw, 4rem)",
        textAlign: "center",
      }}>
        <p style={{ fontFamily: F.italic, fontStyle: "italic",
          fontSize: "1.1rem", color: "rgba(250,247,242,0.65)", marginBottom: "1rem" }}>
          Ready to partner?
        </p>
        <h2 style={{ fontFamily: F.display, fontWeight: 700,
          fontSize: "clamp(2rem, 4vw, 3rem)", color: C.cream,
          marginBottom: "2rem", lineHeight: 1.1 }}>
          Let&apos;s build something <span className="gold-text">together.</span>
        </h2>
        <a href="/#contact" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: C.saffron, color: "#fff",
          fontFamily: F.body, fontWeight: 600, fontSize: "0.82rem",
          letterSpacing: "0.09em", textTransform: "uppercase",
          padding: "13px 32px", borderRadius: "2px", textDecoration: "none",
        }}>
          Contact Us →
        </a>
      </section>

    </div>
  );
}
