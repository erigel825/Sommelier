import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Loader2, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { WineCard, type Recommendation } from "@/components/WineCard";
import { usePreferences, useCellar } from "@/lib/preferences";
import { callSommelier, fileToDataUrl } from "@/lib/sommelier";

export const Route = createFileRoute("/pair")({
  head: () => ({
    meta: [
      { title: "Pair with food — Vintage.AI" },
      {
        name: "description",
        content: "Tell us what you're eating and get the best wines from the list to match.",
      },
    ],
  }),
  component: PairPage,
});

function PairPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [wineListText, setWineListText] = useState("");
  const [food, setFood] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState("");
  const { prefs } = usePreferences();
  const { cellar, add, isInCellar } = useCellar();

  async function onFile(file: File) {
    setImageDataUrl(await fileToDataUrl(file));
  }

  async function pair() {
    if (!food.trim()) {
      toast.message("Tell us what you're eating first.");
      return;
    }
    if (!imageDataUrl && !wineListText.trim()) {
      toast.message("Add a wine list — photo or pasted text.");
      return;
    }
    setLoading(true);
    setRecs([]);
    try {
      const res = await callSommelier({
        mode: "pair",
        food,
        imageDataUrl: imageDataUrl ?? undefined,
        wineListText: wineListText.trim() || undefined,
        preferences: prefs,
        cellar,
      });
      if (res.error) toast.error(res.error);
      else {
        setRecs(res.recommendations || []);
        setSummary(res.summary || "");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function saveToCellar(rec: Recommendation) {
    const added = add({
      name: rec.name,
      varietal: rec.varietal,
      region: rec.region,
      vintage: rec.vintage,
      rating: "liked",
      notes: rec.reasoning,
    });
    if (added) toast.success(`${rec.name} saved`);
    else toast.message(`${rec.name} is already in your cellar`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
        <header className="mb-10 animate-reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">Pair</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl text-balance">
            What's on the plate?
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Describe the dish — we'll match it against the list with the right structure, acidity,
            and weight.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="animate-reveal space-y-5">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
                The dish
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-card/40 px-4 py-3 focus-within:border-gold/40">
                <ChefHat className="size-4 text-gold" />
                <input
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  placeholder="Duck confit with cherry reduction"
                  maxLength={200}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
                Wine list (photo)
              </span>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-2 grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-card/40 transition hover:border-gold/40"
              >
                {imageDataUrl ? (
                  <img src={imageDataUrl} alt="Wine list" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Camera className="size-6 text-gold" />
                    <span className="text-xs uppercase tracking-widest">Capture or upload</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
                Or paste the list
              </span>
              <textarea
                value={wineListText}
                onChange={(e) => setWineListText(e.target.value)}
                placeholder={
                  "Pinot Noir, Domaine Drouhin 2019 — $78\nBarolo, Vietti 2018 — $145\n…"
                }
                rows={6}
                maxLength={4000}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-card/40 p-4 text-sm text-foreground outline-none transition focus:border-gold/40"
              />
            </label>

            <button
              onClick={pair}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-merlot px-6 py-4 text-sm font-medium text-primary-foreground transition hover:bg-merlot/90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Pairing…" : "Pair top 5"}
            </button>
          </div>

          <div className="animate-reveal">
            {summary && (
              <div className="mb-5 rounded-2xl border border-gold/20 bg-gold/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
                  Sommelier's note
                </p>
                <p className="mt-2 text-sm italic text-foreground/85">{summary}</p>
              </div>
            )}
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl border border-white/5 bg-card/40 shimmer-gold"
                  />
                ))}
              </div>
            ) : recs.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-card/40 p-10 text-center text-sm text-muted-foreground">
                Your five pairings will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {recs.map((r, i) => (
                  <WineCard
                    key={i}
                    rec={r}
                    index={i}
                    onSave={saveToCellar}
                    inCellar={isInCellar(r.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
