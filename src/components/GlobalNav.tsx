"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "./SiteLogo";

const C = {
  cream:    "#FAF7F2",
  charcoal: "#1C1A17",
  warm:     "rgba(250,247,242,0.65)",
  taupe:    "rgba(250,247,242,0.45)",
  border:   "rgba(250,247,242,0.10)",
  borderMid:"rgba(250,247,242,0.18)",
};

const GLOBAL_NAV_CSS = `
  .gnav-link {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.825rem;
    font-weight: 500;
    color: ${C.warm};
    text-decoration: none;
    letter-spacing: 0.01em;
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 999px;
    transition: color 0.2s, background 0.25s;
  }
  .gnav-link:hover {
    color: ${C.cream};
    background: rgba(250,247,242,0.08);
  }
  .gnav-link.active {
    color: ${C.cream};
    background: rgba(250,247,242,0.12);
    font-weight: 600;
  }

  .gnav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #fff; background: #3A7BBF;
    border: none; cursor: pointer;
    padding: 10px 18px; border-radius: 6px;
    text-decoration: none;
    transition: background 0.2s;
  }
  .gnav-cta:hover { background: #2F6AA6; }

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
    background: ${C.cream}; border-radius: 2px;
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
  { label: "PP Packaging",   href: "/products/pp-corrugated" },
  { label: "Paper & Board",  href: "/products/paper-board" },
  { label: "Facility",       href: "/infrastructure" },
  { label: "Blog",           href: "/blog" },
  { label: "About",          href: "/about" },
  { label: "Contact",        href: "/contact" },
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
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <style>{GLOBAL_NAV_CSS}</style>

      {/* ── Top nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 900,
        height: "64px",
        background: "#141C2B",
        borderBottom: `1px solid rgba(250,247,242,${scrolled ? "0.14" : "0.08"})`,
        display: "flex", alignItems: "center",
        padding: "0 clamp(1rem, 4vw, 3rem)",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}>
          {/* Logo */}
          <SiteLogo inverted />

          {/* Desktop links */}
          <div className="gnav-desktop-links" style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
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
            <Link href="/contact" className="gnav-cta gnav-desktop-links">
              Request a quote
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
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontStyle: "normal", fontWeight: isActive(l.href) ? 600 : 400,
              fontSize: "2rem", color: C.cream,
              textDecoration: "none", letterSpacing: "0.03em",
              background: isActive(l.href) ? "rgba(250,247,242,0.10)" : "none",
              padding: "0.25rem 1.25rem",
              borderRadius: "999px",
            }}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/contact" onClick={() => setMobileOpen(false)} className="gnav-cta">
          Request a quote
        </Link>
      </div>
    </>
  );
}
