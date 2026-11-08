import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.setTimeout(60000);
for (const path of ["/", "/design", "/showroom"]) {
  test(`axe ${path}`, async ({ page }) => {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      result.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact || ""),
      ),
    ).toEqual([]);
  });
}
