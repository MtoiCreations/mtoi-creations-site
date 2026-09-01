"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const SPARKLE_COLORS = ["#FFFFFF", "#FFE1A8", "#FFC978", "#FFD1DC", "#FDF6EC"];
const GOLDEN_ANGLE = 137.508;
const PARTICLE_COUNT = 180;
const EXPLODE_MS = 650;

interface Particle {
  baseLeft: number;
  baseTop: number;
  tx: number;
  ty: number;
  rotate: number;
  size: number;
  delay: number;
  color: string;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
    const distance = 50 + ((i * 37) % 220);
    return {
      baseLeft: (i * 53) % 100,
      baseTop: (i * 29) % 100,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      rotate: (i * 47) % 360,
      size: 3 + (i % 5) * 2,
      delay: (i % 14) * 18,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
    };
  });
}

export default function AnimatedLogo() {
  const elRef = useRef<HTMLAnchorElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [exploded, setExploded] = useState(false);
  const busyRef = useRef(false);
  const particles = useMemo(buildParticles, []);

  useLayoutEffect(() => {
    if (box === null && elRef.current) {
      const r = elRef.current.getBoundingClientRect();
      setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
  }, [box]);

  useEffect(() => {
    function handleResize() {
      setBox((prev) => {
        if (!prev) return prev;
        const maxLeft = Math.max(window.innerWidth - prev.width, 0);
        const maxTop = Math.max(window.innerHeight - prev.height, 0);
        return {
          ...prev,
          left: Math.min(Math.max(prev.left, 0), maxLeft),
          top: Math.min(Math.max(prev.top, 0), maxTop),
        };
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleEnter() {
    if (busyRef.current || !box) return;
    busyRef.current = true;
    setExploded(true);

    setTimeout(() => {
      setBox((prev) => {
        if (!prev) return prev;
        const maxLeft = Math.max(window.innerWidth - prev.width, 0);
        const maxTop = Math.max(window.innerHeight - prev.height, 0);
        return {
          ...prev,
          left: Math.random() * maxLeft,
          top: Math.random() * maxTop,
        };
      });
      setExploded(false);
      setTimeout(() => {
        busyRef.current = false;
      }, EXPLODE_MS);
    }, EXPLODE_MS);
  }

  const sizeClasses = "h-16 sm:h-20 md:h-24 w-[140px] sm:w-[170px] md:w-[200px]";

  return (
    <>
      <Link
        ref={elRef}
        href="/"
        onMouseEnter={handleEnter}
        aria-label="MToi Créations - Retour à l'accueil"
        className={box ? "fixed z-[999] block" : `relative inline-block flex-shrink-0 ${sizeClasses}`}
        style={
          box
            ? { top: box.top, left: box.left, width: box.width, height: box.height }
            : undefined
        }
      >
        <Image
          src="/images/logo.png"
          alt="MToi Créations"
          fill
          sizes="200px"
          className="object-contain transition-all duration-500 ease-out"
          style={{
            opacity: exploded ? 0 : 1,
            filter: exploded ? "blur(3px)" : "blur(0px)",
            transform: exploded ? "scale(0.5) rotate(8deg)" : "scale(1) rotate(0deg)",
          }}
          priority
        />

        {particles.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${p.baseLeft}%`,
              top: `${p.baseTop}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size}px ${p.color}`,
              opacity: exploded ? 1 : 0,
              transform: exploded
                ? `translate(-50%, -50%) translate(${p.tx}px, ${p.ty}px) rotate(${p.rotate}deg) scale(1)`
                : "translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0)",
              transition: `transform ${EXPLODE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${
                EXPLODE_MS - 100
              }ms ease-out`,
              transitionDelay: exploded ? `${p.delay}ms` : `${(PARTICLE_COUNT - i) * 1}ms`,
            }}
          />
        ))}
      </Link>

      {box && <div className={sizeClasses} aria-hidden />}
    </>
  );
}
