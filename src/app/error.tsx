"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream-light flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl text-primary mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-text-secondary mb-8">
          Désolé, quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-secondary text-white rounded-button hover:bg-secondary/90 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-secondary text-secondary rounded-button hover:bg-secondary/10 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
