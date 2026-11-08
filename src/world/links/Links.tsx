import { Line } from "@react-three/drei";
import { worldPalette } from "../palette";
export function Bridge({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const mid: [number, number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 - 0.25,
      (start[2] + end[2]) / 2,
    ],
    length = Math.hypot(end[0] - start[0], end[2] - start[2]),
    angle = Math.atan2(end[2] - start[2], end[0] - start[0]);
  return (
    <group position={mid} rotation={[0, -angle, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[length, 0.16, 1.25]} />
        <meshPhysicalMaterial
          color={worldPalette.glass}
          transparent
          opacity={0.58}
          roughness={0.16}
          metalness={0.25}
        />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <group key={z}>
          <Line
            points={[
              [-length / 2, 0.2, z],
              [0, 1.4, z],
              [length / 2, 0.2, z],
            ]}
            color={worldPalette.metal}
            lineWidth={2}
          />
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[-length / 2 + (i * length) / 6, 0.25, z]}>
              <cylinderGeometry args={[0.025, 0.025, 1.3, 6]} />
              <meshStandardMaterial color={worldPalette.metal} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
export function Monorail({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]),
    angle = Math.atan2(end[2] - start[2], end[0] - start[0]),
    mid: [number, number, number] = [
      (start[0] + end[0]) / 2,
      start[1] + 1,
      (start[2] + end[2]) / 2,
    ];
  return (
    <group position={mid} rotation={[0, -angle, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.15, 0.28]} />
        <meshStandardMaterial color={worldPalette.metal} metalness={0.75} />
      </mesh>
      <MonorailPod />
    </group>
  );
}
function MonorailPod() {
  return (
    <group position={[0, 0.42, 0]}>
      <mesh>
        <capsuleGeometry args={[0.32, 1.2, 6, 12]} />
        <meshStandardMaterial
          color={worldPalette.amber}
          metalness={0.38}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.12, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.25]} />
        <meshStandardMaterial
          color={worldPalette.glass}
          emissive={worldPalette.cyan}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}
export function SkyLift({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  return (
    <group>
      <Line points={[start, end]} color={worldPalette.strata} lineWidth={1} />
      {[0.3, 0.65].map((t) => (
        <mesh
          key={t}
          position={[
            start[0] + (end[0] - start[0]) * t,
            start[1] + (end[1] - start[1]) * t - 0.55,
            start[2] + (end[2] - start[2]) * t,
          ]}
        >
          <boxGeometry args={[0.65, 0.55, 0.55]} />
          <meshStandardMaterial color={worldPalette.cyan} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
