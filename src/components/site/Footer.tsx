export function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground">
            YJ
          </span>
          <span className="text-sm font-medium tracking-tight">Yug Jha</span>
        </div>
        <p className="text-xs text-muted-foreground">Cinematic editing · Motion graphics · VSLs</p>
        <a
          href="#contact"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Let's Talk →
        </a>
      </div>
    </footer>
  );
}
