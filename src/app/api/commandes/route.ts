import { NextRequest, NextResponse } from "next/server";
import { getCommandes } from "@/lib/commandes";
import { verifierAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  if (!verifierAdmin(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const commandes = await getCommandes();
    return NextResponse.json(commandes);
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
