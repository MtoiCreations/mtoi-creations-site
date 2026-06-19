import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const password = authHeader?.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

// GET - Récupérer les accessoires d'un produit avec leurs variantes
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
    // Récupérer les accessoires
    const { data: accessoires, error: accError } = await supabase
      .from("accessoires")
      .select("*")
      .eq("produit_id", produitId)
      .order("ordre", { ascending: true });

    if (accError) throw accError;

    // Récupérer les variantes de tous ces accessoires
    const accessoireIds = (accessoires || []).map((a: { id: string }) => a.id);

    let variantes: { id: string; accessoire_id: string; nom: string; photo: string; ordre: number }[] = [];
    if (accessoireIds.length > 0) {
      const { data: varData, error: varError } = await supabase
        .from("accessoire_variantes")
        .select("*")
        .in("accessoire_id", accessoireIds)
        .order("ordre", { ascending: true });

      if (varError) throw varError;
      variantes = varData || [];
    }

    // Combiner les données
    const result = (accessoires || []).map((acc: { id: string; nom: string; description: string | null; obligatoire: boolean; ordre: number }) => ({
      ...acc,
      variantes: variantes.filter((v) => v.accessoire_id === acc.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur GET accessoires:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un accessoire
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const accessoire = {
      produit_id: body.produit_id,
      nom: body.nom,
      description: body.description || null,
      obligatoire: body.obligatoire ?? true,
      ordre: body.ordre || 0,
    };

    const { data, error } = await supabase
      .from("accessoires")
      .insert([accessoire])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...data, variantes: [] });
  } catch (error) {
    console.error("Erreur POST accessoire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Modifier un accessoire
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, variantes: _variantes, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("accessoires")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur PUT accessoire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un accessoire (les variantes seront supprimées en cascade)
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
      .from("accessoires")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE accessoire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
