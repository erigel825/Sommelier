import { useState } from "react";
import { Loader2, Wine, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "sign-in" | "sign-up";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setMessage({ text: error.message, error: true });
    } else if (mode === "sign-up") {
      setMessage({ text: "Check your email for a confirmation link.", error: false });
    } else {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-card p-8 shadow-elegant">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="grid size-10 place-items-center rounded-full bg-merlot ring-1 ring-gold/30">
            <Wine className="size-4 text-gold" strokeWidth={1.5} />
          </span>
          <h2 className="font-serif text-2xl text-foreground">
            {mode === "sign-in" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-center text-xs text-muted-foreground">
            {mode === "sign-in"
              ? "Sign in to sync your palate and cellar."
              : "Save your palate and cellar across devices."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold/40"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold/40"
            />
          </label>

          {message && (
            <p
              className={`rounded-xl px-4 py-3 text-xs ${message.error ? "bg-destructive/10 text-destructive" : "bg-gold/10 text-gold"}`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-merlot py-3 text-sm font-medium text-primary-foreground transition hover:bg-merlot/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "sign-in" ? "No account?" : "Already have one?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setMessage(null);
            }}
            className="text-gold hover:underline"
          >
            {mode === "sign-in" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
