import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import GlobalNav from "@/components/GlobalNav";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pune Global Group",
  description: "Industrial packaging solutions manufactured to export standards. Trusted across India.",
  keywords: "Pune Global Group, industrial packaging, corrugated boxes, FBB cartons, Pune",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Pune Global Group",
    description: "Industrial packaging solutions manufactured to export standards.",
    url: "https://puneglobalgroup.in",
    siteName: "Pune Global Group",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
