import { test, expect } from "@playwright/test";
test.setTimeout(90000);
const iteration = process.env.PHASE2_ITERATION ?? "1";
async function waitForScene(page: import("@playwright/test").Page) {
  await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
    timeout: 60000,
  });
  await page.waitForTimeout(1200);
}
test("showroom renders a nonblank WebGL scene without console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("404"))
      errors.push(m.text());
  });
  await page.goto("/showroom");
  await waitForScene(page);
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  expect(
    await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL().length),
  ).toBeGreaterThan(1000);
  expect(errors).toEqual([]);
});
for (const width of [1440, 390])
  for (const preset of ["far", "mid", "close", "top", "night"]) {
    test(`capture ${preset} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/showroom");
      await waitForScene(page);
      await page.getByRole("button", { name: preset, exact: true }).click();
      await page.waitForTimeout(1400);
      await page.screenshot({
        path: `docs/screenshots/phase2/iteration-${iteration}/${preset}-${width}.png`,
      });
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  }
