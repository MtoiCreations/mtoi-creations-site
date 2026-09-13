import Image from "next/image";
import Link from "next/link";
import { Categorie } from "@/types";

interface CategoryCardProps {
  categorie: Categorie;
}

export default function CategoryCard({ categorie }: CategoryCardProps) {
  return (
    <Link
      href={`/boutique/${categorie.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden"
    >
      {/* Image de fond */}
      <div className="absolute inset-0 bg-fond">
        {categorie.image ? (
          <Image
            src={categorie.image}
            alt={categorie.nom}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full w-full bg-lichen" />
        )}
      </div>

      {/* Overlay pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-encre/70 via-encre/20 to-transparent" />

      {/* Contenu */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="mb-2 font-titre text-2xl text-fond">{categorie.nom}</h3>
        {categorie.description && (
          <p className="line-clamp-2 text-sm text-fond/80">
            {categorie.description}
          </p>
        )}
        <span className="mt-3 font-titre text-sm text-safran">Découvrir</span>
      </div>
    </Link>
  );
}
