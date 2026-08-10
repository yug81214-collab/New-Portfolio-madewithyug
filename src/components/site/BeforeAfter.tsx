import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Eye, Scissors, X, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useMediaUrl, usePublicHomeData } from "@/lib/site-data";
import { AutoPlayVideo } from "./ShortForm";

import beforeFallback from "@/assets/before.jpg";
import afterFallback from "@/assets/after.jpg";

function MediaDisplay({ src, alt, className }: { src: string; alt: string; className: string }) {
  const isVideo =
    /\.(mp4|webm|mov|mkv|avi)$/i.test(src) ||
    src.startsWith("data:video/") ||
    src.includes("youtube.com") ||
    src.includes("youtu.be") ||
    src.includes("vimeo.com");

  if (isVideo) {
    return <AutoPlayVideo url={src} alt={alt} className={className} />;
  }

  return <img src={src} alt={alt} loading="lazy" className={className} />;
}

export function BeforeAfter() {
  const { data } = usePublicHomeData();
  const projects = data?.beforeAfter?.filter((p: any) => p.is_published !== false) || [];
  const activeProject = projects[0];

  const [view, setView] = useState<"before" | "after">("after");

  const beforeImg = useMediaUrl(activeProject?.before_image || null) || beforeFallback;
  const afterImg = useMediaUrl(activeProject?.after_image || null) || afterFallback;

  const notesList = activeProject?.notes?.length
    ? activeProject.notes
    : [
        "Cut the first 3 seconds of dead air — the hook now starts on frame one.",
        "Added kinetic captions timed to the speaker's stressed syllables.",
        "Punch-ins on every key claim so the frame never sits still.",
        "Sound design: whooshes on transitions, low-end bed under the promise.",
        "Cinematic grade with teal shadows to separate subject from background.",
        "Progress bar + curiosity text so viewers stay for the payoff.",
      ];

  return (
    <section id="before-after" className="relative overflow-hidden py-24 sm:py-36">
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Before / After"
          title={
            <>
              {activeProject?.title || "A standard clip vs."}{" "}
              <span className="highlight">
                {activeProject ? "my edited version" : "my edited version"}
              </span>
            </>
          }
          subtitle={
            activeProject?.description ||
            "Same footage. Same speaker. The difference is everything that happens in the timeline."
          }
          align="center"
        />

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          {/* switcher */}
          <div className="perspective-stage">
            <div className="glass inner-glow-soft mx-auto mb-6 flex w-fit items-center gap-1 rounded-full p-1.5">
              {(["before", "after"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`relative rounded-full px-5 py-2 text-xs font-medium tracking-wide transition-colors duration-300 ${
                    view === v ? "text-primary-foreground" : "text-white/55"
                  }`}
                >
                  {view === v && (
                    <motion.span
                      layoutId="ba-pill"
                      className="inner-glow absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    />
                  )}
                  <span className="relative">{v === "before" ? "Standard clip" : "My edit"}</span>
                </button>
              ))}
            </div>

            <div className="relative mx-auto aspect-[9/16] w-full max-w-[19rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, rotateY: 22, scale: 0.94, filter: "blur(10px)" }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, rotateY: -22, scale: 0.94, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="glass absolute inset-0 overflow-hidden rounded-[30px] p-1.5"
                >
                  <MediaDisplay
                    src={view === "before" ? beforeImg : afterImg}
                    alt={
                      view === "before"
                        ? "Standard unedited short-form clip"
                        : "The same clip after my edit, with captions and grade"
                    }
                    className={`h-full w-full rounded-[24px] object-cover ${
                      view === "before" ? "saturate-[0.7] brightness-[0.85]" : ""
                    }`}
                  />
                  <div className="pointer-events-none absolute inset-1.5 rounded-[24px] bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {view === "after" && (
                    <div className="pointer-events-none absolute inset-1.5 rounded-[24px] shadow-[inset_0_0_70px_-12px_rgba(47,211,198,0.55)]" />
                  )}

                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase ${
                        view === "before"
                          ? "bg-white/10 text-white/70"
                          : "inner-glow bg-primary text-primary-foreground"
                      }`}
                    >
                      {view === "before" ? (
                        <>
                          <X className="h-3 w-3" /> Raw
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" /> Edited
                        </>
                      )}
                    </span>
                    <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] text-white/70">
                      <Eye className="h-3 w-3" />
                      {view === "before"
                        ? activeProject?.before_retention || "18% retention"
                        : activeProject?.after_retention || "71% retention"}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass inner-glow-soft absolute -right-6 top-8 hidden items-center gap-2 rounded-2xl px-3.5 py-2 sm:flex"
              >
                <Zap className="h-4 w-4 text-[#7ef0e2]" />
                <span className="text-[11px] font-medium">+53% watch time</span>
              </motion.div>
            </div>
          </div>

          {/* notes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="glass rounded-[30px] p-7 sm:p-9"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-[#2fd3c6] uppercase">
              <Scissors className="h-3.5 w-3.5" /> How I made it engaging
            </span>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Key decisions between <span className="highlight">scroll</span> and{" "}
              <span className="highlight">stay</span>
            </h3>
            <ul className="mt-7 space-y-4">
              {notesList.map((n: string, i: number) => (
                <motion.li
                  key={n}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="inner-glow-soft mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/70 text-[10px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  {n}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
