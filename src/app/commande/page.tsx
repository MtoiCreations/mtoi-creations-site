"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import type { ChangementPanier } from "@/types";
import { formatPrice } from "@/lib/utils";
import { enCents, fraisLivraisonCents } from "@/lib/tarifs";
import Button from "@/components/Button";
import { ArrowLeft, Loader2, CreditCard, Lock } from "lucide-react";

export default function CommandePage() {
  const router = useRouter();
  const { items, getTotal, appliquerChangements } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [messagesPanier, setMessagesPanier] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresseLigne1: "",
    adresseLigne2: "",
    ville: "",
    province: "QC",
    codePostal: "",
    note: "",
  });

  // Champs : fond surface, bordure encre à 25 %, état actif framboise. Le fond bleuté
  // de l'autoremplissage du navigateur est neutralisé.
  const champ =
    "w-full rounded-[4px] border bg-surface px-4 py-3 text-encre placeholder:text-encre/50 focus:border-framboise focus:outline-none focus:ring-1 focus:ring-framboise [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_theme(colors.surface)] [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.encre)]";
  const bordureChamp = (erreur?: string) => (erreur ? "border-erreur" : "border-encre/25");

  const sousTotal = getTotal();
  const fraisLivraison = fraisLivraisonCents(enCents(sousTotal)) / 100;
  const total = sousTotal + fraisLivraison;

  const provinces = [
    { code: "QC", nom: "Québec" },
    { code: "ON", nom: "Ontario" },
    { code: "AB", nom: "Alberta" },
    { code: "BC", nom: "Colombie-Britannique" },
    { code: "MB", nom: "Manitoba" },
    { code: "NB", nom: "Nouveau-Brunswick" },
    { code: "NL", nom: "Terre-Neuve-et-Labrador" },
    { code: "NS", nom: "Nouvelle-Écosse" },
    { code: "NT", nom: "Territoires du Nord-Ouest" },
    { code: "NU", nom: "Nunavut" },
    { code: "PE", nom: "Île-du-Prince-Édouard" },
    { code: "SK", nom: "Saskatchewan" },
    { code: "YT", nom: "Yukon" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }
    if (!formData.adresseLigne1.trim()) newErrors.adresseLigne1 = "L'adresse est requise";
    if (!formData.ville.trim()) newErrors.ville = "La ville est requise";
    if (!formData.codePostal.trim()) {
      newErrors.codePostal = "Le code postal est requis";
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.codePostal)) {
      newErrors.codePostal = "Le code postal n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Identifiants et choix seulement : le serveur recalcule prix et livraison.
          // prixAffiche et totalAffiche servent à détecter un changement de prix.
          items: items.map((item) => ({
            produitId: item.produit.id,
            quantite: item.quantite,
            couleur: item.couleurSelectionnee,
            taille: item.tailleSelectionnee,
            varianteId: item.varianteSelectionnee?.id,
            accessoires: (item.accessoiresSelectionnes || []).map((a) => ({
              accessoireId: a.accessoire.id,
              varianteId: a.variante.id,
            })),
            prixAffiche: item.produit.prix,
          })),
          totalAffiche: total,
          clientInfo: {
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
            telephone: formData.telephone,
            adresse: `${formData.adresseLigne1}${formData.adresseLigne2 ? ', ' + formData.adresseLigne2 : ''}`,
            ville: formData.ville,
            codePostal: formData.codePostal.toUpperCase(),
            province: formData.province,
          },
          note: formData.note,
        }),
      });

      // Le panier ne correspond plus au catalogue : rien n'a été facturé, la cliente confirme.
      if (response.status === 409) {
        const data: { changements?: ChangementPanier[] } = await response.json();
        const changements = data.changements || [];
        appliquerChangements(changements);
        const messages = changements.map((c) => c.message);
        if (useCartStore.getState().items.length === 0) {
          // La page redirige vers le panier vide : le message passe par une alerte.
          alert(messages.join("\n"));
        } else {
          setMessagesPanier(messages);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création du paiement");
      }

      const { url } = await response.json();

      if (url && typeof window !== "undefined") {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue. Réessaie dans un instant.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && items.length === 0) {
      router.push("/panier");
    }
  }, [isClient, items.length, router]);

  if (!isClient || items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fond py-14 font-corps md:py-24">
        <Loader2 className="h-8 w-8 animate-spin text-framboise" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fond py-14 font-corps md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <Link
          href="/panier"
          className="mb-10 inline-flex items-center text-encre/70 transition-colors hover:text-framboise"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Link>

        <h1 className="mb-10 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">Finaliser la commande</h1>

        {messagesPanier.length > 0 && (
          <div role="alert" className="mb-10 border border-safran/30 bg-safran/10 p-4 text-encre">
            <p className="font-medium text-encre">Ton panier a été mis à jour. Vérifie-le, puis confirme ta commande.</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {messagesPanier.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-x-16">
            {/* Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de contact */}
              <div className="border border-encre/10 bg-surface p-6">
                <h2 className="mb-6 font-titre text-xl text-encre">Informations de contact</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`${champ} ${bordureChamp(errors.prenom)}`}
                    />
                    {errors.prenom && <p className="mt-2 text-sm text-erreur">{errors.prenom}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`${champ} ${bordureChamp(errors.nom)}`}
                    />
                    {errors.nom && <p className="mt-2 text-sm text-erreur">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${champ} ${bordureChamp(errors.email)}`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-erreur">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className={`${champ} border-encre/25`}
                    />
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="border border-encre/10 bg-surface p-6">
                <h2 className="mb-6 font-titre text-xl text-encre">Adresse de livraison</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="adresseLigne1"
                      value={formData.adresseLigne1}
                      onChange={handleChange}
                      placeholder="Numéro et rue"
                      className={`${champ} ${bordureChamp(errors.adresseLigne1)}`}
                    />
                    {errors.adresseLigne1 && (
                      <p className="mt-2 text-sm text-erreur">{errors.adresseLigne1}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Appartement, suite, etc.
                    </label>
                    <input
                      type="text"
                      name="adresseLigne2"
                      value={formData.adresseLigne2}
                      onChange={handleChange}
                      className={`${champ} border-encre/25`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      className={`${champ} ${bordureChamp(errors.ville)}`}
                    />
                    {errors.ville && <p className="mt-2 text-sm text-erreur">{errors.ville}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Province *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`${champ} border-encre/25`}
                    >
                      {provinces.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-titre text-sm text-encre">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleChange}
                      placeholder="A1A 1A1"
                      className={`${champ} ${bordureChamp(errors.codePostal)}`}
                    />
                    {errors.codePostal && (
                      <p className="mt-2 text-sm text-erreur">{errors.codePostal}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="border border-encre/10 bg-surface p-6">
                <h2 className="mb-6 font-titre text-xl text-encre">Note (optionnel)</h2>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Instructions spéciales, personnalisation, etc."
                  className={`${champ} border-encre/25 resize-none`}
                />
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="border border-encre/10 bg-surface p-6 lg:sticky lg:top-24">
                <h2 className="mb-6 font-titre text-xl text-encre">Ta commande</h2>

                {/* Articles */}
                <div className="mb-6 space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-encre/70">
                        {item.produit.nom} × {item.quantite}
                      </span>
                      <span className="font-medium text-encre">
                        {formatPrice(item.produit.prix * item.quantite)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-encre/10 text-sm">
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

                  <div className="pt-4 border-t border-encre/10 flex justify-between items-center">
                    <span className="font-titre text-lg text-encre">Total</span>
                    <span className="font-titre text-2xl font-semibold text-framboise">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <p className="text-xs text-encre/65 text-center pt-2">
                    Taxes non applicables — petit fournisseur
                  </p>
                </div>

                <div className="mt-6">
                  <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Redirection vers le paiement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payer {formatPrice(total)}
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-encre/65">
                  <Lock className="h-3 w-3" />
                  <span>Paiement sécurisé par Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
