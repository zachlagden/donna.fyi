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
    <div className="relative my-6 rounded-lg overflow-hidden border border-zinc-800/60">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/60">
        <span className="text-xs font-mono text-zinc-500">{lang}</span>
        <CopyButton code={children} />
      </div>
      <div className="overflow-x-auto text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
