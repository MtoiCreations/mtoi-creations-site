"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  X,
  Plus,
} from "lucide-react";
import { categories } from "@/data/categories";

export default function NouveauProduitPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    sousCategorie: "",
    quantiteDisponible: "0",
    surCommande: true,
    delaisFabrication: "5 à 7 jours ouvrables",
    photos: [] as string[],
    couleurs: [] as string[],
    etiquettes: [] as string[],
  });

  const [newCouleur, setNewCouleur] = useState("");
  const [newEtiquette, setNewEtiquette] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("adminAuth");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  const selectedCategorie = categories.find((c) => c.nom === form.categorie);
  const sousCategories = selectedCategorie?.sousCategories || [];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    const token = sessionStorage.getItem("adminAuth");
    const newPhotos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newPhotos.push(data.url);
        } else {
          const errData = await res.json();
          setError(errData.error || "Erreur upload");
        }
      } catch (err) {
        console.error("Erreur upload:", err);
        setError("Erreur lors du téléversement");
      }
    }

    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const addCouleur = () => {
    if (newCouleur.trim() && !form.couleurs.includes(newCouleur.trim())) {
      setForm((prev) => ({
        ...prev,
        couleurs: [...prev.couleurs, newCouleur.trim()],
      }));
      setNewCouleur("");
    }
  };

  const removeCouleur = (index: number) => {
    setForm((prev) => ({
      ...prev,
      couleurs: prev.couleurs.filter((_, i) => i !== index),
    }));
  };

  const addEtiquette = () => {
    if (newEtiquette.trim() && !form.etiquettes.includes(newEtiquette.trim())) {
      setForm((prev) => ({
        ...prev,
        etiquettes: [...prev.etiquettes, newEtiquette.trim().toLowerCase()],
      }));
      setNewEtiquette("");
    }
  };

  const removeEtiquette = (index: number) => {
    setForm((prev) => ({
      ...prev,
      etiquettes: prev.etiquettes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.nom || !form.prix || !form.categorie) {
      setError("Veuillez remplir les champs obligatoires");
      return;
    }

    setSaving(true);
    const token = sessionStorage.getItem("adminAuth");

    try {
      const res = await fetch("/api/admin/produits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/admin/produits");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <header className="bg-white border-b border-cream-dark sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/admin/produits"
            className="p-2 -ml-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl text-primary flex-1">
            Nouveau produit
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-primary mb-3">
              Photos
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {form.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-cream rounded-lg overflow-hidden group"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute top-1 left-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                </div>
              ))}

              {/* Add photo button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square border-2 border-dashed border-cream-dark rounded-lg flex flex-col items-center justify-center text-text-light hover:border-secondary hover:text-secondary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">Ajouter</span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <p className="text-xs text-text-light">
              Vous pouvez sélectionner plusieurs photos à la fois
            </p>
          </div>

          {/* Infos de base */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex: Pochette Fid'Elle - Rouge"
                className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={5}
                placeholder="Décrivez votre produit..."
                className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Prix ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Quantité en stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.quantiteDisponible}
                  onChange={(e) =>
                    setForm({ ...form, quantiteDisponible: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          </div>

          {/* Catégorie */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Catégorie *
              </label>
              <select
                value={form.categorie}
                onChange={(e) =>
                  setForm({ ...form, categorie: e.target.value, sousCategorie: "" })
                }
                className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
              >
                <option value="">Sélectionner...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nom}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            {sousCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Sous-catégorie
                </label>
                <select
                  value={form.sousCategorie}
                  onChange={(e) =>
                    setForm({ ...form, sousCategorie: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
                >
                  <option value="">Sélectionner...</option>
                  {sousCategories.map((sc) => (
                    <option key={sc.id} value={sc.nom}>
                      {sc.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.surCommande}
                  onChange={(e) =>
                    setForm({ ...form, surCommande: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-cream-dark text-secondary focus:ring-secondary"
                />
                <span className="text-sm font-medium text-primary">
                  Disponible sur commande
                </span>
              </label>
            </div>

            {form.surCommande && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Délai de fabrication
                </label>
                <input
                  type="text"
                  value={form.delaisFabrication}
                  onChange={(e) =>
                    setForm({ ...form, delaisFabrication: e.target.value })
                  }
                  placeholder="Ex: 5 à 7 jours ouvrables"
                  className="w-full px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            )}
          </div>

          {/* Couleurs */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-primary mb-3">
              Couleurs disponibles
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {form.couleurs.map((couleur, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cream rounded-full text-sm"
                >
                  {couleur}
                  <button
                    type="button"
                    onClick={() => removeCouleur(index)}
                    className="text-text-light hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCouleur}
                onChange={(e) => setNewCouleur(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCouleur())}
                placeholder="Ajouter une couleur..."
                className="flex-1 px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <button
                type="button"
                onClick={addCouleur}
                className="px-3 py-2 bg-cream text-primary rounded-lg hover:bg-cream-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Étiquettes */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-primary mb-3">
              Étiquettes (pour la recherche)
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {form.etiquettes.map((etiquette, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                >
                  {etiquette}
                  <button
                    type="button"
                    onClick={() => removeEtiquette(index)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newEtiquette}
                onChange={(e) => setNewEtiquette(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addEtiquette())
                }
                placeholder="Ajouter une étiquette..."
                className="flex-1 px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <button
                type="button"
                onClick={addEtiquette}
                className="px-3 py-2 bg-cream text-primary rounded-lg hover:bg-cream-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-secondary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer le produit
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
