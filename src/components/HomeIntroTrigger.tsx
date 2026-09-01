"use client";

import { useEffect } from "react";
import { useLogoIntroStore } from "@/lib/logoIntroStore";

export default function HomeIntroTrigger() {
  useEffect(() => {
    if (sessionStorage.getItem("mtoi-intro-played")) return;
    sessionStorage.setItem("mtoi-intro-played", "1");
    const t = setTimeout(() => useLogoIntroStore.getState().play(), 400);
    return () => clearTimeout(t);
  }, []);

  return null;
}
