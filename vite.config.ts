// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "fs";
import path from "path";

function aistudioMediaPlugin() {
  return {
    name: "vite-plugin-aistudio-media",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(
        (
          req: import("http").IncomingMessage,
          res: import("http").ServerResponse,
          next: () => void,
        ) => {
          if (req.url && req.url.startsWith("/assets/aistudio/")) {
            const rawPath = req.url.split("?")[0].split("#")[0];
            try {
              const decodedPath = decodeURIComponent(rawPath);
              const relativePath = decodedPath.replace(/^\//, "");
              const aistudioDir = path.resolve(process.cwd(), "public", "assets", "aistudio");
              const filePath = path.resolve(process.cwd(), "public", relativePath);
              if (
                filePath.startsWith(aistudioDir + path.sep) &&
                fs.existsSync(filePath) &&
                fs.statSync(filePath).isFile()
              ) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeMap: Record<string, string> = {
                  ".jpg": "image/jpeg",
                  ".jpeg": "image/jpeg",
                  ".png": "image/png",
                  ".gif": "image/gif",
                  ".webp": "image/webp",
                  ".svg": "image/svg+xml",
                  ".bmp": "image/bmp",
                  ".ico": "image/x-icon",
                  ".mp4": "video/mp4",
                  ".webm": "video/webm",
                  ".ogv": "video/ogg",
                  ".mp3": "audio/mpeg",
                  ".wav": "audio/wav",
                  ".ogg": "audio/ogg",
                  ".pdf": "application/pdf",
                };
                res.setHeader("Content-Type", mimeMap[ext] || "application/octet-stream");
                res.setHeader("Cache-Control", "no-cache");
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            } catch {
              // Fall through if URI decoding or file access fails
            }
          }
          next();
        },
      );
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [aistudioMediaPlugin()],
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
      fs: {
        allow: [process.cwd()],
      },
    },
  },
  tanstackStart: {
    // Client entry in src/client.tsx
    client: { entry: "client" },
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
