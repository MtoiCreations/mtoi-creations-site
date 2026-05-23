# Guide de configuration du panneau d'administration

Pour que tu puisses ajouter des produits et des photos depuis ton téléphone, il faut configurer 2 services gratuits.

## Étape 1: Créer un compte Supabase (base de données)

1. Va sur https://supabase.com
2. Clique "Start your project" (gratuit)
3. Connecte-toi avec ton compte GitHub ou Google
4. Clique "New project"
5. Nomme le projet: `mtoi-creations`
6. Choisis un mot de passe pour la base de données (garde-le quelque part)
7. Région: choisir "East US" (le plus proche)
8. Clique "Create new project"

### Créer la table des produits

1. Dans ton projet Supabase, va dans "SQL Editor" (menu de gauche)
2. Clique "New query"
3. Copie-colle ce code:

```sql
CREATE TABLE produits (
  id TEXT PRIMARY KEY,
  categorie TEXT NOT NULL,
  sous_categorie TEXT,
  nom TEXT NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  devise TEXT DEFAULT 'CAD',
  quantite_disponible INTEGER DEFAULT 0,
  sur_commande BOOLEAN DEFAULT true,
  delais_fabrication TEXT,
  couleurs TEXT[] DEFAULT '{}',
  tailles TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  etiquettes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permettre l'accès public en lecture
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique" ON produits
  FOR SELECT USING (true);

CREATE POLICY "Modification admin" ON produits
  FOR ALL USING (true);
```

4. Clique "Run" (ou Ctrl+Enter)

### Récupérer les clés

1. Va dans "Settings" > "API" (menu de gauche)
2. Copie:
   - **Project URL** → c'est ton `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → c'est ton `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Étape 2: Créer un compte Cloudinary (photos)

1. Va sur https://cloudinary.com
2. Clique "Sign up for free"
3. Crée ton compte
4. Une fois connecté, tu verras ton "Dashboard"
5. Copie les informations:
   - **Cloud Name** → c'est ton `CLOUDINARY_CLOUD_NAME`
   - **API Key** → c'est ton `CLOUDINARY_API_KEY`
   - **API Secret** → c'est ton `CLOUDINARY_API_SECRET`

---

## Étape 3: Configurer le site

Ouvre le fichier `.env.local` et ajoute les clés:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary
CLOUDINARY_CLOUD_NAME=ton-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## Étape 4: Configurer Netlify

1. Va sur ton tableau de bord Netlify
2. Sélectionne ton site
3. Va dans "Site settings" > "Environment variables"
4. Ajoute toutes les variables du fichier `.env.local`:
   - `ADMIN_PASSWORD`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

5. Redéploie le site (dans "Deploys" > "Trigger deploy")

---

## Comment utiliser le panneau admin

1. Va sur `tonsite.com/admin` depuis ton téléphone ou ordinateur
2. Entre ton mot de passe
3. Clique sur "Gérer les produits"
4. Clique le bouton "+" pour ajouter un produit
5. Remplis les infos et ajoute tes photos
6. Clique "Enregistrer"

C'est tout! Ton produit apparaîtra automatiquement sur le site.
