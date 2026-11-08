"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createIslandPlan, type IslandSize, type IslandTheme } from "./model";
import { createRng } from "../rng";
import { energyColor, worldPalette, type WorldStyle } from "../palette";
export function Island({
  seed,
  size = "M",
  theme = "grass",
  style = "cyan",
  children,
}: {
  seed: string;
  size?: IslandSize;
  theme?: IslandTheme;
  style?: WorldStyle;
  children?: React.ReactNode;
}) {
  const plan = useMemo(() => createIslandPlan(seed, size), [seed, size]),
    shape = useMemo(() => {
      const s = new THREE.Shape();
      plan.footprint.forEach(([x, z], i) =>
        i ? s.lineTo(x, z) : s.moveTo(x, z),
      );
      s.closePath();
      return s;
    }, [plan]),
    rng = useMemo(() => createRng(seed + "debris"), [seed]),
    surface = {
      grass: worldPalette.grass,
      paved: worldPalette.paving,
      garden: worldPalette.library,
      tech: worldPalette.metal,
      stone: worldPalette.strata,
    }[theme];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.8,
              bevelEnabled: true,
              bevelSize: 0.32,
              bevelThickness: 0.25,
              bevelSegments: 3,
            },
          ]}
        />
        <meshStandardMaterial color={surface} roughness={0.84} />
      </mesh>
      <mesh position={[0, -3.15, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[plan.radius * 0.9, 6.1, 18, 6]} />
        <meshStandardMaterial
          color={worldPalette.rock}
          roughness={0.92}
          flatShading
        />
      </mesh>
      <mesh
        position={[-plan.radius * 0.25, -3.8, plan.radius * 0.12]}
        rotation={[Math.PI, 0.18, 0.12]}
        castShadow
      >
        <coneGeometry args={[plan.radius * 0.42, 5.4, 10, 3]} />
        <meshStandardMaterial
          color={worldPalette.rockDark}
          roughness={1}
          flatShading
        />
      </mesh>
      <mesh
        position={[plan.radius * 0.32, -3.35, -plan.radius * 0.18]}
        rotation={[Math.PI, -0.2, -0.16]}
        castShadow
      >
        <coneGeometry args={[plan.radius * 0.36, 4.7, 9, 3]} />
        <meshStandardMaterial
          color={worldPalette.rockLight}
          roughness={1}
          flatShading
        />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry
          args={[plan.radius * 0.94, plan.radius * 0.78, 0.46, 18]}
        />
        <meshStandardMaterial color={worldPalette.strata} roughness={1} />
      </mesh>
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry
          args={[plan.radius * 0.8, plan.radius * 0.64, 0.34, 18]}
        />
        <meshStandardMaterial color={worldPalette.rockDark} roughness={1} />
      </mesh>
      <mesh position={[0, -2.12, 0]}>
        <cylinderGeometry
          args={[plan.radius * 0.66, plan.radius * 0.52, 0.28, 18]}
        />
        <meshStandardMaterial color={worldPalette.strata} roughness={1} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = rng() * Math.PI * 2,
          r = plan.radius * (0.65 + rng() * 0.45);
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, -1.4 - rng() * 2, Math.sin(a) * r]}
            rotation={[rng(), a, rng()]}
          >
            <mesh castShadow>
              <octahedronGeometry args={[0.25 + rng() * 0.4, 0]} />
              <meshStandardMaterial
                color={energyColor(style)}
                emissive={energyColor(style)}
                emissiveIntensity={2.1}
                roughness={0.22}
              />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const a = rng() * Math.PI * 2,
          r = plan.radius * (1.2 + rng() * 0.35);
        return (
          <mesh
            key={`d${i}`}
            position={[Math.cos(a) * r, -2 - rng() * 3, Math.sin(a) * r]}
            rotation={[rng() * 2, rng() * 2, rng() * 2]}
            castShadow
          >
            <dodecahedronGeometry args={[0.25 + rng() * 0.45, 0]} />
            <meshStandardMaterial color={worldPalette.rockDark} roughness={1} />
          </mesh>
        );
      })}
      {size !== "S" && <Waterfall radius={plan.radius} />}
      <group position={[0, 0.82, 0]}>{children}</group>
    </group>
  );
}
function Waterfall({ radius }: { radius: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current)
      mat.current.emissiveIntensity =
        0.35 + Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group position={[radius * 0.7, -1, radius * 0.58]} rotation={[0, -0.7, 0]}>
      <mesh position={[0, -2.3, 0]}>
        <planeGeometry args={[0.55, 5.4, 1, 8]} />
        <meshStandardMaterial
          ref={mat}
          color={worldPalette.water}
          emissive={worldPalette.water}
          emissiveIntensity={0.4}
          transparent
          opacity={0.68}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[
            ((i % 3) - 0.9) * 0.22,
            -5 + (i % 2) * 0.18,
            (i % 2) * 0.15,
          ]}
        >
          <sphereGeometry args={[0.16 + (i % 2) * 0.08, 8, 6]} />
          <meshBasicMaterial
            color={worldPalette.white}
            transparent
            opacity={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}
