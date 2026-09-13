import { Metadata } from "next";
import { getProduits } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/categories";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Découvrez toutes nos créations artisanales : pochettes, accessoires d'hygiène féminine et soins personnalisés.",
};

export const revalidate = 60; // Recharger les produits toutes les 60 secondes

interface PageProps {
  searchParams: Promise<{ recherche?: string; categorie?: string }>;
}

export default async function BoutiquePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const produitsTyped = await getProduits();

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
    <div className="min-h-screen bg-fond py-14 md:py-24">
      <div className="container-custom">
        {/* En-tête */}
        <div className="mb-10 max-w-[65ch] md:mb-16">
          <h1 className="mb-4 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
            Notre boutique
          </h1>
          <p className="font-corps text-[17px] leading-[1.65] text-encre/80">
            Explorez nos créations artisanales, faites avec soin et passion.
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-10 flex flex-wrap gap-4 md:mb-16">
          <Link
            href="/boutique"
            className={`rounded-[4px] px-4 py-2 font-titre text-sm transition-colors ${
              !params.categorie
                ? "bg-safran text-encre"
                : "border border-lichen/30 bg-lichen/10 text-lichen hover:bg-lichen/20"
            }`}
          >
            Tous
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique/${cat.slug}`}
              className="rounded-[4px] border border-lichen/30 bg-lichen/10 px-4 py-2 font-titre text-sm text-lichen transition-colors hover:bg-lichen/20"
            >
              {cat.nom}
            </Link>
          ))}
        </div>

        {/* Résultats de recherche */}
        {params.recherche && (
          <p className="mb-8 font-corps text-[17px] text-encre/80">
            Résultats pour «{" "}
            <span className="font-medium text-encre">{params.recherche}</span>{" "}
            » ({produitsFiltres.length} produit{produitsFiltres.length > 1 ? "s" : ""})
          </p>
        )}

        {/* Grille de produits */}
        {produitsFiltres.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {produitsFiltres.map((produit, index) => (
              <ProductCard key={produit.id} produit={produit} vedette={index === 0} />
            ))}
          </div>
        ) : (
          <div className="py-16">
            <p className="mb-4 font-corps text-[17px] text-encre/80">
              Aucun produit trouvé.
            </p>
            <Link
              href="/boutique"
              className="font-titre font-medium text-framboise underline underline-offset-4 hover:text-framboise/80"
            >
              Voir tous les produits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
