import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const COMMANDES_FILE = path.join(process.cwd(), "data", "commandes.json");

interface CartItem {
  produit: {
    id: string;
    nom: string;
    prix: number;
    photos: string[];
  };
  quantite: number;
  couleur?: string;
  taille?: string;
  variante?: {
    nom: string;
  };
}

interface CheckoutRequest {
  items: CartItem[];
  clientInfo: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    codePostal: string;
    province: string;
  };
  livraison: number;
  note?: string;
}

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

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MT${year}${month}${day}-${random}`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price);
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, clientInfo, livraison, note } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      );
    }

    const numeroCommande = generateOrderNumber();
    const sousTotal = items.reduce((acc, item) => acc + item.produit.prix * item.quantite, 0);
    const total = sousTotal + livraison;

    const commande = {
      id: uuidv4(),
      numeroCommande,
      dateCreation: new Date().toISOString(),
      client: {
        prenom: clientInfo.prenom,
        nom: clientInfo.nom,
        email: clientInfo.email,
        telephone: clientInfo.telephone,
        adresse: {
          ligne1: clientInfo.adresse,
          ligne2: "",
          ville: clientInfo.ville,
          province: clientInfo.province,
          codePostal: clientInfo.codePostal,
        },
      },
      articles: items.map(item => ({
        produit: item.produit,
        quantite: item.quantite,
        couleur: item.couleur,
        variante: item.variante,
      })),
      sousTotal,
      fraisLivraison: livraison,
      total,
      note: note || "",
      statut: "payee",
      paiementStripe: true,
    };

    const commandes = await getCommandes();
    commandes.push(commande);
    await saveCommandes(commandes);

    const lineItems = items.map((item) => {
      let description = '';
      if (item.variante?.nom) {
        description = item.variante.nom;
      } else if (item.couleur) {
        description = item.couleur;
      }
      if (item.taille) {
        description += description ? ` - ${item.taille}` : item.taille;
      }

      return {
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.produit.nom,
            description: description || undefined,
            images: item.produit.photos.length > 0 ? [item.produit.photos[0]] : undefined,
          },
          unit_amount: Math.round(item.produit.prix * 100),
        },
        quantity: item.quantite,
      };
    });

    if (livraison > 0) {
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Frais de livraison',
            description: undefined,
            images: undefined,
          },
          unit_amount: Math.round(livraison * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/panier`,
      customer_email: clientInfo.email,
      metadata: {
        commande_id: commande.id,
        numero_commande: numeroCommande,
      },
      locale: 'fr-CA',
    });

    const articlesHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #E8E0D8;">
              ${item.produit.nom}
              ${item.variante?.nom ? `<br><small style="color: #6B6B6B;">${item.variante.nom}</small>` : ""}
              ${item.couleur ? `<br><small style="color: #6B6B6B;">Couleur: ${item.couleur}</small>` : ""}
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

        <div style="background: #D4EDDA; border: 1px solid #28A745; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0; color: #155724; font-weight: bold;">
            Paiement confirmé !
          </p>
        </div>

        <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="margin-top: 0; color: #1A1A1A;">Commande ${numeroCommande}</h2>
          <p style="margin-bottom: 0; color: #6B6B6B;">
            Date : ${new Date().toLocaleDateString("fr-CA", { dateStyle: "long" })}
          </p>
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
              <span>${formatPrice(sousTotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Livraison</span>
              <span>${livraison === 0 ? "Gratuite" : formatPrice(livraison)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #8B4557;">
              <span>Total</span>
              <span>${formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Adresse de livraison</h3>
          <p style="margin: 0;">
            ${clientInfo.prenom} ${clientInfo.nom}<br>
            ${clientInfo.adresse}<br>
            ${clientInfo.ville}, ${clientInfo.province} ${clientInfo.codePostal}
          </p>
        </div>

        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Prochaines étapes</h3>
          <ol style="margin: 0; padding-left: 20px; color: #6B6B6B;">
            <li style="margin-bottom: 8px;">Nous allons préparer votre commande avec soin</li>
            <li style="margin-bottom: 8px;">Vous recevrez un email lorsqu'elle sera expédiée</li>
            <li>Le numéro de suivi vous sera communiqué par email</li>
          </ol>
        </div>

        ${note ? `
        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Note</h3>
          <p style="margin: 0; color: #6B6B6B;">${note}</p>
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
        from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.com>",
        to: clientInfo.email,
        subject: `Confirmation de commande ${numeroCommande}`,
        html: emailHtml,
      });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.com>",
        to: process.env.INTERAC_EMAIL || "admin@mtoicreations.com",
        subject: `Nouvelle commande payée ${numeroCommande}`,
        html: `<p>Nouvelle commande payée par carte !</p>
               <p>Numéro : ${numeroCommande}</p>
               <p>Client : ${clientInfo.prenom} ${clientInfo.nom} (${clientInfo.email})</p>
               <p>Total : ${formatPrice(total)}</p>
               <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/commandes">Voir les commandes</a></p>`,
      });
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
