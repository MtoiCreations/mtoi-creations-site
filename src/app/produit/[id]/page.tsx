import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduits } from "@/lib/supabase";
import ProduitClient from "./ProduitClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const produits = await getProduits();
  const produit = produits.find((p) => p.id === id);

  if (!produit) {
    return {
      title: "Produit non trouvé",
    };
  }

  const description = produit.description.slice(0, 160).replace(/\n/g, " ");

  return {
    title: produit.nom,
    description: description,
    openGraph: {
      title: `${produit.nom} | MToi Créations`,
      description: description,
      images: produit.photos[0] ? [{ url: produit.photos[0] }] : [],
      type: "website",
      locale: "fr_CA",
    },
    twitter: {
      card: "summary_large_image",
      title: produit.nom,
      description: description,
      images: produit.photos[0] ? [produit.photos[0]] : [],
    },
  };
}

export async function generateStaticParams() {
  const produits = await getProduits();
  return produits.map((produit) => ({
    id: produit.id,
  }));
}

export const revalidate = 60;

export default async function ProduitPage({ params }: PageProps) {
  const { id } = await params;
  const produits = await getProduits();
  const produit = produits.find((p) => p.id === id);

  if (!produit) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: produit.nom,
            description: produit.description.slice(0, 500),
            image: produit.photos,
            brand: {
              "@type": "Brand",
              name: "MToi Créations",
            },
            offers: {
              "@type": "Offer",
              price: produit.prix,
              priceCurrency: produit.devise,
              availability: produit.quantiteDisponible > 0
                ? "https://schema.org/InStock"
                : produit.surCommande
                ? "https://schema.org/PreOrder"
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "MToi Créations",
              },
            },
            category: produit.categorie,
          }),
        }}
      />
      <ProduitClient produit={produit} />
    </>
  );
}
