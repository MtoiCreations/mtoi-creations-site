import type { Metadata } from "next";
import AdminShell from "@/components/AdminShell";

// Les pages admin ne doivent jamais être indexées (robots.ts en bloque aussi l'exploration).
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

// Gabarit propre aux pages admin. L'en-tête et le pied de page publics sont masqués
// sur ces routes par PublicChrome (src/app/layout.tsx).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
