import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth/require-key";
import { compileMdx, MdxCompileError } from "@/lib/blog/mdx/compile";
import { getBySlugIncludingDrafts, getPublishedBySlug, softDelete, updatePost } from "@/lib/blog/posts";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";
import type { TocEntry } from "@/lib/blog/types";

const PatchBody = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(500).nullable().optional(),
  mdx_source: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  tags: z.array(z.string()).optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const includeDrafts = url.searchParams.get("include")?.split(",").includes("drafts");
  if (includeDrafts) {
    const auth = await requireApiKey(req, "posts:read");
    if (!auth.ok) return auth.response;
    const post = await getBySlugIncludingDrafts(slug);
    if (!post) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
    return NextResponse.json(post);
  }
  const post = await getPublishedBySlug(slug);
  if (!post) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parse = PatchBody.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  }

  let compiledFields: { mdx_compiled?: string; toc?: TocEntry[]; reading_time_s?: number } = {};
  if (parse.data.mdx_source) {
    try {
      const out = await compileMdx(parse.data.mdx_source);
      compiledFields = { mdx_compiled: out.compiled, toc: out.toc, reading_time_s: out.readingTimeSeconds };
    } catch (err) {
      if (err instanceof MdxCompileError) {
        return NextResponse.json({ error: { code: "invalid_mdx", message: err.message, details: err.details } }, { status: 400 });
      }
      throw err;
    }
  }

  const updated = await updatePost(slug, {
    title: parse.data.title,
    summary: parse.data.summary,
    mdx_source: parse.data.mdx_source,
    ...compiledFields,
    slug: parse.data.slug,
    tag_slugs: parse.data.tags,
    scheduled_for: parse.data.scheduled_for === undefined ? undefined : (parse.data.scheduled_for ? new Date(parse.data.scheduled_for) : null),
    published_at: parse.data.published_at === undefined ? undefined : (parse.data.published_at ? new Date(parse.data.published_at) : null),
  }, auth.context.key_id);

  if (!updated) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  if (updated.publishedAt) regenerateFeeds().catch(() => {});
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;
  const ok = await softDelete(slug);
  if (!ok) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  regenerateFeeds().catch(() => {});
  return NextResponse.json({ ok: true });
}
