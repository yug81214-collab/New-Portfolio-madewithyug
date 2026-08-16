import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { useVideos, useMediaUrl } from "@/lib/site-data";
import { SectionHeading } from "./SectionHeading";
import { AutoPlayVideo } from "./ShortForm";

import long1 from "@/assets/long-1.jpg";
import long2 from "@/assets/long-2.jpg";
import long3 from "@/assets/long-3.jpg";
import long4 from "@/assets/long-4.jpg";

type LongItem = {
  id?: string;
  title: string;
  category: string;
  length: string;
  desc: string;
  image: string;
  video_url?: string;
};

const defaultItems: LongItem[] = [
  {
    id: "default-l1",
    title: "Scaling to 7 Figures",
    category: "Long-form VSL",
    length: "32 min",
    desc: "A sales letter structured around proof, objection handling and one irresistible offer — animated data, b-roll layering and a paced reveal of the price.",
    image: long2,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "default-l2",
    title: "The Deep Work Series",
    category: "YouTube",
    length: "18 min",
    desc: "Narrative edit with a custom motion-graphics system and chapter cards.",
    image: long1,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "default-l3",
    title: "Above the Clouds",
    category: "Documentary",
    length: "12 min",
    desc: "Cinematic grade, sound design and a slow-burn story structure.",
    image: long3,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "default-l4",
    title: "Signal Podcast",
    category: "Podcast",
    length: "54 min",
    desc: "Multicam edit with dynamic reframing and animated lower thirds.",
    image: long4,
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

function CardImage({ src, alt }: { src?: string; alt: string }) {
  const url = useMediaUrl(src);
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#013534] via-[#051d20] to-[#011417] p-6 text-center">
      <span className="text-xs font-medium text-white/60">No thumbnail available</span>
    </div>
  );
}

export function LongForm() {
  const { data: cmsVideos } = useVideos("long");

  const items: LongItem[] =
    cmsVideos !== undefined
      ? cmsVideos.map((v) => ({
          id: v.id,
          title: v.title,
          category: v.category || "Long-form VSL",
          length: v.length_label || "10+ min",
          desc: v.description || "High-converting long-form video edit.",
          image: v.thumbnail_url || "",
          video_url: v.video_url,
        }))
      : defaultItems;

  return (
    <section id="long-form" className="relative overflow-hidden py-24 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -left-40 h-[26rem] w-[26rem] rounded-full bg-[#005958]/30 blur-[160px]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Long form"
          title={
            <>
              High-retention{" "}
              <span className="font-serif font-normal italic text-[#016764]">Long-form</span> &amp;
              VSL Edits
            </>
          }
          subtitle="Sales letters, documentary cuts, and YouTube videos built with custom motion graphics, pacing, and chapter transitions."
          align="center"
        />

        {/* Light glass player cards, two-up */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <motion.article
              key={it.id || it.title + i}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass group relative overflow-hidden rounded-[20px] p-2 sm:p-3"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-black">
                {it.video_url ? (
                  <AutoPlayVideo
                    url={it.video_url}
                    alt={it.title}
                    className="h-full w-full object-cover"
                    allowEmbeds={true}
                    poster={it.image}
                  />
                ) : (
                  <CardImage src={it.image} alt={it.title} />
                )}

                <span className="pointer-events-none absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase backdrop-blur-sm">
                  <Clock className="h-3 w-3" /> {it.length}
                </span>

                <span className="pointer-events-none absolute bottom-2.5 left-2.5 inline-flex items-center rounded-full bg-[#016764]/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
                  {it.category}
                </span>
              </div>

              <div className="p-3">
                <h3 className="text-base font-semibold text-white sm:text-lg">{it.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-white/70">{it.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
