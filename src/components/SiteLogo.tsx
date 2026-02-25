"use client";
import Link from "next/link";

const saffron = "#F5A623";
const charcoal = "#1C1A17";
const taupe = "#7A736D";
const cream = "#FAF7F2";

function TuriyaLogo({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  const main = onDark ? cream : charcoal;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="Pune Global Group logo symbol"
      style={{ transform: "rotate(-45deg)", display: "block" }}>
      <path d="M6 6 L38 6 Q44 6, 44 12 L18 38 Q12 44, 6 44 L6 6 Z" fill={main} />
      <path d="M56 6 L94 6 L94 38 Q94 44, 88 44 L56 12 Q56 6, 62 6 Z" fill={saffron} />
      <path d="M94 56 L94 94 L62 94 Q56 94, 56 88 L82 62 Q88 56, 94 56 Z" fill={main} />
      <circle cx="25" cy="75" r="12" fill={saffron} opacity="0.15" />
      <circle cx="25" cy="75" r="5" fill={saffron} />
      <circle cx="25" cy="75" r="1.8" fill="#8B1A1A" />
    </svg>
  );
}

export function SiteLogo({ inverted = false, href = "/" }: { inverted?: boolean; href?: string }) {
  const textColor = inverted ? cream : charcoal;
  const subColor = inverted ? "rgba(250,247,242,0.55)" : taupe;
  return (
    <Link href={href} style={{ textDecoration: "none", userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <TuriyaLogo size={42} onDark={inverted} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.98rem",
            letterSpacing: "0.13em",
            color: textColor,
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}>
            Pune Global Group
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "0.98rem",
            color: subColor,
            letterSpacing: "0.03em",
            lineHeight: 1.2,
          }}>
            Your Trusted Packaging Partner
          </span>
        </div>
      </div>
    </Link>
  );
}
