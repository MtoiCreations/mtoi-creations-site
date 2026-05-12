"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { categories } from "@/data/categories";
import { ShoppingBag, Menu, X, Search, ChevronDown } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-50 bg-cream-light border-b border-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="MToi Créations"
              width={120}
              height={50}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/boutique"
              className="font-display text-primary hover:text-secondary transition-colors"
            >
              Boutique
            </Link>

            {/* Dropdown Catégories */}
            <div className="relative">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                onBlur={() => setTimeout(() => setIsCategoriesOpen(false), 200)}
                className="flex items-center font-display text-primary hover:text-secondary transition-colors"
              >
                Catégories
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${
                    isCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-card shadow-medium py-2 animate-fade-in">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/boutique/${cat.slug}`}
                        className="block px-4 py-2 text-primary hover:bg-cream hover:text-secondary transition-colors font-medium"
                      >
                        {cat.nom}
                      </Link>
                      {cat.sousCategories?.map((sousCat) => (
                        <Link
                          key={sousCat.id}
                          href={`/boutique/${cat.slug}/${sousCat.slug}`}
                          className="block px-6 py-1.5 text-text-secondary hover:bg-cream hover:text-secondary transition-colors text-sm"
                        >
                          {sousCat.nom}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="font-display text-primary hover:text-secondary transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-primary hover:text-secondary transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <Link
              href="/panier"
              className="relative p-2 text-primary hover:text-secondary transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-primary"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="pb-4 animate-fade-in">
            <form action="/boutique" method="GET" className="relative">
              <input
                type="text"
                name="recherche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full px-4 py-3 pr-12 border border-cream-dark rounded-button bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-secondary"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-cream-dark animate-fade-in">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/boutique"
              className="block font-display text-lg text-primary hover:text-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Boutique
            </Link>

            <div className="space-y-2">
              <p className="font-display text-lg text-primary">Catégories</p>
              {categories.map((cat) => (
                <div key={cat.id} className="pl-4">
                  <Link
                    href={`/boutique/${cat.slug}`}
                    className="block py-1 text-text-secondary hover:text-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.nom}
                  </Link>
                  {cat.sousCategories?.map((sousCat) => (
                    <Link
                      key={sousCat.id}
                      href={`/boutique/${cat.slug}/${sousCat.slug}`}
                      className="block py-1 pl-4 text-sm text-text-light hover:text-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {sousCat.nom}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="block font-display text-lg text-primary hover:text-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
