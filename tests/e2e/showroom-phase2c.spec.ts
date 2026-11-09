import { expect, test } from "@playwright/test";

test.setTimeout(240000);
const iteration = process.env.PHASE2C_ITERATION ?? "after";
const presets = ["far", "mid", "close", "street", "sky", "night", "top"];
for (const width of [1440, 390])
  for (const quality of ["high", "low"])
    test(`phase2c ${width} ${quality}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/showroom");
      await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
        timeout: 90000,
      });
      if (width === 390)
        await page.getByRole("button", { name: "Show controls" }).click();
      await page.getByLabel("Render quality").selectOption(quality);
      for (const preset of presets) {
        await page.getByRole("button", { name: preset, exact: true }).click();
        if (width === 390)
          await page.getByRole("button", { name: "Hide controls" }).click();
        await page.waitForTimeout(1200);
        await page.screenshot({
          path: `docs/screenshots/phase2c/${iteration}/${quality}/${preset}-${width}.png`,
        });
        if (width === 390)
          await page.getByRole("button", { name: "Show controls" }).click();
      }
    });
