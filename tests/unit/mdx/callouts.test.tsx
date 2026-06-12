import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Note, Warning, Tip, DonnaSays, ZachSays } from "@/components/mdx/callouts";

describe("Callouts", () => {
  it("renders Note", () => {
    const { getByText } = render(<Note>hi</Note>);
    expect(getByText("hi")).toBeInTheDocument();
  });
  it("DonnaSays renders with the Donna author accent", () => {
    const { container } = render(<DonnaSays>hi</DonnaSays>);
    expect(container.firstChild).toHaveClass("bg-author-donna-soft");
  });
  it("ZachSays renders with the Zach author accent", () => {
    const { container } = render(<ZachSays>hi</ZachSays>);
    expect(container.firstChild).toHaveClass("bg-author-zach-soft");
  });
  it("Warning + Tip render", () => {
    expect(render(<Warning>w</Warning>).getByText("w")).toBeInTheDocument();
    expect(render(<Tip>t</Tip>).getByText("t")).toBeInTheDocument();
  });
});
