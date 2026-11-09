import { expect, test } from "@playwright/test";

test.setTimeout(180000);
const iteration = process.env.PHASE2B_ITERATION ?? "iteration-1";
const presets = [
  "far",
  "mid",
  "close",
  "under",
  "rim",
  "waterfall",
  "crystal",
  "night",
];

for (const width of [1440, 390]) {
  for (const quality of ["high", "low"]) {
    test(`phase2b ${width} ${quality}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/showroom");
      await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
        timeout: 90000,
      });
      await page.getByLabel("Render quality").selectOption(quality);
      for (const preset of presets) {
        await page.getByRole("button", { name: preset, exact: true }).click();
        await page.waitForTimeout(900);
        await page.screenshot({
          path: `docs/screenshots/phase2b/${iteration}/${quality}/${preset}-${width}.png`,
        });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }
}
