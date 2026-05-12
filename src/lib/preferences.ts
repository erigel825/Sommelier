import { useEffect, useState, useCallback } from "react";

export type Preferences = {
  likes: string[];
  dislikes: string[];
  budget: "value" | "mid" | "premium" | "any";
  notes: string;
};

export type CellarEntry = {
  id: string;
  name: string;
  varietal?: string;
  region?: string;
  vintage?: string;
  rating: "loved" | "liked" | "ok" | "disliked";
  notes?: string;
  addedAt: number;
};

const PREF_KEY = "vintage:preferences";
const CELLAR_KEY = "vintage:cellar";

export const DEFAULT_PREFERENCES: Preferences = {
  likes: [],
  dislikes: [],
  budget: "any",
  notes: "",
};

export const TASTE_TAGS = [
  "Bold Reds", "Light Reds", "Crisp Whites", "Rich Whites",
  "Sparkling", "Rosé", "Dessert",
  "Oaky", "Tannic", "Buttery", "Fruity", "Earthy", "Mineral",
  "High Acidity", "Low Tannin", "Dry", "Off-Dry", "Sweet",
  "Old World", "New World",
  "Cabernet Sauvignon", "Pinot Noir", "Merlot", "Syrah", "Malbec",
  "Chardonnay", "Sauvignon Blanc", "Riesling", "Champagne",
  "Bordeaux", "Burgundy", "Napa", "Tuscan", "Rioja",
];

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(safeRead(PREF_KEY, DEFAULT_PREFERENCES));
    setHydrated(true);
  }, []);

  const update = useCallback((next: Preferences) => {
    setPrefs(next);
    try { window.localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch {}
  }, []);

  return { prefs, setPrefs: update, hydrated };
}

export function useCellar() {
  const [cellar, setCellar] = useState<CellarEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCellar(safeRead<CellarEntry[]>(CELLAR_KEY, []));
    setHydrated(true);
  }, []);

  const persist = (next: CellarEntry[]) => {
    setCellar(next);
    try { window.localStorage.setItem(CELLAR_KEY, JSON.stringify(next)); } catch {}
  };

  const add = (entry: Omit<CellarEntry, "id" | "addedAt">): boolean => {
    const duplicate = cellar.some(
      (e) => e.name.trim().toLowerCase() === entry.name.trim().toLowerCase(),
    );
    if (duplicate) return false;
    persist([{ ...entry, id: crypto.randomUUID(), addedAt: Date.now() }, ...cellar]);
    return true;
  };
  const remove = (id: string) => persist(cellar.filter((e) => e.id !== id));
  const isInCellar = (name: string) =>
    cellar.some((e) => e.name.trim().toLowerCase() === name.trim().toLowerCase());

  return { cellar, add, remove, isInCellar, hydrated };
}
