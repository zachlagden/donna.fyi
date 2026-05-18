import { sql } from "@/lib/db/client";
import type { Post, PostSummary, Tag, AuthorTag, ListPostsOptions, ListPostsResult, TocEntry } from "./types";
import { AUTHORS } from "./types";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author_tag: AuthorTag;
  mdx_compiled: string;
  toc: TocEntry[];
  reading_time_s: number;
  published_at: Date | null;
  scheduled_for: Date | null;
  revision_count: number;
  last_edited_at: Date | null;
  tags: Tag[];
}

function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    author: AUTHORS[r.author_tag],
    mdxCompiled: r.mdx_compiled,
    readingTimeSeconds: r.reading_time_s,
    publishedAt: r.published_at!,
    scheduledFor: r.scheduled_for,
    tags: r.tags ?? [],
    revisionCount: r.revision_count,
    lastEditedAt: r.last_edited_at,
    toc: r.toc ?? [],
  };
}

export async function listPublished(opts: ListPostsOptions = {}): Promise<ListPostsResult> {
  const perPage = Math.min(50, opts.perPage ?? 10);
  const page = Math.max(1, opts.page ?? 1);
  const offset = (page - 1) * perPage;

  const where = sql`
    WHERE p.deleted_at IS NULL
      AND p.published_at IS NOT NULL
      AND p.published_at <= now()
      ${opts.author ? sql`AND p.author_tag = ${opts.author}` : sql``}
      ${opts.tag ? sql`AND EXISTS (
        SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = p.id AND t.slug = ${opts.tag}
      )` : sql``}
  `;

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM posts p ${where}
  `;
  const totalCount = Number(count);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    ${where}
    ORDER BY p.published_at DESC
    LIMIT ${perPage} OFFSET ${offset}
  `;

  const posts: PostSummary[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    author: AUTHORS[r.author_tag],
    readingTimeSeconds: r.reading_time_s,
    publishedAt: r.published_at!,
    tags: r.tags ?? [],
  }));

  return { posts, totalPages, currentPage: page, totalCount };
}

export async function getPublishedBySlug(slug: string): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.slug = ${slug}
      AND p.deleted_at IS NULL
      AND p.published_at IS NOT NULL
      AND p.published_at <= now()
  `;
  return rows[0] ? rowToPost(rows[0]) : null;
}

export async function getBySlugIncludingDrafts(slug: string): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.slug = ${slug} AND p.deleted_at IS NULL
  `;
  return rows[0] ? rowToPost(rows[0]) : null;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  summary: string | null;
  author_tag: AuthorTag;
  mdx_source: string;
  mdx_compiled: string;
  toc: TocEntry[];
  reading_time_s: number;
  published_at: Date | null;
  scheduled_for: Date | null;
  tag_slugs: string[];
}

export async function createPost(input: CreatePostInput, keyId: string): Promise<Post> {
  return sql.begin(async (tx) => {
    const [row] = await tx<{ id: string }[]>`
      INSERT INTO posts (slug, title, summary, author_tag, mdx_source, mdx_compiled, toc, reading_time_s, published_at, scheduled_for)
      VALUES (${input.slug}, ${input.title}, ${input.summary}, ${input.author_tag},
              ${input.mdx_source}, ${input.mdx_compiled}, ${JSON.stringify(input.toc)}::jsonb,
              ${input.reading_time_s}, ${input.published_at}, ${input.scheduled_for})
      RETURNING id
    `;
    await tx`
      INSERT INTO revisions (post_id, revision_number, mdx_source, mdx_compiled, edited_by_key_id)
      VALUES (${row.id}, 0, ${input.mdx_source}, ${input.mdx_compiled}, ${keyId})
    `;
    await applyTags(tx as any, row.id, input.tag_slugs);
    const full = await getBySlugIncludingDrafts(input.slug);
    if (!full) throw new Error("post vanished after insert");
    return full;
  }) as unknown as Post;
}

async function applyTags(tx: any, postId: string, tagSlugs: string[]): Promise<void> {
  if (tagSlugs.length === 0) return;
  for (const slug of tagSlugs) {
    await tx`
      INSERT INTO tags (slug, name) VALUES (${slug}, ${slug})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  await tx`DELETE FROM post_tags WHERE post_id = ${postId}`;
  await tx`
    INSERT INTO post_tags (post_id, tag_id)
    SELECT ${postId}, t.id FROM tags t WHERE t.slug = ANY(${tagSlugs}::text[])
  `;
}

export interface UpdatePostInput {
  title?: string;
  summary?: string | null;
  mdx_source?: string;
  mdx_compiled?: string;
  toc?: TocEntry[];
  reading_time_s?: number;
  scheduled_for?: Date | null;
  published_at?: Date | null;
  slug?: string;
  tag_slugs?: string[];
}

export async function updatePost(currentSlug: string, input: UpdatePostInput, keyId: string): Promise<Post | null> {
  return sql.begin(async (tx) => {
    const [existing] = await tx<{ id: string }[]>`
      SELECT id FROM posts WHERE slug = ${currentSlug} AND deleted_at IS NULL
    `;
    if (!existing) return null;

    if (input.mdx_source !== undefined && input.mdx_compiled !== undefined) {
      const [{ next_revision }] = await tx<{ next_revision: number }[]>`
        SELECT COALESCE(MAX(revision_number), -1) + 1 AS next_revision
        FROM revisions WHERE post_id = ${existing.id}
      `;
      await tx`
        INSERT INTO revisions (post_id, revision_number, mdx_source, mdx_compiled, edited_by_key_id)
        VALUES (${existing.id}, ${next_revision}, ${input.mdx_source}, ${input.mdx_compiled}, ${keyId})
      `;
    }

    await tx`
      UPDATE posts SET
        title = COALESCE(${input.title ?? null}, title),
        summary = COALESCE(${input.summary ?? null}, summary),
        mdx_source = COALESCE(${input.mdx_source ?? null}, mdx_source),
        mdx_compiled = COALESCE(${input.mdx_compiled ?? null}, mdx_compiled),
        toc = COALESCE(${input.toc ? JSON.stringify(input.toc) : null}::jsonb, toc),
        reading_time_s = COALESCE(${input.reading_time_s ?? null}, reading_time_s),
        scheduled_for = COALESCE(${input.scheduled_for ?? null}, scheduled_for),
        published_at = COALESCE(${input.published_at ?? null}, published_at),
        slug = COALESCE(${input.slug ?? null}, slug),
        updated_at = now()
      WHERE id = ${existing.id}
    `;
    if (input.tag_slugs) await applyTags(tx as any, existing.id, input.tag_slugs);

    return getBySlugIncludingDrafts(input.slug ?? currentSlug);
  }) as unknown as Post | null;
}

export async function softDelete(slug: string): Promise<boolean> {
  const res = await sql`UPDATE posts SET deleted_at = now() WHERE slug = ${slug} AND deleted_at IS NULL`;
  return res.count > 0;
}

export async function getRecentForFeed(limit: number): Promise<Post[]> {
  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.deleted_at IS NULL AND p.published_at IS NOT NULL AND p.published_at <= now()
    ORDER BY p.published_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToPost);
}
