"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Store } from "lucide-react";
import { ADMIN_AUTH_EVENT, ADMIN_AUTH_KEY } from "@/lib/adminSession";

const sections = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/commandes", label: "Commandes", exact: false },
  { href: "/admin/produits", label: "Produits", exact: false },
];

// Gabarit des pages admin : navigation entre les sections et déconnexion, sans
// l'en-tête ni le pied de page publics. La barre n'apparaît qu'une fois connecté
// (l'écran de connexion de /admin reste seul).
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    const majConnexion = () => {
      try {
        setConnecte(!!sessionStorage.getItem(ADMIN_AUTH_KEY));
      } catch {
        setConnecte(false);
      }
    };
    majConnexion();
    window.addEventListener(ADMIN_AUTH_EVENT, majConnexion);
    return () => window.removeEventListener(ADMIN_AUTH_EVENT, majConnexion);
  }, [pathname]);

  const deconnecter = () => {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // sessionStorage indisponible : le rechargement de /admin redemande de toute façon le mot de passe
    }
    // Rechargement complet : la page /admin repart de l'écran de connexion.
    window.location.href = "/admin";
  };

  const estActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || !!pathname?.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen flex-col bg-fond font-corps">
      {connecte && (
        <nav aria-label="Administration" className="border-b border-encre/10 bg-surface">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-titre text-xl text-encre">Administration</span>
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={estActive(section.href, section.exact) ? "page" : undefined}
                  className={`border-b-2 py-1 transition-colors ${
                    estActive(section.href, section.exact)
                      ? "border-framboise text-framboise"
                      : "border-transparent text-encre/70 hover:text-framboise"
                  }`}
                >
                  {section.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center text-encre/70 transition-colors hover:text-framboise"
              >
                <Store className="mr-2 h-5 w-5" />
                Voir la boutique
              </Link>
              <button
                type="button"
                onClick={deconnecter}
                className="flex items-center text-encre/70 transition-colors hover:text-framboise"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </nav>
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
