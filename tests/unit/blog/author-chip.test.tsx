import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthorChip } from "@/components/blog/author-chip";
import { AUTHORS } from "@/lib/blog/types";

describe("AuthorChip", () => {
  it("renders Donna in violet", () => {
    const { container, getByText } = render(<AuthorChip author={AUTHORS.donna} />);
    expect(getByText("Donna")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-violet-300");
  });
  it("renders Zach in amber", () => {
    const { container, getByText } = render(<AuthorChip author={AUTHORS.zach} />);
    expect(getByText("Zach")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-amber-300");
  });
});
