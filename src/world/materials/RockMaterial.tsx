"use client";
import { useKTX2 } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { worldPalette } from "../palette";

const rockPaths = {
  cliffColor: "/assets/textures/dark_rock_diff_1k.ktx2",
  cliffNormal: "/assets/textures/dark_rock_nor_gl_1k.ktx2",
  cliffOrm: "/assets/textures/dark_rock_orm_1k.ktx2",
  strataColor: "/assets/textures/quarry_wall_02_diff_1k.ktx2",
  strataNormal: "/assets/textures/quarry_wall_02_nor_gl_1k.ktx2",
  strataOrm: "/assets/textures/quarry_wall_02_orm_1k.ktx2",
};

export function RockMaterial() {
  const maps = useKTX2(rockPaths, "/basis/");
  const material = useMemo(() => {
    for (const [name, texture] of Object.entries(maps)) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = name.endsWith("Color")
        ? THREE.SRGBColorSpace
        : THREE.NoColorSpace;
      texture.anisotropy = 4;
    }
    const value = new THREE.MeshStandardMaterial({
      color: worldPalette.white,
      roughness: 0.95,
      vertexColors: true,
    });
    value.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, {
        cliffColor: { value: maps.cliffColor },
        cliffNormal: { value: maps.cliffNormal },
        cliffOrm: { value: maps.cliffOrm },
        strataColor: { value: maps.strataColor },
        strataNormal: { value: maps.strataNormal },
        strataOrm: { value: maps.strataOrm },
        energyTint: { value: new THREE.Color(worldPalette.cyan) },
      });
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vWorldPositionRock;\nvarying vec3 vWorldNormalRock;",
        )
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nvWorldPositionRock=(modelMatrix*vec4(transformed,1.)).xyz;\nvWorldNormalRock=normalize(mat3(modelMatrix)*objectNormal);",
        );
      const helpers = `varying vec3 vWorldPositionRock; varying vec3 vWorldNormalRock;
uniform sampler2D cliffColor; uniform sampler2D cliffNormal; uniform sampler2D cliffOrm;
uniform sampler2D strataColor; uniform sampler2D strataNormal; uniform sampler2D strataOrm; uniform vec3 energyTint;
vec3 triWeights(vec3 n){vec3 w=pow(abs(n),vec3(6.));return w/max(dot(w,vec3(1.)),.001);}
vec3 triSample(sampler2D tex,vec3 p,vec3 n){vec3 w=triWeights(n);return texture2D(tex,p.yz).rgb*w.x+texture2D(tex,p.xz).rgb*w.y+texture2D(tex,p.xy).rgb*w.z;}
vec3 triNormal(sampler2D tex,vec3 p,vec3 n){vec3 w=triWeights(n);vec3 x=texture2D(tex,p.yz).xyz*2.-1.;vec3 y=texture2D(tex,p.xz).xyz*2.-1.;vec3 z=texture2D(tex,p.xy).xyz*2.-1.;x=vec3(x.z,x.y,x.x)*sign(n.x);y=vec3(y.x,y.z,y.y)*sign(n.y);z=vec3(z.x,z.y,z.z)*sign(n.z);return normalize(x*w.x+y*w.y+z*w.z+n);}`;
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${helpers}`)
        .replace(
          "#include <map_fragment>",
          `vec3 wp=vWorldPositionRock*.18; vec3 wn=normalize(vWorldNormalRock);
vec3 cliff=triSample(cliffColor,wp,wn); vec3 strata=triSample(strataColor,vec3(wp.x*.72,vWorldPositionRock.y*.42,wp.z*.72),wn);
float macro=.5+.5*sin(wp.x*.73+sin(wp.z*.51)); float bands=.5+.5*sin(vWorldPositionRock.y*7.5+macro*1.8); float slope=1.-clamp(wn.y,0.,1.);
vec3 rock=mix(cliff,strata,clamp(.18+bands*.42+slope*.45,0.,1.)); float wet=smoothstep(-6.,-2.2,vWorldPositionRock.y);
rock*=mix(.72,1.18,wet)*mix(.92,1.22,macro); float moss=smoothstep(.52,.9,wn.y)*smoothstep(-.25,.8,vWorldPositionRock.y)*smoothstep(.42,.7,macro);
rock=mix(rock,vec3(.20,.31,.22),moss*.55); float energy=pow(max(0.,1.-length(vWorldPositionRock.xz)/8.),5.)*smoothstep(-5.,-1.,-vWorldPositionRock.y);
diffuseColor.rgb*=rock*1.22; totalEmissiveRadiance+=energyTint*energy*.09;`,
        )
        .replace(
          "#include <normal_fragment_maps>",
          `vec3 normalA=triNormal(cliffNormal,vWorldPositionRock*.18,normalize(vWorldNormalRock));
vec3 normalB=triNormal(strataNormal,vec3(vWorldPositionRock.x*.13,vWorldPositionRock.y*.42,vWorldPositionRock.z*.13),normalize(vWorldNormalRock));
normal=normalize((viewMatrix*vec4(normalize(mix(normalA,normalB,.5+.25*sin(vWorldPositionRock.y*7.5))),0.)).xyz);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
vec3 ormA=triSample(cliffOrm,vWorldPositionRock*.18,normalize(vWorldNormalRock));
vec3 ormB=triSample(strataOrm,vec3(vWorldPositionRock.x*.13,vWorldPositionRock.y*.42,vWorldPositionRock.z*.13),normalize(vWorldNormalRock));
vec3 rockOrm=mix(ormA,ormB,.5+.5*sin(vWorldPositionRock.y*7.5)); roughnessFactor*=clamp(rockOrm.g,.38,1.);`,
        )
        .replace(
          "#include <aomap_fragment>",
          "reflectedLight.indirectDiffuse*=mix(1.,rockOrm.r,.72);",
        );
    };
    value.customProgramCacheKey = () => "codex-triplanar-rock-pbr-v3";
    return value;
  }, [maps]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}

export type SurfaceKind =
  "grass" | "paved" | "garden" | "tech" | "stone" | "soil";
const surfaceAssets: Record<SurfaceKind, string> = {
  grass: "leafy_grass",
  paved: "concrete_pavement",
  garden: "brown_mud_02",
  tech: "metal_plate",
  stone: "concrete_wall_007",
  soil: "brown_mud_02",
};
export function SurfaceMaterial({ kind }: { kind: SurfaceKind }) {
  const asset = surfaceAssets[kind];
  const maps = useKTX2(
    {
      color: `/assets/textures/${asset}_diff_1k.ktx2`,
      normal: `/assets/textures/${asset}_nor_gl_1k.ktx2`,
      orm: `/assets/textures/${asset}_orm_1k.ktx2`,
    },
    "/basis/",
  );
  for (const [name, texture] of Object.entries(maps)) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(kind === "grass" ? 3 : 2, kind === "grass" ? 3 : 2);
    texture.colorSpace =
      name === "color" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  }
  return (
    <meshStandardMaterial
      map={maps.color}
      normalMap={maps.normal}
      normalScale={new THREE.Vector2(0.75, 0.75)}
      aoMap={maps.orm}
      aoMapIntensity={0.8}
      roughnessMap={maps.orm}
      roughness={kind === "tech" ? 0.8 : 1}
      metalnessMap={maps.orm}
      metalness={kind === "tech" ? 0.5 : 0}
    />
  );
}
