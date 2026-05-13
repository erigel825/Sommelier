import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Wine } from "lucide-react";
import { useAuth, signOut } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";

const links = [
  { to: "/scan", label: "Scan" },
  { to: "/pair", label: "Pair" },
  { to: "/cellar", label: "Cellar" },
  { to: "/profile", label: "Palate" },
] as const;

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10 md:py-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-merlot ring-1 ring-gold/30">
              <Wine className="size-4 text-gold" strokeWidth={1.5} />
            </span>
            <span className="font-serif text-xl tracking-tight text-gold">VINTAGE.AI</span>
          </Link>

          <nav className="hidden items-center gap-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:flex">
            {links.map((l) => {
              const active = path === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={active ? "text-gold" : "transition-colors hover:text-foreground"}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {!loading &&
              (user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    title={user.email}
                    className="flex size-10 items-center justify-center rounded-full bg-merlot/30 ring-2 ring-merlot/50 text-[11px] font-bold uppercase text-gold transition hover:ring-merlot"
                  >
                    {user.email?.slice(0, 2).toUpperCase()}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    title="Sign out"
                    className="rounded-full border border-white/10 p-2 text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                    aria-label="Sign out"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-xl border border-gold/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-gold transition hover:bg-gold/5"
                >
                  Sign in
                </button>
              ))}
          </div>
        </div>

        {/* mobile nav */}
        <nav className="flex items-center justify-around border-t border-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:hidden">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link key={l.to} to={l.to} className={`px-3 py-2 ${active ? "text-gold" : ""}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
