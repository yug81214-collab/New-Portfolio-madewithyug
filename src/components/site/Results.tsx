import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "./SectionHeading";

const metrics = [
  { label: "Audience Retention", value: 68, suffix: "%" },
  { label: "Watch Time", value: 142, suffix: "%" },
  { label: "Click-Through Rate", value: 54, suffix: "%" },
  { label: "Conversions", value: 87, suffix: "%" },
  { label: "Sales Growth", value: 3.4, suffix: "x" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      +{to % 1 === 0 ? Math.round(n) : n.toFixed(1)}
      {suffix}
    </span>
  );
}

export function Results() {
  return (
    <section className="relative py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#005958]/30 blur-[170px]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Results"
          title="What better editing actually moves."
          subtitle="Average lift reported by clients after switching to story-first, retention-optimised edits."
        />

        <div className="glass mt-14 rounded-[32px] p-8 sm:p-12">
          <ul className="space-y-8">
            {metrics.map((m, i) => (
              <li key={m.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium tracking-tight">{m.label}</span>
                  <span className="text-2xl font-semibold tracking-tight text-[#7ef0e2] tabular-nums">
                    <Counter to={m.value} suffix={m.suffix} />
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${Math.min(100, m.suffix === "x" ? m.value * 22 : m.value * 0.7)}%`,
                    }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#016764] to-[#7ef0e2] shadow-[0_0_24px_rgba(1,103,100,0.9)]"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
