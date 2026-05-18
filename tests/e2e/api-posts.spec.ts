import { test, expect } from "@playwright/test";

const apiKey = process.env.E2E_API_KEY;
test.skip(!apiKey, "E2E_API_KEY not set");

test("POST + GET round trip", async ({ request }) => {
  const slug = `e2e-${Date.now()}`;
  const created = await request.post("/api/v1/posts", {
    headers: { Authorization: `Bearer ${apiKey!}` },
    data: { title: "E2E", summary: "Test", mdx_source: "# yo", slug, tags: ["test"] },
  });
  expect(created.status()).toBe(201);

  const fetched = await request.get(`/api/v1/posts/${slug}`);
  expect(fetched.status()).toBe(200);
  const json = await fetched.json();
  expect(json.slug).toBe(slug);
  expect(json.author.tag).toBe("donna");

  const del = await request.delete(`/api/v1/posts/${slug}`, {
    headers: { Authorization: `Bearer ${apiKey!}` },
  });
  expect(del.status()).toBe(200);
});

test("invalid MDX returns 400", async ({ request }) => {
  const r = await request.post("/api/v1/posts", {
    headers: { Authorization: `Bearer ${apiKey!}` },
    data: { title: "Bad", mdx_source: "# hi\n<DangerousScript />", slug: `bad-${Date.now()}` },
  });
  expect(r.status()).toBe(400);
  const json = await r.json();
  expect(json.error.code).toBe("invalid_mdx");
});

test("unauthenticated POST returns 401", async ({ request }) => {
  const r = await request.post("/api/v1/posts", {
    data: { title: "x", mdx_source: "x" },
  });
  expect(r.status()).toBe(401);
});
