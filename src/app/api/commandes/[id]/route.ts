import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);
const COMMANDES_FILE = path.join(process.cwd(), "data", "commandes.json");

interface Commande {
  id: string;
  numeroCommande: string;
  dateCreation: string;
  client: {
    prenom?: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse: {
      ligne1: string;
      ligne2?: string;
      ville: string;
      province: string;
      codePostal: string;
    };
  };
  articles: Array<{
    produit: { nom: string; prix: number };
    quantite: number;
  }>;
  total: number;
  statut: string;
  numeroSuivi?: string;
  transporteur?: string;
}

async function getCommandes(): Promise<Commande[]> {
  try {
    const data = await fs.readFile(COMMANDES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCommandes(commandes: Commande[]) {
  const dir = path.dirname(COMMANDES_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(COMMANDES_FILE, JSON.stringify(commandes, null, 2));
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price);
}

const statutLabels: Record<string, string> = {
  en_attente: "En attente de paiement",
  payee: "Payée",
  en_production: "En production",
  prete: "Prête à expédier",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const commandes = await getCommandes();
  const commande = commandes.find((c) => c.id === id);

  if (!commande) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  return NextResponse.json(commande);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { statut, numeroSuivi, transporteur, envoyerEmail } = body;

    const commandes = await getCommandes();
    const index = commandes.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    const commande = commandes[index];
    const ancienStatut = commande.statut;

    if (statut) commande.statut = statut;
    if (numeroSuivi !== undefined) commande.numeroSuivi = numeroSuivi;
    if (transporteur !== undefined) commande.transporteur = transporteur;

    commandes[index] = commande;
    await saveCommandes(commandes);

    if (envoyerEmail && process.env.RESEND_API_KEY && statut !== ancienStatut) {
      let emailSubject = "";
      let emailContent = "";

      if (statut === "payee") {
        emailSubject = `Paiement confirmé - Commande ${commande.numeroCommande}`;
        emailContent = `
          <h2>Paiement confirmé !</h2>
          <p>Bonjour ${commande.client.prenom || commande.client.nom},</p>
          <p>Nous avons bien reçu votre paiement pour la commande <strong>${commande.numeroCommande}</strong>.</p>
          <p>Nous allons maintenant préparer votre commande avec soin. Vous recevrez un email lorsqu'elle sera expédiée.</p>
        `;
      } else if (statut === "en_production") {
        emailSubject = `Votre commande est en préparation - ${commande.numeroCommande}`;
        emailContent = `
          <h2>Votre commande est en cours de fabrication</h2>
          <p>Bonjour ${commande.client.prenom || commande.client.nom},</p>
          <p>Bonne nouvelle ! Nous avons commencé la fabrication de votre commande <strong>${commande.numeroCommande}</strong>.</p>
          <p>Chaque pièce est faite à la main avec amour. Vous recevrez un email dès qu'elle sera prête à être expédiée.</p>
        `;
      } else if (statut === "expediee") {
        emailSubject = `Votre commande est en route ! - ${commande.numeroCommande}`;
        emailContent = `
          <h2>Votre commande a été expédiée !</h2>
          <p>Bonjour ${commande.client.prenom || commande.client.nom},</p>
          <p>Excellente nouvelle ! Votre commande <strong>${commande.numeroCommande}</strong> est maintenant en route vers vous.</p>
          ${commande.transporteur ? `<p><strong>Transporteur :</strong> ${commande.transporteur}</p>` : ""}
          ${commande.numeroSuivi ? `<p><strong>Numéro de suivi :</strong> ${commande.numeroSuivi}</p>` : ""}
          <p><strong>Adresse de livraison :</strong><br>
          ${commande.client.nom}<br>
          ${commande.client.adresse.ligne1}<br>
          ${commande.client.adresse.ligne2 ? `${commande.client.adresse.ligne2}<br>` : ""}
          ${commande.client.adresse.ville}, ${commande.client.adresse.province} ${commande.client.adresse.codePostal}</p>
        `;
      } else if (statut === "livree") {
        emailSubject = `Commande livrée - ${commande.numeroCommande}`;
        emailContent = `
          <h2>Votre commande a été livrée !</h2>
          <p>Bonjour ${commande.client.prenom || commande.client.nom},</p>
          <p>Votre commande <strong>${commande.numeroCommande}</strong> a été livrée.</p>
          <p>Nous espérons que vos créations vous plairont ! N'hésitez pas à nous laisser un avis.</p>
          <p>Merci d'avoir choisi MToi Créations.</p>
        `;
      }

      if (emailSubject && emailContent) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8B4557; margin: 0; font-size: 28px;">MToi Créations</h1>
            </div>
            <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              ${emailContent}
            </div>
            <div style="text-align: center; color: #6B6B6B; font-size: 14px; margin-top: 32px;">
              <p>Des questions ? Répondez directement à cet email.</p>
              <p><strong>MToi Créations</strong><br>Créations artisanales faites avec soin et passion</p>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.com>",
          to: commande.client.email,
          subject: emailSubject,
          html: emailHtml,
        });
      }
    }

    return NextResponse.json({
      success: true,
      commande,
      message: envoyerEmail ? "Statut mis à jour et email envoyé" : "Statut mis à jour"
    });
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
