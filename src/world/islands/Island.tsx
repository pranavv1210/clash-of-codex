"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createIslandPlan, type IslandSize, type IslandTheme } from "./model";
import { createRng } from "../rng";
import { energyColor, worldPalette } from "../palette";
import { RockMaterial, SurfaceMaterial } from "../materials/RockMaterial";
import { createCliffGeometry } from "./cliffGeometry";
export function Island({
  seed,
  size = "M",
  theme = "grass",
  children,
}: {
  seed: string;
  size?: IslandSize;
  theme?: IslandTheme;
  children?: React.ReactNode;
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
      <RimWall radius={plan.radius} />
      <Roots seed={seed} radius={plan.radius} />
      {Array.from({ length: 7 }, (_, i) => {
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
      {Array.from({ length: 5 }, (_, i) => {
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
            <meshStandardMaterial color={worldPalette.rockDark} roughness={1} />
          </mesh>
        );
      })}
      {size !== "S" && <Waterfall radius={plan.radius} />}
      <group position={[0, 0.3, 0]}>{children}</group>
    </group>
  );
}
function RimWall({ radius }: { radius: number }) {
  return (
    <group position={[0, 0.62, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <torusGeometry args={[radius * 0.72, 0.13, 8, 64]} />
        <meshStandardMaterial color={worldPalette.paving} roughness={0.86} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius * 0.72,
              0.36,
              Math.sin(angle) * radius * 0.72,
            ]}
          >
            <cylinderGeometry args={[0.035, 0.045, 0.72, 7]} />
            <meshStandardMaterial
              color={worldPalette.metal}
              metalness={0.55}
              roughness={0.5}
            />
          </mesh>
        );
      })}
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
        <planeGeometry args={[0.92, 6.1, 2, 12]} />
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
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.07, 7, 24]} />
        <meshBasicMaterial
          color={worldPalette.white}
          transparent
          opacity={0.55}
        />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh
          key={i}
          position={[
            ((i % 6) - 2.5) * 0.15,
            -5.75 + (i % 3) * 0.13,
            (i % 4) * 0.08,
          ]}
        >
          <sphereGeometry args={[0.06 + (i % 3) * 0.025, 6, 5]} />
          <meshBasicMaterial
            color={worldPalette.white}
            transparent
            opacity={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}
