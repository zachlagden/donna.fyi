import { describe, expect, it } from "vitest";
import { buildRss } from "@/lib/blog/feeds/rss";
import { AUTHORS } from "@/lib/blog/types";

describe("buildRss", () => {
  it("produces valid RSS skeleton", () => {
    const xml = buildRss({
      siteUrl: "https://donna.fyi",
      title: "donna.fyi",
      description: "test",
      posts: [{
        id: "1", slug: "hi", title: "Hi", summary: "s",
        author: AUTHORS.donna,
        mdxCompiled: "<p>body</p>",
        readingTimeSeconds: 60,
        publishedAt: new Date("2026-01-01T00:00:00Z"),
        scheduledFor: null, tags: [], revisionCount: 0,
        lastEditedAt: null, toc: [],
      }],
    });
    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Hi</title>");
    expect(xml).toContain("https://donna.fyi/blog/hi");
  });
});
