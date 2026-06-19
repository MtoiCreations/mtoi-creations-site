export interface Variante {
  id: string;
  nom: string;
  photo: string;
  ordre: number;
}

export interface AccessoireVariante {
  id: string;
  nom: string;
  photo: string;
  ordre: number;
}

export interface Accessoire {
  id: string;
  nom: string;
  description?: string;
  obligatoire: boolean;
  ordre: number;
  variantes: AccessoireVariante[];
}

export interface Dimensions {
  largeur?: number;
  hauteur?: number;
  profondeur?: number;
  unite: "cm" | "po";
}

export interface Avis {
  id: string;
  auteur: string;
  note: number;
  commentaire: string;
  date: string;
  verifie?: boolean;
}

export interface Produit {
  id: string;
  categorie: string;
  sousCategorie?: string;
  nom: string;
  description: string;
  prix: number;
  devise: string;
  quantiteDisponible: number;
  surCommande: boolean;
  delaisFabrication?: string;
  options: {
    couleurs: string[];
    tailles: string[];
  };
  photos: string[];
  etiquettes: string[];
  variantes?: Variante[];
  accessoires?: Accessoire[];
  dimensions?: Dimensions;
  avis?: Avis[];
}

export interface CartItem {
  produit: Produit;
  quantite: number;
  couleurSelectionnee?: string;
  tailleSelectionnee?: string;
  varianteSelectionnee?: Variante;
  accessoiresSelectionnes?: { accessoire: Accessoire; variante: AccessoireVariante }[];
}

export interface Commande {
  id: string;
  numeroCommande: string;
  dateCreation: string;
  client: {
    nom: string;
    email: string;
    telephone?: string;
    adresse: {
      ligne1: string;
      ligne2?: string;
      ville: string;
      province: string;
      codePostal: string;
    };
  };
  articles: CartItem[];
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  note?: string;
  statut: "en_attente" | "payee" | "expediee" | "annulee";
  dateModification?: string;
}

export interface Categorie {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  image?: string;
  sousCategories?: SousCategorie[];
}

export interface SousCategorie {
  id: string;
  nom: string;
  slug: string;
  categorieParentId: string;
}
