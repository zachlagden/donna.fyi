import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogSource } from "@/lib/blog/source";
import { Nav } from "@/components/nav";
import { AuthorChip } from "@/components/blog/author-chip";
import { PostMeta } from "@/components/blog/post-meta";
import { Toc } from "@/components/blog/toc";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogSource().getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — donna.fyi`,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      authors: [post.author.name],
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogSource().getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen surface-paper bg-surface texture-grain">
      <Nav variant="blog" />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-32 grid xl:grid-cols-[1fr_220px] gap-12">
        <article className="max-w-[640px] mx-auto xl:mx-0 w-full">
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <AuthorChip author={post.author} />
              {post.tags.map((t) => (
                <a key={t.slug} href={`/blog/tag/${t.slug}`} className="text-xs font-mono px-2 py-0.5 rounded-sm border border-rule text-ink-faint hover:text-ink hover:border-rule-strong transition-colors">
                  {t.name}
                </a>
              ))}
            </div>
            <h1 className="text-5xl font-medium tracking-tight text-ink mb-3 leading-tight" style={{ fontFamily: "var(--font-newsreader)" }}>
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-xl text-ink-muted mb-4" style={{ fontFamily: "var(--font-newsreader)" }}>
                {post.summary}
              </p>
            )}
            <PostMeta
              publishedAt={post.publishedAt}
              readingTimeSeconds={post.readingTimeSeconds}
              revisionCount={post.revisionCount}
              lastEditedAt={post.lastEditedAt}
            />
          </header>

          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{ __html: post.mdxCompiled }}
          />
        </article>

        <aside>
          <Toc entries={post.toc} />
        </aside>
      </div>
    </div>
  );
}
