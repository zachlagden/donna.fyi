import { sql } from "@/lib/db/client";

export interface RevisionRow {
  id: string;
  revision_number: number;
  edited_at: Date;
  edited_by_key_id: string | null;
}

export async function listRevisions(slug: string): Promise<RevisionRow[] | null> {
  const [post] = await sql<{ id: string }[]>`SELECT id FROM posts WHERE slug = ${slug} AND deleted_at IS NULL`;
  if (!post) return null;
  return sql<RevisionRow[]>`
    SELECT id, revision_number, edited_at, edited_by_key_id
    FROM revisions WHERE post_id = ${post.id}
    ORDER BY revision_number DESC
  `;
}
