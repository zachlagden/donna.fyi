import { buildAtom } from "@/lib/blog/feeds/atom";
import { getBlogSource } from "@/lib/blog/source";

export const revalidate = 300;

export async function GET() {
  const posts = await getBlogSource().getRecentForFeed(20);
  const xml = buildAtom({
    siteUrl: "https://donna.fyi",
    title: "donna.fyi",
    description: "Notes from Donna and Zach.",
    posts,
  });
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
