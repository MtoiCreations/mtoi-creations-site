import { Metadata } from "next";
import produits from "@/data/produits.json";
import { Produit } from "@/types";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/categories";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Découvrez toutes nos créations artisanales : pochettes, accessoires d'hygiène féminine et soins personnalisés.",
};

interface PageProps {
  searchParams: Promise<{ recherche?: string; categorie?: string }>;
}

export default async function BoutiquePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const produitsTyped = produits as Produit[];

  let produitsFiltres = produitsTyped;

  if (params.recherche) {
    const recherche = params.recherche.toLowerCase();
    produitsFiltres = produitsFiltres.filter(
      (p) =>
        p.nom.toLowerCase().includes(recherche) ||
        p.description.toLowerCase().includes(recherche) ||
        p.etiquettes.some((tag) => tag.toLowerCase().includes(recherche))
    );
  }

  if (params.categorie) {
    produitsFiltres = produitsFiltres.filter(
      (p) => p.categorie.toLowerCase().includes(params.categorie!.toLowerCase())
    );
  }

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="heading-1 text-primary mb-4">Notre boutique</h1>
          <p className="body-large max-w-2xl mx-auto">
            Explorez nos créations artisanales, faites avec soin et passion.
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/boutique"
            className={`px-4 py-2 rounded-button font-display transition-all ${
              !params.categorie
                ? "bg-secondary text-white"
                : "bg-white text-primary hover:bg-cream border border-cream-dark"
            }`}
          >
            Tous
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique/${cat.slug}`}
              className="px-4 py-2 rounded-button font-display bg-white text-primary hover:bg-cream border border-cream-dark transition-all"
            >
              {cat.nom}
            </Link>
          ))}
        </div>

        {/* Résultats de recherche */}
        {params.recherche && (
          <div className="mb-8 p-4 bg-white rounded-card">
            <p className="text-text-secondary">
              Résultats pour &ldquo;<span className="font-medium text-primary">{params.recherche}</span>&rdquo;
              <span className="ml-2">({produitsFiltres.length} produit{produitsFiltres.length > 1 ? "s" : ""})</span>
            </p>
          </div>
        )}

        {/* Grille de produits */}
        {produitsFiltres.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {produitsFiltres.map((produit) => (
              <ProductCard key={produit.id} produit={produit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-secondary text-lg mb-4">
              Aucun produit trouvé.
            </p>
            <Link
              href="/boutique"
              className="text-secondary hover:text-secondary-dark font-display"
            >
              Voir tous les produits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
