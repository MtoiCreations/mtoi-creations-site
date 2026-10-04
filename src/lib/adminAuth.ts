import type { NextRequest } from "next/server";

// Vérification unique du mot de passe admin, partagée par toutes les routes admin.
// Jeton attendu : en-tête « Authorization: Bearer <ADMIN_PASSWORD> ».
//
// Refuse l'accès (false) si ADMIN_PASSWORD est absent ou vide : sans cette garde,
// une requête sans en-tête serait comparée à `undefined` et acceptée.
export function verifierAdmin(request: NextRequest): boolean {
  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) return false;

  const recu = request.headers.get("authorization")?.replace("Bearer ", "");
  return recu === attendu;
}
