import { supabaseAdmin } from "@/lib/supabase";
import { Commande, ClientCommande, CartItem, StatutCommande } from "@/types";

// Ligne brute de la table "commandes" (snake_case, colonnes JSONB
// renvoyées déjà parsées par supabase-js).
export interface CommandeDB {
  id: string;
  numero_commande: string;
  statut: StatutCommande;
  client: ClientCommande;
  articles: CartItem[];
  sous_total: number;
  frais_livraison: number;
  total: number;
  note: string | null;
  paiement_stripe: boolean;
  numero_suivi: string | null;
  transporteur: string | null;
  created_at: string;
  updated_at: string;
}

export interface NouvelleCommande {
  numeroCommande: string;
  statut?: StatutCommande;
  client: ClientCommande;
  articles: CartItem[];
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  note?: string;
  paiementStripe?: boolean;
}

function mapCommandeDB(row: CommandeDB): Commande {
  return {
    id: row.id,
    numeroCommande: row.numero_commande,
    dateCreation: row.created_at,
    dateModification: row.updated_at,
    statut: row.statut,
    client: row.client,
    articles: row.articles || [],
    sousTotal: row.sous_total,
    fraisLivraison: row.frais_livraison,
    total: row.total,
    note: row.note || undefined,
    paiementStripe: row.paiement_stripe || undefined,
    numeroSuivi: row.numero_suivi || undefined,
    transporteur: row.transporteur || undefined,
  };
}

export async function getCommandes(): Promise<Commande[]> {
  const { data, error } = await supabaseAdmin
    .from("commandes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as CommandeDB[]).map(mapCommandeDB);
}

export async function getCommandeById(id: string): Promise<Commande | undefined> {
  const { data, error } = await supabaseAdmin
    .from("commandes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return undefined;

  return mapCommandeDB(data as CommandeDB);
}

export async function creerCommande(nouvelleCommande: NouvelleCommande): Promise<Commande> {
  const nouvelleLigne = {
    numero_commande: nouvelleCommande.numeroCommande,
    statut: nouvelleCommande.statut || "en_attente",
    client: nouvelleCommande.client,
    articles: nouvelleCommande.articles,
    sous_total: nouvelleCommande.sousTotal,
    frais_livraison: nouvelleCommande.fraisLivraison,
    total: nouvelleCommande.total,
    note: nouvelleCommande.note || null,
    paiement_stripe: nouvelleCommande.paiementStripe || false,
  };

  const { data, error } = await supabaseAdmin
    .from("commandes")
    .insert([nouvelleLigne])
    .select()
    .single();

  if (error) throw error;

  return mapCommandeDB(data as CommandeDB);
}

export async function mettreAJourStatut(
  id: string,
  statut: StatutCommande,
  options?: { numeroSuivi?: string; transporteur?: string }
): Promise<Commande> {
  const updates: Record<string, unknown> = {
    statut,
    updated_at: new Date().toISOString(),
  };

  if (options?.numeroSuivi !== undefined) updates.numero_suivi = options.numeroSuivi;
  if (options?.transporteur !== undefined) updates.transporteur = options.transporteur;

  const { data, error } = await supabaseAdmin
    .from("commandes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapCommandeDB(data as CommandeDB);
}
