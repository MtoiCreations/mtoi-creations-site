"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, ChangementPanier, Produit, Variante, Accessoire, AccessoireVariante } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (
    produit: Produit,
    quantite: number,
    couleur?: string,
    taille?: string,
    variante?: Variante,
    accessoires?: { accessoire: Accessoire; variante: AccessoireVariante }[]
  ) => void;
  removeItem: (index: number) => void;
  updateQuantite: (index: number, quantite: number) => void;
  clearCart: () => void;
  appliquerChangements: (changements: ChangementPanier[]) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Fonction pour créer une clé unique pour un item
const getItemKey = (item: CartItem): string => {
  const parts = [
    item.produit.id,
    item.couleurSelectionnee || "",
    item.tailleSelectionnee || "",
    item.varianteSelectionnee?.id || "",
    ...(item.accessoiresSelectionnes?.map(a => `${a.accessoire.id}:${a.variante.id}`) || []),
  ];
  return parts.join("|");
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (produit, quantite, couleur, taille, variante, accessoires) => {
        set((state) => {
          const newItem: CartItem = {
            produit,
            quantite,
            couleurSelectionnee: couleur,
            tailleSelectionnee: taille,
            varianteSelectionnee: variante,
            accessoiresSelectionnes: accessoires,
          };

          const newItemKey = getItemKey(newItem);

          // Chercher si un item identique existe
          const existingIndex = state.items.findIndex(
            (item) => getItemKey(item) === newItemKey
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantite += quantite;
            return { items: newItems };
          }

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateQuantite: (index, quantite) => {
        set((state) => ({
          items: state.items.map((item, i) =>
            i === index ? { ...item, quantite } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Resynchronise le panier avec les écarts signalés par /api/checkout (409).
      appliquerChangements: (changements) => {
        set((state) => {
          const aRetirer = new Set(
            changements
              .filter((c) => ["indisponible", "epuise", "sur_mesure_ferme", "option_invalide"].includes(c.type))
              .map((c) => c.produitId)
          );
          const prix = new Map<string, number>();
          const stockRestant = new Map<string, number>();
          for (const c of changements) {
            if (c.type === "prix" && c.nouveauPrix !== undefined) prix.set(c.produitId, c.nouveauPrix);
            if (c.type === "stock_insuffisant" && c.quantiteMax !== undefined) stockRestant.set(c.produitId, c.quantiteMax);
          }

          const items = state.items
            .filter((item) => !aRetirer.has(item.produit.id))
            .map((item) => {
              const nouveauPrix = prix.get(item.produit.id);
              return nouveauPrix === undefined ? item : { ...item, produit: { ...item.produit, prix: nouveauPrix } };
            })
            .map((item) => {
              // Le stock disponible est réparti sur les lignes d'un même produit.
              const restant = stockRestant.get(item.produit.id);
              if (restant === undefined) return item;
              const quantite = Math.min(item.quantite, restant);
              stockRestant.set(item.produit.id, restant - quantite);
              return { ...item, quantite };
            })
            .filter((item) => item.quantite > 0);

          return { items };
        });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.produit.prix * item.quantite,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantite, 0);
      },
    }),
    {
      name: "mtoi-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
    }
  )
);
