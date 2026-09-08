import Link from "next/link";
import { categories } from "@/data/categories";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <p className="font-titre text-4xl text-white leading-none mb-4">
              MToi Créations
            </p>
            <p className="text-cream/80 max-w-md">
              Essentiels lavables fabriqués à la main à Granby.
            </p>
            <p className="text-accent mt-4 font-display text-lg">
              Fabriqué à Granby • Lavable et réutilisable • Sur mesure possible
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-serif text-xl mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/boutique"
                  className="text-cream/80 hover:text-accent transition-colors"
                >
                  Boutique
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/boutique/${cat.slug}`}
                    className="text-cream/80 hover:text-accent transition-colors"
                  >
                    {cat.nom}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="text-cream/80 hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-xl mb-4">Contact</h3>
            <ul className="space-y-2 text-cream/80">
              <li>
                <a
                  href="mailto:mtoicreations@hotmail.com"
                  className="hover:text-accent transition-colors"
                >
                  mtoicreations@hotmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/849299194923840"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-10 text-center text-cream/60 text-sm">
          <p>
            © {new Date().getFullYear()} MToi Créations. Tous droits réservés.
          </p>
          <p className="mt-2">
            Fait avec amour au Québec
          </p>
        </div>
      </div>
    </footer>
  );
}
