"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Instances, Instance, OrbitControls } from "@react-three/drei";
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
  ts: "#269B78", tsx: "#269B78", js: "#D99B3D", jsx: "#D99B3D",
  py: "#628BC5", dart: "#3299B8", go: "#319F98", rs: "#D27B56",
  java: "#CB7652", kt: "#8978C0", swift: "#D67C63", css: "#8978C0",
  scss: "#C875A3", html: "#D18A4B", json: "#B58A38", md: "#758D9A",
  yml: "#788B9B", yaml: "#788B9B", sql: "#598EC3", sh: "#5D9A67",
  svg: "#C18B42", png: "#6E9B70", lock: "#82918D", default: "#82918D",
};

function extensionOf(path: string) {
  const name = path.split("/").pop() || "";
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "default";
}
function fileColor(file: RepoFile) {
  return palette[extensionOf(file.path)] || palette.default;
}

function FileBuildings({ files, projectId, selectedFilePath, onSelectFile }: {
  files: RepoFile[]; projectId: string; selectedFilePath?: string;
  onSelectFile?: (projectId: string, path: string) => void;
}) {
  const placements = useMemo(() => files.map((file, index) => {
    const x = ((index % 7) - 3) * 1.35;
    const z = Math.floor(index / 7) * 1.35 - 0.35;
    const size = file.size || 1800;
    const height = Math.max(0.48, Math.min(2.8, 0.42 + Math.log2(size / 350 + 1) * 0.48));
    return { file, x, z, height, color: fileColor(file) };
  }), [files]);
  if (!placements.length) return null;
  const limit = placements.length;
  const inspect = (file: RepoFile) => (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelectFile?.(projectId, file.path);
  };
  return (
    <group>
      <Instances limit={limit}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#F0EBDD" roughness={0.72} metalness={0.04} />
        {placements.map((item) => (
          <Instance key={item.file.path} position={[item.x, item.height / 2 + 0.16, item.z]}
            scale={[0.68, item.height, 0.68]}
            color={item.file.path === selectedFilePath ? "#D6F3E6" : "#F5F0E4"}
            onClick={inspect(item.file)} />
        ))}
      </Instances>
      <Instances limit={limit}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.48} metalness={0.12} />
        {placements.map((item) => (
          <Instance key={item.file.path} position={[item.x, item.height + 0.22, item.z]}
            scale={[0.78, 0.12, 0.78]}
            color={item.file.path === selectedFilePath ? "#FFFFFF" : item.color}
            onClick={inspect(item.file)} />
        ))}
      </Instances>
      <Instances limit={limit}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial />
        {placements.map((item) => (
          <Instance key={item.file.path} position={[item.x, item.height / 2 + 0.2, item.z + 0.345]}
            scale={[0.15, 0.17, 0.025]}
            color={item.file.path === selectedFilePath ? "#FFFFFF" : item.color}
            onClick={inspect(item.file)} />
        ))}
      </Instances>
      <Instances limit={limit}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial />
        {placements.map((item) => (
          <Instance key={item.file.path} position={[item.x + 0.345, item.height / 2 + 0.2, item.z]}
            rotation={[0, Math.PI / 2, 0]} scale={[0.15, 0.17, 0.025]}
            color={item.file.path === selectedFilePath ? "#FFFFFF" : item.color}
            onClick={inspect(item.file)} />
        ))}
      </Instances>
      <Instances limit={limit}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#D7D3C7" roughness={0.9} />
        {placements.map((item) => (
          <Instance key={item.file.path} position={[item.x, 0.08, item.z]}
            scale={[0.94, 0.16, 0.94]} onClick={inspect(item.file)} />
        ))}
      </Instances>
    </group>
  );
}

function CompanyTower({ project, center, selected, onClick }: {
  project: Project; center: [number, number, number]; selected: boolean; onClick?: () => void;
}) {
  const floors = Math.max(3, Math.min(12, Math.ceil(Math.log2(project.files.length + project.commits / 12 + 2)) + 1));
  const height = floors * 0.62;
  const color = project.color || "#269B78";
  return (
    <group position={center} onClick={(event) => { event.stopPropagation(); onClick?.(); }}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[3.1, 0.24, 3.1]} />
        <meshStandardMaterial color="#C8D2C2" roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2 + 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, height, 1.72]} />
        <meshStandardMaterial color="#E9E6D9" metalness={0.14} roughness={0.48}
          emissive={color} emissiveIntensity={selected ? 0.1 : 0.025} />
      </mesh>
      {Array.from({ length: floors }, (_, floor) => (
        <group key={floor} position={[0, 0.56 + floor * 0.62, 0]}>
          {[-0.48, 0, 0.48].map((offset) => (
            <mesh key={offset} position={[offset, 0, 0.87]}>
              <boxGeometry args={[0.24, 0.28, 0.035]} />
              <meshStandardMaterial color={selected ? "#B6E8D4" : "#8EB8B0"} emissive={color} emissiveIntensity={selected ? 0.12 : 0.035} />
            </mesh>
          ))}
          {[-0.48, 0, 0.48].map((offset) => (
            <mesh key={"side:" + offset} position={[0.87, 0, offset]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.24, 0.28, 0.035]} />
              <meshStandardMaterial color={selected ? "#B6E8D4" : "#8EB8B0"} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, height + 0.38, 0]} castShadow>
        <boxGeometry args={[1.98, 0.2, 1.98]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, height + 0.62, 0]} castShadow>
        <boxGeometry args={[0.82, 0.22, 0.82]} />
        <meshStandardMaterial color="#D8E5D7" roughness={0.8} />
      </mesh>
      <mesh position={[0.58, height + 0.64, 0.45]}>
        <cylinderGeometry args={[0.1, 0.1, 0.18, 8]} />
        <meshStandardMaterial color="#AAB6A7" />
      </mesh>
      <mesh position={[-0.52, height + 0.65, -0.45]}>
        <boxGeometry args={[0.3, 0.18, 0.24]} />
        <meshStandardMaterial color="#B7C4B1" />
      </mesh>
      {selected && <pointLight position={[0, height + 1, 0]} color={color} intensity={0.7} distance={6} />}
      <Html position={[0, height + 1.0, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
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
  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, -0.13, 0]} receiveShadow>
        <boxGeometry args={[16.4, 0.18, 16.4]} />
        <meshStandardMaterial color={selected ? "#DCECE0" : "#E5E6D9"} roughness={0.96} />
      </mesh>
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.9, 15.9]} />
        <meshStandardMaterial color={selected ? "#C9E0CC" : "#D7E3D1"} roughness={1} />
      </mesh>
      <mesh position={[0, -0.005, -8.15]}>
        <boxGeometry args={[16.5, 0.16, 0.18]} />
        <meshStandardMaterial color={selected ? "#2B9C77" : "#A5B9A7"} />
      </mesh>
      <mesh position={[0, 0.02, 7.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.7, 0.85]} />
        <meshStandardMaterial color="#B7C2B4" roughness={0.95} />
      </mesh>
      <CompanyTower project={project} center={[0, 0, -5.0]} selected={selected} onClick={() => onSelect?.(project.id)} />
      <FileBuildings files={files} projectId={project.id} selectedFilePath={selectedFilePath} onSelectFile={onSelectFile} />
      <mesh position={[-6.7, 0.04, 5.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 24]} />
        <meshStandardMaterial color="#A8C8A4" roughness={1} />
      </mesh>
      <mesh position={[-6.7, 0.055, 5.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.54, 24]} />
        <meshStandardMaterial color="#E9D6AC" roughness={1} />
      </mesh>
      {project.files.length > files.length && (
        <group position={[5.5, 0, 6.5]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.95, 1.1, 0.95]} />
            <meshStandardMaterial color="#D7D6CB" />
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
    const t = (clock.getElapsedTime() * 0.09 + offset) % 1;
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
        <meshStandardMaterial color="#F1D6B6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.69, 0.12]}>
        <boxGeometry args={[0.12, 0.035, 0.025]} />
        <meshBasicMaterial color="#35453E" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.16, 8]} />
        <meshStandardMaterial color="#3F5261" />
      </mesh>
    </group>
  );
}

function Tree({ position, variant = 0 }: { position: [number, number, number]; variant?: number }) {
  const greens = ["#7DAE83", "#91B98B", "#6F9D78"];
  const leaf = greens[variant % greens.length];
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.6, 7]} />
        <meshStandardMaterial color="#9B795C" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={leaf} roughness={0.96} />
      </mesh>
      <mesh position={[0.14, 0.94, 0.04]} castShadow>
        <icosahedronGeometry args={[0.27, 1]} />
        <meshStandardMaterial color={greens[(variant + 1) % greens.length]} roughness={0.96} />
      </mesh>
    </group>
  );
}

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 1.44, 7]} />
        <meshStandardMaterial color="#788B80" metalness={0.42} roughness={0.55} />
      </mesh>
      <mesh position={[0.14, 1.42, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.34, 0.045, 0.045]} />
        <meshStandardMaterial color="#788B80" metalness={0.4} />
      </mesh>
      <mesh position={[0.28, 1.36, 0]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#FFF1C8" emissive="#F2D58D" emissiveIntensity={0.32} />
      </mesh>
    </group>
  );
}

function Car({ position, color, direction = 0 }: { position: [number, number, number]; color: string; direction?: number }) {
  return (
    <group position={position} rotation={[0, direction, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.72, 0.3, 1.22]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.43, -0.06]}>
        <boxGeometry args={[0.58, 0.23, 0.58]} />
        <meshStandardMaterial color="#B6D4D2" roughness={0.25} metalness={0.18} />
      </mesh>
      {[-0.28, 0.28].map((x) => [-0.36, 0.38].map((z) => (
        <mesh key={x + ":" + z} position={[x, 0.11, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.09, 10]} />
          <meshStandardMaterial color="#53616A" />
        </mesh>
      )))}
    </group>
  );
}

function Crane({ position }: { position: [number, number, number] }) {
  const hook = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (hook.current) hook.current.position.x = Math.sin(clock.getElapsedTime() * 0.45) * 1.15;
  });
  return (
    <group position={position}>
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[0.22, 6, 0.22]} />
        <meshStandardMaterial color="#E0A64E" />
      </mesh>
      <mesh position={[1.45, 5.7, 0]}>
        <boxGeometry args={[3.1, 0.16, 0.16]} />
        <meshStandardMaterial color="#E0A64E" />
      </mesh>
      <mesh position={[-1.15, 5.7, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.22]} />
        <meshStandardMaterial color="#D18B43" />
      </mesh>
      <mesh position={[0, 4.35, 0]}>
        <boxGeometry args={[0.1, 2.8, 0.1]} />
        <meshStandardMaterial color="#D18B43" />
      </mesh>
      <group ref={hook} position={[1.35, 5.5, 0]}>
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.35, 6]} />
          <meshStandardMaterial color="#7B7B70" />
        </mesh>
        <mesh position={[0, -1.45, 0]}>
          <boxGeometry args={[0.55, 0.42, 0.55]} />
          <meshStandardMaterial color="#E4B65E" />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ projects, selectedProjectId, selectedFilePath, onSelect, onSelectFile }: Props) {
  const projectCount = Math.min(projects.length, 12);
  const columns = Math.max(1, Math.ceil(Math.sqrt(projectCount)));
  const rows = Math.ceil(projectCount / columns);
  const trees = useMemo(() => Array.from({ length: Math.max(24, projectCount * 9) }, (_, i) => {
    const x = ((i * 7) % 47) - 23;
    const z = ((i * 13) % 45) - 22;
    return [x, 0, z] as [number, number, number];
  }), [projectCount]);
  return (
    <>
      <color attach="background" args={["#EAF1E8"]} />
      <fog attach="fog" args={["#EAF1E8", 54, 125]} />
      <ambientLight intensity={1.8} />
      <hemisphereLight args={["#FFFFFF", "#B6C6AF", 1.05]} />
      <directionalLight position={[18, 26, 12]} intensity={2.7} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-14, 9, -12]} intensity={12} color="#F4DCA8" distance={52} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[180, 160]} />
        <meshStandardMaterial color="#D6E2D0" roughness={1} />
      </mesh>
      <gridHelper args={[120, 72, "#C3D0C0", "#D0DACB"]} position={[0, -0.18, 0]} />
      {Array.from({ length: columns + 1 }, (_, i) => {
        const x = (i - columns / 2) * 18;
        return (
          <group key={"road-x:" + i}>
            <mesh position={[x, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.65, Math.max(28, rows * 18 + 10)]} />
              <meshStandardMaterial color="#AEBAB0" roughness={1} />
            </mesh>
            <mesh position={[x, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.045, Math.max(26, rows * 18 + 8)]} />
              <meshBasicMaterial color="#F5F1E7" />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: rows + 1 }, (_, i) => {
        const z = (i - rows / 2) * 18;
        return (
          <group key={"road-z:" + i}>
            <mesh position={[0, -0.055, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[Math.max(28, columns * 18 + 10), 1.65]} />
              <meshStandardMaterial color="#AEBAB0" roughness={1} />
            </mesh>
            <mesh position={[0, -0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[Math.max(26, columns * 18 + 8), 0.045]} />
              <meshBasicMaterial color="#F5F1E7" />
            </mesh>
          </group>
        );
      })}
      {projects.slice(0, 12).map((project, index) => (
        <District key={project.id} project={project} index={index} columns={columns} totalProjects={projectCount}
          selectedProjectId={selectedProjectId} selectedFilePath={selectedFilePath} onSelect={onSelect} onSelectFile={onSelectFile} />
      ))}
      {trees.map((position, index) => <Tree key={index} position={position} variant={index} />)}
      <StreetLamp position={[-9.2, 0, -4.8]} />
      <StreetLamp position={[9.2, 0, 4.8]} />
      <Car position={[-5.6, 0, -9.1]} color="#D77F5E" direction={Math.PI / 2} />
      <Car position={[5.6, 0, 9.1]} color="#6D99B5" direction={Math.PI / 2} />
      <Crane position={[8.0, 0, -7.2]} />
      <Resident offset={0} color="#2C9A78" />
      <Resident offset={0.24} color="#7B75BC" />
      <Resident offset={0.51} color="#D78B4A" />
      <Resident offset={0.76} color="#C9789A" />
      <OrbitControls makeDefault target={[0, 0, 0]} minDistance={12} maxDistance={170}
        maxPolarAngle={Math.PI / 2.08} minPolarAngle={0.34} enableDamping dampingFactor={0.075} />
    </>
  );
}

export default function CityScene(props: Props) {
  const projectCount = Math.max(1, Math.min(props.projects.length, 12));
  const columns = Math.max(1, Math.ceil(Math.sqrt(projectCount)));
  const rows = Math.ceil(projectCount / columns);
  const cameraScale = Math.max(columns, rows);
  const cameraPosition: [number, number, number] = props.compact
    ? [25, 24, 29]
    : [cameraScale * 19, cameraScale * 18, cameraScale * 22];
  return (
    <div className={`city-canvas ${props.compact ? "city-canvas--compact" : ""}`}>
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: cameraPosition, fov: 38 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
      <div className="city-canvas-hint"><span className="hint-dot" /> DRAG TO EXPLORE <span>·</span> SCROLL TO ZOOM <span>·</span> SELECT A BUILDING</div>
    </div>
  );
}
