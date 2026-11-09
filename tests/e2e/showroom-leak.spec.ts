import { expect, test } from "@playwright/test";

test.setTimeout(240000);
type Metrics = { geometries: number; textures: number; materials: number };

test("renderer resources remain stable across ten showroom mounts", async ({
  page,
}) => {
  const samples: Metrics[] = [];
  await page.goto("/showroom");
  for (let index = 0; index < 10; index++) {
    if (index > 0)
      await page.getByRole("button", { name: "Mount", exact: true }).click();
    await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
      timeout: 90000,
    });
    await page.waitForFunction(
      () =>
        ((window as typeof window & { __SHOWROOM_RENDER_INFO__?: Metrics })
          .__SHOWROOM_RENDER_INFO__?.geometries ?? 0) >= 830,
    );
    const sample = await page.evaluate(
      () =>
        (window as typeof window & { __SHOWROOM_RENDER_INFO__: Metrics })
          .__SHOWROOM_RENDER_INFO__,
    );
    samples.push({
      geometries: sample.geometries,
      textures: sample.textures,
      materials: sample.materials,
    });
    await page.getByRole("button", { name: "Unmount", exact: true }).click();
    await expect(page.locator("canvas")).toHaveCount(0);
  }
  const baseline = samples[0];
  for (const sample of samples.slice(1)) expect(sample).toEqual(baseline);
});
