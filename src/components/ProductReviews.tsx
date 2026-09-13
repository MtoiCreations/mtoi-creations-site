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
              ? "fill-safran text-safran"
              : "fill-encre/10 text-encre/10"
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
    <div className="mt-8 border-t border-encre/10 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-titre text-xl text-encre">Avis clients</h2>
        <div className="flex items-center gap-2">
          <StarRating note={Math.round(moyenneNote)} />
          <span className="text-sm text-encre/70">
            ({avis.length} avis)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {avis.map((avisItem) => (
          <div
            key={avisItem.id}
            className="border border-encre/10 bg-surface p-4"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-encre">{avisItem.auteur}</span>
                  {avisItem.verifie && (
                    <span className="inline-flex items-center gap-1 text-xs text-lichen">
                      <CheckCircle className="h-3 w-3" />
                      Achat vérifié
                    </span>
                  )}
                </div>
                <StarRating note={avisItem.note} />
              </div>
              <span className="text-xs text-encre/50">
                {formatDate(avisItem.date)}
              </span>
            </div>
            <p className="mt-2 font-corps text-sm text-encre/80">
              {avisItem.commentaire}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
