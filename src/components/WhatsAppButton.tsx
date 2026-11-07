"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WA_NUMBER = "919823383230";
const HIDDEN_ON = ["/contact", "/admin", "/login"];

function waLink(pageTitle: string | null) {
  const text = pageTitle
    ? `Hi, I'd like a quote for ${pageTitle}. Size / quantity: `
    : "Hi, I'd like a quote for PP packaging. Size / quantity: ";
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

const WaIcon = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M16.004 2.667A13.28 13.28 0 0 0 2.73 15.94a13.2 13.2 0 0 0 1.79 6.633L2.667 29.333l6.96-1.824A13.28 13.28 0 0 0 16.004 29.3c7.337 0 13.33-5.97 13.33-13.33S23.34 2.667 16.003 2.667Zm0 24.396a11.01 11.01 0 0 1-5.614-1.533l-.403-.24-4.176 1.095 1.115-4.074-.262-.417a10.96 10.96 0 0 1-1.685-5.854c0-6.08 4.95-11.03 11.03-11.03 6.08 0 11.06 4.95 11.06 11.03-.005 6.08-4.985 11.023-11.065 11.023Zm6.053-8.264c-.332-.166-1.965-.97-2.27-1.08-.305-.112-.527-.167-.749.166-.222.332-.86 1.08-1.054 1.302-.194.222-.389.25-.72.083-.333-.166-1.404-.517-2.674-1.65-.988-.88-1.655-1.967-1.849-2.3-.194-.332-.02-.512.146-.677.149-.149.333-.389.499-.583.166-.194.222-.333.333-.555.111-.222.056-.416-.028-.583-.083-.166-.749-1.804-1.026-2.47-.27-.649-.545-.56-.749-.572l-.638-.01a1.225 1.225 0 0 0-.888.416c-.305.333-1.165 1.138-1.165 2.775s1.193 3.22 1.359 3.442c.166.222 2.347 3.582 5.688 5.025.794.343 1.415.548 1.898.701.798.254 1.524.218 2.098.132.64-.095 1.965-.803 2.243-1.579.277-.776.277-1.44.194-1.579-.083-.138-.305-.222-.638-.388Z" />
  </svg>
);

const CSS = `
  .wa-fab { position: fixed; right: 20px; bottom: 20px; z-index: 950; width: 52px; height: 52px; border-radius: 50%;
    background: #25D366; color: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
  .quote-bar { display: none; }
  @media (max-width: 768px) {
    .wa-fab { display: none; }
    .quote-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; position: fixed; left: 0; right: 0; bottom: 0; z-index: 950;
      padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); background: #141C2B; border-top: 1px solid rgba(250,247,242,0.12); }
    .quote-bar a { min-height: 46px; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'DM Sans', system-ui, sans-serif; font-size: 0.95rem; font-weight: 600; text-decoration: none; }
    .quote-bar .qb-quote { background: #3A7BBF; color: #fff; }
    .quote-bar .qb-wa { background: #25D366; color: #0B1422; }
    body { padding-bottom: 70px; }
  }
`;

/** Desktop: small WhatsApp button. Mobile: sticky bar with Quote + WhatsApp. */
export default function WhatsAppButton() {
  const pathname = usePathname();
  const [title, setTitle] = useState<string | null>(null);

  // Product pages: mention the product in the pre-filled message
  useEffect(() => {
    const h1 = pathname.startsWith("/products/") && pathname.split("/").filter(Boolean).length >= 3
      ? document.querySelector("h1")?.textContent?.trim() ?? null
      : null;
    setTitle(h1);
  }, [pathname]);

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  const href = waLink(title);
  const quoteHref = title ? `/contact?product=${encodeURIComponent(title)}` : "/contact";

  return (
    <>
      <style>{CSS}</style>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="wa-fab">
        <WaIcon size={28} />
      </a>
      <nav className="quote-bar" aria-label="Quick contact">
        <Link href={quoteHref} className="qb-quote">Request a quote</Link>
        <a href={href} target="_blank" rel="noopener noreferrer" className="qb-wa"><WaIcon size={20} /> WhatsApp</a>
      </nav>
    </>
  );
}
