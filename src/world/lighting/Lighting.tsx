import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { worldPalette } from "../palette";
import type { QualityTier } from "../quality/tiers";
import { qualityTiers } from "../quality/tiers";
export function Lighting({
  night,
  tier,
}: {
  night: boolean;
  tier: QualityTier;
}) {
  const q = qualityTiers[tier];
  return (
    <>
      <ambientLight intensity={night ? 0.42 : 0.68} />
      <hemisphereLight
        args={[worldPalette.skyMid, worldPalette.rockDark, night ? 0.72 : 1.38]}
      />
      <directionalLight
        position={[-26, 36, 20]}
        intensity={night ? 1.4 : 3.1}
        color={worldPalette.sun}
        castShadow
        shadow-mapSize={[q.shadows, q.shadows]}
        shadow-bias={-0.0002}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-42, 42, 42, -42, 0.1, 100]}
        />
      </directionalLight>
      <directionalLight
        position={[24, 15, -26]}
        intensity={night ? 0.55 : 1.15}
        color={worldPalette.skyMid}
      />
      <Environment resolution={128}>
        <Lightformer
          intensity={2.5}
          color={worldPalette.sun}
          position={[-20, 20, 10]}
          scale={[18, 18, 1]}
        />
        <Lightformer
          intensity={1.5}
          color={worldPalette.cyan}
          position={[20, 8, -20]}
          scale={[15, 12, 1]}
        />
      </Environment>
      <ContactShadows
        position={[0, -9, 0]}
        scale={80}
        opacity={0.2}
        blur={2.5}
        far={35}
      />
      {q.post && (
        <EffectComposer multisampling={tier === "ultra" ? 4 : 0}>
          <Bloom
            luminanceThreshold={1}
            mipmapBlur
            intensity={night ? 0.75 : 0.4}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.45} />
        </EffectComposer>
      )}
    </>
  );
}
