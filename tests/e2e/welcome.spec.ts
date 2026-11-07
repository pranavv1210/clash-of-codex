import { test, expect } from "@playwright/test";
test("welcome is usable without overflow", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Your code has a city. Give it a crew.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Connect GitHub" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
