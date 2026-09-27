import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Film } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useVideos, useMediaUrl } from "@/lib/site-data";
import { MEDIA } from "@/lib/portfolio-assets";

import short1 from "@/assets/short-1.jpg";
import short2 from "@/assets/short-2.jpg";
import short3 from "@/assets/short-3.jpg";
import short4 from "@/assets/short-4.jpg";

type ReelItem = {
  id?: string;
  title: string;
  category: string;
  image: string;
  video_url?: string;
  length_label?: string;
};

const defaultReels: ReelItem[] = [
  {
    id: "default-1",
    title: "Retention Hook Transformation",
    category: "VSL Short",
    image: MEDIA.shorts[0]?.poster || short1,
    video_url: MEDIA.shorts[0]?.video,
    length_label: "0:16",
  },
  {
    id: "default-2",
    title: "Scroll-Stopping Opening Frame",
    category: "VSL Short",
    image: MEDIA.shorts[1]?.poster || short2,
    video_url: MEDIA.shorts[1]?.video,
    length_label: "0:45",
  },
  {
    id: "default-3",
    title: "Kinetic Caption Cut",
    category: "Talking Head",
    image: MEDIA.shorts[2]?.poster || short3,
    video_url: MEDIA.shorts[2]?.video,
    length_label: "0:13",
  },
  {
    id: "default-4",
    title: "Objection-Handling Beat",
    category: "VSL Short",
    image: MEDIA.shorts[3]?.poster || short4,
    video_url: MEDIA.shorts[3]?.video,
    length_label: "0:15",
  },
  {
    id: "default-5",
    title: "Offer Reveal Edit",
    category: "UGC Ad",
    image: MEDIA.shorts[4]?.poster || short1,
    video_url: MEDIA.shorts[4]?.video,
    length_label: "0:36",
  },
  {
    id: "default-6",
    title: "High-Pacing Action Cut",
    category: "Motion Graphics",
    image: MEDIA.shorts[5]?.poster || short2,
    video_url: MEDIA.shorts[5]?.video,
    length_label: "0:15",
  },
  {
    id: "default-7",
    title: "Closing Call-to-Action Sequence",
    category: "VSL Short",
    image: MEDIA.shorts[6]?.poster || short3,
    video_url: MEDIA.shorts[6]?.video,
    length_label: "0:17",
  },
];

const FEATURED_SHORT: ReelItem = {
  id: "featured-wizard-trader-reel-2",
  title: "Wizard Trader Reel 2",
  category: "Short Form",
  image: short1,
  video_url: "portfolio-media/final-wizard-trader-reel-2.mp4",
  length_label: "0:59",
};

const POSTER_BY_VIDEO: Record<string, string> = {
  [MEDIA.long1Video]: MEDIA.long1Poster,
  [MEDIA.baRawVideo]: MEDIA.baRawPoster,
  [MEDIA.baEditVideo]: MEDIA.baEditPoster,
  ...Object.fromEntries(MEDIA.shorts.map((s) => [s.video, s.poster])),
};

export function AutoPlayVideo({
  url,
  alt = "",
  className = "h-full w-full object-cover",
  allowEmbeds = false,
  poster,
}: {
  url: string;
  alt?: string;
  className?: string;
  allowEmbeds?: boolean;
  poster?: string;
}) {
  const mediaUrl = useMediaUrl(url);
  const posterUrl = useMediaUrl(poster);
  const finalUrl = mediaUrl || url;
  const mediaRef = useRef<HTMLVideoElement>(null);

  const resolvedPoster =
    posterUrl ||
    poster ||
    POSTER_BY_VIDEO[finalUrl] ||
    POSTER_BY_VIDEO[url] ||
    (typeof finalUrl === "string" && finalUrl.endsWith(".mp4")
      ? finalUrl.replace(/\.mp4$/i, ".jpg")
      : undefined);

  useEffect(() => {
    const video = mediaRef.current;
    if (!video || !finalUrl) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.autoplay = true;

    let cancelled = false;
    let recoveryTimer: ReturnType<typeof window.setTimeout> | null = null;
    let stagnantTicks = 0;
    let lastTime = video.currentTime;

    const safePlay = () => {
      if (cancelled) return;
      if (video.ended) {
        try {
          video.currentTime = 0;
        } catch {
          // Ignore an invalid seek while the source is being reloaded.
        }
      }
      if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
        video.load();
      }
      void video.play().catch(() => {
        // A temporary autoplay/buffering rejection is recovered by the
        // watchdog and media-event retry below.
      });
    };

    const recoverSource = () => {
      if (cancelled) return;
      const resumeAt = Number.isFinite(video.currentTime) ? video.currentTime : 0;

      try {
        video.load();
      } catch {
        safePlay();
        return;
      }

      const restoreAndPlay = () => {
        if (cancelled) return;
        try {
          if (Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime = Math.min(resumeAt, Math.max(0, video.duration - 0.05));
          } else if (resumeAt > 0) {
            video.currentTime = resumeAt;
          }
        } catch {
          // Keep the freshly loaded position when seeking is not available yet.
        }
        safePlay();
      };

      video.addEventListener("loadedmetadata", restoreAndPlay, { once: true });
      window.setTimeout(() => {
        video.removeEventListener("loadedmetadata", restoreAndPlay);
        restoreAndPlay();
      }, 1500);
    };

    const scheduleRecovery = () => {
      if (cancelled || recoveryTimer) return;
      recoveryTimer = window.setTimeout(() => {
        recoveryTimer = null;
        if (video.paused || video.ended) {
          safePlay();
          return;
        }

        if (
          video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.networkState !== HTMLMediaElement.NETWORK_EMPTY
        ) {
          recoverSource();
        } else {
          safePlay();
        }
      }, 2500);
    };

    const onProblem = () => scheduleRecovery();

    const events = [
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "canplaythrough",
      "progress",
      "durationchange",
      "playing",
      "waiting",
      "stalled",
      "suspend",
      "pause",
      "error",
      "emptied",
    ];

    events.forEach((eventName) => {
      video.addEventListener(eventName, onProblem);
    });

    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
      video.load();
    }
    safePlay();

    const watchdog = window.setInterval(() => {
      if (cancelled) return;

      const currentTime = video.currentTime;
      const moved =
        Number.isFinite(currentTime) &&
        Number.isFinite(lastTime) &&
        Math.abs(currentTime - lastTime) > 0.02;

      if (!video.paused && !video.ended && video.duration > 0) {
        stagnantTicks = moved ? 0 : stagnantTicks + 1;
      } else {
        stagnantTicks = 0;
      }

      lastTime = currentTime;

      if (video.ended) {
        try {
          video.currentTime = 0;
        } catch {
          // Ignore and let play() request the next loop.
        }
        safePlay();
      } else if (video.paused) {
        safePlay();
      } else if (stagnantTicks >= 4) {
        // About 10 seconds without time advancing: rebuild the media request
        // instead of allowing a permanently stalled player.
        stagnantTicks = 0;
        recoverSource();
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(watchdog);
      if (recoveryTimer) window.clearTimeout(recoveryTimer);
      events.forEach((eventName) => {
        video.removeEventListener(eventName, onProblem);
      });
    };
  }, [finalUrl]);

  useEffect(() => {
    const video = mediaRef.current;
    if (!video || !finalUrl) return;
    video.preload = "auto";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
  }, [finalUrl]);

  if (!finalUrl) return null;

  if (allowEmbeds && (finalUrl.includes("youtube.com") || finalUrl.includes("youtu.be"))) {
    let videoId = "";
    if (finalUrl.includes("watch?v=")) {
      videoId = finalUrl.split("watch?v=")[1]?.split("&")[0] || "";
    } else if (finalUrl.includes("youtu.be/")) {
      videoId = finalUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (finalUrl.includes("embed/")) {
      videoId = finalUrl.split("embed/")[1]?.split("?")[0] || "";
    }

    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1`;
      return (
        <iframe
          src={embedUrl}
          title={alt}
          className={`${className} border-0 pointer-events-none scale-125`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }
  }

  if (allowEmbeds && finalUrl.includes("vimeo.com")) {
    let videoId = "";
    if (finalUrl.includes("player.vimeo.com/video/")) {
      videoId = finalUrl.split("player.vimeo.com/video/")[1]?.split("?")[0] || "";
    } else {
      videoId = finalUrl.split("vimeo.com/")[1]?.split("?")[0] || "";
    }

    if (videoId) {
      const embedUrl = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`;
      return (
        <iframe
          src={embedUrl}
          title={alt}
          className={`${className} border-0 pointer-events-none scale-125`}
          allow="autoplay; fullscreen"
        />
      );
    }
  }

  return (
    <video
      ref={mediaRef}
      src={finalUrl}
      poster={resolvedPoster}
      autoPlay
      loop
      muted
      defaultMuted
      playsInline
      preload="auto"
      className={className}
      aria-label={alt}
    />
  );
}

function ReelCardImage({ src, alt }: { src?: string; alt: string }) {
  const url = useMediaUrl(src);
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#013534] via-[#051d20] to-[#011417] p-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-[#7ef0e2] shadow-inner backdrop-blur-md">
        <Film className="h-8 w-8" />
      </div>
    </div>
  );
}

export function ShortForm() {
  const { data: cmsVideos } = useVideos("short");
  const [index, setIndex] = useState(0);

  const cmsReels: ReelItem[] =
    cmsVideos?.map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category || "Short VSL",
      image: v.thumbnail_url || "",
      video_url: v.video_url,
      length_label: v.length_label,
    })) ?? [];

  const baseReels = cmsVideos !== undefined ? cmsReels : defaultReels;
  const hasFeatured = baseReels.some(
    (item) =>
      item.id === FEATURED_SHORT.id ||
      item.video_url?.includes("final-wizard-trader-reel-2.mp4"),
  );
  const reels = hasFeatured ? baseReels : [...baseReels, FEATURED_SHORT];
  const safeReels = reels.length > 0 ? reels : [FEATURED_SHORT];
  const n = safeReels.length;
  const activeIndex = n > 0 ? index % n : 0;
  const go = (dir: number) => {
    if (n === 0) return;
    setIndex((i) => (i + dir + n) % n);
  };

  return (
    <section id="work" className="relative overflow-hidden py-24 sm:py-36">
      <div
        aria-hidden
        className="animate-morph pointer-events-none absolute top-1/3 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 bg-primary/25 blur-[170px]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Short form"
          title={
            <>
              Explore my <span className="highlight">short-form</span> &amp;{" "}
              <span className="text-[#7ef0e2]">VSL</span> edits
            </>
          }
          subtitle="Vertical edits built for one job only: keep the viewer watching until the offer lands."
          align="center"
        />

        {/* 3D coverflow stage */}
        <div className="perspective-stage relative mt-20 h-[26rem] sm:h-[34rem]">
          {safeReels.map((r, i) => {
            let offset = i - activeIndex;
            if (offset > n / 2) offset -= n;
            if (offset < -n / 2) offset += n;
            const abs = Math.abs(offset);
            const active = offset === 0;
            return (
              <motion.button
                key={r.id || r.title + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${r.title}`}
                animate={{
                  x: `calc(-50% + ${offset * 55}%)`,
                  scale: active ? 1 : 0.82 - (abs - 1) * 0.08,
                  rotateY: offset * -26,
                  opacity: abs > 2 ? 0 : 1 - abs * 0.28,
                  filter: active ? "blur(0px)" : `blur(${abs * 1.6}px)`,
                  zIndex: 20 - abs,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="glass group absolute top-0 left-1/2 h-full w-[15rem] cursor-pointer overflow-hidden rounded-[30px] p-0 sm:w-[19rem]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {r.video_url ? (
                  <AutoPlayVideo
                    url={r.video_url}
                    alt={r.title}
                    className="h-full w-full object-cover"
                    poster={r.image}
                  />
                ) : (
                  <ReelCardImage
                    src={r.image}
                    alt={`${r.title} — ${r.category} vertical video edit`}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              </motion.button>
            );
          })}

          {/* arrows */}
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-2 sm:px-10">
            {[-1, 1].map((dir) => (
              <motion.button
                key={dir}
                type="button"
                onClick={() => go(dir)}
                aria-label={dir === -1 ? "Previous reel" : "Next reel"}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                className="btn-radial pointer-events-auto grid h-11 w-11 place-items-center rounded-full"
              >
                {dir === -1 ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* dots & CTA */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            {safeReels.map((r, i) => (
              <button
                key={r.id || r.title + i}
                type="button"
                aria-label={`Go to ${r.title}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeIndex ? "w-8 bg-[#2fd3c6]" : "w-3 bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-radial inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-primary-foreground"
            >
              <Film className="h-4 w-4" />
              Get a VSL edited
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
