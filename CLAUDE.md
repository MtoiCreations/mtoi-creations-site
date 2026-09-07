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
`ADMIN_PASSWORD`, `RESEND_API_KEY`, `EMAIL_FROM`, `INTERAC_EMAIL`, `NEXT_PUBLIC_SITE_URL`,
`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

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

### Orders: two payment flows, one storage mechanism

- `/api/checkout` — Stripe Checkout (card payment). Creates the order record already marked
  `statut: "payee"`, creates a Stripe session, emails confirmation to the customer + owner.
- `/api/commandes` (POST) — manual Interac e-transfer flow. Creates the order as
  `statut: "en_attente"` and emails payment instructions instead of charging anything.

Both write to `data/commandes.json` via direct `fs` read/write (see the repeated
`getCommandes`/`saveCommandes` helpers in `src/app/api/checkout/route.ts`,
`src/app/api/commandes/route.ts`, and `src/app/api/admin/route.ts`). This file is **not** a
database — on Netlify's serverless functions this filesystem is ephemeral, so treat order
persistence there as unreliable, unlike the product catalog which was already migrated to
Supabase. Keep this in mind before assuming an order written in one request will be visible
to a later one in production.

### Admin auth

There's no session/cookie auth. Every admin API route (`/api/admin/*`, including
`/api/admin/produits`, `/api/admin/upload`, `/api/admin/variantes`, etc.) independently checks
a bearer token against `ADMIN_PASSWORD`:
```ts
const password = request.headers.get("authorization")?.replace("Bearer ", "");
if (password !== process.env.ADMIN_PASSWORD) { /* 401 */ }
```
The `/admin` page stores the password client-side after login and attaches it to every
subsequent request. New admin routes must replicate this check themselves.

### Images

Product photo uploads go through `/api/admin/upload` to Cloudinary (folder
`mtoi-creations/produits`), which is why `next.config.mjs` only allows
`res.cloudinary.com/dnxvz6afy/**` as a remote image pattern — adding another image host
requires updating that allowlist. Static/manual product photos instead live under
`public/images/...` and are referenced by relative path in `produits.json`.

### Client state (Zustand)

- `src/lib/store.ts` — `useCartStore`, persisted to `localStorage` (cart survives reloads;
  no-ops out on the server via a `noopStorage` shim).
- `src/lib/logoIntroStore.ts` — drives the header logo's intro animation as a small state
  machine (`idle → toCenter → giant → toOrigin → dissolving`), not persisted. Triggered by
  `HomeIntroTrigger` (first homepage visit per session, via `sessionStorage`) or by clicking
  the header logo (`AnimatedLogo`); rendered by `LogoIntroOverlay`, mounted once in
  `src/app/layout.tsx` so it survives client-side navigation.

### Design tokens

Colors, gradients (`bg-sunset`, `bg-sunset-soft`), and the script font (`font-script`, Alex
Brush) are defined centrally in `tailwind.config.ts`; components consistently reference the
semantic tokens (`primary`, `secondary`, `accent`, `cream`, `text-*`) rather than raw hex
values, so a palette change there cascades sitewide.
