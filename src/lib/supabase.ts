import { createClient } from '@supabase/supabase-js';
import { Produit, Variante, Accessoire, AccessoireVariante, Dimensions, Avis } from '@/types';
import produitsFallback from '@/data/produits.json';
import produitsExtras from '@/data/produitsExtras.json';

interface ProduitExtra {
  dimensions?: Dimensions;
  avis?: Avis[];
}

const extrasMap = produitsExtras as Record<string, ProduitExtra>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client public (lecture seule, côté navigateur)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (accès complet, côté serveur uniquement)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

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

export interface VarianteDB {
  id: string;
  produit_id: string;
  nom: string;
  photo: string;
  ordre: number;
}

export interface AccessoireDB {
  id: string;
  produit_id: string;
  nom: string;
  description: string | null;
  obligatoire: boolean;
  ordre: number;
}

export interface AccessoireVarianteDB {
  id: string;
  accessoire_id: string;
  nom: string;
  photo: string;
  ordre: number;
}

export async function getProduits(): Promise<Produit[]> {
  // Si Supabase n'est pas configuré, utiliser le fichier JSON
  if (!supabaseUrl || !supabaseAnonKey) {
    return produitsFallback as Produit[];
  }

  try {
    // Récupérer les produits
    const { data: produitsData, error: produitsError } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    if (produitsError || !produitsData || produitsData.length === 0) {
      return produitsFallback as Produit[];
    }

    // Récupérer toutes les variantes
    const { data: variantesData } = await supabase
      .from("variantes")
      .select("*")
      .order("ordre", { ascending: true });

    // Récupérer tous les accessoires
    const { data: accessoiresData } = await supabase
      .from("accessoires")
      .select("*")
      .order("ordre", { ascending: true });

    // Récupérer toutes les variantes d'accessoires
    const { data: accessoireVariantesData } = await supabase
      .from("accessoire_variantes")
      .select("*")
      .order("ordre", { ascending: true });

    return produitsData.map((p): Produit => {
      // Variantes du produit
      const variantes: Variante[] = (variantesData || [])
        .filter((v: VarianteDB) => v.produit_id === p.id)
        .map((v: VarianteDB): Variante => ({
          id: v.id,
          nom: v.nom,
          photo: v.photo,
          ordre: v.ordre,
        }));

      // Accessoires du produit avec leurs variantes
      const accessoires: Accessoire[] = (accessoiresData || [])
        .filter((a: AccessoireDB) => a.produit_id === p.id)
        .map((a: AccessoireDB): Accessoire => ({
          id: a.id,
          nom: a.nom,
          description: a.description || undefined,
          obligatoire: a.obligatoire,
          ordre: a.ordre,
          variantes: (accessoireVariantesData || [])
            .filter((av: AccessoireVarianteDB) => av.accessoire_id === a.id)
            .map((av: AccessoireVarianteDB): AccessoireVariante => ({
              id: av.id,
              nom: av.nom,
              photo: av.photo,
              ordre: av.ordre,
            })),
        }));

      const extras = extrasMap[p.id];

      return {
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
        variantes: variantes.length > 0 ? variantes : undefined,
        accessoires: accessoires.length > 0 ? accessoires : undefined,
        dimensions: extras?.dimensions,
        avis: extras?.avis,
      };
    });
  } catch {
    return produitsFallback as Produit[];
  }
}

export async function getProduitById(id: string): Promise<Produit | undefined> {
  const produits = await getProduits();
  return produits.find(p => p.id === id);
}
