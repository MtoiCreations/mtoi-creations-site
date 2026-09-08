# Suivi de la refonte visuelle

Liste de ce qui reste à aligner sur `DIRECTION-VISUELLE.md`, à traiter dans la
session dédiée à chaque page concernée plutôt qu'en modifiant des classes
partagées en dehors du périmètre d'une session en cours.

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

### À faire, par ordre de priorité

1. **Session C — Catalogue**
   Fichiers : `CategoryCard.tsx`, `ProductCard.tsx`
   Objectif : appliquer la palette du devis, cadrage 4:5 des images,
   grille asymétrique avec un produit vedette sur deux colonnes.
   **C'est le prochain point de reprise.**

2. **Session D — Page produit et tunnel de commande**

3. **Session E — Pages admin**
   Environ 260 occurrences. Remplacement mécanique, aucun jugement
   esthétique requis.

4. **Session F — Couleurs du footer**
   Jetons `bg-primary`, `text-white`, `text-cream`, `text-accent`

5. **Session G — Gabarits de courriels**
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
- Alerte de sécurité RLS sur Supabase, non traitée.
- Stockage des commandes dans `data/commandes.json`, éphémère sur
  Netlify. À migrer vers Supabase.

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
ci-dessus (sauf `src/app/page.tsx`, traité en Session B avec des classes
`py-14 md:py-24` explicites plutôt que `.section-padding`), sauf aussi
`not-found.tsx`, `admin/commandes/page.tsx`, `confirmation/page.tsx` et
`panier/page.tsx` (à revérifier au cas par cas lors de leur session
respective — cette liste vient d'une recherche par fichier, pas d'un audit
ligne par ligne de chaque usage).

## Composants partagés encore sur l'ancienne palette

### `src/components/CategoryCard.tsx` et `src/components/ProductCard.tsx`
Utilisent encore les jetons `cream`/`primary`/`secondary`/`text-*` (voir
l'inventaire de couleurs). Non touchés en Session B car partagés avec
d'autres pages (`boutique`, `produit/[id]`) hors du périmètre de cette
session. Ils apparaissent donc actuellement avec l'ancienne palette
(corail/crème) à l'intérieur des grilles "Nos catégories" et "Nos
créations" de la page d'accueil, refaite en `encre`/`fond`/`surface`.

**À traiter en Session C** : migrer ces deux composants vers
`encre`/`fond`/`surface`/`safran`/`framboise`/`lichen`, en gardant à
l'esprit qu'ils sont aussi utilisés sur `boutique/*` et `produit/[id]` —
vérifier le rendu sur ces pages-là aussi, même si leur propre refonte
viendra dans une session ultérieure.

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
