"use client";
import Link from "next/link";
import { SiteLogo } from "./SiteLogo";
import { IconPhone, IconMail, IconMapPin } from "@tabler/icons-react";

const C = {
  cream:     "#FAF7F2",
  parchment: "#F0EAE0",
  charcoal:  "#1C1A17",
  warm:      "#4A4540",
  taupe:     "#7A736D",
  saffron:   "#F5A623",
  dark:      "#141210",
  border:    "rgba(28,26,23,0.1)",
  borderMid: "rgba(28,26,23,0.16)",
};

const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};

const FOOTER_CSS = `
  .footer-link {
    font-family: ${F.body}; font-size: 0.84rem; color: rgba(250,247,242,0.52);
    transition: color 0.2s; cursor: pointer; display: block; margin-bottom: 10px;
    text-decoration: none; background: none; border: none; padding: 0; text-align: left;
  }
  .footer-link:hover { color: ${C.cream}; }

  @media (max-width: 768px) {
    .footer-grid { flex-direction: column !important; gap: 2.5rem !important; }
    .footer-brand-col { flex: 1 1 auto !important; width: 100% !important; }
    .footer-cols { flex-wrap: wrap !important; gap: 2rem !important; justify-content: flex-start !important; }
  }
  @media (max-width: 480px) {
    .footer-cols { flex-direction: column !important; }
  }
`;

export default function SiteFooter() {
  const productLinks = [
    { label: "PP Corrugated Systems", href: "/products/pp-corrugated" },
    { label: "Paper & Board Grades",  href: "/products/paper-board" },
    { label: "Cyber XLPac GC1",       href: "/products/paper-board/cyber-xlpac-gc1" },
    { label: "Carte Lumina",          href: "/products/paper-board/carte-lumina" },
    { label: "Eco Natura",            href: "/products/paper-board/eco-natura" },
  ];

  const industryLinks = [
    { label: "Automotive",     href: "/about#industries" },
    { label: "Pharmaceutical", href: "/about#industries" },
    { label: "E-Commerce",     href: "/about#industries" },
    { label: "FMCG",           href: "/about#industries" },
    { label: "Engineering",    href: "/about#industries" },
  ];

  const companyLinks = [
    { label: "About Us",    href: "/about" },
    { label: "Contact",     href: "/contact" },
    { label: "Get a Quote", href: "/contact" },
  ];

  return (
    <>
      <style>{FOOTER_CSS}</style>
      <footer style={{ background: C.dark, padding: "70px clamp(1.5rem, 5vw, 4rem) 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          {/* Main grid: logo column + link columns */}
          <div className="footer-grid" style={{
            display: "flex", gap: "4rem",
            paddingBottom: "3rem", borderBottom: "1px solid rgba(250,247,242,0.08)",
          }}>

            {/* Brand column */}
            <div className="footer-brand-col" style={{ flex: "0 0 300px" }}>
              <SiteLogo inverted />
              <p style={{
                fontFamily: F.body, fontSize: "0.86rem",
                color: "rgba(250,247,242,0.55)", lineHeight: 1.8,
                marginTop: "1.25rem", maxWidth: "260px", fontWeight: 300,
              }}>
                Paper trading, converting and PP packaging solutions from Pune since 1995.
                ITC, TNPL &amp; imported grades in ready stock.
              </p>
              <a
                href="tel:+919823383230"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  marginTop: "1.5rem", fontFamily: F.body, fontSize: "0.82rem",
                  color: "rgba(250,247,242,0.75)", textDecoration: "none",
                }}
              >
                <IconPhone size={13} /> +91 98233 83230
              </a>
            </div>

            {/* Link columns */}
            <div className="footer-cols" style={{
              display: "flex", gap: "3rem", flex: 1, justifyContent: "flex-end",
            }}>

              {/* Products */}
              <div>
                <div style={{
                  fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
                  color: "rgba(250,247,242,0.4)", letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: "1.25rem",
                }}>
                  Products
                </div>
                {productLinks.map(({ label, href }) => (
                  <Link key={label} href={href} className="footer-link">
                    {label}
                  </Link>
                ))}
              </div>

              {/* Industries */}
              <div>
                <div style={{
                  fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
                  color: "rgba(250,247,242,0.4)", letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: "1.25rem",
                }}>
                  Industries
                </div>
                {industryLinks.map(({ label, href }) => (
                  <Link key={label} href={href} className="footer-link">
                    {label}
                  </Link>
                ))}
              </div>

              {/* Company + contact details */}
              <div>
                <div style={{
                  fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
                  color: "rgba(250,247,242,0.4)", letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: "1.25rem",
                }}>
                  Company
                </div>
                {companyLinks.map(({ label, href }) => (
                  <Link key={label} href={href} className="footer-link">
                    {label}
                  </Link>
                ))}
                <div style={{ marginTop: "1.5rem" }}>
                  <a
                    href="mailto:yogesh.sahu@puneglobalgroup.in"
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      fontFamily: F.body, fontSize: "0.76rem",
                      color: "rgba(250,247,242,0.55)", transition: "color 0.2s",
                      marginBottom: "0.5rem", textDecoration: "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.cream)}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,247,242,0.55)")}
                  >
                    <IconMail size={12} /> yogesh.sahu@puneglobalgroup.in
                  </a>
                  <div style={{
                    fontFamily: F.body, fontSize: "0.76rem",
                    color: "rgba(250,247,242,0.55)",
                    display: "flex", alignItems: "flex-start", gap: "6px",
                  }}>
                    <IconMapPin size={12} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span>206 Gulmohar Center Point,<br />Pune 411006</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom bar: copyright + GSTIN */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: "1rem", padding: "1.5rem 0",
          }}>
            <div style={{ fontFamily: F.body, fontSize: "0.76rem", color: "rgba(250,247,242,0.38)" }}>
              &copy; {new Date().getFullYear()} Pune Global Group. All rights reserved.
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontFamily: F.body, fontSize: "0.73rem", color: "rgba(250,247,242,0.38)",
            }}>
              <span>GSTIN:</span>
              <span style={{ fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>
                27FYYPS5999K1ZO
              </span>
              <span style={{ color: "rgba(250,247,242,0.12)", margin: "0 4px" }}>|</span>
              <span>Pune, Maharashtra, India</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
