import { createClient } from '@supabase/supabase-js';
import { Produit } from '@/types';
import produitsFallback from '@/data/produits.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProduitDB {
  id: string;
  categorie: string;
  sous_categorie: string | null;
  nom: string;
  description: string;
  prix: number;
  devise: string;
  quantite_disponible: number;
  sur_commande: boolean;
  delais_fabrication: string | null;
  couleurs: string[];
  tailles: string[];
  photos: string[];
  etiquettes: string[];
  created_at: string;
  updated_at: string;
}

export async function getProduits(): Promise<Produit[]> {
  // Si Supabase n'est pas configuré, utiliser le fichier JSON
  if (!supabaseUrl || !supabaseAnonKey) {
    return produitsFallback as Produit[];
  }

  try {
    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return produitsFallback as Produit[];
    }

    return data.map((p): Produit => ({
      id: p.id,
      categorie: p.categorie,
      sousCategorie: p.sous_categorie || undefined,
      nom: p.nom,
      description: p.description || "",
      prix: p.prix,
      devise: p.devise || "CAD",
      quantiteDisponible: p.quantite_disponible || 0,
      surCommande: p.sur_commande ?? true,
      delaisFabrication: p.delais_fabrication || undefined,
      options: {
        couleurs: p.couleurs || [],
        tailles: p.tailles || [],
      },
      photos: p.photos || [],
      etiquettes: p.etiquettes || [],
    }));
  } catch {
    return produitsFallback as Produit[];
  }
}

export async function getProduitById(id: string): Promise<Produit | undefined> {
  const produits = await getProduits();
  return produits.find(p => p.id === id);
}
