import { describe, expect, it } from "vitest";
import { createRng, seededRange } from "../../src/world/rng";
import { createIslandPlan, planHash } from "../../src/world/islands/model";
import {
  buildingFitsPad,
  buildingSpec,
  type Archetype,
} from "../../src/world/buildings/model";
import { createCliffGeometry } from "../../src/world/islands/cliffGeometry";
import { showroomComposition } from "../../src/world/composition";
describe("procedural world", () => {
  it("keeps all archetypes inside the pad with rim clearance", () => {
    const archetypes: Archetype[] = [
      "hq",
      "dev",
      "comms",
      "data",
      "test",
      "library",
      "control",
      "studio",
      "workshop",
      "home",
      "grid",
    ];
    for (const archetype of archetypes)
      expect(buildingFitsPad(archetype, `${archetype}:bounds`, 8)).toBe(true);
  });
  it("keeps the hero composition centers separated", () => {
    const points = [showroomComposition.hero, ...showroomComposition.orbit];
    for (let a = 0; a < points.length; a++)
      for (let b = a + 1; b < points.length; b++)
        expect(
          Math.hypot(points[a][0] - points[b][0], points[a][2] - points[b][2]),
        ).toBeGreaterThan(20);
  });
  it("repeats seeded random sequences", () => {
    expect(seededRange("city", 12)).toEqual(seededRange("city", 12));
    const a = createRng("a"),
      b = createRng("b");
    expect(a()).not.toBe(b());
  });
  it("produces identical island plans for the same seed", () => {
    expect(planHash(createIslandPlan("repo/docs", "M"))).toBe(
      planHash(createIslandPlan("repo/docs", "M")),
    );
  });
  it("exposes valid footprints, anchors and plots", () => {
    const p = createIslandPlan("hq", "HQ");
    expect(p.footprint.length).toBeGreaterThan(12);
    expect(p.anchors).toHaveLength(4);
    expect(p.plots.length).toBeGreaterThan(10);
    expect(
      p.footprint.every(([x, z]) => Number.isFinite(x) && Number.isFinite(z)),
    ).toBe(true);
  });
  it("builds deterministic finite cliff geometry", () => {
    const a = createCliffGeometry("repo/docs", 7);
    const b = createCliffGeometry("repo/docs", 7);
    expect(Array.from(a.attributes.position.array)).toEqual(
      Array.from(b.attributes.position.array),
    );
    expect(Array.from(a.attributes.position.array).every(Number.isFinite)).toBe(
      true,
    );
    expect(a.index?.count).toBeGreaterThan(1000);
    a.dispose();
    b.dispose();
  });
  it("keeps every building finite and bounded", () => {
    for (const kind of [
      "hq",
      "dev",
      "comms",
      "data",
      "test",
      "library",
      "control",
      "studio",
      "workshop",
      "home",
      "grid",
    ] as const) {
      const b = buildingSpec(kind, kind);
      expect([b.width, b.depth, b.height].every(Number.isFinite)).toBe(true);
      expect(b.width).toBeLessThanOrEqual(6);
      expect(b.depth).toBeLessThanOrEqual(5);
      expect(b.height).toBeGreaterThan(0);
    }
  });
});
