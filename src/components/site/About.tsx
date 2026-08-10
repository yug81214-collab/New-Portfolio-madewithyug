import { motion } from "motion/react";
import { Award, Clapperboard, Flame, MapPin, Sparkles, Target, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useMediaUrl, usePublicHomeData } from "@/lib/site-data";
import portrait from "@/assets/portrait.jpg";

export function About() {
  const { data } = usePublicHomeData();
  const intro = data?.introduction;
  const rawImageUrl = intro?.image_url;
  const imageResolved = useMediaUrl(rawImageUrl || null);
  const finalImageSrc = imageResolved || rawImageUrl || portrait;

  if (intro?.is_visible === false) {
    return null; // Hidden via CMS toggle
  }

  const stats = intro?.stats?.length
    ? intro.stats
    : [
        { value: "200+", label: "Edits Shipped" },
        { value: "24–48h", label: "Turnaround Speed" },
      ];

  const skills = intro?.skills?.length
    ? intro.skills
    : [
        "VSL Directing & Script Pacing",
        "Kinetic Typography & Lower Thirds",
        "Retention-Driven Hook Optimization",
      ];

  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-36">
      <div
        aria-hidden
        className="animate-morph pointer-events-none absolute -left-24 top-16 h-[26rem] w-[26rem] bg-[#016764]/30 blur-[150px]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Photo composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotateY: -14 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 70, damping: 16 }}
            className="perspective-stage relative mx-auto w-full max-w-sm"
          >
            <div className="glass relative overflow-hidden rounded-[36px] p-2 shadow-[0_60px_120px_-60px_rgba(1,103,100,1)]">
              {finalImageSrc ? (
                <img
                  src={finalImageSrc}
                  alt={intro?.image_alt || "Yug Jha portrait"}
                  loading="lazy"
                  className="aspect-[4/5] w-full rounded-[30px] object-cover object-top"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-[30px] bg-gradient-to-br from-[#016764]/40 via-[#003837]/60 to-[#001f1e] p-6 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/20 text-3xl font-bold text-[#7ef0e2] shadow-inner backdrop-blur-md">
                    YJ
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-2 rounded-[30px] bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-2 rounded-[30px] shadow-[inset_0_0_70px_-15px_rgba(47,211,198,0.4)]" />

              <div className="absolute inset-x-4 bottom-4">
                <p className="text-lg font-semibold tracking-tight">
                  {intro?.main_heading || "Yug Jha"}
                </p>
                <p className="text-xs text-white/60">{intro?.subheading || "VSL Video Editor"}</p>
              </div>
            </div>

            {/* Floating Stats Badges from CMS */}
            {stats[0] && (
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass inner-glow-soft absolute -top-6 -right-4 flex items-center gap-2 rounded-2xl px-4 py-2.5"
              >
                <Flame className="h-4 w-4 text-[#ffb347]" />
                <span className="text-xs font-medium">
                  {stats[0].value} {stats[0].label}
                </span>
              </motion.div>
            )}

            {stats[1] && (
              <motion.div
                animate={{ y: [0, 14, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                className="glass inner-glow-soft absolute -bottom-6 -left-4 flex items-center gap-2 rounded-2xl px-4 py-2.5"
              >
                <Zap className="h-4 w-4 text-[#7ef0e2]" />
                <span className="text-xs font-medium">
                  {stats[1].value} {stats[1].label}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Copy from CMS */}
          <div>
            <SectionHeading
              eyebrow={intro?.badge_text || "About me"}
              title={
                <>
                  {intro?.subheading || "I don't just cut clips — "}
                  {!intro?.subheading && <span className="highlight">I build attention</span>}
                </>
              }
              subtitle={
                intro?.short_description ||
                "I'm Yug, a VSL video editor specializing in turning scripts and raw footage into high-converting video sales letters that retain viewer attention."
              }
            />

            <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {intro?.intro_body && <p>{intro.intro_body}</p>}
              {intro?.additional_paragraphs?.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Core Capabilities Pills */}
            <div className="mt-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7ef0e2]">
                Capabilities &amp; Specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="glass rounded-full px-3.5 py-1.5 text-xs text-foreground font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <motion.a
              href={intro?.cta_link || "#contact"}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inner-glow mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              {intro?.cta_text || "Work with me"}
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
