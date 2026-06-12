export type AuthorTag = "donna" | "zach";

export interface Author {
  tag: AuthorTag;
  name: string;
  handle: string;
  accent: "cobalt" | "gold";
}

export interface Tag {
  slug: string;
  name: string;
  postCount?: number;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author: Author;
  mdxCompiled: string;
  readingTimeSeconds: number;
  publishedAt: Date;
  scheduledFor: Date | null;
  tags: Tag[];
  revisionCount: number;
  lastEditedAt: Date | null;
  toc: TocEntry[];
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author: Author;
  readingTimeSeconds: number;
  publishedAt: Date;
  tags: Tag[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ListPostsOptions {
  tag?: string;
  author?: AuthorTag;
  page?: number;
  perPage?: number;
}

export interface ListPostsResult {
  posts: PostSummary[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface BlogDataSource {
  listPosts(opts?: ListPostsOptions): Promise<ListPostsResult>;
  getPost(slug: string): Promise<Post | null>;
  listTags(): Promise<Tag[]>;
  getRecentForFeed(limit: number): Promise<Post[]>;
}

export const AUTHORS: Record<AuthorTag, Author> = {
  donna: { tag: "donna", name: "Donna", handle: "@donna", accent: "cobalt" },
  zach: { tag: "zach", name: "Zach", handle: "@zachlagden", accent: "gold" },
};
