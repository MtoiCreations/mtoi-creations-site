"use client";

import { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import produits from "@/data/produits.json";
import { Produit } from "@/types";
import { useCartStore } from "@/lib/store";
import { formatPrice, getStatutBadge } from "@/lib/utils";
import ProductGallery from "@/components/ProductGallery";
import QuantitySelector from "@/components/QuantitySelector";
import Button from "@/components/Button";
import { ShoppingBag, Zap, Clock, Check } from "lucide-react";

export default function ProduitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const produitsTyped = produits as Produit[];
  const produit = produitsTyped.find((p) => p.id === id);

  const [quantite, setQuantite] = useState(1);
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<string>("");
  const [tailleSelectionnee, setTailleSelectionnee] = useState<string>("");
  const [ajouteAuPanier, setAjouteAuPanier] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (produit) {
      if (produit.options.couleurs.length > 0 && produit.options.couleurs[0]) {
        setCouleurSelectionnee(produit.options.couleurs[0]);
      }
      if (produit.options.tailles.length > 0 && produit.options.tailles[0]) {
        setTailleSelectionnee(produit.options.tailles[0]);
      }
    }
  }, [produit]);

  if (!produit) {
    notFound();
  }

  const statut = getStatutBadge(produit.quantiteDisponible, produit.surCommande);
  const estEpuise = statut.variant === "epuise";
  const maxQuantite = produit.surCommande ? 99 : produit.quantiteDisponible;

  const badgeColors = {
    disponible: "bg-green-100 text-green-800 border-green-200",
    surCommande: "bg-amber-100 text-amber-800 border-amber-200",
    epuise: "bg-gray-100 text-gray-500 border-gray-200",
  };

  const handleAjouterAuPanier = () => {
    addItem(produit, quantite, couleurSelectionnee || undefined, tailleSelectionnee || undefined);
    setAjouteAuPanier(true);
    setTimeout(() => setAjouteAuPanier(false), 2000);
  };

  const handleCommanderMaintenant = () => {
    addItem(produit, quantite, couleurSelectionnee || undefined, tailleSelectionnee || undefined);
    router.push("/panier");
  };

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        {/* Fil d'Ariane */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-text-secondary flex-wrap">
            <li>
              <Link href="/" className="hover:text-secondary transition-colors">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/boutique" className="hover:text-secondary transition-colors">
                Boutique
              </Link>
            </li>
            <li>/</li>
            <li className="text-primary font-medium line-clamp-1">{produit.nom}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie photos */}
          <div>
            <ProductGallery photos={produit.photos} nomProduit={produit.nom} />
          </div>

          {/* Informations produit */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Catégorie */}
            <p className="font-display text-secondary tracking-widest uppercase text-sm mb-2">
              {produit.sousCategorie || produit.categorie}
            </p>

            {/* Nom */}
            <h1 className="heading-2 text-primary mb-4">{produit.nom}</h1>

            {/* Badge statut */}
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${badgeColors[statut.variant]}`}
              >
                {statut.variant === "disponible" && <Check className="h-4 w-4" />}
                {statut.variant === "surCommande" && <Clock className="h-4 w-4" />}
                {statut.label}
              </span>
            </div>

            {/* Prix */}
            <p className="font-display text-3xl text-secondary font-semibold mb-6">
              {formatPrice(produit.prix, produit.devise)}
            </p>

            {/* Note sur commande */}
            {produit.surCommande && produit.delaisFabrication && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-card">
                <p className="text-amber-800 text-sm">
                  <Clock className="inline h-4 w-4 mr-2" />
                  <strong>Délai de fabrication :</strong> {produit.delaisFabrication}
                </p>
              </div>
            )}

            {/* Sélecteur de couleur */}
            {produit.options.couleurs.length > 0 && produit.options.couleurs[0] && (
              <div className="mb-6">
                <label className="block font-display text-primary mb-3">
                  Couleur : <span className="font-normal text-text-secondary">{couleurSelectionnee}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {produit.options.couleurs.filter(c => c).map((couleur) => (
                    <button
                      key={couleur}
                      onClick={() => setCouleurSelectionnee(couleur)}
                      className={`px-4 py-2 rounded-button border transition-all ${
                        couleurSelectionnee === couleur
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-cream-dark bg-white text-primary hover:border-secondary"
                      }`}
                    >
                      {couleur}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sélecteur de taille */}
            {produit.options.tailles.length > 0 && produit.options.tailles[0] && (
              <div className="mb-6">
                <label className="block font-display text-primary mb-3">
                  Taille : <span className="font-normal text-text-secondary">{tailleSelectionnee}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {produit.options.tailles.filter(t => t).map((taille) => (
                    <button
                      key={taille}
                      onClick={() => setTailleSelectionnee(taille)}
                      className={`px-4 py-2 rounded-button border transition-all ${
                        tailleSelectionnee === taille
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-cream-dark bg-white text-primary hover:border-secondary"
                      }`}
                    >
                      {taille}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div className="mb-6">
              <label className="block font-display text-primary mb-3">Quantité</label>
              <QuantitySelector
                value={quantite}
                onChange={setQuantite}
                max={maxQuantite}
                disabled={estEpuise}
              />
              {!estEpuise && !produit.surCommande && produit.quantiteDisponible <= 5 && (
                <p className="mt-2 text-sm text-amber-600">
                  Plus que {produit.quantiteDisponible} en stock !
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                onClick={handleAjouterAuPanier}
                disabled={estEpuise}
                fullWidth
                size="lg"
                className={ajouteAuPanier ? "bg-green-600 hover:bg-green-600" : ""}
              >
                {ajouteAuPanier ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Ajouté au panier !
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </>
                )}
              </Button>

              <Button
                onClick={handleCommanderMaintenant}
                disabled={estEpuise}
                variant="outline"
                fullWidth
                size="lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Commander maintenant
              </Button>
            </div>

            {/* Description */}
            <div className="mt-8 pt-8 border-t border-cream-dark">
              <h2 className="font-serif text-xl text-primary mb-4">Description</h2>
              <div className="prose prose-sm text-text-secondary whitespace-pre-line">
                {produit.description}
              </div>
            </div>

            {/* Étiquettes */}
            {produit.etiquettes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-cream-dark">
                <div className="flex flex-wrap gap-2">
                  {produit.etiquettes.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-cream rounded-full text-xs text-text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
