import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import GlobalNav from "@/components/GlobalNav";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://puneglobalgroup.in"),
  title: {
    default: "PP Corrugated Boxes, Trays & Separators Manufacturer in Pune | Pune Global Group",
    template: "%s | Pune Global Group",
  },
  description: "Custom PP corrugated boxes, trays, bins, layer pads and separators for automotive, pharma and electronics plants. Made in Pune since 1995. Request a quote.",
  keywords: "PP corrugated box manufacturer Pune, PP trays, PP separators, returnable packaging, layer pads, FBB board supplier Pune",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "PP corrugated packaging made in Pune | Pune Global Group",
    description: "Custom PP corrugated boxes, trays and separators for automotive, pharma and electronics plants.",
    url: "https://puneglobalgroup.in",
    siteName: "Pune Global Group",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Pune Global Group: PP corrugated packaging made in Pune" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap"
        />
      </head>
      <body className="antialiased">
        <Script
          defer
          data-domain="puneglobalgroup.in"
          src="https://plausible.yogeshsahu.xyz/js/script.js"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <GlobalNav />
          {children}
          <SiteFooter />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
