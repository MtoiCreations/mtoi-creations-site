import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import produits from "@/data/produits.json";
import { Produit } from "@/types";
import ProductCard from "@/components/ProductCard";
import { categories, getSousCategorieBySlug, getCategorieBySlug } from "@/data/categories";

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

  const produitsTyped = produits as Produit[];
  const produitsFiltres = produitsTyped.filter(
    (p) =>
      p.categorie.toLowerCase() === categorie.nom.toLowerCase() &&
      p.sousCategorie?.toLowerCase() === sousCategorie.nom.toLowerCase()
  );

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        {/* Fil d'Ariane */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-text-secondary">
            <li>
              <Link href="/" className="hover:text-secondary transition-colors">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/boutique" className="hover:text-secondary transition-colors">
                Boutique
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/boutique/${categorie.slug}`}
                className="hover:text-secondary transition-colors"
              >
                {categorie.nom}
              </Link>
            </li>
            <li>/</li>
            <li className="text-primary font-medium">{sousCategorie.nom}</li>
          </ol>
        </nav>

        {/* En-tête */}
        <div className="text-center mb-12">
          <p className="font-display text-secondary tracking-widest uppercase mb-2">
            {categorie.nom}
          </p>
          <h1 className="heading-1 text-primary mb-4">{sousCategorie.nom}</h1>
        </div>

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
              Aucun produit dans cette sous-catégorie pour le moment.
            </p>
            <Link
              href={`/boutique/${categorie.slug}`}
              className="text-secondary hover:text-secondary-dark font-display"
            >
              Voir toute la catégorie {categorie.nom}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
