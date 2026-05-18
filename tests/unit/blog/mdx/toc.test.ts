import { describe, expect, it } from "vitest";
import { compileMdx } from "@/lib/blog/mdx/compile";

describe("compileMdx toc", () => {
  it("extracts H2 + H3 entries", async () => {
    const out = await compileMdx("## Section A\n\n### Sub\n\n## Section B\n");
    expect(out.toc.map((t) => t.text)).toEqual(["Section A", "Sub", "Section B"]);
    expect(out.toc.map((t) => t.level)).toEqual([2, 3, 2]);
  });
});
