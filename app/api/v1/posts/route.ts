import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth/require-key";
import { compileMdx, MdxCompileError } from "@/lib/blog/mdx/compile";
import { createPost, listPublished } from "@/lib/blog/posts";
import { toSlug } from "@/lib/blog/tags";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";

const CreateBody = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).nullable().optional(),
  mdx_source: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  tags: z.array(z.string()).optional(),
  scheduled_for: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag") ?? undefined;
  const author = url.searchParams.get("author") ?? undefined;
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1;
  const perPage = Number.parseInt(url.searchParams.get("per_page") ?? "10", 10) || 10;
  const result = await listPublished({
    tag,
    author: author === "donna" || author === "zach" ? author : undefined,
    page,
    perPage,
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;

  const json = await req.json().catch(() => null);
  const parse = CreateBody.safeParse(json);
  if (!parse.success) {
    return NextResponse.json(
      { error: { code: "validation_error", details: parse.error.flatten() } },
      { status: 400 },
    );
  }

  let compiled;
  try {
    compiled = await compileMdx(parse.data.mdx_source);
  } catch (err) {
    if (err instanceof MdxCompileError) {
      return NextResponse.json(
        { error: { code: "invalid_mdx", message: err.message, details: err.details } },
        { status: 400 },
      );
    }
    throw err;
  }

  const slug = parse.data.slug ?? toSlug(parse.data.title);
  const scheduledFor = parse.data.scheduled_for ? new Date(parse.data.scheduled_for) : null;
  const publishedAt = scheduledFor && scheduledFor > new Date() ? null : new Date();

  try {
    const post = await createPost(
      {
        slug,
        title: parse.data.title,
        summary: parse.data.summary ?? null,
        author_tag: auth.context.author_tag,
        mdx_source: parse.data.mdx_source,
        mdx_compiled: compiled.compiled,
        toc: compiled.toc,
        reading_time_s: compiled.readingTimeSeconds,
        published_at: publishedAt,
        scheduled_for: scheduledFor,
        tag_slugs: parse.data.tags ?? [],
      },
      auth.context.key_id,
    );

    if (post.publishedAt) {
      regenerateFeeds().catch(() => {});
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === "23505") {
      return NextResponse.json(
        { error: { code: "slug_conflict", message: "Slug already exists" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
