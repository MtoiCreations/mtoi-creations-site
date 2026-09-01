"use client";

import { create } from "zustand";

export type LogoIntroPhase = "idle" | "toCenter" | "giant" | "toOrigin" | "dissolving";

export interface LogoOrigin {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface LogoIntroState {
  phase: LogoIntroPhase;
  origin: LogoOrigin | null;
  runId: number;
  play: () => void;
}

const DURATIONS = {
  toCenter: 800,
  giant: 1400,
  toOrigin: 800,
  dissolving: 950,
};

export const useLogoIntroStore = create<LogoIntroState>()((set, get) => ({
  phase: "idle",
  origin: null,
  runId: 0,

  play: () => {
    if (get().phase !== "idle") return;
    if (typeof window === "undefined") return;

    const el = document.getElementById("mtoi-logo-anchor");
    const rect = el?.getBoundingClientRect();
    const origin: LogoOrigin = rect
      ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      : { top: 24, left: 24, width: 160, height: 64 };

    const runId = get().runId + 1;
    set({ phase: "toCenter", origin, runId });

    let elapsed = DURATIONS.toCenter;
    setTimeout(() => set({ phase: "giant" }), elapsed);

    elapsed += DURATIONS.giant;
    setTimeout(() => set({ phase: "toOrigin" }), elapsed);

    elapsed += DURATIONS.toOrigin;
    setTimeout(() => set({ phase: "dissolving" }), elapsed);

    elapsed += DURATIONS.dissolving;
    setTimeout(() => set({ phase: "idle", origin: null }), elapsed);
  },
}));

export const LOGO_INTRO_DURATIONS = DURATIONS;
