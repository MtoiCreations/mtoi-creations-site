import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Josefin_Sans, Alex_Brush } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoIntroOverlay from "@/components/LogoIntroOverlay";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mtoicreations.ca"),
  title: {
    default: "MToi Créations | Créations artisanales",
    template: "%s | MToi Créations",
  },
  description:
    "Créations artisanales faites avec soin et passion. Pochettes, accessoires d'hygiène féminine et soins personnalisés. Fait main au Québec.",
  keywords: [
    "créations artisanales",
    "couture",
    "fait main",
    "Québec",
    "pochette menstruelle",
    "hygiène féminine",
    "sac magique",
  ],
  authors: [{ name: "MToi Créations" }],
  creator: "MToi Créations",
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "https://mtoicreations.ca",
    siteName: "MToi Créations",
    title: "MToi Créations | Créations artisanales",
    description:
      "Créations artisanales faites avec soin et passion. Fait main au Québec.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MToi Créations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MToi Créations | Créations artisanales",
    description:
      "Créations artisanales faites avec soin et passion. Fait main au Québec.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MToi Créations",
  url: "https://mtoicreations.ca",
  logo: "https://mtoicreations.ca/images/logo.png",
  description: "Créations artisanales faites avec soin et passion. Pochettes, accessoires d'hygiène féminine et soins personnalisés. Fait main au Québec.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CA",
    addressRegion: "QC",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "mtoicreations@hotmail.com",
    contactType: "customer service",
    availableLanguage: "French",
  },
  sameAs: [
    "https://www.facebook.com/849299194923840",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable} ${josefin.variable} ${alexBrush.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans bg-cream-light text-primary antialiased">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <LogoIntroOverlay />
      </body>
    </html>
  );
}
