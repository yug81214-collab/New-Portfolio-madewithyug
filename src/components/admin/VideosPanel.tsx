import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, Loader2, Plus, Trash2, Video as VideoIcon } from "lucide-react";
import {
  adminCreateVideo,
  adminDeleteVideo,
  adminListVideos,
  adminSaveVideo,
  type AdminVideo,
} from "@/lib/admin.functions";
import { MediaUpload } from "./MediaUpload";

const input =
  "w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764] focus:ring-2 focus:ring-[#016764]/25";

export function VideosPanel({ kind: initialKind = "short" }: { kind?: "short" | "long" }) {
  const [activeKind, setActiveKind] = useState<"short" | "long">(initialKind);
  const qc = useQueryClient();
  const key = ["admin_videos", activeKind];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => adminListVideos({ data: { kind: activeKind } }),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: ["videos", activeKind] });
    void qc.invalidateQueries({ queryKey: ["public_home_data"] });
  };

  const add = useMutation({
    mutationFn: () =>
      adminCreateVideo({ data: { kind: activeKind, sort_order: (data?.length ?? 0) + 1 } }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteVideo({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      {/* Category selector tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white/[0.02] p-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveKind("short")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-all ${
              activeKind === "short"
                ? "bg-[#016764] text-white shadow-lg shadow-[#016764]/30"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Film className="h-4 w-4" />
            Short-Form Videos (Reels &amp; Shorts)
          </button>
          <button
            type="button"
            onClick={() => setActiveKind("long")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-all ${
              activeKind === "long"
                ? "bg-[#016764] text-white shadow-lg shadow-[#016764]/30"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <VideoIcon className="h-4 w-4" />
            Long-Form Videos (VSLs &amp; YouTube)
          </button>
        </div>

        <button
          type="button"
          onClick={() => add.mutate()}
          disabled={add.isPending}
          className="btn-radial inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
        >
          {add.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          Add {activeKind === "short" ? "Short" : "Long-Form"} Video
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          {activeKind === "short" ? "Short-Form Portfolio Videos" : "Long-Form Portfolio Videos"}
        </h2>
        <span className="text-xs text-muted-foreground">
          {data?.length ?? 0} {activeKind === "short" ? "shorts" : "long-form"} total
        </span>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading videos…</p>}
      {!isLoading && (data?.length ?? 0) === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No {activeKind === "short" ? "short-form" : "long-form"} videos in CMS yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Click "Add {activeKind === "short" ? "Short" : "Long-Form"} Video" to upload video files
            directly or embed links.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {data?.map((video) => (
          <VideoRow
            key={video.id}
            video={video}
            onSaved={invalidate}
            onDelete={() => remove.mutate(video.id)}
          />
        ))}
      </div>
    </div>
  );
}

function VideoRow({
  video,
  onSaved,
  onDelete,
}: {
  video: AdminVideo;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<AdminVideo>(video);
  const [saved, setSaved] = useState(false);

  const isYoutube = (url: string) => /youtube\.com|youtu\.be/i.test(url || "");
  const effectiveKind = draft.kind;
  const initialSource =
    effectiveKind === "short" ? "upload" : isYoutube(draft.video_url) ? "youtube" : "upload";
  const [sourceType, setSourceType] = useState<"upload" | "youtube">(initialSource);
  const [uploadUrl, setUploadUrl] = useState(
    effectiveKind === "short" || !isYoutube(draft.video_url) ? draft.video_url : "",
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    effectiveKind === "long" && isYoutube(draft.video_url) ? draft.video_url : "",
  );

  const activeSourceType = effectiveKind === "short" ? "upload" : sourceType;

  const save = useMutation({
    mutationFn: () => {
      const finalUrl = activeSourceType === "upload" ? uploadUrl : youtubeUrl;
      if (effectiveKind === "short" && (activeSourceType === "youtube" || isYoutube(finalUrl))) {
        throw new Error("Short form videos must use local upload (MP4/WebM), YouTube URLs are not allowed.");
      }
      if (!finalUrl) {
        throw new Error(
          `Please ${activeSourceType === "upload" ? "upload a video file" : "enter a YouTube URL"}.`,
        );
      }
      return adminSaveVideo({ data: { id: video.id, patch: { ...draft, video_url: finalUrl } } });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      onSaved();
    },
  });

  const set = <K extends keyof AdminVideo>(k: K, v: AdminVideo[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Video Title
            </label>
            <input
              className={input}
              value={draft.title}
              placeholder="e.g. SaaS VSL High-Converting Direct Cut"
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Video Category
              </label>
              <select
                className={input}
                value={draft.kind}
                onChange={(e) => {
                  const newKind = e.target.value as "short" | "long";
                  set("kind", newKind);
                  if (newKind === "short" && sourceType === "youtube") {
                    setSourceType("upload");
                  }
                }}
              >
                <option value="short">Short Form</option>
                <option value="long">Long Form</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Badge / Sub-category
              </label>
              <input
                className={input}
                value={draft.category}
                placeholder="e.g. VSL, UGC Ad"
                onChange={(e) => set("category", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Length Label
            </label>
            <input
              className={input}
              value={draft.length_label}
              placeholder="e.g. 14:20 or 0:45"
              onChange={(e) => set("length_label", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Video Source {draft.kind === "short" ? "(Local File Only)" : ""}
            </label>
            {draft.kind === "long" && (
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSourceType("upload")}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeSourceType === "upload"
                      ? "bg-[#016764] text-white"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  Upload from System
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("youtube")}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeSourceType === "youtube"
                      ? "bg-[#016764] text-white"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  YouTube / Embed
                </button>
              </div>
            )}

            {activeSourceType === "youtube" ? (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  YouTube / Embed URL
                </label>
                <input
                  className={input}
                  value={youtubeUrl}
                  placeholder="https://www.youtube.com/watch?v=..."
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
            ) : (
              <div className="mt-2">
                <MediaUpload
                  label="Upload Video File directly from File Explorer (.mp4, .mov, .webm)"
                  value={uploadUrl}
                  onChange={(path) => setUploadUrl(path)}
                  accept="video/*"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <MediaUpload
            label="Cover / Thumbnail Image"
            value={draft.thumbnail_url}
            onChange={(path) => set("thumbnail_url", path)}
            accept="image/*"
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Description / Notes
            </label>
            <textarea
              rows={3}
              className={`${input} resize-none`}
              value={draft.description}
              placeholder="Describe hook, retention rate, or key highlights..."
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Sort Order
              </label>
              <input
                type="number"
                className={`${input} w-24`}
                value={draft.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-white/5 text-[#016764] focus:ring-[#016764]"
                checked={draft.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
              />
              Published on site
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="btn-radial rounded-full px-6 py-2 text-xs font-medium"
          >
            {save.isPending ? "Saving…" : "Save Changes"}
          </button>
          {saved && <span className="text-xs text-[#7ef0e2]">Saved successfully!</span>}
          {save.isError && (
            <span className="text-xs text-destructive">{(save.error as Error).message}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
