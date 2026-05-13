import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ChefHat, Sparkles, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import heroWine from "@/assets/hero-wine.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vintage.AI — Your AI Sommelier" },
      {
        name: "description",
        content:
          "Snap a wine list. Get five perfect picks tailored to your palate, your meal, and your budget.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-20">
        {/* HERO */}
        <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7 animate-reveal">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-merlot/30 bg-merlot/10 px-3 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
                Neural palate · v1
              </span>
            </div>

            <h1 className="font-serif text-5xl leading-[1.05] text-foreground md:text-7xl text-balance">
              The intelligent <span className="italic text-gold">bridge</span> between list and
              glass.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Photograph any wine list, share what's on your plate, and let your private sommelier
              translate hundreds of bottles into the five worth ordering — tuned to your palate.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/scan"
                className="group flex items-center gap-4 rounded-xl bg-merlot px-7 py-4 text-sm font-medium text-primary-foreground shadow-merlot transition hover:bg-merlot/90"
              >
                <Camera className="size-4" />
                <span>Scan a wine list</span>
                <span className="h-px w-5 bg-white/40 transition-all group-hover:w-9" />
              </Link>

              <Link
                to="/pair"
                className="flex items-center gap-3 rounded-xl border border-gold/30 bg-card px-7 py-4 text-sm font-medium text-gold transition hover:bg-gold/5"
              >
                <ChefHat className="size-4" />
                <span>Pair with food</span>
              </Link>

              <Link
                to="/profile"
                className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                Set your palate →
              </Link>
            </div>
          </div>

          {/* hero image */}
          <div className="relative md:col-span-5">
            <div className="absolute -inset-6 rounded-[2rem] bg-merlot/20 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-elegant">
              <img
                src={heroWine}
                alt="A glass of deep red wine swirling under candlelight"
                width={1080}
                height={1620}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/60 to-transparent p-6">
                <p className="font-serif text-lg italic text-gold">"Decant the moment."</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  — our standing recommendation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-28">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                The Method
              </p>
              <h2 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">
                Three pours from list to perfect glass.
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Tune your palate",
                body: "Pick the styles you love and the ones you'd rather skip. Log a few bottles you've tried — accuracy compounds.",
                to: "/profile",
                cta: "Calibrate",
              },
              {
                icon: Camera,
                title: "Snap the list",
                body: "Open the camera at the table — wine shop, grocery aisle, or restaurant — and we read every bottle and price.",
                to: "/scan",
                cta: "Open scanner",
              },
              {
                icon: ChefHat,
                title: "Pair with the meal",
                body: "Tell us what you're eating. Five picks come back with a sommelier-grade reason for each.",
                to: "/pair",
                cta: "Find a pairing",
              },
            ].map((step) => (
              <Link
                key={step.title}
                to={step.to}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/40 p-7 transition hover:border-gold/30 hover:bg-card"
              >
                <div className="mb-6 grid size-11 place-items-center rounded-xl bg-merlot/30 ring-1 ring-merlot/40">
                  <step.icon className="size-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold/80">
                  {step.cta} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="mt-28 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-merlot-deep via-card to-background p-10 md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <h3 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
                Build a cellar of memory, not just bottles.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Every wine you log refines tomorrow's recommendations. Your palate, in the cloud.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link
                to="/cellar"
                className="inline-flex items-center gap-3 rounded-xl border border-gold/40 bg-background px-6 py-4 text-sm font-medium text-gold transition hover:bg-gold/10"
              >
                <BookOpen className="size-4" />
                Open my cellar
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-white/5 bg-background py-12 text-center">
        <p className="font-serif text-lg text-gold/40">Vintage.AI</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Master your cellar · Trust your palate
        </p>
      </footer>
    </div>
  );
}
