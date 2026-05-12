"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { Mail, Loader2, CheckCircle, ExternalLink } from "lucide-react";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });

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
    if (!formData.sujet.trim()) newErrors.sujet = "Le sujet est requis";
    if (!formData.message.trim()) newErrors.message = "Le message est requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      setIsSuccess(true);
      setFormData({ nom: "", email: "", sujet: "", message: "" });
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="section-padding bg-cream-light min-h-screen">
        <div className="container-custom max-w-2xl text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="heading-2 text-primary mb-4">Message envoyé !</h1>
          <p className="body-large mb-8">
            Merci de m&apos;avoir contactée. Je vous répondrai dans les plus brefs délais.
          </p>
          <Button onClick={() => setIsSuccess(false)} variant="outline">
            Envoyer un autre message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="heading-1 text-primary mb-4">Me contacter</h1>
            <p className="body-large max-w-2xl mx-auto">
              Une question, une demande de personnalisation ou simplement envie de discuter ?
              N&apos;hésitez pas à me contacter !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-card p-8 shadow-soft">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">
                        Nom *
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Sujet *
                    </label>
                    <select
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary bg-white ${
                        errors.sujet ? "border-red-500" : "border-cream-dark"
                      }`}
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="question">Question sur un produit</option>
                      <option value="personnalisation">Demande de personnalisation</option>
                      <option value="commande">Question sur ma commande</option>
                      <option value="collaboration">Proposition de collaboration</option>
                      <option value="autre">Autre</option>
                    </select>
                    {errors.sujet && <p className="mt-1 text-sm text-red-500">{errors.sujet}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-button focus:outline-none focus:ring-2 focus:ring-secondary resize-none ${
                        errors.message ? "border-red-500" : "border-cream-dark"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le message"
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Infos de contact */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-card p-8 shadow-soft">
                <h2 className="font-serif text-xl text-primary mb-6">Autres moyens de contact</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary">Email</p>
                      <a
                        href="mailto:mtoicreations@hotmail.com"
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        contact@mtoicreations.ca
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <ExternalLink className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary">Facebook</p>
                      <a
                        href="https://facebook.com/mtoicreations"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-secondary transition-colors"
                      >
                        @mtoicreations
                      </a>
                      <p className="text-xs text-text-light mt-1">
                        Pour voir les photos détaillées des produits
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-cream-dark">
                  <p className="text-sm text-text-secondary">
                    Je réponds généralement dans un délai de 24 à 48 heures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
