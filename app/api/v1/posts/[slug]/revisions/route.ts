import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth/require-key";
import { listRevisions } from "@/lib/blog/revisions";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:read");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;
  const revisions = await listRevisions(slug);
  if (!revisions) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ revisions });
}
