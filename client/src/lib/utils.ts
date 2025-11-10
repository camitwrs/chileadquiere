import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Gender = "male" | "female" | undefined;

/**
 * Return a (persistent) fallback avatar URL based on name or explicit gender.
 * This function caches the chosen avatar URL in localStorage so the same name/user
 * will keep the same image across page reloads.
 */
export function getAvatarUrl(name?: string, gender?: Gender) {
  // Use randomuser.me portrait endpoints as requested (deterministic index)
  const boyBase = "https://randomuser.me/api/portraits/men";
  const girlBase = "https://randomuser.me/api/portraits/women";

  const femaleHints = ["maría", "maria", "ana", "patricia", "laura", "isabel", "carla", "sofia", "sofía"];

  // Build a stable key from the provided name (or fallback 'anon')
  const seedKey = (name || "anon").toString().trim().toLowerCase().slice(0, 60);
  const storageKey = `chileadquiere:avatar:${encodeURIComponent(seedKey)}`;

  // Try to return cached value when available (browser only)
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const cached = localStorage.getItem(storageKey);
      if (cached) return cached;
    }
  } catch (e) {
    // ignore storage errors
  }

  // Determine endpoint based on gender/name heuristics
  let pick: string;
  if (gender === "female") pick = "girl";
  else if (gender === "male") pick = "boy";
  else if (name) {
    const n = name.toLowerCase();
    const first = n.split(/[\s,]+/)[0] || n;
    if (femaleHints.some((h) => first.includes(h) || first.endsWith("a"))) pick = "girl";
    else pick = "boy";
  } else {
    pick = Math.random() > 0.5 ? "boy" : "girl";
  }

  // Deterministic-ish seed derived from the name so the selected portrait index is stable
  const hash = Math.abs(seedKey.split("").reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0), 0));
  // randomuser has portrait images from 0..99 (we'll use 1..99 for nicer URLs); pick index deterministically
  const idx = (hash % 99) + 1; // 1..99
  const url = pick === "girl" ? `${girlBase}/${idx}.jpg` : `${boyBase}/${idx}.jpg`;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(storageKey, url);
    }
  } catch (e) {
    // ignore storage errors
  }

  return url;
}
