import type { BlogDataSource } from "./types";
import { mockSource } from "./mock-source";

let _source: BlogDataSource = mockSource;

export function getBlogSource(): BlogDataSource {
  return _source;
}

export function setBlogSourceForTesting(s: BlogDataSource): void {
  _source = s;
}
