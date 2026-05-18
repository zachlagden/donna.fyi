import { describe, expect, it } from "vitest";
import { generateKey, parsePrefix } from "@/lib/auth/mint";

describe("generateKey", () => {
  it("uses author prefix", () => {
    const { plaintext, prefix } = generateKey("donna");
    expect(plaintext.startsWith("donna_sk_")).toBe(true);
    expect(prefix).toBe(plaintext.slice(0, 12));
    expect(plaintext.length).toBeGreaterThan(32);
  });
  it("produces unique keys", () => {
    const a = generateKey("zach").plaintext;
    const b = generateKey("zach").plaintext;
    expect(a).not.toBe(b);
  });
});

describe("parsePrefix", () => {
  it("recovers prefix from full key", () => {
    expect(parsePrefix("donna_sk_AbCdEfGh1234567890XYZ")).toBe("donna_sk_AbC");
  });
});
