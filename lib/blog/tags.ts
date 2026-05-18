import { sql } from "@/lib/db/client";
import type { Tag } from "./types";

export async function listTagsWithCounts(): Promise<Tag[]> {
  return sql<Tag[]>`
    SELECT t.slug, t.name, COUNT(pt.post_id)::int AS "postCount"
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    LEFT JOIN posts p ON p.id = pt.post_id AND p.deleted_at IS NULL AND p.published_at <= now()
    GROUP BY t.slug, t.name
    ORDER BY t.slug
  `;
}

export async function createTag(name: string, slug?: string): Promise<Tag> {
  const finalSlug = slug ?? toSlug(name);
  const [row] = await sql<{ slug: string; name: string }[]>`
    INSERT INTO tags (slug, name) VALUES (${finalSlug}, ${name})
    RETURNING slug, name
  `;
  return { slug: row.slug, name: row.name };
}

export async function deleteTag(slug: string): Promise<boolean> {
  const res = await sql`DELETE FROM tags WHERE slug = ${slug}`;
  return res.count > 0;
}

export function toSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
