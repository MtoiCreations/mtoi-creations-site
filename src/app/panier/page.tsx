"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import CartItemComponent from "@/components/CartItem";
import Button from "@/components/Button";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";

export default function PanierPage() {
  const { items, clearCart, getTotal } = useCartStore();

  const sousTotal = getTotal();
  const fraisLivraison = sousTotal >= 75 ? 0 : 10;
  const total = sousTotal + fraisLivraison;

  if (items.length === 0) {
    return (
      <div className="section-padding bg-cream-light min-h-screen">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-text-light mx-auto mb-6" />
            <h1 className="heading-2 text-primary mb-4">Votre panier est vide</h1>
            <p className="text-text-secondary mb-8">
              Découvrez nos créations artisanales et trouvez la pièce parfaite pour vous.
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
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        <h1 className="heading-2 text-primary mb-8">Votre panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-card p-6 shadow-soft">
              {/* En-tête desktop */}
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-6 pb-4 border-b border-cream-dark text-sm font-display text-text-secondary">
                <span>Produit</span>
                <span className="w-32 text-center">Quantité</span>
                <span className="w-28 text-right">Total</span>
                <span className="w-10"></span>
              </div>

              {/* Articles */}
              {items.map((item, index) => (
                <CartItemComponent
                  key={`${item.produit.id}-${item.couleurSelectionnee}-${item.tailleSelectionnee}-${index}`}
                  item={item}
                />
              ))}

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-cream-dark flex flex-wrap justify-between items-center gap-4">
                <Link
                  href="/boutique"
                  className="inline-flex items-center text-text-secondary hover:text-secondary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continuer les achats
                </Link>

                <button
                  onClick={clearCart}
                  className="inline-flex items-center text-text-secondary hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le panier
                </button>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-card p-6 shadow-soft sticky top-24">
              <h2 className="font-serif text-xl text-primary mb-6">Récapitulatif</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Sous-total</span>
                  <span className="font-medium">{formatPrice(sousTotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Livraison</span>
                  <span className="font-medium">
                    {fraisLivraison === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      formatPrice(fraisLivraison)
                    )}
                  </span>
                </div>

                {sousTotal < 75 && (
                  <p className="text-xs text-text-light pt-2">
                    Plus que {formatPrice(75 - sousTotal)} pour la livraison gratuite !
                  </p>
                )}

                <div className="pt-4 border-t border-cream-dark flex justify-between items-center">
                  <span className="font-display text-lg text-primary">Total</span>
                  <span className="font-display text-2xl text-secondary font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/commande">
                  <Button fullWidth size="lg">
                    Passer la commande
                  </Button>
                </Link>
              </div>

              <div className="mt-4 text-center text-xs text-text-light">
                Paiement sécurisé par Virement Interac
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
