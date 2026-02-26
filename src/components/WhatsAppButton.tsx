"use client";

import { useState, useEffect } from "react";

const WA_URL =
  "https://wa.me/919823383230?text=Hi%2C%20I'd%20like%20to%20enquire%20about%20your%20packaging%20products.";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const contact = document.querySelector("#contact");
    if (!contact) return;

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(contact);
    return () => obs.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
          cursor: "pointer",
          textDecoration: "none",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          animation: "waPulse 4s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="30"
          height="30"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.004 2.667A13.28 13.28 0 0 0 2.73 15.94a13.2 13.2 0 0 0 1.79 6.633L2.667 29.333l6.96-1.824A13.28 13.28 0 0 0 16.004 29.3c7.337 0 13.33-5.97 13.33-13.33S23.34 2.667 16.003 2.667Zm0 24.396a11.01 11.01 0 0 1-5.614-1.533l-.403-.24-4.176 1.095 1.115-4.074-.262-.417a10.96 10.96 0 0 1-1.685-5.854c0-6.08 4.95-11.03 11.03-11.03 6.08 0 11.06 4.95 11.06 11.03-.005 6.08-4.985 11.023-11.065 11.023Zm6.053-8.264c-.332-.166-1.965-.97-2.27-1.08-.305-.112-.527-.167-.749.166-.222.332-.86 1.08-1.054 1.302-.194.222-.389.25-.72.083-.333-.166-1.404-.517-2.674-1.65-.988-.88-1.655-1.967-1.849-2.3-.194-.332-.02-.512.146-.677.149-.149.333-.389.499-.583.166-.194.222-.333.333-.555.111-.222.056-.416-.028-.583-.083-.166-.749-1.804-1.026-2.47-.27-.649-.545-.56-.749-.572l-.638-.01a1.225 1.225 0 0 0-.888.416c-.305.333-1.165 1.138-1.165 2.775s1.193 3.22 1.359 3.442c.166.222 2.347 3.582 5.688 5.025.794.343 1.415.548 1.898.701.798.254 1.524.218 2.098.132.64-.095 1.965-.803 2.243-1.579.277-.776.277-1.44.194-1.579-.083-.138-.305-.222-.638-.388Z" />
        </svg>
      </a>
    </>
  );
}
