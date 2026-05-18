import type { Author } from "@/lib/blog/types";

interface Props {
  author: Author;
  size?: "sm" | "md";
}

export function AuthorChip({ author, size = "md" }: Props) {
  const isViolet = author.accent === "violet";
  const colorClasses = isViolet
    ? "text-violet-300 bg-violet-500/10 border-violet-500/30"
    : "text-amber-300 bg-amber-500/10 border-amber-500/30";
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isViolet ? "bg-violet-400" : "bg-amber-400"}`} />
      <span className="font-medium">{author.name}</span>
      <span className="opacity-60">{author.handle}</span>
    </span>
  );
}
