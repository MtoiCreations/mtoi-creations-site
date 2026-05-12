"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import Button from "@/components/Button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CommandePage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
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

  const sousTotal = getTotal();
  const fraisLivraison = sousTotal >= 75 ? 0 : 10;
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
      const numeroCommande = generateOrderNumber();

      const commande = {
        numeroCommande,
        client: {
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          adresse: {
            ligne1: formData.adresseLigne1,
            ligne2: formData.adresseLigne2,
            ville: formData.ville,
            province: formData.province,
            codePostal: formData.codePostal.toUpperCase(),
          },
        },
        articles: items,
        sousTotal,
        fraisLivraison,
        total,
        note: formData.note,
      };

      const response = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commande),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la commande");
      }

      const data = await response.json();

      clearCart();
      router.push(`/confirmation?commande=${data.numeroCommande}`);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/panier");
    return null;
  }

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        <Link
          href="/panier"
          className="inline-flex items-center text-text-secondary hover:text-secondary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Link>

        <h1 className="heading-2 text-primary mb-8">Finaliser la commande</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de contact */}
              <div className="bg-white rounded-card p-6 shadow-soft">
                <h2 className="font-serif text-xl text-primary mb-6">Informations de contact</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.nom ? "border-red-500" : "border-cream-dark"
                      }`}
                    />
                    {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.email ? "border-red-500" : "border-cream-dark"
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-cream-dark rounded-button focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="bg-white rounded-card p-6 shadow-soft">
                <h2 className="font-serif text-xl text-primary mb-6">Adresse de livraison</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="adresseLigne1"
                      value={formData.adresseLigne1}
                      onChange={handleChange}
                      placeholder="Numéro et rue"
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.adresseLigne1 ? "border-red-500" : "border-cream-dark"
                      }`}
                    />
                    {errors.adresseLigne1 && (
                      <p className="mt-1 text-sm text-red-500">{errors.adresseLigne1}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary mb-1">
                      Appartement, suite, etc.
                    </label>
                    <input
                      type="text"
                      name="adresseLigne2"
                      value={formData.adresseLigne2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-cream-dark rounded-button focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.ville ? "border-red-500" : "border-cream-dark"
                      }`}
                    />
                    {errors.ville && <p className="mt-1 text-sm text-red-500">{errors.ville}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Province *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-cream-dark rounded-button focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
                    >
                      {provinces.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleChange}
                      placeholder="A1A 1A1"
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary ${
                        errors.codePostal ? "border-red-500" : "border-cream-dark"
                      }`}
                    />
                    {errors.codePostal && (
                      <p className="mt-1 text-sm text-red-500">{errors.codePostal}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-white rounded-card p-6 shadow-soft">
                <h2 className="font-serif text-xl text-primary mb-6">Note (optionnel)</h2>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Instructions spéciales, personnalisation, etc."
                  className="w-full px-4 py-3 border border-cream-dark rounded-button focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-card p-6 shadow-soft sticky top-24">
                <h2 className="font-serif text-xl text-primary mb-6">Votre commande</h2>

                {/* Articles */}
                <div className="space-y-3 mb-6">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {item.produit.nom} × {item.quantite}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.produit.prix * item.quantite)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-cream-dark text-sm">
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

                  <div className="pt-4 border-t border-cream-dark flex justify-between items-center">
                    <span className="font-display text-lg text-primary">Total</span>
                    <span className="font-display text-2xl text-secondary font-semibold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      "Confirmer la commande"
                    )}
                  </Button>
                </div>

                <p className="mt-4 text-center text-xs text-text-light">
                  En confirmant, vous acceptez de payer par Virement Interac.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
