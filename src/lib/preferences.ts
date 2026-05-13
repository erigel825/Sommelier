import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type PrefsRow = { likes: string[]; dislikes: string[]; budget: string; notes: string };
type CellarRow = {
  id: string;
  user_id: string;
  name: string;
  varietal: string | null;
  region: string | null;
  vintage: string | null;
  rating: string;
  notes: string | null;
  added_at: number;
};

// Cast to any for table queries — the tables exist at runtime but aren't in the
// auto-generated types yet (run `supabase gen types` after applying the migration).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

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
  "Bold Reds",
  "Light Reds",
  "Crisp Whites",
  "Rich Whites",
  "Sparkling",
  "Rosé",
  "Dessert",
  "Oaky",
  "Tannic",
  "Buttery",
  "Fruity",
  "Earthy",
  "Mineral",
  "High Acidity",
  "Low Tannin",
  "Dry",
  "Off-Dry",
  "Sweet",
  "Old World",
  "New World",
  "Cabernet Sauvignon",
  "Pinot Noir",
  "Merlot",
  "Syrah",
  "Malbec",
  "Chardonnay",
  "Sauvignon Blanc",
  "Riesling",
  "Champagne",
  "Bordeaux",
  "Burgundy",
  "Napa",
  "Tuscan",
  "Rioja",
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

function localWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    // localStorage unavailable (private browsing / storage quota)
  }
}

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setResolved(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, resolved };
}

export function usePreferences() {
  const { user, resolved } = useCurrentUser();
  const [prefs, setPrefsState] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!resolved) return;

    if (user) {
      db.from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }: { data: PrefsRow | null }) => {
          if (data) {
            setPrefsState({
              likes: data.likes ?? [],
              dislikes: data.dislikes ?? [],
              budget: (data.budget as Preferences["budget"]) ?? "any",
              notes: data.notes ?? "",
            });
          } else {
            // First login: migrate any localStorage data to the cloud
            const local = safeRead(PREF_KEY, DEFAULT_PREFERENCES);
            setPrefsState(local);
            db.from("user_preferences")
              .upsert({
                user_id: user.id,
                likes: local.likes,
                dislikes: local.dislikes,
                budget: local.budget,
                notes: local.notes,
              })
              .then(() => {});
          }
          setHydrated(true);
        });
    } else {
      setPrefsState(safeRead(PREF_KEY, DEFAULT_PREFERENCES));
      setHydrated(true);
    }
  }, [user, resolved]);

  const update = useCallback(
    (next: Preferences) => {
      setPrefsState(next);
      if (user) {
        db.from("user_preferences")
          .upsert({
            user_id: user.id,
            likes: next.likes,
            dislikes: next.dislikes,
            budget: next.budget,
            notes: next.notes,
            updated_at: new Date().toISOString(),
          })
          .then(() => {});
      } else {
        localWrite(PREF_KEY, next);
      }
    },
    [user],
  );

  return { prefs, setPrefs: update, hydrated };
}

export function useCellar() {
  const { user, resolved } = useCurrentUser();
  const [cellar, setCellarState] = useState<CellarEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!resolved) return;

    if (user) {
      db.from("cellar")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false })
        .then(({ data }: { data: CellarRow[] | null }) => {
          if (data && data.length > 0) {
            setCellarState(
              data.map((row) => ({
                id: row.id,
                name: row.name,
                varietal: row.varietal ?? undefined,
                region: row.region ?? undefined,
                vintage: row.vintage ?? undefined,
                rating: row.rating as CellarEntry["rating"],
                notes: row.notes ?? undefined,
                addedAt: row.added_at,
              })),
            );
          } else {
            // First login: migrate localStorage cellar to the cloud
            const local = safeRead<CellarEntry[]>(CELLAR_KEY, []);
            setCellarState(local);
            if (local.length > 0) {
              db.from("cellar")
                .insert(
                  local.map((e: CellarEntry) => ({
                    id: e.id,
                    user_id: user.id,
                    name: e.name,
                    varietal: e.varietal ?? null,
                    region: e.region ?? null,
                    vintage: e.vintage ?? null,
                    rating: e.rating,
                    notes: e.notes ?? null,
                    added_at: e.addedAt,
                  })),
                )
                .then(() => {});
            }
          }
          setHydrated(true);
        });
    } else {
      setCellarState(safeRead<CellarEntry[]>(CELLAR_KEY, []));
      setHydrated(true);
    }
  }, [user, resolved]);

  const add = (entry: Omit<CellarEntry, "id" | "addedAt">): boolean => {
    const duplicate = cellar.some(
      (e) => e.name.trim().toLowerCase() === entry.name.trim().toLowerCase(),
    );
    if (duplicate) return false;

    const newEntry: CellarEntry = { ...entry, id: crypto.randomUUID(), addedAt: Date.now() };
    const next = [newEntry, ...cellar];
    setCellarState(next);

    if (user) {
      db.from("cellar")
        .insert({
          id: newEntry.id,
          user_id: user.id,
          name: newEntry.name,
          varietal: newEntry.varietal ?? null,
          region: newEntry.region ?? null,
          vintage: newEntry.vintage ?? null,
          rating: newEntry.rating,
          notes: newEntry.notes ?? null,
          added_at: newEntry.addedAt,
        })
        .then(() => {});
    } else {
      localWrite(CELLAR_KEY, next);
    }
    return true;
  };

  const remove = (id: string) => {
    const next = cellar.filter((e) => e.id !== id);
    setCellarState(next);
    if (user) {
      db.from("cellar")
        .delete()
        .eq("id", id)
        .then(() => {});
    } else {
      localWrite(CELLAR_KEY, next);
    }
  };

  const isInCellar = (name: string) =>
    cellar.some((e) => e.name.trim().toLowerCase() === name.trim().toLowerCase());

  return { cellar, add, remove, isInCellar, hydrated };
}
