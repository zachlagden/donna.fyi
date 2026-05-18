import { describe, expect, beforeAll, afterAll, it } from "vitest";
import postgres from "postgres";

const tdbUrl = process.env.TEST_DATABASE_URL;
const _describe = tdbUrl ? describe : describe.skip;

_describe("postgresSource integration", () => {
  let sql: ReturnType<typeof postgres>;
  let postgresSource: typeof import("@/lib/blog/postgres-source").postgresSource;

  beforeAll(async () => {
    process.env.DATABASE_URL = tdbUrl!;
    sql = postgres(tdbUrl!);
    await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
    const { runMigrations } = await import("@/lib/db/migrate");
    await runMigrations();
    postgresSource = (await import("@/lib/blog/postgres-source")).postgresSource;

    await sql`INSERT INTO users (github_id, github_login, display_name) VALUES (1, 'zach', 'Zach')`;
    await sql`
      INSERT INTO posts (slug, title, summary, author_tag, mdx_source, mdx_compiled, reading_time_s, published_at)
      VALUES ('first', 'First', 'Summary', 'donna', '# hi', '<h1>hi</h1>', 30, now())
    `;
  });

  afterAll(async () => { await sql.end(); });

  it("lists published posts", async () => {
    const r = await postgresSource.listPosts();
    expect(r.posts.length).toBe(1);
    expect(r.posts[0].slug).toBe("first");
  });

  it("gets by slug", async () => {
    const p = await postgresSource.getPost("first");
    expect(p?.title).toBe("First");
  });
});
