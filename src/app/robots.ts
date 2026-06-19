import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mtoicreations.ca";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/panier", "/commande", "/confirmation"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
