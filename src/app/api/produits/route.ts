import { NextResponse } from "next/server";
import { getProduits } from "@/lib/supabase";

export async function GET() {
  try {
    const produits = await getProduits();
    return NextResponse.json(produits);
  } catch (error) {
    console.error("Erreur chargement produits:", error);
    return NextResponse.json([]);
  }
}
