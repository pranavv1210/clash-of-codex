import { worldPalette } from "../palette";
export function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 1.4, 8]} />
        <meshStandardMaterial color={worldPalette.metal} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial
          color={worldPalette.windows}
          emissive={worldPalette.windows}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}
export function HoloSign({
  position,
}: {
  position: [number, number, number];
  label: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.07, 1.3, 0.07]} />
        <meshStandardMaterial color={worldPalette.metal} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.2, 0.45, 0.06]} />
        <meshStandardMaterial
          color={worldPalette.glass}
          emissive={worldPalette.cyan}
          emissiveIntensity={1.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
