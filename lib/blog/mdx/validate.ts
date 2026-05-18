import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { allowedMdxComponentNames } from "@/components/mdx";

export class MdxValidationError extends Error {
  constructor(public componentName: string) {
    super(`Unknown MDX component: ${componentName}`);
  }
}

export function rehypeValidateComponents() {
  return (tree: Root) => {
    visit(tree, "mdxJsxFlowElement", (node: any) => {
      const name = node.name;
      if (typeof name !== "string") return;
      if (!/^[A-Z]/.test(name)) return;
      if (!allowedMdxComponentNames.has(name)) throw new MdxValidationError(name);
    });
    visit(tree, "mdxJsxTextElement", (node: any) => {
      const name = node.name;
      if (typeof name !== "string") return;
      if (!/^[A-Z]/.test(name)) return;
      if (!allowedMdxComponentNames.has(name)) throw new MdxValidationError(name);
    });
  };
}
