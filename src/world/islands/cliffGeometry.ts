import * as THREE from "three";
import { createRng } from "../rng";

export function createCliffGeometry(seed: string, radius: number) {
  const rng = createRng(`${seed}:cliff`);
  const segments = 42;
  const heights = [-0.55, -1.05, -1.8, -2.75, -4.05, -5.45, -6.35];
  const radii = [1, 1.04, 0.88, 0.78, 0.56, 0.3, 0.035];
  const phaseA = rng() * Math.PI * 2;
  const phaseB = rng() * Math.PI * 2;
  const positions: number[] = [];
  for (let ring = 0; ring < heights.length; ring++) {
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const low = Math.sin(angle * 3 + phaseA) * 0.09;
      const ridge = Math.sin(angle * 11 + phaseB + ring * 0.8) * 0.045;
      const chip = (rng() - 0.5) * (ring < 2 ? 0.075 : 0.13);
      const ledge =
        ring === 1 || ring === 3 ? 0.08 * (0.5 + 0.5 * Math.sin(angle * 5)) : 0;
      const r = radius * (radii[ring] + low + ridge + chip + ledge);
      const y =
        heights[ring] + Math.sin(angle * 7 + phaseB) * 0.08 * (ring + 1);
      positions.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    }
  }
  const indices: number[] = [];
  for (let ring = 0; ring < heights.length - 1; ring++) {
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const a = ring * segments + i;
      const b = ring * segments + next;
      const c = (ring + 1) * segments + i;
      const d = (ring + 1) * segments + next;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
