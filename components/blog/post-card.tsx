import Link from "next/link";
import type { PostSummary } from "@/lib/blog/types";
import { AuthorChip } from "./author-chip";
import { formatPublishDate, formatReadingTime } from "@/lib/blog/format";

interface Props {
  post: PostSummary;
}

export function PostCard({ post }: Props) {
  const isViolet = post.author.accent === "violet";
  const edgeClass = isViolet ? "border-l-violet-500/40" : "border-l-amber-500/40";
  return (
    <article className={`group rounded-xl border border-zinc-800/60 ${edgeClass} border-l-2 bg-zinc-950/40 p-6 hover:border-zinc-700 transition-colors`}>
      <div className="flex items-center gap-3 mb-3">
        <AuthorChip author={post.author} size="sm" />
        <span className="text-xs text-zinc-600 font-mono">
          {formatPublishDate(post.publishedAt)} · {formatReadingTime(post.readingTimeSeconds)}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-newsreader)" }}>
        <Link href={`/blog/${post.slug}`} className="text-zinc-100 hover:text-violet-300 transition-colors">
          {post.title}
        </Link>
      </h3>
      {post.summary && (
        <p className="text-zinc-400 leading-relaxed text-[0.95rem] mb-3" style={{ fontFamily: "var(--font-newsreader)" }}>
          {post.summary}
        </p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/blog/tag/${t.slug}`}
              className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
