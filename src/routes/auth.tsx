import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — DivCineDekho" },
      { name: "description", content: "Sign in or create your DivCineDekho account to track movies, showtimes and ticket prices near you." },
      { property: "og:title", content: "Sign in — DivCineDekho" },
      { property: "og:description", content: "Track movies in theatres near you, compare prices and write reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot" | "verify" | "phone";

function PhoneAuth({ onBack, input }: { onBack: () => void; input: string }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const full = `+91${phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").replace(/^0/, "")}`;

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!/^\+91[6-9]\d{9}$/.test(full)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: full,
      options: name ? { data: { full_name: name } } : {},
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("OTP sent by SMS");
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone: full, token: code, type: "sms" });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Phone sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {sent ? `Enter the code sent to ${full}.` : "New or existing users — we'll text you a one-time code."}
      </p>
      {!sent ? (
        <form onSubmit={send} className="mt-6 space-y-3">
          <input className={input} placeholder="Your name (for new accounts)" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <span className="flex items-center rounded-lg border border-border px-3 text-muted-foreground">+91</span>
            <input className={input} type="tel" inputMode="numeric" placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Sending…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3">
          <input className={input} inputMode="numeric" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} maxLength={8} required />
          <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Verifying…" : "Verify & continue"}
          </button>
          <button type="button" onClick={() => setSent(false)} className="text-sm text-muted-foreground hover:text-foreground">Change number / resend</button>
        </form>
      )}
      <button onClick={onBack} className="mt-6 block w-full text-center text-sm text-primary hover:underline">Back to email sign in</button>
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", search: { city: "mumbai", tab: "now" }, replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/", search: { city: "mumbai", tab: "now" }, replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) setMode("verify");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent — check your email.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Sign-in failed");
  }

  const input = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        {mode === "phone" ? (
          <PhoneAuth onBack={() => setMode("signin")} input={input} />
        ) : mode === "verify" ? (
          <div className="space-y-4 text-center">
            <h1 className="font-display text-4xl tracking-wide">Check your email</h1>
            <p className="text-muted-foreground">
              We sent a verification link to <span className="text-foreground">{email}</span>. Tap it to confirm your account — you'll be signed in automatically.
            </p>
            <button onClick={() => setMode("signin")} className="text-sm text-primary hover:underline">Back to sign in</button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl tracking-wide">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "forgot" ? "We'll email you a reset link." : "Track movies, showtimes and prices in theatres near you."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              {mode === "signup" && (
                <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              )}
              <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {mode !== "forgot" && (
                <input className={input} type="password" placeholder="Password (min 6 characters)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
              )}
              <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </button>
            </form>

            {mode === "signin" && (
              <button onClick={() => setMode("forgot")} className="mt-3 text-sm text-muted-foreground hover:text-foreground">Forgot password?</button>
            )}

            {mode !== "forgot" && (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  <button onClick={() => setMode("phone")} className="w-full rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted">
                    Continue with phone number
                  </button>
                  <button onClick={() => social("google")} className="w-full rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted">
                    Continue with Google
                  </button>
                  <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>
                    Continue with Lovable
                  </button>
                </div>
              </>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account? " : mode === "signin" ? "New here? " : ""}
              <button onClick={() => setMode(mode === "signup" ? "signin" : mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline">
                {mode === "signup" ? "Sign in" : mode === "signin" ? "Create an account" : "Back to sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
