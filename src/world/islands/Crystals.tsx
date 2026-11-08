import { energyColor, type WorldStyle } from "../palette";
export function CrystalCluster({
  style = "cyan",
  scale = 1,
}: {
  style?: WorldStyle;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      {[-0.35, 0, 0.38].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.45 + (i % 2) * 0.28, 0]}
          rotation={[0, 0, (i - 1) * 0.18]}
          scale={[1, 1.8 + (i % 2) * 0.7, 1]}
          castShadow
        >
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color={energyColor(style)}
            emissive={energyColor(style)}
            emissiveIntensity={2.4}
            roughness={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}
