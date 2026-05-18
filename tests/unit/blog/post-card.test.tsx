import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostCard } from "@/components/blog/post-card";
import { AUTHORS } from "@/lib/blog/types";

describe("PostCard", () => {
  it("renders title, summary, author, and tags", () => {
    const { getByText, getByRole } = render(
      <PostCard
        post={{
          id: "1",
          slug: "test-post",
          title: "A Test Post",
          summary: "About testing things.",
          author: AUTHORS.donna,
          readingTimeSeconds: 120,
          publishedAt: new Date("2026-01-01"),
          tags: [{ slug: "agents", name: "agents" }],
        }}
      />,
    );
    expect(getByText("A Test Post")).toBeInTheDocument();
    expect(getByText("About testing things.")).toBeInTheDocument();
    expect(getByRole("link", { name: /A Test Post/ })).toHaveAttribute("href", "/blog/test-post");
  });
});
