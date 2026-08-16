import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const faqs = [
  {
    q: "Do you specialise in VSLs?",
    a: "Yes — VSLs are my main focus. Short VSLs for paid ads and long-form sales letters up to 60 minutes, structured around hook, proof, objections and offer.",
  },
  {
    q: "What do you need from me to start?",
    a: "Raw footage (Drive / Dropbox / Frame.io), the script or offer details, brand assets if you have them, and one reference video you like.",
  },
  {
    q: "How fast is delivery?",
    a: "Short form and short VSLs in 24–48 hours. Long-form VSLs and YouTube edits usually 3–6 days depending on runtime and graphics load.",
  },
  {
    q: "How many revisions are included?",
    a: "Two full revision rounds on every project, plus small tweaks after that. I'd rather the edit convert than argue over change requests.",
  },
  {
    q: "What are your rates?",
    a: "Short form starts at a flat per-video rate, VSLs are quoted per runtime and graphics needs. Monthly retainers get the best pricing — message me for a quote.",
  },
  {
    q: "Which software do you edit in?",
    a: "Premiere Pro for the cut, After Effects for motion graphics, and DaVinci Resolve for grading and finishing.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden py-24 sm:py-36">
      <div
        aria-hidden
        className="animate-morph pointer-events-none absolute -right-32 top-1/3 h-[24rem] w-[24rem] bg-primary/20 blur-[150px]"
      />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions before we{" "}
              <span className="font-serif font-normal italic text-[#016764]">start</span>?
            </>
          }
          align="center"
        />

        <div className="mt-14 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`glass overflow-hidden rounded-[24px] transition-shadow duration-500 ${
                  isOpen ? "shadow-[0_40px_90px_-50px_rgba(1,103,100,1)]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium sm:text-base">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="inner-glow-soft grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/70 text-primary-foreground"
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    >
                      <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
