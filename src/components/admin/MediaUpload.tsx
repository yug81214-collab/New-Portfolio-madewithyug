import { useRef, useState } from "react";
import { ImagePlus, Film, Loader2, XCircle } from "lucide-react";
import { useMediaUrl } from "@/lib/site-data";
import { useServerFn } from "@tanstack/react-start";
import { adminCreateUploadUrl, adminRegisterMediaAsset } from "@/lib/admin.functions";
import { uploadDirectlyToStorage } from "@/lib/upload-client";

export function MediaUpload({
  value,
  onChange,
  label = "Image",
  accept = "image/*",
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const preview = useMediaUrl(value);

  const createUrlToken = useServerFn(adminCreateUploadUrl);
  const registerAsset = useServerFn(adminRegisterMediaAsset);

  const isVideo =
    accept.includes("video") ||
    /\.(mp4|mov|webm|mkv|avi)$/i.test(value) ||
    value.startsWith("data:video/") ||
    value.startsWith("blob:");

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setBusy(false);
    setProgress(0);
    setError("Upload cancelled");
  };

  const upload = async (file: File) => {
    setError(null);

    // Validation
    const isVideoFile =
      file.type.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
    const isImageFile =
      file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file.name);

    if (accept.includes("video") && !isVideoFile) {
      setError("Please select a valid video file (.mp4, .mov, .webm, etc.)");
      return;
    }

    if (accept.includes("image") && !isImageFile && !isVideoFile) {
      setError("Please select a valid image file (.jpg, .png, .webp, etc.)");
      return;
    }

    // Size check (2GB limit)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 2GB limit`);
      return;
    }

    setBusy(true);
    setProgress(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const { url, error: uploadErr } = await uploadDirectlyToStorage(
      file,
      async (data) => {
        const res = await createUrlToken({ data });
        return res;
      },
      setProgress,
      abortController.signal,
    );

    abortControllerRef.current = null;

    if (uploadErr) {
      setBusy(false);
      if (uploadErr !== "Upload cancelled.") {
        setError(uploadErr);
      }
      return;
    }

    if (url) {
      try {
        await registerAsset({
          data: {
            filename: file.name,
            file_type: file.type,
            size_bytes: file.size,
            url,
            storage_path: url,
            category: isVideoFile ? "video" : "image",
          },
        });
        onChange(url);
        setProgress(100);
      } catch (regErr) {
        setError("Uploaded to storage, but failed to save to library.");
      } finally {
        setBusy(false);
      }
    } else {
      setBusy(false);
      setError("Unknown error occurred during upload.");
    }
  };

  return (
    <div>
      <label className="mb-2 block text-xs tracking-wide text-muted-foreground">{label}</label>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white/5">
          {preview ? (
            isVideo ? (
              <video src={preview} className="h-full w-full object-cover" muted />
            ) : (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            )
          ) : isVideo ? (
            <Film className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {busy ? `Uploading ${progress}%` : "Upload File"}
            </button>

            {busy && (
              <button
                type="button"
                onClick={cancelUpload}
                className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/20"
              >
                <XCircle className="h-3.5 w-3.5" /> Cancel
              </button>
            )}

            {value && !busy && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            )}
          </div>

          {busy && (
            <div className="w-48 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#7ef0e2] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {progress < 10
                  ? "Preparing upload..."
                  : progress < 90
                    ? `Uploading... ${progress}%`
                    : "Finalizing asset..."}
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
