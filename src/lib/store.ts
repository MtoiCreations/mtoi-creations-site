"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Produit } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (produit: Produit, quantite: number, couleur?: string, taille?: string) => void;
  removeItem: (produitId: string, couleur?: string, taille?: string) => void;
  updateQuantite: (produitId: string, quantite: number, couleur?: string, taille?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (produit, quantite, couleur, taille) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.produit.id === produit.id &&
              item.couleurSelectionnee === couleur &&
              item.tailleSelectionnee === taille
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantite += quantite;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                produit,
                quantite,
                couleurSelectionnee: couleur,
                tailleSelectionnee: taille,
              },
            ],
          };
        });
      },

      removeItem: (produitId, couleur, taille) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.produit.id === produitId &&
                item.couleurSelectionnee === couleur &&
                item.tailleSelectionnee === taille
              )
          ),
        }));
      },

      updateQuantite: (produitId, quantite, couleur, taille) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.produit.id === produitId &&
            item.couleurSelectionnee === couleur &&
            item.tailleSelectionnee === taille
              ? { ...item, quantite }
              : item
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
    }
  )
);
