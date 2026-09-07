# Direction visuelle — MToi Créations

Document de référence pour toute intervention sur le visuel du site.
À conserver à la racine du dépôt et à mentionner à Claude Code au début d'une session de design.

---

## 1. Contexte

**Sujet** : boutique de couture et d'artisanat en ligne, produits faits main (pochettes, articles d'hygiène féminine lavables, accessoires textiles). Créatrice unique.

**Audience** : clientèle québécoise, majoritairement des femmes, qui achètent autant pour l'objet que pour le fait qu'il soit fabriqué par une personne réelle.

**Travail principal du site** : donner envie de commander, et rendre la commande simple (paiement par virement Interac).

**Direction demandée** : artisanal assumé, avant-gardiste, chaleureux mais rayonnant.

**Points faibles actuels à corriger en priorité** : la mise en page et les espacements, puis les couleurs.

---

## 2. Concept directeur — le patron de couture

Le vocabulaire visuel du site vient d'un objet que la clientèle reconnaît sans qu'on l'explique : **la feuille de patron de couture**.

Ce que ça donne concrètement :

- Les pièces d'un patron sont **imbriquées de façon asymétrique** sur la feuille pour économiser le tissu. La mise en page suit la même logique : les blocs ne sont pas centrés ni alignés de manière uniforme, ils sont placés.
- Les **lignes de coupe pointillées**, les **crans** et la **flèche de droit fil** deviennent les séparateurs et les repères du site, à la place des traits pleins génériques.
- Les marges portent des **annotations discrètes**, comme les indications imprimées sur un patron (taille, nombre de pièces à couper).

Ce concept répond directement au problème de mise en page : il donne une raison d'être à l'asymétrie, au lieu d'un alignement par défaut qui donne l'impression d'un gabarit.

**Règle d'audace** : un seul endroit est spectaculaire, le reste est calme. Ici, c'est le **héros de la page d'accueil**, composé comme une feuille de placement de patron. Partout ailleurs, discipline et sobriété.

---

## 3. Palette

Six valeurs, pas une de plus.

| Nom | Hex | Rôle |
|---|---|---|
| `encre` | `#2E1A24` | Prune très foncé. Texte principal, aplats sombres. Remplace le noir. |
| `fond` | `#F4EFF2` | Craie légèrement rosée. Fond de toutes les pages. |
| `surface` | `#FBF9FA` | Fiches produits, blocs surélevés. |
| `safran` | `#E9A200` | L'élément rayonnant. Aplats, boutons principaux, graphiques. |
| `framboise` | `#A93F5B` | Liens, prix, états actifs. |
| `lichen` | `#6E7F58` | Vert grisé. Blocs secondaires, catégories, équilibre. |

**Répartition 60 / 30 / 10** : 60 % de `fond` et `surface`, 30 % d'`encre`, 10 % réparti entre `safran`, `framboise` et `lichen`. L'accent doit rester rare pour rester rayonnant.

**Contraintes d'accessibilité** :
- `safran` ne sert jamais de couleur de texte sur fond pâle (contraste insuffisant). Il sert de fond, avec du texte `encre` par-dessus.
- `framboise` est acceptable pour les liens et les prix à partir de 16 px.
- `encre` sur `fond` est le couple par défaut pour tout le corps de texte.

---

## 4. Typographie

Deux familles, clairement distinctes, toutes deux gratuites sur Google Fonts.

**Titres — Bricolage Grotesque**
Sans serif variable, contemporaine, avec un caractère volontairement irrégulier. Le nom même renvoie au fait main. C'est elle qui porte le côté avant-gardiste.

**Corps de texte — Literata**
Serif humaniste, chaleureuse, conçue pour la lecture longue. Elle apporte la douceur que la police de titre ne donne pas.

**Échelle typographique** (base 16 px, ratio 1,25) :

| Usage | Taille | Interlignage |
|---|---|---|
| Titre de page | 56 px (36 px mobile) | 1,05 |
| Titre de section | 36 px (28 px mobile) | 1,15 |
| Sous-titre | 24 px | 1,3 |
| Corps | 17 px | 1,65 |
| Petit texte | 14 px | 1,5 |

**Règles** :
- Longueur de ligne maximale : 65 caractères. Le corps de texte ne traverse jamais toute la largeur de l'écran.
- Les titres sont **cadrés à gauche**, jamais centrés, sauf sur mobile où le centrage reste possible pour le héros seulement.
- Pas de majuscules pour les étiquettes de sections.
- Pas de mot unique coloré ou mis en gras au milieu d'un titre.

---

## 5. Mise en page et espacements

C'est le point le plus important pour toi. La règle générale : **l'espace vide n'est pas du gaspillage, c'est ce qui donne de la valeur perçue à un produit fait main**.

**Échelle d'espacement**, basée sur 8 px. Aucune valeur en dehors de cette liste :

`8 · 16 · 24 · 40 · 64 · 96 · 160`

**Application** :

- Entre deux sections : **96 px** sur ordinateur, **56 px** sur mobile. C'est habituellement là que ça pèche : les sections sont trop tassées.
- Marge intérieure d'une fiche produit : **24 px**.
- Espace au-dessus d'un titre : environ **le double** de l'espace en dessous. C'est ce qui rattache visuellement un titre à son contenu plutôt qu'à la section précédente.
- Marge latérale de la page : **24 px** sur mobile, **64 px** minimum sur ordinateur.

**Grille** : 12 colonnes. Les blocs ne prennent pas tous la même largeur. Exemple de rythme pour une page produits :

```
┌──────────────────────────────────────────┐
│  Titre (col. 1-7)                        │
│                                          │
│  ┌────────┐  ┌────────┐                  │
│  │ prod.  │  │ prod.  │      espace      │
│  └────────┘  └────────┘      vide        │
│                                          │
│         ┌──────────────────┐             │
│         │  produit vedette │             │
│         │   (col. 4-11)    │             │
│         └──────────────────┘             │
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐      │
│  └────────┘  └────────┘  └────────┘      │
└──────────────────────────────────────────┘
```

**Rayons de bordure** : les photos de produits n'ont **aucun rayon** (bord net, comme un tissu coupé). Les boutons ont un rayon de 4 px. Pas un rayon unique appliqué partout sans distinction.

**Séparateurs** : trait pointillé de 1 px en `encre` à 25 % d'opacité, avec un petit cran en V à chaque extrémité. C'est le repère du patron. À utiliser au maximum trois fois par page.

---

## 6. Photos de produits

Décision recommandée, puisque la question restait ouverte : **système hybride**.

**Catalogue (grille de produits)** : fond uni, exactement la couleur `#F4EFF2` du site. Cadrage **4:5 vertical**, identique pour tous les produits, sans exception. C'est cette constance qui fait qu'une grille a l'air professionnelle plutôt que bricolée.

**Page d'un produit** : la première photo suit la règle du catalogue, puis une ou deux photos de mise en scène — l'objet en usage, tenu, posé sur une table, dans une lumière naturelle.

**Gabarit Canva à créer une seule fois** :
- Format personnalisé 1200 × 1500 px
- Fond `#F4EFF2`
- Produit centré, occupant environ 80 % de la hauteur
- Ombre portée très douce ou aucune

Tu détoures une fois, tu réutilises le gabarit pour chaque nouveau produit. Le gain de cohérence est immédiat.

---

## 7. À éviter

Ces choix sont les signatures les plus reconnaissables d'un site généré automatiquement. Ils sont écartés volontairement.

- Fond crème `#F4F1EA` avec serif à fort contraste et accent terracotta `#D97757`.
- Contenu découpé en cartes arrondies toutes identiques, même ombre grise sous chacune.
- Étiquettes en majuscules espacées au-dessus de chaque titre.
- Numérotation `01 / 02 / 03` sur du contenu qui n'est pas une séquence.
- Flèche `→` collée à la fin de chaque bouton ou lien.
- Animations d'apparition en fondu sur chaque section au défilement.
- Dégradés utilisés comme décoration.

---

## 8. Utilisation avec Claude Code

Au début d'une session de design, une seule phrase suffit :

> Lis `DIRECTION-VISUELLE.md` et applique-la à [la page visée].

Le devis a préséance sur les réflexes par défaut du modèle. Si Claude Code propose autre chose que ce qui est écrit ici, rappelle-lui le document.

**Ordre de travail suggéré**, une page par session pour maîtriser les coûts :

1. Définir les jetons de couleur et de typographie dans `tailwind.config.js` — fondation, à faire en premier.
2. Reprendre les espacements de la page d'accueil.
3. Reprendre la grille du catalogue.
4. Reprendre la page d'un produit.
5. Passer `web-design-guidelines` en révision finale sur l'ensemble.
