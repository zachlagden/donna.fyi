import type { BlogDataSource, ListPostsOptions, ListPostsResult, Post, Tag } from "./types";
import { listPublished, getPublishedBySlug, getRecentForFeed } from "./posts";
import { listTagsWithCounts } from "./tags";

export const postgresSource: BlogDataSource = {
  async listPosts(opts?: ListPostsOptions): Promise<ListPostsResult> {
    return listPublished(opts ?? {});
  },
  async getPost(slug: string): Promise<Post | null> {
    return getPublishedBySlug(slug);
  },
  async listTags(): Promise<Tag[]> {
    return listTagsWithCounts();
  },
  async getRecentForFeed(limit: number): Promise<Post[]> {
    return getRecentForFeed(limit);
  },
};
