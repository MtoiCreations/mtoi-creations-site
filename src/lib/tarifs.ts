// Règles tarifaires appliquées par le serveur. Source de vérité unique :
// aucun montant (prix, livraison, total) venant du navigateur n'est cru.

export const SEUIL_LIVRAISON_GRATUITE = 75; // $ CAD, sous-total à partir duquel la livraison est offerte
export const FRAIS_LIVRAISON = 10; // $ CAD
export const QUANTITE_MAX = 99; // par ligne de panier, et plafond d'un produit sur commande
export const LIGNES_PANIER_MAX = 50;

// Tous les calculs se font en cents entiers pour éviter les erreurs d'arrondi.
export function enCents(montant: number): number {
  return Math.round(montant * 100);
}

export function fraisLivraisonCents(sousTotalCents: number): number {
  return sousTotalCents >= enCents(SEUIL_LIVRAISON_GRATUITE) ? 0 : enCents(FRAIS_LIVRAISON);
}
