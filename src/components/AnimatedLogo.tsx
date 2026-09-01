"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useLogoIntroStore } from "@/lib/logoIntroStore";

const TWINKLE_COLORS = ["#FFFFFF", "#FFE1A8", "#FFC978", "#FFD1DC"];
const GOLDEN_ANGLE = 137.508;
const IDLE_SPARKLE_COUNT = 9;

function buildIdleSparkles() {
  return Array.from({ length: IDLE_SPARKLE_COUNT }, (_, i) => {
    const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
    const radius = 30 + ((i * 17) % 45);
    return {
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius * 0.6,
      size: 2 + (i % 3) * 1.5,
      duration: 1.8 + (i % 4) * 0.5,
      delay: (i * 0.35) % 2.5,
      color: TWINKLE_COLORS[i % TWINKLE_COLORS.length],
    };
  });
}

export default function AnimatedLogo() {
  const phase = useLogoIntroStore((s) => s.phase);
  const play = useLogoIntroStore((s) => s.play);
  const sparkles = useMemo(buildIdleSparkles, []);

  const hidden = phase === "toCenter" || phase === "giant" || phase === "toOrigin";

  return (
    <Link
      id="mtoi-logo-anchor"
      href="/"
      onClick={() => play()}
      aria-label="MToi Créations - Retour à l'accueil"
      className="relative inline-block flex-shrink-0 h-16 sm:h-20 md:h-24 w-[140px] sm:w-[170px] md:w-[200px]"
    >
      <Image
        src="/images/logo.png"
        alt="MToi Créations"
        fill
        sizes="200px"
        className="object-contain transition-opacity duration-300 ease-out"
        style={{ opacity: hidden ? 0 : 1 }}
        priority
      />

      {!hidden &&
        sparkles.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="mtoi-sparkle pointer-events-none absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
    </Link>
  );
}
