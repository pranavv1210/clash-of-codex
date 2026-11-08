import { worldPalette } from "../palette";
import { createRng } from "../rng";
export function Nature({
  seed,
  count = 12,
  radius = 6,
}: {
  seed: string;
  count?: number;
  radius?: number;
}) {
  const rng = createRng(seed);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = rng() * Math.PI * 2,
          r = radius * (0.45 + rng() * 0.4),
          s = 0.7 + rng() * 0.55;
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
            scale={s}
          >
            <mesh position={[0, 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 1, 7]} />
              <meshStandardMaterial color={worldPalette.wood} />
            </mesh>
            <mesh position={[0, 1.32, 0]} castShadow>
              <icosahedronGeometry args={[0.62, 1]} />
              <meshStandardMaterial color={worldPalette.grass} roughness={1} />
            </mesh>
            <mesh position={[0.28, 1.5, 0]} castShadow>
              <icosahedronGeometry args={[0.35, 1]} />
              <meshStandardMaterial
                color={worldPalette.success}
                roughness={1}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
