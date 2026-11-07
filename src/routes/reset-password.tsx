import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — DivCineDekho" },
      { name: "description", content: "Choose a new password for your DivCineDekho account." },
      { property: "og:title", content: "Set a new password — DivCineDekho" },
      { property: "og:description", content: "Choose a new password for your DivCineDekho account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/", search: { city: "mumbai", tab: "now" } });
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="font-display text-4xl tracking-wide">New password</h1>
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground" />
        <button disabled={busy} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
