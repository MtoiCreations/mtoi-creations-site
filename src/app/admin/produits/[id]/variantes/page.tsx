"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  X,
  GripVertical,
  Package,
} from "lucide-react";

interface Variante {
  id: string;
  nom: string;
  photo: string;
  ordre: number;
}

interface AccessoireVariante {
  id: string;
  nom: string;
  photo: string;
  ordre: number;
}

interface Accessoire {
  id: string;
  nom: string;
  description: string | null;
  obligatoire: boolean;
  ordre: number;
  variantes: AccessoireVariante[];
}

interface Produit {
  id: string;
  nom: string;
}

export default function VariantesPage() {
  const router = useRouter();
  const params = useParams();
  const produitId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accFileInputRef = useRef<HTMLInputElement>(null);

  const [produit, setProduit] = useState<Produit | null>(null);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [accessoires, setAccessoires] = useState<Accessoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pour nouvelle variante
  const [newVarianteNom, setNewVarianteNom] = useState("");
  const [newVariantePhoto, setNewVariantePhoto] = useState("");

  // Pour nouvel accessoire
  const [newAccNom, setNewAccNom] = useState("");
  const [showAccForm, setShowAccForm] = useState(false);

  // Pour nouvelle variante d'accessoire
  const [activeAccId, setActiveAccId] = useState<string | null>(null);
  const [newAccVarNom, setNewAccVarNom] = useState("");
  const [newAccVarPhoto, setNewAccVarPhoto] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("adminAuth");
    if (!token) {
      router.push("/admin");
      return;
    }
    loadData(token);
  }, [produitId, router]);

  const loadData = async (token: string) => {
    try {
      // Charger le produit
      const prodRes = await fetch("/api/admin/produits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (prodRes.ok) {
        const produits = await prodRes.json();
        const found = produits.find((p: Produit) => p.id === produitId);
        setProduit(found || null);
      }

      // Charger les variantes
      const varRes = await fetch(`/api/admin/variantes?produit_id=${produitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (varRes.ok) {
        setVariantes(await varRes.json());
      }

      // Charger les accessoires
      const accRes = await fetch(`/api/admin/accessoires?produit_id=${produitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (accRes.ok) {
        setAccessoires(await accRes.json());
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const token = sessionStorage.getItem("adminAuth");
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
        return data.url;
      }
    } catch (err) {
      console.error("Erreur upload:", err);
    }
    return null;
  };

  const handleAddVariante = async () => {
    if (!newVarianteNom.trim() || !newVariantePhoto) return;

    setSaving(true);
    setError("");
    const token = sessionStorage.getItem("adminAuth");

    try {
      const res = await fetch("/api/admin/variantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produit_id: produitId,
          nom: newVarianteNom.trim(),
          photo: newVariantePhoto,
          ordre: variantes.length,
        }),
      });

      if (res.ok) {
        const newVar = await res.json();
        setVariantes([...variantes, newVar]);
        setNewVarianteNom("");
        setNewVariantePhoto("");
      } else {
        const errData = await res.json();
        setError(errData.error || "Erreur lors de l'ajout");
      }
    } catch (err) {
      console.error("Erreur ajout variante:", err);
      setError(`Erreur: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariante = async (id: string) => {
    if (!confirm("Supprimer cette variante?")) return;

    const token = sessionStorage.getItem("adminAuth");
    try {
      const res = await fetch(`/api/admin/variantes?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setVariantes(variantes.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleAddAccessoire = async () => {
    if (!newAccNom.trim()) return;

    setSaving(true);
    const token = sessionStorage.getItem("adminAuth");

    try {
      const res = await fetch("/api/admin/accessoires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produit_id: produitId,
          nom: newAccNom.trim(),
          obligatoire: true,
          ordre: accessoires.length,
        }),
      });

      if (res.ok) {
        const newAcc = await res.json();
        setAccessoires([...accessoires, newAcc]);
        setNewAccNom("");
        setShowAccForm(false);
      }
    } catch (err) {
      console.error("Erreur ajout accessoire:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccessoire = async (id: string) => {
    if (!confirm("Supprimer cet accessoire et toutes ses variantes?")) return;

    const token = sessionStorage.getItem("adminAuth");
    try {
      const res = await fetch(`/api/admin/accessoires?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAccessoires(accessoires.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleAddAccVariante = async (accessoireId: string) => {
    if (!newAccVarNom.trim() || !newAccVarPhoto) return;

    setSaving(true);
    const token = sessionStorage.getItem("adminAuth");

    try {
      const res = await fetch("/api/admin/accessoire-variantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accessoire_id: accessoireId,
          nom: newAccVarNom.trim(),
          photo: newAccVarPhoto,
          ordre: accessoires.find((a) => a.id === accessoireId)?.variantes.length || 0,
        }),
      });

      if (res.ok) {
        const newVar = await res.json();
        setAccessoires(
          accessoires.map((a) =>
            a.id === accessoireId
              ? { ...a, variantes: [...a.variantes, newVar] }
              : a
          )
        );
        setNewAccVarNom("");
        setNewAccVarPhoto("");
        setActiveAccId(null);
      }
    } catch (err) {
      console.error("Erreur ajout variante accessoire:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccVariante = async (accessoireId: string, varianteId: string) => {
    if (!confirm("Supprimer cette variante?")) return;

    const token = sessionStorage.getItem("adminAuth");
    try {
      const res = await fetch(`/api/admin/accessoire-variantes?id=${varianteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAccessoires(
          accessoires.map((a) =>
            a.id === accessoireId
              ? { ...a, variantes: a.variantes.filter((v) => v.id !== varianteId) }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "variante" | "accVariante") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadPhoto(file);
    setUploading(false);

    if (url) {
      if (type === "variante") {
        setNewVariantePhoto(url);
      } else {
        setNewAccVarPhoto(url);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (accFileInputRef.current) accFileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="min-h-screen bg-cream-light flex items-center justify-center">
        <p>Produit non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <header className="bg-white border-b border-cream-dark sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/admin/produits/${produitId}`}
            className="p-2 -ml-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-xl text-primary">Variantes</h1>
            <p className="text-sm text-text-secondary">{produit.nom}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Section Variantes du produit */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-text-light" />
            Variantes de couleur
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Ajoutez les différentes couleurs/motifs disponibles pour ce produit.
          </p>

          {/* Liste des variantes existantes */}
          <div className="space-y-3 mb-4">
            {variantes.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-3 bg-cream rounded-lg"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  <img
                    src={v.photo}
                    alt={v.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary">{v.nom}</p>
                </div>
                <button
                  onClick={() => handleDeleteVariante(v.id)}
                  className="p-2 text-text-light hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Formulaire nouvelle variante */}
          <div className="border-t border-cream-dark pt-4">
            <p className="text-sm font-medium text-primary mb-3">Ajouter une variante</p>
            <div className="flex gap-3">
              {/* Upload photo */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${
                  newVariantePhoto
                    ? "border-secondary"
                    : "border-cream-dark hover:border-secondary"
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-text-light" />
                ) : newVariantePhoto ? (
                  <img
                    src={newVariantePhoto}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-text-light" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, "variante")}
                className="hidden"
              />

              {/* Nom + bouton */}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newVarianteNom}
                  onChange={(e) => setNewVarianteNom(e.target.value)}
                  placeholder="Nom (ex: Rouge carroté)"
                  className="flex-1 px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button
                  onClick={handleAddVariante}
                  disabled={!newVarianteNom.trim() || !newVariantePhoto || saving}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Accessoires */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-serif text-lg text-primary mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-text-light" />
            Accessoires inclus
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Ajoutez des accessoires qui accompagnent ce produit (ex: pochette imperméable).
          </p>

          {/* Liste des accessoires */}
          <div className="space-y-4 mb-4">
            {accessoires.map((acc) => (
              <div
                key={acc.id}
                className="border border-cream-dark rounded-lg overflow-hidden"
              >
                {/* Header accessoire */}
                <div className="flex items-center gap-3 p-3 bg-cream">
                  <div className="flex-1">
                    <p className="font-medium text-primary">{acc.nom}</p>
                    <p className="text-xs text-text-light">
                      {acc.variantes.length} variante{acc.variantes.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAccessoire(acc.id)}
                    className="p-2 text-text-light hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Variantes de l'accessoire */}
                <div className="p-3 space-y-2">
                  {acc.variantes.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-2 bg-cream-light rounded-lg"
                    >
                      <div className="w-12 h-12 rounded overflow-hidden bg-white flex-shrink-0">
                        <img
                          src={v.photo}
                          alt={v.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="flex-1 text-sm">{v.nom}</p>
                      <button
                        onClick={() => handleDeleteAccVariante(acc.id, v.id)}
                        className="p-1 text-text-light hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Ajouter variante à cet accessoire */}
                  {activeAccId === acc.id ? (
                    <div className="flex gap-2 mt-2">
                      <div
                        onClick={() => !uploading && accFileInputRef.current?.click()}
                        className={`w-12 h-12 border-2 border-dashed rounded flex items-center justify-center cursor-pointer flex-shrink-0 ${
                          newAccVarPhoto ? "border-secondary" : "border-cream-dark"
                        }`}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : newAccVarPhoto ? (
                          <img
                            src={newAccVarPhoto}
                            alt="Preview"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-text-light" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={newAccVarNom}
                        onChange={(e) => setNewAccVarNom(e.target.value)}
                        placeholder="Nom (ex: Chat)"
                        className="flex-1 px-2 py-1 text-sm border border-cream-dark rounded focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                      <button
                        onClick={() => handleAddAccVariante(acc.id)}
                        disabled={!newAccVarNom.trim() || !newAccVarPhoto || saving}
                        className="px-3 py-1 bg-secondary text-white text-sm rounded hover:bg-secondary/90 disabled:opacity-50"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setActiveAccId(null);
                          setNewAccVarNom("");
                          setNewAccVarPhoto("");
                        }}
                        className="px-2 py-1 text-text-light hover:text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveAccId(acc.id)}
                      className="flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une variante
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <input
            ref={accFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e, "accVariante")}
            className="hidden"
          />

          {/* Ajouter un accessoire */}
          {showAccForm ? (
            <div className="flex gap-2 border-t border-cream-dark pt-4">
              <input
                type="text"
                value={newAccNom}
                onChange={(e) => setNewAccNom(e.target.value)}
                placeholder="Nom de l'accessoire (ex: Pochette imperméable)"
                className="flex-1 px-3 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                onClick={handleAddAccessoire}
                disabled={!newAccNom.trim() || saving}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ajouter"}
              </button>
              <button
                onClick={() => {
                  setShowAccForm(false);
                  setNewAccNom("");
                }}
                className="px-3 py-2 text-text-light hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAccForm(true)}
              className="flex items-center gap-2 text-secondary hover:text-secondary/80 border-t border-cream-dark pt-4 w-full justify-center"
            >
              <Plus className="w-5 h-5" />
              Ajouter un accessoire
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
