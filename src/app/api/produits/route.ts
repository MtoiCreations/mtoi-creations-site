import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Produit } from "@/types";
import produitsFallback from "@/data/produits.json";

export async function GET() {
  try {
    // Essayer de charger depuis Supabase
    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback sur le fichier JSON local
      return NextResponse.json(produitsFallback);
    }

    // Transformer les données Supabase vers le format Produit
    const produits: Produit[] = data.map((p) => ({
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

    return NextResponse.json(produits);
  } catch (error) {
    console.error("Erreur chargement produits:", error);
    // Fallback sur le fichier JSON en cas d'erreur
    return NextResponse.json(produitsFallback);
  }
}
