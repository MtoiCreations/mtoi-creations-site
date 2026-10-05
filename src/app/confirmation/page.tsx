"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, Package } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useCartStore } from "@/lib/store";

// Lien d'action : mêmes styles que Button (aplat safran, texte encre, rayon de 4 px)
const lienPrincipal =
  "inline-flex items-center justify-center rounded-[4px] bg-safran font-titre font-medium text-encre transition-colors duration-200 hover:bg-safran/90 focus:outline-none focus:ring-2 focus:ring-framboise focus:ring-offset-2";

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
      <div className="min-h-screen bg-fond py-14 font-corps md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="max-w-[65ch]">
            <h1 className="mb-4 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
              Page non trouvée
            </h1>
            <p className="mb-10 text-[17px] leading-[1.65] text-encre/80">
              Cette page de confirmation n&apos;est pas valide.
            </p>
            <Link href="/boutique" className={`${lienPrincipal} px-6 py-3 text-base`}>
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fond py-14 font-corps md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="max-w-2xl">
          {/* Succès */}
          <div className="mb-10">
            <CheckCircle className="mb-6 h-16 w-16 text-lichen" />
            <h1 className="mb-4 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
              Merci pour ta commande !
            </h1>
            <p className="text-[17px] leading-[1.65] text-encre/80">
              Ton paiement a été accepté.
            </p>
          </div>

          {/* Confirmation */}
          <div className="mb-10 border border-encre/10 bg-surface p-6">
            <h2 className="mb-6 font-titre text-xl text-encre">
              Ta commande est confirmée
            </h2>

            <div className="space-y-6">
              {/* Prochaines étapes */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-lichen/10 text-lichen">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-titre text-encre">Paiement reçu</p>
                  <p className="text-sm text-encre/70">
                    Ton paiement a été traité avec succès.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-framboise/10 text-framboise">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-titre text-encre">Préparation de ta commande</p>
                  <p className="text-sm text-encre/70">
                    Nous allons préparer tes articles avec soin.
                    Chaque pièce est faite à la main avec amour.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-encre/10 text-encre/70">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-titre text-encre">Suivi par email</p>
                  <p className="text-sm text-encre/70">
                    Tu recevras un email lorsque ta commande sera expédiée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email envoyé */}
          <div className="mb-10 flex items-start gap-4 border border-lichen/30 bg-lichen/10 p-6">
            <Mail className="mt-0.5 h-6 w-6 flex-shrink-0 text-lichen" />
            <div>
              <p className="font-titre text-encre">
                Un email de confirmation t&apos;a été envoyé
              </p>
              <p className="mt-2 text-sm text-encre/70">
                Tu y trouveras le récapitulatif de ta commande et les informations de suivi.
              </p>
            </div>
          </div>

          {/* Actions */}
          <Link href="/boutique" className={`${lienPrincipal} px-8 py-4 text-lg`}>
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
      <div className="flex min-h-screen items-center justify-center bg-fond py-14 font-corps md:py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-framboise border-t-transparent"></div>
          <p className="text-encre/70">Chargement...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
