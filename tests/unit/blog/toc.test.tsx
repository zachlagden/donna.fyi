import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toc } from "@/components/blog/toc";

describe("Toc", () => {
  it("renders entries", () => {
    const { getByText } = render(
      <Toc entries={[{ id: "a", text: "Alpha", level: 2 }, { id: "b", text: "Beta", level: 3 }]} />,
    );
    expect(getByText("Alpha")).toBeInTheDocument();
    expect(getByText("Beta")).toBeInTheDocument();
  });
});
