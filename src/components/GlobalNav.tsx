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
    font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
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
    font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #fff; background: linear-gradient(180deg, #6BAAE0 0%, #3A7BBF 100%);
    border: none; cursor: pointer;
    padding: 8px 18px; border-radius: 999px;
    text-decoration: none;
    box-shadow: 0 2px 0 #2A5A8A, 0 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    text-shadow: 0 1px 0 rgba(0,0,0,0.15);
  }
  .gnav-cta:hover {
    background: linear-gradient(180deg, #8AC0F0 0%, #5B9BD5 100%);
    box-shadow: 0 3px 0 #2A5A8A, 0 5px 16px rgba(91,155,213,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-1px) scale(1.02);
  }
  .gnav-cta:active { transform: translateY(1px); box-shadow: 0 1px 0 #2A5A8A, 0 2px 4px rgba(0,0,0,0.2); }

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
  { label: "Home",           href: "/" },
  { label: "Products",       href: "/products" },
  { label: "Infrastructure", href: "/infrastructure" },
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

      {/* ── Floating glassmorphic nav ── */}
      <nav style={{
        position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - clamp(3rem, 10vw, 8rem) - 50px)",
        maxWidth: "1450px",
        zIndex: 900,
        height: "56px",
        background: scrolled ? "rgba(28,26,23,0.35)" : "rgba(28,26,23,0.15)",
        backdropFilter: "blur(40px) saturate(1.6)",
        WebkitBackdropFilter: "blur(40px) saturate(1.6)",
        border: `1px solid rgba(250,247,242,${scrolled ? "0.12" : "0.06"})`,
        borderRadius: "16px",
        boxShadow: scrolled
          ? "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(250,247,242,0.06)"
          : "none",
        transition: "box-shadow 0.3s ease, background 0.3s ease",
        display: "flex", alignItems: "center",
        padding: "0 clamp(1rem, 3vw, 1.75rem)",
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
              fontStyle: "italic", fontWeight: isActive(l.href) ? 600 : 400,
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
          Get Quote →
        </Link>
      </div>
    </>
  );
}
