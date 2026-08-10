import { motion } from "motion/react";
import { Flame, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { AfterEffectsIcon, PremiereIcon, ResolveIcon } from "./BrandIcon";
import { useSettings } from "@/lib/site-data";

export type SoftwareToolConfig = {
  name: string;
  role: string;
  desc: string;
  skills: string[];
};

export type SoftwareSectionData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ae: SoftwareToolConfig;
  pr: SoftwareToolConfig;
  resolve: SoftwareToolConfig;
  marquee: string[];
};

export const DEFAULT_SOFTWARE_DATA: SoftwareSectionData = {
  eyebrow: "The toolkit",
  title: "Three tools. One goal — edits that sell",
  subtitle:
    "Every VSL passes through all three: cut in Premiere, animated in After Effects, graded in Resolve.",
  ae: {
    name: "Adobe After Effects",
    role: "Motion graphics",
    desc: "Animated VSL proof, kinetic type, title systems, data reveals and VFX cleanup.",
    skills: ["Kinetic captions", "Data animation", "Title systems"],
  },
  pr: {
    name: "Adobe Premiere Pro",
    role: "Story & pacing",
    desc: "VSL assembly, hook engineering, multicam and retention-driven cuts.",
    skills: ["VSL structure", "Multicam", "Sound design"],
  },
  resolve: {
    name: "DaVinci Resolve",
    role: "Color & finish",
    desc: "Cinematic grading, node work, skin tone control and final delivery.",
    skills: ["Cinematic grade", "Node work", "Finishing"],
  },
  marquee: [
    "VSL Editing",
    "Hook Engineering",
    "Kinetic Captions",
    "Motion Graphics",
    "Color Grading",
    "Sound Design",
    "Retention Editing",
    "UGC Ads",
  ],
};

export function parseSkillsList(value: string | undefined, fallback: string[]): string[] {
  if (value === undefined || value === null) return fallback;
  const items = value
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return items.length > 0 ? items : fallback;
}

type SoftwareProps = {
  overrideData?: Partial<SoftwareSectionData>;
  className?: string;
  isCompactPreview?: boolean;
};

export function Software({
  overrideData,
  className = "",
  isCompactPreview = false,
}: SoftwareProps) {
  const { data: settings } = useSettings();

  const eyebrow =
    overrideData?.eyebrow ?? settings?.["software_eyebrow"] ?? DEFAULT_SOFTWARE_DATA.eyebrow;

  const titleText =
    overrideData?.title ?? settings?.["software_title"] ?? DEFAULT_SOFTWARE_DATA.title;

  const subtitle =
    overrideData?.subtitle ?? settings?.["software_subtitle"] ?? DEFAULT_SOFTWARE_DATA.subtitle;

  const aeRole =
    overrideData?.ae?.role ?? settings?.["software_ae_role"] ?? DEFAULT_SOFTWARE_DATA.ae.role;

  const aeDesc =
    overrideData?.ae?.desc ?? settings?.["software_ae_desc"] ?? DEFAULT_SOFTWARE_DATA.ae.desc;

  const aeSkills =
    overrideData?.ae?.skills ??
    parseSkillsList(settings?.["software_ae_skills"], DEFAULT_SOFTWARE_DATA.ae.skills);

  const prRole =
    overrideData?.pr?.role ?? settings?.["software_pr_role"] ?? DEFAULT_SOFTWARE_DATA.pr.role;

  const prDesc =
    overrideData?.pr?.desc ?? settings?.["software_pr_desc"] ?? DEFAULT_SOFTWARE_DATA.pr.desc;

  const prSkills =
    overrideData?.pr?.skills ??
    parseSkillsList(settings?.["software_pr_skills"], DEFAULT_SOFTWARE_DATA.pr.skills);

  const resolveRole =
    overrideData?.resolve?.role ??
    settings?.["software_resolve_role"] ??
    DEFAULT_SOFTWARE_DATA.resolve.role;

  const resolveDesc =
    overrideData?.resolve?.desc ??
    settings?.["software_resolve_desc"] ??
    DEFAULT_SOFTWARE_DATA.resolve.desc;

  const resolveSkills =
    overrideData?.resolve?.skills ??
    parseSkillsList(settings?.["software_resolve_skills"], DEFAULT_SOFTWARE_DATA.resolve.skills);

  const marqueeItems =
    overrideData?.marquee ??
    parseSkillsList(settings?.["software_marquee"], DEFAULT_SOFTWARE_DATA.marquee);

  const tools = [
    {
      name: DEFAULT_SOFTWARE_DATA.ae.name,
      Icon: AfterEffectsIcon,
      role: aeRole,
      desc: aeDesc,
      skills: aeSkills,
      glow: "rgba(153,153,255,0.5)",
    },
    {
      name: DEFAULT_SOFTWARE_DATA.pr.name,
      Icon: PremiereIcon,
      role: prRole,
      desc: prDesc,
      skills: prSkills,
      glow: "rgba(153,153,255,0.5)",
    },
    {
      name: DEFAULT_SOFTWARE_DATA.resolve.name,
      Icon: ResolveIcon,
      role: resolveRole,
      desc: resolveDesc,
      skills: resolveSkills,
      glow: "rgba(47,211,198,0.5)",
    },
  ];

  return (
    <section
      id="services"
      className={`relative overflow-hidden ${isCompactPreview ? "py-8" : "py-24 sm:py-36"} ${className}`}
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={eyebrow}
          title={
            titleText.includes("—") ? (
              <>
                {titleText.split("—")[0]} —{" "}
                <span className="highlight">{titleText.split("—")[1]}</span>
              </>
            ) : (
              titleText
            )
          }
          subtitle={subtitle}
          align="center"
        />

        <div
          className={`perspective-stage mt-12 grid gap-6 ${
            isCompactPreview ? "grid-cols-1 md:grid-cols-3" : "lg:grid-cols-3"
          }`}
        >
          {tools.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 90, damping: 16, delay: i * 0.1 }}
              whileHover={{ y: -8, rotateX: -4, rotateY: 4 }}
              style={{ transformStyle: "preserve-3d" }}
              className="glass group relative overflow-hidden rounded-[30px] p-6 sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-0 blur-[90px] transition-opacity duration-700 group-hover:opacity-100"
                style={{ background: t.glow }}
              />
              <motion.div
                className="animate-float w-fit drop-shadow-[0_18px_35px_rgba(0,0,0,0.6)]"
                whileHover={{ scale: 1.08, rotate: -4 }}
              >
                <t.Icon className="h-14 w-14 sm:h-16 sm:w-16" />
              </motion.div>

              <span className="mt-6 inline-block text-[11px] font-medium tracking-[0.2em] text-[#2fd3c6] uppercase">
                {t.role}
              </span>

              <h3 className="mt-2 text-lg sm:text-xl font-semibold tracking-tight">{t.name}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {t.desc}
              </p>

              {/* Keywords / Skill Pills */}
              <ul className="mt-6 flex flex-wrap gap-2">
                {t.skills.map((s, idx) => (
                  <li
                    key={`${s}-${idx}`}
                    className="inner-glow-soft rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10"
                  >
                    {s}
                  </li>
                ))}
              </ul>

              {i === 0 ? (
                <Flame
                  aria-hidden
                  className="pointer-events-none absolute right-6 bottom-6 h-5 w-5 text-[#ffb347] opacity-0 transition-all duration-500 group-hover:-translate-y-2 group-hover:opacity-100"
                />
              ) : (
                <Zap
                  aria-hidden
                  className="pointer-events-none absolute right-6 bottom-6 h-5 w-5 text-[#7ef0e2] opacity-0 transition-all duration-500 group-hover:-translate-y-2 group-hover:opacity-100"
                />
              )}
            </motion.article>
          ))}
        </div>
      </div>

      {/* Marquee Preview */}
      {!isCompactPreview && marqueeItems.length > 0 && (
        <div className="relative mt-16 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex w-max shrink-0 items-center gap-4 pr-4">
            {[...marqueeItems, ...marqueeItems].map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm whitespace-nowrap text-white/70"
              >
                <Zap className="h-3.5 w-3.5 text-[#7ef0e2]" />
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
