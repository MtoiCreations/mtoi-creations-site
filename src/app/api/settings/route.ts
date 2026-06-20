import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface Settings {
  accepteCommandesSurMesure: boolean;
  messageIndisponible?: string;
}

const defaultSettings: Settings = {
  accepteCommandesSurMesure: true,
  messageIndisponible: "Nous ne prenons pas de nouvelles commandes sur mesure pour le moment. Seuls les produits en stock sont disponibles.",
};

async function getSettings(): Promise<Settings> {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (error || !data) {
      return defaultSettings;
    }

    return {
      accepteCommandesSurMesure: data.accepte_commandes_sur_mesure ?? true,
      messageIndisponible: data.message_indisponible || defaultSettings.messageIndisponible,
    };
  } catch {
    return defaultSettings;
  }
}

async function saveSettings(settings: Settings) {
  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({
      id: "global",
      accepte_commandes_sur_mesure: settings.accepteCommandesSurMesure,
      message_indisponible: settings.messageIndisponible,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Erreur sauvegarde settings:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur lecture settings:", error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentSettings = await getSettings();

    const newSettings: Settings = {
      ...currentSettings,
      ...body,
    };

    await saveSettings(newSettings);
    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Erreur sauvegarde settings:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde", details: errorMessage },
      { status: 500 }
    );
  }
}
