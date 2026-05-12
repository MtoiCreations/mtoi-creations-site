"use client";

import Image from "next/image";
import Link from "next/link";
import { Produit } from "@/types";
import { formatPrice, getStatutBadge } from "@/lib/utils";

interface ProductCardProps {
  produit: Produit;
}

export default function ProductCard({ produit }: ProductCardProps) {
  const statut = getStatutBadge(produit.quantiteDisponible, produit.surCommande);

  const badgeColors = {
    disponible: "bg-green-100 text-green-800",
    surCommande: "bg-amber-100 text-amber-800",
    epuise: "bg-gray-100 text-gray-500",
  };

  return (
    <Link
      href={`/produit/${produit.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-image bg-cream">
        <Image
          src={produit.photos[0] || "/images/placeholder.jpg"}
          alt={produit.nom}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badge statut */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColors[statut.variant]}`}
          >
            {statut.label}
          </span>
        </div>

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-serif text-lg text-primary group-hover:text-secondary transition-colors">
          {produit.nom}
        </h3>

        {produit.sousCategorie && (
          <p className="text-sm text-text-secondary">{produit.sousCategorie}</p>
        )}

        <p className="font-display text-xl text-secondary font-medium">
          {formatPrice(produit.prix, produit.devise)}
        </p>

        {produit.options.couleurs.length > 1 && (
          <p className="text-sm text-text-light">
            {produit.options.couleurs.length} couleurs disponibles
          </p>
        )}
      </div>
    </Link>
  );
}
