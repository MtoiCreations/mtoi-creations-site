import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, email, sujet, message } = body;

    const sujets: Record<string, string> = {
      question: "Question sur un produit",
      personnalisation: "Demande de personnalisation",
      commande: "Question sur ma commande",
      collaboration: "Proposition de collaboration",
      autre: "Autre",
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B4557; margin: 0;">Nouveau message</h1>
          <p style="color: #6B6B6B;">via le formulaire de contact</p>
        </div>

        <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0;"><strong>De :</strong> ${nom}</p>
          <p style="margin: 8px 0;"><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 0;"><strong>Sujet :</strong> ${sujets[sujet] || sujet}</p>
        </div>

        <div style="background: #FFF; border: 1px solid #E8E0D8; border-radius: 12px; padding: 24px;">
          <h3 style="margin-top: 0; color: #1A1A1A;">Message</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: #D4A5A5; border-radius: 8px; text-align: center;">
          <a href="mailto:${email}" style="color: #1A1A1A; font-weight: bold; text-decoration: none;">
            Répondre à ${nom}
          </a>
        </div>
      </body>
      </html>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.ca>",
        to: process.env.INTERAC_EMAIL || "contact@mtoicreations.ca",
        replyTo: email,
        subject: `[Contact] ${sujets[sujet] || sujet} - ${nom}`,
        html: emailHtml,
      });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MToi Créations <noreply@mtoicreations.ca>",
        to: email,
        subject: "Nous avons bien reçu votre message - MToi Créations",
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8B4557; margin: 0;">MToi Créations</h1>
            </div>
            <p>Bonjour ${nom},</p>
            <p>Merci de m'avoir contactée ! J'ai bien reçu votre message et je vous répondrai dans les plus brefs délais (généralement sous 24 à 48 heures).</p>
            <p>À très bientôt !</p>
            <p style="color: #6B6B6B; margin-top: 32px;">
              <em>Créations artisanales faites avec soin et passion</em>
            </p>
          </body>
          </html>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi contact:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
