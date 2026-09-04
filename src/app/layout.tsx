import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import GlobalNav from "@/components/GlobalNav";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://puneglobalgroup.in"),
  title: "Pune Global Group | Industrial Packaging Manufacturer, Pune",
  description:
    "Precision PP trays, boxes, separators, crates and bins for automotive, pharma and electronics, plus FBB paper & board converting. Manufactured to export standards in Pune since 1995.",
  keywords:
    "Pune Global Group, industrial packaging, PP corrugated, corrugated boxes, FBB cartons, paper board, Pune packaging manufacturer",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Pune Global Group | Industrial Packaging Manufacturer, Pune",
    description:
      "Precision PP trays, boxes, separators, crates and bins for automotive, pharma and electronics, plus FBB paper & board converting.",
    url: "https://puneglobalgroup.in",
    siteName: "Pune Global Group",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/hero-homepage-v2.jpg", width: 1600, height: 900, alt: "Pune Global Group" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pune Global Group | Industrial Packaging Manufacturer, Pune",
    description:
      "Precision PP trays, boxes, separators, crates and bins for automotive, pharma and electronics.",
    images: ["/hero-homepage-v2.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://puneglobalgroup.in/#organization",
                  name: "Pune Global Group",
                  url: "https://puneglobalgroup.in",
                  logo: "https://puneglobalgroup.in/favicon.svg",
                  foundingDate: "1995",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "206 Gulmohar Centre Point",
                    addressLocality: "Pune",
                    addressRegion: "Maharashtra",
                    postalCode: "411006",
                    addressCountry: "IN",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+91-98233-83230",
                    email: "yogesh.sahu@puneglobalgroup.in",
                    contactType: "sales",
                    areaServed: "IN",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://puneglobalgroup.in/#website",
                  name: "Pune Global Group",
                  url: "https://puneglobalgroup.in",
                  publisher: { "@id": "https://puneglobalgroup.in/#organization" },
                  inLanguage: "en-IN",
                },
              ],
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
