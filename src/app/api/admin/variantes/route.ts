import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const password = authHeader?.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

// GET - Récupérer les variantes d'un produit
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const produitId = searchParams.get("produit_id");

  if (!produitId) {
    return NextResponse.json({ error: "produit_id requis" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("variantes")
      .select("*")
      .eq("produit_id", produitId)
      .order("ordre", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Erreur GET variantes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer une variante
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const variante = {
      produit_id: body.produit_id,
      nom: body.nom,
      photo: body.photo,
      ordre: body.ordre || 0,
    };

    const { data, error } = await supabase
      .from("variantes")
      .insert([variante])
      .select()
      .single();

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json({
        error: `Supabase: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur POST variante:", error);
    return NextResponse.json({ error: `Exception: ${String(error)}` }, { status: 500 });
  }
}

// PUT - Modifier une variante
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

    const { data, error } = await supabase
      .from("variantes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur PUT variante:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une variante
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("variantes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE variante:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
