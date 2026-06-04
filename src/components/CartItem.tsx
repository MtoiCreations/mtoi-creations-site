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
    <div className="flex gap-4 py-6 border-b border-cream-dark">
      {/* Image */}
      <Link
        href={`/produit/${produit.id}`}
        className="relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden"
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
      <div className="flex-1 min-w-0">
        <Link
          href={`/produit/${produit.id}`}
          className="font-serif text-lg text-primary hover:text-secondary transition-colors line-clamp-1"
        >
          {produit.nom}
        </Link>

        <div className="mt-1 space-y-1 text-sm text-text-secondary">
          {/* Nouvelle variante */}
          {varianteSelectionnee && <p>Couleur/Motif: {varianteSelectionnee.nom}</p>}

          {/* Anciennes options (rétrocompatibilité) */}
          {!varianteSelectionnee && couleurSelectionnee && <p>Couleur: {couleurSelectionnee}</p>}
          {tailleSelectionnee && <p>Taille: {tailleSelectionnee}</p>}

          {/* Accessoires sélectionnés */}
          {accessoiresSelectionnes && accessoiresSelectionnes.length > 0 && (
            <div className="mt-2 pt-2 border-t border-cream">
              {accessoiresSelectionnes.map(({ accessoire, variante }) => (
                <p key={accessoire.id} className="flex items-center gap-2">
                  <span className="text-text-light">{accessoire.nom}:</span>
                  <span>{variante.nom}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="mt-2 font-display text-lg text-secondary">
          {formatPrice(produit.prix, produit.devise)}
        </p>

        {/* Actions mobiles */}
        <div className="mt-3 flex items-center justify-between md:hidden">
          <QuantitySelector
            value={quantite}
            onChange={handleQuantiteChange}
            max={maxQuantite}
          />
          <button
            onClick={handleRemove}
            className="p-2 text-text-secondary hover:text-red-500 transition-colors"
            aria-label="Retirer du panier"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Actions desktop */}
      <div className="hidden md:flex items-center gap-6">
        <QuantitySelector
          value={quantite}
          onChange={handleQuantiteChange}
          max={maxQuantite}
        />

        <p className="w-28 text-right font-display text-lg text-primary">
          {formatPrice(produit.prix * quantite, produit.devise)}
        </p>

        <button
          onClick={handleRemove}
          className="p-2 text-text-secondary hover:text-red-500 transition-colors"
          aria-label="Retirer du panier"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
