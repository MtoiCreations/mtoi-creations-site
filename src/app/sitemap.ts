import { MetadataRoute } from "next";
import { getProduits } from "@/lib/supabase";
import { categories } from "@/data/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mtoicreations.ca";
  const produits = await getProduits();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/boutique`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const pages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/boutique/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];

    if (cat.sousCategories) {
      cat.sousCategories.forEach((sousCat) => {
        pages.push({
          url: `${baseUrl}/boutique/${cat.slug}/${sousCat.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    }

    return pages;
  });

  const productPages: MetadataRoute.Sitemap = produits.map((produit) => ({
    url: `${baseUrl}/produit/${produit.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
