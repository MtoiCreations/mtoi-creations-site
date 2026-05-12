import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, devise: string = "CAD"): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: devise,
  }).format(price);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MT-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getStatutBadge(quantiteDisponible: number, surCommande: boolean): {
  label: string;
  variant: "disponible" | "surCommande" | "epuise";
} {
  if (quantiteDisponible > 0) {
    return { label: "Disponible", variant: "disponible" };
  }
  if (surCommande) {
    return { label: "Sur commande", variant: "surCommande" };
  }
  return { label: "Épuisé", variant: "epuise" };
}
