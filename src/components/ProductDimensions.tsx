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
    <div className="border border-encre/10 bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Ruler className="h-5 w-5 text-framboise" />
        <span className="font-titre text-encre">Dimensions</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        {largeur && (
          <div>
            <p className="font-titre text-2xl text-framboise">{largeur}</p>
            <p className="text-xs text-encre/70">Largeur ({uniteLabel})</p>
          </div>
        )}
        {hauteur && (
          <div>
            <p className="font-titre text-2xl text-framboise">{hauteur}</p>
            <p className="text-xs text-encre/70">Hauteur ({uniteLabel})</p>
          </div>
        )}
        {profondeur && (
          <div>
            <p className="font-titre text-2xl text-framboise">{profondeur}</p>
            <p className="text-xs text-encre/70">Profondeur ({uniteLabel})</p>
          </div>
        )}
      </div>
    </div>
  );
}
