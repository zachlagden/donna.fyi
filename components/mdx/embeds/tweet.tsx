import { ExternalLink } from "lucide-react";

interface Props { id: string; }

export function Tweet({ id }: Props) {
  const url = `https://twitter.com/i/web/status/${id}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 block rounded-lg border border-zinc-800/60 p-4 hover:border-zinc-700 transition-colors"
    >
      <p className="text-xs text-zinc-500 font-mono mb-1">Tweet</p>
      <p className="text-sm text-zinc-300 inline-flex items-center gap-1">
        View on Twitter
        <ExternalLink className="w-3 h-3" />
      </p>
    </a>
  );
}
