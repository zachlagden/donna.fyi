import { describe, expect, it } from "vitest";
import { compileMdx } from "@/lib/blog/mdx/compile";

describe("compileMdx", () => {
  it("returns reading time", async () => {
    const out = await compileMdx("word ".repeat(100));
    expect(out.readingTimeSeconds).toBeGreaterThan(20);
  });
  it("highlights code blocks", async () => {
    const out = await compileMdx("```ts\nconst x: number = 1;\n```");
    expect(out.compiled).toContain("shiki");
  });
});
