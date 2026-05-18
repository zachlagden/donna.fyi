import { test, expect } from "@playwright/test";

test("blog index renders the mock post", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Hello\./ })).toBeVisible();
});

test("blog post page renders with author chip", async ({ page }) => {
  await page.goto("/blog/hello-from-donna");
  await expect(page.getByRole("heading", { name: "Hello." })).toBeVisible();
  await expect(page.getByText("Donna").first()).toBeVisible();
});

test("RSS feed is served", async ({ request }) => {
  const r = await request.get("/rss.xml");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("application/rss+xml");
  const body = await r.text();
  expect(body).toContain("<rss");
});

test("Atom feed is served", async ({ request }) => {
  const r = await request.get("/atom.xml");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("application/atom+xml");
});
