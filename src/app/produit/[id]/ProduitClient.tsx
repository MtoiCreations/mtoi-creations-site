"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Produit, Variante, AccessoireVariante } from "@/types";
import { useCartStore } from "@/lib/store";
import { formatPrice, getStatutBadge } from "@/lib/utils";
import QuantitySelector from "@/components/QuantitySelector";
import ProductGallery from "@/components/ProductGallery";
import ProductDimensions from "@/components/ProductDimensions";
import ProductReviews from "@/components/ProductReviews";
import { ShoppingBag, Clock, Check, X, AlertCircle, PauseCircle } from "lucide-react";

interface ProduitClientProps {
  produit: Produit;
}

const btnPrimary =
  "inline-flex w-full items-center justify-center rounded-[4px] bg-safran px-6 py-3 font-titre font-medium text-encre transition-colors hover:bg-safran/90 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "inline-flex w-full items-center justify-center rounded-[4px] border border-framboise px-6 py-3 font-titre font-medium text-framboise transition-colors hover:bg-framboise hover:text-fond disabled:cursor-not-allowed disabled:opacity-50";

const variantSwatch = (active: boolean) =>
  `relative h-16 w-16 overflow-hidden transition-all ${
    active ? "ring-2 ring-framboise ring-offset-2" : "ring-1 ring-encre/25 hover:ring-framboise"
  }`;

const optionButton = (active: boolean) =>
  `rounded-[4px] border px-4 py-2 font-titre text-sm transition-all ${
    active
      ? "border-framboise bg-framboise/10 font-medium text-framboise"
      : "border-encre/25 bg-surface text-encre hover:border-framboise"
  }`;

export default function ProduitClient({ produit }: ProduitClientProps) {
  const router = useRouter();
  const [quantite, setQuantite] = useState(1);
  const [accepteCommandesSurMesure, setAccepteCommandesSurMesure] = useState(true);

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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setAccepteCommandesSurMesure(data.accepteCommandesSurMesure);
        }
      } catch (error) {
        console.error("Erreur chargement settings:", error);
      }
    };
    loadSettings();
  }, []);

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
  const estSurCommandeUniquement = produit.surCommande && produit.quantiteDisponible === 0;
  const commandesSurMesureBloquees = estSurCommandeUniquement && !accepteCommandesSurMesure;
  const estEpuise = statut.variant === "epuise" || commandesSurMesureBloquees;
  const maxQuantite = produit.surCommande ? 99 : produit.quantiteDisponible;

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
    <div className="min-h-screen bg-fond py-14 md:py-24">
      <div className="container-custom">
        {/* Fil d'Ariane */}
        <nav className="mb-6 text-sm" aria-label="Fil d'Ariane">
          <ol className="flex flex-wrap items-center gap-2 text-encre/70" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-framboise transition-colors" itemProp="item">
                <span itemProp="name">Accueil</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/boutique" className="hover:text-framboise transition-colors" itemProp="item">
                <span itemProp="name">Boutique</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="line-clamp-1 font-medium text-encre" itemProp="name">{produit.nom}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          {/* Colonne gauche : Galerie, options couleurs, description */}
          <div className="lg:col-span-7">
            <ProductGallery
              photos={getAllPhotos()}
              alt={produit.nom}
            />

            {/* Sélecteur de variantes */}
            {hasVariantes && (
              <div className="mt-6">
                <label className="mb-3 block font-titre text-encre">
                  Couleur / Motif : <span className="font-corps font-normal text-encre/70">{varianteSelectionnee?.nom || "Sélectionne une option"}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {produit.variantes!.map((variante) => (
                    <button
                      key={variante.id}
                      onClick={() => setVarianteSelectionnee(variante)}
                      className={variantSwatch(varianteSelectionnee?.id === variante.id)}
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

            {/* Description (déplacée sous les options de couleurs) */}
            <div className="mt-8 border-t border-encre/10 pt-8">
              <h2 className="mb-4 font-titre text-xl text-encre">Description</h2>
              <div className="max-w-[65ch] whitespace-pre-line font-corps text-[17px] leading-[1.65] text-encre/80">
                {produit.description}
              </div>
            </div>

            {/* Étiquettes */}
            {produit.etiquettes.length > 0 && (
              <div className="mt-6 border-t border-encre/10 pt-6">
                <div className="flex flex-wrap gap-2">
                  {produit.etiquettes.map((tag) => (
                    <Link
                      key={tag}
                      href={`/boutique?recherche=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-lichen/10 px-3 py-1 text-xs text-lichen transition-colors hover:bg-lichen/20"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="mt-10 lg:col-span-5 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
            {/* Catégorie */}
            <p className="mb-2 font-titre text-sm text-framboise">
              {produit.sousCategorie || produit.categorie}
            </p>

            {/* Nom */}
            <h1 className="mb-4 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
              {produit.nom}
            </h1>

            {/* Disponibilité — texte discret */}
            <p className="mb-4 text-sm text-encre/65">
              {statut.label}
            </p>

            {/* Prix */}
            <p className="mb-6 font-titre text-3xl font-semibold text-framboise">
              {formatPrice(produit.prix, produit.devise)}
            </p>

            {/* Message commandes sur mesure bloquées */}
            {commandesSurMesureBloquees && (
              <div className="mb-6 border border-safran/30 bg-safran/10 p-4">
                <p className="flex items-start gap-2 text-sm text-encre">
                  <PauseCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-safran" />
                  <span>
                    <strong>Commandes sur mesure temporairement suspendues.</strong><br />
                    Ce produit n’est pas en stock actuellement. Reviens bientôt !
                  </span>
                </p>
              </div>
            )}

            {/* Note sur commande */}
            {produit.surCommande && produit.delaisFabrication && !commandesSurMesureBloquees && (
              <div className="mb-6 border border-safran/30 bg-safran/10 p-4">
                <p className="text-sm text-encre">
                  <Clock className="mr-2 inline h-4 w-4 text-safran" />
                  <strong>Délai de fabrication :</strong> {produit.delaisFabrication}
                </p>
              </div>
            )}

            {/* Anciennes options de couleur */}
            {!hasVariantes && produit.options.couleurs.length > 0 && produit.options.couleurs[0] && (
              <div className="mb-6">
                <label className="mb-3 block font-titre text-encre">
                  Couleur : <span className="font-corps font-normal text-encre/70">{couleurSelectionnee}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {produit.options.couleurs.filter(c => c).map((couleur) => (
                    <button
                      key={couleur}
                      onClick={() => setCouleurSelectionnee(couleur)}
                      className={optionButton(couleurSelectionnee === couleur)}
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
                <label className="mb-3 block font-titre text-encre">
                  Taille : <span className="font-corps font-normal text-encre/70">{tailleSelectionnee}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {produit.options.tailles.filter(t => t).map((taille) => (
                    <button
                      key={taille}
                      onClick={() => setTailleSelectionnee(taille)}
                      className={optionButton(tailleSelectionnee === taille)}
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
                  <div key={accessoire.id} className="border border-encre/10 bg-surface p-4">
                    <label className="mb-3 block font-titre text-encre">
                      {accessoire.nom}
                      {accessoire.obligatoire && <span className="ml-1 text-framboise">*</span>}
                      {accessoiresSelectionnes.has(accessoire.id) && (
                        <span className="ml-2 font-corps font-normal text-encre/70">
                          — {accessoiresSelectionnes.get(accessoire.id)?.nom}
                        </span>
                      )}
                    </label>
                    {accessoire.description && (
                      <p className="mb-3 font-corps text-sm text-encre/70">{accessoire.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {accessoire.variantes.map((variante) => {
                        const isSelected = accessoiresSelectionnes.get(accessoire.id)?.id === variante.id;
                        return (
                          <button
                            key={variante.id}
                            onClick={() => handleSelectAccessoireVariante(accessoire.id, variante)}
                            className={`${variantSwatch(isSelected)} h-20 w-20`}
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
                              <div className="absolute inset-0 flex items-center justify-center bg-framboise/20">
                                <Check className="h-6 w-6 text-framboise" />
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
              <div className="mb-4 flex items-center gap-3 border border-framboise/30 bg-framboise/10 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-framboise" />
                <p className="text-sm text-framboise">
                  Choisis toutes les options requises avant d’ajouter au panier.
                </p>
              </div>
            )}

            {/* Quantité */}
            <div className="mb-6">
              <label className="mb-3 block font-titre text-encre">Quantité</label>
              <QuantitySelector
                value={quantite}
                onChange={setQuantite}
                max={maxQuantite}
                disabled={estEpuise}
              />
              {!estEpuise && !produit.surCommande && produit.quantiteDisponible <= 5 && (
                <p className="mt-2 text-sm text-encre/70">
                  Plus que {produit.quantiteDisponible} en stock !
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAjouterClick}
                disabled={estEpuise}
                className={ajouteAuPanier ? `${btnPrimary} bg-lichen hover:bg-lichen` : btnPrimary}
              >
                {ajouteAuPanier ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Ajouté au panier !
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </>
                )}
              </button>

              {!estEpuise && (
                <button
                  type="button"
                  onClick={handleCommanderMaintenant}
                  className="block w-full text-center font-titre font-medium text-framboise underline underline-offset-4 transition-colors hover:text-framboise/80"
                >
                  Commander maintenant
                </button>
              )}
            </div>

            {/* Dimensions (sous la section panier) */}
            {produit.dimensions && (
              <div className="mt-8 border-t border-encre/10 pt-8">
                <ProductDimensions dimensions={produit.dimensions} />
              </div>
            )}

            {/* Avis clients (sous les dimensions) */}
            {produit.avis && produit.avis.length > 0 && (
              <div className="mt-6">
                <ProductReviews avis={produit.avis} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-encre/50 p-4">
          <div className="w-full max-w-md rounded-[4px] bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-titre text-xl text-encre">Confirmer ta sélection</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="p-2 text-encre/70 transition-colors hover:text-encre"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              {/* Produit principal */}
              <div className="flex items-center gap-4 bg-fond p-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden">
                  <Image
                    src={getMainPhoto()}
                    alt={produit.nom}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-medium text-encre">{produit.nom}</p>
                  {varianteSelectionnee && (
                    <p className="text-sm text-encre/70">{varianteSelectionnee.nom}</p>
                  )}
                  {couleurSelectionnee && !varianteSelectionnee && (
                    <p className="text-sm text-encre/70">{couleurSelectionnee}</p>
                  )}
                </div>
              </div>

              {/* Accessoires sélectionnés */}
              {accessoiresSelectionnes.size > 0 && (
                <>
                  {Array.from(accessoiresSelectionnes.entries()).map(([accId, variante]) => {
                    const accessoire = produit.accessoires?.find(a => a.id === accId);
                    return (
                      <div key={accId} className="flex items-center gap-4 bg-fond p-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden">
                          <Image
                            src={variante.photo}
                            alt={variante.nom}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-encre">{accessoire?.nom}</p>
                          <p className="text-sm text-encre/70">{variante.nom}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Quantité et prix */}
              <div className="flex items-center justify-between border-t border-encre/10 pt-4">
                <span className="text-encre/70">Quantité : {quantite}</span>
                <span className="font-titre text-xl font-semibold text-framboise">
                  {formatPrice(produit.prix * quantite, produit.devise)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className={btnSecondary}
              >
                Modifier
              </button>
              <button type="button" onClick={handleConfirmerAjout} className={btnPrimary}>
                <Check className="mr-2 h-5 w-5" />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
