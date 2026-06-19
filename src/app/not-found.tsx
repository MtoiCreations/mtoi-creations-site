import Link from "next/link";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="section-padding bg-cream-light min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="container-custom max-w-2xl">
        <p className="font-display text-secondary tracking-widest uppercase mb-4">
          Erreur 404
        </p>
        <h1 className="heading-1 text-primary mb-6">Page introuvable</h1>
        <p className="body-large mb-8">
          Oups ! La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button size="lg">Retour à l&apos;accueil</Button>
          </Link>
          <Link href="/boutique">
            <Button variant="outline" size="lg">
              Voir la boutique
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
