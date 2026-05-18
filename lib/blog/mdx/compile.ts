import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeValidateComponents, MdxValidationError } from "./validate";
import type { TocEntry } from "@/lib/blog/types";
import { readingTimeSeconds } from "@/lib/blog/reading-time";
import { getHighlighter } from "./shiki";

export interface CompileResult {
  compiled: string;
  toc: TocEntry[];
  readingTimeSeconds: number;
}

export class MdxCompileError extends Error {
  details?: { line?: number; column?: number; componentName?: string };
  constructor(
    message: string,
    details?: { line?: number; column?: number; componentName?: string },
  ) {
    super(message);
    this.details = details;
  }
}

export async function compileMdx(source: string): Promise<CompileResult> {
  const toc: TocEntry[] = [];
  const highlighter = await getHighlighter();

  try {
    await compile(source, {
      remarkPlugins: [remarkGfm, remarkSmartypants],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        rehypeValidateComponents,
      ],
      outputFormat: "function-body",
    });
  } catch (err) {
    if (err instanceof MdxValidationError) {
      throw new MdxCompileError(err.message, { componentName: err.componentName });
    }
    const e = err as { message: string; line?: number; column?: number };
    throw new MdxCompileError(e.message ?? "MDX compile failed", {
      line: e.line,
      column: e.column,
    });
  }

  const html = await renderHtml(source, highlighter, toc);

  return {
    compiled: html,
    toc,
    readingTimeSeconds: readingTimeSeconds(source.replace(/<[^>]*>/g, " ")),
  };
}

async function renderHtml(
  source: string,
  highlighter: Awaited<ReturnType<typeof getHighlighter>>,
  toc: TocEntry[],
): Promise<string> {
  const { remark } = await import("remark");
  const remarkRehype = (await import("remark-rehype")).default;
  const rehypeStringify = (await import("rehype-stringify")).default;
  const { visit } = await import("unist-util-visit");

  const processor = remark()
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(() => (tree: any) => {
      visit(tree, "element", (node: any) => {
        if (node.tagName !== "h2" && node.tagName !== "h3") return;
        const id = (node.properties?.id as string) ?? "";
        if (!id) return;
        let text = "";
        visit(node, "text", (t: any) => {
          text += t.value as string;
        });
        toc.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
      });
    })
    .use(() => (tree: any) => {
      visit(tree, "element", (node: any, _i: any, parent: any) => {
        if (node.tagName !== "code") return;
        if (!parent || parent.tagName !== "pre") return;
        const langClass = (node.properties?.className as string[] | undefined)?.find((c) =>
          c.startsWith("language-"),
        );
        const lang = langClass ? langClass.replace("language-", "") : "text";
        let code = "";
        for (const c of node.children ?? []) {
          if (c.type === "text") code += c.value as string;
        }
        const html = highlighter.codeToHtml(code, {
          lang: lang as never,
          theme: "github-dark-dimmed",
        });
        parent.tagName = "div";
        parent.children = [{ type: "raw", value: html } as never];
      });
    })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const file = await processor.process(source);
  return String(file);
}
