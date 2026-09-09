import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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

/** Turns storage paths into temporary signed URLs; absolute URLs pass through. */
export function useMediaUrls(values: (string | null | undefined)[]) {
  const cleanValues = values.filter((v): v is string => typeof v === "string" && v.length > 0);
  const paths = Array.from(new Set(cleanValues.filter(isStoragePath)));
  return useQuery({
    queryKey: ["media", paths.slice().sort()],
    enabled: paths.length > 0,
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<Record<string, string>> => {
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .createSignedUrls(paths, 60 * 60 * 24);
        if (error) throw error;
        const map: Record<string, string> = {};
        for (const item of data ?? []) {
          if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
        }
        return map;
      } catch (e) {
        return {};
      }
    },
  });
}

export function getMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (!isStoragePath(value)) return value;

  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined) ||
    "";

  const cleanPath = value.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${cleanPath}`;
}

export function useMediaUrl(value: string | null | undefined) {
  const { data } = useMediaUrls(value ? [value] : []);
  if (!value) return "";
  if (!isStoragePath(value)) return value;

  if (data?.[value]) return data[value];

  return getMediaUrl(value);
}
