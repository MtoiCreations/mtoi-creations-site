"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, Package } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useCartStore } from "@/lib/store";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  if (!sessionId) {
    return (
      <div className="section-padding bg-cream-light min-h-screen">
        <div className="container-custom max-w-2xl text-center">
          <h1 className="heading-2 text-primary mb-4">Page non trouvée</h1>
          <p className="text-text-secondary mb-8">
            Cette page de confirmation n&apos;est pas valide.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center font-display font-medium transition-all duration-200 rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary px-6 py-3 text-base"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom max-w-2xl">
        {/* Succès */}
        <div className="text-center mb-12">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="heading-2 text-primary mb-4">Merci pour votre commande !</h1>
          <p className="body-large text-text-secondary">
            Votre paiement a été accepté avec succès.
          </p>
        </div>

        {/* Confirmation */}
        <div className="bg-white rounded-card p-8 shadow-soft mb-8">
          <h2 className="font-serif text-2xl text-primary mb-6 text-center">
            Votre commande est confirmée
          </h2>

          <div className="space-y-6">
            {/* Prochaines étapes */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-primary">Paiement reçu</p>
                  <p className="text-sm text-text-secondary">
                    Votre paiement a été traité avec succès.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-primary">Préparation de votre commande</p>
                  <p className="text-sm text-text-secondary">
                    Nous allons préparer vos articles avec soin.
                    Chaque pièce est faite à la main avec amour.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cream text-text-secondary rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-primary">Suivi par email</p>
                  <p className="text-sm text-text-secondary">
                    Vous recevrez un email lorsque votre commande sera expédiée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email envoyé */}
        <div className="bg-green-50 border border-green-200 rounded-card p-6 flex items-start gap-4 mb-8">
          <Mail className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">
              Un email de confirmation vous a été envoyé
            </p>
            <p className="text-sm text-green-700 mt-1">
              Vous y trouverez le récapitulatif de votre commande et les informations de suivi.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Link
            href="/boutique"
            className="inline-flex items-center justify-center font-display font-medium transition-all duration-200 rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary px-8 py-4 text-lg"
          >
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="section-padding bg-cream-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
