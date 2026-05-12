import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Josefin_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable} ${josefin.variable}`}>
      <body className="font-sans bg-cream-light text-primary antialiased">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
