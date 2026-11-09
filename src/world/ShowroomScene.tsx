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
import { worldPalette } from "./palette";
import { showroomComposition } from "./composition";
type Props = {
  seed: string;
  night: boolean;
  tier: QualityTier;
  preset: CameraPreset;
  wireframe: boolean;
  onPerf: (s: PerfSample) => void;
  onReady: () => void;
};
const islands = [
  {
    p: showroomComposition.hero,
    size: "HQ",
    theme: "paved",
    buildings: [
      ["hq", 0, 0],
      ["dev", -4, 2],
      ["dev", 4, -2],
    ],
  },
  {
    p: showroomComposition.orbit[0],
    size: "M",
    theme: "grass",
    buildings: [
      ["dev", 0, 0],
      ["home", 3, 2],
      ["workshop", -3, -1],
    ],
  },
  {
    p: showroomComposition.orbit[1],
    size: "M",
    theme: "tech",
    buildings: [
      ["data", 0, 0],
      ["grid", 3, -2],
      ["control", -3, 2],
    ],
  },
  {
    p: showroomComposition.orbit[2],
    size: "M",
    theme: "garden",
    buildings: [
      ["library", 0, 0],
      ["studio", 3, -2],
    ],
  },
  {
    p: showroomComposition.orbit[3],
    size: "M",
    theme: "paved",
    buildings: [
      ["comms", 0, 0],
      ["test", -3, 2],
    ],
  },
  {
    p: showroomComposition.orbit[4],
    size: "S",
    theme: "stone",
    buildings: [["grid", 0, 0]],
  },
  { p: showroomComposition.distant, size: "M", theme: "grass", buildings: [] },
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
      shadows={props.tier !== "low"}
      dpr={[1, q.dpr]}
      camera={{ position: [42, 34, 48], fov: 38, near: 0.1, far: 180 }}
      gl={{ antialias: true, toneMapping: 3, outputColorSpace: "srgb" }}
      onCreated={({ gl }) => {
        const context = gl.getContext();
        const create = context.createFramebuffer.bind(context);
        const remove = context.deleteFramebuffer.bind(context);
        const active = new Set<WebGLFramebuffer>();
        context.createFramebuffer = () => {
          const framebuffer = create();
          if (framebuffer) active.add(framebuffer);
          (
            window as typeof window & { __RENDER_TARGET_COUNT__?: number }
          ).__RENDER_TARGET_COUNT__ = active.size;
          return framebuffer;
        };
        context.deleteFramebuffer = (framebuffer) => {
          if (framebuffer) active.delete(framebuffer);
          (
            window as typeof window & { __RENDER_TARGET_COUNT__?: number }
          ).__RENDER_TARGET_COUNT__ = active.size;
          return remove(framebuffer);
        };
        (
          window as typeof window & { __RENDER_TARGET_COUNT__?: number }
        ).__RENDER_TARGET_COUNT__ = 0;
      }}
    >
      <Suspense fallback={null}>
        <Sky night={props.night} />
        <Lighting night={props.night} tier={props.tier} />
        {islands.map((island, i) => (
          <group
            key={i}
            position={island.p as [number, number, number]}
            name="category:islands"
          >
            <Island
              seed={`${props.seed}-${i}`}
              size={island.size}
              theme={island.theme}
              tier={props.tier}
            >
              {island.buildings.map((b, j) => (
                <group
                  key={j}
                  position={[b[1], 0, b[2]]}
                  name="category:buildings"
                >
                  <Building
                    archetype={b[0]}
                    seed={`${props.seed}-${i}-${j}`}
                    night={props.night}
                    simplified={props.tier === "low"}
                  />
                </group>
              ))}
              {props.tier === "ultra" && (
                <group name="category:nature">
                  <Nature
                    seed={`${props.seed}-nature-${i}`}
                    count={Math.max(3, Math.round(q.trees / islands.length))}
                    radius={island.size === "HQ" ? 10 : 6}
                  />
                </group>
              )}
              {props.tier === "ultra" &&
                roles
                  .slice(0, i === 0 ? 5 : i < 6 ? 1 : 0)
                  .map((role, j) => (
                    <CrewStandIn
                      key={role}
                      role={role}
                      position={[-3 + j * 1.4, 0, 4]}
                    />
                  ))}
              {props.tier !== "low" && (i === 0 || props.tier === "ultra") && (
                <group position={[6, 0, 0]} name="category:crystals">
                  <CrystalCluster scale={0.75} />
                </group>
              )}
              {props.tier === "ultra" && <Lamp position={[4, 0, 4]} />}
              {props.tier === "ultra" && (
                <HoloSign position={[-4, 0, -4]} label="" />
              )}
            </Island>
          </group>
        ))}
        {props.tier !== "low" && (
          <group name="category:links">
            <Bridge start={[-11, 4.6, -3]} end={[-22, 1.6, -9]} />
            <Bridge start={[11, 4.6, -4]} end={[23, -0.4, -10]} />
          </group>
        )}
        {props.tier !== "low" && (
          <Monorail start={[-10, 4.8, 5]} end={[-19, -2.2, 20]} />
        )}
        {props.tier !== "low" && (
          <SkyLift start={[10, 8, 3]} end={[22, 4, 20]} />
        )}
        {props.tier !== "low" && <Airship />}
        {props.tier !== "low" && <CargoDrone />}
        {props.tier !== "low" && <CargoDrone offset={2.5} />}
        <CityCamera preset={props.preset} />
        <PerfMonitor onSample={props.onPerf} />
        <Wireframe enabled={props.wireframe} />
        <SceneReady onReady={props.onReady} />
      </Suspense>
    </Canvas>
  );
}
