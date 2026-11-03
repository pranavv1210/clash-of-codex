"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { Project, RepoFile } from "@/types/inceptown";

type Props = {
  projects: Project[];
  selectedProjectId?: string;
  selectedFilePath?: string;
  onSelect?: (id: string) => void;
  onSelectFile?: (projectId: string, path: string) => void;
  compact?: boolean;
};

const palette: Record<string, string> = {
  ts: "#65DDB5", tsx: "#65DDB5", js: "#F4C96B", jsx: "#F4C96B",
  py: "#78A9F8", dart: "#63C7E8", go: "#73D5D0", rs: "#F09A75",
  java: "#E99A70", kt: "#B69AF5", swift: "#F28F75", css: "#B59AFF",
  scss: "#E68DBB", html: "#E9A36D", json: "#E6C76F", md: "#B6C5D4",
  yml: "#9AAEC5", yaml: "#9AAEC5", sql: "#7CB6F5", sh: "#92C78A",
  svg: "#E6B56C", png: "#A7C98A", lock: "#8494A8", default: "#7D9AAE",
};

function extensionOf(path: string) {
  const name = path.split("/").pop() || "";
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "default";
}

function fileColor(file: RepoFile) {
  return palette[extensionOf(file.path)] || palette.default;
}

function BuildingWindows({ color, selected }: { color: string; selected: boolean }) {
  return (
    <>
      {[-0.2, 0.2].map((x) => [-0.2, 0.2].map((y) => (
        <mesh key={x + ":" + y} position={[x, y, 0.371]}>
          <boxGeometry args={[0.13, 0.13, 0.025]} />
          <meshBasicMaterial color={selected ? "#F4FFF9" : color} />
        </mesh>
      )))}
      {[-0.2, 0.2].map((x) => [-0.2, 0.2].map((z) => (
        <mesh key={"side:" + x + ":" + z} position={[0.371, x, z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.13, 0.13, 0.025]} />
          <meshBasicMaterial color={selected ? "#F4FFF9" : color} />
        </mesh>
      )))}
    </>
  );
}

function FileBuilding({ file, position, selected, onClick }: {
  file: RepoFile; position: [number, number, number]; selected: boolean; onClick?: () => void;
}) {
  const color = fileColor(file);
  const size = file.size || 1800;
  const height = Math.max(0.42, Math.min(2.6, 0.38 + Math.log2(size / 350 + 1) * 0.42));
  const bodyColor = selected ? "#D8FFF0" : "#26394C";

  return (
    <group position={position} onClick={(event) => { event.stopPropagation(); onClick?.(); }}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.16, 0.92]} />
        <meshStandardMaterial color={selected ? "#315C59" : "#1C2B3A"} roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2 + 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.66, height, 0.66]} />
        <meshStandardMaterial color={bodyColor} emissive={color} emissiveIntensity={selected ? 0.28 : 0.07} roughness={0.62} metalness={0.12} />
      </mesh>
      <group position={[0, height / 2 + 0.16, 0]}>
        <BuildingWindows color={color} selected={selected} />
      </group>
      <mesh position={[0, height + 0.22, 0]} castShadow>
        <boxGeometry args={[0.78, 0.12, 0.78]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.65 : 0.18} roughness={0.5} />
      </mesh>
      {selected && <pointLight position={[0, height + 0.7, 0]} color={color} intensity={0.8} distance={3} />}
    </group>
  );
}

function CompanyTower({ project, center, selected, onClick }: {
  project: Project; center: [number, number, number]; selected: boolean; onClick?: () => void;
}) {
  const floors = Math.max(3, Math.min(10, Math.ceil(Math.log2(project.files.length + project.commits / 12 + 2)) + 1));
  const height = floors * 0.58;
  const color = project.color || "#65DDB5";
  return (
    <group position={center} onClick={(event) => { event.stopPropagation(); onClick?.(); }}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[2.65, 0.24, 2.65]} />
        <meshStandardMaterial color="#26394A" roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2 + 0.24, 0]} castShadow>
        <boxGeometry args={[1.55, height, 1.55]} />
        <meshStandardMaterial color="#314B5A" metalness={0.35} roughness={0.38} emissive={color} emissiveIntensity={selected ? 0.2 : 0.07} />
      </mesh>
      {Array.from({ length: floors }, (_, floor) => (
        <group key={floor} position={[0, 0.56 + floor * 0.58, 0]}>
          {[-0.45, 0, 0.45].map((offset) => (
            <mesh key={offset} position={[offset, 0, 0.79]}>
              <boxGeometry args={[0.2, 0.25, 0.03]} />
              <meshBasicMaterial color={selected ? "#E8FFF6" : color} />
            </mesh>
          ))}
          {[-0.45, 0, 0.45].map((offset) => (
            <mesh key={"side:" + offset} position={[0.79, 0, offset]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.2, 0.25, 0.03]} />
              <meshBasicMaterial color={selected ? "#E8FFF6" : color} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, height + 0.38, 0]} castShadow>
        <boxGeometry args={[1.85, 0.16, 1.85]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, height + 0.72, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
      <Html position={[0, height + 1.05, 0]} center distanceFactor={15} style={{ pointerEvents: "none" }}>
        <div className="city-project-label">
          <strong>{project.name}</strong>
          <span>{project.files.length} FILES · {project.language}</span>
        </div>
      </Html>
    </group>
  );
}

function District({ project, index, columns, totalProjects, selectedProjectId, selectedFilePath, onSelect, onSelectFile }: {
  project: Project; index: number; columns: number; totalProjects: number; selectedProjectId?: string; selectedFilePath?: string;
  onSelect?: (id: string) => void; onSelectFile?: (projectId: string, path: string) => void;
}) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const centerX = (column - (columns - 1) / 2) * 18;
  const rows = Math.ceil(Math.min(12, totalProjects) / columns);
  const centerZ = (row - (rows - 1) / 2) * 18;
  const selected = project.id === selectedProjectId;
  const fileLimit = Math.min(42, Math.max(12, Math.floor(240 / Math.max(1, totalProjects))));
  const files = project.files.filter((file) => file.type === "blob").slice(0, fileLimit);
  const fileColumns = 7;

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, -0.13, 0]} receiveShadow>
        <boxGeometry args={[16.4, 0.18, 16.4]} />
        <meshStandardMaterial color={selected ? "#233E47" : "#1A2B39"} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.9, 15.9]} />
        <meshBasicMaterial color={project.color || "#65DDB5"} transparent opacity={selected ? 0.08 : 0.035} />
      </mesh>
      <mesh position={[0, -0.005, -8.15]}>
        <boxGeometry args={[16.5, 0.16, 0.18]} />
        <meshStandardMaterial color={project.color || "#65DDB5"} emissive={project.color || "#65DDB5"} emissiveIntensity={selected ? 0.65 : 0.18} />
      </mesh>
      <CompanyTower project={project} center={[0, 0, -5.0]} selected={selected} onClick={() => onSelect?.(project.id)} />
      {files.map((file, fileIndex) => {
        const x = ((fileIndex % fileColumns) - (fileColumns - 1) / 2) * 1.35;
        const z = Math.floor(fileIndex / fileColumns) * 1.35 - 0.35;
        return (
          <FileBuilding
            key={file.path}
            file={file}
            position={[x, 0, z]}
            selected={file.path === selectedFilePath}
            onClick={() => onSelectFile?.(project.id, file.path)}
          />
        );
      })}
      {project.files.length > files.length && (
        <group position={[5.5, 0, 6.5]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.95, 1.1, 0.95]} />
            <meshStandardMaterial color="#526A7D" emissive="#788BFF" emissiveIntensity={0.12} />
          </mesh>
          <Html position={[0, 1.3, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
            <div className="city-more-label">+{project.files.length - files.length} MORE</div>
          </Html>
        </group>
      )}
    </group>
  );
}

function Resident({ offset, color }: { offset: number; color: string }) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = (clock.getElapsedTime() * 0.11 + offset) % 1;
    const points = [[-7, -9], [7, -9], [7, 9], [-7, 9], [-7, -9]] as const;
    const scaled = t * 4;
    const segment = Math.floor(scaled);
    const blend = scaled - segment;
    const from = points[segment];
    const to = points[segment + 1];
    const x = THREE.MathUtils.lerp(from[0], to[0], blend);
    const z = THREE.MathUtils.lerp(from[1], to[1], blend);
    group.current.position.set(x, 0.04 + Math.sin(clock.getElapsedTime() * 7 + offset * 9) * 0.035, z);
    group.current.rotation.y = Math.atan2(to[0] - from[0], to[1] - from[1]);
    if (body.current) body.current.rotation.z = Math.sin(clock.getElapsedTime() * 9 + offset) * 0.08;
  });
  return (
    <group ref={group}>
      <mesh ref={body} position={[0, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.3, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color="#E8E6DC" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.69, 0.12]}>
        <boxGeometry args={[0.12, 0.035, 0.025]} />
        <meshBasicMaterial color="#172638" />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.6, 6]} />
        <meshStandardMaterial color="#80664F" />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial color="#397B69" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Scene({ projects, selectedProjectId, selectedFilePath, onSelect, onSelectFile }: Props) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(Math.min(projects.length, 12))));
  const trees = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const x = ((i * 7) % 39) - 19;
    const z = ((i * 13) % 37) - 18;
    return [x, 0, z] as [number, number, number];
  }), []);
  return (
    <>
      <color attach="background" args={["#101827"]} />
      <fog attach="fog" args={["#101827", 38, 88]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[14, 22, 12]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-12, 9, -10]} intensity={24} color="#788BFF" distance={42} />
      <pointLight position={[14, 7, 12]} intensity={18} color="#65DDB5" distance={38} />
      <Stars radius={95} depth={55} count={850} factor={2.1} fade speed={0.25} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[120, 100]} />
        <meshStandardMaterial color="#111E2B" roughness={0.98} />
      </mesh>
      <gridHelper args={[100, 60, "#2D4353", "#1B2D3D"]} position={[0, -0.18, 0]} />
      {Array.from({ length: columns + 1 }, (_, i) => {
        const x = (i - columns / 2) * 18;
        return <mesh key={"road-x:" + i} position={[x, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.15, Math.max(22, Math.ceil(projects.length / columns) * 18)]} /><meshStandardMaterial color="#293A48" roughness={0.92} /></mesh>;
      })}
      {Array.from({ length: Math.ceil(projects.length / columns) + 1 }, (_, i) => {
        const z = (i - Math.ceil(projects.length / columns) / 2) * 18;
        return <mesh key={"road-z:" + i} position={[0, -0.055, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[Math.max(22, columns * 18), 1.15]} /><meshStandardMaterial color="#293A48" roughness={0.92} /></mesh>;
      })}
      {projects.slice(0, 12).map((project, index) => (
        <District key={project.id} project={project} index={index} columns={columns} totalProjects={Math.min(projects.length, 12)} selectedProjectId={selectedProjectId} selectedFilePath={selectedFilePath} onSelect={onSelect} onSelectFile={onSelectFile} />
      ))}
      {trees.map((position, index) => <Tree key={index} position={position} />)}
      <Resident offset={0} color="#65DDB5" />
      <Resident offset={0.24} color="#8D9CFF" />
      <Resident offset={0.51} color="#F0B36D" />
      <Resident offset={0.76} color="#D98FB6" />
      <OrbitControls makeDefault target={[0, 0, 0]} minDistance={11} maxDistance={72} maxPolarAngle={Math.PI / 2.08} minPolarAngle={0.34} enableDamping dampingFactor={0.075} />
    </>
  );
}

export default function CityScene(props: Props) {
  const projectCount = Math.min(props.projects.length, 12);
  const columns = Math.max(1, Math.ceil(Math.sqrt(projectCount)));
  const rows = Math.ceil(projectCount / columns);
  const cameraScale = Math.max(columns, rows);
  return (
    <div className={`city-canvas ${props.compact ? "city-canvas--compact" : ""}`}>
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [cameraScale * 10, cameraScale * 9, cameraScale * 11], fov: 39 }} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
      <div className="city-canvas-hint"><span className="hint-dot" /> DRAG TO EXPLORE <span>·</span> SCROLL TO ZOOM <span>·</span> SELECT A BUILDING</div>
    </div>
  );
}
