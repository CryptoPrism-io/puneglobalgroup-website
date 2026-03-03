"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "./SiteLogo";

const C = {
  cream:    "#FAF7F2",
  charcoal: "#1C1A17",
  warm:     "#4A4540",
  taupe:    "#7A736D",
  border:   "rgba(28,26,23,0.1)",
  borderMid:"rgba(28,26,23,0.16)",
};

const GLOBAL_NAV_CSS = `
  .gnav-link {
    font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${C.warm};
    text-decoration: none;
    letter-spacing: 0.01em;
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }
  .gnav-link::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    width: 0; height: 1px;
    background: ${C.charcoal};
    transition: width 0.25s ease;
  }
  .gnav-link:hover { color: ${C.charcoal}; }
  .gnav-link:hover::after { width: 100%; }
  .gnav-link.active { color: ${C.charcoal}; }
  .gnav-link.active::after { width: 100%; }

  .gnav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: ${C.cream}; background: ${C.charcoal};
    border: none; cursor: pointer;
    padding: 10px 22px; border-radius: 2px;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .gnav-cta:hover { opacity: 0.82; }

  .gnav-mobile-menu {
    display: none;
    flex-direction: column;
    position: fixed; inset: 0; z-index: 1000;
    background: ${C.charcoal};
    padding: 2rem;
    align-items: flex-start; justify-content: center; gap: 2rem;
  }
  .gnav-mobile-menu.open { display: flex; }

  .gnav-hamburger {
    display: none;
    flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 4px;
  }
  .gnav-hamburger span {
    display: block; width: 22px; height: 2px;
    background: ${C.charcoal}; border-radius: 2px;
    transition: all 0.2s;
  }
  .gnav-close {
    position: absolute; top: 1.5rem; right: 1.5rem;
    background: none; border: none; cursor: pointer;
    color: ${C.cream}; font-size: 1.8rem; line-height: 1;
  }

  @media (max-width: 768px) {
    .gnav-desktop-links { display: none !important; }
    .gnav-hamburger { display: flex !important; }
  }
`;

const NAV_LINKS = [
  { label: "Products",       href: "/products" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Blog",           href: "/blog" },
  { label: "About",          href: "/about" },
  { label: "Contact",        href: "/#contact" },
];

export default function GlobalNav() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <style>{GLOBAL_NAV_CSS}</style>

      {/* ── Fixed top bar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 900,
        height: "70px",
        background: C.cream,
        borderBottom: `1px solid ${scrolled ? C.borderMid : C.border}`,
        boxShadow: scrolled ? "0 2px 16px rgba(28,26,23,0.07)" : "none",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        display: "flex", alignItems: "center",
        padding: "0 clamp(1.5rem, 5vw, 4rem)",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          width: "100%", maxWidth: "1400px", margin: "0 auto",
        }}>
          {/* Logo */}
          <SiteLogo />

          {/* Desktop links */}
          <div className="gnav-desktop-links" style={{
            display: "flex", alignItems: "center", gap: "2.5rem",
          }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`gnav-link${isActive(l.href) ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/#contact" className="gnav-cta gnav-desktop-links">
              Get Quote →
            </Link>
            <button
              className="gnav-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-over ── */}
      <div className={`gnav-mobile-menu${mobileOpen ? " open" : ""}`}>
        <button className="gnav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          ×
        </button>
        <SiteLogo inverted />
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic", fontWeight: 400,
              fontSize: "2rem", color: C.cream,
              textDecoration: "none", letterSpacing: "0.03em",
            }}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/#contact" onClick={() => setMobileOpen(false)} className="gnav-cta">
          Get Quote →
        </Link>
      </div>
    </>
  );
}
