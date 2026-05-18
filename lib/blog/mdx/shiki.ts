import { createHighlighter, type Highlighter } from "shiki";

let _highlighter: Promise<Highlighter> | null = null;

export function getHighlighter() {
  if (!_highlighter) {
    _highlighter = createHighlighter({
      themes: ["github-dark-dimmed"],
      langs: [
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
      ],
    });
  }
  return _highlighter;
}
