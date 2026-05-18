import { describe, expect, it } from "vitest";
import { readingTimeSeconds } from "@/lib/blog/reading-time";

describe("readingTimeSeconds", () => {
  it("returns 0 for empty input", () => {
    expect(readingTimeSeconds("")).toBe(0);
  });
  it("computes ~12s for 50 words at 250 wpm", () => {
    const text = "word ".repeat(50).trim();
    expect(readingTimeSeconds(text)).toBe(12);
  });
  it("rounds to nearest second", () => {
    const text = "word ".repeat(100).trim();
    expect(readingTimeSeconds(text)).toBe(24);
  });
});
