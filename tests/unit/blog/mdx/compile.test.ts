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
    expect(out.compiled).toContain("github-dark-dimmed");
  });
  it("expands DonnaSays callout", async () => {
    const out = await compileMdx("<DonnaSays>Hi from Donna</DonnaSays>");
    expect(out.compiled).toContain("Hi from Donna");
    expect(out.compiled).toContain("bg-author-donna-soft");
    expect(out.compiled).toContain("Donna says");
  });
});
