"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createIslandPlan, type IslandSize, type IslandTheme } from "./model";
import { createRng } from "../rng";
import { energyColor, worldPalette } from "../palette";
import { RockMaterial, SurfaceMaterial } from "../materials/RockMaterial";
import { createCliffGeometry } from "./cliffGeometry";
import type { QualityTier } from "../quality/tiers";
export function Island({
  seed,
  size = "M",
  theme = "grass",
  children,
  tier = "high",
}: {
  seed: string;
  size?: IslandSize;
  theme?: IslandTheme;
  children?: React.ReactNode;
  tier?: QualityTier;
}) {
  const plan = useMemo(() => createIslandPlan(seed, size), [seed, size]),
    shape = useMemo(() => {
      const s = new THREE.Shape();
      plan.footprint.forEach(([x, z], i) =>
        i ? s.lineTo(x, z) : s.moveTo(x, z),
      );
      s.closePath();
      return s;
    }, [plan]),
    rng = useMemo(() => createRng(seed + "debris"), [seed]),
    cliff = useMemo(
      () => createCliffGeometry(seed, plan.radius),
      [plan.radius, seed],
    );
  useEffect(() => () => cliff.dispose(), [cliff]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.26,
              bevelEnabled: true,
              bevelSize: 0.16,
              bevelThickness: 0.1,
              bevelSegments: 3,
            },
          ]}
        />
        <SurfaceMaterial kind={theme} />
      </mesh>
      <mesh
        position={[0, -0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: false }]} />
        <SurfaceMaterial kind="soil" />
      </mesh>
      <mesh geometry={cliff} castShadow receiveShadow>
        <RockMaterial />
      </mesh>
      {tier === "ultra" && <Roots seed={seed} radius={plan.radius} />}
      {tier === "ultra" &&
        Array.from({ length: 7 }, (_, i) => {
          const a = rng() * Math.PI * 2,
            r = plan.radius * (0.65 + rng() * 0.45);
          return (
            <group
              key={i}
              position={[Math.cos(a) * r, -1.4 - rng() * 2, Math.sin(a) * r]}
              rotation={[rng(), a, rng()]}
            >
              <mesh castShadow>
                <octahedronGeometry args={[0.25 + rng() * 0.4, 0]} />
                <meshStandardMaterial
                  color={energyColor}
                  emissive={energyColor}
                  emissiveIntensity={2.1}
                  roughness={0.22}
                />
              </mesh>
            </group>
          );
        })}
      {tier === "ultra" &&
        Array.from({ length: 5 }, (_, i) => {
          const a = rng() * Math.PI * 2,
            r = plan.radius * (1.2 + rng() * 0.35);
          return (
            <mesh
              key={`d${i}`}
              position={[Math.cos(a) * r, -2 - rng() * 3, Math.sin(a) * r]}
              rotation={[rng() * 2, rng() * 2, rng() * 2]}
              castShadow
            >
              <dodecahedronGeometry args={[0.25 + rng() * 0.45, 0]} />
              <meshStandardMaterial
                color={worldPalette.rockDark}
                roughness={1}
              />
            </mesh>
          );
        })}
      {tier !== "low" && size !== "S" && <Waterfall radius={plan.radius} />}
      <group position={[0, 0.3, 0]}>{children}</group>
    </group>
  );
}
function Roots({ seed, radius }: { seed: string; radius: number }) {
  const rng = createRng(`${seed}:roots`);
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => {
        const angle = rng() * Math.PI * 2;
        const length = 0.8 + rng() * 2.4;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius * 0.86,
              -0.7 - length / 2,
              Math.sin(angle) * radius * 0.86,
            ]}
            rotation={[0.05 * (rng() - 0.5), 0, 0.12 * (rng() - 0.5)]}
          >
            <cylinderGeometry args={[0.025, 0.09 + rng() * 0.08, length, 6]} />
            <meshStandardMaterial color={worldPalette.wood} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}
function Waterfall({ radius }: { radius: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.time.value = clock.elapsedTime;
  });
  return (
    <group
      position={[radius * 0.7, -0.5, radius * 0.58]}
      rotation={[0, -0.7, 0]}
    >
      <mesh position={[0, -2.65, 0]}>
        <planeGeometry args={[1.3, 6.1, 2, 12]} />
        <shaderMaterial
          ref={mat}
          uniforms={{
            time: { value: 0 },
            water: { value: new THREE.Color(worldPalette.water) },
          }}
          vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec2 vUv;uniform float time;uniform vec3 water;void main(){float flow=.55+.22*sin(vUv.y*34.-time*7.+sin(vUv.x*18.));float edge=smoothstep(0.,.16,vUv.x)*smoothstep(1.,.84,vUv.x);float fade=smoothstep(0.,.2,vUv.y)*smoothstep(1.,.58,vUv.y);gl_FragColor=vec4(water*(.72+flow*.35),edge*fade*.76);}`}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -2.65, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.05, 6.1, 2, 12]} />
        <shaderMaterial
          uniforms={{
            time: { value: 0 },
            water: { value: new THREE.Color(worldPalette.water) },
          }}
          vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec2 vUv;uniform vec3 water;void main(){float edge=smoothstep(0.,.2,vUv.x)*smoothstep(1.,.8,vUv.x);float streak=.68+.2*sin(vUv.y*27.+vUv.x*13.);float fade=smoothstep(0.,.2,vUv.y)*smoothstep(1.,.52,vUv.y);gl_FragColor=vec4(water*streak,edge*fade*.38);}`}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.07, 7, 24]} />
        <meshBasicMaterial
          color={worldPalette.white}
          transparent
          opacity={0.55}
        />
      </mesh>
      <MistInstances />
    </group>
  );
}

function MistInstances() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const object = new THREE.Object3D();
    for (let i = 0; i < 18; i++) {
      object.position.set(
        ((i % 6) - 2.5) * 0.15,
        -5.75 + (i % 3) * 0.13,
        (i % 4) * 0.08,
      );
      object.scale.setScalar(0.06 + (i % 3) * 0.025);
      object.updateMatrix();
      ref.current?.setMatrixAt(i, object.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 18]}>
      <sphereGeometry args={[1, 6, 5]} />
      <meshBasicMaterial
        color={worldPalette.white}
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
