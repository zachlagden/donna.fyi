import type { Post } from "../types";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface BuildOpts {
  siteUrl: string;
  title: string;
  description: string;
  posts: Post[];
}

export function buildRss({ siteUrl, title, description, posts }: BuildOpts): string {
  const items = posts.map((p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
      <author>${escapeXml(p.author.handle)}</author>
      ${p.tags.map((t) => `<category>${escapeXml(t.name)}</category>`).join("")}
      <description>${escapeXml(p.summary ?? "")}</description>
      <content:encoded><![CDATA[${p.mdxCompiled}]]></content:encoded>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>en-gb</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}
