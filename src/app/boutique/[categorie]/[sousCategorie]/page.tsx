import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduits } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { categories, getSousCategorieBySlug, getCategorieBySlug } from "@/data/categories";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ categorie: string; sousCategorie: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sousCategorie: sousCatSlug } = await params;
  const result = getSousCategorieBySlug(sousCatSlug);

  if (!result) {
    return { title: "Sous-catégorie non trouvée" };
  }

  return {
    title: `${result.sousCategorie.nom} - ${result.parent.nom}`,
    description: `Découvrez notre collection ${result.sousCategorie.nom}`,
  };
}

export async function generateStaticParams() {
  const params: { categorie: string; sousCategorie: string }[] = [];

  categories.forEach((cat) => {
    cat.sousCategories?.forEach((sousCat) => {
      params.push({
        categorie: cat.slug,
        sousCategorie: sousCat.slug,
      });
    });
  });

  return params;
}

export default async function SousCategoriePage({ params }: PageProps) {
  const { categorie: catSlug, sousCategorie: sousCatSlug } = await params;

  const categorie = getCategorieBySlug(catSlug);
  const result = getSousCategorieBySlug(sousCatSlug);

  if (!categorie || !result || result.parent.id !== categorie.id) {
    notFound();
  }

  const { sousCategorie } = result;

  const produitsTyped = await getProduits();
  const produitsFiltres = produitsTyped.filter(
    (p) =>
      p.categorie.toLowerCase() === categorie.nom.toLowerCase() &&
      p.sousCategorie?.toLowerCase() === sousCategorie.nom.toLowerCase()
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
            <li>
              <Link
                href={`/boutique/${categorie.slug}`}
                className="hover:text-framboise transition-colors"
              >
                {categorie.nom}
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-encre">{sousCategorie.nom}</li>
          </ol>
        </nav>

        {/* En-tête */}
        <div className="mb-10 max-w-[65ch] md:mb-16">
          <p className="mb-2 font-titre text-encre/70">{categorie.nom}</p>
          <h1 className="font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
            {sousCategorie.nom}
          </h1>
        </div>

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
              Aucun produit dans cette sous-catégorie pour le moment.
            </p>
            <Link
              href={`/boutique/${categorie.slug}`}
              className="font-titre font-medium text-framboise underline underline-offset-4 hover:text-framboise/80"
            >
              Voir toute la catégorie {categorie.nom}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
