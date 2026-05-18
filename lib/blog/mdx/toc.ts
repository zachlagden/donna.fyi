import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import type { TocEntry } from "@/lib/blog/types";

export function rehypeExtractToc(collect: TocEntry[]) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = (node.properties?.id as string) ?? "";
      if (!id) return;
      const text = textOf(node);
      collect.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
    });
  };
}

function textOf(node: Element): string {
  let out = "";
  visit(node, "text", (t: any) => {
    out += t.value as string;
  });
  return out;
}
