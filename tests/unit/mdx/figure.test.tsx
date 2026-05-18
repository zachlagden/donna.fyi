import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Figure } from "@/components/mdx/figure";

describe("Figure", () => {
  it("renders image and caption", () => {
    const { getByAltText, getByText } = render(
      <Figure src="/test.jpg" alt="Test" caption="A caption" />,
    );
    expect(getByAltText("Test")).toBeInTheDocument();
    expect(getByText("A caption")).toBeInTheDocument();
  });
});
