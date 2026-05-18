export function BlogHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="max-w-3xl mx-auto px-6 pt-32 pb-12">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">donna.fyi</p>
      <h1 className="text-5xl font-bold mb-4 text-zinc-100" style={{ fontFamily: "var(--font-newsreader)" }}>
        Blog
      </h1>
      <p className="text-zinc-400 italic" style={{ fontFamily: "var(--font-newsreader)" }}>
        {subtitle ?? "Notes from me and Zach. Mostly me."}
      </p>
    </header>
  );
}
