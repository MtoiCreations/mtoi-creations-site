"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Produit, Variante, AccessoireVariante } from "@/types";
import { useCartStore } from "@/lib/store";
import { formatPrice, getStatutBadge } from "@/lib/utils";
import QuantitySelector from "@/components/QuantitySelector";
import Button from "@/components/Button";
import ProductGallery from "@/components/ProductGallery";
import ProductDimensions from "@/components/ProductDimensions";
import ProductReviews from "@/components/ProductReviews";
import { ShoppingBag, Zap, Clock, Check, X, AlertCircle } from "lucide-react";

interface ProduitClientProps {
  produit: Produit;
}

export default function ProduitClient({ produit }: ProduitClientProps) {
  const router = useRouter();
  const [quantite, setQuantite] = useState(1);

  // Sélections
  const [varianteSelectionnee, setVarianteSelectionnee] = useState<Variante | null>(null);
  const [accessoiresSelectionnes, setAccessoiresSelectionnes] = useState<Map<string, AccessoireVariante>>(new Map());

  // Anciennes options (rétrocompatibilité)
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<string>(
    produit.options.couleurs.length > 0 && produit.options.couleurs[0]
      ? produit.options.couleurs[0]
      : ""
  );
  const [tailleSelectionnee, setTailleSelectionnee] = useState<string>(
    produit.options.tailles.length > 0 && produit.options.tailles[0]
      ? produit.options.tailles[0]
      : ""
  );

  // États UI
  const [ajouteAuPanier, setAjouteAuPanier] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showError, setShowError] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  // Vérifie si toutes les sélections obligatoires sont faites
  const hasVariantes = produit.variantes && produit.variantes.length > 0;
  const hasAccessoires = produit.accessoires && produit.accessoires.length > 0;

  const allSelectionsComplete = () => {
    if (!hasVariantes && produit.options.couleurs.length && produit.options.couleurs[0]) {
      if (!couleurSelectionnee) return false;
    }

    if (hasVariantes && !varianteSelectionnee) return false;

    if (hasAccessoires) {
      for (const acc of produit.accessoires!) {
        if (acc.obligatoire && !accessoiresSelectionnes.has(acc.id)) {
          return false;
        }
      }
    }

    return true;
  };

  const statut = getStatutBadge(produit.quantiteDisponible, produit.surCommande);
  const estEpuise = statut.variant === "epuise";
  const maxQuantite = produit.surCommande ? 99 : produit.quantiteDisponible;

  const badgeColors = {
    disponible: "bg-green-100 text-green-800 border-green-200",
    surCommande: "bg-amber-100 text-amber-800 border-amber-200",
    epuise: "bg-gray-100 text-gray-500 border-gray-200",
  };

  const getMainPhoto = () => {
    if (varianteSelectionnee) {
      return varianteSelectionnee.photo;
    }
    return produit.photos[0] || "/images/placeholder.jpg";
  };

  const getAllPhotos = () => {
    const photos: string[] = [];
    if (varianteSelectionnee) {
      photos.push(varianteSelectionnee.photo);
    }
    photos.push(...produit.photos);
    return Array.from(new Set(photos));
  };

  const handleAjouterClick = () => {
    if (!allSelectionsComplete()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmerAjout = () => {
    const accessoiresArray = Array.from(accessoiresSelectionnes.entries()).map(([accId, variante]) => {
      const accessoire = produit.accessoires?.find(a => a.id === accId);
      return { accessoire: accessoire!, variante };
    });

    addItem(
      produit,
      quantite,
      couleurSelectionnee || undefined,
      tailleSelectionnee || undefined,
      varianteSelectionnee || undefined,
      accessoiresArray.length > 0 ? accessoiresArray : undefined
    );

    setShowConfirmation(false);
    setAjouteAuPanier(true);
    setTimeout(() => setAjouteAuPanier(false), 2000);
  };

  const handleCommanderMaintenant = () => {
    if (!allSelectionsComplete()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const accessoiresArray = Array.from(accessoiresSelectionnes.entries()).map(([accId, variante]) => {
      const accessoire = produit.accessoires?.find(a => a.id === accId);
      return { accessoire: accessoire!, variante };
    });

    addItem(
      produit,
      quantite,
      couleurSelectionnee || undefined,
      tailleSelectionnee || undefined,
      varianteSelectionnee || undefined,
      accessoiresArray.length > 0 ? accessoiresArray : undefined
    );
    router.push("/panier");
  };

  const handleSelectAccessoireVariante = (accessoireId: string, variante: AccessoireVariante) => {
    const newMap = new Map(accessoiresSelectionnes);
    newMap.set(accessoireId, variante);
    setAccessoiresSelectionnes(newMap);
  };

  return (
    <div className="section-padding bg-cream-light min-h-screen">
      <div className="container-custom">
        {/* Fil d'Ariane */}
        <nav className="mb-8 text-sm" aria-label="Fil d'Ariane">
          <ol className="flex items-center gap-2 text-text-secondary flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-secondary transition-colors" itemProp="item">
                <span itemProp="name">Accueil</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/boutique" className="hover:text-secondary transition-colors" itemProp="item">
                <span itemProp="name">Boutique</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-primary font-medium line-clamp-1" itemProp="name">{produit.nom}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie photos */}
          <div>
            <ProductGallery
              photos={getAllPhotos()}
              alt={produit.nom}
            />

            {/* Sélecteur de variantes */}
            {hasVariantes && (
              <div className="mt-6">
                <label className="block font-display text-primary mb-3">
                  Couleur / Motif : <span className="font-normal text-text-secondary">{varianteSelectionnee?.nom || "Sélectionnez une option"}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {produit.variantes!.map((variante) => (
                    <button
                      key={variante.id}
                      onClick={() => setVarianteSelectionnee(variante)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                        varianteSelectionnee?.id === variante.id
                          ? "ring-4 ring-secondary ring-offset-2"
                          : "ring-1 ring-cream-dark hover:ring-secondary"
                      }`}
                      title={variante.nom}
                    >
                      <Image
                        src={variante.photo}
                        alt={variante.nom}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
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

            {/* Anciennes options de couleur */}
            {!hasVariantes && produit.options.couleurs.length > 0 && produit.options.couleurs[0] && (
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
                          ? "border-secondary bg-secondary/10 text-secondary font-medium"
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
                          ? "border-secondary bg-secondary/10 text-secondary font-medium"
                          : "border-cream-dark bg-white text-primary hover:border-secondary"
                      }`}
                    >
                      {taille}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accessoires inclus */}
            {hasAccessoires && (
              <div className="mb-6 space-y-6">
                {produit.accessoires!.map((accessoire) => (
                  <div key={accessoire.id} className="p-4 bg-cream rounded-card">
                    <label className="block font-display text-primary mb-3">
                      {accessoire.nom}
                      {accessoire.obligatoire && <span className="text-red-500 ml-1">*</span>}
                      {accessoiresSelectionnes.has(accessoire.id) && (
                        <span className="font-normal text-text-secondary ml-2">
                          — {accessoiresSelectionnes.get(accessoire.id)?.nom}
                        </span>
                      )}
                    </label>
                    {accessoire.description && (
                      <p className="text-sm text-text-secondary mb-3">{accessoire.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {accessoire.variantes.map((variante) => {
                        const isSelected = accessoiresSelectionnes.get(accessoire.id)?.id === variante.id;
                        return (
                          <button
                            key={variante.id}
                            onClick={() => handleSelectAccessoireVariante(accessoire.id, variante)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all ${
                              isSelected
                                ? "ring-4 ring-secondary ring-offset-2"
                                : "ring-1 ring-cream-dark hover:ring-secondary"
                            }`}
                            title={variante.nom}
                          >
                            <Image
                              src={variante.photo}
                              alt={variante.nom}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                                <Check className="w-6 h-6 text-secondary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message d'erreur */}
            {showError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-card flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">
                  Veuillez choisir toutes les options requises avant d&apos;ajouter au panier.
                </p>
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
                <p className="mt-2 text-sm text-amber-600 font-medium">
                  Plus que {produit.quantiteDisponible} en stock !
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                onClick={handleAjouterClick}
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

            {/* Dimensions */}
            {produit.dimensions && (
              <div className="mt-6">
                <ProductDimensions dimensions={produit.dimensions} />
              </div>
            )}

            {/* Étiquettes */}
            {produit.etiquettes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-cream-dark">
                <div className="flex flex-wrap gap-2">
                  {produit.etiquettes.map((tag) => (
                    <Link
                      key={tag}
                      href={`/boutique?recherche=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-cream rounded-full text-xs text-text-secondary hover:bg-secondary hover:text-white transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Avis clients */}
            {produit.avis && produit.avis.length > 0 && (
              <ProductReviews avis={produit.avis} />
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-primary">Confirmer votre sélection</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="p-2 text-text-secondary hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Produit principal */}
              <div className="flex items-center gap-4 p-3 bg-cream rounded-lg">
                <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                  <Image
                    src={getMainPhoto()}
                    alt={produit.nom}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-medium text-primary">{produit.nom}</p>
                  {varianteSelectionnee && (
                    <p className="text-sm text-text-secondary">{varianteSelectionnee.nom}</p>
                  )}
                  {couleurSelectionnee && !varianteSelectionnee && (
                    <p className="text-sm text-text-secondary">{couleurSelectionnee}</p>
                  )}
                </div>
              </div>

              {/* Accessoires sélectionnés */}
              {accessoiresSelectionnes.size > 0 && (
                <>
                  {Array.from(accessoiresSelectionnes.entries()).map(([accId, variante]) => {
                    const accessoire = produit.accessoires?.find(a => a.id === accId);
                    return (
                      <div key={accId} className="flex items-center gap-4 p-3 bg-cream rounded-lg">
                        <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                          <Image
                            src={variante.photo}
                            alt={variante.nom}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-primary">{accessoire?.nom}</p>
                          <p className="text-sm text-text-secondary">{variante.nom}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Quantité et prix */}
              <div className="flex justify-between items-center pt-4 border-t border-cream-dark">
                <span className="text-text-secondary">Quantité : {quantite}</span>
                <span className="font-display text-xl text-secondary font-semibold">
                  {formatPrice(produit.prix * quantite, produit.devise)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                fullWidth
              >
                Modifier
              </Button>
              <Button onClick={handleConfirmerAjout} fullWidth>
                <Check className="w-5 h-5 mr-2" />
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
