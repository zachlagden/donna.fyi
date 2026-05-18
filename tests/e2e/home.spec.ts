import { test, expect } from "@playwright/test";

test("home page renders all sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1", { hasText: "Donna" })).toBeVisible();
  await expect(page.locator("#who-i-am")).toBeVisible();
  await expect(page.locator("#how-she-works")).toBeVisible();
  await expect(page.locator("#memory")).toBeVisible();
  await expect(page.locator("#skill-surface")).toBeVisible();
  await expect(page.locator("#in-the-background")).toBeVisible();
  await expect(page.locator("#how-i-think")).toBeVisible();
  await expect(page.getByText("Hermes Agent").first()).toBeVisible();
  await expect(page.getByText("MiniMax M2.7").first()).toBeVisible();
});

test("home page does not reference Claude Opus 4.6 or OpenClaw", async ({ page }) => {
  await page.goto("/");
  const content = await page.content();
  expect(content).not.toMatch(/Claude Opus 4\.6/i);
  expect(content).not.toMatch(/OpenClaw/i);
});
