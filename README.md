# MToi Créations - Site e-commerce

Site e-commerce pour la boutique de créations artisanales MToi Créations.

## Installation

```bash
cd site
npm install
```

## Configuration

1. Modifier le fichier `.env.local` avec vos valeurs :

```env
# Email pour recevoir les virements Interac
INTERAC_EMAIL=votre-email@example.com

# Mot de passe pour la page admin (/admin)
ADMIN_PASSWORD=votre-mot-de-passe-secret

# Configuration Resend (pour les emails automatiques)
# Créer un compte gratuit sur https://resend.com
RESEND_API_KEY=re_votre_cle_api

# Email d'expédition
EMAIL_FROM=MToi Créations <noreply@votredomaine.com>

# URL du site
NEXT_PUBLIC_INTERAC_EMAIL=votre-email@example.com
NEXT_PUBLIC_SITE_URL=https://mtoicreations.ca
```

## Développement

```bash
npm run dev
```

Le site sera accessible sur http://localhost:3000

## Pages disponibles

- `/` - Accueil
- `/boutique` - Catalogue complet
- `/boutique/[categorie]` - Catégorie (hygiene-feminine, soins-confort)
- `/boutique/[categorie]/[sousCategorie]` - Sous-catégorie
- `/produit/[id]` - Page produit
- `/panier` - Panier
- `/commande` - Formulaire de commande
- `/confirmation` - Instructions de paiement Interac
- `/contact` - Formulaire de contact
- `/admin` - Administration (protégé par mot de passe)

## Administration

Accéder à `/admin` et entrer le mot de passe configuré dans `ADMIN_PASSWORD`.

Fonctionnalités :
- Voir toutes les commandes
- Marquer une commande comme "Payée" (envoie un email de confirmation)
- Marquer une commande comme "Expédiée"
- Annuler une commande

## Déploiement sur Netlify

1. Pousser le code sur GitHub
2. Connecter le repo à Netlify
3. Configurer les variables d'environnement dans Netlify
4. Le fichier `netlify.toml` configure automatiquement le build

## Ajouter des produits

Modifier le fichier `src/data/produits.json` :

```json
{
  "id": "unique-id",
  "categorie": "Hygiène féminine",
  "sousCategorie": "Pochette menstruelle",
  "nom": "Nom du produit",
  "description": "Description complète...",
  "prix": 38.00,
  "devise": "CAD",
  "quantiteDisponible": 5,
  "surCommande": false,
  "delaisFabrication": "5 à 7 jours ouvrables",
  "options": {
    "couleurs": ["Rouge", "Bleu"],
    "tailles": []
  },
  "photos": [
    "/images/dossier/photo-01.jpg",
    "/images/dossier/photo-02.jpg"
  ],
  "etiquettes": ["tag1", "tag2"]
}
```

Placer les images dans `public/images/`.

## Structure du projet

```
site/
├── public/
│   └── images/           # Photos des produits
├── src/
│   ├── app/              # Pages Next.js
│   ├── components/       # Composants réutilisables
│   ├── data/             # Données (produits, catégories)
│   ├── lib/              # Utilitaires et store
│   └── types/            # Types TypeScript
├── data/
│   └── commandes.json    # Commandes (généré automatiquement)
└── .env.local            # Variables d'environnement
```
