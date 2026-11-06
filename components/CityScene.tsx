"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
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

const languageColors: Record<string, string> = {
  ts: "#4D91B8", tsx: "#4D91B8", js: "#D5AE4E", jsx: "#D5AE4E",
  py: "#719C69", dart: "#4E9FB5", go: "#4D9D98", rs: "#C47B58",
  java: "#C27C5D", kt: "#8A76B6", swift: "#C77B68", css: "#9878B7",
  scss: "#B66F95", html: "#C77D50", json: "#B69A48", md: "#8295A1",
  yml: "#8295A1", yaml: "#8295A1", sql: "#5A8AB5", sh: "#719B68",
  default: "#8B9999",
};

function extensionOf(path: string) {
  const name = path.split("/").pop() || "";
  return name.includes(".") ? name.split(".").pop()!.toLowerCase() : "default";
}

function fileColor(file: RepoFile) {
  return languageColors[extensionOf(file.path)] || languageColors.default;
}

function FileBuilding({ file, projectId, index, selected, onSelect }: {
  file: RepoFile; projectId: string; index: number; selected: boolean;
  onSelect?: (projectId: string, path: string) => void;
}) {
  const column = index % 7;
  const row = Math.floor(index / 7);
  const x = (column - 3) * 1.72;
  const z = row * 1.72 - 0.3;
  const height = Math.max(0.7, Math.min(3.4, 0.62 + Math.log2((file.size || 900) / 220 + 1) * 0.4));
  const color = fileColor(file);
  const width = 0.72 + (index % 3) * 0.09;
  const depth = 0.72 + ((index + 1) % 3) * 0.08;
  const click = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect?.(projectId, file.path);
  };
  return (
    <group position={[x, 0, z]} onClick={click}>
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <boxGeometry args={[width + 0.18, 0.22, depth + 0.18]} />
        <meshStandardMaterial color="#E5DCC7" roughness={0.95} />
      </mesh>
      <mesh position={[0, height / 2 + 0.25, 0]} castShadow receiveShadow>
        {index % 6 === 0 ? <cylinderGeometry args={[width * 0.55, width * 0.65, height, 6]} /> : <boxGeometry args={[width, height, depth]} />}
        <meshStandardMaterial color={selected ? "#FFF0B9" : color} roughness={0.66} metalness={0.04} />
      </mesh>
      <mesh position={[0, height + 0.31, 0]} castShadow>
        <boxGeometry args={[width + 0.12, 0.14, depth + 0.12]} />
        <meshStandardMaterial color={selected ? "#E6B94F" : new THREE.Color(color).multiplyScalar(0.78)} roughness={0.72} />
      </mesh>
      {[-0.19, 0.19].map((offset) => (
        <group key={offset}>
          <mesh position={[offset, height * 0.55 + 0.25, depth / 2 + 0.014]}>
            <boxGeometry args={[0.13, Math.min(0.3, height * 0.15), 0.025]} />
            <meshBasicMaterial color="#FFF0B6" />
          </mesh>
          <mesh position={[width / 2 + 0.014, height * 0.55 + 0.25, offset]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.13, Math.min(0.3, height * 0.15), 0.025]} />
            <meshBasicMaterial color="#FFF0B6" />
          </mesh>
        </group>
      ))}
      {selected && <mesh position={[0, height + 0.43, 0]}>
        <boxGeometry args={[width + 0.22, 0.035, depth + 0.22]} />
        <meshBasicMaterial color="#F3B84F" />
      </mesh>}
      {selected && <Html position={[0, height + 0.78, 0]} center distanceFactor={22} style={{ pointerEvents: "none" }}>
        <div className="city-file-label"><strong>{file.path.split("/").pop()}</strong><span>{extensionOf(file.path).toUpperCase()} FILE</span></div>
      </Html>}
    </group>
  );
}

function CompanyHQ({ project, selected, onSelect }: { project: Project; selected: boolean; onSelect?: () => void }) {
  const floors = Math.max(3, Math.min(7, Math.ceil(Math.log2(project.files.length + 2))));
  const height = floors * 0.72;
  const accent = project.color || "#6EAD82";
  return (
    <group position={[0, 0, -7.2]} onClick={(event) => { event.stopPropagation(); onSelect?.(); }}>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5.1, 0.38, 4.5]} />
        <meshStandardMaterial color="#E8DDC6" />
      </mesh>
      <mesh position={[0, height / 2 + 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.05, height, 2.7]} />
        <meshStandardMaterial color="#D7E7DE" roughness={0.38} metalness={0.08} />
      </mesh>
      {Array.from({ length: floors }, (_, floor) => (
        <group key={floor} position={[0, 0.8 + floor * 0.72, 0]}>
          {[-0.92, 0, 0.92].map((x) => <mesh key={x} position={[x, 0, 1.36]}>
            <boxGeometry args={[0.52, 0.38, 0.04]} />
            <meshBasicMaterial color={selected ? "#FFF0B4" : "#9BCBC0"} />
          </mesh>)}
          {[-0.7, 0.2, 0.95].map((z) => <mesh key={z} position={[1.55, 0, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.42, 0.38, 0.04]} />
            <meshBasicMaterial color={selected ? "#FFF0B4" : "#9BCBC0"} />
          </mesh>)}
        </group>
      ))}
      <mesh position={[0, height + 0.48, 0]} castShadow>
        <boxGeometry args={[3.5, 0.24, 3.12]} />
        <meshStandardMaterial color={accent} roughness={0.65} />
      </mesh>
      <mesh position={[0, height + 0.82, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.35, 0.75, 4]} />
        <meshStandardMaterial color="#174C32" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.92, 1.38]} castShadow>
        <boxGeometry args={[0.7, 1.05, 0.08]} />
        <meshStandardMaterial color="#5B3C28" roughness={0.9} />
      </mesh>
      {[-1.22, 1.22].map((x) => <group key={x} position={[x, height - 0.3, 1.43]}>
        <mesh><boxGeometry args={[0.05, 1.05, 0.05]} /><meshStandardMaterial color="#E8D4A1" /></mesh>
        <mesh position={[x < 0 ? 0.22 : -0.22, 0.18, 0]}><planeGeometry args={[0.42, 0.62]} /><meshStandardMaterial color={x < 0 ? "#F3BE45" : "#287A43"} side={THREE.DoubleSide} /></mesh>
      </group>)}
      <mesh position={[0, height + 1.28, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.55, 8]} />
        <meshStandardMaterial color="#E9B65D" emissive="#E9B65D" emissiveIntensity={0.3} />
      </mesh>
      <Html position={[0, height + 1.72, 0]} center distanceFactor={23} style={{ pointerEvents: "none" }}>
        <div className="city-company-sign"><strong>{project.name}</strong><span>COMPANY HQ · {project.files.length} FILES</span></div>
      </Html>
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.42, 0]} castShadow><cylinderGeometry args={[0.09, 0.13, 0.82, 7]} /><meshStandardMaterial color="#98734E" /></mesh>
    <mesh position={[0, 1.05, 0]} castShadow><icosahedronGeometry args={[0.56, 1]} /><meshStandardMaterial color="#5D9968" roughness={1} /></mesh>
    <mesh position={[-0.22, 1.3, 0.05]} castShadow><icosahedronGeometry args={[0.34, 1]} /><meshStandardMaterial color="#7CB27B" roughness={1} /></mesh>
  </group>;
}

function Cloud({ position, scale = 1, speed = 0.35 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * speed) * 8;
  });
  return <group ref={ref} position={position} scale={scale}>
    {[[-1, 0, 0], [0, .25, 0], [1, 0, 0], [.15, -.1, .25]].map((p, i) => <mesh key={i} position={p as [number, number, number]}><sphereGeometry args={[1.15, 12, 8]} /><meshStandardMaterial color="#FFF9E8" transparent opacity={.82} roughness={1} /></mesh>)}
  </group>;
}

function Smoke({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + (t * .28) % 2.2;
    ref.current.position.x = position[0] + Math.sin(t * .7) * .22;
  });
  return <group ref={ref} position={position}>{[0, .42, .82].map((y, i) => <mesh key={y} position={[i * .08, y, 0]} scale={1 + i * .32}><sphereGeometry args={[.22, 10, 8]} /><meshStandardMaterial color="#F2EAD8" transparent opacity={.34 - i * .07} /></mesh>)}</group>;
}

function ForestRing({ width, depth }: { width: number; depth: number }) {
  const trees = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const side = i % 4;
    const along = ((Math.floor(i / 4) / 11) - .5) * (side < 2 ? width + 18 : depth + 18);
    return side === 0 ? [-width / 2 - 7, .02, along] : side === 1 ? [width / 2 + 7, .02, along] : side === 2 ? [along, .02, -depth / 2 - 7] : [along, .02, depth / 2 + 7];
  }) as [number, number, number][], [width, depth]);
  return <>{trees.map((position, i) => <Tree key={i} position={position} scale={.9 + (i % 5) * .13} />)}</>;
}

function CodexMonument() {
  return <group position={[0, 0, 0]}>
    <mesh position={[0, 0.22, 0]} receiveShadow><cylinderGeometry args={[3.8, 4.3, 0.44, 8]} /><meshStandardMaterial color="#B9B5A7" /></mesh>
    <mesh position={[0, 1.8, 0]} castShadow><boxGeometry args={[5.4, 3.2, 4.7]} /><meshStandardMaterial color="#FFF0CB" roughness={.82} /></mesh>
    {[-2.3, 2.3].map((x) => <group key={x} position={[x, 2.45, 0]}><mesh castShadow><boxGeometry args={[1.35, 4.5, 1.55]} /><meshStandardMaterial color="#E0DCCD" /></mesh><mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.25, 1.4, 4]} /><meshStandardMaterial color="#287A43" /></mesh></group>)}
    <mesh position={[0, 3.85, 0]} castShadow rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[3.15, 2.3, 4]} /><meshStandardMaterial color="#89512F" roughness={.78} /></mesh>
    <mesh position={[0, 1.42, 2.38]} castShadow><boxGeometry args={[1.25, 2.2, .16]} /><meshStandardMaterial color="#57351F" /></mesh>
    <mesh position={[0, 2.9, 2.52]} castShadow><octahedronGeometry args={[.72]} /><meshStandardMaterial color="#F7C844" emissive="#D99A20" emissiveIntensity={.18} /></mesh>
    {[-1.55, 1.55].map((x) => <mesh key={x} position={[x, 2.05, 2.4]}><boxGeometry args={[.65, .78, .08]} /><meshBasicMaterial color="#FFD978" /></mesh>)}
    <mesh position={[1.45, 5.25, 0]}><cylinderGeometry args={[.07, .07, 2.2, 8]} /><meshStandardMaterial color="#57351F" /></mesh>
    <mesh position={[2.05, 5.75, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.2, .75]} /><meshStandardMaterial color="#E46BB9" side={THREE.DoubleSide} /></mesh>
    <Smoke position={[-1.6, 4.7, -.7]} />
    <Html position={[0, 6.4, 0]} center distanceFactor={25} style={{ pointerEvents: "none" }}><div className="city-company-sign town-hall-sign"><strong>Codex Town Hall</strong><span>REPOSITORY COMMAND</span></div></Html>
  </group>;
}

function Person({ start, end, color, delay }: { start: [number, number, number]; end: [number, number, number]; color: string; delay: number }) {
  const ref = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.07 + delay) % 1;
    ref.current.position.set(THREE.MathUtils.lerp(start[0], end[0], t), 0.04 + Math.abs(Math.sin(clock.getElapsedTime() * 5 + delay * 8)) * 0.035, THREE.MathUtils.lerp(start[2], end[2], t));
    ref.current.rotation.y = Math.atan2(end[0] - start[0], end[2] - start[2]);
    if (body.current) body.current.rotation.z = Math.sin(clock.getElapsedTime() * 6 + delay) * 0.06;
  });
  return <group ref={ref} position={start}>
    <mesh ref={body} position={[0, 0.37, 0]} castShadow><capsuleGeometry args={[0.13, 0.28, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0, 0.68, 0]} castShadow><sphereGeometry args={[0.13, 12, 12]} /><meshStandardMaterial color="#F2D8B6" /></mesh>
  </group>;
}


function AgentCharacter({ position, initials, color, role }: { position: [number, number, number]; initials: string; color: string; role: string }) {
  return <group position={position}>
    <mesh position={[0, 0.34, 0]} castShadow><capsuleGeometry args={[0.13, 0.24, 4, 8]} /><meshStandardMaterial color={color} roughness={0.78} /></mesh>
    <mesh position={[0, 0.64, 0]} castShadow><sphereGeometry args={[0.13, 12, 12]} /><meshStandardMaterial color="#F1D6B5" roughness={0.9} /></mesh>
    <mesh position={[0, 0.76, 0]}><sphereGeometry args={[0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#6B5746" roughness={0.9} /></mesh>
    <mesh position={[0.16, 0.34, -0.02]}><boxGeometry args={[0.12, 0.2, 0.16]} /><meshStandardMaterial color="#D8C49D" roughness={0.9} /></mesh>
    <Html position={[0, 0.98, 0]} center distanceFactor={20} style={{ pointerEvents: "none" }}>
      <div className="city-agent-tag"><strong>{initials}</strong><span>{role} · IDLE</span></div>
    </Html>
  </group>;
}

function TrafficCar({ lane, color, delay = 0, reverse = false }: { lane: number; color: string; delay?: number; reverse?: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.032 + delay) % 1;
    ref.current.position.set((t - 0.5) * 62 * (reverse ? -1 : 1), 0.06, lane);
    ref.current.rotation.y = reverse ? Math.PI / 2 : -Math.PI / 2;
  });
  return <group ref={ref}>
    <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[1.25, 0.4, 0.64]} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>
    <mesh position={[-0.06, 0.5, 0]} castShadow><boxGeometry args={[0.66, 0.28, 0.54]} /><meshStandardMaterial color="#DCEBE5" roughness={0.3} /></mesh>
    {[-0.38, 0.38].map((x) => [-0.3, 0.3].map((z) => <mesh key={x + ":" + z} position={[x, 0.13, z]}><cylinderGeometry args={[0.13, 0.13, 0.08, 12]} /><meshStandardMaterial color="#50564E" /></mesh>))}
  </group>;
}

function District({ project, index, columns, total, selectedProjectId, selectedFilePath, onSelect, onSelectFile }: {
  project: Project; index: number; columns: number; total: number; selectedProjectId?: string; selectedFilePath?: string;
  onSelect?: (id: string) => void; onSelectFile?: (projectId: string, path: string) => void;
}) {
  const rows = Math.ceil(total / columns);
  const x = (index % columns - (columns - 1) / 2) * 28;
  const z = (Math.floor(index / columns) - (rows - 1) / 2) * 28;
  const selected = project.id === selectedProjectId;
  const files = project.files.filter((file) => file.type === "blob").slice(0, Math.min(34, Math.max(12, Math.floor(200 / Math.max(1, total)))));
  const trees = useMemo(() => Array.from({ length: 8 }, (_, i) => [i % 2 ? 9.2 : -9.2, 0.02, -8 + Math.floor(i / 2) * 4.6] as [number, number, number]), []);
  return <group position={[x, 0, z]}>
    <mesh position={[0, -0.28, 0]} receiveShadow><boxGeometry args={[24, 0.52, 24]} /><meshStandardMaterial color={selected ? "#82B98A" : "#91BE94"} roughness={1} /></mesh>
    <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[23.6, 23.6]} /><meshStandardMaterial color={selected ? "#A4CE9D" : "#AED0A4"} roughness={1} /></mesh>
    <CompanyHQ project={project} selected={selected} onSelect={() => onSelect?.(project.id)} />
    <AgentCharacter position={[-2.5, 0.02, -3.9]} initials="PM" color="#D58A57" role="PM" />
    <AgentCharacter position={[-0.85, 0.02, -3.9]} initials="AR" color="#7896B4" role="ARCH" />
    <AgentCharacter position={[0.85, 0.02, -3.9]} initials="DEV" color="#6E9D77" role="DEV" />
    <AgentCharacter position={[2.5, 0.02, -3.9]} initials="QA" color="#A181B3" role="QA" />

    {files.map((file, fileIndex) => <FileBuilding key={file.path} file={file} projectId={project.id} index={fileIndex} selected={file.path === selectedFilePath} onSelect={onSelectFile} />)}
    {trees.map((position, i) => <Tree key={i} position={position} scale={0.7 + (i % 3) * 0.1} />)}
    {selected && <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[11.3, 11.55, 64]} /><meshBasicMaterial color="#EAB85C" /></mesh>}
    <Html position={[0, 0.08, 11.45]} center distanceFactor={27} style={{ pointerEvents: "none" }}>
      <div className="city-district-sign"><strong>{project.name}</strong><span>{project.root || "PROJECT ROOT"} · {project.language}</span></div>
    </Html>
  </group>;
}

function RoadNetwork({ columns, rows }: { columns: number; rows: number }) {
  const width = columns * 28 + 4;
  const depth = rows * 28 + 4;
  return <group>
    {Array.from({ length: columns + 1 }, (_, i) => {
      const x = (i - columns / 2) * 28;
      return <group key={"v" + i}>
        <mesh position={[x, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.2, depth]} /><meshStandardMaterial color="#BDB8A9" roughness={1} /></mesh>
        <mesh position={[x, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.1, depth]} /><meshBasicMaterial color="#F6EACB" /></mesh>
      </group>;
    })}
    {Array.from({ length: rows + 1 }, (_, i) => {
      const z = (i - rows / 2) * 28;
      return <group key={"h" + i}>
        <mesh position={[0, -0.055, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 3.2]} /><meshStandardMaterial color="#BDB8A9" roughness={1} /></mesh>
        <mesh position={[0, -0.04, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 0.1]} /><meshBasicMaterial color="#F6EACB" /></mesh>
      </group>;
    })}
  </group>;
}

function Scene({ projects, selectedProjectId, selectedFilePath, onSelect, onSelectFile }: Props) {
  const visible = projects.slice(0, 12);
  const columns = Math.max(1, Math.ceil(Math.sqrt(visible.length)));
  const rows = Math.max(1, Math.ceil(visible.length / columns));
  const width = columns * 28 + 20;
  const depth = rows * 28 + 20;
  const trafficLane = (Math.floor(rows / 2) - rows / 2) * 28;
  const people = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    start: [-width / 2 + 1, 0, trafficLane + (i % 4 - 1.5) * 0.48] as [number, number, number],
    end: [width / 2 - 1, 0, trafficLane + (i % 4 - 1.5) * 0.48] as [number, number, number],
    color: ["#D17C60", "#6C8EAB", "#B18A55", "#8975A8"][i % 4],
    delay: i / 8,
  })), [width, trafficLane]);
  return <>
    <color attach="background" args={["#C7E2E9"]} />
    <fog attach="fog" args={["#C7E2E9", 85, 180]} />
    <ambientLight intensity={1.5} />
    <hemisphereLight args={["#F8FCF6", "#739C77", 1.2]} />
    <directionalLight position={[34, 54, 22]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]} receiveShadow><planeGeometry args={[width + 170, depth + 170]} /><meshStandardMaterial color="#37A9DF" roughness={.65} metalness={.08} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.43, 0]} receiveShadow><boxGeometry args={[width + 35, depth + 35, .28]} /><meshStandardMaterial color="#72BD45" roughness={1} /></mesh>
    <RoadNetwork columns={columns} rows={rows} />
    <group position={[0, 0, -depth / 2 - 2]}><CodexMonument /></group>
    <ForestRing width={width} depth={depth} />
    <Cloud position={[-22, 18, -18]} scale={2.2} />
    <Cloud position={[25, 22, 12]} scale={1.6} speed={.22} />
    {visible.map((project, index) => <District key={project.id} project={project} index={index} columns={columns} total={visible.length} selectedProjectId={selectedProjectId} selectedFilePath={selectedFilePath} onSelect={onSelect} onSelectFile={onSelectFile} />)}
    {people.map((person, index) => <Person key={index} {...person} />)}
    <TrafficCar lane={trafficLane - 0.72} color="#E1A45E" delay={0.06} />
    <TrafficCar lane={trafficLane + 0.72} color="#7798B4" delay={0.52} reverse />
    <OrbitControls makeDefault target={[0, 0, 0]} minDistance={19} maxDistance={Math.max(120, Math.max(columns, rows) * 100)} minPolarAngle={0.55} maxPolarAngle={1.22} enableDamping dampingFactor={0.08} rotateSpeed={0.55} panSpeed={0.75} zoomSpeed={0.8} />
  </>;
}

export default function CityScene(props: Props) {
  const count = Math.min(props.projects.length, 12);
  const columns = Math.max(1, Math.ceil(Math.sqrt(count)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const scale = Math.max(columns, rows);
  const position: [number, number, number] = props.compact ? [34, 42, 34] : [Math.max(40, columns * 34), Math.max(52, scale * 28), Math.max(44, rows * 34)];
  return <div className={"city-canvas " + (props.compact ? "city-canvas--compact" : "")}>
    <Canvas shadows dpr={[1, 1.4]} camera={{ position, fov: 34, near: 0.1, far: 500 }} gl={{ antialias: true, alpha: false }}>
      <Suspense fallback={null}><Scene {...props} /></Suspense>
    </Canvas>
    <div className="city-canvas-hint"><span className="hint-dot" /> DRAG TO ORBIT <span>·</span> SCROLL TO ZOOM <span>·</span> SELECT A BUILDING</div>
  </div>;
}
