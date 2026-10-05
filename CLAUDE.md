# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (also what Netlify runs)
npm run start    # Serve the production build locally
npm run lint     # ESLint (next lint)
npx tsc --noEmit # Type-check without emitting (no separate typecheck script exists)
```

There is no automated test suite (no Jest/Vitest/Playwright config, no `test` script).

Local dev requires a `.env.local` (gitignored). Without `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` set, the site still runs but falls back to the static
sample data in `src/data/produits.json` (see below) — useful for UI work but does not
reflect real inventory. Other env vars used across the app: `SUPABASE_SERVICE_ROLE_KEY`,
`ADMIN_PASSWORD`, `RESEND_API_KEY`, `EMAIL_FROM` (sender, `commandes@mtoicreations.com`),
`ORDERS_NOTIFICATION_EMAIL` (where the owner's order notifications go, defaults to
`mtoicreations@hotmail.com`), `NEXT_PUBLIC_SITE_URL` (`https://mtoicreations.com`; also builds
Stripe's return URLs), `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (only read by
an unused helper), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
The site's only domain is `mtoicreations.com` (never `.ca`).

`new Stripe(...)` (`src/lib/stripe.ts`) and `new Resend(...)` (module level in several
routes) throw at module load when their key is missing, before any `try/catch` in a handler
runs, so a missing key breaks the whole route rather than just the email or payment step.

## Direction visuelle

`DIRECTION-VISUELLE.md` (racine du dépôt) est le devis de référence pour la palette, la
typographie et les règles de mise en page du site. Il **a préséance sur les choix esthétiques
par défaut** — avant toute intervention visuelle, le lire et l'appliquer plutôt que de
proposer une direction générique.

## Architecture

Next.js 14 App Router + TypeScript + Tailwind, deployed to Netlify (`@netlify/plugin-nextjs`,
`output: "standalone"`). Path alias `@/*` → `./src/*`.

### Product data: Supabase-first with a static fallback

`src/lib/supabase.ts` exports `getProduits()`, the single entry point pages use to read the
catalog. It queries Supabase (`produits`, `variantes`, `accessoires`, `accessoire_variantes`
tables) and assembles full `Produit` objects. If Supabase env vars are missing, the query
errors, or the table is empty, it silently falls back to `src/data/produits.json`.

Two other data sources get merged in:
- `src/data/produitsExtras.json` — keyed by product ID, supplies `dimensions` and `avis`
  (reviews) that don't live in the Supabase schema. Any product, whether from Supabase or
  the fallback file, gets its extras merged in inside `getProduits()`.
- `src/data/categories.ts` — static category/subcategory tree (not in Supabase).

There are effectively two parallel ways to manage products: editing `produits.json` by hand
(documented in `MODIFIER-INFORMATIONS.md` for the non-technical site owner) or using the
`/admin` panel backed by Supabase. Keep both paths' data shape in sync when changing the
`Produit` type in `src/types/index.ts`.

### Orders: Stripe Checkout, stored in Supabase

Card payment through Stripe Checkout is the only payment flow wired to the UI. The manual
Interac flow (`POST /api/commandes`) was removed.

- **Storage**: the `commandes` table in Supabase (RLS enabled and closed; only
  `service_role` has a GRANT). All access goes through `src/lib/commandes.ts`
  (`getCommandes`, `getCommandeById`, `creerCommande`, `mettreAJourStatut`), which uses
  `supabaseAdmin` and maps snake_case columns to the camelCase `Commande` type. `client` and
  `articles` are JSONB. Statuts: `en_attente`, `payee`, `en_production`, `prete`, `expediee`,
  `livree`, `annulee`.
- `/api/checkout` — creates the order, then a Stripe session (`metadata.commande_id`), then
  sends the customer and owner emails. **Known gap**: it still writes `statut: "payee"` and
  emails *before* the customer pays. The planned fix is a Stripe webhook
  (`checkout.session.completed` → `en_attente` to `payee`, send the emails there, decrement
  stock); until then, abandoned payments leave a fake "payee" order.
- `/api/commandes` (GET) and `/api/commandes/[id]` (GET, PATCH) serve the admin UI and require
  the admin bearer token.
- `/api/admin/route.ts` is the **last route still reading `data/commandes.json` through
  `fs`**, which is read-only/ephemeral on Netlify. Treat it as unmigrated.

### Prices are computed server-side

`/api/checkout` never trusts an amount from the browser. The client sends only identifiers and
choices (`produitId`, `quantite`, `couleur`, `taille`, `varianteId`, `accessoires`) plus
`prixAffiche`/`totalAffiche`, used solely to detect a price change.

- `src/lib/catalogue.ts` reads the products from Supabase for the order, **with no fallback to
  `produits.json`** (an unreachable catalogue gives a 503, not a sale at stale prices).
- `src/lib/tarifs.ts` holds the shipping rule (free from 75 $, otherwise 10 $) and the
  quantity limits; all arithmetic is in integer cents. The shipping rule is still duplicated
  in `panier/page.tsx` and `commande/page.tsx` for display only.
- Any gap (price changed, stock too low, product withdrawn, invalid option, wrong total,
  custom orders closed) returns **409** `{ code: "PANIER_MODIFIE", changements: [...] }`
  without creating an order or a Stripe session. The checkout page applies the changes with
  `useCartStore().appliquerChangements` and shows them for the customer to confirm.
- Stock is validated (quantities of every line of the same product are summed) but **never
  decremented**; that is planned for the webhook.
- Order `articles` are stored with the `CartItem` field names (`couleurSelectionnee`,
  `tailleSelectionnee`, `varianteSelectionnee`, `accessoiresSelectionnes`) and a reduced
  product snapshot at the billed price. Orders created before this change use `couleur` /
  `variante`; the admin orders page reads both shapes.

### Admin auth

There's no session/cookie auth and no `middleware.ts`, so protection is per route. Every admin
API route (`/api/admin/*`, including `/api/admin/produits`, `/api/admin/upload`,
`/api/admin/variantes`, etc., plus `/api/commandes`, `/api/commandes/[id]` and
`POST /api/settings`) calls the single helper `verifierAdmin(request)` from
`src/lib/adminAuth.ts` and returns 401 when it is false:
```ts
import { verifierAdmin } from "@/lib/adminAuth";

if (!verifierAdmin(request)) {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
```
The helper compares the `Authorization: Bearer <password>` header to `ADMIN_PASSWORD` and
**denies access when `ADMIN_PASSWORD` is unset or empty**. Never re-implement the comparison
inline. The `/admin` page stores the password client-side (`sessionStorage("adminAuth")`) after
login and attaches it to every request, including the `POST /api/settings` toggle.

Admin pages use their own layout: `src/app/admin/layout.tsx` renders `AdminShell` (section
navigation, "Voir la boutique" link, logout; shown only once logged in). The public header and
footer are hidden under `/admin` by `PublicChrome` in the root `src/app/layout.tsx`. Page roots
under `/admin` use `flex-1` (the shell provides the full-height flex column and the body font).
A login or logout inside a page must call `signalerChangementAuthAdmin()` from
`src/lib/adminSession.ts` so the shell updates without a reload.

Routes that are intentionally public: `GET /api/produits`, `GET /api/settings`,
`POST /api/checkout`, `POST /api/contact`. Any new route must either call `verifierAdmin` or be
added to that list on purpose.

### Images

Product photo uploads go through `/api/admin/upload` to Cloudinary (folder
`mtoi-creations/produits`), which is why `next.config.mjs` only allows
`res.cloudinary.com/dnxvz6afy/**` as a remote image pattern — adding another image host
requires updating that allowlist. Static/manual product photos instead live under
`public/images/...` and are referenced by relative path in `produits.json`.

### Client state (Zustand)

- `src/lib/store.ts` — `useCartStore`, persisted to `localStorage` (cart survives reloads;
  no-ops out on the server via a `noopStorage` shim).
  It also exposes `appliquerChangements`, which resyncs the cart with the discrepancies
  returned by `/api/checkout` (409). The cart stores a full copy of each product, price
  included, with no expiry, so a returning customer can hold stale prices.
- The header logo is `src/components/AnimatedLogo.tsx` (used by `Header.tsx`); there is no
  intro-animation store anymore.

### Design tokens

`tailwind.config.ts` holds two generations of tokens, both still in use while the redesign
(`SUIVI-VISUEL.md`) is in progress:

- **Current** (`DIRECTION-VISUELLE.md`): colors `encre`, `fond`, `surface`, `safran`,
  `framboise`, `lichen`, plus `erreur` (`#8C2A2A`, form error messages only, never
  decorative); fonts `font-titre` (Bricolage Grotesque) and `font-corps` (Literata).
  Use these for any new or reworked page.
- **Legacy**, still referenced by pages not yet migrated (cart, checkout, confirmation, admin,
  footer, email templates): `primary`, `secondary`, `accent`, `cream`, `text-*`, the
  `bg-sunset` gradients, and the `serif` / `sans` / `display` / `script` fonts.

`SUIVI-VISUEL.md` lists what remains to migrate, session by session, and also tracks the
technical work (Supabase orders, email/domain, Stripe).
