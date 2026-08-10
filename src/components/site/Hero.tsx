import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";

const badges = [
  "VSL Specialist",
  "Motion Graphics Expert",
  "2+ Years · 200+ Edits",
  "24–48h Delivery",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-40 pb-24 sm:pt-52 sm:pb-36">
      {/* cinematic lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="animate-morph absolute -top-40 left-1/2 h-[36rem] w-[46rem] -translate-x-1/2 bg-[#016764] opacity-60 blur-[160px]"
        />
        <motion.div
          animate={{ opacity: [0.25, 0.5, 0.25], x: [-40, 40, -40] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-0 h-[26rem] w-[26rem] rounded-full bg-[#005958] blur-[150px]"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2fd3c6]" />
          Available for new projects
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08 }}
          className="text-balance-tight mx-auto mt-8 max-w-4xl text-center text-5xl leading-[0.95] font-semibold sm:text-7xl lg:text-[5.5rem]"
        >
          VSLs That Keep
          <br />
          People{" "}
          <span className="text-glow bg-gradient-to-br from-white via-[#7ef0e2] to-[#016764] bg-clip-text text-transparent">
            Watching &amp; Buying.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          I'm Yug — a <span className="highlight">VSL editor</span> and motion graphics artist. I
          turn scripts and raw footage into <span className="highlight">video sales letters</span>{" "}
          that hold attention, answer objections and close — plus retention-built short form for the
          top of your funnel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            href="#work"
            className="btn-radial group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-medium"
          >
            <Play className="h-4 w-4 fill-current" />
            See my VSL work
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            href="#contact"
            className="glass inner-glow-soft group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-medium hover:bg-white/10"
          >
            Let's Talk
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.a>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.45 }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {badges.map((b) => (
            <li
              key={b}
              className="glass rounded-2xl px-4 py-5 text-center text-xs font-medium tracking-tight text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {b}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
