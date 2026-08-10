import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, EyeOff, Loader2, Sparkles, UserCheck, ImageIcon } from "lucide-react";
import { adminGetIntroduction, adminSaveIntroduction } from "@/lib/admin.functions";
import { IntroductionContent } from "@/lib/cms-store";
import { MediaUpload } from "./MediaUpload";
import { useMediaUrl } from "@/lib/site-data";

const inputClass =
  "w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764] focus:ring-2 focus:ring-[#016764]/25";

export function IntroductionPanel() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Partial<IntroductionContent>>({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_introduction"],
    queryFn: () => adminGetIntroduction(),
  });

  useEffect(() => {
    if (data) {
      setDraft(data);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await adminSaveIntroduction({ data: { patch: draft } });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      void qc.invalidateQueries({ queryKey: ["admin_introduction"] });
      void qc.invalidateQueries({ queryKey: ["public_home_data"] });
    },
  });

  const set = <K extends keyof IntroductionContent>(k: K, v: IntroductionContent[K]) => {
    setDraft((prev) => ({ ...prev, [k]: v }));
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground animate-pulse">Loading introduction CMS…</p>;
  }

  return (
    <div className="space-y-8">
      {/* Overview header */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#7ef0e2]">
            <Sparkles className="h-3.5 w-3.5" /> Introduction CMS
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Complete Control Over Your Bio &amp; About Section
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Update headings, bio text, stats, skills, CTA buttons, and portrait image dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={draft.is_visible !== false}
              onChange={(e) => set("is_visible", e.target.checked)}
              className="accent-[#016764]"
            />
            {draft.is_visible !== false ? (
              <span className="flex items-center gap-1.5 text-[#7ef0e2]">
                <Eye className="h-3.5 w-3.5" /> Visible on Site
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <EyeOff className="h-3.5 w-3.5" /> Hidden (Draft)
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Main Form Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Headings & Bio */}
        <section className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
            📝 Headings &amp; Bio Content
          </h3>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Availability Badge Text
            </label>
            <input
              className={inputClass}
              value={draft.badge_text ?? ""}
              onChange={(e) => set("badge_text", e.target.value)}
              placeholder="e.g. Available for New Projects"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Main Heading
            </label>
            <input
              className={inputClass}
              value={draft.main_heading ?? ""}
              onChange={(e) => set("main_heading", e.target.value)}
              placeholder="e.g. About Me"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Subheading / Title Role
            </label>
            <input
              className={inputClass}
              value={draft.subheading ?? ""}
              onChange={(e) => set("subheading", e.target.value)}
              placeholder="e.g. VSL Video Editor & Motion Graphics Artist"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Short Description / Summary
            </label>
            <textarea
              rows={2}
              className={`${inputClass} resize-none`}
              value={draft.short_description ?? ""}
              onChange={(e) => set("short_description", e.target.value)}
              placeholder="Short elevator pitch..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Main Introduction Paragraph
            </label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={draft.intro_body ?? ""}
              onChange={(e) => set("intro_body", e.target.value)}
              placeholder="Primary bio text..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Additional Paragraphs (One per line)
            </label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={draft.additional_paragraphs?.join("\n") ?? ""}
              onChange={(e) =>
                set(
                  "additional_paragraphs",
                  e.target.value.split("\n").filter((line) => line.trim().length > 0),
                )
              }
              placeholder="Paragraph 2&#10;Paragraph 3..."
            />
          </div>
        </section>

        {/* Right Column: CTA, Media, Stats & Skills */}
        <section className="glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
            🖼️ Media, CTA &amp; Highlights
          </h3>

          {/* Portrait Image Upload */}
          <MediaUpload
            label="Portrait / Introduction Image"
            value={draft.image_url ?? ""}
            onChange={(path) => set("image_url", path)}
          />

          {/* Explicit Portrait Preview Box */}
          <PortraitPreview imageUrl={draft.image_url} altText={draft.image_alt} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Image Alt Text
              </label>
              <input
                className={inputClass}
                value={draft.image_alt ?? ""}
                onChange={(e) => set("image_alt", e.target.value)}
                placeholder="Yug Jha portrait"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Image Alignment
              </label>
              <select
                className={inputClass}
                value={draft.image_position ?? "center"}
                onChange={(e) => set("image_position", e.target.value)}
              >
                <option value="center" className="bg-card">
                  Center
                </option>
                <option value="top" className="bg-card">
                  Top
                </option>
                <option value="bottom" className="bg-card">
                  Bottom
                </option>
              </select>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                CTA Button Text
              </label>
              <input
                className={inputClass}
                value={draft.cta_text ?? ""}
                onChange={(e) => set("cta_text", e.target.value)}
                placeholder="Let's Build Your Next VSL"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                CTA Link
              </label>
              <input
                className={inputClass}
                value={draft.cta_link ?? "#contact"}
                onChange={(e) => set("cta_link", e.target.value)}
                placeholder="#contact"
              />
            </div>
          </div>

          {/* Stats Editor */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Key Stats (Format: Value | Label, e.g. 200+ | Videos Edited)
            </label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={
                draft.stats ? draft.stats.map((s) => `${s.value} | ${s.label}`).join("\n") : ""
              }
              onChange={(e) => {
                const lines = e.target.value.split("\n");
                const stats = lines
                  .map((line) => {
                    const [val, lbl] = line.split("|");
                    return { value: (val || "").trim(), label: (lbl || "").trim() };
                  })
                  .filter((s) => s.value && s.label);
                set("stats", stats);
              }}
              placeholder="200+ | Videos Edited&#10;2+ | Years Experience&#10;24-48h | Delivery Speed"
            />
          </div>

          {/* Skills Editor */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Core Skills &amp; Capabilities (One per line)
            </label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={draft.skills?.join("\n") ?? ""}
              onChange={(e) =>
                set(
                  "skills",
                  e.target.value.split("\n").filter((s) => s.trim().length > 0),
                )
              }
              placeholder="VSL Directing & Editing&#10;Motion Graphics & After Effects&#10;Kinetic Typography"
            />
          </div>
        </section>
      </div>

      {/* Save Trigger Sticky Bar */}
      <div className="sticky bottom-4 flex items-center gap-3 glass rounded-full p-3 px-6 shadow-2xl">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-radial inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
        >
          {save.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving Introduction…
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" /> Save Introduction CMS
            </>
          )}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-[#7ef0e2] font-semibold">
            <Check className="h-4 w-4" /> Updated Introduction successfully
          </span>
        )}

        {save.isError && (
          <span className="text-xs text-destructive">{(save.error as Error).message}</span>
        )}
      </div>
    </div>
  );
}

function PortraitPreview({ imageUrl, altText }: { imageUrl?: string; altText?: string }) {
  const resolved = useMediaUrl(imageUrl);
  const displayUrl = resolved || imageUrl;
  if (!imageUrl && !resolved) return null;

  return (
    <div className="rounded-xl border border-[#016764]/40 bg-[#016764]/10 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#7ef0e2] flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" /> Live Portrait Preview
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-black/40 text-muted-foreground">
          {imageUrl?.startsWith("data:") ? "Uploaded Image" : "Active Asset"}
        </span>
      </div>

      <div className="flex gap-4 items-center pt-1">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-md bg-black/40">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={altText || "Portrait Preview"}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
              No preview
            </div>
          )}
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-medium text-foreground">{altText || "Yug Jha Portrait"}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-2 break-all">{imageUrl}</p>
          <p className="text-[10px] font-semibold text-[#7ef0e2]">
            ✓ Visible on admin panel &amp; main website
          </p>
        </div>
      </div>
    </div>
  );
}
