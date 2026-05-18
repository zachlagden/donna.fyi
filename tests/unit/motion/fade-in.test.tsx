import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FadeIn } from "@/components/motion/fade-in";

describe("FadeIn", () => {
  it("renders children in voice mode (default)", () => {
    const { getByText } = render(<FadeIn>hello</FadeIn>);
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("renders children unchanged in dossier mode (animation suppressed)", () => {
    const { getByText } = render(<FadeIn mode="dossier">hello</FadeIn>);
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("renders children unchanged in static mode", () => {
    const { getByText } = render(<FadeIn mode="static">hello</FadeIn>);
    expect(getByText("hello")).toBeInTheDocument();
  });
});
