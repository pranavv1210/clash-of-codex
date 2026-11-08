"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { worldPalette } from "../palette";
export function Airship() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.12;
    ref.current.position.set(
      Math.cos(t) * 31,
      14 + Math.sin(t * 2) * 0.35,
      Math.sin(t) * 24,
    );
    ref.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[1.25, 3.8, 10, 20]} />
        <meshStandardMaterial
          color={worldPalette.amber}
          roughness={0.54}
          metalness={0.18}
        />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].map((x) => (
        <mesh
          key={`rib-${x}`}
          position={[x, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[1.26, 0.045, 8, 24]} />
          <meshStandardMaterial
            color={worldPalette.sun}
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      ))}
      <mesh position={[-1.9, 0, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[1.3, 0.12, 2.2]} />
        <meshStandardMaterial color={worldPalette.metal} metalness={0.5} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[2.2, 0.7, 0.85]} />
        <meshStandardMaterial color={worldPalette.metal} metalness={0.58} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, -1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.08, 8, 18]} />
          <meshStandardMaterial
            color={worldPalette.cyan}
            emissive={worldPalette.cyan}
            emissiveIntensity={1.4}
          />
        </mesh>
      ))}
      <mesh position={[2.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[0.7, 1.5, 16]} />
        <meshStandardMaterial color={worldPalette.amber} roughness={0.5} />
      </mesh>
    </group>
  );
}
export function CargoDrone({ offset = 0 }: { offset?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.35 + offset;
    ref.current.position.set(
      Math.cos(t) * 13,
      5 + Math.sin(t * 1.7),
      Math.sin(t) * 9,
    );
    ref.current.rotation.y = -t;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.1, 0.35, 0.75]} />
        <meshStandardMaterial color={worldPalette.strata} metalness={0.7} />
      </mesh>
      {[
        [-0.65, 0.48],
        [-0.65, -0.48],
        [0.65, 0.48],
        [0.65, -0.48],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <cylinderGeometry args={[0.32, 0.32, 0.05, 14]} />
          <meshStandardMaterial color={worldPalette.metal} />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.65, 0.65, 0.6]} />
        <meshStandardMaterial color={worldPalette.amber} />
      </mesh>
    </group>
  );
}
