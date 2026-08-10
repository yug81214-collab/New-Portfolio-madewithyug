import { motion } from "motion/react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <span className="text-[11px] font-medium tracking-[0.25em] text-[#2fd3c6] uppercase">
        {eyebrow}
      </span>
      <h2 className="text-balance-tight mt-5 text-4xl leading-[1.05] font-semibold sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}
