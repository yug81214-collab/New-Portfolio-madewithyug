import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench, Save, Check, Loader2, Plus, X, Eye, RotateCcw, Sparkles } from "lucide-react";
import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";
import {
  Software,
  SoftwareSectionData,
  DEFAULT_SOFTWARE_DATA,
  parseSkillsList,
} from "@/components/site/Software";

const inputClass =
  "w-full rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 text-sm outline-none focus:border-[#016764] focus:ring-2 focus:ring-[#016764]/25 transition-colors";

type KeywordPillEditorProps = {
  label: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  colorClass?: string;
};

function KeywordPillEditor({
  label,
  skills,
  onChange,
  colorClass = "border-[#2fd3c6]/40 bg-[#2fd3c6]/10 text-[#7ef0e2]",
}: KeywordPillEditorProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>

      {/* Pill tags container */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-white/[0.02] p-3 min-h-[52px]">
        {skills.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-all ${colorClass}`}
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
              title="Remove keyword"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Add keyword input */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="+ Add keyword & press Enter"
            className="w-full bg-transparent px-2 py-1 text-xs outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!newTag.trim()}
            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-white/20 disabled:opacity-30"
          >
            Add
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Separate multiple keywords by comma or press Enter to add each pill tag.
      </p>
    </div>
  );
}

export function SoftwarePanel() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Draft state for software section
  const [eyebrow, setEyebrow] = useState(DEFAULT_SOFTWARE_DATA.eyebrow);
  const [title, setTitle] = useState(DEFAULT_SOFTWARE_DATA.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_SOFTWARE_DATA.subtitle);

  const [aeRole, setAeRole] = useState(DEFAULT_SOFTWARE_DATA.ae.role);
  const [aeDesc, setAeDesc] = useState(DEFAULT_SOFTWARE_DATA.ae.desc);
  const [aeSkills, setAeSkills] = useState<string[]>(DEFAULT_SOFTWARE_DATA.ae.skills);

  const [prRole, setPrRole] = useState(DEFAULT_SOFTWARE_DATA.pr.role);
  const [prDesc, setPrDesc] = useState(DEFAULT_SOFTWARE_DATA.pr.desc);
  const [prSkills, setPrSkills] = useState<string[]>(DEFAULT_SOFTWARE_DATA.pr.skills);

  const [resolveRole, setResolveRole] = useState(DEFAULT_SOFTWARE_DATA.resolve.role);
  const [resolveDesc, setResolveDesc] = useState(DEFAULT_SOFTWARE_DATA.resolve.desc);
  const [resolveSkills, setResolveSkills] = useState<string[]>(
    DEFAULT_SOFTWARE_DATA.resolve.skills,
  );

  const [marquee, setMarquee] = useState<string[]>(DEFAULT_SOFTWARE_DATA.marquee);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: () => adminGetSettings(),
  });

  useEffect(() => {
    if (settings) {
      if (settings["software_eyebrow"]) setEyebrow(settings["software_eyebrow"]);
      if (settings["software_title"]) setTitle(settings["software_title"]);
      if (settings["software_subtitle"]) setSubtitle(settings["software_subtitle"]);

      if (settings["software_ae_role"]) setAeRole(settings["software_ae_role"]);
      if (settings["software_ae_desc"]) setAeDesc(settings["software_ae_desc"]);
      if (settings["software_ae_skills"]) {
        setAeSkills(
          parseSkillsList(settings["software_ae_skills"], DEFAULT_SOFTWARE_DATA.ae.skills),
        );
      }

      if (settings["software_pr_role"]) setPrRole(settings["software_pr_role"]);
      if (settings["software_pr_desc"]) setPrDesc(settings["software_pr_desc"]);
      if (settings["software_pr_skills"]) {
        setPrSkills(
          parseSkillsList(settings["software_pr_skills"], DEFAULT_SOFTWARE_DATA.pr.skills),
        );
      }

      if (settings["software_resolve_role"]) setResolveRole(settings["software_resolve_role"]);
      if (settings["software_resolve_desc"]) setResolveDesc(settings["software_resolve_desc"]);
      if (settings["software_resolve_skills"]) {
        setResolveSkills(
          parseSkillsList(
            settings["software_resolve_skills"],
            DEFAULT_SOFTWARE_DATA.resolve.skills,
          ),
        );
      }

      if (settings["software_marquee"]) {
        setMarquee(parseSkillsList(settings["software_marquee"], DEFAULT_SOFTWARE_DATA.marquee));
      }
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const values: Record<string, string> = {
        software_eyebrow: eyebrow,
        software_title: title,
        software_subtitle: subtitle,
        software_ae_role: aeRole,
        software_ae_desc: aeDesc,
        software_ae_skills: aeSkills.join(", "),
        software_pr_role: prRole,
        software_pr_desc: prDesc,
        software_pr_skills: prSkills.join(", "),
        software_resolve_role: resolveRole,
        software_resolve_desc: resolveDesc,
        software_resolve_skills: resolveSkills.join(", "),
        software_marquee: marquee.join(", "),
      };

      await adminSaveSettings({ data: { values } });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      void qc.invalidateQueries({ queryKey: ["admin_settings"] });
      void qc.invalidateQueries({ queryKey: ["site_settings"] });
      void qc.invalidateQueries({ queryKey: ["public_home_data"] });
    },
  });

  const resetToDefault = () => {
    setEyebrow(DEFAULT_SOFTWARE_DATA.eyebrow);
    setTitle(DEFAULT_SOFTWARE_DATA.title);
    setSubtitle(DEFAULT_SOFTWARE_DATA.subtitle);

    setAeRole(DEFAULT_SOFTWARE_DATA.ae.role);
    setAeDesc(DEFAULT_SOFTWARE_DATA.ae.desc);
    setAeSkills([...DEFAULT_SOFTWARE_DATA.ae.skills]);

    setPrRole(DEFAULT_SOFTWARE_DATA.pr.role);
    setPrDesc(DEFAULT_SOFTWARE_DATA.pr.desc);
    setPrSkills([...DEFAULT_SOFTWARE_DATA.pr.skills]);

    setResolveRole(DEFAULT_SOFTWARE_DATA.resolve.role);
    setResolveDesc(DEFAULT_SOFTWARE_DATA.resolve.desc);
    setResolveSkills([...DEFAULT_SOFTWARE_DATA.resolve.skills]);

    setMarquee([...DEFAULT_SOFTWARE_DATA.marquee]);
  };

  // Draft object for real-time live preview
  const livePreviewData: Partial<SoftwareSectionData> = {
    eyebrow,
    title,
    subtitle,
    ae: {
      name: DEFAULT_SOFTWARE_DATA.ae.name,
      role: aeRole,
      desc: aeDesc,
      skills: aeSkills,
    },
    pr: {
      name: DEFAULT_SOFTWARE_DATA.pr.name,
      role: prRole,
      desc: prDesc,
      skills: prSkills,
    },
    resolve: {
      name: DEFAULT_SOFTWARE_DATA.resolve.name,
      role: resolveRole,
      desc: resolveDesc,
      skills: resolveSkills,
    },
    marquee,
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-4">
        <Loader2 className="h-4 w-4 animate-spin text-[#7ef0e2]" /> Loading software CMS…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#7ef0e2]">
            <Wrench className="h-3.5 w-3.5" /> Toolkit &amp; Software CMS
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Manage Software Keywords &amp; Toolkit Cards
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Edit software skill tags, tool roles, descriptions and marquee ticker. See live updates
            in real-time below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetToDefault}
            className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium hover:bg-white/10"
            title="Reset to default software settings"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </button>

          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              showLivePreview
                ? "bg-[#016764] text-[#7ef0e2] border border-[#2fd3c6]/40"
                : "glass hover:bg-white/10"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />{" "}
            {showLivePreview ? "Live Preview Active" : "Show Preview"}
          </button>
        </div>
      </div>

      {/* Grid containing Controls & Live Preview */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Keyword & Form Editors */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section Headings */}
          <section className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-tight border-b border-border/50 pb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#7ef0e2]" /> Section Headings
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Eyebrow Tag</label>
                <input
                  className={inputClass}
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Main Title</label>
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Subtitle Paragraph</label>
              <textarea
                rows={2}
                className={`${inputClass} resize-none`}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </section>

          {/* 1. Adobe After Effects Keywords & Info */}
          <section className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-[#9999ff]">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                <span className="grid h-6 w-6 place-items-center rounded bg-[#00005b] text-[#9999ff] text-xs font-bold">
                  Ae
                </span>
                Adobe After Effects
              </h3>
              <span className="text-[10px] text-muted-foreground">Motion Graphics &amp; VFX</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Role Label</label>
                <input
                  className={inputClass}
                  value={aeRole}
                  onChange={(e) => setAeRole(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Description</label>
                <input
                  className={inputClass}
                  value={aeDesc}
                  onChange={(e) => setAeDesc(e.target.value)}
                />
              </div>
            </div>

            <KeywordPillEditor
              label="After Effects Skill Keywords (Pill Tags)"
              skills={aeSkills}
              onChange={(s) => setAeSkills(s)}
              colorClass="border-[#9999ff]/40 bg-[#9999ff]/10 text-[#c2c2ff]"
            />
          </section>

          {/* 2. Adobe Premiere Pro Keywords & Info */}
          <section className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-[#9999ff]">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                <span className="grid h-6 w-6 place-items-center rounded bg-[#00005b] text-[#9999ff] text-xs font-bold">
                  Pr
                </span>
                Adobe Premiere Pro
              </h3>
              <span className="text-[10px] text-muted-foreground">Story &amp; VSL Cut</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Role Label</label>
                <input
                  className={inputClass}
                  value={prRole}
                  onChange={(e) => setPrRole(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Description</label>
                <input
                  className={inputClass}
                  value={prDesc}
                  onChange={(e) => setPrDesc(e.target.value)}
                />
              </div>
            </div>

            <KeywordPillEditor
              label="Premiere Pro Skill Keywords (Pill Tags)"
              skills={prSkills}
              onChange={(s) => setPrSkills(s)}
              colorClass="border-[#9999ff]/40 bg-[#9999ff]/10 text-[#c2c2ff]"
            />
          </section>

          {/* 3. DaVinci Resolve Keywords & Info */}
          <section className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-[#2fd3c6]">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                <span className="grid h-6 w-6 place-items-center rounded bg-[#016764] text-[#7ef0e2] text-xs font-bold">
                  Dr
                </span>
                DaVinci Resolve
              </h3>
              <span className="text-[10px] text-muted-foreground">Color Grading &amp; Finish</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Role Label</label>
                <input
                  className={inputClass}
                  value={resolveRole}
                  onChange={(e) => setResolveRole(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Description</label>
                <input
                  className={inputClass}
                  value={resolveDesc}
                  onChange={(e) => setResolveDesc(e.target.value)}
                />
              </div>
            </div>

            <KeywordPillEditor
              label="DaVinci Resolve Skill Keywords (Pill Tags)"
              skills={resolveSkills}
              onChange={(s) => setResolveSkills(s)}
              colorClass="border-[#2fd3c6]/40 bg-[#2fd3c6]/10 text-[#7ef0e2]"
            />
          </section>

          {/* 4. Marquee Keywords Editor */}
          <section className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-tight border-b border-border/50 pb-3">
              ⚡ Infinite Skill Marquee Keywords
            </h3>

            <KeywordPillEditor
              label="Marquee Ticker Keywords"
              skills={marquee}
              onChange={(m) => setMarquee(m)}
              colorClass="border-amber-400/40 bg-amber-400/10 text-amber-300"
            />
          </section>
        </div>

        {/* Right Column: Interactive Live Preview Container */}
        {showLivePreview && (
          <div className="lg:col-span-5 sticky top-6 space-y-3">
            <div className="glass glow-teal rounded-2xl p-4 border border-[#2fd3c6]/30 bg-black/60 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-[#2fd3c6] animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7ef0e2]">
                    Live Preview Pane
                  </h3>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                  Updates real-time
                </span>
              </div>

              {/* Render Software Component inside miniature preview box */}
              <div className="rounded-xl border border-white/10 bg-background/90 p-2 overflow-x-auto max-h-[750px] overflow-y-auto custom-scrollbar">
                <Software overrideData={livePreviewData} isCompactPreview={true} />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <span>Keywords preview accurately styled with pill tags.</span>
                <span className="font-medium text-[#7ef0e2]">Real-time active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Save Trigger Bar */}
      <div className="sticky bottom-4 z-20 flex items-center gap-3 glass rounded-full p-3 px-6 shadow-2xl">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-radial inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
        >
          {save.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving Keywords…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Software Keywords
            </>
          )}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-[#7ef0e2] font-semibold">
            <Check className="h-4 w-4" /> Keywords updated successfully
          </span>
        )}

        {save.isError && (
          <span className="text-xs text-destructive">{(save.error as Error).message}</span>
        )}
      </div>
    </div>
  );
}
