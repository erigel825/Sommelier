import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { TASTE_TAGS, usePreferences } from "@/lib/preferences";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your palate — Vintage.AI" },
      { name: "description", content: "Calibrate your taste profile to sharpen every recommendation." },
    ],
  }),
  component: ProfilePage,
});

const BUDGETS: Array<{ value: "value" | "mid" | "premium" | "any"; label: string; desc: string }> = [
  { value: "value", label: "Value", desc: "Under $40 / glass under $14" },
  { value: "mid", label: "Mid", desc: "$40–$120 / glass $14–$25" },
  { value: "premium", label: "Premium", desc: "$120+ / no ceiling" },
  { value: "any", label: "No limit", desc: "Surprise me" },
];

function ProfilePage() {
  const { prefs, setPrefs, hydrated } = usePreferences();
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show a brief "Saved" flash whenever prefs change after initial hydration.
  const isFirst = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (isFirst.current) { isFirst.current = false; return; }
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 2000);
  }, [prefs, hydrated]);

  const toggle = (tag: string, list: "likes" | "dislikes") => {
    const inList = prefs[list].includes(tag);
    const otherList = list === "likes" ? "dislikes" : "likes";
    setPrefs({
      ...prefs,
      [list]: inList ? prefs[list].filter((t) => t !== tag) : [...prefs[list], tag],
      [otherList]: prefs[otherList].filter((t) => t !== tag),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
        <header className="mb-12 animate-reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">Palate Profile</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl text-balance">
            Tune what you love. Skip what you don't.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Tap once to like, twice to dismiss. Changes are saved automatically.
          </p>
        </header>

        <section className="mb-12 animate-reveal">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gold/80">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {TASTE_TAGS.map((tag) => {
              const liked = prefs.likes.includes(tag);
              const disliked = prefs.dislikes.includes(tag);
              const onClick = () => toggle(tag, liked ? "dislikes" : "likes");
              return (
                <button
                  key={tag}
                  onClick={onClick}
                  className={[
                    "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                    liked
                      ? "border-merlot/60 bg-merlot/20 text-foreground"
                      : disliked
                      ? "border-white/10 bg-card/30 text-muted-foreground/50 line-through"
                      : "border-white/10 bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                  ].join(" ")}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-12 animate-reveal">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gold/80">Budget</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {BUDGETS.map((b) => {
              const active = prefs.budget === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => setPrefs({ ...prefs, budget: b.value })}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-gold/50 bg-gold/5"
                      : "border-white/10 bg-card/40 hover:border-gold/30",
                  ].join(" ")}
                >
                  <div className={`font-serif text-xl ${active ? "text-gold" : "text-foreground"}`}>{b.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{b.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-12 animate-reveal">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gold/80">Notes for your sommelier</h2>
          <textarea
            value={prefs.notes}
            onChange={(e) => setPrefs({ ...prefs, notes: e.target.value })}
            placeholder="I'm new to natural wines but curious. Allergic to sulfites? Avoid heavy oak."
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-2xl border border-white/10 bg-card/40 p-4 text-sm text-foreground outline-none transition focus:border-gold/40"
          />
        </section>

        <div className="flex items-center justify-between rounded-2xl border border-gold/20 bg-gold/5 px-6 py-4 animate-reveal">
          <p className="text-sm text-foreground/80">
            <span className="font-medium text-gold">{prefs.likes.length}</span> liked ·{" "}
            <span className="font-medium text-foreground/60">{prefs.dislikes.length}</span> avoided
          </p>
          <div
            className={[
              "flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest transition-opacity duration-500",
              saved ? "text-gold opacity-100" : "text-muted-foreground/40 opacity-100",
            ].join(" ")}
          >
            {saved && <Check className="size-3" />}
            {saved ? "Saved" : "Autosaved"}
          </div>
        </div>
      </main>
    </div>
  );
}
