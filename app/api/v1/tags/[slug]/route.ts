import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth/require-key";
import { deleteTag } from "@/lib/blog/tags";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;
  const ok = await deleteTag(slug);
  if (!ok) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ ok: true });
}
