"use client";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { worldPalette } from "../palette";
import { createRng } from "../rng";

function Instances({
  kind,
  count,
  night,
}: {
  kind: "stars" | "clouds";
  count: number;
  night: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cloudMaterial = useRef<THREE.ShaderMaterial>(null);
  const matrices = useMemo(() => {
    const rng = createRng(kind),
      object = new THREE.Object3D();
    return Array.from({ length: count }, () => {
      if (kind === "stars") {
        const a = rng() * Math.PI * 2,
          r = 45 + rng() * 35;
        object.position.set(Math.cos(a) * r, 18 + rng() * 46, Math.sin(a) * r);
        object.scale.setScalar(0.04 + rng() * 0.06);
      } else {
        object.position.set(
          (rng() - 0.5) * 100,
          -13 - rng() * 5,
          (rng() - 0.5) * 100,
        );
        object.scale.set(8 + rng() * 11, 0.7 + rng() * 0.8, 6 + rng() * 9);
      }
      object.updateMatrix();
      return object.matrix.clone();
    });
  }, [count, kind]);
  useLayoutEffect(() => {
    matrices.forEach((matrix, index) =>
      ref.current?.setMatrixAt(index, matrix),
    );
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  useFrame(({ clock }) => {
    if (kind === "clouds" && ref.current) {
      ref.current.position.x = Math.sin(clock.elapsedTime * 0.025) * 1.8;
      if (cloudMaterial.current)
        cloudMaterial.current.uniforms.time.value = clock.elapsedTime;
    }
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled>
      {kind === "stars" ? (
        <sphereGeometry args={[1, 5, 5]} />
      ) : (
        <sphereGeometry args={[1, 16, 10]} />
      )}
      {kind === "stars" ? (
        <meshBasicMaterial
          color={worldPalette.white}
          transparent
          opacity={night ? 0.8 : 0.32}
          depthWrite={false}
        />
      ) : (
        <shaderMaterial
          ref={cloudMaterial}
          transparent
          depthWrite={false}
          uniforms={{
            time: { value: 0 },
            light: { value: new THREE.Color(worldPalette.horizon) },
            shadow: { value: new THREE.Color(worldPalette.skyZenith) },
          }}
          vertexShader={`varying vec3 n;varying vec3 v;varying vec3 p;void main(){vec4 mv=modelViewMatrix*instanceMatrix*vec4(position,1.);n=normalize(normalMatrix*mat3(instanceMatrix)*normal);v=normalize(-mv.xyz);p=position;gl_Position=projectionMatrix*mv;}`}
          fragmentShader={`varying vec3 n;varying vec3 v;varying vec3 p;uniform float time;uniform vec3 light;uniform vec3 shadow;void main(){float edge=pow(max(dot(n,v),0.),1.35);float noise=.72+.28*sin(p.x*5.+sin(p.z*7.+time*.05));float top=smoothstep(-.35,.65,n.y);vec3 c=mix(shadow,light,top*.62);float a=smoothstep(.02,.18,edge*noise*.22)*.2;gl_FragColor=vec4(c,a);}`}
        />
      )}
    </instancedMesh>
  );
}

export function Sky({ night = false }: { night?: boolean }) {
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
            mid: { value: new THREE.Color(worldPalette.skyMid) },
            horizon: {
              value: new THREE.Color(
                night ? worldPalette.skyMid : worldPalette.horizon,
              ),
            },
            glow: { value: new THREE.Color(worldPalette.horizonGlow) },
          }}
          vertexShader={`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec3 p;uniform vec3 top;uniform vec3 mid;uniform vec3 horizon;uniform vec3 glow;void main(){float h=normalize(p).y;vec3 c=mix(horizon,mid,smoothstep(-.02,.16,h));c=mix(c,top,smoothstep(.18,.72,h));float band=exp(-pow((h-.015)*18.,2.));c=mix(c,glow,band*.46);gl_FragColor=vec4(c,1.);}`}
        />
      </mesh>
      <Instances kind="stars" count={night ? 140 : 55} night={night} />
      <Instances kind="clouds" count={22} night={night} />
    </>
  );
}
