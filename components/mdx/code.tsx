import { codeToHtml } from "shiki";
import { CopyButton } from "./code-copy";

interface CodeProps {
  children: string;
  lang?: string;
  highlightedHtml?: string;
}

export async function Code({ children, lang = "ts", highlightedHtml }: CodeProps) {
  const html = highlightedHtml ?? (await codeToHtml(children, { lang, theme: "github-dark-dimmed" }));
  return (
    <div className="relative my-6 surface-terminal bg-surface rounded-sm border border-rule overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-rule font-mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
        <span>{lang}</span>
        <CopyButton code={children} />
      </div>
      <div className="overflow-x-auto text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
