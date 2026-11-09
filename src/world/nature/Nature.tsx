"use client";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { worldPalette } from "../palette";
import { createRng } from "../rng";
export function Nature({
  seed,
  count = 12,
  radius = 6,
}: {
  seed: string;
  count?: number;
  radius?: number;
}) {
  const rng = createRng(seed);
  return (
    <>
      <GrassTufts seed={`${seed}:grass`} count={count * 9} radius={radius} />
      {Array.from({ length: count }, (_, i) => {
        const a = rng() * Math.PI * 2,
          r = radius * (0.45 + rng() * 0.4),
          s = 0.7 + rng() * 0.55;
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
            scale={s}
          >
            <mesh position={[0, 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 1, 7]} />
              <meshStandardMaterial color={worldPalette.wood} />
            </mesh>
            <mesh position={[0, 1.32, 0]} castShadow>
              <icosahedronGeometry args={[0.62, 1]} />
              <meshStandardMaterial color={worldPalette.grass} roughness={1} />
            </mesh>
            <mesh position={[0.28, 1.5, 0]} castShadow>
              <icosahedronGeometry args={[0.35, 1]} />
              <meshStandardMaterial
                color={worldPalette.success}
                roughness={1}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
function GrassTufts({
  seed,
  count,
  radius,
}: {
  seed: string;
  count: number;
  radius: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    const rng = createRng(seed);
    const object = new THREE.Object3D();
    return Array.from({ length: count }, () => {
      const a = rng() * Math.PI * 2;
      const r = radius * (0.25 + rng() * 0.63);
      object.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
      object.rotation.set(0, rng() * Math.PI, (rng() - 0.5) * 0.12);
      object.scale.setScalar(0.65 + rng() * 0.7);
      object.updateMatrix();
      return object.matrix.clone();
    });
  }, [count, radius, seed]);
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.012;
  });
  useLayoutEffect(() => {
    if (!ref.current) return;
    matrices.forEach((matrix, i) => ref.current?.setMatrixAt(i, matrix));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      frustumCulled
      castShadow
    >
      <planeGeometry args={[0.09, 0.34, 1, 2]} />
      <meshStandardMaterial
        color={worldPalette.grass}
        side={THREE.DoubleSide}
        roughness={1}
      />
    </instancedMesh>
  );
}
