import { describe, expect, it, vi } from "vitest";
import { evaluateSignIn } from "@/lib/auth/allowlist";

describe("evaluateSignIn", () => {
  it("admits existing user", async () => {
    const userExists = vi.fn().mockResolvedValue(true);
    const userCount = vi.fn().mockResolvedValue(1);
    const bootstrap = vi.fn();
    const result = await evaluateSignIn({
      profile: { id: 1, login: "zachlagden", name: "Zach" },
      bootstrapLogin: "zachlagden",
      userExists,
      userCount,
      bootstrap,
    });
    expect(result).toBe(true);
    expect(bootstrap).not.toHaveBeenCalled();
  });
  it("rejects unknown user when one exists", async () => {
    const userExists = vi.fn().mockResolvedValue(false);
    const userCount = vi.fn().mockResolvedValue(1);
    const bootstrap = vi.fn();
    const result = await evaluateSignIn({
      profile: { id: 999, login: "someone-else", name: null },
      bootstrapLogin: "zachlagden",
      userExists,
      userCount,
      bootstrap,
    });
    expect(result).toBe(false);
    expect(bootstrap).not.toHaveBeenCalled();
  });
  it("bootstraps when no users yet AND login matches env", async () => {
    const userExists = vi.fn().mockResolvedValue(false);
    const userCount = vi.fn().mockResolvedValue(0);
    const bootstrap = vi.fn().mockResolvedValue(undefined);
    const result = await evaluateSignIn({
      profile: { id: 1, login: "zachlagden", name: "Zach" },
      bootstrapLogin: "zachlagden",
      userExists,
      userCount,
      bootstrap,
    });
    expect(result).toBe(true);
    expect(bootstrap).toHaveBeenCalled();
  });
  it("refuses bootstrap with wrong login", async () => {
    const userExists = vi.fn().mockResolvedValue(false);
    const userCount = vi.fn().mockResolvedValue(0);
    const bootstrap = vi.fn();
    const result = await evaluateSignIn({
      profile: { id: 1, login: "intruder", name: null },
      bootstrapLogin: "zachlagden",
      userExists,
      userCount,
      bootstrap,
    });
    expect(result).toBe(false);
    expect(bootstrap).not.toHaveBeenCalled();
  });
});
