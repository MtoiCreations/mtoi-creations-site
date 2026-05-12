import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import produits from "@/data/produits.json";
import { Produit } from "@/types";
import ProductCard from "@/components/ProductCard";
import { categories, getCategorieBySlug } from "@/data/categories";

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

  const produitsTyped = produits as Produit[];
  const produitsFiltres = produitsTyped.filter(
    (p) => p.categorie.toLowerCase() === categorie.nom.toLowerCase()
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
            <li className="text-primary font-medium">{categorie.nom}</li>
          </ol>
        </nav>

        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="heading-1 text-primary mb-4">{categorie.nom}</h1>
          {categorie.description && (
            <p className="body-large max-w-2xl mx-auto">{categorie.description}</p>
          )}
        </div>

        {/* Sous-catégories */}
        {categorie.sousCategories && categorie.sousCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link
              href={`/boutique/${categorie.slug}`}
              className="px-4 py-2 rounded-button font-display bg-secondary text-white"
            >
              Tous
            </Link>
            {categorie.sousCategories.map((sousCat) => (
              <Link
                key={sousCat.id}
                href={`/boutique/${categorie.slug}/${sousCat.slug}`}
                className="px-4 py-2 rounded-button font-display bg-white text-primary hover:bg-cream border border-cream-dark transition-all"
              >
                {sousCat.nom}
              </Link>
            ))}
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
              Aucun produit dans cette catégorie pour le moment.
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
