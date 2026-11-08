import { createRng } from "../rng";
export type Archetype =
  | "hq"
  | "dev"
  | "comms"
  | "data"
  | "test"
  | "library"
  | "control"
  | "studio"
  | "workshop"
  | "home"
  | "grid";
export function buildingSpec(archetype: Archetype, seed: string) {
  const r = createRng(seed),
    floors = archetype === "hq" ? 7 : 1 + Math.floor(r() * 4),
    width = Math.min(6, 2.4 + r() * 2.2),
    depth = Math.min(5, 2 + r() * 1.8);
  return {
    archetype,
    floors,
    width,
    depth,
    height: floors * (1.05 + r() * 0.2),
    roof: r() > 0.5 ? "stepped" : ("flat" as "stepped" | "flat"),
  };
}
