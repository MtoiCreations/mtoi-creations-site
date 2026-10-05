"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import QuantitySelector from "./QuantitySelector";

interface CartItemProps {
  item: CartItemType;
  index: number;
}

export default function CartItem({ item, index }: CartItemProps) {
  const { updateQuantite, removeItem } = useCartStore();
  const { produit, quantite, couleurSelectionnee, tailleSelectionnee, varianteSelectionnee, accessoiresSelectionnes } = item;

  const maxQuantite = produit.surCommande ? 99 : produit.quantiteDisponible;

  // Photo à afficher (variante ou photo par défaut)
  const photoUrl = varianteSelectionnee?.photo || produit.photos[0] || "/images/placeholder.jpg";

  const handleQuantiteChange = (newQuantite: number) => {
    updateQuantite(index, newQuantite);
  };

  const handleRemove = () => {
    removeItem(index);
  };

  return (
    <div className="flex gap-4 border-b border-encre/10 py-6">
      {/* Image : cadrage 4:5, bord net */}
      <Link
        href={`/produit/${produit.id}`}
        className="relative aspect-[4/5] w-24 flex-shrink-0 overflow-hidden bg-surface"
      >
        <Image
          src={photoUrl}
          alt={produit.nom}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Détails */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/produit/${produit.id}`}
          className="line-clamp-1 font-titre text-lg text-encre transition-colors hover:text-framboise"
        >
          {produit.nom}
        </Link>

        <div className="mt-2 space-y-2 text-sm text-encre/70">
          {/* Nouvelle variante */}
          {varianteSelectionnee && <p>Couleur/Motif: {varianteSelectionnee.nom}</p>}

          {/* Anciennes options (rétrocompatibilité) */}
          {!varianteSelectionnee && couleurSelectionnee && <p>Couleur: {couleurSelectionnee}</p>}
          {tailleSelectionnee && <p>Taille: {tailleSelectionnee}</p>}

          {/* Accessoires sélectionnés */}
          {accessoiresSelectionnes && accessoiresSelectionnes.length > 0 && (
            <div className="mt-2 space-y-2 border-t border-encre/10 pt-2">
              {accessoiresSelectionnes.map(({ accessoire, variante }) => (
                <p key={accessoire.id} className="flex items-center gap-2">
                  <span className="text-encre/65">{accessoire.nom}:</span>
                  <span>{variante.nom}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="mt-2 font-titre text-lg text-framboise">
          {formatPrice(produit.prix, produit.devise)}
        </p>

        {/* Actions mobiles */}
        <div className="mt-4 flex items-center justify-between md:hidden">
          <QuantitySelector
            value={quantite}
            onChange={handleQuantiteChange}
            max={maxQuantite}
          />
          <button
            onClick={handleRemove}
            className="p-2 text-encre/70 transition-colors hover:text-framboise"
            aria-label="Retirer du panier"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Actions desktop */}
      <div className="hidden items-center gap-6 md:flex">
        <QuantitySelector
          value={quantite}
          onChange={handleQuantiteChange}
          max={maxQuantite}
        />

        <p className="w-28 text-right font-titre text-lg text-encre">
          {formatPrice(produit.prix * quantite, produit.devise)}
        </p>

        <button
          onClick={handleRemove}
          className="p-2 text-encre/70 transition-colors hover:text-framboise"
          aria-label="Retirer du panier"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
