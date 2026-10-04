import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { creerCommande } from '@/lib/commandes';
import {
  lireProduitsPourCommande,
  accepteCommandesSurMesure,
  CatalogueIndisponibleError,
  ProduitPourCommande,
} from '@/lib/catalogue';
import { enCents, fraisLivraisonCents, QUANTITE_MAX, LIGNES_PANIER_MAX } from '@/lib/tarifs';
import { CartItem as CartItemCommande, ChangementPanier } from '@/types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Ce que le navigateur envoie : des identifiants et des choix, jamais de montants
// qui feraient foi. `prixAffiche` et `totalAffiche` servent uniquement à détecter
// qu'un prix a changé depuis l'ajout au panier.
interface LigneRequete {
  produitId: string;
  quantite: number;
  couleur?: string;
  taille?: string;
  varianteId?: string;
  accessoires: { accessoireId: string; varianteId: string }[];
  prixAffiche: number;
}

interface ClientInfo {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  province: string;
}

// Ligne telle que recalculée par le serveur d'après le catalogue.
interface LigneValidee {
  produit: { id: string; nom: string; prix: number; photo?: string };
  quantite: number;
  couleur?: string;
  taille?: string;
  variante?: { id: string; nom: string };
  accessoires: { accessoire: { id: string; nom: string }; variante: { id: string; nom: string } }[];
}

type Changement = ChangementPanier;

const ID_VALIDE = /^[A-Za-z0-9_.-]{1,100}$/;
const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function texte(valeur: unknown, max: number): string | undefined {
  if (typeof valeur !== 'string') return undefined;
  const nettoye = valeur.trim();
  return nettoye.length > 0 && nettoye.length <= max ? nettoye : undefined;
}

function lireLignes(valeur: unknown): LigneRequete[] | null {
  if (!Array.isArray(valeur) || valeur.length === 0 || valeur.length > LIGNES_PANIER_MAX) return null;

  const lignes: LigneRequete[] = [];
  for (const brut of valeur) {
    if (!brut || typeof brut !== 'object') return null;
    const l = brut as Record<string, unknown>;

    if (typeof l.produitId !== 'string' || !ID_VALIDE.test(l.produitId)) return null;
    if (!Number.isInteger(l.quantite) || (l.quantite as number) < 1 || (l.quantite as number) > QUANTITE_MAX) return null;
    if (typeof l.prixAffiche !== 'number' || !Number.isFinite(l.prixAffiche)) return null;
    if (l.varianteId !== undefined && l.varianteId !== null && (typeof l.varianteId !== 'string' || !ID_VALIDE.test(l.varianteId))) return null;

    const accessoires: LigneRequete['accessoires'] = [];
    if (l.accessoires !== undefined && l.accessoires !== null) {
      if (!Array.isArray(l.accessoires) || l.accessoires.length > 20) return null;
      for (const a of l.accessoires) {
        if (!a || typeof a !== 'object') return null;
        const { accessoireId, varianteId } = a as Record<string, unknown>;
        if (typeof accessoireId !== 'string' || !ID_VALIDE.test(accessoireId)) return null;
        if (typeof varianteId !== 'string' || !ID_VALIDE.test(varianteId)) return null;
        accessoires.push({ accessoireId, varianteId });
      }
    }

    lignes.push({
      produitId: l.produitId,
      quantite: l.quantite as number,
      couleur: texte(l.couleur, 100),
      taille: texte(l.taille, 100),
      varianteId: (l.varianteId as string | undefined) || undefined,
      accessoires,
      prixAffiche: l.prixAffiche,
    });
  }
  return lignes;
}

function lireClient(valeur: unknown): ClientInfo | null {
  if (!valeur || typeof valeur !== 'object') return null;
  const c = valeur as Record<string, unknown>;

  const prenom = texte(c.prenom, 100);
  const nom = texte(c.nom, 100);
  const email = texte(c.email, 200);
  const adresse = texte(c.adresse, 300);
  const ville = texte(c.ville, 100);
  const codePostal = texte(c.codePostal, 10);
  const province = texte(c.province, 5);
  if (!prenom || !nom || !email || !EMAIL_VALIDE.test(email) || !adresse || !ville || !codePostal || !province) {
    return null;
  }
  return { prenom, nom, email, telephone: texte(c.telephone, 30) || '', adresse, ville, codePostal, province };
}

// Confronte chaque ligne au catalogue. Retourne les lignes recalculées et la liste
// des écarts : s'il y en a, rien n'est facturé et la cliente doit confirmer.
async function recalculer(
  lignes: LigneRequete[],
  catalogue: Map<string, ProduitPourCommande>
): Promise<{ validees: LigneValidee[]; changements: Changement[] }> {
  const changements: Changement[] = [];
  const dejaSignale = new Set<string>();
  const signaler = (c: Changement) => {
    const cle = `${c.type}:${c.produitId}`;
    if (dejaSignale.has(cle)) return;
    dejaSignale.add(cle);
    changements.push(c);
  };

  const validees: LigneValidee[] = [];
  const quantiteParProduit = new Map<string, number>();

  for (const ligne of lignes) {
    const p = catalogue.get(ligne.produitId);
    if (!p || p.prixCents <= 0) {
      signaler({
        produitId: ligne.produitId,
        type: 'indisponible',
        message: "Un article de ton panier n'est plus offert.",
      });
      continue;
    }

    // Prix : on facture le prix du catalogue, on signale tout écart.
    if (enCents(ligne.prixAffiche) !== p.prixCents) {
      signaler({
        produitId: p.id,
        type: 'prix',
        nouveauPrix: p.prixCents / 100,
        message: `Le prix de « ${p.nom} » est passé de ${formatPrice(ligne.prixAffiche)} à ${formatPrice(p.prixCents / 100)}.`,
      });
    }

    // Options choisies : elles doivent exister pour ce produit.
    let optionValide = true;

    if (p.couleurs.length > 0 ? !ligne.couleur || !p.couleurs.includes(ligne.couleur) : !!ligne.couleur) optionValide = false;
    if (p.tailles.length > 0 ? !ligne.taille || !p.tailles.includes(ligne.taille) : !!ligne.taille) optionValide = false;

    const variante = ligne.varianteId ? p.variantes.find((v) => v.id === ligne.varianteId) : undefined;
    if (p.variantes.length > 0 ? !variante : !!ligne.varianteId) optionValide = false;

    const accessoires: LigneValidee['accessoires'] = [];
    const accessoiresVus = new Set<string>();
    for (const choix of ligne.accessoires) {
      const accessoire = p.accessoires.find((a) => a.id === choix.accessoireId);
      const varianteAccessoire = accessoire?.variantes.find((v) => v.id === choix.varianteId);
      if (!accessoire || !varianteAccessoire || accessoiresVus.has(accessoire.id)) {
        optionValide = false;
        continue;
      }
      accessoiresVus.add(accessoire.id);
      accessoires.push({
        accessoire: { id: accessoire.id, nom: accessoire.nom },
        variante: { id: varianteAccessoire.id, nom: varianteAccessoire.nom },
      });
    }
    if (p.accessoires.some((a) => a.obligatoire && !accessoiresVus.has(a.id))) optionValide = false;

    if (!optionValide) {
      signaler({
        produitId: p.id,
        type: 'option_invalide',
        message: `Une option choisie pour « ${p.nom} » n'est plus offerte. Ajoute de nouveau l'article à ton panier.`,
      });
      continue;
    }

    quantiteParProduit.set(p.id, (quantiteParProduit.get(p.id) || 0) + ligne.quantite);

    validees.push({
      produit: { id: p.id, nom: p.nom, prix: p.prixCents / 100, photo: p.photo },
      quantite: ligne.quantite,
      couleur: ligne.couleur,
      taille: ligne.taille,
      variante,
      accessoires,
    });
  }

  // Stock : la quantité de toutes les lignes d'un même produit est additionnée.
  let surMesureAccepte: boolean | undefined;
  for (const [produitId, quantite] of Array.from(quantiteParProduit.entries())) {
    const p = catalogue.get(produitId)!;

    if (!p.surCommande) {
      if (p.quantiteDisponible <= 0) {
        signaler({ produitId, type: 'epuise', message: `« ${p.nom} » n'est plus en stock.` });
      } else if (quantite > p.quantiteDisponible) {
        signaler({
          produitId,
          type: 'stock_insuffisant',
          quantiteMax: p.quantiteDisponible,
          message: `Il ne reste que ${p.quantiteDisponible} exemplaire${p.quantiteDisponible > 1 ? 's' : ''} de « ${p.nom} ».`,
        });
      }
    } else if (p.quantiteDisponible <= 0) {
      // Produit offert uniquement sur commande : le réglage global peut le fermer.
      if (surMesureAccepte === undefined) surMesureAccepte = await accepteCommandesSurMesure();
      if (!surMesureAccepte) {
        signaler({
          produitId,
          type: 'sur_mesure_ferme',
          message: `Les commandes sur mesure sont fermées pour le moment : « ${p.nom} » n'est pas offert.`,
        });
      }
    }
  }

  return { validees, changements };
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }

    const corps = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

    if (Array.isArray(corps.items) && corps.items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    const lignes = lireLignes(corps.items);
    const clientInfo = lireClient(corps.clientInfo);
    const note = corps.note === undefined || corps.note === null || corps.note === '' ? '' : texte(corps.note, 1000);
    const totalAffiche = corps.totalAffiche;

    if (!lignes || !clientInfo || note === undefined || typeof totalAffiche !== 'number' || !Number.isFinite(totalAffiche)) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }

    // Tout ce qui suit repose sur le catalogue Supabase, pas sur le navigateur.
    const catalogue = await lireProduitsPourCommande(Array.from(new Set(lignes.map((l) => l.produitId))));
    const { validees: items, changements } = await recalculer(lignes, catalogue);

    const sousTotalCents = items.reduce((acc, item) => acc + enCents(item.produit.prix) * item.quantite, 0);
    const livraisonCents = fraisLivraisonCents(sousTotalCents);
    const totalCents = sousTotalCents + livraisonCents;

    // Aucun écart de ligne, mais un total différent (ex. seuil de livraison gratuite franchi).
    if (changements.length === 0 && enCents(totalAffiche) !== totalCents) {
      changements.push({
        produitId: '',
        type: 'total',
        message: `Le total de ta commande a changé : il est maintenant de ${formatPrice(totalCents / 100)}.`,
      });
    }

    if (changements.length > 0) {
      return NextResponse.json(
        {
          code: 'PANIER_MODIFIE',
          error: 'Ton panier a changé depuis ton dernier passage. Vérifie-le avant de continuer.',
          changements,
        },
        { status: 409 }
      );
    }

    const sousTotal = sousTotalCents / 100;
    const livraison = livraisonCents / 100;
    const total = totalCents / 100;

    const numeroCommande = generateOrderNumber();

    const commande = await creerCommande({
      numeroCommande,
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
      // Mêmes noms de champs que CartItem (couleurSelectionnee, varianteSelectionnee…),
      // avec un instantané réduit du produit au prix facturé.
      articles: items.map(item => ({
        produit: {
          id: item.produit.id,
          nom: item.produit.nom,
          prix: item.produit.prix,
          devise: 'CAD',
          photos: item.produit.photo ? [item.produit.photo] : [],
        },
        quantite: item.quantite,
        couleurSelectionnee: item.couleur,
        tailleSelectionnee: item.taille,
        varianteSelectionnee: item.variante,
        accessoiresSelectionnes: item.accessoires.length > 0 ? item.accessoires : undefined,
      })) as unknown as CartItemCommande[],
      sousTotal,
      fraisLivraison: livraison,
      total,
      note: note || "",
      statut: "payee",
      paiementStripe: true,
    });

    const lineItems = items.map((item) => {
      const parties: string[] = [];
      if (item.variante?.nom) {
        parties.push(item.variante.nom);
      } else if (item.couleur) {
        parties.push(item.couleur);
      }
      if (item.taille) parties.push(item.taille);
      for (const a of item.accessoires) parties.push(`${a.accessoire.nom} : ${a.variante.nom}`);
      const description = parties.join(' - ');

      return {
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.produit.nom,
            description: description || undefined,
            images: item.produit.photo && item.produit.photo.startsWith('http') ? [item.produit.photo] : undefined,
          },
          unit_amount: enCents(item.produit.prix),
        },
        quantity: item.quantite,
      };
    });

    if (livraisonCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Frais de livraison',
            description: undefined,
            images: undefined,
          },
          unit_amount: livraisonCents,
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
              ${item.taille ? `<br><small style="color: #6B6B6B;">Taille: ${item.taille}</small>` : ""}
              ${item.accessoires.map((a) => `<br><small style="color: #6B6B6B;">${a.accessoire.nom}: ${a.variante.nom}</small>`).join("")}
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
        from: process.env.EMAIL_FROM || "MToi Créations <commandes@mtoicreations.com>",
        to: clientInfo.email,
        subject: `Confirmation de commande ${numeroCommande}`,
        html: emailHtml,
      });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MToi Créations <commandes@mtoicreations.com>",
        to: process.env.ORDERS_NOTIFICATION_EMAIL || "mtoicreations@hotmail.com",
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
    if (error instanceof CatalogueIndisponibleError) {
      console.error('Catalogue indisponible:', error);
      return NextResponse.json(
        { error: 'Le catalogue est momentanément indisponible. Réessaie dans quelques instants.' },
        { status: 503 }
      );
    }
    console.error('Erreur Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
