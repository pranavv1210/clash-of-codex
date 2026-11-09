import { energyColor } from "../palette";
export function CrystalCluster({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {[-0.62, -0.3, 0, 0.34, 0.65].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.34 + (i % 3) * 0.2, Math.sin(i * 2.1) * 0.18]}
          rotation={[0.08 * Math.sin(i), i * 0.7, (i - 2) * 0.13]}
          scale={[
            0.78 + (i % 2) * 0.18,
            1.35 + (i % 3) * 0.58,
            0.78 + (i % 2) * 0.18,
          ]}
          castShadow
        >
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color={energyColor}
            emissive={energyColor}
            emissiveIntensity={2.4}
            roughness={0.18}
          />
        </mesh>
      ))}
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
