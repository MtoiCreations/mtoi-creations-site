"use client";

import { usePathname } from "next/navigation";

// Enveloppe l'en-tête et le pied de page publics : ils ne s'affichent pas sur les
// pages admin, qui ont leur propre gabarit (src/app/admin/layout.tsx).
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
