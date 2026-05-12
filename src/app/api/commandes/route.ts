import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
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
    const body = await request.json();

    const commande = {
      id: uuidv4(),
      numeroCommande: body.numeroCommande,
      dateCreation: new Date().toISOString(),
      client: body.client,
      articles: body.articles,
      sousTotal: body.sousTotal,
      fraisLivraison: body.fraisLivraison,
      total: body.total,
      note: body.note,
      statut: "en_attente",
    };

    const commandes = await getCommandes();
    commandes.push(commande);
    await saveCommandes(commandes);

    const interacEmail = process.env.INTERAC_EMAIL || "paiement@mtoicreations.ca";

    const articlesHtml = commande.articles
      .map(
        (item: { produit: { nom: string; prix: number }; quantite: number; couleurSelectionnee?: string }) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #E8E0D8;">
              ${item.produit.nom}
              ${item.couleurSelectionnee ? `<br><small style="color: #6B6B6B;">Couleur: ${item.couleurSelectionnee}</small>` : ""}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #E8E0D8; text-align: center;">${item.quantite}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E8E0D8; text-align: right;">${formatPrice(item.produit.prix * item.quantite)}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B4557; margin: 0; font-size: 28px;">MToi Créations</h1>
          <p style="color: #6B6B6B; margin-top: 5px;">Merci pour votre commande !</p>
        </div>

        <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="margin-top: 0; color: #1A1A1A;">Commande ${commande.numeroCommande}</h2>
          <p style="margin-bottom: 0; color: #6B6B6B;">
            Date : ${new Date(commande.dateCreation).toLocaleDateString("fr-CA", { dateStyle: "long" })}
          </p>
        </div>

        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #8B4557;">Instructions de paiement</h3>

          <p><strong>1.</strong> Ouvrez votre application bancaire</p>
          <p><strong>2.</strong> Envoyez un Virement Interac de <strong style="color: #8B4557; font-size: 20px;">${formatPrice(commande.total)}</strong></p>
          <p><strong>3.</strong> À l'adresse : <strong style="font-family: monospace; background: #F5F0EB; padding: 4px 8px; border-radius: 4px;">${interacEmail}</strong></p>
          <p><strong>4.</strong> Inscrivez le numéro de commande dans la note : <strong style="font-family: monospace; background: #F5F0EB; padding: 4px 8px; border-radius: 4px;">${commande.numeroCommande}</strong></p>

          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <p style="margin: 0; color: #92400E;">
              <strong>Important :</strong> Votre commande sera confirmée dès réception du virement.
              Vous recevrez un email de confirmation sous 24h.
            </p>
          </div>
        </div>

        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Récapitulatif de votre commande</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F5F0EB;">
                <th style="padding: 12px; text-align: left;">Produit</th>
                <th style="padding: 12px; text-align: center;">Qté</th>
                <th style="padding: 12px; text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${articlesHtml}
            </tbody>
          </table>

          <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #E8E0D8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Sous-total</span>
              <span>${formatPrice(commande.sousTotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Livraison</span>
              <span>${commande.fraisLivraison === 0 ? "Gratuite" : formatPrice(commande.fraisLivraison)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #8B4557;">
              <span>Total</span>
              <span>${formatPrice(commande.total)}</span>
            </div>
          </div>
        </div>

        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Adresse de livraison</h3>
          <p style="margin: 0;">
            ${commande.client.nom}<br>
            ${commande.client.adresse.ligne1}<br>
            ${commande.client.adresse.ligne2 ? `${commande.client.adresse.ligne2}<br>` : ""}
            ${commande.client.adresse.ville}, ${commande.client.adresse.province} ${commande.client.adresse.codePostal}
          </p>
        </div>

        ${commande.note ? `
        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Note</h3>
          <p style="margin: 0; color: #6B6B6B;">${commande.note}</p>
        </div>
        ` : ""}

        <div style="text-align: center; color: #6B6B6B; font-size: 14px; margin-top: 32px;">
          <p>Des questions ? Répondez directement à cet email.</p>
          <p style="margin-top: 16px;">
            <strong>MToi Créations</strong><br>
            Créations artisanales faites avec soin et passion
          </p>
        </div>
      </body>
      </html>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.ca>",
        to: commande.client.email,
        subject: `Commande ${commande.numeroCommande} - Instructions de paiement`,
        html: emailHtml,
      });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.ca>",
        to: process.env.INTERAC_EMAIL || "admin@mtoicreations.ca",
        subject: `Nouvelle commande ${commande.numeroCommande}`,
        html: `<p>Nouvelle commande reçue !</p><p>Numéro : ${commande.numeroCommande}</p><p>Client : ${commande.client.nom} (${commande.client.email})</p><p>Total : ${formatPrice(commande.total)}</p>`,
      });
    }

    return NextResponse.json({ success: true, numeroCommande: commande.numeroCommande });
  } catch (error) {
    console.error("Erreur création commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const commandes = await getCommandes();
    return NextResponse.json(commandes);
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
