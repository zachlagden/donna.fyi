import { describe, expect, it } from "vitest";
import { hashKey, verifyKey } from "@/lib/auth/hash";

describe("hashKey + verifyKey", () => {
  it("verifies a freshly hashed key", async () => {
    const hash = await hashKey("super-secret");
    expect(hash).not.toBe("super-secret");
    expect(await verifyKey(hash, "super-secret")).toBe(true);
  });
  it("rejects the wrong key", async () => {
    const hash = await hashKey("a");
    expect(await verifyKey(hash, "b")).toBe(false);
  });
});
