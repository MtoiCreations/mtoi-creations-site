import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import produits from "@/data/produits.json";
import { Produit } from "@/types";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import Button from "@/components/Button";

export default function Home() {
  const produitsTyped = produits as Produit[];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-cream">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero-bg.jpg"
            alt="Créations artisanales MToi"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <p className="font-display text-secondary tracking-widest uppercase mb-4 animate-fade-in">
              Créations artisanales
            </p>
            <h1 className="heading-1 text-primary mb-6 animate-slide-up">
              Fait avec soin
              <br />
              <span className="text-secondary">et passion</span>
            </h1>
            <p className="body-large mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Des pièces uniques et durables pour accompagner votre quotidien.
              Chaque création est pensée pour allier élégance, praticité et authenticité.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/boutique">
                <Button size="lg">Découvrir la boutique</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">Me contacter</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Image décorative */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2">
          <div className="relative h-full">
            <Image
              src="/images/hero-product.png"
              alt="Pochette Fid'Elle"
              fill
              className="object-contain object-right"
              priority
            />
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-cream-light py-8 border-y border-cream-dark">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-display text-primary">Authenticité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="font-display text-primary">Qualité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-display text-primary">Simplicité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇨🇦</span>
              <span className="font-display text-primary">Fait au Québec</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="section-padding bg-cream-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-primary mb-4">Nos catégories</h2>
            <p className="body-large max-w-2xl mx-auto">
              Explorez nos créations artisanales, conçues avec amour pour répondre à vos besoins quotidiens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {categories.map((categorie) => (
              <CategoryCard key={categorie.id} categorie={categorie} />
            ))}
          </div>
        </div>
      </section>

      {/* Nouveautés / Produits en vedette */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="heading-2 text-primary mb-4">Nos créations</h2>
              <p className="body-large max-w-xl">
                Découvrez nos dernières pièces, fabriquées avec soin dans notre atelier.
              </p>
            </div>
            <Link href="/boutique" className="mt-4 md:mt-0">
              <Button variant="outline">Voir tout</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {produitsTyped.slice(0, 6).map((produit) => (
              <ProductCard key={produit.id} produit={produit} />
            ))}
          </div>
        </div>
      </section>

      {/* Section À propos */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-image overflow-hidden">
              <Image
                src="/images/atelier.jpg"
                alt="Atelier MToi Créations"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <p className="font-display text-secondary tracking-widest uppercase mb-4">
                Notre histoire
              </p>
              <h2 className="heading-2 text-primary mb-6">
                Derrière chaque création, il y a une passion
              </h2>
              <div className="space-y-4 text-text-secondary">
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
                <Link href="/contact">
                  <Button variant="secondary">En savoir plus</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignage / Citation */}
      <section className="section-padding bg-secondary text-white text-center">
        <div className="container-custom max-w-3xl">
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl italic mb-6">
            &ldquo;Une alliée du quotidien pour toutes celles qui veulent se sentir prêtes,
            où qu&apos;elles soient.&rdquo;
          </blockquote>
          <p className="font-display text-accent tracking-widest uppercase">
            MToi Créations
          </p>
        </div>
      </section>
    </>
  );
}
