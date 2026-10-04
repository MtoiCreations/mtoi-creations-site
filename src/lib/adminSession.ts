// Session admin côté navigateur : le mot de passe est conservé dans sessionStorage
// (« adminAuth ») et joint à chaque requête. Un changement de connexion dans la page
// est signalé au gabarit admin par cet événement, car sessionStorage n'émet aucun
// événement dans l'onglet qui l'a modifié.
export const ADMIN_AUTH_KEY = "adminAuth";
export const ADMIN_AUTH_EVENT = "adminAuthChange";

export function signalerChangementAuthAdmin() {
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
}
