import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduits } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { categories, getCategorieBySlug } from "@/data/categories";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ categorie: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorie: categorieSlug } = await params;
  const categorie = getCategorieBySlug(categorieSlug);

  if (!categorie) {
    return { title: "Catégorie non trouvée" };
  }

  return {
    title: categorie.nom,
    description: categorie.description || `Découvrez notre collection ${categorie.nom}`,
  };
}

export async function generateStaticParams() {
  return categories.map((cat) => ({
    categorie: cat.slug,
  }));
}

export default async function CategoriePage({ params }: PageProps) {
  const { categorie: categorieSlug } = await params;
  const categorie = getCategorieBySlug(categorieSlug);

  if (!categorie) {
    notFound();
  }

  const produitsTyped = await getProduits();
  const produitsFiltres = produitsTyped.filter(
    (p) => p.categorie.toLowerCase() === categorie.nom.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-fond py-14 md:py-24">
      <div className="container-custom">
        {/* Fil d'Ariane */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-encre/70">
            <li>
              <Link href="/" className="hover:text-framboise transition-colors">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/boutique" className="hover:text-framboise transition-colors">
                Boutique
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-encre">{categorie.nom}</li>
          </ol>
        </nav>

        {/* En-tête */}
        <div className="mb-10 max-w-[65ch] md:mb-16">
          <h1 className="mb-4 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
            {categorie.nom}
          </h1>
          {categorie.description && (
            <p className="font-corps text-[17px] leading-[1.65] text-encre/80">
              {categorie.description}
            </p>
          )}
        </div>

        {/* Sous-catégories */}
        {categorie.sousCategories && categorie.sousCategories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-4 md:mb-16">
            <Link
              href={`/boutique/${categorie.slug}`}
              className="rounded-[4px] bg-safran px-4 py-2 font-titre text-sm text-encre"
            >
              Tous
            </Link>
            {categorie.sousCategories.map((sousCat) => (
              <Link
                key={sousCat.id}
                href={`/boutique/${categorie.slug}/${sousCat.slug}`}
                className="rounded-[4px] border border-lichen/30 bg-lichen/10 px-4 py-2 font-titre text-sm text-lichen transition-colors hover:bg-lichen/20"
              >
                {sousCat.nom}
              </Link>
            ))}
          </div>
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
              Aucun produit dans cette catégorie pour le moment.
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
