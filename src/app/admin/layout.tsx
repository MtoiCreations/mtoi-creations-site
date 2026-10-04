import AdminShell from "@/components/AdminShell";

// Gabarit propre aux pages admin. L'en-tête et le pied de page publics sont masqués
// sur ces routes par PublicChrome (src/app/layout.tsx).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
