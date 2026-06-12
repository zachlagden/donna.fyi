import Link from "next/link";
import type { PostSummary } from "@/lib/blog/types";
import { AuthorChip } from "./author-chip";
import { formatPublishDate, formatReadingTime } from "@/lib/blog/format";

interface Props {
  post: PostSummary;
}

export function PostCard({ post }: Props) {
  return (
    <article className="group rounded-sm border border-rule hover:border-rule-strong bg-surface p-6 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <AuthorChip author={post.author} size="sm" />
        <span className="text-xs text-ink-faint font-mono">
          {formatPublishDate(post.publishedAt)} · {formatReadingTime(post.readingTimeSeconds)}
        </span>
      </div>
      <h3 className="text-2xl font-medium tracking-tight mb-2" style={{ fontFamily: "var(--font-newsreader)" }}>
        <Link href={`/blog/${post.slug}`} className="text-ink hover:text-accent-c transition-colors">
          {post.title}
        </Link>
      </h3>
      {post.summary && (
        <p className="text-ink-muted leading-relaxed text-[0.95rem] mb-3" style={{ fontFamily: "var(--font-newsreader)" }}>
          {post.summary}
        </p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/blog/tag/${t.slug}`}
              className="text-xs font-mono px-2 py-0.5 rounded-sm border border-rule text-ink-faint hover:text-ink hover:border-rule-strong transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
