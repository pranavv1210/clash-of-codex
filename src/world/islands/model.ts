import { createRng } from "../rng";
export type IslandSize = "S" | "M" | "L" | "HQ";
export type IslandTheme = "grass" | "paved" | "garden" | "tech" | "stone";
export type IslandPlan = {
  seed: string;
  radius: number;
  footprint: [number, number][];
  pad: { width: number; depth: number };
  anchors: [number, number][];
  plots: { x: number; z: number }[];
};
export function createIslandPlan(seed: string, size: IslandSize): IslandPlan {
  const radius = { S: 5, M: 7, L: 9, HQ: 11 }[size],
    rng = createRng(seed),
    points = 18,
    footprint = Array.from({ length: points }, (_, i) => {
      const a = (i / points) * Math.PI * 2,
        r = radius * (0.88 + rng() * 0.18);
      return [Math.cos(a) * r, Math.sin(a) * r] as [number, number];
    }),
    plots = [];
  for (let x = -radius * 0.5; x <= radius * 0.5; x += 2.4)
    for (let z = -radius * 0.5; z <= radius * 0.5; z += 2.4)
      plots.push({ x, z });
  return {
    seed,
    radius,
    footprint,
    pad: { width: radius * 1.25, depth: radius * 1.15 },
    anchors: [
      [radius, 0],
      [-radius, 0],
      [0, radius],
      [0, -radius],
    ],
    plots,
  };
}
export function planHash(plan: IslandPlan) {
  return JSON.stringify(plan);
}
