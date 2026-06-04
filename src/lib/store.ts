"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Produit, Variante, Accessoire, AccessoireVariante } from "@/types";

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
