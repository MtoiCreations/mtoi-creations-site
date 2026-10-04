# Suivi de la refonte visuelle

Liste de ce qui reste à aligner sur `DIRECTION-VISUELLE.md`, à traiter dans la
session dédiée à chaque page concernée plutôt qu'en modifiant des classes
partagées en dehors du périmètre d'une session en cours.

## Suivi technique — migration Supabase et infrastructure

Distinct du suivi de refonte visuelle ci-dessous : ceci concerne la migration
du stockage des commandes vers Supabase et la configuration des
courriels/domaine, pas `DIRECTION-VISUELLE.md`.

### Fait le 19 septembre 2026
- Migration Supabase des commandes, étape 3 (2 routes sur 4) :
  `/api/commandes` (GET+POST) et `/api/commandes/[id]` (GET+PATCH)
  utilisent maintenant `src/lib/commandes.ts` au lieu de
  `data/commandes.json`. Logique d'envoi des courriels non touchée.
  Restent sur le fichier : `/api/checkout` et `/api/admin`.
- Domaine `mtoicreations.com` vérifié dans Resend.
- Adresses courriel unifiées dans les 5 gabarits (`api/admin`,
  `api/checkout`, `api/commandes`, `api/commandes/[id]`,
  `api/contact`) : expéditeur `commandes@mtoicreations.com`,
  destinataires `mtoicreations@hotmail.com` (vraie boîte de
  réception) via une nouvelle variable `ORDERS_NOTIFICATION_EMAIL`,
  qui remplace `INTERAC_EMAIL`.
- Domaine `.ca` → `.com` corrigé partout (9 occurrences codées en
  dur) : `layout.tsx` (metadataBase, openGraph, données structurées),
  `sitemap.ts`, `robots.ts`, `MODIFIER-INFORMATIONS.md`, `README.md`.
  Le `.ca` n'a jamais été possédé — seul `.com` est enregistré.
- Variable orpheline `NEXT_PUBLIC_INTERAC_EMAIL` retirée du README
  (jamais lue par le code, vérifié par recherche dans tout le projet).

### À faire, hors code (variables d'environnement Netlify)
- `EMAIL_FROM` → `MToi Créations <commandes@mtoicreations.com>`
- Créer `ORDERS_NOTIFICATION_EMAIL` → `mtoicreations@hotmail.com`
- Supprimer `INTERAC_EMAIL`
- `NEXT_PUBLIC_SITE_URL` → `https://mtoicreations.com` (contrôle entre
  autres l'URL de redirection Stripe après paiement)

### Fait depuis le 19 septembre
- **Stripe fonctionne de nouveau en production** : la page de paiement
  s'affiche. Le 500 venait de `/api/checkout`, qui écrivait la commande
  dans `data/commandes.json` (système de fichiers en lecture seule sur
  Netlify) avant même d'appeler Stripe.
- `/api/checkout` écrit maintenant dans Supabase (`creerCommande`).
- **Recalcul des prix côté serveur** dans `/api/checkout` : prix,
  livraison et total viennent du catalogue Supabase (sans repli sur
  `produits.json`), jamais du navigateur. Quantités (1 à 99), stock,
  options choisies et réglage « commandes sur mesure » validés ; tout
  écart donne un 409 sans commande ni session Stripe, et la page de
  commande resynchronise le panier. Règles tarifaires dans
  `src/lib/tarifs.ts`.
- Bogue de nommage corrigé : la couleur, la taille, la variante et les
  accessoires choisis sont enregistrés (commande, courriel, description
  Stripe).
- `POST /api/commandes` supprimé (non authentifié, plus appelé par le
  site). `GET` et `PATCH` conservés pour l'admin.
- `POST /api/settings` exige maintenant le mot de passe admin ; la page
  `/admin` envoie le jeton.
- `INTERAC_EMAIL` remplacé par `ORDERS_NOTIFICATION_EMAIL` dans le
  README et `MODIFIER-INFORMATIONS.md`.
- **Authentification admin centralisée** : la fonction `verifierAdmin()`
  de `src/lib/adminAuth.ts` remplace les copies du contrôle dans les 9
  routes protégées. Elle refuse l'accès si `ADMIN_PASSWORD` est absent ou
  vide (avant, une requête sans en-tête était comparée à `undefined` et
  acceptée si la variable n'était pas définie). Inventaire des routes
  fait : aucune route d'écriture n'est sans protection ; les routes
  publiques voulues sont `GET /api/produits`, `GET /api/settings`,
  `POST /api/checkout` et `POST /api/contact`.

### Prochain point de reprise
**Webhook Stripe** (plan rédigé, à confirmer avant de coder). Problème
actuel : `/api/checkout` enregistre la commande avec le statut `payee` et
envoie les courriels *avant* que la cliente paie ; fermer la page Stripe
sans payer laisse donc une fausse commande « payée ». Le webhook doit :
créer la commande en `en_attente`, la passer à `payee` sur
`checkout.session.completed`, envoyer les courriels à ce moment,
décrémenter le stock, et annuler sur `checkout.session.expired`. Ordre de
déploiement sûr : webhook et `STRIPE_WEBHOOK_SECRET` d'abord, puis le
changement de `/api/checkout`.

Ensuite : migrer `/api/admin` vers Supabase (dernière route sur
`data/commandes.json`), puis les sessions visuelles I, E, F et G.

Hors code (Supabase et Netlify) : supprimer dans la table `commandes` les
fausses commandes `payee` créées pendant les essais, et confirmer que les
variables Netlify de la liste ci-dessus sont à jour.

## État au 8 septembre 2026

### Terminé
- Jetons de couleur et polices dans `tailwind.config.ts`
- Session A : `globals.css`, Header, Footer (structure seulement), retrait
  du logo animé et de `LogoIntroOverlay`, retrait du store
  `logoIntroStore`
- Agrandissement du logo (112px desktop, 76,5px mobile)
- Correction de l'orthographe Pochette Fid'Elle
- Session B : page d'accueil, héros sans image de fond, nouvelle
  composition asymétrique, bouton `safran` unique
- Réécriture complète des textes de la page d'accueil et du footer,
  passage au tutoiement
- Retrait du bloc de citation auto-attribuée
- Session C : `CategoryCard.tsx` et `ProductCard.tsx` migrés vers la
  palette du devis, cadrage 4:5, grille asymétrique avec un produit
  vedette sur deux colonnes (page d'accueil)
- Session H : `boutique/page.tsx`, `boutique/[categorie]/page.tsx`,
  `boutique/[categorie]/[sousCategorie]/page.tsx` migrées vers la
  palette et l'échelle du devis, produit vedette sur deux colonnes.
  Page produit non touchée (hors périmètre de cette session).
- Session D : page produit (`produit/[id]/ProduitClient.tsx`,
  `ProductGallery.tsx`, `ProductDimensions.tsx`, `ProductReviews.tsx`)
  migrée vers la palette et l'échelle du devis, galerie 4:5 sans
  recadrage, un seul bouton principal (`safran`), disponibilité en
  texte discret, tutoiement complet. Panier et tunnel de commande non
  touchés (hors périmètre de cette session) — voir Session I.
- Alerte de sécurité RLS Supabase (table `produits`) : réglée.
  Écriture restreinte au seul rôle `service_role`, lecture publique
  conservée pour `anon`, politique de lecture en double supprimée.
- Bug d'affichage des produits dans `/admin` : la table `produits`
  avait perdu son `GRANT` pour `service_role` (indépendant du RLS —
  Postgres vérifie les privilèges de table avant les politiques).
  Corrigé par `GRANT SELECT, INSERT, UPDATE, DELETE ON produits TO
  service_role`.

### À faire, par ordre de priorité

1. **Session I — Panier et tunnel de commande**
   `panier/page.tsx`, `commande/page.tsx`, `confirmation/page.tsx`,
   `CartItem.tsx`, `QuantitySelector.tsx` (partagé avec la page produit —
   vérifier son rendu là aussi), `Button.tsx` (partagé partout — encore
   sur l'ancienne palette). **C'est le prochain point de reprise.**

2. **Session E — Pages admin**
   Environ 260 occurrences. Remplacement mécanique, aucun jugement
   esthétique requis.

3. **Session F — Couleurs du footer**
   Jetons `bg-primary`, `text-white`, `text-cream`, `text-accent`.
   **Inclut aussi le logo du footer** : la Session H voulait remplacer
   le texte "MToi Créations" par `public/images/logo.png`, mais ce
   fichier est en noir pur sur fond transparent (vérifié par lecture de
   pixels), illisible sur le fond sombre actuel du footer (`#3B1526`,
   contraste ≈ 1,1:1). Aucune variante claire n'existe. À décider ici :
   soit une variante claire du logo, soit un fond de footer plus clair,
   soit garder le texte.

4. **Session G — Gabarits de courriels**
   Environ 79 valeurs hex codées en dur dans `api/admin`,
   `api/checkout`, `api/commandes`, `api/commandes/[id]`, `api/contact`

### En attente, hors code
- Photos de produits : format 4:5, fond `#F4EFF2`, une photo catalogue
  et deux photos de contexte par produit. Téléversement par le panneau
  `/admin`, qui gère Cloudinary. Compte Canva gratuit sans suppression
  d'arrière-plan : utiliser Adobe Firefly ou photographier sur fond uni.
- Tutoiement à propager sur les autres pages et dans les gabarits de
  courriels.
- Navigation à repenser : Boutique, Hygiène féminine et Soins et
  Confort se chevauchent.
- Stockage des commandes : migré vers Supabase (table `commandes`, RLS
  fermé, accès par `src/lib/commandes.ts`) pour `/api/commandes`,
  `/api/commandes/[id]` et `/api/checkout`. Seule `/api/admin` lit encore
  `data/commandes.json` (voir « Migration de `/api/admin` » plus bas).
- **Descriptions de produits** : les descriptions actuelles sont
  génériques et interchangeables. Objectif : ajouter une phrase
  personnelle à chaque produit, sans tout réécrire.

  Structure visée :
  - Une phrase sur le tissu ou son origine
  - Deux lignes factuelles : matière, dimensions, entretien
  - Une phrase sur la quantité disponible

  Approche : commencer par les cinq meilleurs vendeurs, mesurer l'effet
  avant d'étendre au reste du catalogue.

  À faire depuis le panneau admin, aucune session de code requise.
- **Panier périmé** : le panier est conservé dans `localStorage` avec une
  copie complète du produit, prix inclus, sans date d'expiration. Une
  cliente qui revient après plusieurs semaines verra l'ancien prix et
  recevra un refus 409 à la caisse. Pistes : ajouter une date
  d'expiration au panier, ou resynchroniser les prix à l'ouverture de la
  page panier.
- **Webhook Stripe** : à faire après le recalcul des prix. Plan déjà
  rédigé. Inclut la décrémentation du stock au passage à `payee`.
- **Remboursements et litiges** : `charge.refunded` n'est pas traité.
  Annulation manuelle pour l'instant.
- **Bouton « Marquer payée » dans l'admin** : s'affiche sur toute commande
  `en_attente` sans distinguer Stripe d'Interac. Risque de marquer payée
  une commande non réglée.
- **Migration de `/api/admin` vers Supabase** : lit encore
  `data/commandes.json`.
- **Échappement HTML des données client dans les gabarits de courriels** :
  le prénom, le nom, l'adresse et la note de la cliente sont insérés tels
  quels dans le HTML des courriels (`api/checkout`, `api/commandes/[id]`,
  `api/admin`, `api/contact`). À échapper (`&`, `<`, `>`, `"`, `'`) avant
  l'insertion, pour qu'un texte saisi ne puisse pas injecter du HTML dans
  un courriel envoyé depuis le domaine.
- **Comparaison du mot de passe admin** : `verifierAdmin()` compare avec
  `===` (pas en temps constant) et rien ne limite le nombre d'essais sur
  les routes admin. Faible risque avec un mot de passe long. Pistes :
  `crypto.timingSafeEqual` et une limitation de tentatives par adresse IP.
- **Abus possible de `POST /api/contact`** : le formulaire envoie une
  confirmation à l'adresse saisie, sans limitation de fréquence ni
  vérification. Quelqu'un peut s'en servir pour inonder une adresse
  tierce depuis le domaine `mtoicreations.com` (risque pour la réputation
  d'envoi dans Resend). Pistes : limitation de fréquence, champ piège
  (honeypot) ou CAPTCHA, et retirer le courriel de confirmation envoyé au
  tiers.
- **Pas de limitation de fréquence sur `POST /api/checkout`** : chaque
  appel valide crée une commande en base, une session Stripe et envoie
  des courriels à l'adresse saisie. À traiter avec le webhook (les
  commandes `en_attente` abandonnées s'accumulent déjà) : limitation par
  adresse IP et nettoyage des commandes expirées.
- **Erreurs d'hydratation dans `Header.tsx`** : la console signale une
  différence entre le HTML serveur et le rendu client (un `span` dans un
  `a`, via le logo). Non investiguée ; sans lien avec les commandes. À
  corriger lors de la session F (pied de page et logo) ou avant.

## Classes partagées hors échelle d'espacement (`src/app/globals.css`)

L'échelle autorisée par le devis est `8 · 16 · 24 · 40 · 64 · 96 · 160`. Deux
classes utilitaires partagées dans `@layer components` ont des valeurs hors
de cette échelle :

### `.container-custom`
```css
@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
```
`px-4`(16) et `sm:px-6`(24) sont sur l'échelle, mais `lg:px-8`(32) ne l'est
pas — et ne respecte pas non plus la règle explicite du devis (marge
latérale 24px mobile / 64px minimum sur ordinateur).

**Fichiers qui utilisent `.container-custom` :**
- `src/app/page.tsx`
- `src/app/produit/[id]/ProduitClient.tsx`
- `src/app/boutique/page.tsx`
- `src/app/boutique/[categorie]/page.tsx`
- `src/app/boutique/[categorie]/[sousCategorie]/page.tsx`
- `src/app/commande/page.tsx`
- `src/app/confirmation/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/not-found.tsx`
- `src/app/panier/page.tsx`
- `src/app/admin/commandes/page.tsx`

### `.section-padding`
```css
@apply py-12 md:py-16 lg:py-20;
```
`py-12`(48) et `lg:py-20`(80) sont hors échelle ; seul `md:py-16`(64) est
valide.

**Fichiers qui utilisent `.section-padding` :** mêmes que `.container-custom`
ci-dessus, sauf `src/app/page.tsx` (Session B), les 3 pages `boutique/*`
(Session H) et `produit/[id]/ProduitClient.tsx` (Session D), qui utilisent
désormais des classes `py-14 md:py-24` explicites plutôt que
`.section-padding`. Sauf aussi `not-found.tsx`,
`admin/commandes/page.tsx`, `confirmation/page.tsx` et `panier/page.tsx`
(à revérifier au cas par cas lors de leur session respective — cette
liste vient d'une recherche par fichier, pas d'un audit ligne par ligne
de chaque usage).

## Composants partagés

### `src/components/CategoryCard.tsx` et `src/components/ProductCard.tsx`
**Migrés en Session C** vers `encre`/`fond`/`safran`/`framboise`/`lichen`,
polices `titre`/`corps`, cadrage 4:5, sans rayon de bordure, sans flèche
`→`. `ProductCard` accepte maintenant une prop `vedette?: boolean` qui lui
fait prendre `sm:col-span-2` dans une grille — utilisée sur la page
d'accueil pour le premier produit de "Dernières pièces". Rendu vérifié
sur `boutique` et `produit/[id]` (pages elles-mêmes non retouchées, voir
Session H ci-dessus) : aucune régression, badges de statut migrés vers
`lichen`/`safran`/`encre` selon l'état.

### `src/components/ProductGallery.tsx`, `ProductDimensions.tsx`, `ProductReviews.tsx`
**Migrés en Session D** — utilisés uniquement par la page produit, donc
traités avec elle. Galerie en 4:5 avec `object-contain` (aucun
recadrage), vignettes sans rayon, flèches/points recolorés. Étoiles des
avis en `safran`, "Achat vérifié" en `lichen`.

### `src/components/QuantitySelector.tsx` et `src/components/Button.tsx`
**Non touchés** — partagés avec le panier (`CartItem.tsx` pour
`QuantitySelector`, à peu près toutes les pages pour `Button`). La page
produit n'utilise plus `Button.tsx` (remplacé par des classes locales
`btnPrimary`/`btnSecondary`/lien `framboise` dans `ProduitClient.tsx`,
même approche qu'aux Sessions B/C/H), mais `QuantitySelector` reste sur
l'ancienne palette (`cream`/`primary`/`secondary`) et se voit donc tel
quel sur la page produit en attendant la Session I.

## Comment traiter ceci

Corriger `.container-custom` / `.section-padding` dans `globals.css`
changerait l'apparence de toutes les pages listées d'un coup, hors du
périmètre d'une session ciblée sur une seule page. À faire plutôt :
1. Lors de la session dédiée à une page de la liste, vérifier son usage réel
   de `.container-custom` / `.section-padding`.
2. Soit ajuster la classe partagée si toutes les pages concernées sont déjà
   passées en revue, soit remplacer localement par des classes explicites
   conformes à l'échelle si la page a des besoins différents.
3. Rayer la page de cette liste une fois traitée.

## Historique

- 2026-09-07 — Session A (Header/Footer) : logo animé retiré, dégradé du
  header remplacé par un aplat `fond` + séparateur pointillé, 5 hex de
  `globals.css` remplacés par des jetons, focus clavier vérifié
  (`framboise`). Classes partagées ci-dessus repérées mais non touchées.
- 2026-09-07 — Session B (page d'accueil) : héros recomposé en grille
  asymétrique sur `surface`, un seul bouton `safran` + un lien `framboise`
  souligné, polices `titre`/`corps` et échelle d'espacement appliquées,
  3 séparateurs pointillés max, étiquettes en majuscules et animations de
  fondu retirées. `CategoryCard.tsx`/`ProductCard.tsx` non touchés (voir
  section ci-dessus) — reportés à la Session C.
- 2026-09-13 — Session C (catalogue) : `CategoryCard.tsx` et
  `ProductCard.tsx` migrés vers la palette du devis, cadrage 4:5,
  suppression du rayon de bordure et de la flèche `→`, badges de statut
  recolorés (`lichen`/`safran`/`encre`). Grille asymétrique ajoutée sur
  la page d'accueil via une prop `vedette` (premier produit sur 2
  colonnes). Vérifié sans régression sur `boutique` et `produit/[id]`.
- 2026-09-13 — Session H (`boutique/*`) : les 3 pages migrées vers la
  palette et l'échelle du devis (titres à gauche, `py-14 md:py-24`,
  filtres `lichen`/`safran` à rayon 4px, étiquette de sous-catégorie
  décapitalisée), produit vedette sur 2 colonnes. Vérifié en mobile
  375px. Tentative de remplacement du texte du footer par le logo
  reportée à la Session F : `logo.png` est en noir pur sur fond
  transparent, illisible sur le fond sombre actuel du footer.
- 2026-09-13 — Session D (page produit) : `ProduitClient.tsx` recomposé
  en grille asymétrique `lg:grid-cols-12` (galerie 7 colonnes,
  informations 5), galerie migrée vers 4:5 sans recadrage, un seul
  bouton principal `safran` ("Ajouter au panier"), "Commander
  maintenant" en lien `framboise` souligné sous le bouton, sélecteurs
  de variante en bordure `encre/25%`/actif `framboise`, disponibilité
  en texte discret `encre/65%` sans icône ni pastille. Tutoiement
  complet (message d'erreur, état "commandes suspendues", modal de
  confirmation). Focus clavier `framboise` vérifié, aucun débordement
  mobile 375px. Panier et tunnel de commande non touchés — reportés à
  la Session I.
