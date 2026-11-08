import { worldPalette } from "../palette";
export type CrewRole =
  "Engineer" | "Architect" | "Tester" | "Reviewer" | "Researcher";
const colors = {
  Engineer: worldPalette.amber,
  Architect: worldPalette.cyan,
  Tester: worldPalette.success,
  Reviewer: worldPalette.studio,
  Researcher: worldPalette.library,
};
export function CrewStandIn({
  role,
  position,
}: {
  role: CrewRole;
  position: [number, number, number];
}) {
  return (
    <group position={position} scale={0.7}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.52, 6, 10]} />
        <meshStandardMaterial color={colors[role]} roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color={worldPalette.library} />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.27, 0.22, 0.12, 12]} />
        <meshStandardMaterial color={colors[role]} />
      </mesh>
    </group>
  );
}
