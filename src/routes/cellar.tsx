import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useCellar, type CellarEntry } from "@/lib/preferences";

export const Route = createFileRoute("/cellar")({
  head: () => ({
    meta: [
      { title: "Your cellar — Vintage.AI" },
      { name: "description", content: "Log every wine you've tried. Liked, loved, or never again." },
    ],
  }),
  component: CellarPage,
});

const RATINGS: Array<{ value: CellarEntry["rating"]; label: string; tone: string }> = [
  { value: "loved", label: "Loved", tone: "border-gold/50 bg-gold/15 text-gold" },
  { value: "liked", label: "Liked", tone: "border-merlot/50 bg-merlot/20 text-foreground" },
  { value: "ok", label: "OK", tone: "border-white/10 bg-card/60 text-muted-foreground" },
  { value: "disliked", label: "Skip", tone: "border-destructive/40 bg-destructive/10 text-destructive-foreground" },
];

function CellarPage() {
  const { cellar, add, remove } = useCellar();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "", varietal: "", region: "", vintage: "", rating: "liked" as CellarEntry["rating"], notes: "",
  });

  function save() {
    if (!draft.name.trim()) { toast.message("Give the wine a name."); return; }
    add(draft);
    setDraft({ name: "", varietal: "", region: "", vintage: "", rating: "liked", notes: "" });
    setOpen(false);
    toast.success("Added to cellar");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
        <header className="mb-10 flex items-end justify-between gap-6 animate-reveal">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">Cellar</p>
            <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl text-balance">
              Wines you've poured.
            </h1>
            <p className="mt-3 max-w-lg text-muted-foreground">
              {cellar.length === 0
                ? "Empty for now. Each entry teaches your sommelier."
                : `${cellar.length} ${cellar.length === 1 ? "wine" : "wines"} logged.`}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-merlot px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-merlot/90"
          >
            <Plus className="size-4" /> Log a wine
          </button>
        </header>

        {open && (
          <section className="mb-10 animate-reveal rounded-3xl border border-gold/20 bg-card/70 p-6 md:p-8">
            <h2 className="mb-5 font-serif text-2xl text-foreground">New entry</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Wine name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Château Margaux" />
              <Field label="Vintage" value={draft.vintage} onChange={(v) => setDraft({ ...draft, vintage: v })} placeholder="2018" />
              <Field label="Varietal" value={draft.varietal} onChange={(v) => setDraft({ ...draft, varietal: v })} placeholder="Cabernet Sauvignon" />
              <Field label="Region" value={draft.region} onChange={(v) => setDraft({ ...draft, region: v })} placeholder="Bordeaux" />
            </div>

            <div className="mt-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">Rating</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {RATINGS.map((r) => {
                  const active = draft.rating === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setDraft({ ...draft, rating: r.value })}
                      className={[
                        "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                        active ? r.tone : "border-white/10 bg-card/40 text-muted-foreground hover:border-white/20",
                      ].join(" ")}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">Notes</span>
              <textarea
                rows={3}
                maxLength={400}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Plush tannins, brambly fruit, long finish."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-background/60 p-3 text-sm text-foreground outline-none focus:border-gold/40"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="rounded-xl px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={save} className="rounded-xl bg-merlot px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-merlot/90">Save</button>
            </div>
          </section>
        )}

        {cellar.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-card/40 p-12 text-center">
            <p className="font-serif text-2xl text-foreground/80">An empty cellar is just a beginning.</p>
            <p className="mt-2 text-sm text-muted-foreground">Tap "Log a wine" to start your taste history.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cellar.map((w) => {
              const tone = RATINGS.find((r) => r.value === w.rating)?.tone ?? "";
              return (
                <li
                  key={w.id}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-card/40 p-5 transition hover:border-gold/30 animate-reveal"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-medium text-foreground">{w.name}</h3>
                      {w.vintage && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {w.vintage}
                        </span>
                      )}
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
                        {w.rating}
                      </span>
                    </div>
                    {(w.varietal || w.region) && (
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        {[w.varietal, w.region].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    {w.notes && <p className="mt-2 text-sm text-foreground/75">{w.notes}</p>}
                  </div>
                  <button
                    onClick={() => remove(w.id)}
                    className="rounded-full border border-white/5 p-2 opacity-0 transition group-hover:opacity-100 hover:border-destructive/50 hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={120}
        className="mt-2 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold/40"
      />
    </label>
  );
}
