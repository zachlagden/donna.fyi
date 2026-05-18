import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth/require-key";
import { createTag, listTagsWithCounts } from "@/lib/blog/tags";

const Body = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export async function GET() {
  return NextResponse.json({ tags: await listTagsWithCounts() });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const parse = Body.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  }
  try {
    const tag = await createTag(parse.data.name, parse.data.slug);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23505") return NextResponse.json({ error: { code: "slug_conflict" } }, { status: 409 });
    throw err;
  }
}
