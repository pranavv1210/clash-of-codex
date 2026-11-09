"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildingSpec, type Archetype } from "./model";
import { createRng } from "../rng";
import { energyColor, worldPalette } from "../palette";

export function Building({
  archetype,
  seed,
  night = false,
  simplified = false,
}: {
  archetype: Archetype;
  seed: string;
  night?: boolean;
  simplified?: boolean;
}) {
  const raw = buildingSpec(archetype, seed);
  const s = {
    ...raw,
    width: Math.min(raw.width, archetype === "hq" ? 5 : 4.4),
    depth: Math.min(raw.depth, 3.8),
    height: Math.min(raw.height, archetype === "hq" ? 8.4 : 4.8),
  };
  const base =
    archetype === "library"
      ? worldPalette.library
      : archetype === "studio"
        ? worldPalette.studio
        : archetype === "workshop" || archetype === "home"
          ? worldPalette.brick
          : worldPalette.rockLight;
  if (simplified)
    return (
      <group>
        <mesh position={[0, s.height / 2, 0]} castShadow>
          <boxGeometry args={[s.width, s.height, s.depth]} />
          <meshStandardMaterial color={base} roughness={0.66} />
        </mesh>
        <Roof archetype={archetype} s={s} simple />
      </group>
    );
  return (
    <group name={`building:${archetype}`}>
      <mesh position={[0, 0.22, 0]} receiveShadow castShadow>
        <boxGeometry args={[s.width + 0.8, 0.44, s.depth + 0.8]} />
        <meshStandardMaterial color={worldPalette.paving} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.75, s.depth / 2 + 0.32]} castShadow>
        <boxGeometry args={[s.width * 0.58, 1.05, 0.62]} />
        <meshStandardMaterial
          color={worldPalette.metal}
          metalness={0.38}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, s.height * 0.48 + 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[s.width, s.height * 0.78, s.depth]} />
        <meshStandardMaterial
          color={base}
          roughness={0.6}
          metalness={archetype === "data" ? 0.32 : 0.06}
        />
      </mesh>
      <UpperVolume archetype={archetype} s={s} base={base} />
      <WindowGrid s={s} night={night} seed={seed} />
      <Roof archetype={archetype} s={s} />
    </group>
  );
}

type Spec = ReturnType<typeof buildingSpec>;
function UpperVolume({
  archetype,
  s,
  base,
}: {
  archetype: Archetype;
  s: Spec;
  base: string;
}) {
  const lowWide = ["data", "test", "workshop", "grid"].includes(archetype);
  const scale = lowWide
    ? [0.78, 0.28, 0.88]
    : archetype === "hq"
      ? [0.62, 0.72, 0.62]
      : [0.72, 0.42, 0.72];
  const y = s.height * 0.78 + (s.height * scale[1]) / 2;
  return (
    <mesh position={[archetype === "dev" ? -0.35 : 0, y, 0]} castShadow>
      {archetype === "home" ? (
        <coneGeometry args={[s.width * 0.62, 1.35, 4]} />
      ) : (
        <boxGeometry
          args={[s.width * scale[0], s.height * scale[1], s.depth * scale[2]]}
        />
      )}
      <meshStandardMaterial color={base} roughness={0.55} metalness={0.08} />
    </mesh>
  );
}

function WindowGrid({
  s,
  night,
  seed,
}: {
  s: Spec;
  night: boolean;
  seed: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    const rng = createRng(`${seed}:windows`),
      object = new THREE.Object3D();
    const floors = Math.max(2, Math.min(5, Math.floor(s.height / 1.05)));
    const bays = Math.max(3, Math.min(6, Math.floor(s.width / 0.72)));
    const values: THREE.Matrix4[] = [];
    for (let floor = 0; floor < floors; floor++)
      for (let bay = 0; bay < bays; bay++) {
        object.position.set(
          (bay - (bays - 1) / 2) * (s.width / (bays + 0.35)),
          0.92 + floor * 0.85,
          s.depth / 2 + 0.026,
        );
        object.scale.set(0.42 + rng() * 0.08, 0.34, 0.045);
        object.updateMatrix();
        values.push(object.matrix.clone());
      }
    return values;
  }, [s.depth, s.height, s.width, seed]);
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current?.setMatrixAt(i, m));
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={worldPalette.windows}
        emissive={worldPalette.windows}
        emissiveIntensity={night ? 2.5 : 0.62}
        metalness={0.25}
        roughness={0.18}
      />
    </instancedMesh>
  );
}

function Roof({
  archetype,
  s,
  simple = false,
}: {
  archetype: Archetype;
  s: Spec;
  simple?: boolean;
}) {
  const y = s.height + 0.62;
  if (archetype === "hq")
    return (
      <group position={[0, y, 0]}>
        <mesh position={[0, 1.7, 0]} castShadow>
          <coneGeometry args={[1.25, 3.4, 6]} />
          <meshStandardMaterial
            color={worldPalette.glass}
            emissive={energyColor}
            emissiveIntensity={0.5}
            metalness={0.68}
            roughness={0.18}
          />
        </mesh>
        {!simple && (
          <mesh position={[0, 3.6, 0]}>
            <octahedronGeometry args={[0.48]} />
            <meshStandardMaterial
              color={energyColor}
              emissive={energyColor}
              emissiveIntensity={3}
            />
          </mesh>
        )}
      </group>
    );
  if (archetype === "comms")
    return (
      <group position={[0, y, 0]}>
        <mesh rotation={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.12, 0.16, 1.8, 8]} />
          <meshStandardMaterial color={worldPalette.metal} metalness={0.8} />
        </mesh>
        <mesh position={[0.35, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.7, 16, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={energyColor}
            metalness={0.5}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    );
  if (archetype === "library")
    return (
      <mesh position={[0, y, 0]}>
        <sphereGeometry args={[1.15, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={worldPalette.glass}
          transparent
          opacity={0.78}
          metalness={0.45}
          roughness={0.12}
        />
      </mesh>
    );
  if (archetype === "studio")
    return (
      <group position={[0, y, 0]}>
        {[-1, 0, 1].map((x) => (
          <mesh key={x} position={[x * 0.75, 0, 0]} rotation={[0, 0, -0.65]}>
            <boxGeometry args={[0.85, 0.18, s.depth * 0.8]} />
            <meshStandardMaterial
              color={worldPalette.glass}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    );
  if (archetype === "home")
    return (
      <group position={[0, y - 0.45, 0]}>
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[s.width * 0.65, 1.6, 4]} />
          <meshStandardMaterial color={worldPalette.brick} roughness={0.8} />
        </mesh>
        <mesh position={[0.8, 0.7, 0]}>
          <boxGeometry args={[0.3, 1.3, 0.3]} />
          <meshStandardMaterial color={worldPalette.rockDark} />
        </mesh>
      </group>
    );
  const accent =
    archetype === "data" || archetype === "grid"
      ? energyColor
      : archetype === "test"
        ? worldPalette.success
        : worldPalette.amber;
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[s.width * 0.8, 0.28, s.depth * 0.8]} />
        <meshStandardMaterial
          color={worldPalette.rockDark}
          metalness={0.4}
          roughness={0.46}
        />
      </mesh>
      {!simple && (
        <>
          <mesh position={[-0.7, 0.42, 0]}>
            <boxGeometry args={[0.8, 0.55, 0.9]} />
            <meshStandardMaterial color={worldPalette.metal} metalness={0.55} />
          </mesh>
          <mesh position={[0.8, 0.58, 0]}>
            <cylinderGeometry args={[0.25, 0.34, 1.1, 10]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.8}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
