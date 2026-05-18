import type { Post } from "../types";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

interface BuildOpts {
  siteUrl: string;
  title: string;
  description: string;
  posts: Post[];
}

export function buildAtom({ siteUrl, title, description, posts }: BuildOpts): string {
  const entries = posts.map((p) => `
  <entry>
    <id>${siteUrl}/blog/${p.slug}</id>
    <title>${escapeXml(p.title)}</title>
    <link href="${siteUrl}/blog/${p.slug}" />
    <updated>${(p.lastEditedAt ?? p.publishedAt).toISOString()}</updated>
    <published>${p.publishedAt.toISOString()}</published>
    <author><name>${escapeXml(p.author.name)}</name></author>
    ${p.tags.map((t) => `<category term="${escapeXml(t.slug)}" label="${escapeXml(t.name)}" />`).join("")}
    <summary>${escapeXml(p.summary ?? "")}</summary>
    <content type="html"><![CDATA[${p.mdxCompiled}]]></content>
  </entry>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${siteUrl}/</id>
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(description)}</subtitle>
  <link href="${siteUrl}/atom.xml" rel="self" />
  <link href="${siteUrl}/" />
  <updated>${new Date().toISOString()}</updated>
  ${entries}
</feed>`;
}
