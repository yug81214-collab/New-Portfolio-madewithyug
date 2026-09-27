import { MEDIA } from "./portfolio-assets";
import { getMediaUrl } from "./site-data";

type HomeMediaData = {
  introduction?: { image_url?: string | null };
  beforeAfter?: Array<{ before_image?: string | null; after_image?: string | null }>;
  shortVideos?: Array<{ thumbnail_url?: string | null; video_url?: string | null }>;
  longVideos?: Array<{ thumbnail_url?: string | null; video_url?: string | null }>;
};

const warmed = new Map<string, HTMLImageElement | HTMLVideoElement>();
const STATIC_MEDIA = [
  MEDIA.intro, MEDIA.baRawPoster, MEDIA.baEditPoster, MEDIA.long1Poster,
  MEDIA.baRawVideo, MEDIA.baEditVideo, MEDIA.long1Video,
  ...MEDIA.shorts.flatMap((item) => [item.poster, item.video]),
];

const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(url);
const resolve = (value?: string | null) => value ? getMediaUrl(value) : "";

function collect(data?: HomeMediaData) {
  const images = new Set<string>();
  const videos = new Set<string>();
  const add = (value?: string | null) => {
    const url = resolve(value);
    if (!url) return;
    (isVideo(url) ? videos : images).add(url);
  };

  STATIC_MEDIA.forEach(add);
  add(data?.introduction?.image_url);
  for (const p of data?.beforeAfter ?? []) {
    add(p.before_image);
    add(p.after_image);
  }
  for (const v of [...(data?.shortVideos ?? []), ...(data?.longVideos ?? [])]) {
    add(v.thumbnail_url);
    add(v.video_url);
  }
  return { images: [...images], videos: [...videos] };
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

function warmVideo(url: string) {
  if (warmed.has(url)) return Promise.resolve();
  return new Promise<void>((resolvePromise) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolvePromise();
    };
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.src = url;
    video.load();
    window.setTimeout(finish, 4500);
    warmed.set(url, video);
  });
}

export async function preloadPortfolioMedia(data?: HomeMediaData, timeoutMs = 6500) {
  if (typeof window === "undefined") return;
  const { images, videos } = collect(data);
  const work = [...images.map(warmImage), ...videos.map(warmVideo)];
  if (!work.length) return;

  await Promise.race([
    Promise.all(work),
    new Promise<void>((resolvePromise) => window.setTimeout(resolvePromise, timeoutMs)),
  ]);

  void Promise.all(work).catch(() => undefined);
}
