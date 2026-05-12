import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

const COMMANDES_FILE = path.join(process.cwd(), "data", "commandes.json");

async function getCommandes() {
  try {
    const data = await fs.readFile(COMMANDES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCommandes(commandes: unknown[]) {
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const password = authHeader?.replace("Bearer ", "");

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "login") {
      return NextResponse.json({ success: true });
    }

    if (action === "getCommandes") {
      const commandes = await getCommandes();
      return NextResponse.json(commandes);
    }

    if (action === "updateStatut") {
      const { commandeId, nouveauStatut } = body;

      const commandes = await getCommandes();
      const commandeIndex = commandes.findIndex((c: { id: string }) => c.id === commandeId);

      if (commandeIndex === -1) {
        return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
      }

      const commande = commandes[commandeIndex];
      commande.statut = nouveauStatut;
      commande.dateModification = new Date().toISOString();

      await saveCommandes(commandes);

      if (nouveauStatut === "payee" && process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.ca>",
          to: commande.client.email,
          subject: `Paiement reçu - Commande ${commande.numeroCommande}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8B4557; margin: 0;">MToi Créations</h1>
              </div>

              <div style="background: #D1FAE5; border: 1px solid #10B981; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <h2 style="color: #065F46; margin: 0;">Paiement reçu !</h2>
              </div>

              <p>Bonjour ${commande.client.nom},</p>

              <p>J'ai bien reçu votre paiement pour la commande <strong>${commande.numeroCommande}</strong>.</p>

              <p>Je vais maintenant préparer votre commande avec soin. Vous recevrez un email dès qu'elle sera expédiée.</p>

              <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin-top: 0;">Récapitulatif</h3>
                <p><strong>Commande :</strong> ${commande.numeroCommande}</p>
                <p><strong>Total payé :</strong> ${formatPrice(commande.total)}</p>
                <p style="margin-bottom: 0;"><strong>Livraison à :</strong><br>
                  ${commande.client.adresse.ligne1}<br>
                  ${commande.client.adresse.ville}, ${commande.client.adresse.province} ${commande.client.adresse.codePostal}
                </p>
              </div>

              <p>Merci pour votre confiance !</p>

              <p style="color: #6B6B6B; margin-top: 32px;">
                <em>Créations artisanales faites avec soin et passion</em>
              </p>
            </body>
            </html>
          `,
        });
      }

      if (nouveauStatut === "annulee" && process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.ca>",
          to: commande.client.email,
          subject: `Commande annulée - ${commande.numeroCommande}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8B4557; margin: 0;">MToi Créations</h1>
              </div>

              <p>Bonjour ${commande.client.nom},</p>

              <p>Votre commande <strong>${commande.numeroCommande}</strong> a été annulée.</p>

              <p>Si vous avez des questions, n'hésitez pas à me contacter.</p>

              <p>À bientôt !</p>

              <p style="color: #6B6B6B; margin-top: 32px;">
                <em>Créations artisanales faites avec soin et passion</em>
              </p>
            </body>
            </html>
          `,
        });
      }

      return NextResponse.json({ success: true, commande });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Erreur admin:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
