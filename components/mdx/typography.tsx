import type { ReactNode } from "react";

export const typography = {
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-4xl font-bold text-zinc-100 mt-12 mb-6" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h1>
  ),
  h2: ({ children, id }: { children: ReactNode; id?: string }) => (
    <h2 id={id} className="text-3xl font-bold text-zinc-100 mt-10 mb-4 scroll-mt-24" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h2>
  ),
  h3: ({ children, id }: { children: ReactNode; id?: string }) => (
    <h3 id={id} className="text-2xl font-semibold text-zinc-100 mt-8 mb-3 scroll-mt-24" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => (
    <p className="text-zinc-300 leading-relaxed my-5" style={{ fontFamily: "var(--font-newsreader)", fontSize: "1.125rem" }}>{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a href={href} className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30">{children}</a>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-2 border-violet-500/40 pl-4 my-6 italic text-zinc-400" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</blockquote>
  ),
  ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-outside pl-6 my-5 text-zinc-300 space-y-2">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-outside pl-6 my-5 text-zinc-300 space-y-2">{children}</ol>,
  li: ({ children }: { children: ReactNode }) => <li className="leading-relaxed" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</li>,
  hr: () => <hr className="my-10 border-zinc-800" />,
  code: ({ children }: { children: ReactNode }) => (
    <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-violet-300 font-mono text-[0.9em]">{children}</code>
  ),
};
