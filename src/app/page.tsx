"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  ArrowRight, Menu, X, Globe, TrendingUp, Building2,
  Banknote, Truck, Code2, CheckCircle, Loader2,
  MapPin, Mail, Phone, ChevronDown, Shield, Zap, Award
} from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONT_LINK = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
`;

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#08090a",
  surface: "#0f1012",
  surfaceAlt: "#141618",
  border: "rgba(255,255,255,0.06)",
  accent: "#00c46a",
  accentDim: "rgba(0,196,106,0.12)",
  accentGlow: "rgba(0,196,106,0.25)",
  gold: "#c9a94e",
  white: "#f5f5f0",
  muted: "rgba(245,245,240,0.45)",
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

/* ─── Animation keyframes injected via style tag ───────────────────────────── */
const KEYFRAMES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes blobFloat { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(40px,-30px) scale(1.06); } 66% { transform:translate(-25px,20px) scale(0.96); } }
  @keyframes gridPulse { 0%,100% { opacity:0.03; } 50% { opacity:0.07; } }
  @keyframes lineGrow { from { scaleX:0; } to { scaleX:1; } }
  @keyframes spinSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes borderPulse { 0%,100% { border-color:rgba(0,196,106,0.3); } 50% { border-color:rgba(0,196,106,0.7); box-shadow:0 0 20px rgba(0,196,106,0.2); } }
`;

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.72s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.72s cubic-bezier(.22,1,.36,1) ${delay}s`,
  };
}

/* ─── Nav ───────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Services", "About", "Contact"];
  const scrollTo = (id: string) => { document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };

  return (
    <>
      <style>{FONT_LINK}{KEYFRAMES}</style>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "1rem 2.5rem" : "1.5rem 2.5rem",
        background: scrolled ? "rgba(8,9,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
        fontFamily: T.body,
      }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }} onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span style={{
            width: 38, height: 38, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.accent}, #00a857)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.display, fontWeight: 700, fontSize: "1.1rem", color: "#000",
            flexShrink: 0,
          }}>P</span>
          <span style={{ fontFamily: T.display, fontSize: "1.4rem", fontWeight: 600, color: T.white, letterSpacing: "-0.01em" }}>
            Pune<span style={{ color: T.accent }}>Global</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {links.map(l => (
            <button key={l} onClick={() => scrollTo(l)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: "0.875rem", fontWeight: 500, color: T.muted, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.2s", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = T.white)}
              onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
            >{l}</button>
          ))}
          <button onClick={() => scrollTo("Contact")}
            style={{ background: T.accent, color: "#000", border: "none", borderRadius: 6, padding: "0.55rem 1.25rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.875rem", fontWeight: 600, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#00e07a"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; }}
          >Get in Touch</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)}
          style={{ display: "none", background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "0.4rem", cursor: "pointer", color: T.white }}
          className="nav-hamburger"
        >{open ? <X size={20} /> : <Menu size={20} />}</button>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
        background: T.bg, padding: "6rem 2rem 2rem",
        display: "flex", flexDirection: "column", gap: "1rem",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(.22,1,.36,1)",
        fontFamily: T.body,
      }}>
        {links.map(l => (
          <button key={l} onClick={() => scrollTo(l)}
            style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "1rem 1.5rem", cursor: "pointer", fontFamily: T.body, fontSize: "1.1rem", fontWeight: 500, color: T.white, textAlign: "left" }}
          >{l}</button>
        ))}
        <button onClick={() => scrollTo("Contact")}
          style={{ background: T.accent, color: "#000", border: "none", borderRadius: 8, padding: "1rem 1.5rem", cursor: "pointer", fontFamily: T.body, fontSize: "1.1rem", fontWeight: 600, marginTop: "0.5rem" }}
        >Get in Touch →</button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-hamburger { display: flex !important; }
          nav > div:nth-child(2) { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.bg }}>
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        animation: "gridPulse 8s ease-in-out infinite",
      }} />

      {/* Blobs */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, animation: "blobFloat 14s ease-in-out infinite", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(201,169,78,0.12) 0%, transparent 70%)`, animation: "blobFloat 18s ease-in-out infinite reverse", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,196,106,0.05) 0%, transparent 70%)`, filter: "blur(60px)" }} />
      </div>

      {/* Rotating ring */}
      <div style={{
        position: "absolute", top: "12%", right: "8%", width: 180, height: 180, zIndex: 1,
        border: `1px solid ${T.accentDim}`, borderRadius: "50%",
        animation: "spinSlow 30s linear infinite",
      }}>
        <div style={{ position: "absolute", top: -4, left: "50%", marginLeft: -4, width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "2rem", maxWidth: 880, margin: "0 auto" }}>
        <div style={{ ...reveal(mounted, 0), display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.accentDim, border: `1px solid rgba(0,196,106,0.2)`, borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "2rem" }}>
          <Globe size={13} color={T.accent} />
          <span style={{ fontFamily: T.body, fontSize: "0.75rem", color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Pune, India — Global Reach</span>
        </div>

        <h1 style={{
          ...reveal(mounted, 0.1),
          fontFamily: T.display, fontWeight: 600,
          fontSize: "clamp(3.2rem, 8vw, 7rem)",
          lineHeight: 1.02, letterSpacing: "-0.02em",
          color: T.white, marginBottom: "0.2em",
        }}>
          Global Business,
          <br />
          <span style={{ color: T.accent, fontStyle: "italic" }}>Pune&apos;s Pride.</span>
        </h1>

        <p style={{ ...reveal(mounted, 0.2), fontFamily: T.body, fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: T.muted, maxWidth: 540, margin: "1.5rem auto 2.5rem", lineHeight: 1.75, fontWeight: 300 }}>
          A diversified business group delivering world-class solutions across consulting, real estate, finance, logistics, and technology.
        </p>

        <div style={{ ...reveal(mounted, 0.3), display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: T.accent, color: "#000", border: "none", borderRadius: 8, padding: "0.9rem 2rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.95rem", fontWeight: 600, transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#00e07a"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${T.accentGlow}`; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >Get in Touch <ArrowRight size={16} /></button>

          <button
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "transparent", color: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0.9rem 2rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.95rem", fontWeight: 500, transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
          >Our Services</button>
        </div>

        {/* Stats */}
        <div style={{ ...reveal(mounted, 0.45), display: "flex", gap: "3rem", justifyContent: "center", marginTop: "4rem", flexWrap: "wrap" }}>
          {[["20+", "Years"], ["500+", "Clients"], ["12", "Cities"], ["6", "Sectors"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.display, fontSize: "2.4rem", fontWeight: 700, color: T.white, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: T.body, fontSize: "0.78rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.3rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontFamily: T.body, fontSize: "0.7rem", color: T.muted, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
        <ChevronDown size={16} color={T.muted} style={{ animation: "fadeIn 2s ease-in-out infinite alternate" }} />
      </div>
    </section>
  );
}

/* ─── Services ──────────────────────────────────────────────────────────────── */
const SERVICES = [
  { icon: TrendingUp, title: "Consulting", desc: "Strategic advisory that transforms business challenges into competitive advantages across industries." },
  { icon: Globe, title: "Export & Import", desc: "Seamless global trade facilitation with end-to-end documentation, compliance, and logistics." },
  { icon: Building2, title: "Real Estate", desc: "Premium residential and commercial properties across Maharashtra and pan-India." },
  { icon: Banknote, title: "Financial Services", desc: "Tailored financial solutions — investments, corporate finance, and wealth management." },
  { icon: Truck, title: "Logistics", desc: "Reliable, tech-enabled supply chain and last-mile delivery solutions across India." },
  { icon: Code2, title: "IT Solutions", desc: "Custom software, digital transformation, and enterprise technology that powers modern business." },
];

function Services() {
  const { ref, visible } = useInView(0.1);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="services" ref={ref as React.RefObject<HTMLElement>} style={{ background: T.bg, padding: "8rem 2rem", fontFamily: T.body }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "5rem" }}>
          <div style={{ ...reveal(visible, 0), display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: 32, height: 1, background: T.accent }} />
            <span style={{ fontSize: "0.75rem", color: T.accent, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>What We Do</span>
          </div>
          <h2 style={{ ...reveal(visible, 0.08), fontFamily: T.display, fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 600, color: T.white, lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 600 }}>
            Six Pillars of<br /><em style={{ color: T.accent }}>Sustained Growth</em>
          </h2>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5px", background: T.border }}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const isHov = hovered === i;
            return (
              <div key={s.title}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...reveal(visible, 0.08 + i * 0.07),
                  background: isHov ? T.surfaceAlt : T.surface,
                  padding: "2.5rem",
                  cursor: "default",
                  transition: "background 0.3s",
                  borderTop: isHov ? `2px solid ${T.accent}` : `2px solid transparent`,
                  position: "relative", overflow: "hidden",
                }}>
                {/* corner glow */}
                {isHov && <div style={{ position: "absolute", top: 0, left: 0, width: 120, height: 120, background: `radial-gradient(circle at 0 0, ${T.accentDim}, transparent)`, pointerEvents: "none" }} />}

                <div style={{ width: 48, height: 48, borderRadius: 10, background: isHov ? T.accentDim : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", transition: "background 0.3s" }}>
                  <Icon size={22} color={isHov ? T.accent : T.muted} strokeWidth={1.5} style={{ transition: "color 0.3s" }} />
                </div>

                <h3 style={{ fontFamily: T.display, fontSize: "1.5rem", fontWeight: 600, color: T.white, marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>{s.title}</h3>
                <p style={{ fontSize: "0.9rem", color: T.muted, lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1.75rem", opacity: isHov ? 1 : 0, transition: "opacity 0.3s" }}>
                  <span style={{ fontSize: "0.8rem", color: T.accent, fontWeight: 500 }}>Learn more</span>
                  <ArrowRight size={14} color={T.accent} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─────────────────────────────────────────────────────────────────── */
const VALUES = [
  { icon: Shield, label: "Integrity", desc: "Transparency and ethical conduct in every interaction, every decision." },
  { icon: Zap, label: "Innovation", desc: "Forward-thinking approaches that redefine how business gets done." },
  { icon: Award, label: "Excellence", desc: "Relentless pursuit of quality — in outcomes, relationships, and service." },
];

function About() {
  const { ref, visible } = useInView(0.1);

  return (
    <section id="about" ref={ref as React.RefObject<HTMLElement>} style={{ background: T.surface, padding: "8rem 2rem", fontFamily: T.body, position: "relative", overflow: "hidden" }}>
      {/* background accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 500, height: 500, background: `radial-gradient(circle at 100% 0%, ${T.accentDim}, transparent)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>
          {/* Left */}
          <div>
            <div style={{ ...reveal(visible, 0), display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 32, height: 1, background: T.accent }} />
              <span style={{ fontSize: "0.75rem", color: T.accent, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Our Story</span>
            </div>
            <h2 style={{ ...reveal(visible, 0.08), fontFamily: T.display, fontSize: "clamp(2.2rem, 4vw, 3.5rem)", fontWeight: 600, color: T.white, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "2rem" }}>
              Built on Trust.<br /><em style={{ color: T.accent }}>Driven by Purpose.</em>
            </h2>
            <p style={{ ...reveal(visible, 0.16), fontSize: "0.95rem", color: T.muted, lineHeight: 1.8, fontWeight: 300, marginBottom: "1.25rem" }}>
              Founded in Pune, Pune Global Group has grown from a regional consulting firm into a diversified conglomerate serving clients across India and internationally. Our roots in Maharashtra give us deep market insight; our global partnerships give us scale.
            </p>
            <p style={{ ...reveal(visible, 0.22), fontSize: "0.95rem", color: T.muted, lineHeight: 1.8, fontWeight: 300, marginBottom: "2.5rem" }}>
              We believe that business done right uplifts communities, creates lasting value, and opens doors for future generations. This belief drives every venture we undertake.
            </p>

            {/* Values */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={v.label} style={{ ...reveal(visible, 0.28 + i * 0.08), display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={T.accent} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontFamily: T.display, fontSize: "1.1rem", fontWeight: 600, color: T.white, marginBottom: "0.25rem" }}>{v.label}</div>
                      <div style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.65, fontWeight: 300 }}>{v.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — team placeholders */}
          <div style={{ ...reveal(visible, 0.12) }}>
            <div style={{ fontFamily: T.display, fontSize: "1.2rem", fontWeight: 600, color: T.muted, marginBottom: "1.5rem", letterSpacing: "0.02em" }}>Leadership Team</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {["Founder & CEO", "Director, Finance", "VP Operations", "Head, Technology"].map((role, i) => (
                <div key={role} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accentDim}, rgba(201,169,78,0.1))`, margin: "0 auto 1rem", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: T.display, fontSize: "1.3rem", color: T.muted }}>{["A", "R", "S", "P"][i]}</span>
                  </div>
                  <div style={{ fontFamily: T.display, fontSize: "1rem", fontWeight: 600, color: T.white, marginBottom: "0.3rem" }}>
                    {["A. Sharma", "R. Kulkarni", "S. Deshpande", "P. Joshi"][i]}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: T.muted }}>{role}</div>
                </div>
              ))}
            </div>

            {/* Stat strip */}
            <div style={{ marginTop: "2rem", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", textAlign: "center" }}>
              {[["₹500Cr+", "Revenue"], ["2,000+", "Projects"], ["98%", "Retention"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: T.display, fontSize: "1.6rem", fontWeight: 700, color: T.accent }}>{n}</div>
                  <div style={{ fontSize: "0.72rem", color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.2rem" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){ #about .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }`}</style>
    </section>
  );
}

/* ─── Contact ───────────────────────────────────────────────────────────────── */
function Contact() {
  const { ref, visible } = useInView(0.1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "contacts"), {
        ...form,
        createdAt: serverTimestamp(),
        source: "website",
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "0.85rem 1rem", color: T.white,
    fontFamily: T.body, fontSize: "0.9rem", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  };

  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} style={{ background: T.bg, padding: "8rem 2rem", fontFamily: T.body, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: `radial-gradient(ellipse at center bottom, ${T.accentDim}, transparent)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ ...reveal(visible, 0), display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: 32, height: 1, background: T.accent }} />
            <span style={{ fontSize: "0.75rem", color: T.accent, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Contact Us</span>
            <div style={{ width: 32, height: 1, background: T.accent }} />
          </div>
          <h2 style={{ ...reveal(visible, 0.08), fontFamily: T.display, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 600, color: T.white, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Let&apos;s Build Something<br /><em style={{ color: T.accent }}>Remarkable Together</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "4rem", alignItems: "start" }}>
          {/* Info */}
          <div style={{ ...reveal(visible, 0.12) }}>
            <p style={{ fontSize: "0.95rem", color: T.muted, lineHeight: 1.8, fontWeight: 300, marginBottom: "2.5rem" }}>
              Whether you&apos;re exploring a partnership, seeking our services, or have a business proposition — we&apos;re ready to listen and respond.
            </p>
            {[
              { icon: MapPin, label: "Headquarters", value: "Pune, Maharashtra, India" },
              { icon: Mail, label: "Email", value: "contact@puneglobalgroup.in" },
              { icon: Phone, label: "Phone", value: "+91 20 0000 0000" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={T.accent} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ fontSize: "0.9rem", color: T.white, fontWeight: 400 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ ...reveal(visible, 0.18), background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "2.5rem" }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <CheckCircle size={48} color={T.accent} style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ fontFamily: T.display, fontSize: "1.8rem", color: T.white, marginBottom: "0.75rem" }}>Message Received</h3>
                <p style={{ color: T.muted, fontSize: "0.9rem", lineHeight: 1.7 }}>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => setStatus("idle")} style={{ marginTop: "1.5rem", background: T.accentDim, color: T.accent, border: "none", borderRadius: 8, padding: "0.7rem 1.5rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.875rem", fontWeight: 500 }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: T.muted, marginBottom: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = T.accent)}
                      onBlur={e => (e.target.style.borderColor = T.border)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: T.muted, marginBottom: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = T.accent)}
                      onBlur={e => (e.target.style.borderColor = T.border)} />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: T.muted, marginBottom: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e => (e.target.style.borderColor = T.border)} />
                </div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: T.muted, marginBottom: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your business need..."
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e => (e.target.style.borderColor = T.border)} />
                </div>

                {status === "error" && (
                  <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: "0.875rem", color: "#f87171" }}>
                    Something went wrong. Please try again.
                  </div>
                )}

                <button type="submit" disabled={status === "loading"}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", background: T.accent, color: "#000", border: "none", borderRadius: 8, padding: "0.9rem", cursor: status === "loading" ? "not-allowed" : "pointer", fontFamily: T.body, fontSize: "0.95rem", fontWeight: 600, opacity: status === "loading" ? 0.75 : 1, transition: "all 0.2s" }}
                  onMouseEnter={e => { if (status !== "loading") { e.currentTarget.style.background = "#00e07a"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {status === "loading" ? <><Loader2 size={16} style={{ animation: "spinSlow 1s linear infinite" }} /> Sending…</> : <>Send Message <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){ #contact .contact-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; } }`}</style>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: "2.5rem 2rem", fontFamily: T.body }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ width: 30, height: 30, borderRadius: 6, background: `linear-gradient(135deg, ${T.accent}, #00a857)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.display, fontWeight: 700, fontSize: "0.9rem", color: "#000" }}>P</span>
          <span style={{ fontFamily: T.display, fontSize: "1.1rem", fontWeight: 600, color: T.white }}>Pune<span style={{ color: T.accent }}>Global</span> Group</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: T.muted }}>
          &copy; {new Date().getFullYear()} Pune Global Group. All rights reserved. &nbsp;|&nbsp; puneglobalgroup.in
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Sitemap"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.8rem", color: T.muted, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = T.white)}
              onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
            >{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main style={{ fontFamily: T.body, background: T.bg, minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
