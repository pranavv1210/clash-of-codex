import { RoundedBox } from "@react-three/drei";
import { buildingSpec, type Archetype } from "./model";
import { energyColor, worldPalette } from "../palette";
export function Building({
  archetype,
  seed,
  night = false,
}: {
  archetype: Archetype;
  seed: string;
  night?: boolean;
}) {
  const s = buildingSpec(archetype, seed),
    accent = energyColor,
    base =
      archetype === "library"
        ? worldPalette.library
        : archetype === "studio"
          ? worldPalette.studio
          : archetype === "workshop"
            ? worldPalette.brick
            : worldPalette.metal;
  return (
    <group>
      <RoundedBox
        args={[s.width + 0.8, 0.28, s.depth + 0.8]}
        radius={0.14}
        smoothness={2}
        position={[0, 0.14, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={worldPalette.rockLight} roughness={0.88} />
      </RoundedBox>
      <RoundedBox
        args={[s.width, s.height, s.depth]}
        radius={0.18}
        smoothness={3}
        position={[0, s.height / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={base}
          roughness={0.58}
          metalness={archetype === "data" ? 0.5 : 0.18}
        />
      </RoundedBox>
      <Facade width={s.width} height={s.height} depth={s.depth} night={night} />
      <Roof
        archetype={archetype}
        y={s.height}
        width={s.width}
        depth={s.depth}
        accent={accent}
      />
      {archetype === "hq" && <Spire y={s.height} accent={accent} />}{" "}
      {archetype === "comms" && <Dish y={s.height + 0.65} accent={accent} />}{" "}
      {archetype === "data" && <Cooling y={s.height + 0.22} width={s.width} />}{" "}
      {archetype === "test" && <Beacon y={s.height + 0.72} />}{" "}
      {archetype === "library" && <Dome y={s.height + 0.5} />}{" "}
      {archetype === "control" && (
        <Turbines y={s.height + 0.5} width={s.width} />
      )}{" "}
      {archetype === "studio" && (
        <SawRoof y={s.height + 0.36} width={s.width} />
      )}{" "}
      {archetype === "workshop" && <Crane y={s.height + 0.8} />}{" "}
      {archetype === "grid" && (
        <GridTowers y={s.height + 0.7} width={s.width} accent={accent} />
      )}
    </group>
  );
}
function Facade({
  width,
  height,
  depth,
  night,
}: {
  width: number;
  height: number;
  depth: number;
  night: boolean;
}) {
  const floors = Math.max(1, Math.floor(height));
  return (
    <>
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: 3 }, (_, c) => (
          <mesh
            key={`${f}-${c}`}
            position={[
              (c - 1) * width * 0.24,
              0.6 + f * 1.02,
              depth / 2 + 0.025,
            ]}
          >
            <boxGeometry args={[width * 0.14, 0.38, 0.055]} />
            <meshStandardMaterial
              color={worldPalette.windows}
              emissive={worldPalette.windows}
              emissiveIntensity={night ? 2.2 : 0.65}
              roughness={0.25}
            />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.62, depth / 2 + 0.08]}>
        <boxGeometry args={[0.68, 1.15, 0.14]} />
        <meshStandardMaterial
          color={worldPalette.glass}
          metalness={0.45}
          roughness={0.2}
        />
      </mesh>
    </>
  );
}
function Roof({
  archetype,
  y,
  width,
  depth,
  accent,
}: {
  archetype: Archetype;
  y: number;
  width: number;
  depth: number;
  accent: string;
}) {
  return (
    <mesh position={[0, y + 0.18, 0]} castShadow>
      <boxGeometry args={[width + 0.28, 0.35, depth + 0.28]} />
      <meshStandardMaterial
        color={archetype === "hq" ? accent : worldPalette.rockDark}
        metalness={0.42}
        roughness={0.5}
      />
    </mesh>
  );
}
function Spire({ y, accent }: { y: number; accent: string }) {
  return (
    <group position={[0, y + 0.35, 0]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[1.15, 3.6, 6]} />
        <meshStandardMaterial
          color={worldPalette.glass}
          emissive={accent}
          emissiveIntensity={0.55}
          metalness={0.65}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <octahedronGeometry args={[0.52, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={3}
        />
      </mesh>
    </group>
  );
}
function Dish({ y, accent }: { y: number; accent: string }) {
  return (
    <group position={[0, y, 0]} rotation={[0, 0, -0.35]}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.1, 1.5, 10]} />
        <meshStandardMaterial color={worldPalette.metal} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.75, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={accent}
          metalness={0.55}
          roughness={0.3}
          side={2}
        />
      </mesh>
    </group>
  );
}
function Cooling({ y, width }: { y: number; width: number }) {
  return (
    <group position={[0, y, 0]}>
      {[-width * 0.25, width * 0.25].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.8, 0.42, 1.1]} />
          <meshStandardMaterial color={worldPalette.strata} metalness={0.55} />
        </mesh>
      ))}
    </group>
  );
}
function Beacon({ y }: { y: number }) {
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry args={[0.22, 0.3, 0.7, 12]} />
      <meshStandardMaterial
        color={worldPalette.success}
        emissive={worldPalette.success}
        emissiveIntensity={1.8}
      />
    </mesh>
  );
}
function Dome({ y }: { y: number }) {
  return (
    <mesh position={[0, y, 0]}>
      <sphereGeometry args={[1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial
        color={worldPalette.glass}
        transparent
        opacity={0.7}
        metalness={0.4}
        roughness={0.15}
      />
    </mesh>
  );
}
function Turbines({ y, width }: { y: number; width: number }) {
  return (
    <group position={[0, y, 0]}>
      {[-width * 0.28, width * 0.28].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[0.45, 0.13, 10, 20]} />
          <meshStandardMaterial color={worldPalette.amber} metalness={0.65} />
        </mesh>
      ))}
    </group>
  );
}
function SawRoof({ y, width }: { y: number; width: number }) {
  return (
    <group position={[0, y, 0]}>
      {[-width * 0.25, 0, width * 0.25].map((x) => (
        <mesh key={x} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.85, 0.15, 2.1]} />
          <meshStandardMaterial color={worldPalette.glass} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
function Crane({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.09, 2, 8]} />
        <meshStandardMaterial color={worldPalette.amber} />
      </mesh>
      <mesh position={[0.8, 0.9, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.1]} />
        <meshStandardMaterial color={worldPalette.amber} />
      </mesh>
    </group>
  );
}
function GridTowers({
  y,
  width,
  accent,
}: {
  y: number;
  width: number;
  accent: string;
}) {
  return (
    <group position={[0, y, 0]}>
      {[-width * 0.28, width * 0.28].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.14, 2, 8]} />
            <meshStandardMaterial color={worldPalette.metal} metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <octahedronGeometry args={[0.38]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
