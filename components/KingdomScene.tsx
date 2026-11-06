"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";

function GrassIsland() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.34, 0]}>
        <cylinderGeometry args={[10.8, 10.1, 0.7, 8]} />
        <meshStandardMaterial color="#6aa943" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[10.45, 10.45, 0.12, 8]} />
        <meshStandardMaterial color="#8bcf55" roughness={1} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10.1, 8]} />
        <meshStandardMaterial color="#83c94d" roughness={1} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.0, 10.5, 8]} />
        <meshStandardMaterial color="#d2b77b" roughness={1} />
      </mesh>
    </group>
  );
}

function Path({ position, rotation = 0, length = 7, width = 1.05 }: { position: [number, number, number]; rotation?: number; length?: number; width?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh receiveShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[width, 0.12, length]} />
        <meshStandardMaterial color="#b9a27a" roughness={1} />
      </mesh>
      {Array.from({ length: Math.floor(length / 0.72) }, (_, i) => (
        <mesh key={i} position={[0, 0.23, -length / 2 + 0.4 + i * 0.72]}>
          <boxGeometry args={[width * 0.91, 0.035, 0.58]} />
          <meshStandardMaterial color={i % 2 ? "#d6c39b" : "#c9b58a"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const crown = useRef<Group>(null);
  useFrame((state) => {
    if (crown.current) crown.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1 + position[0]) * 0.035;
  });
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 0.9, 7]} />
        <meshStandardMaterial color="#80512e" roughness={1} />
      </mesh>
      <group ref={crown} position={[0, 1.12, 0]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial color="#4d963e" roughness={1} />
        </mesh>
        <mesh castShadow position={[-0.36, 0.13, 0.22]}>
          <icosahedronGeometry args={[0.43, 1]} />
          <meshStandardMaterial color="#6bb84c" roughness={1} />
        </mesh>
        <mesh castShadow position={[0.38, 0.12, -0.2]}>
          <icosahedronGeometry args={[0.46, 1]} />
          <meshStandardMaterial color="#397f38" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function Flag({ position, color = "#f4c44d" }: { position: [number, number, number]; color?: string }) {
  const cloth = useRef<Mesh>(null);
  useFrame((state) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.1 + position[0]) * 0.12;
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 1.65, 8]} />
        <meshStandardMaterial color="#8a5a2b" />
      </mesh>
      <mesh ref={cloth} castShadow position={[0.31, 1.35, 0]}>
        <boxGeometry args={[0.62, 0.38, 0.035]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Window({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh>
        <boxGeometry args={[0.34, 0.48, 0.07]} />
        <meshStandardMaterial color="#704523" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.23, 0.34, 0.025]} />
        <meshStandardMaterial color="#ffd978" emissive="#e8a93d" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <boxGeometry args={[0.045, 0.38, 0.025]} />
        <meshStandardMaterial color="#81552e" />
      </mesh>
    </group>
  );
}

function TownHall() {
  const glow = useRef<Mesh>(null);
  useFrame((state) => {
    if (glow.current) {
      const pulse = 0.18 + (Math.sin(state.clock.elapsedTime * 2) + 1) * 0.08;
      (glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, 0.27, 0]}>
        <boxGeometry args={[4.6, 0.48, 4.1]} />
        <meshStandardMaterial color="#a89b82" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0]} receiveShadow>
        <boxGeometry args={[3.75, 1.65, 3.25]} />
        <meshStandardMaterial color="#e8d3a7" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 2.25, 0]}>
        <coneGeometry args={[2.55, 1.55, 4]} />
        <meshStandardMaterial color="#b74f2e" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 3.12, 0]}>
        <coneGeometry args={[0.35, 0.75, 6]} />
        <meshStandardMaterial color="#dcae43" metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh ref={glow} position={[0, 1.1, 1.64]}>
        <boxGeometry args={[0.7, 1.12, 0.08]} />
        <meshStandardMaterial color="#f3b43c" emissive="#f5a52e" emissiveIntensity={0.2} />
      </mesh>
      <Window position={[-1.05, 1.45, 1.65]} />
      <Window position={[1.05, 1.45, 1.65]} />
      <mesh castShadow position={[0, 0.92, 1.68]}>
        <boxGeometry args={[0.78, 1.32, 0.16]} />
        <meshStandardMaterial color="#754322" />
      </mesh>
      <mesh castShadow position={[0, 1.58, 1.79]}>
        <coneGeometry args={[0.5, 0.55, 4]} />
        <meshStandardMaterial color="#d9a63d" />
      </mesh>
      <Flag position={[1.55, 2.8, -0.65]} color="#f2c64f" />
      <Flag position={[-1.55, 2.8, -0.65]} color="#4e9cdb" />
      {[[-2.08, 0.85, -1.6], [2.08, 0.85, -1.6], [-2.08, 0.85, 1.6], [2.08, 0.85, 1.6]].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]}>
          <boxGeometry args={[0.48, 1.45, 0.48]} />
          <meshStandardMaterial color="#c6b48e" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Workshop({ position, color = "#4e8e48", roof = "#b75b36" }: { position: [number, number, number]; color?: string; roof?: string }) {
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[2.2, 0.35, 1.9]} />
        <meshStandardMaterial color="#a89a7d" />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <boxGeometry args={[1.85, 1.2, 1.55]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.72, 0]}>
        <coneGeometry args={[1.48, 1.05, 4]} />
        <meshStandardMaterial color={roof} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0.79]}>
        <boxGeometry args={[0.5, 0.8, 0.08]} />
        <meshStandardMaterial color="#704323" />
      </mesh>
      <Window position={[-0.56, 1.02, 0.8]} />
      <Window position={[0.56, 1.02, 0.8]} />
      <Flag position={[0.7, 1.8, -0.3]} color="#f0c34c" />
    </group>
  );
}

function Tower({ position, color = "#6b9dc1" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.35, 8]} />
        <meshStandardMaterial color="#b9ad91" />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.68, 0.82, 1.5, 8]} />
        <meshStandardMaterial color="#d5c8a6" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 1.98, 0]}>
        <coneGeometry args={[0.95, 0.9, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Window position={[0, 1.08, 0.69]} />
      <Flag position={[0, 2.1, 0]} color="#9a58c4" />
    </group>
  );
}

function Worker({ position, tunic = "#4e8b4d", hat = "#d8a33d", phase = 0 }: { position: [number, number, number]; tunic?: string; hat?: string; phase?: number }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5 + phase) * 0.035;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7 + phase) * 0.08;
    }
  });
  return (
    <group ref={group} position={position}>
      <mesh castShadow position={[0, 0.43, 0]}>
        <capsuleGeometry args={[0.22, 0.42, 4, 8]} />
        <meshStandardMaterial color={tunic} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshStandardMaterial color="#eab98b" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.27, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial color={hat} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.25, 0.43, 0.04]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.045, 0.045, 0.45, 6]} />
        <meshStandardMaterial color="#80512c" />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (group.current) group.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.12 + position[2]) * 0.35;
  });
  return (
    <group ref={group} position={position} scale={scale}>
      {[-0.55, 0, 0.52].map((x, i) => (
        <mesh key={i} position={[x, i === 1 ? 0.12 : 0, 0]}>
          <sphereGeometry args={[0.48, 12, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Village() {
  return (
    <>
      <color attach="background" args={["#a9ddf1"]} />
      <fog attach="fog" args={["#a9ddf1", 19, 38]} />
      <ambientLight intensity={1.15} />
      <directionalLight castShadow position={[8, 13, 8]} intensity={2.1} color="#fff0cf" shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <hemisphereLight args={["#e4f8ff", "#54813b", 0.7]} />
      <GrassIsland />
      <Path position={[0, 0, 4.3]} length={5.5} width={1.2} />
      <Path position={[0, 0, -3.8]} length={4.3} width={1.0} />
      <Path position={[-4.1, 0, 0]} rotation={Math.PI / 2} length={5.2} width={0.95} />
      <Path position={[4.1, 0, 0]} rotation={Math.PI / 2} length={5.2} width={0.95} />
      <TownHall />
      <Workshop position={[-4.1, 0, 2.5]} color="#6f9b58" roof="#b65d38" />
      <Workshop position={[4.15, 0, 2.3]} color="#d5b76d" roof="#5c8fb7" />
      <Workshop position={[-4.1, 0, -2.7]} color="#9b79b7" roof="#8e58ba" />
      <Workshop position={[4.1, 0, -2.8]} color="#6d9e9c" roof="#c18b3e" />
      <Tower position={[-6.3, 0, -0.3]} color="#a56bc4" />
      <Tower position={[6.2, 0, 0.1]} color="#e3ad48" />
      <Tree position={[-7.8, 0, -4.5]} scale={1.15} />
      <Tree position={[-7.3, 0, 4.8]} scale={1.05} />
      <Tree position={[7.8, 0, -4.5]} scale={1.1} />
      <Tree position={[7.3, 0, 4.8]} scale={1.2} />
      <Tree position={[-5.8, 0, 5.7]} scale={0.75} />
      <Tree position={[5.9, 0, 5.7]} scale={0.82} />
      <Worker position={[-1.9, 0.22, 3.0]} tunic="#477f47" hat="#d9a73e" phase={0.5} />
      <Worker position={[2.3, 0.22, 3.25]} tunic="#8c6aab" hat="#d8b45a" phase={1.7} />
      <Worker position={[0.8, 0.22, -3.1]} tunic="#477fa4" hat="#e0b34a" phase={2.8} />
      <Cloud position={[-5, 7.5, -7]} scale={1.2} />
      <Cloud position={[5, 8.5, -8]} scale={0.9} />
      <ContactShadows position={[0, 0.12, 0]} opacity={0.3} scale={21} blur={2.4} far={5} />
    </>
  );
}

export default function KingdomScene() {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [13, 15, 17], fov: 32, near: 0.1, far: 80 }}>
      <Suspense fallback={null}>
        <Village />
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0, 0.65, 0]}
        enablePan
        enableZoom
        minDistance={13}
        maxDistance={28}
        minPolarAngle={0.55}
        maxPolarAngle={1.22}
        minAzimuthAngle={-0.65}
        maxAzimuthAngle={0.65}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
