"use client";
import { useKTX2 } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { worldPalette } from "../palette";

const paths = {
  cliff: "/assets/textures/dark_rock_diff_1k.ktx2",
  strata: "/assets/textures/quarry_wall_02_diff_1k.ktx2",
};

export function RockMaterial() {
  const maps = useKTX2(paths, "/basis/");
  const material = useMemo(() => {
    for (const texture of Object.values(maps)) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
    }
    const value = new THREE.MeshStandardMaterial({
      color: worldPalette.white,
      roughness: 0.93,
      metalness: 0,
    });
    value.onBeforeCompile = (shader) => {
      shader.uniforms.cliffMap = { value: maps.cliff };
      shader.uniforms.strataMap = { value: maps.strata };
      shader.uniforms.energyTint = {
        value: new THREE.Color(worldPalette.cyan),
      };
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vWorldPositionRock;\nvarying vec3 vWorldNormalRock;",
        )
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nvWorldPositionRock = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWorldNormalRock = normalize(mat3(modelMatrix) * objectNormal);",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vWorldPositionRock;\nvarying vec3 vWorldNormalRock;\nuniform sampler2D cliffMap;\nuniform sampler2D strataMap;\nuniform vec3 energyTint;\nvec3 triSample(sampler2D tex, vec3 p, vec3 n){vec3 w=pow(abs(n),vec3(5.));w/=max(dot(w,vec3(1.)),.001);return texture2D(tex,p.yz).rgb*w.x+texture2D(tex,p.xz).rgb*w.y+texture2D(tex,p.xy).rgb*w.z;}",
        )
        .replace(
          "#include <map_fragment>",
          `vec3 wp=vWorldPositionRock*.18;
           vec3 wn=normalize(vWorldNormalRock);
           vec3 cliff=triSample(cliffMap,wp,wn);
           vec3 strata=triSample(strataMap,vec3(wp.x*.72,vWorldPositionRock.y*.42,wp.z*.72),wn);
           float macro=.5+.5*sin(wp.x*.73+sin(wp.z*.51));
           float bands=.5+.5*sin(vWorldPositionRock.y*7.5+macro*1.8);
           float slope=1.-clamp(wn.y,0.,1.);
           float blend=clamp(.18+bands*.42+slope*.45,0.,1.);
           vec3 rock=mix(cliff,strata,blend);
           float wet=smoothstep(-6.,-2.2,vWorldPositionRock.y);
           rock*=mix(.72,1.18,wet)*mix(.92,1.22,macro);
           float moss=smoothstep(.52,.9,wn.y)*smoothstep(-.25,.8,vWorldPositionRock.y)*smoothstep(.42,.7,macro);
           rock=mix(rock,vec3(.20,.31,.22),moss*.55);
           float energy=pow(max(0.,1.-length(vWorldPositionRock.xz)/8.),5.)*smoothstep(-5.,-1.,-vWorldPositionRock.y);
           diffuseColor.rgb*=rock*1.22;
           totalEmissiveRadiance+=energyTint*energy*.09;`,
        );
    };
    value.customProgramCacheKey = () => "codex-triplanar-rock-v2";
    return value;
  }, [maps]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}

export type SurfaceKind =
  "grass" | "paved" | "garden" | "tech" | "stone" | "soil";
const surfacePaths: Record<SurfaceKind, string> = {
  grass: "/assets/textures/leafy_grass_diff_1k.ktx2",
  paved: "/assets/textures/concrete_pavement_diff_1k.ktx2",
  garden: "/assets/textures/brown_mud_02_diff_1k.ktx2",
  tech: "/assets/textures/metal_plate_diff_1k.ktx2",
  stone: "/assets/textures/concrete_wall_007_diff_1k.ktx2",
  soil: "/assets/textures/brown_mud_02_diff_1k.ktx2",
};
export function SurfaceMaterial({ kind }: { kind: SurfaceKind }) {
  const texture = useKTX2(surfacePaths[kind], "/basis/");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === "grass" ? 3 : 2, kind === "grass" ? 3 : 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <meshStandardMaterial
      map={texture}
      roughness={kind === "tech" ? 0.58 : 0.9}
      metalness={kind === "tech" ? 0.35 : 0}
    />
  );
}
