import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Loader2 } from "lucide-react";
import { adminUnlock } from "@/lib/admin.functions";

export function UnlockScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const qc = useQueryClient();
  const [secret, setSecret] = useState("");
  const [email, setEmail] = useState("");
  const [isInvitedAdminMode, setIsInvitedAdminMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = useMutation({
    mutationFn: async () => {
      const res = await adminUnlock({
        data: {
          secret: secret.trim(),
          email: isInvitedAdminMode ? email.trim() : undefined,
        },
      });
      if (!res.ok) {
        throw new Error("Invalid access key or credentials.");
      }
      return res;
    },
    onSuccess: async () => {
      setSecret("");
      setEmail("");
      await qc.invalidateQueries({ queryKey: ["admin_status"] });
      onUnlocked();
    },
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Invalid access key or credentials."),
  });

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          unlock.mutate();
        }}
        className="glass glow-teal w-full max-w-sm rounded-[28px] p-8 space-y-5"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary">
          <Lock className="h-5 w-5" />
        </span>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">Restricted CMS Access</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {isInvitedAdminMode
              ? "Enter your admin email and password"
              : "Enter the master access key to unlock the control panel."}
          </p>
        </div>

        {isInvitedAdminMode && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Admin Email
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@agency.com"
              className="w-full rounded-2xl border border-border bg-white/[0.04] px-5 py-3.5 text-sm outline-none focus:border-[#016764]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {isInvitedAdminMode ? "Password" : "Master Secret Access Key"}
          </label>
          <input
            type="password"
            autoFocus={!isInvitedAdminMode}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={isInvitedAdminMode ? "Password" : "Secret Key"}
            className="w-full rounded-2xl border border-border bg-white/[0.04] px-5 py-3.5 text-sm outline-none focus:border-[#016764]"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={unlock.isPending || !secret}
          className="btn-radial inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium disabled:opacity-60"
        >
          {unlock.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Unlock Admin CMS
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsInvitedAdminMode(!isInvitedAdminMode);
              setError(null);
            }}
            className="text-xs text-muted-foreground hover:text-[#7ef0e2] underline transition-colors"
          >
            {isInvitedAdminMode ? "Switch to Master Owner Key" : "Log in as Invited Admin"}
          </button>
        </div>
      </form>
    </main>
  );
}
