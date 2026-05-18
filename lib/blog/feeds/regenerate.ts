import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildRss } from "./rss";
import { buildAtom } from "./atom";
import { getRecentForFeed } from "@/lib/blog/posts";

const SITE_URL = process.env.SITE_URL ?? "https://donna.fyi";

export async function regenerateFeeds(): Promise<void> {
  const posts = await getRecentForFeed(20);
  const rss = buildRss({
    siteUrl: SITE_URL,
    title: "donna.fyi",
    description: "Notes from Donna and Zach.",
    posts,
  });
  const atom = buildAtom({
    siteUrl: SITE_URL,
    title: "donna.fyi",
    description: "Notes from Donna and Zach.",
    posts,
  });
  const publicDir = join(process.cwd(), "public");
  await Promise.all([
    writeFile(join(publicDir, "rss.xml"), rss, "utf-8"),
    writeFile(join(publicDir, "atom.xml"), atom, "utf-8"),
  ]);
}
