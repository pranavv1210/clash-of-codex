"use client";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { energyColor } from "../palette";

export function CrystalCluster({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new THREE.Object3D();
    [-0.62, -0.3, 0, 0.34, 0.65].forEach((x, i) => {
      object.position.set(x, 0.34 + (i % 3) * 0.2, Math.sin(i * 2.1) * 0.18);
      object.rotation.set(0.08 * Math.sin(i), i * 0.7, (i - 2) * 0.13);
      object.scale.set(
        0.78 + (i % 2) * 0.18,
        1.35 + (i % 3) * 0.58,
        0.78 + (i % 2) * 0.18,
      );
      object.updateMatrix();
      ref.current?.setMatrixAt(i, object.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group scale={scale}>
      <instancedMesh ref={ref} args={[undefined, undefined, 5]} castShadow>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={energyColor}
          emissive={energyColor}
          emissiveIntensity={2.4}
          roughness={0.18}
        />
      </instancedMesh>
      <mesh position={[0, 0.58, 0]} scale={[1.65, 0.85, 1.15]}>
        <sphereGeometry args={[0.72, 16, 10]} />
        <meshBasicMaterial
          color={energyColor}
          transparent
          opacity={0.075}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
