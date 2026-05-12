import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <Image
              src="/images/logo-white.png"
              alt="MToi Créations"
              width={150}
              height={60}
              className="h-12 w-auto mb-4 invert"
            />
            <p className="text-cream/80 max-w-md">
              Créations artisanales faites avec soin et passion. Des pièces
              uniques et durables pour accompagner votre quotidien.
            </p>
            <p className="text-accent mt-4 font-display text-lg">
              Authenticité • Qualité • Simplicité
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
                  href="mailto:contact@mtoicreations.ca"
                  className="hover:text-accent transition-colors"
                >
                  contact@mtoicreations.ca
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/mtoicreations"
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

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-cream/60 text-sm">
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
