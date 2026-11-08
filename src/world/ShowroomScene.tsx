"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Island } from "./islands/Island";
import { CrystalCluster } from "./islands/Crystals";
import { Building } from "./buildings/BuildingFactory";
import { Nature } from "./nature/Nature";
import { Bridge, Monorail, SkyLift } from "./links/Links";
import { Airship, CargoDrone } from "./vehicles/Vehicles";
import { CrewStandIn, type CrewRole } from "./characters/Crew";
import { HoloSign, Lamp } from "./props/Props";
import { Sky } from "./sky/Sky";
import { Lighting } from "./lighting/Lighting";
import { CityCamera, type CameraPreset } from "./camera/CityCamera";
import { PerfMonitor, type PerfSample } from "./perf/PerfMonitor";
import { qualityTiers, type QualityTier } from "./quality/tiers";
import { worldPalette, type WorldStyle } from "./palette";
type Props = {
  seed: string;
  style: WorldStyle;
  night: boolean;
  tier: QualityTier;
  preset: CameraPreset;
  wireframe: boolean;
  onPerf: (s: PerfSample) => void;
  onReady: () => void;
};
const islands = [
  {
    p: [0, 0, 0],
    size: "HQ",
    theme: "paved",
    buildings: [
      ["hq", 0, 0],
      ["dev", -4, 2],
      ["dev", 4, -2],
    ],
  },
  {
    p: [-18, 1, -8],
    size: "M",
    theme: "grass",
    buildings: [
      ["dev", 0, 0],
      ["home", 3, 2],
      ["workshop", -3, -1],
    ],
  },
  {
    p: [19, -1, -7],
    size: "M",
    theme: "tech",
    buildings: [
      ["data", 0, 0],
      ["grid", 3, -2],
      ["control", -3, 2],
    ],
  },
  {
    p: [-15, -2, 14],
    size: "M",
    theme: "garden",
    buildings: [
      ["library", 0, 0],
      ["studio", 3, -2],
    ],
  },
  {
    p: [16, 1, 15],
    size: "M",
    theme: "paved",
    buildings: [
      ["comms", 0, 0],
      ["test", -3, 2],
    ],
  },
  { p: [0, -3, 25], size: "S", theme: "stone", buildings: [["grid", 0, 0]] },
] as const;
function Wireframe({ enabled }: { enabled: boolean }) {
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    const material = enabled
      ? new THREE.MeshBasicMaterial({
          color: worldPalette.cyan,
          wireframe: true,
        })
      : null;
    scene.overrideMaterial = material;
    return () => {
      scene.overrideMaterial = null;
      material?.dispose();
    };
  }, [enabled, scene]);
  return null;
}
function SceneReady({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}
export default function ShowroomScene(props: Props) {
  const q = qualityTiers[props.tier],
    roles: CrewRole[] = [
      "Engineer",
      "Architect",
      "Tester",
      "Reviewer",
      "Researcher",
    ];
  return (
    <Canvas
      shadows
      dpr={[1, q.dpr]}
      camera={{ position: [42, 34, 48], fov: 38, near: 0.1, far: 180 }}
      gl={{ antialias: true, toneMapping: 3, outputColorSpace: "srgb" }}
    >
      <Suspense fallback={null}>
        <Sky night={props.night} />
        <Lighting night={props.night} tier={props.tier} />
        {islands.map((island, i) => (
          <group key={i} position={island.p as [number, number, number]}>
            <Island
              seed={`${props.seed}-${i}`}
              size={island.size}
              theme={island.theme}
              style={props.style}
            >
              {island.buildings.map((b, j) => (
                <group key={j} position={[b[1], 0, b[2]]}>
                  <Building
                    archetype={b[0]}
                    seed={`${props.seed}-${i}-${j}`}
                    style={props.style}
                    night={props.night}
                  />
                </group>
              ))}
              <Nature
                seed={`${props.seed}-nature-${i}`}
                count={Math.max(3, Math.round(q.trees / islands.length))}
                radius={island.size === "HQ" ? 10 : 6}
              />
              {roles.slice(0, i === 0 ? 5 : 1).map((role, j) => (
                <CrewStandIn
                  key={role}
                  role={role}
                  position={[-3 + j * 1.4, 0, 4]}
                />
              ))}
              <CrystalCluster style={props.style} scale={0.75} />
              <Lamp position={[4, 0, 4]} />
              <HoloSign position={[-4, 0, -4]} label="" />
            </Island>
          </group>
        ))}
        <Bridge start={[-10, 0.6, 0]} end={[-12, 0.6, -6]} />
        <Bridge start={[10, 0.6, 2]} end={[13, 0.6, 11]} />
        <Monorail start={[-10, 1, 4]} end={[-11, 1, 12]} />
        <SkyLift start={[10, 5, -2]} end={[14, 4, -6]} />
        <Airship />
        <CargoDrone />
        <CargoDrone offset={2.5} />
        <CityCamera preset={props.preset} />
        <PerfMonitor onSample={props.onPerf} />
        <Wireframe enabled={props.wireframe} />
        <SceneReady onReady={props.onReady} />
      </Suspense>
    </Canvas>
  );
}
