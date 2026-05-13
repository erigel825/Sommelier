import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { WineCard, type Recommendation } from "@/components/WineCard";
import { usePreferences, useCellar } from "@/lib/preferences";
import { callSommelier, fileToDataUrl } from "@/lib/sommelier";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a wine list — Vintage.AI" },
      {
        name: "description",
        content: "Take a photo of any wine list and get five tailored recommendations.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<string>("");
  const { prefs } = usePreferences();
  const { cellar, add, isInCellar } = useCellar();

  async function onFile(file: File) {
    const url = await fileToDataUrl(file);
    setImageDataUrl(url);
    setRecs([]);
    setSummary("");
  }

  async function analyze() {
    if (!imageDataUrl) return;
    setLoading(true);
    setRecs([]);
    try {
      const res = await callSommelier({
        mode: "scan",
        imageDataUrl,
        preferences: prefs,
        cellar,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        setRecs(res.recommendations || []);
        setSummary(res.summary || "");
        if (!res.recommendations?.length)
          toast.message("No bottles read from that image — try a clearer shot.");
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
    if (added) toast.success(`${rec.name} added to your cellar`);
    else toast.message(`${rec.name} is already in your cellar`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
        <header className="mb-10 animate-reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">Scan</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl text-balance">
            Show me the list.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Snap a clean photo of the wine list. Better light, better picks.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="animate-reveal">
            <div
              onClick={() => fileRef.current?.click()}
              className="group relative grid aspect-[4/5] cursor-pointer place-items-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-card/40 text-center transition hover:border-gold/40 hover:bg-card"
            >
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Wine list" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4 px-6">
                  <div className="grid size-16 place-items-center rounded-full bg-merlot/30 ring-1 ring-merlot/50">
                    <Camera className="size-7 text-gold" strokeWidth={1.4} />
                  </div>
                  <p className="font-serif text-xl text-foreground">Tap to capture or upload</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    JPG · PNG · HEIC
                  </p>
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
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-foreground transition hover:bg-white/5"
              >
                <Upload className="size-4" /> Choose another
              </button>
              <button
                onClick={analyze}
                disabled={!imageDataUrl || loading}
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl bg-merlot px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-merlot/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? "Reading the list…" : "Recommend top 5"}
              </button>
            </div>
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

            {loading && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl border border-white/5 bg-card/40 shimmer-gold"
                  />
                ))}
              </div>
            )}

            {!loading && recs.length === 0 && !summary && (
              <div className="rounded-2xl border border-white/5 bg-card/40 p-10 text-center text-sm text-muted-foreground">
                Your five recommendations will appear here.
              </div>
            )}

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
          </div>
        </section>
      </main>
    </div>
  );
}
