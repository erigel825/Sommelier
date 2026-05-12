import { Check, Plus, Wine } from "lucide-react";

export type Recommendation = {
  name: string;
  varietal?: string;
  region?: string;
  vintage?: string;
  format?: string;
  price?: string;
  matchScore: number;
  reasoning: string;
};

export function WineCard({
  rec,
  index,
  onSave,
  inCellar = false,
}: {
  rec: Recommendation;
  index: number;
  onSave?: (rec: Recommendation) => void;
  inCellar?: boolean;
}) {
  return (
    <div className="group animate-reveal flex items-start gap-6 rounded-2xl border border-white/5 bg-card/40 p-6 transition-all hover:border-gold/30 hover:bg-card/70">
      <span className="font-serif text-4xl text-muted-foreground/40 transition-colors group-hover:text-gold">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="hidden size-20 shrink-0 place-items-center rounded-xl bg-merlot-deep/40 ring-1 ring-white/5 sm:grid">
        <Wine className="size-8 text-gold/60" strokeWidth={1.2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-medium text-foreground">{rec.name}</h3>
          {rec.vintage && (
            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {rec.vintage}
            </span>
          )}
          {rec.format && rec.format !== "unknown" && (
            <span className="rounded border border-gold/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold/80">
              {rec.format}
            </span>
          )}
          {inCellar && (
            <span className="flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              <Check className="size-2.5" />
              In cellar
            </span>
          )}
        </div>
        <p className="mb-3 text-sm italic text-muted-foreground">
          {[rec.varietal, rec.region].filter(Boolean).join(" • ") || "—"}
        </p>
        <p className="text-sm leading-relaxed text-foreground/80 text-pretty">{rec.reasoning}</p>
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        <div className="text-right">
          <div className="font-serif text-2xl text-gold">{rec.matchScore}%</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Match</div>
        </div>
        {rec.price && <div className="text-sm text-muted-foreground">{rec.price}</div>}
        {onSave && (
          <button
            onClick={() => !inCellar && onSave(rec)}
            disabled={inCellar}
            title={inCellar ? "Already in your cellar" : "Save to cellar"}
            className={[
              "rounded-full border p-2 transition",
              inCellar
                ? "border-gold/40 bg-gold/10 cursor-default"
                : "border-white/10 hover:border-gold hover:bg-gold/5",
            ].join(" ")}
            aria-label={inCellar ? "Already in cellar" : "Save to cellar"}
          >
            {inCellar
              ? <Check className="size-4 text-gold" />
              : <Plus className="size-4 text-muted-foreground" />
            }
          </button>
        )}
      </div>
    </div>
  );
}
