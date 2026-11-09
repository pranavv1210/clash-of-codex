"use client";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
export type CameraPreset =
  | "far"
  | "mid"
  | "close"
  | "top"
  | "night"
  | "under"
  | "rim"
  | "waterfall"
  | "crystal"
  | "street"
  | "sky";
const presets: Record<CameraPreset, [number, number, number]> = {
  far: [72, 38, 78],
  mid: [31, 18, 34],
  close: [18, 10, 20],
  top: [0.1, 62, 0.1],
  night: [58, 27, 64],
  under: [56, -9, 44],
  rim: [55, 4.2, 42],
  waterfall: [51, -1, 39],
  crystal: [50, 4.2, 34],
  street: [18, 6.2, 20],
  sky: [42, 10, 66],
};
const targets: Partial<Record<CameraPreset, [number, number, number]>> = {
  under: [38, -2.8, 26],
  close: [0, 5, 0],
  rim: [44.3, 0.2, 30.5],
  waterfall: [42.9, -2.3, 30.1],
  crystal: [44, 1.15, 26],
  street: [0, 5, 0],
  sky: [0, 7, 0],
};
export function CityCamera({ preset }: { preset: CameraPreset }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const mobileScale = size.width / size.height < 0.7 ? 1.65 : 1;
    camera.position.copy(
      new THREE.Vector3(...presets[preset]).multiplyScalar(mobileScale),
    );
    camera.lookAt(...(targets[preset] ?? [0, 0, 0]));
  }, [camera, preset, size.height, size.width]);
  return (
    <OrbitControls
      makeDefault
      target={targets[preset] ?? [0, 0, 0]}
      enableDamping
      dampingFactor={0.08}
      minDistance={7}
      maxDistance={90}
      minPolarAngle={0.15}
      maxPolarAngle={1.45}
      touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
    />
  );
}
