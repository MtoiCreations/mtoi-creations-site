"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLogoIntroStore } from "@/lib/logoIntroStore";

const SPARK_COLORS = ["#FFFFFF", "#FFE1A8", "#FFC978", "#FFD1DC", "#FDF6EC"];
const TRAIL_COUNT = 46;
const BURST_COUNT = 140;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export default function LogoIntroOverlay() {
  const phase = useLogoIntroStore((s) => s.phase);
  const origin = useLogoIntroStore((s) => s.origin);
  const runId = useLogoIntroStore((s) => s.runId);

  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState(false);

  const trail = useMemo(() => {
    if (!origin || typeof window === "undefined") return [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const ox = origin.left + origin.width / 2;
    const oy = origin.top + origin.height / 2;
    return Array.from({ length: TRAIL_COUNT }, (_, i) => ({
      sx: ox + rand(-origin.width / 2, origin.width / 2),
      sy: oy + rand(-origin.height / 2, origin.height / 2),
      ex: cx + rand(-50, 50),
      ey: cy + rand(-50, 50),
      size: rand(3, 7),
      delay: rand(0, 320),
      color: pick(SPARK_COLORS, i),
    }));
  }, [runId, origin]);

  const burstOut = useMemo(() => {
    if (typeof window === "undefined") return [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    return Array.from({ length: BURST_COUNT }, (_, i) => {
      const edge = i % 4;
      let ex = cx;
      let ey = cy;
      if (edge === 0) {
        ex = rand(0, cx * 2);
        ey = -100;
      } else if (edge === 1) {
        ex = cx * 2 + 100;
        ey = rand(0, cy * 2);
      } else if (edge === 2) {
        ex = rand(0, cx * 2);
        ey = cy * 2 + 100;
      } else {
        ex = -100;
        ey = rand(0, cy * 2);
      }
      return {
        sx: cx + rand(-cx * 0.35, cx * 0.35),
        sy: cy + rand(-cy * 0.3, cy * 0.3),
        ex,
        ey,
        size: rand(3, 8),
        delay: rand(0, 280),
        color: pick(SPARK_COLORS, i),
      };
    });
  }, [runId]);

  useEffect(() => {
    if (phase === "toCenter" || phase === "toOrigin" || phase === "dissolving") {
      setStep(false);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setStep(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
    if (phase === "giant") {
      setRevealed(false);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setRevealed(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [phase, runId]);

  if (phase === "idle" || !origin) return null;

  const giantVisible = phase === "toOrigin" || (phase === "giant" && revealed);
  const giantClip =
    phase === "giant" && !revealed ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)";
  const giantOpacity = phase === "dissolving" ? (step ? 0 : 1) : giantVisible ? 1 : 0;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden">
      {phase === "toCenter" &&
        trail.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="fixed rounded-full"
            style={{
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              transform: step
                ? `translate(${p.ex}px, ${p.ey}px)`
                : `translate(${p.sx}px, ${p.sy}px)`,
              opacity: step ? 1 : 0,
              transition: `transform 800ms cubic-bezier(0.3,0.8,0.4,1) ${p.delay}ms, opacity 350ms ease-out ${p.delay}ms`,
            }}
          />
        ))}

      {phase === "toOrigin" &&
        trail.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="fixed rounded-full"
            style={{
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              transform: step
                ? `translate(${p.sx}px, ${p.sy}px)`
                : `translate(${p.ex}px, ${p.ey}px)`,
              opacity: step ? 0 : 1,
              transition: `transform 800ms cubic-bezier(0.3,0.8,0.4,1) ${p.delay}ms, opacity 800ms ease-in ${p.delay}ms`,
            }}
          />
        ))}

      {(phase === "giant" || phase === "toOrigin" || phase === "dissolving") && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: "min(92vw, 92vh, 1400px)",
              height: "min(92vw, 92vh, 1400px)",
              opacity: giantOpacity,
              clipPath: giantClip,
              filter: "drop-shadow(0 0 50px rgba(255,201,120,0.55))",
              transition:
                phase === "dissolving"
                  ? "opacity 950ms ease-in"
                  : "opacity 400ms ease-out, clip-path 950ms cubic-bezier(0.65,0,0.35,1)",
            }}
          >
            <Image
              src="/images/logo.png"
              alt="MToi Créations"
              fill
              sizes="1400px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {phase === "dissolving" &&
        burstOut.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="fixed rounded-full"
            style={{
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              transform: step
                ? `translate(${p.ex}px, ${p.ey}px)`
                : `translate(${p.sx}px, ${p.sy}px)`,
              opacity: step ? 0 : 1,
              transition: `transform 950ms cubic-bezier(0.2,0.6,0.4,1) ${p.delay}ms, opacity 950ms ease-in ${p.delay}ms`,
            }}
          />
        ))}
    </div>
  );
}
