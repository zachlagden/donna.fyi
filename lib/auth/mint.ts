import { randomBytes } from "node:crypto";

export type AuthorTag = "donna" | "zach";

function urlSafe(b: Buffer): string {
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateKey(author: AuthorTag): { plaintext: string; prefix: string } {
  const random = urlSafe(randomBytes(24)).slice(0, 32);
  const plaintext = `${author}_sk_${random}`;
  return { plaintext, prefix: plaintext.slice(0, 12) };
}

export function parsePrefix(full: string): string {
  return full.slice(0, 12);
}
