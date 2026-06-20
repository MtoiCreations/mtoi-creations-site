import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

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
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch {
    return defaultSettings;
  }
}

async function saveSettings(settings: Settings) {
  const dir = path.dirname(SETTINGS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
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
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
