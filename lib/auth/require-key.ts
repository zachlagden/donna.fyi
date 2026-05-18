import { sql } from "@/lib/db/client";
import { verifyKey } from "./hash";
import { validateBearer, type ApiKeyContext } from "./api-key";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function requireApiKey(
  req: NextRequest,
  requiredScope?: string,
): Promise<{ ok: true; context: ApiKeyContext } | { ok: false; response: NextResponse }> {
  const r = await validateBearer(req.headers.get("authorization"), {
    lookupActiveByPrefix: async (prefix) => {
      return sql<{ id: string; user_id: string; key_hash: string; author_tag: "donna" | "zach"; scopes: string[] }[]>`
        SELECT id, user_id, key_hash, author_tag, scopes
        FROM api_keys WHERE key_prefix = ${prefix} AND revoked_at IS NULL
      `;
    },
    verify: verifyKey,
    markUsed: async (id) => {
      await sql`UPDATE api_keys SET last_used_at = now() WHERE id = ${id}`;
    },
  });
  if (!r.ok) {
    return { ok: false, response: NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 }) };
  }
  if (requiredScope && !r.context.scopes.includes(requiredScope)) {
    return { ok: false, response: NextResponse.json({ error: { code: "forbidden" } }, { status: 403 }) };
  }
  return { ok: true, context: r.context };
}
