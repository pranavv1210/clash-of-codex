import { expect, test } from "@playwright/test";

test.setTimeout(240000);
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
const iteration = process.env.PHASE2B_FIX_ITERATION ?? "after";

for (const width of [1440, 390]) {
  for (const quality of ["high", "low"]) {
    test(`phase2b-fix ${width} ${quality}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/showroom");
      await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
        timeout: 90000,
      });
      await page.getByLabel("Render quality").selectOption(quality);
      for (const preset of presets) {
        await page.getByRole("button", { name: preset, exact: true }).click();
        await page.waitForTimeout(1200);
        await page.screenshot({
          path: `docs/screenshots/phase2b-fix/${iteration}/${quality}/${preset}-${width}.png`,
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

test("records renderer metrics for far, mid and close", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/showroom");
  await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
    timeout: 90000,
  });
  for (const quality of ["low", "high"]) {
    await page.getByLabel("Render quality").selectOption(quality);
    for (const preset of ["far", "mid", "close"]) {
      await page.getByRole("button", { name: preset, exact: true }).click();
      await page.waitForTimeout(2500);
      const metrics = await page.evaluate(
        () =>
          (window as typeof window & { __SHOWROOM_RENDER_INFO__: unknown })
            .__SHOWROOM_RENDER_INFO__,
      );
      console.log(`METRICS ${quality}/${preset} ${JSON.stringify(metrics)}`);
    }
  }
});
