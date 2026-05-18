import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db/client";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  const { id } = await ctx.params;
  await sql`UPDATE api_keys SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL`;
  return NextResponse.json({ ok: true });
}
