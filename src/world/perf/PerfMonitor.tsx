"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
export type PerfSample = {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
};
export function PerfMonitor({
  onSample,
}: {
  onSample: (s: PerfSample) => void;
}) {
  const gl = useThree((s) => s.gl),
    acc = useRef({ t: 0, n: 0 });
  useFrame((_, delta) => {
    acc.current.t += delta;
    acc.current.n++;
    if (acc.current.t > 1) {
      const fps = Math.round(acc.current.n / acc.current.t);
      onSample({
        fps,
        ms: Math.round(1000 / fps),
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
      });
      acc.current = { t: 0, n: 0 };
    }
  });
  return null;
}
