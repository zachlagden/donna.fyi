import { describe, expect, it, vi } from "vitest";
import { validateBearer } from "@/lib/auth/api-key";

describe("validateBearer", () => {
  const lookupOk = vi.fn().mockResolvedValue([
    { id: "k1", user_id: "u1", key_hash: "hash", author_tag: "donna", scopes: ["posts:write"] },
  ]);
  const lookupEmpty = vi.fn().mockResolvedValue([]);
  const verifyTrue = async () => true;
  const verifyFalse = async () => false;

  it("rejects missing header", async () => {
    const r = await validateBearer(null, { lookupActiveByPrefix: lookupOk, verify: verifyTrue, markUsed: async () => {} });
    expect(r.ok).toBe(false);
  });
  it("rejects unknown prefix", async () => {
    const r = await validateBearer("Bearer donna_sk_zzzz1234", { lookupActiveByPrefix: lookupEmpty, verify: verifyTrue, markUsed: async () => {} });
    expect(r.ok).toBe(false);
  });
  it("rejects bad hash", async () => {
    const r = await validateBearer("Bearer donna_sk_abcdEFGH1", { lookupActiveByPrefix: lookupOk, verify: verifyFalse, markUsed: async () => {} });
    expect(r.ok).toBe(false);
  });
  it("admits valid key and returns context", async () => {
    const markUsed = vi.fn();
    const r = await validateBearer("Bearer donna_sk_abcdEFGH1", { lookupActiveByPrefix: lookupOk, verify: verifyTrue, markUsed });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.context.author_tag).toBe("donna");
      expect(r.context.scopes).toContain("posts:write");
    }
    expect(markUsed).toHaveBeenCalledWith("k1");
  });
});
