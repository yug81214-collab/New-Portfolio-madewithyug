import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  Save,
  Check,
  Loader2,
  Shield,
  Globe,
  Search,
  PhoneCall,
} from "lucide-react";
import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";
import { MediaUpload } from "./MediaUpload";

const inputClass =
  "w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764] focus:ring-2 focus:ring-[#016764]/25";

export function SettingsPanel() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: () => adminGetSettings(),
  });

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await adminSaveSettings({ data: { values: draft } });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      void qc.invalidateQueries({ queryKey: ["admin_settings"] });
      void qc.invalidateQueries({ queryKey: ["site_settings"] });
      void qc.invalidateQueries({ queryKey: ["public_home_data"] });
    },
  });

  const set = (k: string, v: string) => setDraft((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass rounded-2xl p-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <SettingsIcon className="h-5 w-5 text-[#7ef0e2]" /> Website &amp; System Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure global website identity, contact routing, social channels and SEO metadata.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Brand Settings */}
        <section className="glass rounded-2xl p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
            <Globe className="h-4 w-4 text-[#7ef0e2]" /> General Brand Identity
          </h3>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Website / Brand Name</label>
            <input
              className={inputClass}
              value={draft["site_name"] ?? "Yug Jha"}
              onChange={(e) => set("site_name", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Tagline</label>
            <input
              className={inputClass}
              value={draft["site_tagline"] ?? "VSL Video Editor & Motion Graphics Artist"}
              onChange={(e) => set("site_tagline", e.target.value)}
            />
          </div>

          <MediaUpload
            label="Site Logo Image"
            value={draft["logo_url"] ?? ""}
            onChange={(path) => set("logo_url", path)}
          />

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Footer Copyright / Note
            </label>
            <input
              className={inputClass}
              value={draft["footer_note"] ?? "© 2026 Yug Jha. All rights reserved."}
              onChange={(e) => set("footer_note", e.target.value)}
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className="glass rounded-2xl p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
            <PhoneCall className="h-4 w-4 text-[#2fd3c6]" /> Contact Details
          </h3>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Primary Contact Email
            </label>
            <input
              className={inputClass}
              value={draft["contact_email"] ?? "jhayug29@gmail.com"}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Phone / WhatsApp</label>
            <input
              className={inputClass}
              value={draft["contact_phone"] ?? "+1 (555) 019-2834"}
              onChange={(e) => set("contact_phone", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Location / Timezone</label>
            <input
              className={inputClass}
              value={draft["contact_location"] ?? "Worldwide / GMT+5:30"}
              onChange={(e) => set("contact_location", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Calendly Booking Link
            </label>
            <input
              className={inputClass}
              value={draft["contact_calendly"] ?? "https://calendly.com"}
              onChange={(e) => set("contact_calendly", e.target.value)}
            />
          </div>
        </section>

        {/* SEO Metadata */}
        <section className="glass rounded-2xl p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
            <Search className="h-4 w-4 text-amber-300" /> SEO &amp; Open Graph Meta
          </h3>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Page Title (&lt;60 chars)
            </label>
            <input
              className={inputClass}
              value={draft["seo_title"] ?? "Yug Jha — VSL Editor & Motion Graphics Artist"}
              onChange={(e) => set("seo_title", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Meta Description (&lt;160 chars)
            </label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={
                draft["seo_description"] ??
                "VSL-first video editing: high-converting sales letters, retention-driven short form and cinematic long form edits with custom motion graphics."
              }
              onChange={(e) => set("seo_description", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Keywords (comma separated)
            </label>
            <input
              className={inputClass}
              value={
                draft["seo_keywords"] ??
                "VSL Editor, Video Sales Letter, Motion Graphics, Video Editing"
              }
              onChange={(e) => set("seo_keywords", e.target.value)}
            />
          </div>
        </section>

        {/* Security & Session Info */}
        <section className="glass rounded-2xl p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
            <Shield className="h-4 w-4 text-indigo-400" /> Security &amp; Admin Configuration
          </h3>

          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              <span className="text-foreground font-semibold">Authentication Engine:</span>{" "}
              Server-Side HttpOnly Session Cookies (12 Hour Lifetime).
            </p>
            <p>
              <span className="text-foreground font-semibold">Master Secret Access Key:</span>{" "}
              Configured in backend environment variables (`ADMIN_SECRET` / `OWNER_ADMIN_SECRET`).
            </p>
            <p>
              <span className="text-foreground font-semibold">Public Auth Protection:</span> Public
              login UI completely disabled. Access strictly controlled via `/admin` and server-side
              verification middleware.
            </p>
          </div>
        </section>
      </div>

      {/* Save Trigger Bar */}
      <div className="sticky bottom-4 flex items-center gap-3 glass rounded-full p-3 px-6 shadow-2xl">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-radial inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
        >
          {save.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving Settings…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Website Settings
            </>
          )}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-[#7ef0e2] font-semibold">
            <Check className="h-4 w-4" /> Settings updated successfully
          </span>
        )}

        {save.isError && (
          <span className="text-xs text-destructive">{(save.error as Error).message}</span>
        )}
      </div>
    </div>
  );
}
