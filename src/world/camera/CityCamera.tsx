"use client";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
export type CameraPreset = "far" | "mid" | "close" | "top" | "night";
const presets: Record<CameraPreset, [number, number, number]> = {
  far: [48, 22, 52],
  mid: [25, 12, 28],
  close: [12, 5.5, 14],
  top: [0.1, 62, 0.1],
  night: [38, 17, 43],
};
export function CityCamera({ preset }: { preset: CameraPreset }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const mobileScale = size.width / size.height < 0.7 ? 1.65 : 1;
    camera.position.copy(
      new THREE.Vector3(...presets[preset]).multiplyScalar(mobileScale),
    );
    camera.lookAt(0, 0, 0);
  }, [camera, preset, size.height, size.width]);
  return (
    <OrbitControls
      makeDefault
      target={[0, 0, 0]}
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
