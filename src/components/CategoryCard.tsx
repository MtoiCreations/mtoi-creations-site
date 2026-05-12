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
      className="group relative block overflow-hidden rounded-image aspect-[4/5]"
    >
      {/* Image de fond */}
      <div className="absolute inset-0 bg-cream">
        {categorie.image ? (
          <Image
            src={categorie.image}
            alt={categorie.nom}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-light to-accent" />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Contenu */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="font-serif text-2xl text-white mb-2">{categorie.nom}</h3>
        {categorie.description && (
          <p className="text-white/80 text-sm line-clamp-2">
            {categorie.description}
          </p>
        )}
        <span className="mt-3 text-accent font-display text-sm group-hover:translate-x-2 transition-transform">
          Découvrir →
        </span>
      </div>
    </Link>
  );
}
