import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Note, Warning, Tip, DonnaSays, ZachSays } from "@/components/mdx/callouts";

describe("Callouts", () => {
  it("renders Note", () => {
    const { getByText } = render(<Note>hi</Note>);
    expect(getByText("hi")).toBeInTheDocument();
  });
  it("DonnaSays renders with violet accent regardless of context", () => {
    const { container } = render(<DonnaSays>hi</DonnaSays>);
    expect(container.firstChild).toHaveClass("border-violet-500/30");
  });
  it("ZachSays renders with amber accent", () => {
    const { container } = render(<ZachSays>hi</ZachSays>);
    expect(container.firstChild).toHaveClass("border-amber-500/30");
  });
  it("Warning + Tip render", () => {
    expect(render(<Warning>w</Warning>).getByText("w")).toBeInTheDocument();
    expect(render(<Tip>t</Tip>).getByText("t")).toBeInTheDocument();
  });
});
