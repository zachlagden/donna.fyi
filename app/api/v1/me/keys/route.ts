import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db/client";
import { hashKey } from "@/lib/auth/hash";
import { generateKey } from "@/lib/auth/mint";

const Body = z.object({
  name: z.string().min(1).max(80),
  author_tag: z.enum(["donna", "zach"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parse = Body.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  }

  const owner = await sql<{ id: string }[]>`SELECT id FROM users LIMIT 1`;
  if (owner.length === 0) {
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });
  }

  const { plaintext, prefix } = generateKey(parse.data.author_tag);
  const hash = await hashKey(plaintext);

  const [row] = await sql<{ id: string; created_at: Date }[]>`
    INSERT INTO api_keys (user_id, name, key_hash, key_prefix, author_tag)
    VALUES (${owner[0].id}, ${parse.data.name}, ${hash}, ${prefix}, ${parse.data.author_tag})
    RETURNING id, created_at
  `;

  return NextResponse.json({
    id: row.id,
    name: parse.data.name,
    author_tag: parse.data.author_tag,
    key_prefix: prefix,
    plaintext_key: plaintext,
    created_at: row.created_at,
  }, { status: 201 });
}
