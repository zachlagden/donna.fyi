import { compile, run, type RunOptions } from "@mdx-js/mdx";
import * as jsxRuntime from "react/jsx-runtime";
import { createElement, type ReactElement, type ReactNode } from "react";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";

import { rehypeValidateComponents, MdxValidationError } from "./validate";
import { rehypeExtractToc } from "./toc";
import type { TocEntry } from "@/lib/blog/types";
import { readingTimeSeconds } from "@/lib/blog/reading-time";
import { mdxComponents } from "@/components/mdx";

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

const SHIKI_LANGS = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "sh",
  "bash",
  "json",
  "yaml",
  "sql",
  "py",
  "rust",
  "md",
  "diff",
];

export async function compileMdx(source: string): Promise<CompileResult> {
  const toc: TocEntry[] = [];

  let codeBody: string;
  try {
    const compiled = await compile(source, {
      outputFormat: "function-body",
      development: false,
      remarkPlugins: [remarkGfm, remarkSmartypants],
      rehypePlugins: [
        rehypeValidateComponents,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        () => rehypeExtractToc(toc),
        [
          rehypeShiki,
          {
            themes: { dark: "github-dark-dimmed" },
            defaultColor: "dark",
            langs: SHIKI_LANGS,
          },
        ],
      ],
    });
    codeBody = String(compiled);
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

  type MdxModule = {
    default: (props: { components?: typeof mdxComponents }) => ReactNode;
  };

  let mdxModule: MdxModule;
  try {
    const runOptions = {
      ...(jsxRuntime as unknown as RunOptions),
      baseUrl: "file:///compile.ts",
    } as RunOptions;
    mdxModule = (await run(codeBody, runOptions)) as MdxModule;
  } catch (err) {
    const e = err as { message?: string };
    throw new MdxCompileError(e.message ?? "MDX evaluation failed");
  }

  const element = createElement(
    mdxModule.default as (props: { components?: typeof mdxComponents }) => ReactElement,
    { components: mdxComponents },
  );

  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(element);

  return {
    compiled: html,
    toc,
    readingTimeSeconds: readingTimeSeconds(source.replace(/<[^>]*>/g, " ")),
  };
}
