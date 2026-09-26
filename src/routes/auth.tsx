import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { getUtm } from "@/components/site/SiteExtras";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — BotForge" },
      { name: "description", content: "Sign in or create a BotForge account to build Telegram bots with AI." },
      { property: "og:title", content: "Sign in — BotForge" },
      { property: "og:description", content: "Sign in or create a BotForge account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/app`, data: getUtm() },
          });
    setBusy(false);
    if (res.error) return setError(res.error.message);
    if (mode === "up" && !res.data.session) {
      setSent(true);
      toast.success("Check your inbox to confirm your email.");
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/app" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <Link to="/" className="font-display text-lg font-semibold">BotForge</Link>
        <h1 className="mt-4 text-2xl font-semibold">{mode === "in" ? "Sign in" : "Create account"}</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{email}</strong>. Click it to finish signing up.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm">
              Email
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3" />
            </label>
            <label className="block text-sm">
              Password
              <div className="relative mt-1">
                <input required type={show ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-16" />
                <button type="button" onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-2 text-xs text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}>
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button disabled={busy}
              className="h-11 w-full rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(null); setSent(false); }}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground">
          {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
