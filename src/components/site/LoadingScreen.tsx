import { useEffect, useState } from "react";
import portrait from "@/assets/portrait.jpg";

/**
 * Full-screen intro loader shown briefly while the page settles.
 */
export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 1200);
    const t2 = setTimeout(() => setRemoved(true), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      aria-hidden={hidden}
      className={`fixed inset-0 z-[999] grid place-items-center bg-background transition-opacity duration-700 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-2xl border-2 border-primary/25" />
          <span className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-primary" />
          <img
            src={portrait}
            alt="Yug Jha"
            className="absolute inset-0 h-full w-full rounded-2xl object-cover"
          />
        </div>
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-1/3 animate-[loaderSweep_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Loading</p>
      </div>
      <style>{`@keyframes loaderSweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}
