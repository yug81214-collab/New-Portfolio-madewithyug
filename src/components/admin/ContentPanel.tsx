import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";
import { MediaUpload } from "./MediaUpload";

const input =
  "w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764] focus:ring-2 focus:ring-[#016764]/25";

type Field = { key: string; label: string; multiline?: boolean; image?: boolean };

const groups: { title: string; fields: Field[] }[] = [
  {
    title: "⚙️ General website settings",
    fields: [
      { key: "site_name", label: "Website / brand name" },
      { key: "site_tagline", label: "Tagline" },
      { key: "logo_url", label: "Logo", image: true },
      { key: "favicon_url", label: "Favicon", image: true },
      { key: "footer_note", label: "Footer note", multiline: true },
    ],
  },
  {
    title: "🏠 Homepage / Hero",
    fields: [
      { key: "hero_badge", label: "Availability badge" },
      { key: "hero_title", label: "Hero title" },
      { key: "hero_title_highlight", label: "Hero title — highlighted part" },
      { key: "hero_subtitle", label: "Hero paragraph", multiline: true },
      { key: "hero_cta_label", label: "Primary button label" },
      { key: "hero_cta_href", label: "Primary button link" },
      { key: "hero_image", label: "Hero / portrait image", image: true },
    ],
  },
  {
    title: "👤 About me",
    fields: [
      { key: "about_title", label: "About title" },
      { key: "about_body", label: "About text", multiline: true },
      { key: "about_image", label: "About image", image: true },
      { key: "about_stats", label: "Stats (one per line: 120+ | Videos edited)", multiline: true },
    ],
  },
  {
    title: "💼 Projects / Portfolio",
    fields: [
      { key: "short_form_title", label: "Short-form title" },
      { key: "short_form_subtitle", label: "Short-form subtitle", multiline: true },
      { key: "long_form_title", label: "Long-form title" },
      { key: "long_form_subtitle", label: "Long-form subtitle", multiline: true },
    ],
  },
  {
    title: "🛠️ Skills",
    fields: [
      { key: "skills_title", label: "Skills title" },
      { key: "skills_list", label: "Skills (one per line)", multiline: true },
    ],
  },
  {
    title: "🎯 Services",
    fields: [
      { key: "services_title", label: "Services title" },
      { key: "services_subtitle", label: "Services subtitle", multiline: true },
      {
        key: "services_list",
        label: "Services (one per line: Name | Short description)",
        multiline: true,
      },
    ],
  },
  {
    title: "⭐ Testimonials",
    fields: [
      { key: "testimonials_title", label: "Testimonials title" },
      {
        key: "testimonials_list",
        label: "Testimonials (one per line: Name | Role | Quote)",
        multiline: true,
      },
    ],
  },
  {
    title: "📞 Contact information",
    fields: [
      { key: "contact_title", label: "Contact title" },
      { key: "contact_subtitle", label: "Contact subtitle", multiline: true },
      { key: "contact_email", label: "Contact email" },
      { key: "contact_phone", label: "Phone / WhatsApp" },
      { key: "contact_location", label: "Location" },
      { key: "contact_calendly", label: "Booking link" },
    ],
  },
  {
    title: "🔗 Social links",
    fields: [
      { key: "social_instagram", label: "Instagram" },
      { key: "social_youtube", label: "YouTube" },
      { key: "social_x", label: "X / Twitter" },
      { key: "social_linkedin", label: "LinkedIn" },
      { key: "social_behance", label: "Behance / Dribbble" },
    ],
  },
  {
    title: "🔍 SEO settings",
    fields: [
      { key: "seo_title", label: "Page title (<60 chars)" },
      { key: "seo_description", label: "Meta description (<160 chars)", multiline: true },
      { key: "seo_keywords", label: "Keywords (comma separated)" },
      { key: "seo_og_image", label: "Social share image", image: true },
      { key: "seo_canonical", label: "Canonical URL" },
    ],
  },
  {
    title: "🎨 Featured content & ordering",
    fields: [
      {
        key: "section_order",
        label:
          "Section order (one per line: hero, short, long, about, services, testimonials, faq, contact)",
        multiline: true,
      },
      { key: "featured_video_url", label: "Featured video link" },
      { key: "featured_note", label: "Featured note", multiline: true },
    ],
  },
];

export function ContentPanel() {
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
      const values: Record<string, string> = {};
      for (const f of groups.flatMap((g) => g.fields)) values[f.key] = draft[f.key] ?? "";
      await adminSaveSettings({ data: { values } });
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
      {groups.map((group) => (
        <section key={group.title} className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
          <div className="mt-5 space-y-4">
            {group.fields.map((f) =>
              f.image ? (
                <MediaUpload
                  key={f.key}
                  label={f.label}
                  value={draft[f.key] ?? ""}
                  onChange={(path) => set(f.key, path)}
                />
              ) : (
                <div key={f.key}>
                  <label className="mb-2 block text-xs tracking-wide text-muted-foreground">
                    {f.label}
                  </label>
                  {f.multiline ? (
                    <textarea
                      rows={3}
                      className={`${input} resize-none`}
                      value={draft[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className={input}
                      value={draft[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-radial rounded-full px-7 py-3 text-sm font-medium"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-xs text-[#7ef0e2]">Saved</span>}
        {save.isError && (
          <span className="text-xs text-destructive">{(save.error as Error).message}</span>
        )}
      </div>
    </div>
  );
}
