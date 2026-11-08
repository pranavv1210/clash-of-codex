"use client";
import * as THREE from "three";
import { worldPalette } from "../palette";
import { createRng } from "../rng";
export function Sky({ night = false }: { night?: boolean }) {
  const stars = createRng("stars");
  return (
    <>
      <color
        attach="background"
        args={[night ? worldPalette.skyZenith : worldPalette.skyMid]}
      />
      <fog
        attach="fog"
        args={[night ? worldPalette.skyZenith : worldPalette.fog, 45, 105]}
      />
      <mesh scale={95}>
        <sphereGeometry args={[1, 32, 24]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={{
            top: { value: new THREE.Color(worldPalette.skyZenith) },
            mid: {
              value: new THREE.Color(
                night ? worldPalette.skyMid : worldPalette.skyMid,
              ),
            },
            horizon: {
              value: new THREE.Color(
                night ? worldPalette.skyMid : worldPalette.horizon,
              ),
            },
          }}
          vertexShader={`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec3 p;uniform vec3 top;uniform vec3 mid;uniform vec3 horizon;void main(){float h=normalize(p).y;vec3 c=mix(horizon,mid,smoothstep(-.04,.10,h));c=mix(c,top,smoothstep(.10,.55,h));gl_FragColor=vec4(c,1.);}`}
        />
      </mesh>
      {Array.from({ length: night ? 140 : 55 }, (_, i) => {
        const a = stars() * Math.PI * 2,
          r = 45 + stars() * 35,
          y = 18 + stars() * 46;
        return (
          <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
            <sphereGeometry args={[0.04 + stars() * 0.06, 5, 5]} />
            <meshBasicMaterial
              color={worldPalette.white}
              transparent
              opacity={night ? 0.8 : 0.32}
            />
          </mesh>
        );
      })}
      <CloudSea />
    </>
  );
}
function CloudSea() {
  const rng = createRng("cloud-sea");
  return (
    <group>
      {Array.from({ length: 22 }, (_, i) => (
        <mesh
          key={i}
          position={[(rng() - 0.5) * 100, -13 - rng() * 5, (rng() - 0.5) * 100]}
          scale={[8 + rng() * 11, 0.7 + rng() * 0.8, 6 + rng() * 9]}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial
            color={worldPalette.white}
            transparent
            opacity={0.08 + rng() * 0.08}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
