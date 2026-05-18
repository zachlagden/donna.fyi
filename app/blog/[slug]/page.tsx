import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogSource } from "@/lib/blog/source";
import { Nav } from "@/components/nav";
import { AuthorChip } from "@/components/blog/author-chip";
import { PostMeta } from "@/components/blog/post-meta";
import { Toc } from "@/components/blog/toc";

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
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-32 grid xl:grid-cols-[1fr_220px] gap-12">
        <article className="max-w-[640px] mx-auto xl:mx-0 w-full">
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <AuthorChip author={post.author} />
              {post.tags.map((t) => (
                <a key={t.slug} href={`/blog/tag/${t.slug}`} className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300">
                  {t.name}
                </a>
              ))}
            </div>
            <h1 className="text-5xl font-bold text-zinc-100 mb-3 leading-tight" style={{ fontFamily: "var(--font-newsreader)" }}>
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-xl text-zinc-400 mb-4" style={{ fontFamily: "var(--font-newsreader)" }}>
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
            className="prose-invert max-w-none"
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
