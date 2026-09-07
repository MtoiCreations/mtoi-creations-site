import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import { getProduits } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";

export const revalidate = 60;

// Photo provisoire du héros — à remplacer par une photo dédiée quand elle sera prête.
const HERO_IMAGE_SRC = "/images/hero-bg.png";

const btnPrimary =
  "inline-flex items-center justify-center rounded-[4px] bg-safran px-6 py-3 font-titre font-medium text-encre transition-colors hover:bg-safran/90";

const linkSecondary =
  "font-titre font-medium text-framboise underline underline-offset-4 transition-colors hover:text-framboise/80";

export default async function Home() {
  const produitsTyped = await getProduits();

  return (
    <>
      {/* Héros */}
      <section className="bg-surface">
        <div className="container-custom py-14 md:py-24">
          <div className="md:grid md:grid-cols-12 md:gap-x-16 md:items-center">
            <div className="text-center md:col-span-7 md:text-left">
              <h1 className="mb-6 font-titre text-[36px] font-semibold leading-[1.05] text-encre md:text-[56px]">
                Fait avec soin et passion
              </h1>
              <p className="mx-auto mb-10 max-w-[65ch] font-corps text-[17px] leading-[1.65] text-encre/80 md:mx-0">
                Des pièces uniques et durables pour accompagner votre quotidien.
                Chaque création est pensée pour allier élégance, praticité et authenticité.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
                <Link href="/boutique" className={btnPrimary}>
                  Découvrir la boutique
                </Link>
                <Link href="/contact" className={linkSecondary}>
                  Me contacter
                </Link>
              </div>
            </div>

            <div className="mt-10 md:col-span-4 md:col-start-9 md:mt-0">
              <div className="relative mx-auto aspect-[4/5] max-w-sm md:max-w-none">
                <Image
                  src={HERO_IMAGE_SRC}
                  alt="Création artisanale MToi Créations"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="border-t border-dashed border-encre/25 bg-fond">
        <div className="container-custom py-6">
          <div className="flex flex-wrap justify-center gap-8 text-center md:gap-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-titre text-encre">Authenticité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="font-titre text-encre">Qualité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-titre text-encre">Simplicité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇨🇦</span>
              <span className="font-titre text-encre">Fait au Québec</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="bg-surface">
        <div className="container-custom py-14 md:py-24">
          <div className="mb-10 max-w-[65ch] md:mb-16">
            <h2 className="mb-4 font-titre text-[28px] font-semibold leading-[1.15] text-encre md:text-[36px]">
              Nos catégories
            </h2>
            <p className="font-corps text-[17px] leading-[1.65] text-encre/80">
              Explorez nos créations artisanales, conçues avec amour pour répondre à vos besoins quotidiens.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {categories.map((categorie) => (
              <CategoryCard key={categorie.id} categorie={categorie} />
            ))}
          </div>
        </div>
      </section>

      {/* Nouveautés / Produits en vedette */}
      <section className="border-t border-dashed border-encre/25 bg-surface">
        <div className="container-custom py-14 md:py-24">
          <div className="mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[65ch]">
              <h2 className="mb-4 font-titre text-[28px] font-semibold leading-[1.15] text-encre md:text-[36px]">
                Nos créations
              </h2>
              <p className="font-corps text-[17px] leading-[1.65] text-encre/80">
                Découvrez nos dernières pièces, fabriquées avec soin dans notre atelier.
              </p>
            </div>
            <Link href="/boutique" className={`${linkSecondary} whitespace-nowrap`}>
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {produitsTyped.slice(0, 6).map((produit) => (
              <ProductCard key={produit.id} produit={produit} />
            ))}
          </div>
        </div>
      </section>

      {/* Section À propos */}
      <section className="border-t border-dashed border-encre/25 bg-surface">
        <div className="container-custom py-14 md:py-24">
          <div className="max-w-[65ch]">
            <h2 className="mb-6 font-titre text-[28px] font-semibold leading-[1.15] text-encre md:text-[36px]">
              Derrière chaque création, il y a une passion
            </h2>
            <div className="space-y-4 font-corps text-[17px] leading-[1.65] text-encre/80">
              <p>
                MToi Créations est née d&apos;une passion pour la couture et du désir de créer
                des pièces uniques qui accompagnent les femmes dans leur quotidien.
              </p>
              <p>
                Chaque produit est conçu et fabriqué avec soin dans mon atelier au Québec,
                en utilisant des matériaux de qualité soigneusement sélectionnés.
              </p>
              <p>
                Mon objectif : vous offrir des créations pratiques, élégantes et durables,
                qui reflètent votre personnalité et répondent à vos besoins.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/contact" className={linkSecondary}>
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignage / Citation */}
      <section className="bg-encre">
        <div className="container-custom py-14 md:py-24">
          <div className="max-w-[65ch]">
            <blockquote className="mb-6 font-corps text-[24px] italic leading-[1.3] text-fond">
              &ldquo;Une alliée du quotidien pour toutes celles qui veulent se sentir prêtes,
              où qu&apos;elles soient.&rdquo;
            </blockquote>
            <p className="font-titre font-medium text-safran">MToi Créations</p>
          </div>
        </div>
      </section>
    </>
  );
}
