"use client";

import Image from "next/image";
import Link from "next/link";
import { Produit } from "@/types";
import { formatPrice, getStatutBadge } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  produit: Produit;
  vedette?: boolean;
}

export default function ProductCard({ produit, vedette = false }: ProductCardProps) {
  const statut = getStatutBadge(produit.quantiteDisponible, produit.surCommande);

  const badgeColors = {
    disponible: "bg-lichen text-fond",
    surCommande: "bg-safran text-encre",
    epuise: "bg-encre/10 text-encre/60",
  };

  return (
    <Link
      href={`/produit/${produit.id}`}
      className={cn("group block", vedette && "sm:col-span-2")}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-fond">
        <Image
          src={produit.photos[0] || "/images/placeholder.jpg"}
          alt={`${produit.nom} - ${produit.sousCategorie || produit.categorie} fait main au Québec par MToi Créations`}
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
        <div className="absolute inset-0 bg-encre/0 transition-colors duration-300 group-hover:bg-encre/10" />
      </div>

      <div className="mt-4 space-y-1">
        <h3
          className={cn(
            "font-titre text-encre transition-colors group-hover:text-framboise",
            vedette ? "text-2xl" : "text-lg"
          )}
        >
          {produit.nom}
        </h3>

        {produit.sousCategorie && (
          <p className="text-sm text-encre/70">{produit.sousCategorie}</p>
        )}

        <p className="font-titre text-xl font-medium text-framboise">
          {formatPrice(produit.prix, produit.devise)}
        </p>

        {produit.options.couleurs.length > 1 && (
          <p className="text-sm text-encre/50">
            {produit.options.couleurs.length} couleurs disponibles
          </p>
        )}
      </div>
    </Link>
  );
}
