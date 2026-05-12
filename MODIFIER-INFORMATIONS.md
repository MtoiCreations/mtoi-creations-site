# Guide : Modifier le site MToi Créations

Ce guide explique comment modifier les informations du site sans avoir besoin de Claude Code.

---

## Table des matières

1. [Ajouter un nouveau produit](#1-ajouter-un-nouveau-produit)
2. [Modifier un produit existant](#2-modifier-un-produit-existant)
3. [Ajouter des photos](#3-ajouter-des-photos)
4. [Modifier les catégories et sous-catégories](#4-modifier-les-catégories-et-sous-catégories)
5. [Modifier le lien Facebook](#5-modifier-le-lien-facebook)
6. [Modifier l'adresse email de contact](#6-modifier-ladresse-email-de-contact)
7. [Modifier les informations du pied de page (footer)](#7-modifier-les-informations-du-pied-de-page)
8. [Modifier la page d'accueil](#8-modifier-la-page-daccueil)
9. [Publier les modifications sur GitHub](#9-publier-les-modifications-sur-github)

---

## 1. Ajouter un nouveau produit

### Fichier à modifier
```
site/src/data/produits.json
```

### Étapes

1. Ouvrir le fichier `produits.json` avec un éditeur de texte (Notepad++, VS Code, ou même Bloc-notes)

2. Le fichier contient une liste de produits entre crochets `[ ]`. Chaque produit est entre accolades `{ }`

3. Pour ajouter un produit, copier un produit existant et le coller à la fin (avant le dernier `]`)

4. **IMPORTANT** : Ajouter une virgule `,` après l'accolade fermante `}` du produit précédent

### Exemple : Ajouter un sac magique

```json
[
  {
    ... produit existant ...
  },
  {
    "id": "sac-magique-001",
    "categorie": "Soins et Confort",
    "sousCategorie": "Sac magique",
    "nom": "Sac Magique - Lavande",
    "description": "Sac magique rempli de graines de lin et de lavande séchée.\n\nParfait pour soulager les douleurs musculaires et les crampes.\n\n• Chauffer au micro-ondes 1-2 minutes\n• Peut aussi être utilisé froid (congélateur)\n• Dimensions : 20cm x 15cm",
    "prix": 25.00,
    "devise": "CAD",
    "quantiteDisponible": 5,
    "surCommande": false,
    "delaisFabrication": "",
    "options": {
      "couleurs": ["Lavande", "Nature"],
      "tailles": []
    },
    "photos": [
      "/images/sac-magique/lavande/photo-01.jpg",
      "/images/sac-magique/lavande/photo-02.jpg"
    ],
    "etiquettes": ["sac magique", "lavande", "chaleur", "confort"]
  }
]
```

### Explication des champs

| Champ | Description | Exemple |
|-------|-------------|---------|
| `id` | Identifiant unique (pas d'espaces, pas d'accents) | `"sac-magique-001"` |
| `categorie` | Nom exact de la catégorie | `"Soins et Confort"` |
| `sousCategorie` | Nom exact de la sous-catégorie | `"Sac magique"` |
| `nom` | Nom affiché du produit | `"Sac Magique - Lavande"` |
| `description` | Description complète. Utiliser `\n` pour les sauts de ligne | `"Ligne 1\n\nLigne 2"` |
| `prix` | Prix en nombre (pas de $) | `25.00` |
| `devise` | Toujours `"CAD"` | `"CAD"` |
| `quantiteDisponible` | Nombre en stock | `5` |
| `surCommande` | `true` si sur commande, `false` si en stock | `false` |
| `delaisFabrication` | Délai si sur commande | `"5 à 7 jours"` |
| `options.couleurs` | Liste des couleurs disponibles | `["Rouge", "Bleu"]` |
| `options.tailles` | Liste des tailles (vide si non applicable) | `[]` |
| `photos` | Chemins vers les photos (voir section 3) | `["/images/..."]` |
| `etiquettes` | Mots-clés pour la recherche | `["mot1", "mot2"]` |

---

## 2. Modifier un produit existant

### Fichier à modifier
```
site/src/data/produits.json
```

### Étapes

1. Ouvrir le fichier `produits.json`
2. Trouver le produit par son `id` ou son `nom`
3. Modifier les valeurs souhaitées
4. Sauvegarder le fichier

### Exemples courants

**Changer le prix :**
```json
"prix": 42.00,
```

**Mettre un produit épuisé :**
```json
"quantiteDisponible": 0,
"surCommande": false,
```

**Mettre un produit sur commande :**
```json
"quantiteDisponible": 0,
"surCommande": true,
"delaisFabrication": "7 à 10 jours ouvrables",
```

**Ajouter une couleur :**
```json
"couleurs": ["Rouge carroté", "Bleu marine", "Vert forêt"],
```

---

## 3. Ajouter des photos

### Dossier des photos
```
site/public/images/
```

### Étapes

1. **Créer un dossier** pour le nouveau produit dans `public/images/`
   
   Exemple : `public/images/sac-magique/lavande/`

2. **Copier les photos** dans ce dossier
   
   Nommer les photos simplement : `photo-01.jpg`, `photo-02.jpg`, etc.

3. **Mettre à jour le produit** dans `produits.json` :
   ```json
   "photos": [
     "/images/sac-magique/lavande/photo-01.jpg",
     "/images/sac-magique/lavande/photo-02.jpg"
   ],
   ```

### Conseils pour les photos

- **Format recommandé** : JPG ou PNG
- **Ratio recommandé** : 3:4 (portrait)
- **Taille recommandée** : 800x1067 pixels minimum
- **Première photo** : C'est celle qui apparaît dans la liste des produits

---

## 4. Modifier les catégories et sous-catégories

### Fichier à modifier
```
site/src/data/categories.ts
```

### Structure actuelle

```typescript
export const categories: Categorie[] = [
  {
    id: "hygiene-feminine",
    nom: "Hygiène féminine",
    slug: "hygiene-feminine",
    description: "Des créations pensées pour accompagner les femmes...",
    image: "/images/categories/hygiene-feminine.jpg",
    sousCategories: [
      {
        id: "pochette-menstruelle",
        nom: "Pochette menstruelle",
        slug: "pochette-menstruelle",
        categorieParentId: "hygiene-feminine",
      },
    ],
  },
  {
    id: "soins-confort",
    nom: "Soins et Confort",
    slug: "soins-confort",
    description: "Des accessoires artisanaux pour prendre soin de vous...",
    image: "/images/categories/soins-confort.jpg",
    sousCategories: [
      {
        id: "sac-magique",
        nom: "Sac magique",
        slug: "sac-magique",
        categorieParentId: "soins-confort",
      },
    ],
  },
];
```

### Ajouter une nouvelle catégorie

Ajouter après la dernière accolade `}` de la dernière catégorie (avant le `];`) :

```typescript
  {
    id: "vetements",
    nom: "Vêtements",
    slug: "vetements",
    description: "Vêtements personnalisés faits main.",
    image: "/images/categories/vetements.jpg",
    sousCategories: [
      {
        id: "robes",
        nom: "Robes",
        slug: "robes",
        categorieParentId: "vetements",
      },
      {
        id: "jupes",
        nom: "Jupes",
        slug: "jupes",
        categorieParentId: "vetements",
      },
    ],
  },
```

### Règles importantes

- Le `slug` doit être en minuscules, sans accents, avec des tirets au lieu d'espaces
- Le `categorieParentId` doit correspondre exactement à l'`id` de la catégorie parente
- Ne pas oublier les virgules entre les éléments

---

## 5. Modifier le lien Facebook

### Fichier à modifier
```
site/src/components/Footer.tsx
```

### Trouver et modifier cette ligne (vers la ligne 45)

```typescript
href="https://facebook.com/mtoicreations"
```

Remplacer par votre vrai lien :
```typescript
href="https://www.facebook.com/VotrePage"
```

### Aussi dans le fichier
```
site/src/app/contact/page.tsx
```

Chercher (vers la ligne 220) :
```typescript
href="https://facebook.com/mtoicreations"
```

---

## 6. Modifier l'adresse email de contact

### Fichiers à modifier

**1. Footer (pied de page)**
```
site/src/components/Footer.tsx
```

Chercher et modifier :
```typescript
href="mailto:contact@mtoicreations.ca"
```

**2. Page contact**
```
site/src/app/contact/page.tsx
```

Chercher et modifier :
```typescript
href="mailto:contact@mtoicreations.ca"
```

**3. Variables d'environnement** (pour les emails automatiques)
```
site/.env.local
```

Modifier :
```
INTERAC_EMAIL=votre-email@example.com
```

---

## 7. Modifier les informations du pied de page

### Fichier à modifier
```
site/src/components/Footer.tsx
```

### Ce que vous pouvez modifier

**Description de la boutique (ligne ~25) :**
```typescript
<p className="text-cream/80 max-w-md">
  Créations artisanales faites avec soin et passion. Des pièces
  uniques et durables pour accompagner votre quotidien.
</p>
```

**Slogan (ligne ~30) :**
```typescript
<p className="text-accent mt-4 font-display text-lg">
  Authenticité • Qualité • Simplicité
</p>
```

---

## 8. Modifier la page d'accueil

### Fichier à modifier
```
site/src/app/page.tsx
```

### Modifier le titre principal (ligne ~30)

```typescript
<h1 className="heading-1 text-primary mb-6 animate-slide-up">
  Fait avec soin
  <br />
  <span className="text-secondary">et passion</span>
</h1>
```

### Modifier la description (ligne ~35)

```typescript
<p className="body-large mb-8">
  Des pièces uniques et durables pour accompagner votre quotidien.
  Chaque création est pensée pour allier élégance, praticité et authenticité.
</p>
```

### Modifier la section "À propos" (ligne ~120)

Chercher le texte qui commence par "MToi Créations est née..." et le modifier.

---

## 9. Publier les modifications sur GitHub

Après avoir modifié les fichiers, vous devez les envoyer sur GitHub pour que Netlify mette à jour le site.

### Option A : Avec VS Code (recommandé)

1. Ouvrir le dossier `site` dans VS Code
2. Cliquer sur l'icône **Source Control** (3ème icône dans la barre de gauche)
3. Vous verrez la liste des fichiers modifiés
4. Écrire un message dans la boîte "Message" (ex: "Ajout nouveau produit")
5. Cliquer sur **✓ Commit**
6. Cliquer sur **Sync Changes** ou **Push**

### Option B : Avec le terminal

Ouvrir un terminal dans le dossier `site` et exécuter :

```bash
git add .
git commit -m "Description de vos modifications"
git push
```

### Option C : Avec GitHub Desktop

1. Télécharger GitHub Desktop : https://desktop.github.com/
2. Connecter votre compte GitHub
3. Ouvrir le repo `mtoi-creations-site`
4. Les modifications apparaîtront automatiquement
5. Écrire un résumé et cliquer sur **Commit to main**
6. Cliquer sur **Push origin**

---

## Aide-mémoire rapide

| Je veux... | Fichier à modifier |
|------------|-------------------|
| Ajouter/modifier un produit | `src/data/produits.json` |
| Ajouter des photos | Copier dans `public/images/` |
| Modifier les catégories | `src/data/categories.ts` |
| Modifier le lien Facebook | `src/components/Footer.tsx` |
| Modifier l'email de contact | `src/components/Footer.tsx` et `src/app/contact/page.tsx` |
| Modifier la page d'accueil | `src/app/page.tsx` |
| Modifier le pied de page | `src/components/Footer.tsx` |
| Modifier l'email Interac | `.env.local` |
| Modifier le mot de passe admin | `.env.local` |

---

## En cas de problème

### Le site ne s'affiche plus après une modification

Vous avez probablement fait une erreur de syntaxe (virgule manquante, guillemet oublié, etc.)

1. Vérifier les dernières modifications
2. Comparer avec un produit existant qui fonctionne
3. Utiliser un validateur JSON en ligne : https://jsonlint.com/

### Les photos ne s'affichent pas

1. Vérifier que le chemin dans `produits.json` correspond exactement au dossier
2. Le chemin doit commencer par `/images/`
3. Vérifier que les noms de fichiers n'ont pas d'espaces ou de caractères spéciaux

### Les modifications n'apparaissent pas sur le site en ligne

1. Vérifier que vous avez bien fait un `git push`
2. Attendre 1-2 minutes que Netlify redéploie
3. Vider le cache du navigateur (Ctrl+F5)
