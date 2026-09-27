import { MEDIA } from "./portfolio-assets";
import { getMediaUrl } from "./site-data";

type HomeMediaData = {
  introduction?: { image_url?: string | null };
  beforeAfter?: Array<{ before_image?: string | null; after_image?: string | null }>;
  shortVideos?: Array<{ thumbnail_url?: string | null; video_url?: string | null }>;
  longVideos?: Array<{ thumbnail_url?: string | null; video_url?: string | null }>;
};

const warmed = new Map<string, HTMLImageElement>();
const STATIC_IMAGES = [
  MEDIA.intro,
  MEDIA.baRawPoster,
  MEDIA.baEditPoster,
  MEDIA.long1Poster,
  ...MEDIA.shorts.map((item) => item.poster),
];

const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(url);
const resolve = (value?: string | null) => (value ? getMediaUrl(value) : "");

function collectImages(data?: HomeMediaData) {
  const images = new Set<string>();

  const add = (value?: string | null) => {
    const url = resolve(value);
    if (!url || isVideo(url)) return;
    images.add(url);
  };

  STATIC_IMAGES.forEach(add);
  add(data?.introduction?.image_url);

  for (const project of data?.beforeAfter ?? []) {
    add(project.before_image);
    add(project.after_image);
  }

  for (const video of [...(data?.shortVideos ?? []), ...(data?.longVideos ?? [])]) {
    add(video.thumbnail_url);
  }

  return [...images];
}

function warmImage(url: string) {
  if (warmed.has(url)) return Promise.resolve();

  return new Promise<void>((resolvePromise) => {
    const img = new Image();
    img.decoding = "async";
    img.fetchPriority = "high";
    img.onload = () => resolvePromise();
    img.onerror = () => resolvePromise();
    img.src = url;
    warmed.set(url, img);
  });
}

/**
 * Video files are intentionally NOT downloaded through detached hidden
 * <video> elements here. The ShortForm carousel keeps the real <video>
 * elements mounted, so their own browser buffers are the buffers that will
 * actually be used for playback. Detached elements can compete for bandwidth
 * and their decoded frames are not transferable to another video element.
 */
export async function preloadPortfolioMedia(data?: HomeMediaData, timeoutMs = 4500) {
  if (typeof window === "undefined") return;

  const images = collectImages(data);
  if (!images.length) return;

  await Promise.race([
    Promise.all(images.map(warmImage)),
    new Promise<void>((resolvePromise) => window.setTimeout(resolvePromise, timeoutMs)),
  ]);
}
