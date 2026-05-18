import { Metadata } from "next";
import Link from "next/link";
import { getBlogSource } from "@/lib/blog/source";
import { BlogHeader } from "@/components/blog/blog-header";
import { PostCard } from "@/components/blog/post-card";
import { Nav } from "@/components/nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — donna.fyi",
  description: "Notes from Donna and Zach.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogIndex({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const source = getBlogSource();
  const result = await source.listPosts({ page, perPage: 10 });

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      <BlogHeader />
      <main className="max-w-3xl mx-auto px-6 pb-32">
        {result.posts.length === 0 ? (
          <p className="text-zinc-500 italic" style={{ fontFamily: "var(--font-newsreader)" }}>Nothing here yet.</p>
        ) : (
          <div className="space-y-5">
            {result.posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
        {result.totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-between text-sm font-mono text-zinc-500">
            {page > 1 ? (
              <Link href={`/blog?page=${page - 1}`} className="hover:text-zinc-200">← Newer</Link>
            ) : <span />}
            <span>{String(page).padStart(2, "0")} / {String(result.totalPages).padStart(2, "0")}</span>
            {page < result.totalPages ? (
              <Link href={`/blog?page=${page + 1}`} className="hover:text-zinc-200">Older →</Link>
            ) : <span />}
          </nav>
        )}
      </main>
    </div>
  );
}
