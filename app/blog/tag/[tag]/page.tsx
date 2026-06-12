import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogSource } from "@/lib/blog/source";
import { Nav } from "@/components/nav";
import { PostCard } from "@/components/blog/post-card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag} — donna.fyi`, description: `Posts tagged ${tag}.` };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const source = getBlogSource();
  const result = await source.listPosts({ tag, page, perPage: 10 });
  if (result.totalCount === 0) notFound();

  return (
    <div className="min-h-screen surface-paper bg-surface texture-grain">
      <Nav variant="blog" />
      <header className="max-w-3xl mx-auto px-6 pt-32 pb-12">
        <Link href="/blog" className="text-sm text-ink-faint hover:text-ink font-mono">← Blog</Link>
        <h1 className="text-4xl font-medium tracking-tight text-ink mt-4" style={{ fontFamily: "var(--font-newsreader)" }}>
          #{tag}
        </h1>
        <p className="text-ink-faint text-sm mt-2 font-mono">{result.totalCount} posts</p>
      </header>
      <main className="max-w-3xl mx-auto px-6 pb-32">
        <div className="space-y-5">
          {result.posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </main>
    </div>
  );
}
