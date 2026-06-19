import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

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
    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Erreur GET produits:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Vérifier que Supabase est configuré
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await request.json();

    const produit = {
      id: body.id || `produit-${Date.now()}`,
      categorie: body.categorie,
      sous_categorie: body.sousCategorie || null,
      nom: body.nom,
      description: body.description,
      prix: parseFloat(body.prix),
      devise: "CAD",
      quantite_disponible: parseInt(body.quantiteDisponible) || 0,
      sur_commande: body.surCommande || false,
      delais_fabrication: body.delaisFabrication || null,
      couleurs: body.couleurs || [],
      tailles: body.tailles || [],
      photos: body.photos || [],
      etiquettes: body.etiquettes || [],
    };

    const { data, error } = await supabase
      .from("produits")
      .insert([produit])
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        error: `Supabase: ${error.message}`,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur POST produit:", error);
    return NextResponse.json({
      error: `Exception: ${JSON.stringify(error)}`
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const produit = {
      categorie: updates.categorie,
      sous_categorie: updates.sousCategorie || null,
      nom: updates.nom,
      description: updates.description,
      prix: parseFloat(updates.prix),
      quantite_disponible: parseInt(updates.quantiteDisponible) || 0,
      sur_commande: updates.surCommande || false,
      delais_fabrication: updates.delaisFabrication || null,
      couleurs: updates.couleurs || [],
      tailles: updates.tailles || [],
      photos: updates.photos || [],
      etiquettes: updates.etiquettes || [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("produits")
      .update(produit)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur PUT produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const { error } = await supabase
      .from("produits")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
