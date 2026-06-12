import type { ReactNode } from "react";

export const typography = {
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-4xl font-medium tracking-tight text-ink mt-12 mb-6" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h1>
  ),
  h2: ({ children, id }: { children: ReactNode; id?: string }) => (
    <h2 id={id} className="text-3xl font-medium tracking-tight text-ink mt-10 mb-4 scroll-mt-24" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h2>
  ),
  h3: ({ children, id }: { children: ReactNode; id?: string }) => (
    <h3 id={id} className="text-2xl font-medium tracking-tight text-ink mt-8 mb-3 scroll-mt-24" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => (
    <p className="text-ink leading-relaxed my-5" style={{ fontFamily: "var(--font-newsreader)", fontSize: "1.125rem" }}>{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a href={href} className="text-accent-c underline underline-offset-4 decoration-accent-c/30 hover:decoration-accent-c">{children}</a>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-2 border-rule-strong pl-4 my-6 italic text-ink-muted" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</blockquote>
  ),
  ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-outside pl-6 my-5 text-ink space-y-2">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-outside pl-6 my-5 text-ink space-y-2">{children}</ol>,
  li: ({ children }: { children: ReactNode }) => <li className="leading-relaxed" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</li>,
  hr: () => <hr className="my-10 border-rule" />,
  code: ({ children }: { children: ReactNode }) => (
    <code className="px-1 rounded-sm bg-ink/5 text-cobalt font-mono text-[0.9em]">{children}</code>
  ),
};
