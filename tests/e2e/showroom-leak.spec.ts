import { expect, test } from "@playwright/test";

test.setTimeout(240000);
type Metrics = {
  geometries: number;
  textures: number;
  materials: number;
  programs: number;
  renderTargets: number;
};

test("renderer resources remain stable across ten showroom mounts", async ({
  page,
}) => {
  const samples: Metrics[] = [];
  await page.goto("/showroom");
  // Three/Drei intentionally retain shader, KTX2 and PMREM initialization caches.
  // Warm them once, then require an exact resource baseline for all measured cycles.
  await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
    timeout: 90000,
  });
  await page.getByRole("button", { name: "Unmount", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  for (let index = 0; index < 10; index++) {
    await page.getByRole("button", { name: "Mount", exact: true }).click();
    await expect(page.locator('[data-scene-ready="true"]')).toBeVisible({
      timeout: 90000,
    });
    await page.waitForFunction(
      () => {
        const state = window as typeof window & {
          __SHOWROOM_RENDER_INFO__?: Metrics;
          __RESOURCE_STABLE__?: string;
        };
        const current = state.__SHOWROOM_RENDER_INFO__;
        if (!current) return false;
        const signature = JSON.stringify({
          geometries: current.geometries,
          textures: current.textures,
          materials: current.materials,
          programs: current.programs,
          renderTargets: current.renderTargets,
        });
        if (state.__RESOURCE_STABLE__ === signature) return true;
        state.__RESOURCE_STABLE__ = signature;
        return false;
      },
      undefined,
      { polling: 1200 },
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
      programs: sample.programs,
      renderTargets: sample.renderTargets,
    });
    await page.getByRole("button", { name: "Unmount", exact: true }).click();
    await expect(page.locator("canvas")).toHaveCount(0);
  }
  const baseline = samples[0];
  for (const sample of samples.slice(1)) expect(sample).toEqual(baseline);
});
