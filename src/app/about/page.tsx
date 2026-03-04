"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconCircleCheck,
  IconBuildingFactory2,
  IconPackage,
  IconStack2,
  IconCar,
  IconPill,
  IconShoppingCart,
  IconTool,
  IconMapPin,
  IconPhone,
  IconMail,
} from "@tabler/icons-react";

const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#F5A623",
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

  .sr { opacity: 0; transform: translateY(22px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }

  .eyebrow {
    display: inline-block;
    font-family: ${F.body};
    font-weight: 600;
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${C.taupe};
    margin-bottom: 1rem;
  }

  .about-hero-grid {
    display: grid;
    grid-template-columns: 55% 1fr;
    gap: 5rem;
    align-items: flex-start;
  }
  @media (max-width: 860px) {
    .about-hero-grid { grid-template-columns: 1fr; gap: 3rem; }
  }

  .leadership-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: ${C.borderMid};
  }
  @media (max-width: 640px) {
    .leadership-grid { grid-template-columns: 1fr; }
  }

  .industries-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: ${C.borderMid};
  }
  .industries-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: ${C.borderMid};
  }
  @media (max-width: 860px) {
    .industries-grid-3 { grid-template-columns: 1fr 1fr; }
    .industries-grid-4 { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 520px) {
    .industries-grid-3 { grid-template-columns: 1fr; }
    .industries-grid-4 { grid-template-columns: 1fr; }
  }

  .ind-tile {
    padding: 2rem 1.75rem;
  }

  .timeline-item {
    display: flex;
    gap: 2rem;
    padding: 2rem 0;
    border-bottom: 1px solid ${C.border};
  }
  .timeline-item:last-child { border-bottom: none; }
`;

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".sr");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = parseFloat(el.dataset.delay || "0");
            setTimeout(() => el.classList.add("visible"), delay * 1000);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function AboutPage() {
  useScrollReveal();

  const tradeCustomers = [
    {
      num: "01",
      icon: <IconBuildingFactory2 size={22} color={C.saffron} />,
      name: "Corrugators",
      desc: "Kraft liner, test liner and fluting medium in ready stock. Sheeted or in rolls. Reliable supply for high-volume corrugated board production.",
    },
    {
      num: "02",
      icon: <IconPackage size={22} color={C.saffron} />,
      name: "Box Makers",
      desc: "Pre-cut corrugated sheets and boards delivered to size. Reduce waste and lead times for small and mid-size box manufacturers.",
    },
    {
      num: "03",
      icon: <IconStack2 size={22} color={C.saffron} />,
      name: "Printers & Converters",
      desc: "FBB, duplex, coated and specialty boards sheeted to press-ready sizes. ITC and TNPL grades with consistent caliper and whiteness.",
    },
  ];

  const endIndustries = [
    {
      num: "04",
      icon: <IconCar size={22} color={C.saffron} />,
      name: "Automotive",
      desc: "Returnable PP boxes, component trays and corrugated packaging for OEMs and Tier-1 suppliers across Pune and MIDC belt.",
    },
    {
      num: "05",
      icon: <IconPill size={22} color={C.saffron} />,
      name: "Pharmaceutical",
      desc: "FBB cartons, duplex board and PP trays meeting pharma packaging compliance requirements.",
    },
    {
      num: "06",
      icon: <IconShoppingCart size={22} color={C.saffron} />,
      name: "E-Commerce & FMCG",
      desc: "Transit-ready corrugated boxes, retail cartons and shelf-ready packaging for consumer brands and last-mile delivery.",
    },
    {
      num: "07",
      icon: <IconTool size={22} color={C.saffron} />,
      name: "Engineering",
      desc: "Heavy-duty 7-ply corrugated crates and export-standard packaging for precision machinery and industrial goods.",
    },
  ];

  return (
    <div style={{ paddingTop: "70px" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Page Header ─────────────────────────────── */}
      <section style={{
        background: C.charcoal,
        padding: "80px clamp(1.5rem, 5vw, 4rem) 70px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background watermark */}
        <div style={{
          position: "absolute", right: "-2rem", top: "-1rem",
          fontFamily: F.display, fontWeight: 800,
          fontSize: "clamp(8rem, 20vw, 16rem)",
          color: C.cream, opacity: 0.025, lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
          letterSpacing: "-0.06em",
        }}>
          1995
        </div>
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}>
          <span className="eyebrow" style={{ color: "rgba(250,247,242,0.4)" }}>
            About Us
          </span>
          <h1 style={{
            fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            color: C.cream, letterSpacing: "-0.03em",
            lineHeight: 1.05, margin: "0 0 1.5rem", maxWidth: "700px",
          }}>
            Three Decades of<br />
            <em style={{ fontWeight: 400 }}>Packaging Excellence.</em>
          </h1>
          <p style={{
            fontFamily: F.body, fontSize: "1.05rem",
            color: "rgba(250,247,242,0.55)", lineHeight: 1.8,
            maxWidth: "520px", margin: 0, fontWeight: 300,
          }}>
            Paper trading, converting and PP packaging solutions from Pune since 1995.
            ITC, TNPL &amp; imported grades in ready stock.
          </p>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────── */}
      <section style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="about-hero-grid">

            {/* Left — narrative */}
            <div className="sr" style={{ position: "relative" }}>
              <div style={{
                position: "absolute", top: "-10px", left: "-10px",
                fontFamily: F.display, fontWeight: 700,
                fontSize: "clamp(6rem, 14vw, 11rem)",
                color: C.charcoal, opacity: 0.03, lineHeight: 1,
                userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
              }}>
                1995
              </div>

              <span className="eyebrow">Our Story</span>
              <h2 style={{
                fontFamily: F.display, fontWeight: 700,
                fontSize: "clamp(1.9rem, 3.5vw, 3rem)", color: C.charcoal,
                letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "2rem",
              }}>
                Founded on Trust.<br />
                <em style={{ fontWeight: 400 }}>Built on Reliability.</em>
              </h2>

              <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
                color: C.taupe, marginBottom: "1.25rem", fontWeight: 300 }}>
                Pune Global Group was founded in 1995 by{" "}
                <strong style={{ color: C.charcoal, fontWeight: 600 }}>Umesh Sahu</strong>{" "}
                (MBA, Pune University) as a paper and board trading firm in Pune, Maharashtra —
                supplying corrugators, printers and box makers with ITC, TNPL and imported
                grades. Over three decades, we built in-house converting capabilities:
                sheeting, rewinding and slitting so customers get cut-to-size stock with fast
                turnaround and low MOQ.
              </p>

              <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
                color: C.taupe, marginBottom: "1.25rem", fontWeight: 300 }}>
                His son{" "}
                <strong style={{ color: C.charcoal, fontWeight: 600 }}>Yogesh Sahu</strong>{" "}
                (MSc Fintech, Strathclyde Business School) joined the business, expanding our
                capabilities into industrial PP packaging manufacturing — precision-engineered
                returnable trays, boxes and crates for automotive, pharma and electronics OEMs.
              </p>

              <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
                color: C.taupe, marginBottom: "2.5rem", fontWeight: 300 }}>
                Today we operate from our converting facility at BU Bhandari MIDC, Sanaswadi,
                and our commercial office in Gulmohar Center Point, Pune — serving
                50+ clients across India.
              </p>

              <Link href="/infrastructure" style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                fontFamily: F.body, fontWeight: 600, fontSize: "0.8rem",
                color: C.charcoal, textDecoration: "none",
                letterSpacing: "0.05em", textTransform: "uppercase",
                borderBottom: `1px solid ${C.charcoal}`, paddingBottom: "2px",
              }}>
                Our Converting Facility <IconArrowRight size={13} />
              </Link>
            </div>

            {/* Right — stats card */}
            <div className="sr" data-delay="0.15" style={{ flex: "0 0 340px" }}>
              <div style={{
                background: C.parchment,
                border: `1px solid ${C.borderMid}`,
                borderTop: `3px solid ${C.saffron}`,
                padding: "2.5rem",
              }}>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                  color: C.taupe, letterSpacing: "0.14em", textTransform: "uppercase",
                  display: "block", marginBottom: "1.5rem" }}>
                  At a Glance
                </span>

                {[
                  { stat: "1995",  label: "Year Established" },
                  { stat: "50+",   label: "Active Clients" },
                  { stat: "40+",   label: "Paper Grades Stocked" },
                  { stat: "50 T",  label: "Daily Processing Capacity" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "baseline", padding: "0.85rem 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <span style={{ fontFamily: F.body, fontWeight: 400,
                      fontSize: "0.95rem", color: C.warm }}>
                      {item.label}
                    </span>
                    <span style={{ fontFamily: F.display, fontWeight: 700,
                      fontSize: "1.4rem", color: C.saffron }}>
                      {item.stat}
                    </span>
                  </div>
                ))}

                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                  color: C.taupe, letterSpacing: "0.14em", textTransform: "uppercase",
                  display: "block", marginBottom: "1rem", marginTop: "2rem" }}>
                  Certifications
                </span>
                {[
                  { label: "ISO 9001:2015", desc: "Quality Management System" },
                  { label: "FSC C064218",   desc: "Chain of Custody certified" },
                  { label: "BRC",           desc: "Packaging & Packaging Materials" },
                ].map((v) => (
                  <div key={v.label} style={{
                    display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.85rem",
                  }}>
                    <IconCircleCheck size={15} style={{ color: C.saffron, marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.95rem",
                        color: C.charcoal, marginBottom: "2px" }}>
                        {v.label}
                      </div>
                      <div style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe,
                        lineHeight: 1.5, fontWeight: 300 }}>
                        {v.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Leadership ───────────────────────────────── */}
      <section style={{ background: C.parchment, padding: "80px clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="sr" style={{ marginBottom: "3rem" }}>
            <span className="eyebrow">Leadership</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 0.5rem" }}>
              The People Behind the Brand.
            </h2>
          </div>
          <div className="leadership-grid">
            {[
              {
                name: "Umesh Sahu",
                role: "Founder & Managing Director",
                qual: "MBA — Pune University",
                bio: "Founded Pune Global Group in 1995. Built one of Pune's most trusted paper and board trading operations over three decades, establishing deep relationships with ITC PSPD, TNPL and key corrugated board mills across India.",
              },
              {
                name: "Yogesh Sahu",
                role: "Director",
                qual: "MSc Fintech — Strathclyde Business School, UK",
                bio: "Joined the family business to lead PP packaging manufacturing and digital transformation. Expanded the group's capabilities into precision-engineered industrial packaging for automotive, pharma and electronics sectors.",
              },
            ].map((person, i) => (
              <div key={person.name} className="sr" data-delay={`${0.1 * i}`}
                style={{ background: C.parchment, padding: "2.5rem 2.75rem" }}>
                <div style={{
                  fontFamily: F.display, fontWeight: 700,
                  fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                  color: C.charcoal, marginBottom: "0.3rem",
                }}>
                  {person.name}
                </div>
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.78rem",
                  color: C.saffron, letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  {person.role}
                </div>
                <div style={{ fontFamily: F.body, fontSize: "0.8rem", color: C.taupe,
                  fontStyle: "italic", marginBottom: "1.25rem" }}>
                  {person.qual}
                </div>
                <p style={{ fontFamily: F.body, fontSize: "0.92rem", lineHeight: 1.85,
                  color: C.warm, fontWeight: 300, margin: 0 }}>
                  {person.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────── */}
      <section id="industries" style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          <div className="sr" style={{ marginBottom: "3.5rem" }}>
            <span className="eyebrow">Who We Serve</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 1rem" }}>
              Paper, Board &amp; PP Packaging.
            </h2>
            <p style={{ fontFamily: F.body, fontSize: "1rem", color: C.taupe,
              lineHeight: 1.8, maxWidth: "500px", margin: 0, fontWeight: 300 }}>
              From paper traders and corrugators to automotive OEMs and pharma brands —
              we supply the right grade, converted to the right size, on time.
            </p>
          </div>

          {/* Paper trade customers */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
              letterSpacing: "0.12em", textTransform: "uppercase", color: C.taupe }}>
              Paper Trade Customers
            </span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
          </div>

          <div className="industries-grid-3" style={{ marginBottom: "3rem" }}>
            {tradeCustomers.map((ind, i) => (
              <div key={ind.name} className="ind-tile sr" data-delay={`${0.1 * i}`}
                style={{ background: C.cream }}>
                <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "2.8rem",
                  color: C.saffron, lineHeight: 1, marginBottom: "1.25rem", opacity: 0.4 }}>
                  {ind.num}
                </div>
                <div style={{ width: "38px", height: "38px", background: "rgba(212,134,14,0.08)",
                  borderRadius: "1px", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: "1rem" }}>
                  {ind.icon}
                </div>
                <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
                  color: C.charcoal, marginBottom: "0.6rem" }}>
                  {ind.name}
                </h3>
                <p style={{ fontFamily: F.body, fontSize: "0.85rem", lineHeight: 1.75,
                  color: C.taupe, fontWeight: 300, margin: 0 }}>
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>

          {/* End-use industries */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
              letterSpacing: "0.12em", textTransform: "uppercase", color: C.taupe }}>
              End-Use Industries
            </span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
          </div>

          <div className="industries-grid-4">
            {endIndustries.map((ind, i) => (
              <div key={ind.name} className="ind-tile sr" data-delay={`${0.1 * i}`}
                style={{ background: C.cream }}>
                <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "2.8rem",
                  color: C.saffron, lineHeight: 1, marginBottom: "1.25rem", opacity: 0.4 }}>
                  {ind.num}
                </div>
                <div style={{ width: "38px", height: "38px", background: "rgba(212,134,14,0.08)",
                  borderRadius: "1px", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: "1rem" }}>
                  {ind.icon}
                </div>
                <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
                  color: C.charcoal, marginBottom: "0.6rem" }}>
                  {ind.name}
                </h3>
                <p style={{ fontFamily: F.body, fontSize: "0.85rem", lineHeight: 1.75,
                  color: C.taupe, fontWeight: 300, margin: 0 }}>
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locations ────────────────────────────────── */}
      <section style={{ background: C.parchment, padding: "80px clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="sr" style={{ marginBottom: "3rem" }}>
            <span className="eyebrow">Where We Operate</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 0.5rem" }}>
              Two Locations. One Team.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1px", background: C.borderMid }}>
            {[
              {
                icon: <IconBuildingFactory2 size={22} color={C.saffron} />,
                label: "Converting Facility",
                address: "108, BU Bhandari MIDC\nSanaswadi 412208, Pune\nMaharashtra",
                note: "PP manufacturing · Sheeting · Rewinding · Slitting",
              },
              {
                icon: <IconMapPin size={22} color={C.saffron} />,
                label: "Commercial Office",
                address: "206 Gulmohar Center Point\nPune 411006, Maharashtra",
                note: "Sales · Trading · Customer support",
              },
            ].map((loc) => (
              <div key={loc.label} className="sr" style={{ background: C.parchment, padding: "2.5rem 2.75rem" }}>
                <div style={{ width: "40px", height: "40px", background: "rgba(212,134,14,0.08)",
                  borderRadius: "1px", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: "1.25rem" }}>
                  {loc.icon}
                </div>
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.taupe, marginBottom: "0.6rem" }}>
                  {loc.label}
                </div>
                <p style={{ fontFamily: F.display, fontSize: "1.1rem", fontWeight: 600,
                  color: C.charcoal, lineHeight: 1.6, whiteSpace: "pre-line",
                  margin: "0 0 0.75rem" }}>
                  {loc.address}
                </p>
                <p style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe,
                  fontWeight: 300, margin: 0 }}>
                  {loc.note}
                </p>
              </div>
            ))}
            <div className="sr" data-delay="0.1" style={{ background: C.parchment, padding: "2.5rem 2.75rem" }}>
              <div style={{ width: "40px", height: "40px", background: "rgba(212,134,14,0.08)",
                borderRadius: "1px", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: "1.25rem" }}>
                <IconPhone size={22} color={C.saffron} />
              </div>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: C.taupe, marginBottom: "1rem" }}>
                Get In Touch
              </div>
              <a href="tel:+919823383230" style={{ display: "flex", alignItems: "center",
                gap: "0.5rem", fontFamily: F.display, fontSize: "1.1rem", fontWeight: 600,
                color: C.charcoal, textDecoration: "none", marginBottom: "0.6rem" }}>
                <IconPhone size={16} color={C.saffron} /> +91 98233 83230
              </a>
              <a href="mailto:yogesh.sahu@puneglobalgroup.in" style={{ display: "flex",
                alignItems: "center", gap: "0.5rem", fontFamily: F.body, fontSize: "0.9rem",
                color: C.warm, textDecoration: "none", fontWeight: 400 }}>
                <IconMail size={15} color={C.saffron} /> yogesh.sahu@puneglobalgroup.in
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Bar ──────────────────────────────────── */}
      <section className="section-dark" style={{ background: C.charcoal, padding: "70px clamp(1.5rem, 5vw, 4rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              color: C.cream, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>
              Ready to work together?
            </h2>
            <p style={{ fontFamily: F.body, fontSize: "1rem",
              color: "rgba(250,247,242,0.5)", margin: 0, fontWeight: 300 }}>
              Request a quote, ask about grades, or visit our facility.
            </p>
          </div>
          <Link href="/contact" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            fontFamily: F.body, fontWeight: 600, fontSize: "0.85rem",
            letterSpacing: "0.06em", textTransform: "uppercase",
            background: C.saffron, color: C.charcoal, textDecoration: "none",
            padding: "1rem 2.5rem", borderRadius: "3px",
          }}>
            Get a Quote <IconArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
