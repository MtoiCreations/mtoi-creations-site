import { NextRequest, NextResponse } from "next/server";
import { getCommandes } from "@/lib/commandes";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const password = authHeader?.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
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
