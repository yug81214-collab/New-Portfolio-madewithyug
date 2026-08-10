import { motion } from "motion/react";
import {
  Clock,
  Film,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const items = [
  {
    icon: Film,
    title: "Story-first editing",
    desc: "Structure before effects. Every cut earns the next second.",
  },
  {
    icon: TrendingUp,
    title: "Sales-focused VSLs",
    desc: "Edits built around proof, objections and a clear call to action.",
  },
  {
    icon: Wand2,
    title: "Motion graphics expertise",
    desc: "Custom title systems, data animation and clean typography.",
  },
  {
    icon: Clock,
    title: "Fast turnaround",
    desc: "Short form in 24–48h, long form on an agreed schedule.",
  },
  {
    icon: RefreshCw,
    title: "Generous revisions",
    desc: "We refine until the edit does its job — no nickel and diming.",
  },
  {
    icon: MessageSquare,
    title: "Clear communication",
    desc: "Updates you don't have to chase, in the channel you prefer.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable delivery",
    desc: "Deadlines treated as promises, with organised project files.",
  },
  {
    icon: Sparkles,
    title: "Creative problem-solving",
    desc: "Thin footage? Weak hook? I find the version that works.",
  },
];

export function WhyMe() {
  return (
    <section className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Why work with me"
          title="A partner for the whole edit, not just the export."
          align="center"
        />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.07 }}
              whileHover={{ y: -8 }}
              className="glass rounded-[26px] p-7 transition-shadow duration-500 hover:shadow-[0_40px_90px_-45px_rgba(1,103,100,1)]"
            >
              <it.icon className="h-5 w-5 text-[#7ef0e2]" />
              <h3 className="mt-6 text-base font-semibold tracking-tight">{it.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
