import { supabaseAdmin } from "@/lib/supabase";
import type { ProduitDB, VarianteDB, AccessoireDB, AccessoireVarianteDB } from "@/lib/supabase";
import { enCents } from "@/lib/tarifs";

// Lecture du catalogue pour une commande. Contrairement à getProduits(), il n'y a
// AUCUN repli sur produits.json : si Supabase est inaccessible, on refuse de vendre
// plutôt que de facturer d'après un fichier périmé.

export class CatalogueIndisponibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogueIndisponibleError";
  }
}

// Message de journal : l'étape qui échoue avec le code SQLSTATE, le détail et l'indice
// de Supabase (ex. « [42501] permission denied for table variantes »). Il va dans les
// journaux serveur seulement : la réponse HTTP reste générique (503).
function decrireErreur(
  etape: string,
  e: { message: string; code?: string; details?: string; hint?: string }
): string {
  const morceaux = [
    e.code ? `[${e.code}]` : "",
    e.message,
    e.details ? `détails : ${e.details}` : "",
    e.hint ? `indice : ${e.hint}` : "",
  ].filter(Boolean);
  return `${etape} impossible : ${morceaux.join(" ")}`;
}

export interface ProduitPourCommande {
  id: string;
  nom: string;
  prixCents: number;
  photo?: string;
  surCommande: boolean;
  quantiteDisponible: number;
  couleurs: string[];
  tailles: string[];
  variantes: { id: string; nom: string }[];
  accessoires: {
    id: string;
    nom: string;
    obligatoire: boolean;
    variantes: { id: string; nom: string }[];
  }[];
}

export async function lireProduitsPourCommande(
  ids: string[]
): Promise<Map<string, ProduitPourCommande>> {
  const resultat = new Map<string, ProduitPourCommande>();
  if (ids.length === 0) return resultat;

  const { data: produits, error: erreurProduits } = await supabaseAdmin
    .from("produits")
    .select("*")
    .in("id", ids);
  if (erreurProduits) {
    throw new CatalogueIndisponibleError(decrireErreur("Lecture des produits", erreurProduits));
  }

  const { data: variantes, error: erreurVariantes } = await supabaseAdmin
    .from("variantes")
    .select("*")
    .in("produit_id", ids)
    .order("ordre", { ascending: true });
  if (erreurVariantes) {
    throw new CatalogueIndisponibleError(decrireErreur("Lecture des variantes", erreurVariantes));
  }

  const { data: accessoires, error: erreurAccessoires } = await supabaseAdmin
    .from("accessoires")
    .select("*")
    .in("produit_id", ids)
    .order("ordre", { ascending: true });
  if (erreurAccessoires) {
    throw new CatalogueIndisponibleError(decrireErreur("Lecture des accessoires", erreurAccessoires));
  }

  const idsAccessoires = ((accessoires || []) as AccessoireDB[]).map((a) => a.id);
  let variantesAccessoires: AccessoireVarianteDB[] = [];
  if (idsAccessoires.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("accessoire_variantes")
      .select("*")
      .in("accessoire_id", idsAccessoires)
      .order("ordre", { ascending: true });
    if (error) {
      throw new CatalogueIndisponibleError(decrireErreur("Lecture des variantes d'accessoires", error));
    }
    variantesAccessoires = (data || []) as AccessoireVarianteDB[];
  }

  for (const p of (produits || []) as ProduitDB[]) {
    const prix = Number(p.prix);
    resultat.set(p.id, {
      id: p.id,
      nom: p.nom,
      // Un prix absent ou invalide rend le produit non vendable (voir la route checkout).
      prixCents: Number.isFinite(prix) && prix > 0 ? enCents(prix) : 0,
      photo: (p.photos || [])[0],
      surCommande: p.sur_commande ?? true,
      quantiteDisponible: p.quantite_disponible || 0,
      couleurs: p.couleurs || [],
      tailles: p.tailles || [],
      variantes: ((variantes || []) as VarianteDB[])
        .filter((v) => v.produit_id === p.id)
        .map((v) => ({ id: v.id, nom: v.nom })),
      accessoires: ((accessoires || []) as AccessoireDB[])
        .filter((a) => a.produit_id === p.id)
        .map((a) => ({
          id: a.id,
          nom: a.nom,
          obligatoire: a.obligatoire,
          variantes: variantesAccessoires
            .filter((av) => av.accessoire_id === a.id)
            .map((av) => ({ id: av.id, nom: av.nom })),
        })),
    });
  }

  return resultat;
}

// Réglage « commandes sur mesure ». Une ligne absente équivaut à « accepté »
// (même comportement que /api/settings) ; une erreur de lecture est signalée.
export async function accepteCommandesSurMesure(): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("accepte_commandes_sur_mesure")
    .eq("id", "global")
    .maybeSingle();
  if (error) {
    throw new CatalogueIndisponibleError(decrireErreur("Lecture des réglages", error));
  }
  return data?.accepte_commandes_sur_mesure ?? true;
}
