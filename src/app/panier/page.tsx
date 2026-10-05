"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { enCents, fraisLivraisonCents, SEUIL_LIVRAISON_GRATUITE } from "@/lib/tarifs";
import CartItemComponent from "@/components/CartItem";
import Button from "@/components/Button";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";

export default function PanierPage() {
  const { items, clearCart, getTotal } = useCartStore();

  const sousTotal = getTotal();
  const fraisLivraison = fraisLivraisonCents(enCents(sousTotal)) / 100;
  const total = sousTotal + fraisLivraison;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-fond py-14 font-corps md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="max-w-[65ch]">
            <ShoppingBag className="mb-6 h-12 w-12 text-encre/65" />
            <h1 className="mb-4 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
              Ton panier est vide
            </h1>
            <p className="mb-10 text-[17px] leading-[1.65] text-encre/80">
              Découvre nos créations artisanales et trouve la pièce parfaite pour toi.
            </p>
            <Link href="/boutique">
              <Button size="lg">Découvrir la boutique</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fond py-14 font-corps md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <h1 className="mb-10 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
          Ton panier
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-x-16">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="border border-encre/10 bg-surface p-6">
              {/* En-tête desktop */}
              <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-6 border-b border-encre/10 pb-4 font-titre text-sm text-encre/70 md:grid">
                <span>Produit</span>
                <span className="w-32 text-center">Quantité</span>
                <span className="w-28 text-right">Total</span>
                <span className="w-10"></span>
              </div>

              {/* Articles */}
              {items.map((item, index) => (
                <CartItemComponent
                  key={`${item.produit.id}-${item.varianteSelectionnee?.id || ''}-${item.couleurSelectionnee}-${item.tailleSelectionnee}-${index}`}
                  item={item}
                  index={index}
                />
              ))}

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6">
                <Link
                  href="/boutique"
                  className="inline-flex items-center text-encre/70 transition-colors hover:text-framboise"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continuer les achats
                </Link>

                <button
                  onClick={clearCart}
                  className="inline-flex items-center text-encre/70 transition-colors hover:text-framboise"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Vider le panier
                </button>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="border border-encre/10 bg-surface p-6 lg:sticky lg:top-24">
              <h2 className="mb-6 font-titre text-xl text-encre">Récapitulatif</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-encre/70">Sous-total</span>
                  <span className="font-medium text-encre">{formatPrice(sousTotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-encre/70">Livraison</span>
                  <span className="font-medium text-encre">
                    {fraisLivraison === 0 ? (
                      <span className="text-lichen">Gratuite</span>
                    ) : (
                      formatPrice(fraisLivraison)
                    )}
                  </span>
                </div>

                {fraisLivraison > 0 && (
                  <p className="pt-2 text-xs text-encre/65">
                    Plus que {formatPrice(SEUIL_LIVRAISON_GRATUITE - sousTotal)} pour la livraison gratuite !
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-encre/10 pt-4">
                  <span className="font-titre text-lg text-encre">Total</span>
                  <span className="font-titre text-2xl font-semibold text-framboise">
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="pt-2 text-center text-xs text-encre/65">
                  Taxes non applicables — petit fournisseur
                </p>
              </div>

              <div className="mt-6">
                <Link href="/commande">
                  <Button fullWidth size="lg">
                    Passer la commande
                  </Button>
                </Link>
              </div>

              <div className="mt-4 text-center text-xs text-encre/65">
                Paiement sécurisé par carte, via Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
