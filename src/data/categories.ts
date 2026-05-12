import { Categorie } from "@/types";

export const categories: Categorie[] = [
  {
    id: "hygiene-feminine",
    nom: "Hygiène féminine",
    slug: "hygiene-feminine",
    description: "Des créations pensées pour accompagner les femmes au quotidien avec élégance et praticité.",
    image: "/images/categories/hygiene-feminine.jpg",
    sousCategories: [
      {
        id: "pochette-menstruelle",
        nom: "Pochette menstruelle",
        slug: "pochette-menstruelle",
        categorieParentId: "hygiene-feminine",
      },
    ],
  },
  {
    id: "soins-confort",
    nom: "Soins et Confort",
    slug: "soins-confort",
    description: "Des accessoires artisanaux pour prendre soin de vous et vous offrir un moment de détente.",
    image: "/images/categories/soins-confort.jpg",
    sousCategories: [
      {
        id: "sac-magique",
        nom: "Sac magique",
        slug: "sac-magique",
        categorieParentId: "soins-confort",
      },
    ],
  },
];

export function getCategorieBySlug(slug: string): Categorie | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getSousCategorieBySlug(slug: string): { sousCategorie: NonNullable<Categorie["sousCategories"]>[0]; parent: Categorie } | undefined {
  for (const cat of categories) {
    const sousCat = cat.sousCategories?.find((sc) => sc.slug === slug);
    if (sousCat) {
      return { sousCategorie: sousCat, parent: cat };
    }
  }
  return undefined;
}
