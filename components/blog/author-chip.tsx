import type { Author } from "@/lib/blog/types";

interface Props {
  author: Author;
  size?: "sm" | "md";
}

export function AuthorChip({ author, size = "md" }: Props) {
  const isDonna = author.accent === "cobalt";
  const colorClasses = isDonna
    ? "text-author-donna bg-author-donna-soft"
    : "text-author-zach bg-author-zach-soft";
  const dotClass = isDonna ? "bg-author-donna" : "bg-author-zach";
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border border-rule font-mono ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 ${dotClass}`} />
      <span className="font-medium">{author.name}</span>
      <span className="opacity-60">{author.handle}</span>
    </span>
  );
}
