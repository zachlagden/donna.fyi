import { describe, expect, it } from "vitest";
import { compileMdx, MdxCompileError } from "@/lib/blog/mdx/compile";

describe("compileMdx validation", () => {
  it("accepts allowlisted component", async () => {
    const out = await compileMdx("# hi\n\n<Note>Body</Note>");
    expect(out.compiled).toContain("hi");
  });
  it("rejects unknown component", async () => {
    await expect(compileMdx("# hi\n\n<DangerousScript />")).rejects.toBeInstanceOf(
      MdxCompileError,
    );
  });
});
