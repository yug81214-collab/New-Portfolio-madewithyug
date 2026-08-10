import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const testimonials = [
  {
    quote:
      "Our retention graph changed shape after the first delivery. Same footage, completely different result.",
    name: "Marcus Ellery",
    role: "Founder, Neural Labs",
  },
  {
    quote:
      "The VSL Yug edited became our highest converting asset. He understood the offer better than our copywriter.",
    name: "Priya Raman",
    role: "Head of Growth, Halo",
  },
  {
    quote:
      "Fast, calm and genuinely creative. He sends versions I didn't think to ask for — and they're usually better.",
    name: "Dan Whitfield",
    role: "YouTube Creator, 480k subs",
  },
  {
    quote:
      "Motion graphics on another level for the price. Our brand finally looks like the category leader.",
    name: "Sofia Marchetti",
    role: "Creative Director, Lumen",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/4 h-[26rem] w-[26rem] rounded-full bg-[#016764]/25 blur-[170px]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Testimonials" title="Clients who came back." align="center" />
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.65, delay: (i % 2) * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass rounded-[28px] p-9"
            >
              <Quote className="h-6 w-6 text-[#016764]" />
              <blockquote className="mt-6 text-lg leading-relaxed tracking-tight">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/40 text-xs font-semibold ring-1 ring-white/10">
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
