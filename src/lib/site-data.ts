import { useQuery } from "@tanstack/react-query";
import { publicGetHomeData } from "@/lib/admin.functions";

export type Video = {
  id: string;
  kind: "short" | "long";
  title: string;
  category: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  length_label: string;
  sort_order: number;
  is_published: boolean;
};

export type Settings = Record<string, string>;

export const BUCKET = "site-media";

/** Values may be a storage path ("uploads/x.jpg") or an absolute/relative URL. */
export function isStoragePath(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value.startsWith("/") || value.startsWith("./")) return false;
  if (value.includes("/assets/aistudio/__l5e/assets-v1")) return false;
  return !/^(https?:)?\/\//.test(value) && !value.startsWith("data:");
}

export function usePublicHomeData() {
  return useQuery({
    queryKey: ["public_home_data"],
    queryFn: () => publicGetHomeData(),
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
  });
}

export function useSettings() {
  const { data: homeData, isLoading, error } = usePublicHomeData();
  return {
    data: homeData?.settings ?? {},
    isLoading,
    error,
  };
}

export function useSetting(key: string, fallback: string) {
  const { data: settings } = useSettings();
  const value = settings?.[key];
  return value && value.trim() ? value : fallback;
}

export function useVideos(kind: "short" | "long") {
  const { data: homeData, isLoading, error } = usePublicHomeData();
  const videos = kind === "short" ? homeData?.shortVideos : homeData?.longVideos;
  return {
    data: (videos ?? []) as Video[],
    isLoading,
    error,
  };
}

/**
 * Portfolio media is public. Stable public URLs allow browser/CDN caching
 * without generating a fresh signed URL for every component render.
 */
export function useMediaUrls(values: (string | null | undefined)[]) {
  const map: Record<string, string> = {};
  for (const value of values) {
    if (!value || !isStoragePath(value)) continue;
    const url = getMediaUrl(value);
    if (url) map[value] = url;
  }
  return { data: map, isLoading: false, isFetching: false, error: null };
}

export function getMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (!isStoragePath(value)) return value;

  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined) ||
    "";

  if (!supabaseUrl) return value;

  const cleanPath = value.replace(/^\/+/, "");
  return supabaseUrl + "/storage/v1/object/public/" + BUCKET + "/" + cleanPath;
}

export function useMediaUrl(value: string | null | undefined) {
  return getMediaUrl(value);
}
