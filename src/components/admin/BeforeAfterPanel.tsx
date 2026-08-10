import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Check, Eye, EyeOff, Star, Loader2, Layers } from "lucide-react";
import {
  adminCreateBeforeAfter,
  adminDeleteBeforeAfter,
  adminListBeforeAfter,
  adminSaveBeforeAfter,
} from "@/lib/admin.functions";
import { BeforeAfterProject } from "@/lib/cms-store";
import { MediaUpload } from "./MediaUpload";

const inputClass =
  "w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764] focus:ring-2 focus:ring-[#016764]/25";

export function BeforeAfterPanel() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin_before_after"],
    queryFn: () => adminListBeforeAfter(),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin_before_after"] });
    void qc.invalidateQueries({ queryKey: ["public_home_data"] });
  };

  const add = useMutation({
    mutationFn: () => adminCreateBeforeAfter({ data: { title: "New Before/After Project" } }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteBeforeAfter({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Layers className="h-5 w-5 text-amber-400" /> Before &amp; After Projects
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage side-by-side clip transformation comparisons, retention metrics and edit notes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => add.mutate()}
          disabled={add.isPending}
          className="btn-radial inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
        >
          {add.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add Project Comparison
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading comparison projects…</p>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No comparison projects added yet. Click "Add Project Comparison" to create your first
            before/after showcase.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {data?.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onSaved={invalidate}
            onDelete={() => {
              if (confirm("Are you sure you want to delete this before/after project?")) {
                remove.mutate(project.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  onSaved,
  onDelete,
}: {
  project: BeforeAfterProject;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<BeforeAfterProject>(project);
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: () => adminSaveBeforeAfter({ data: { id: project.id, patch: draft } }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    },
  });

  const set = <K extends keyof BeforeAfterProject>(k: K, v: BeforeAfterProject[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => set("featured", !draft.featured)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              draft.featured
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            {draft.featured ? "Featured Showcase" : "Standard Project"}
          </button>

          <button
            type="button"
            onClick={() => set("is_published", !draft.is_published)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              draft.is_published
                ? "bg-[#2fd3c6]/20 text-[#7ef0e2] border border-[#016764]"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            {draft.is_published ? (
              <>
                <Eye className="h-3.5 w-3.5" /> Published
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Draft / Hidden
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete Project
        </button>
      </div>

      {/* Main Fields Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Project Title</label>
            <input
              className={inputClass}
              value={draft.title}
              placeholder="Title"
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Category</label>
            <input
              className={inputClass}
              value={draft.category}
              placeholder="e.g. VSL / Hook Edit"
              onChange={(e) => set("category", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Client Name</label>
            <input
              className={inputClass}
              value={draft.client}
              placeholder="e.g. Acme Media Group"
              onChange={(e) => set("client", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Project Description</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={draft.description}
              placeholder="Short description..."
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Before Retention Metric
              </label>
              <input
                className={inputClass}
                value={draft.before_retention}
                placeholder="e.g. 18% retention"
                onChange={(e) => set("before_retention", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                After Retention Metric
              </label>
              <input
                className={inputClass}
                value={draft.after_retention}
                placeholder="e.g. 71% retention"
                onChange={(e) => set("after_retention", e.target.value)}
              />
            </div>
          </div>

          {/* Before & After Image Uploads */}
          <div className="grid gap-3 sm:grid-cols-2">
            <MediaUpload
              label="Before Image (Raw Clip)"
              value={draft.before_image}
              onChange={(path) => set("before_image", path)}
            />
            <MediaUpload
              label="After Image (Edited Version)"
              value={draft.after_image}
              onChange={(path) => set("after_image", path)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Six Key Editing Decisions (One per line)
            </label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={draft.notes?.join("\n") ?? ""}
              onChange={(e) =>
                set(
                  "notes",
                  e.target.value.split("\n").filter((line) => line.trim().length > 0),
                )
              }
              placeholder="Cut the first 3 seconds...&#10;Added kinetic captions..."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-radial rounded-full px-6 py-2.5 text-xs font-medium"
        >
          {save.isPending ? "Saving Project…" : "Save Changes"}
        </button>

        {saved && (
          <span className="flex items-center gap-1 text-xs text-[#7ef0e2]">
            <Check className="h-3.5 w-3.5" /> Project Saved
          </span>
        )}
      </div>
    </div>
  );
}
