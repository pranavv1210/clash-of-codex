"use client";
import { addAfterEffect, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
export type PerfSample = {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  materials: number;
};
export function PerfMonitor({
  onSample,
}: {
  onSample: (s: PerfSample) => void;
}) {
  const gl = useThree((s) => s.gl),
    scene = useThree((s) => s.scene),
    acc = useRef({ started: performance.now(), n: 0 });
  useEffect(
    () => () => {
      delete (
        window as typeof window & { __SHOWROOM_RENDER_INFO__?: PerfSample }
      ).__SHOWROOM_RENDER_INFO__;
    },
    [],
  );
  useEffect(
    () =>
      addAfterEffect(() => {
        acc.current.n += 1;
        const elapsed = (performance.now() - acc.current.started) / 1000;
        if (acc.current.n === 3 || elapsed > 1) {
          const fps = Math.round(acc.current.n / Math.max(elapsed, 0.001));
          const materials = new Set<THREE.Material>();
          scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const value = object.material;
            (Array.isArray(value) ? value : [value]).forEach((material) =>
              materials.add(material),
            );
          });
          const sample = {
            fps,
            ms: Math.round(1000 / fps),
            calls: gl.info.render.calls,
            triangles: gl.info.render.triangles,
            geometries: gl.info.memory.geometries,
            textures: gl.info.memory.textures,
            materials: materials.size,
          };
          (
            window as typeof window & { __SHOWROOM_RENDER_INFO__?: PerfSample }
          ).__SHOWROOM_RENDER_INFO__ = sample;
          onSample(sample);
          acc.current = { started: performance.now(), n: 0 };
        }
      }),
    [gl, onSample, scene],
  );
  return null;
}
