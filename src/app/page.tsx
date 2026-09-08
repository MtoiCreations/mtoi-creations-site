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
                Fabriqué pour durer, pas pour être jeté.
              </h1>
              <p className="mx-auto max-w-[65ch] font-corps text-[17px] leading-[1.65] text-encre/80 md:mx-0">
                Lingettes démaquillantes, bandeaux, pochettes menstruelles.
                Des essentiels du quotidien fabriqués à la main à Granby.
              </p>
              <p className="mx-auto mt-10 max-w-[65ch] font-titre text-[24px] leading-[1.3] text-encre md:mx-0">
                Remplace le jetable, une pièce à la fois.
              </p>
              <div className="mx-auto mt-6 h-0 w-16 border-t-2 border-dashed border-safran md:mx-0" />
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:justify-start">
                <Link href="/boutique" className={btnPrimary}>
                  Voir les créations
                </Link>
                <Link href="/contact" className={linkSecondary}>
                  Une idée sur mesure
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
              Par besoin
            </h2>
            <p className="font-corps text-[17px] leading-[1.65] text-encre/80">
              Trouve ce qu’il te faut, selon ce que tu veux remplacer.
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
                Dernières pièces
              </h2>
              <p className="font-corps text-[17px] leading-[1.65] text-encre/80">
                Cousues récemment chez moi. Les quantités sont limitées.
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
              Une couturière, une table, des pièces qui durent
            </h2>
            <div className="space-y-4 font-corps text-[17px] leading-[1.65] text-encre/80">
              <p>
                J’ai commencé MToi Créations parce que j’en avais assez de racheter les
                mêmes choses jetables. Je couds des lingettes démaquillantes, des bandeaux
                et des pochettes menstruelles qui remplacent le jetable dans le quotidien
                des femmes.
              </p>
              <p>
                Tout est fabriqué chez moi, à Granby, avec des tissus que je choisis
                moi-même. Si tu veux une pièce dans un tissu précis ou une taille
                particulière, écris-moi.
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
    </>
  );
}
