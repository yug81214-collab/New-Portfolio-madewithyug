import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { uploadDirectlyToStorage } from "@/lib/upload-client";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  adminCreateUploadUrl,
  adminDeleteMediaAsset,
  adminListMedia,
  adminRegisterMediaAsset,
} from "@/lib/admin.functions";
import { supabase } from "@/lib/supabase";
import { BUCKET, useMediaUrl } from "@/lib/site-data";

import { MediaAsset } from "@/lib/cms-store";

export function MediaLibraryPanel() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["admin_media"],
    queryFn: () => adminListMedia(),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin_media"] });

  const deleteAsset = useMutation({
    mutationFn: (id: string) => adminDeleteMediaAsset({ data: { id } }),
    onSuccess: invalidate,
  });

  const createUrlToken = useServerFn(adminCreateUploadUrl);
  const registerAsset = useServerFn(adminRegisterMediaAsset);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const { url, error: uploadErr } = await uploadDirectlyToStorage(file, async (data) => {
        const res = await createUrlToken({ data });
        return res;
      });

      if (uploadErr || !url) {
        throw new Error(uploadErr || "Upload returned no URL");
      }

      await registerAsset({
        data: {
          filename: file.name,
          file_type: file.type,
          size_bytes: file.size,
          url,
          storage_path: url,
          category: file.type.startsWith("video/") ? "video" : "image",
        },
      });

      invalidate();
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const filteredAssets = assets?.filter((a) => {
    const matchesSearch =
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      a.storage_path.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || a.category === category;
    return matchesSearch && matchesCat;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <ImageIcon className="h-5 w-5 text-indigo-400" /> Central Media Library
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage all uploaded images, thumbnails, banners and video assets in one secure place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn-radial inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Upload Asset
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-2xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filenames or paths…"
            className="w-full rounded-xl border border-border bg-white/[0.04] pl-10 pr-4 py-2 text-xs outline-none focus:border-[#016764]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {["all", "image", "video", "thumbnail"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs capitalize transition-all ${
                category === cat
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading media assets…</p>
      )}

      {!isLoading && filteredAssets?.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No media assets match your filters.</p>
        </div>
      )}

      {/* Asset Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredAssets?.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isCopied={copiedId === asset.id}
            onCopy={() => copyToClipboard(asset.storage_path, asset.id)}
            onDelete={() => {
              if (confirm(`Delete media asset "${asset.filename}"?`)) {
                deleteAsset.mutate(asset.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AssetCard({
  asset,
  isCopied,
  onCopy,
  onDelete,
}: {
  asset: MediaAsset;
  isCopied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const preview = useMediaUrl(asset.storage_path || asset.url);

  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-3 flex flex-col justify-between">
      {/* Thumbnail Preview Box */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black/40">
        {preview ? (
          <img
            src={preview}
            alt={asset.filename}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase backdrop-blur-md">
          {asset.category}
        </span>
      </div>

      {/* Asset Info */}
      <div className="mt-3 space-y-1">
        <p className="text-xs font-semibold truncate" title={asset.filename}>
          {asset.filename}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {(asset.size_bytes / 1024).toFixed(0)} KB · Uploaded by {asset.uploaded_by}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-2.5">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#7ef0e2] transition-colors"
        >
          {isCopied ? <Check className="h-3 w-3 text-[#7ef0e2]" /> : <Copy className="h-3 w-3" />}
          {isCopied ? "Copied" : "Copy Path"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          title="Delete asset"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
