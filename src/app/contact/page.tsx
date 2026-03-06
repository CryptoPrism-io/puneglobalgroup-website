"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconBuildingFactory2,
  IconArrowRight,
  IconLoader2,
  IconCircleCheck,
  IconCheck,
} from "@tabler/icons-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/* ─── Design Tokens ──────────────────────────────────────────────────────────── */
const C = {
  cream:     "#FAF7F2",
  navy:      "#0F1A2E",
  navyLight: "#152238",
  navyMid:   "#1A2A40",
  navyDark:  "#0A1220",
  steel:     "#5B9BD5",
  gold:      "#C8B89A",
  saffron:   "#F5A623",
  border:    "rgba(250,247,242,0.08)",
  borderMid: "rgba(250,247,242,0.12)",
  textMain:  "#FAF7F2",
  textMuted: "rgba(250,247,242,0.60)",
  textFaint: "rgba(250,247,242,0.40)",
  cardBg:    "rgba(250,247,242,0.04)",
  surfaceBg: "rgba(250,247,242,0.06)",
};

const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};

/* ─── Page-scoped CSS ────────────────────────────────────────────────────────── */
const PAGE_CSS = `

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Hero header text ── */
  .cp-eyebrow {
    font-family: ${F.italic};
    font-style: italic;
    font-size: 1.18rem;
    color: rgba(245,166,35,0.75);
    letter-spacing: 0.03em;
    display: block;
    margin-bottom: 14px;
    animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }
  .cp-h1 {
    font-family: ${F.display};
    font-weight: 700;
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    color: ${C.cream};
    letter-spacing: -0.02em;
    line-height: 1.08;
    margin: 0 0 1.5rem;
    animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.22s both;
  }
  .cp-sub {
    font-family: ${F.body};
    font-size: clamp(1rem, 2vw, 1.13rem);
    color: rgba(250,247,242,0.60);
    font-weight: 300;
    line-height: 1.72;
    max-width: 54ch;
    margin: 0;
    animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.36s both;
  }

  /* ── Breadcrumb ── */
  .cp-breadcrumb {
    font-family: ${F.body};
    font-size: 0.78rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    color: rgba(250,247,242,0.35);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2.5rem;
    animation: fadeUp 0.6s ease 0.05s both;
  }
  .cp-breadcrumb a {
    color: rgba(250,247,242,0.35);
    transition: color 0.2s;
    text-decoration: none;
  }
  .cp-breadcrumb a:hover { color: rgba(250,247,242,0.7); }

  /* ── Two-column body grid ── */
  .cp-body-grid {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 3rem;
    align-items: flex-start;
  }
  @media (max-width: 900px) {
    .cp-body-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  /* ── Name + Company row ── */
  .cp-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  @media (max-width: 560px) {
    .cp-row-2 { grid-template-columns: 1fr; }
  }

  /* ── Form inputs ── */
  .cp-input {
    width: 100%;
    background: ${C.surfaceBg};
    border: 1px solid ${C.borderMid};
    border-radius: 1px;
    padding: 11px 15px;
    font-family: ${F.body};
    font-size: 0.9rem;
    color: ${C.cream};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }
  .cp-input:focus {
    border-color: ${C.gold};
    box-shadow: 0 0 0 3px rgba(200,184,154,0.12);
  }
  .cp-input::placeholder {
    color: ${C.textFaint};
    opacity: 1;
  }

  /* ── Select wrapper (custom arrow) ── */
  .cp-select-wrap {
    position: relative;
  }
  .cp-select-wrap::after {
    content: '';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid ${C.textFaint};
    pointer-events: none;
  }
  .cp-input-select {
    width: 100%;
    background: ${C.surfaceBg};
    border: 1px solid ${C.borderMid};
    border-radius: 1px;
    padding: 11px 36px 11px 15px;
    font-family: ${F.body};
    font-size: 0.9rem;
    color: ${C.cream};
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }
  .cp-input-select:focus {
    border-color: ${C.gold};
    box-shadow: 0 0 0 3px rgba(200,184,154,0.12);
  }
  .cp-input-select option { background: ${C.navyMid}; color: ${C.cream}; }
  .cp-input-select option[value=""] { color: rgba(250,247,242,0.40); }

  /* ── Primary submit button ── */
  .cp-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${C.gold};
    color: ${C.navyDark};
    font-family: ${F.body};
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    padding: 13px 30px;
    border: none;
    border-radius: 1px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .cp-btn:hover:not(:disabled) {
    background: #D4C4A8;
    transform: translateY(-1px);
  }
  .cp-btn:active { transform: translateY(0); }
  .cp-btn:disabled { opacity: 0.65; cursor: default; }

  /* ── "Why us" bullet list ── */
  .cp-why-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .cp-why-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-family: ${F.body};
    font-size: 0.88rem;
    color: ${C.textMuted};
    line-height: 1.55;
    font-weight: 300;
  }
  .cp-why-icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    background: rgba(245,166,35,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }
`;

/* ─── Logo Mark ──────────────────────────────────────────────────────────────── */
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ transform: "rotate(-45deg)", display: "block", flexShrink: 0 }}
    >
      <path d="M6 6 L38 6 Q44 6, 44 12 L18 38 Q12 44, 6 44 L6 6 Z" fill={C.cream} />
      <path d="M56 6 L94 6 L94 38 Q94 44, 88 44 L56 12 Q56 6, 62 6 Z" fill={C.saffron} />
      <path d="M94 56 L94 94 L62 94 Q56 94, 56 88 L82 62 Q88 56, 94 56 Z" fill={C.cream} />
      <circle cx="25" cy="75" r="12" fill={C.saffron} opacity="0.15" />
      <circle cx="25" cy="75" r="5" fill={C.saffron} />
      <circle cx="25" cy="75" r="1.8" fill="#8B1A1A" />
    </svg>
  );
}

/* ─── Field Label ────────────────────────────────────────────────────────────── */
function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display:       "block",
        fontFamily:    F.body,
        fontWeight:    500,
        fontSize:      "0.72rem",
        color:         C.textMuted,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom:  "6px",
      }}
    >
      {children}
    </label>
  );
}

/* ─── Contact Page ───────────────────────────────────────────────────────────── */
const PRODUCT_OPTIONS = [
  "PP Corrugated Sheets",
  "PP Corrugated Crates / Boxes",
  "PP Foldable Boxes",
  "PP Automotive Trays",
  "PP Layer Pads",
  "PP ESD / Anti-Static Packaging",
  "PP Grid Separators / Inserts",
  "Kraft Liner / Test Liner",
  "FBB / Duplex Board",
  "Other / Not Sure",
];

const WHY_US = [
  "ISO-aligned manufacturing at our 50 T/day Sanaswadi MIDC facility",
  "Custom tooling for automotive, pharma and e-commerce specs",
  "ITC, TNPL & imported paper grades held in ready stock",
  "Export-quality packaging dispatched pan-India",
  "Supplier qualification documentation available on request",
  "Dedicated account manager from RFQ through delivery",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name:            "",
    company:         "",
    email:           "",
    phone:           "",
    productInterest: "",
    message:         "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("submitting");
    try {
      await addDoc(collection(db, "contacts"), {
        name:            form.name.trim(),
        company:         form.company.trim(),
        email:           form.email.trim(),
        phone:           form.phone.trim(),
        productInterest: form.productInterest,
        message:         form.message.trim(),
        createdAt:       serverTimestamp(),
        source:          "website-contact",
      });
      setStatus("success");
      setForm({ name: "", company: "", email: "", phone: "", productInterest: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const contactItems = [
    {
      icon:  <IconPhone  size={15} color={C.saffron} />,
      label: "Phone",
      value: "+91 98233 83230",
      href:  "tel:+919823383230",
    },
    {
      icon:  <IconMail   size={15} color={C.saffron} />,
      label: "Email",
      value: "yogesh.sahu@puneglobalgroup.in",
      href:  "mailto:yogesh.sahu@puneglobalgroup.in",
    },
    {
      icon:  <IconMapPin size={15} color={C.saffron} />,
      label: "Office",
      value: "206 Gulmohar Center Point, Pune 411006, Maharashtra",
      href:  null,
    },
    {
      icon:  <IconBuildingFactory2 size={15} color={C.saffron} />,
      label: "Factory",
      value: "108 BU Bhandari MIDC, Sanaswadi 412208, Pune",
      href:  null,
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <main className="section-dark" style={{ paddingTop: "70px", background: C.navy, minHeight: "100vh" }}>

        {/* ── Dark hero header ────────────────────────────────────────────────── */}
        <div
          style={{
            background: C.navyDark,
            padding:    "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vw, 4.5rem)",
            position:   "relative",
            overflow:   "hidden",
          }}
        >
          {/* Radial saffron glow — top right */}
          <div
            aria-hidden
            style={{
              position:      "absolute",
              top:           0,
              right:         0,
              width:         "400px",
              height:        "400px",
              background:    "radial-gradient(ellipse at top right, rgba(245,166,35,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          {/* Subtle diagonal rule */}
          <div
            aria-hidden
            style={{
              position:      "absolute",
              bottom:        "-1px",
              left:          0,
              right:         0,
              height:        "1px",
              background:    `linear-gradient(to right, transparent 0%, rgba(245,166,35,0.18) 30%, rgba(245,166,35,0.18) 70%, transparent 100%)`,
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}>

            {/* Breadcrumb */}
            <nav className="cp-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span style={{ opacity: 0.3 }}>/</span>
              <span style={{ color: "rgba(250,247,242,0.55)" }}>Contact</span>
            </nav>

            <span className="cp-eyebrow">Get in Touch</span>
            <h1 className="cp-h1">Start Your Packaging Project.</h1>
            <p className="cp-sub">
              Send us your RFQ, request a sample, or begin supplier qualification.
              Whether you need returnable PP crates for an automotive line or
              board grades in bulk, our team responds within one business day.
            </p>

            <div style={{ marginTop: "2.25rem", animation: "fadeUp 0.6s ease 0.48s both" }}>
              <Link
                href="/"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "5px",
                  fontFamily:     F.body,
                  fontSize:       "0.78rem",
                  fontWeight:     400,
                  letterSpacing:  "0.07em",
                  textTransform:  "uppercase",
                  color:          "rgba(250,247,242,0.45)",
                  textDecoration: "none",
                  transition:     "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(250,247,242,0.85)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,247,242,0.45)")}
              >
                <IconArrowRight size={12} style={{ transform: "rotate(180deg)" }} />
                Back to homepage
              </Link>
            </div>

          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1400px",
            margin:   "0 auto",
            padding:  "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)",
          }}
        >
          <div className="cp-body-grid">

            {/* ── Left column: contact info + why us ─────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Contact details card */}
              <div
                style={{
                  background: C.cardBg,
                  border:     `1px solid ${C.borderMid}`,
                  padding:    "2.5rem",
                }}
              >
                {/* Card header: logo mark + brand */}
                <div
                  style={{
                    display:       "flex",
                    alignItems:    "center",
                    gap:           "12px",
                    paddingBottom: "1.5rem",
                    borderBottom:  `2px solid ${C.saffron}`,
                    marginBottom:  "2rem",
                  }}
                >
                  <LogoMark size={34} />
                  <div>
                    <div
                      style={{
                        fontFamily:    F.body,
                        fontWeight:    600,
                        fontSize:      "1rem",
                        color:         C.cream,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        lineHeight:    1.2,
                      }}
                    >
                      Pune Global Group
                    </div>
                    <div
                      style={{
                        fontFamily: F.italic,
                        fontStyle:  "italic",
                        fontSize:   "0.94rem",
                        color:      C.textMuted,
                        marginTop:  "2px",
                      }}
                    >
                      Paper &amp; PP Packaging Solutions
                    </div>
                  </div>
                </div>

                {/* Contact items */}
                {contactItems.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display:      "flex",
                      gap:          "1rem",
                      alignItems:   "flex-start",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width:           "32px",
                        height:          "32px",
                        background:      "rgba(245,166,35,0.12)",
                        borderRadius:    "1px",
                        display:         "flex",
                        alignItems:      "center",
                        justifyContent:  "center",
                        flexShrink:      0,
                        marginTop:       "1px",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily:    F.body,
                          fontWeight:    500,
                          fontSize:      "0.67rem",
                          color:         C.saffron,
                          textTransform: "uppercase",
                          letterSpacing: "0.09em",
                          marginBottom:  "3px",
                        }}
                      >
                        {item.label}
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          style={{
                            fontFamily:     F.body,
                            fontSize:       "0.97rem",
                            color:          C.cream,
                            lineHeight:     1.55,
                            textDecoration: "none",
                            transition:     "color 0.2s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                          onMouseLeave={e => (e.currentTarget.style.color = C.cream)}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div
                          style={{
                            fontFamily: F.body,
                            fontSize:   "0.97rem",
                            color:      C.cream,
                            lineHeight: 1.55,
                          }}
                        >
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Hours */}
                <div
                  style={{
                    marginTop:  "1.75rem",
                    paddingTop: "1.5rem",
                    borderTop:  `1px solid ${C.border}`,
                    fontFamily: F.italic,
                    fontStyle:  "italic",
                    fontSize:   "1rem",
                    color:      C.textMuted,
                    lineHeight: 1.6,
                  }}
                >
                  Monday – Saturday · 9:30 AM – 6:30 PM IST
                </div>

                {/* WhatsApp note */}
                <div
                  style={{
                    marginTop:  "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop:  `1px solid ${C.border}`,
                    fontFamily: F.body,
                    fontSize:   "0.82rem",
                    color:      C.textMuted,
                    lineHeight: 1.65,
                    fontWeight: 300,
                  }}
                >
                  Prefer a direct conversation? Call or WhatsApp{" "}
                  <a
                    href="tel:+919823383230"
                    style={{
                      color:          C.cream,
                      fontWeight:     500,
                      textDecoration: "none",
                      transition:     "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.cream)}
                  >
                    +91 98233 83230
                  </a>
                  .
                </div>
              </div>

              {/* Why work with us card */}
              <div
                style={{
                  background:  C.surfaceBg,
                  border:      `1px solid ${C.borderMid}`,
                  padding:     "2rem 2.25rem",
                }}
              >
                <div
                  style={{
                    fontFamily:    F.body,
                    fontWeight:    500,
                    fontSize:      "0.68rem",
                    color:         C.saffron,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom:  "0.65rem",
                  }}
                >
                  Why Work With Us
                </div>
                <div
                  style={{
                    fontFamily:    F.display,
                    fontWeight:    600,
                    fontSize:      "1.15rem",
                    color:         C.cream,
                    lineHeight:    1.25,
                    marginBottom:  "1.5rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Decades of industrial packaging expertise
                </div>
                <ul className="cp-why-list">
                  {WHY_US.map((point) => (
                    <li key={point} className="cp-why-item">
                      <span className="cp-why-icon">
                        <IconCheck size={10} color={C.saffron} strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* ── Right column: enquiry form ──────────────────────────────────── */}
            <div>
              <div
                style={{
                  background:  C.cardBg,
                  border:      `1px solid ${C.borderMid}`,
                  borderTop:   `3px solid ${C.gold}`,
                  padding:     "2.75rem",
                }}
              >
                <h2
                  className="h2-dark"
                  style={{
                    fontFamily:    F.display,
                    fontWeight:    700,
                    fontSize:      "1.85rem",
                    color:         C.cream,
                    marginBottom:  "0.45rem",
                    letterSpacing: "-0.01em",
                    lineHeight:    1.12,
                  }}
                >
                  Request a Quote
                </h2>
                <p
                  style={{
                    fontFamily:   F.body,
                    fontSize:     "1.02rem",
                    color:        C.textMuted,
                    lineHeight:   1.68,
                    marginBottom: "2.25rem",
                    fontWeight:   300,
                  }}
                >
                  Share your packaging requirements — volume, dimensions, material,
                  industry — and we will turn around a detailed quote within one
                  business day.
                </p>

                {status === "success" ? (
                  /* ── Success state ────────────────────────────────────────── */
                  <div
                    style={{
                      background: "rgba(200,184,154,0.06)",
                      border:     "1px solid rgba(200,184,154,0.22)",
                      padding:    "2.75rem 2rem",
                      textAlign:  "center",
                    }}
                  >
                    <IconCircleCheck
                      size={42}
                      style={{ color: C.gold, marginBottom: "1rem" }}
                    />
                    <div
                      style={{
                        fontFamily:   F.display,
                        fontWeight:   600,
                        fontSize:     "1.25rem",
                        color:        C.cream,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Message Received
                    </div>
                    <div
                      style={{
                        fontFamily: F.body,
                        fontSize:   "1.02rem",
                        color:      C.textMuted,
                        lineHeight: 1.68,
                        fontWeight: 300,
                      }}
                    >
                      Thank you for reaching out. Our team will respond within
                      one business day.
                    </div>
                    <button
                      className="cp-btn"
                      style={{ marginTop: "1.75rem" }}
                      onClick={() => setStatus("idle")}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  /* ── Enquiry form ─────────────────────────────────────────── */
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                  >

                    {/* Name + Company */}
                    <div className="cp-row-2">
                      <div>
                        <FieldLabel htmlFor="cp-name">
                          Name <span style={{ color: C.saffron }}>*</span>
                        </FieldLabel>
                        <input
                          id="cp-name"
                          type="text"
                          className="cp-input"
                          placeholder="Your full name"
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          required
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor="cp-company">Company</FieldLabel>
                        <input
                          id="cp-company"
                          type="text"
                          className="cp-input"
                          placeholder="Organisation name"
                          value={form.company}
                          onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                          autoComplete="organization"
                        />
                      </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="cp-row-2">
                      <div>
                        <FieldLabel htmlFor="cp-email">
                          Email <span style={{ color: C.saffron }}>*</span>
                        </FieldLabel>
                        <input
                          id="cp-email"
                          type="email"
                          className="cp-input"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <FieldLabel htmlFor="cp-phone">Phone</FieldLabel>
                        <input
                          id="cp-phone"
                          type="tel"
                          className="cp-input"
                          placeholder="+91 XXXXX XXXXX"
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* Product Interest */}
                    <div>
                      <FieldLabel htmlFor="cp-product">Product Interest</FieldLabel>
                      <div className="cp-select-wrap">
                        <select
                          id="cp-product"
                          className="cp-input-select"
                          value={form.productInterest}
                          onChange={e => setForm(p => ({ ...p, productInterest: e.target.value }))}
                        >
                          <option value="">Select a product category</option>
                          {PRODUCT_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <FieldLabel htmlFor="cp-message">
                        Message <span style={{ color: C.saffron }}>*</span>
                      </FieldLabel>
                      <textarea
                        id="cp-message"
                        className="cp-input"
                        rows={6}
                        placeholder="Describe your packaging requirements — product type, annual volume, dimensions, material preference, industry..."
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        required
                        style={{ resize: "vertical", minHeight: "140px" }}
                      />
                    </div>

                    {/* Error banner */}
                    {status === "error" && (
                      <div
                        style={{
                          background: "rgba(220,60,60,0.10)",
                          border:     "1px solid rgba(220,60,60,0.25)",
                          padding:    "11px 15px",
                          fontFamily: F.body,
                          fontSize:   "0.86rem",
                          color:      "#F08080",
                          lineHeight: 1.5,
                        }}
                      >
                        Something went wrong. Please try again or call us directly
                        at +91 98233 83230.
                      </div>
                    )}

                    {/* Submit row */}
                    <div
                      style={{
                        display:    "flex",
                        alignItems: "center",
                        gap:        "1.5rem",
                        flexWrap:   "wrap",
                        marginTop:  "0.25rem",
                      }}
                    >
                      <button
                        type="submit"
                        className="cp-btn"
                        disabled={status === "submitting"}
                      >
                        {status === "submitting" ? (
                          <>
                            <IconLoader2
                              size={15}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Request
                            <IconArrowRight size={14} />
                          </>
                        )}
                      </button>

                      <p
                        style={{
                          fontFamily: F.italic,
                          fontStyle:  "italic",
                          fontSize:   "1rem",
                          color:      C.textFaint,
                          opacity:    1,
                          margin:     0,
                        }}
                      >
                        We respect your privacy.
                      </p>
                    </div>

                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>
    </>
  );
}
