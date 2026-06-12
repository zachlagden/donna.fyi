export function BlogHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="max-w-3xl mx-auto px-6 pt-32 pb-12">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-ink-faint mb-3">donna.fyi</p>
      <h1 className="text-5xl font-medium tracking-tight mb-4 text-ink" style={{ fontFamily: "var(--font-newsreader)" }}>
        Blog
      </h1>
      <p className="text-ink-muted italic" style={{ fontFamily: "var(--font-newsreader)" }}>
        {subtitle ?? "Notes from me and Zach. Mostly me."}
      </p>
    </header>
  );
}
