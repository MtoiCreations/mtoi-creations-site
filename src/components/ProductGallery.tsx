"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  photos: string[];
  alt: string;
  nomProduit?: string;
}

export default function ProductGallery({ photos, alt, nomProduit }: ProductGalleryProps) {
  const productName = alt || nomProduit || "Produit";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious();
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-fond">
        <p className="font-corps text-encre/70">Aucune photo pour l’instant</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-fond"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={photos[currentIndex]}
          alt={`${productName} - Photo ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
        />

        {/* Flèches de navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-[4px] bg-surface/90 p-2 shadow-soft transition-all hover:bg-surface"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-6 w-6 text-encre" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[4px] bg-surface/90 p-2 shadow-soft transition-all hover:bg-surface"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-6 w-6 text-encre" />
            </button>
          </>
        )}

        {/* Indicateur de position */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-framboise"
                    : "w-2 bg-surface/80 hover:bg-surface"
                }`}
                aria-label={`Aller à la photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vignettes */}
      {photos.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-20 w-16 flex-shrink-0 overflow-hidden bg-fond transition-all ${
                index === currentIndex
                  ? "ring-2 ring-framboise ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={photo}
                alt={`${productName} - Vignette ${index + 1}`}
                fill
                className="object-contain"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
