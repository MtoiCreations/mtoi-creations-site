"use client";

import { Avis } from "@/types";
import { Star, CheckCircle } from "lucide-react";

interface ProductReviewsProps {
  avis: Avis[];
}

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= note
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProductReviews({ avis }: ProductReviewsProps) {
  if (!avis || avis.length === 0) return null;

  const moyenneNote = avis.reduce((acc, a) => acc + a.note, 0) / avis.length;

  return (
    <div className="mt-8 pt-8 border-t border-cream-dark">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl text-primary">Avis clients</h2>
        <div className="flex items-center gap-2">
          <StarRating note={Math.round(moyenneNote)} />
          <span className="text-sm text-text-secondary">
            ({avis.length} avis)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {avis.map((avisItem) => (
          <div
            key={avisItem.id}
            className="p-4 bg-cream rounded-card"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">{avisItem.auteur}</span>
                  {avisItem.verifie && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Achat vérifié
                    </span>
                  )}
                </div>
                <StarRating note={avisItem.note} />
              </div>
              <span className="text-xs text-text-light">
                {formatDate(avisItem.date)}
              </span>
            </div>
            <p className="text-text-secondary text-sm mt-2">
              {avisItem.commentaire}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
