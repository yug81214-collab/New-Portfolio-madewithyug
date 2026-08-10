import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useMediaUrl, useSettings } from "@/lib/site-data";
import portrait from "@/assets/portrait.jpg";

const links = [
  { label: "Short Form", href: "#work" },
  { label: "Long Form", href: "#long-form" },
  { label: "About", href: "#about" },
  { label: "Software", href: "#services" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: settings } = useSettings();

  const logoPath = settings?.["logo_url"] || "";
  const logoResolved = useMediaUrl(logoPath);
  const siteName = settings?.["site_name"] || "Yug Jha";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.15 }}
      className="fixed inset-x-0 top-4 z-50 px-4"
    >
      <nav
        className={`glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-6 ${
          scrolled ? "glow-teal bg-card/60" : ""
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5 pl-1">
          <img 
            src={logoResolved || portrait} 
            alt={siteName} 
            className="h-8 w-8 rounded-xl object-cover" 
          />
          <span className="text-sm font-medium tracking-tight">{siteName}</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground inner-glow transition-colors hover:bg-accent sm:block"
          >
            Let's Work Together
          </motion.a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mx-auto mt-2 max-w-6xl rounded-3xl p-3 lg:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-2xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
          >
            Let's Talk
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
