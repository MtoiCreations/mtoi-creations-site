"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Loader2,
} from "lucide-react";

interface Commande {
  id: string;
  numeroCommande: string;
  dateCreation: string;
  client: {
    prenom?: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse: {
      ligne1: string;
      ligne2?: string;
      ville: string;
      province: string;
      codePostal: string;
    };
  };
  articles: Array<{
    produit: { nom: string; prix: number };
    quantite: number;
    couleur?: string;
    variante?: { nom: string };
  }>;
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  note?: string;
  statut: string;
  numeroSuivi?: string;
  transporteur?: string;
  paiementStripe?: boolean;
}

const statuts = [
  { value: "en_attente", label: "En attente", icon: Clock, color: "text-amber-600 bg-amber-50" },
  { value: "payee", label: "Payée", icon: CreditCard, color: "text-green-600 bg-green-50" },
  { value: "en_production", label: "En production", icon: Package, color: "text-blue-600 bg-blue-50" },
  { value: "prete", label: "Prête", icon: Package, color: "text-purple-600 bg-purple-50" },
  { value: "expediee", label: "Expédiée", icon: Truck, color: "text-indigo-600 bg-indigo-50" },
  { value: "livree", label: "Livrée", icon: CheckCircle, color: "text-green-700 bg-green-100" },
  { value: "annulee", label: "Annulée", icon: XCircle, color: "text-red-600 bg-red-50" },
];

const transporteurs = [
  "Postes Canada",
  "Purolator",
  "FedEx",
  "UPS",
  "Autre",
];

export default function CommandesAdminPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("tous");

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      const response = await fetch("/api/commandes");
      const data = await response.json();
      setCommandes(data.sort((a: Commande, b: Commande) =>
        new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
      ));
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (
    id: string,
    newStatut: string,
    numeroSuivi?: string,
    transporteur?: string,
    envoyerEmail: boolean = true
  ) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/commandes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut: newStatut,
          numeroSuivi,
          transporteur,
          envoyerEmail,
        }),
      });

      if (response.ok) {
        await fetchCommandes();
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatutInfo = (statut: string) => {
    return statuts.find((s) => s.value === statut) || statuts[0];
  };

  const filteredCommandes = filter === "tous"
    ? commandes
    : commandes.filter((c) => c.statut === filter);

  const countByStatut = (statut: string) =>
    commandes.filter((c) => c.statut === statut).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light">
      <div className="container-custom py-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-text-secondary hover:text-secondary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l&apos;admin
        </Link>

        <h1 className="heading-2 text-primary mb-8">Gestion des commandes</h1>

        {/* Filtres rapides */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("tous")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "tous"
                ? "bg-secondary text-white"
                : "bg-white text-text-secondary hover:bg-cream"
            }`}
          >
            Toutes ({commandes.length})
          </button>
          {statuts.slice(0, -1).map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === s.value
                  ? "bg-secondary text-white"
                  : "bg-white text-text-secondary hover:bg-cream"
              }`}
            >
              {s.label} ({countByStatut(s.value)})
            </button>
          ))}
        </div>

        {/* Liste des commandes */}
        <div className="space-y-4">
          {filteredCommandes.length === 0 ? (
            <div className="bg-white rounded-card p-8 text-center">
              <Package className="h-12 w-12 text-text-light mx-auto mb-4" />
              <p className="text-text-secondary">Aucune commande trouvée</p>
            </div>
          ) : (
            filteredCommandes.map((commande) => {
              const statutInfo = getStatutInfo(commande.statut);
              const isExpanded = expandedId === commande.id;
              const StatutIcon = statutInfo.icon;

              return (
                <div
                  key={commande.id}
                  className="bg-white rounded-card shadow-soft overflow-hidden"
                >
                  {/* En-tête de commande */}
                  <div
                    className="p-4 cursor-pointer hover:bg-cream/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : commande.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${statutInfo.color}`}>
                          <StatutIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-primary">
                            {commande.numeroCommande}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {commande.client.prenom} {commande.client.nom} •{" "}
                            {new Date(commande.dateCreation).toLocaleDateString("fr-CA")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-display text-lg text-secondary font-semibold">
                          {formatPrice(commande.total)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-text-secondary" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-text-secondary" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Détails (expandable) */}
                  {isExpanded && (
                    <div className="border-t border-cream-dark p-4 space-y-6">
                      {/* Infos client */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-primary mb-2">Client</h3>
                          <p className="text-sm text-text-secondary">
                            {commande.client.prenom} {commande.client.nom}
                            <br />
                            {commande.client.email}
                            {commande.client.telephone && (
                              <>
                                <br />
                                {commande.client.telephone}
                              </>
                            )}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-primary mb-2">Livraison</h3>
                          <p className="text-sm text-text-secondary">
                            {commande.client.adresse.ligne1}
                            {commande.client.adresse.ligne2 && (
                              <>
                                <br />
                                {commande.client.adresse.ligne2}
                              </>
                            )}
                            <br />
                            {commande.client.adresse.ville},{" "}
                            {commande.client.adresse.province}{" "}
                            {commande.client.adresse.codePostal}
                          </p>
                        </div>
                      </div>

                      {/* Articles */}
                      <div>
                        <h3 className="font-medium text-primary mb-2">Articles</h3>
                        <div className="bg-cream rounded-lg p-3 space-y-2">
                          {commande.articles.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.produit.nom} × {item.quantite}
                                {(item.couleur || item.variante?.nom) && (
                                  <span className="text-text-light ml-2">
                                    ({item.variante?.nom || item.couleur})
                                  </span>
                                )}
                              </span>
                              <span className="font-medium">
                                {formatPrice(item.produit.prix * item.quantite)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-cream-dark pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span className="text-secondary">
                              {formatPrice(commande.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      {commande.note && (
                        <div>
                          <h3 className="font-medium text-primary mb-2">Note du client</h3>
                          <p className="text-sm text-text-secondary bg-amber-50 p-3 rounded-lg">
                            {commande.note}
                          </p>
                        </div>
                      )}

                      {/* Gestion du statut */}
                      <div className="border-t border-cream-dark pt-4">
                        <h3 className="font-medium text-primary mb-3">
                          Mettre à jour le statut
                        </h3>
                        <CommandeStatutForm
                          commande={commande}
                          updating={updating === commande.id}
                          onUpdate={updateStatut}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function CommandeStatutForm({
  commande,
  updating,
  onUpdate,
}: {
  commande: Commande;
  updating: boolean;
  onUpdate: (
    id: string,
    statut: string,
    numeroSuivi?: string,
    transporteur?: string,
    envoyerEmail?: boolean
  ) => void;
}) {
  const [newStatut, setNewStatut] = useState(commande.statut);
  const [numeroSuivi, setNumeroSuivi] = useState(commande.numeroSuivi || "");
  const [transporteur, setTransporteur] = useState(commande.transporteur || "");
  const [envoyerEmail, setEnvoyerEmail] = useState(true);

  const showExpeditionFields = newStatut === "expediee";
  const hasChanges =
    newStatut !== commande.statut ||
    numeroSuivi !== (commande.numeroSuivi || "") ||
    transporteur !== (commande.transporteur || "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuts.map((s) => (
          <button
            key={s.value}
            onClick={() => setNewStatut(s.value)}
            disabled={updating}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              newStatut === s.value
                ? s.color + " ring-2 ring-offset-2 ring-current"
                : "bg-cream text-text-secondary hover:bg-cream-dark"
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </div>

      {showExpeditionFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-cream rounded-lg">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Transporteur
            </label>
            <select
              value={transporteur}
              onChange={(e) => setTransporteur(e.target.value)}
              className="w-full px-3 py-2 border border-cream-dark rounded-button bg-white"
            >
              <option value="">Sélectionner...</option>
              {transporteurs.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Numéro de suivi
            </label>
            <input
              type="text"
              value={numeroSuivi}
              onChange={(e) => setNumeroSuivi(e.target.value)}
              placeholder="Ex: 1234567890"
              className="w-full px-3 py-2 border border-cream-dark rounded-button"
            />
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={envoyerEmail}
              onChange={(e) => setEnvoyerEmail(e.target.checked)}
              className="rounded border-cream-dark"
            />
            <Mail className="h-4 w-4 text-text-secondary" />
            Envoyer un email au client
          </label>

          <button
            onClick={() =>
              onUpdate(commande.id, newStatut, numeroSuivi, transporteur, envoyerEmail)
            }
            disabled={updating}
            className="px-4 py-2 bg-secondary text-white rounded-button font-medium hover:bg-secondary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
