"use client";

import { Dimensions } from "@/types";
import { Ruler } from "lucide-react";

interface ProductDimensionsProps {
  dimensions: Dimensions;
}

export default function ProductDimensions({ dimensions }: ProductDimensionsProps) {
  const { largeur, hauteur, profondeur, unite } = dimensions;
  const uniteLabel = unite === "cm" ? "cm" : "po";

  const hasDimensions = largeur || hauteur || profondeur;

  if (!hasDimensions) return null;

  return (
    <div className="p-4 bg-cream rounded-card">
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="h-5 w-5 text-secondary" />
        <span className="font-display text-primary">Dimensions</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        {largeur && (
          <div>
            <p className="text-2xl font-display text-secondary">{largeur}</p>
            <p className="text-xs text-text-secondary">Largeur ({uniteLabel})</p>
          </div>
        )}
        {hauteur && (
          <div>
            <p className="text-2xl font-display text-secondary">{hauteur}</p>
            <p className="text-xs text-text-secondary">Hauteur ({uniteLabel})</p>
          </div>
        )}
        {profondeur && (
          <div>
            <p className="text-2xl font-display text-secondary">{profondeur}</p>
            <p className="text-xs text-text-secondary">Profondeur ({uniteLabel})</p>
          </div>
        )}
      </div>
    </div>
  );
}
