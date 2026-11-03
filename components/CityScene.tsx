"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import type { Project } from "@/types/inceptown";

type Props = {
  projects: Project[];
  selectedProjectId?: string;
  onSelect?: (id: string) => void;
  compact?: boolean;
};

function Building({ project, index, selected, onSelect }: {
  project: Project; index: number; total: number; selected: boolean; onSelect?: () => void;
}) {
  const columns = total <= 4 ? 2 : total <= 9 ? 3 : total <= 16 ? 4 : 5;
  const rows = Math.ceil(total / columns);
  const x = ((index % columns) - (columns - 1) / 2) * 5.4;
  const z = (Math.floor(index / columns) - (rows - 1) / 2) * 5.4;
  const floors = Math.max(3, Math.min(12, Math.ceil(Math.log2(project.files.length + project.commits / 12 + 2)) + 2));
  const height = floors * 0.48;
  const color = new THREE.Color(project.color || "#73F0C2");

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]} receiveShadow onClick={(event) => { event.stopPropagation(); onSelect?.(); }}>
        <boxGeometry args={[2.7, 0.24, 2.7]} />
        <meshStandardMaterial color={selected ? "#273B4C" : "#1B2A3C"} roughness={0.8} />
      </mesh>
      <mesh position={[0, height / 2 + 0.24, 0]} castShadow receiveShadow onClick={(event) => { event.stopPropagation(); onSelect?.(); }}>
        <boxGeometry args={[1.65, height, 1.65]} />
        <meshStandardMaterial color={selected ? color : "#33445A"} emissive={selected ? color : "#101827"} emissiveIntensity={selected ? 0.2 : 0.04} metalness={0.22} roughness={0.45} />
      </mesh>
      {Array.from({ length: floors }, (_, floor) => (
        <group key={floor} position={[0, 0.48 + floor * 0.48, 0]}>
          {[-0.47, 0, 0.47].map((offset, i) => (
            <mesh key={i} position={[offset, 0, 0.84]}>
              <boxGeometry args={[0.23, 0.19, 0.035]} />
              <meshBasicMaterial color={selected ? "#B9FFE8" : "#8BA4B7"} />
            </mesh>
          ))}
          {[-0.47, 0, 0.47].map((offset, i) => (
            <mesh key={i} position={[0.84, 0, offset]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.23, 0.19, 0.035]} />
              <meshBasicMaterial color={selected ? "#B9FFE8" : "#8BA4B7"} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, height + 0.36, 0]} castShadow>
        <boxGeometry args={[1.85, 0.12, 1.85]} />
        <meshStandardMaterial color={selected ? color : "#52677D"} emissive={selected ? color : "#172538"} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, height + 0.57, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 8]} />
        <meshStandardMaterial color={selected ? "#73F0C2" : "#788BFF"} emissive={selected ? "#73F0C2" : "#788BFF"} emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.02, 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 0.36]} />
        <meshBasicMaterial color={selected ? "#73F0C2" : "#52677D"} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}


function AgentCharacter({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.16}>
      <group position={position}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.28, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#E8F2F4" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.63, 0.115]}>
          <boxGeometry args={[0.13, 0.035, 0.025]} />
          <meshBasicMaterial color="#73F0C2" />
        </mesh>
        <mesh position={[-0.19, 0.34, 0]}>
          <capsuleGeometry args={[0.045, 0.18, 3, 6]} />
          <meshStandardMaterial color="#D9E6ED" />
        </mesh>
        <mesh position={[0.19, 0.34, 0]}>
          <capsuleGeometry args={[0.045, 0.18, 3, 6]} />
          <meshStandardMaterial color="#D9E6ED" />
        </mesh>
      </group>
    </Float>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.65, 6]} />
        <meshStandardMaterial color="#8B705A" />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#367E6A" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Scene({ projects, selectedProjectId, onSelect }: Props) {
  const trees = useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const x = ((i * 7) % 19) - 9;
    const z = ((i * 11) % 17) - 8;
    return [x, 0, z] as [number, number, number];
  }), []);

  return (
    <>
      <color attach="background" args={["#101827"]} />
      <fog attach="fog" args={["#101827", 24, 48]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[8, 15, 8]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-8, 7, -8]} intensity={18} color="#788BFF" distance={24} />
      <pointLight position={[8, 5, 8]} intensity={12} color="#73F0C2" distance={20} />
      <Stars radius={70} depth={35} count={650} factor={2.1} fade speed={0.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[44, 34]} />
        <meshStandardMaterial color="#172638" roughness={0.96} />
      </mesh>
      <gridHelper args={[40, 32, "#31465A", "#23364A"]} position={[0, 0.005, 0]} />
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, 34]} />
        <meshBasicMaterial color="#263A50" />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[2.1, 42]} />
        <meshBasicMaterial color="#263A50" />
      </mesh>
      {trees.map((position, i) => <Tree key={i} position={position} />)}
      {projects.slice(0, 25).map((project, index) => (
        <Building key={project.id} project={project} index={index} total={Math.min(projects.length, 25)} selected={project.id === selectedProjectId} onSelect={() => onSelect?.(project.id)} />
      ))}
      <AgentCharacter position={[-7.4, 0.05, 2.8]} color="#73F0C2" />
      <AgentCharacter position={[7.1, 0.05, -4.2]} color="#788BFF" />
      <AgentCharacter position={[2.2, 0.05, 7.2]} color="#FFB86B" />
      <OrbitControls makeDefault minDistance={9} maxDistance={32} maxPolarAngle={Math.PI / 2.05} minPolarAngle={0.35} enableDamping dampingFactor={0.08} />
    </>
  );
}

export default function CityScene(props: Props) {
  return (
    <div className={`city-canvas ${props.compact ? "city-canvas--compact" : ""}`}>
      <Canvas shadows dpr={[1, 1.7]} camera={{ position: [17, 17, 20], fov: 38 }} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
      <div className="city-canvas-hint"><span className="hint-dot" /> DRAG TO EXPLORE <span>·</span> SCROLL TO ZOOM</div>
    </div>
  );
}
