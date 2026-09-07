import Image from "next/image";
import Link from "next/link";

export default function AnimatedLogo() {
  return (
    <Link href="/" aria-label="MToi Créations - Retour à l'accueil" className="flex-shrink-0">
      <Image
        src="/images/logo.png"
        alt="MToi Créations"
        width={320}
        height={180}
        className="h-16 md:h-20 w-auto"
        priority
      />
    </Link>
  );
}
