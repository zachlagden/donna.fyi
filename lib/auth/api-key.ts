import { parsePrefix } from "./mint";

export interface KeyRow {
  id: string;
  user_id: string;
  key_hash: string;
  author_tag: "donna" | "zach";
  scopes: string[];
}

export interface ApiKeyContext {
  key_id: string;
  user_id: string;
  author_tag: "donna" | "zach";
  scopes: string[];
}

interface Deps {
  lookupActiveByPrefix: (prefix: string) => Promise<KeyRow[]>;
  verify: (stored: string, plaintext: string) => Promise<boolean>;
  markUsed: (id: string) => Promise<void>;
}

export type ValidateResult =
  | { ok: true; context: ApiKeyContext }
  | { ok: false; code: "missing" | "malformed" | "not_found" | "invalid" };

export async function validateBearer(
  header: string | null,
  deps: Deps,
): Promise<ValidateResult> {
  if (!header) return { ok: false, code: "missing" };
  const match = /^Bearer\s+(\S+)$/.exec(header);
  if (!match) return { ok: false, code: "malformed" };
  const token = match[1];
  if (!/^(donna|zach)_sk_/.test(token)) return { ok: false, code: "malformed" };

  const prefix = parsePrefix(token);
  const rows = await deps.lookupActiveByPrefix(prefix);
  if (rows.length === 0) return { ok: false, code: "not_found" };

  for (const row of rows) {
    if (await deps.verify(row.key_hash, token)) {
      Promise.resolve(deps.markUsed(row.id)).catch(() => {});
      return {
        ok: true,
        context: { key_id: row.id, user_id: row.user_id, author_tag: row.author_tag, scopes: row.scopes },
      };
    }
  }
  return { ok: false, code: "invalid" };
}
