"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import { CheckCircle, Mail, Copy, Check } from "lucide-react";
import { useState, Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const numeroCommande = searchParams.get("commande");
  const [copied, setCopied] = useState(false);

  const interacEmail = process.env.NEXT_PUBLIC_INTERAC_EMAIL || "paiement@mtoicreations.ca";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!numeroCommande) {
    return (
      <div className="section-padding bg-cream-light min-h-screen">
        <div className="container-custom max-w-2xl text-center">
          <h1 className="heading-2 text-primary mb-4">Page non trouvée</h1>
          <p className="text-text-secondary mb-8">
            Cette page de confirmation n&apos;est pas valide.
          </p>
          <Link href="/boutique">
            <Button>Retour à la boutique</Button>
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
          <p className="body-large">
            Votre commande a bien été enregistrée.
          </p>
        </div>

        {/* Instructions de paiement */}
        <div className="bg-white rounded-card p-8 shadow-soft mb-8">
          <h2 className="font-serif text-2xl text-primary mb-6 text-center">
            Instructions de paiement
          </h2>

          <div className="space-y-6">
            {/* Numéro de commande */}
            <div className="bg-cream rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Numéro de commande</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-primary">
                  {numeroCommande}
                </span>
                <button
                  onClick={() => handleCopy(numeroCommande)}
                  className="p-2 text-text-secondary hover:text-secondary transition-colors"
                  title="Copier"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Étapes */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Ouvrez votre application bancaire
                  </p>
                  <p className="text-sm text-text-secondary">
                    Accédez à la section Virement Interac
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Envoyez le montant à l&apos;adresse suivante
                  </p>
                  <div className="mt-2 bg-cream rounded-lg p-3 flex items-center justify-between">
                    <span className="font-mono text-primary">{interacEmail}</span>
                    <button
                      onClick={() => handleCopy(interacEmail)}
                      className="p-1 text-text-secondary hover:text-secondary transition-colors"
                      title="Copier"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Inscrivez votre numéro de commande dans la note
                  </p>
                  <p className="text-sm text-text-secondary">
                    C&apos;est important pour identifier votre paiement !
                  </p>
                </div>
              </div>
            </div>

            {/* Message important */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-amber-800 text-sm">
                <strong>Important :</strong> Votre commande sera confirmée dès réception du virement.
                Vous recevrez un email de confirmation sous 24h.
              </p>
            </div>
          </div>
        </div>

        {/* Email envoyé */}
        <div className="bg-green-50 border border-green-200 rounded-card p-6 flex items-start gap-4 mb-8">
          <Mail className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">
              Un email récapitulatif vous a été envoyé
            </p>
            <p className="text-sm text-green-700 mt-1">
              Vous y trouverez toutes les informations et instructions de paiement.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Link href="/boutique">
            <Button variant="outline" size="lg">
              Continuer les achats
            </Button>
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
