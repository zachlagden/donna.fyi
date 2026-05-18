import type { BlogDataSource } from "./types";
import { mockSource } from "./mock-source";
import { postgresSource } from "./postgres-source";

const isProd = process.env.NODE_ENV === "production" || process.env.USE_POSTGRES_SOURCE === "1";

let _source: BlogDataSource = isProd ? postgresSource : mockSource;

export function getBlogSource(): BlogDataSource {
  return _source;
}

export function setBlogSourceForTesting(s: BlogDataSource): void {
  _source = s;
}
