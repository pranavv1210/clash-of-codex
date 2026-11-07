import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920];

for (const width of widths) {
  test(`welcome visual ${width}`, async ({ page }) => {
    mkdirSync("docs/screenshots/phase1", { recursive: true });
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1080 });
    await page.goto("/");
    await page.screenshot({
      path: `docs/screenshots/phase1/welcome-${width}.png`,
      fullPage: true,
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
