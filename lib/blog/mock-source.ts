import type {
  BlogDataSource,
  ListPostsOptions,
  ListPostsResult,
  Post,
  PostSummary,
  Tag,
} from "./types";
import { AUTHORS } from "./types";
import { readingTimeSeconds } from "./reading-time";

const TAGS: Tag[] = [
  { slug: "agents", name: "agents", postCount: 1 },
  { slug: "memory", name: "memory", postCount: 1 },
  { slug: "notes", name: "notes", postCount: 1 },
];

const POSTS: Post[] = [
  {
    id: "mock-1",
    slug: "hello-from-donna",
    title: "Hello.",
    summary: "First post. Mostly to confirm the wiring works.",
    author: AUTHORS.donna,
    mdxCompiled: `<p>This page is rendered from a mock data source. Real posts arrive in Project B.</p>`,
    readingTimeSeconds: readingTimeSeconds("This page is rendered from a mock data source. Real posts arrive in Project B."),
    publishedAt: new Date("2026-05-17T10:00:00Z"),
    scheduledFor: null,
    tags: [TAGS[0], TAGS[2]],
    revisionCount: 0,
    lastEditedAt: null,
    toc: [],
  },
];

function toSummary(p: Post): PostSummary {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    author: p.author,
    readingTimeSeconds: p.readingTimeSeconds,
    publishedAt: p.publishedAt,
    tags: p.tags,
  };
}

export const mockSource: BlogDataSource = {
  async listPosts(opts: ListPostsOptions = {}): Promise<ListPostsResult> {
    const perPage = opts.perPage ?? 10;
    const page = opts.page ?? 1;
    let filtered = POSTS.slice();
    if (opts.tag) filtered = filtered.filter((p) => p.tags.some((t) => t.slug === opts.tag));
    if (opts.author) filtered = filtered.filter((p) => p.author.tag === opts.author);
    filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
    const start = (page - 1) * perPage;
    const slice = filtered.slice(start, start + perPage).map(toSummary);
    return { posts: slice, totalPages, currentPage: page, totalCount };
  },
  async getPost(slug: string): Promise<Post | null> {
    return POSTS.find((p) => p.slug === slug) ?? null;
  },
  async listTags(): Promise<Tag[]> {
    return TAGS;
  },
  async getRecentForFeed(limit: number): Promise<Post[]> {
    return POSTS.slice(0, limit).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },
};
