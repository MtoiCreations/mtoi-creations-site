"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/Button";
import {
  Lock,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  Eye,
  X,
} from "lucide-react";

interface Commande {
  id: string;
  numeroCommande: string;
  dateCreation: string;
  client: {
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
    couleurSelectionnee?: string;
  }>;
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  note?: string;
  statut: "en_attente" | "payee" | "expediee" | "annulee";
  dateModification?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>("all");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ action: "login" }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuth", password);
        loadCommandes(password);
      } else {
        setError("Mot de passe incorrect");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommandes = async (auth: string) => {
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify({ action: "getCommandes" }),
      });

      if (response.ok) {
        const data = await response.json();
        setCommandes(data.sort((a: Commande, b: Commande) =>
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        ));
      }
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    }
  };

  const updateStatut = async (commandeId: string, nouveauStatut: string) => {
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) return;

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify({ action: "updateStatut", commandeId, nouveauStatut }),
      });

      if (response.ok) {
        loadCommandes(auth);
        setSelectedCommande(null);
      }
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setPassword("");
    setCommandes([]);
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("adminAuth");
    if (savedAuth) {
      setPassword(savedAuth);
      setIsAuthenticated(true);
      loadCommandes(savedAuth);
    }
  }, []);

  const commandesFiltrees =
    filterStatut === "all"
      ? commandes
      : commandes.filter((c) => c.statut === filterStatut);

  const statutConfig = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-800", icon: Clock },
    payee: { label: "Payée", color: "bg-green-100 text-green-800", icon: CheckCircle },
    expediee: { label: "Expédiée", color: "bg-blue-100 text-blue-800", icon: Truck },
    annulee: { label: "Annulée", color: "bg-gray-100 text-gray-500", icon: XCircle },
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center p-4">
        <div className="bg-white rounded-card p-8 shadow-soft max-w-md w-full">
          <div className="text-center mb-8">
            <Lock className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-primary">Administration</h1>
            <p className="text-text-secondary mt-2">Entrez le mot de passe pour accéder</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 border border-cream-dark rounded-button focus:outline-none focus:ring-2 focus:ring-secondary mb-4"
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Connexion"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <header className="bg-white border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-primary">Administration</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-text-secondary hover:text-secondary transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statutConfig).map(([key, config]) => {
            const count = commandes.filter((c) => c.statut === key).length;
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setFilterStatut(key === filterStatut ? "all" : key)}
                className={`p-4 rounded-card transition-all ${
                  filterStatut === key
                    ? "bg-secondary text-white"
                    : "bg-white hover:shadow-soft"
                }`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm opacity-80">{config.label}</p>
              </button>
            );
          })}
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-card shadow-soft overflow-hidden">
          <div className="p-4 border-b border-cream-dark flex items-center justify-between">
            <h2 className="font-serif text-xl text-primary">
              Commandes {filterStatut !== "all" && `(${statutConfig[filterStatut as keyof typeof statutConfig]?.label})`}
            </h2>
            {filterStatut !== "all" && (
              <button
                onClick={() => setFilterStatut("all")}
                className="text-sm text-secondary hover:underline"
              >
                Voir toutes
              </button>
            )}
          </div>

          {commandesFiltrees.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              Aucune commande
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {commandesFiltrees.map((commande) => {
                const config = statutConfig[commande.statut];
                const Icon = config.icon;
                return (
                  <div
                    key={commande.id}
                    className="p-4 hover:bg-cream/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-primary">
                            {commande.numeroCommande}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}
                          >
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {commande.client.nom} • {commande.client.email}
                        </p>
                        <p className="text-sm text-text-light">
                          {new Date(commande.dateCreation).toLocaleDateString("fr-CA", {
                            dateStyle: "medium",
                          })}{" "}
                          à{" "}
                          {new Date(commande.dateCreation).toLocaleTimeString("fr-CA", {
                            timeStyle: "short",
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-lg text-secondary font-semibold">
                          {formatPrice(commande.total)}
                        </p>
                        <button
                          onClick={() => setSelectedCommande(commande)}
                          className="mt-2 inline-flex items-center text-sm text-text-secondary hover:text-secondary transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal détails commande */}
      {selectedCommande && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-cream-dark p-4 flex items-center justify-between">
              <h3 className="font-serif text-xl text-primary">
                Commande {selectedCommande.numeroCommande}
              </h3>
              <button
                onClick={() => setSelectedCommande(null)}
                className="p-2 text-text-secondary hover:text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statut actuel */}
              <div>
                <p className="text-sm text-text-secondary mb-2">Statut actuel</p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    statutConfig[selectedCommande.statut].color
                  }`}
                >
                  {(() => {
                    const Icon = statutConfig[selectedCommande.statut].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {statutConfig[selectedCommande.statut].label}
                </span>
              </div>

              {/* Client */}
              <div>
                <p className="text-sm text-text-secondary mb-2">Client</p>
                <p className="font-medium">{selectedCommande.client.nom}</p>
                <p className="text-sm">{selectedCommande.client.email}</p>
                {selectedCommande.client.telephone && (
                  <p className="text-sm">{selectedCommande.client.telephone}</p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <p className="text-sm text-text-secondary mb-2">Adresse de livraison</p>
                <p>{selectedCommande.client.adresse.ligne1}</p>
                {selectedCommande.client.adresse.ligne2 && (
                  <p>{selectedCommande.client.adresse.ligne2}</p>
                )}
                <p>
                  {selectedCommande.client.adresse.ville},{" "}
                  {selectedCommande.client.adresse.province}{" "}
                  {selectedCommande.client.adresse.codePostal}
                </p>
              </div>

              {/* Articles */}
              <div>
                <p className="text-sm text-text-secondary mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedCommande.articles.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.produit.nom} × {item.quantite}
                        {item.couleurSelectionnee && (
                          <span className="text-text-light ml-2">
                            ({item.couleurSelectionnee})
                          </span>
                        )}
                      </span>
                      <span>{formatPrice(item.produit.prix * item.quantite)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cream-dark mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatPrice(selectedCommande.sousTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>
                      {selectedCommande.fraisLivraison === 0
                        ? "Gratuite"
                        : formatPrice(selectedCommande.fraisLivraison)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-secondary">
                      {formatPrice(selectedCommande.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedCommande.note && (
                <div>
                  <p className="text-sm text-text-secondary mb-2">Note du client</p>
                  <p className="bg-cream p-3 rounded-lg">{selectedCommande.note}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-cream-dark pt-6">
                <p className="text-sm text-text-secondary mb-3">Changer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCommande.statut === "en_attente" && (
                    <>
                      <Button
                        onClick={() => updateStatut(selectedCommande.id, "payee")}
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marquer comme payée
                      </Button>
                      <Button
                        onClick={() => updateStatut(selectedCommande.id, "annulee")}
                        variant="outline"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                    </>
                  )}
                  {selectedCommande.statut === "payee" && (
                    <Button
                      onClick={() => updateStatut(selectedCommande.id, "expediee")}
                      size="sm"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Marquer comme expédiée
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
