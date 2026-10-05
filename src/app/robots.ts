import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mtoicreations.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // « /admin » (sans barre finale) couvre la page de connexion /admin et tout /admin/*.
        disallow: ["/admin", "/api/", "/panier", "/commande", "/confirmation"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
