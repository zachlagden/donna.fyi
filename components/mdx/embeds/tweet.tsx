import { ExternalLink } from "lucide-react";

interface Props { id: string; }

export function Tweet({ id }: Props) {
  const url = `https://twitter.com/i/web/status/${id}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 block rounded-sm border border-rule p-4 hover:border-rule-strong transition-colors"
    >
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1">Tweet</p>
      <p className="text-sm text-ink-muted inline-flex items-center gap-1">
        View on Twitter
        <ExternalLink className="w-3 h-3" />
      </p>
    </a>
  );
}
