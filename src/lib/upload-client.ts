import { BUCKET } from "./site-data";

export async function uploadDirectlyToStorage(
  file: File,
  createUrlTokenFn: (data: { ext: string }) => Promise<{ path: string; token: string }>,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<{ url: string; error?: string }> {
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const { path, token } = await createUrlTokenFn({ ext });

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      if (signal) {
        signal.addEventListener("abort", () => {
          xhr.abort();
        });
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };

      if (token && token !== "mock-token") {
        // Direct upload to Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

        if (!supabaseUrl) {
          return resolve({ url: "", error: "Missing Supabase URL for direct upload" });
        }

        const url = `${supabaseUrl}/storage/v1/object/upload/sign/${BUCKET}/${path}?token=${token}`;

        xhr.open("PUT", url);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.setRequestHeader("x-upsert", "true");

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ url: path });
          } else {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve({ url: "", error: res.error || res.message || `Status ${xhr.status}` });
            } catch {
              resolve({ url: "", error: `Upload failed with status ${xhr.status}` });
            }
          }
        };
        xhr.onerror = () => resolve({ url: "", error: "Network error during upload." });
        xhr.onabort = () => resolve({ url: "", error: "Upload cancelled." });
        xhr.send(file);
      } else {
        resolve({ url: "", error: "Failed to generate signed upload URL (mock-token)." });
      }
    });
  } catch (err) {
    return { url: "", error: err instanceof Error ? err.message : "Failed to initiate upload" };
  }
}
