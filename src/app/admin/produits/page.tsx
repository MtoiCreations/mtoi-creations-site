"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";

interface Produit {
  id: string;
  nom: string;
  categorie: string;
  sous_categorie: string | null;
  prix: number;
  quantite_disponible: number;
  photos: string[];
}

export default function ProduitsAdminPage() {
  const router = useRouter();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("adminAuth");
    if (!token) {
      router.push("/admin");
      return;
    }
    loadProduits(token);
  }, [router]);

  const loadProduits = async (token: string) => {
    try {
      const res = await fetch("/api/admin/produits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProduits(data);
      } else if (res.status === 401) {
        router.push("/admin");
      }
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer "${nom}"?`)) return;

    setDeleting(id);
    const token = sessionStorage.getItem("adminAuth");

    try {
      const res = await fetch(`/api/admin/produits?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProduits(produits.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeleting(null);
    }
  };

  const produitsFiltres = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <header className="bg-white border-b border-cream-dark sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 -ml-2 text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif text-xl text-primary flex-1">Produits</h1>
            <Link
              href="/admin/produits/nouveau"
              className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Link>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {produitsFiltres.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            {search ? (
              <p>Aucun produit ne correspond à &quot;{search}&quot;</p>
            ) : (
              <>
                <p>Aucun produit pour le moment</p>
                <Link
                  href="/admin/produits/nouveau"
                  className="inline-block mt-4 text-secondary font-medium hover:underline"
                >
                  Ajouter votre premier produit
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {produitsFiltres.map((produit) => (
              <div
                key={produit.id}
                className="bg-white rounded-xl p-4 shadow-sm flex gap-4"
              >
                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream rounded-lg overflow-hidden flex-shrink-0">
                  {produit.photos?.[0] ? (
                    <img
                      src={produit.photos[0]}
                      alt={produit.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-light">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-primary truncate">
                    {produit.nom}
                  </h3>
                  <p className="text-sm text-text-secondary truncate">
                    {produit.categorie}
                    {produit.sous_categorie && ` / ${produit.sous_categorie}`}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="font-medium text-secondary">
                      {produit.prix.toFixed(2)} $
                    </span>
                    <span className="text-text-light">
                      Stock: {produit.quantite_disponible}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/produits/${produit.id}`}
                    className="p-2 text-text-light hover:text-secondary transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(produit.id, produit.nom)}
                    disabled={deleting === produit.id}
                    className="p-2 text-text-light hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    {deleting === produit.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
