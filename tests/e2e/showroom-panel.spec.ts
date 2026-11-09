import { expect, test } from "@playwright/test";
test.setTimeout(90000);

for (const width of [390, 768, 1440])
  test(`showroom panel fits ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/showroom");
    await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
      timeout: 90000,
    });
    if (width === 390)
      await page.getByRole("button", { name: "Show controls" }).click();
    const overflow = await page.locator(".showroom-panel").evaluate((panel) => {
      const elements = [panel, ...panel.querySelectorAll("*")];
      return elements
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => element.className || element.tagName);
    });
    expect(overflow).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
