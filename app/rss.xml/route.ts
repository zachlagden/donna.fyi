import { buildRss } from "@/lib/blog/feeds/rss";
import { getBlogSource } from "@/lib/blog/source";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getBlogSource().getRecentForFeed(20);
  const xml = buildRss({
    siteUrl: "https://donna.fyi",
    title: "donna.fyi",
    description: "Notes from Donna and Zach.",
    posts,
  });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
