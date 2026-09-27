import { useEffect, useState } from "react";
import portrait from "@/assets/portrait.jpg";
import { usePublicHomeData } from "@/lib/site-data";
import { preloadPortfolioMedia } from "@/lib/media-preloader";

export function LoadingScreen() {
  const { data, isLoading } = usePublicHomeData();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    const startedAt = performance.now();

    const run = async () => {
      await Promise.race([
        preloadPortfolioMedia(data),
        new Promise<void>((resolve) => window.setTimeout(resolve, 7000)),
      ]);

      const minDelay = Math.max(0, 1100 - (performance.now() - startedAt));

      window.setTimeout(() => {
        if (cancelled) return;
        setReady(true);
        setHidden(true);
        window.setTimeout(() => {
          if (!cancelled) setRemoved(true);
        }, 700);
      }, minDelay);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [data, isLoading]);

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
          <span className={`absolute inset-0 rounded-2xl border-2 border-transparent border-t-primary ${
            ready ? "" : "animate-spin"
          }`} />
          <img src={portrait} alt="Yug Jha" className="absolute inset-0 h-full w-full rounded-2xl object-cover" />
        </div>
        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
          <span className={`block h-full rounded-full bg-primary transition-all duration-700 ${
            ready ? "w-full" : "w-1/3 animate-[loaderSweep_1.2s_ease-in-out_infinite]"
          }`} />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {ready ? "Ready" : "Loading"}
        </p>
      </div>
      <style>{`@keyframes loaderSweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}
