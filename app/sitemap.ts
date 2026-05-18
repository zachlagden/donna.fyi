import type { MetadataRoute } from "next";
import { getBlogSource } from "@/lib/blog/source";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://donna.fyi";
  const posts = await getBlogSource().getRecentForFeed(500);
  const postEntries = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.lastEditedAt ?? p.publishedAt,
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...postEntries,
  ];
}
