import { useState } from "react";
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
    title: "Halo Device — Short VSL",
    category: "VSL",
    image: short2,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    length_label: "0:42",
  },
  {
    id: "default-2",
    title: "Neural — Founder Cut",
    category: "Talking Head",
    image: short1,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    length_label: "0:30",
  },
  {
    id: "default-3",
    title: "Nightfall",
    category: "Story Reel",
    image: short3,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    length_label: "0:45",
  },
  {
    id: "default-4",
    title: "Lumen Skincare",
    category: "UGC Ad",
    image: short4,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    length_label: "0:25",
  },
];

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
  active = true,
}: {
  url: string;
  alt?: string;
  className?: string;
  allowEmbeds?: boolean;
  poster?: string;
  active?: boolean;
}) {
  const mediaUrl = useMediaUrl(url);
  const finalUrl = mediaUrl || url;

  if (!finalUrl) return null;

  if (!active) {
    return poster ? <img src={poster} alt={alt} loading="lazy" className={className} /> : null;
  }

  if (allowEmbeds) {
    if (finalUrl.includes("youtube.com") || finalUrl.includes("youtu.be")) {
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

    if (finalUrl.includes("vimeo.com")) {
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
  }

  return (
    <video
      src={finalUrl}
      poster={poster || POSTER_BY_VIDEO[finalUrl]}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className={className}
    />
  );
}

function ReelCardImage({ src, alt }: { src?: string; alt: string }) {
  const url = useMediaUrl(src);
  if (url) {
    return <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" />;
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

  const reels: ReelItem[] =
    cmsVideos !== undefined
      ? cmsVideos.map((v) => ({
          id: v.id,
          title: v.title,
          category: v.category || "Short VSL",
          image: v.thumbnail_url || "",
          video_url: v.video_url,
          length_label: v.length_label,
        }))
      : defaultReels;

  const n = reels.length;
  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);
  const current = reels[index] || reels[0];

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
          {reels.map((r, i) => {
            let offset = i - index;
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
                    active={true}
                  />
                ) : (
                  <ReelCardImage
                    src={r.image}
                    alt={`${r.title} — ${r.category} vertical video edit`}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Overlay details */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-left">
                  <span className="inline-block rounded-full bg-[#016764]/80 px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase backdrop-blur-sm">
                    {r.category}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-white sm:text-base">
                    {r.title}
                  </h3>
                  {r.length_label && (
                    <span className="mt-0.5 block text-xs text-white/70">{r.length_label}</span>
                  )}
                </div>

                {active && (
                  <div className="pointer-events-none absolute inset-0 rounded-[30px] shadow-[inset_0_0_60px_-10px_rgba(47,211,198,0.45)]" />
                )}
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
            {reels.map((r, i) => (
              <button
                key={r.id || r.title + i}
                type="button"
                aria-label={`Go to ${r.title}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-[#2fd3c6]" : "w-3 bg-white/20"
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
