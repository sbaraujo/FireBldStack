/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { Box, OrbitControls, Sky, PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface BuildingProps {
  floors: number;
  floorHeight: number;
  highlightedFloor?: number;
}

const Building: React.FC<BuildingProps> = ({ floors, floorHeight, highlightedFloor }) => {
  const buildingWidth = 5;
  const buildingDepth = 5;

  return (
    <group>
      {Array.from({ length: floors }).map((_, i) => {
        const isHighlighted = highlightedFloor === i;
        return (
          <Box
            key={i}
            args={[buildingWidth, floorHeight - 0.1, buildingDepth]}
            position={[0, i * floorHeight + floorHeight / 2, 0]}
          >
            <meshStandardMaterial
              color={isHighlighted ? "#ffcc00" : "#ffffff"}
              transparent
              opacity={0.7}
              roughness={0.1}
              metalness={0.9}
            />
          </Box>
        );
      })}
      {/* Structural skeleton or corners */}
      <Box args={[buildingWidth + 0.1, floors * floorHeight, buildingDepth + 0.1]} position={[0, (floors * floorHeight) / 2, 0]}>
        <meshBasicMaterial color="#333333" wireframe />
      </Box>
    </group>
  );
};

interface WindArrowsProps {
  speed: number;
  angle: number;
  height: number;
}

const WindArrows: React.FC<WindArrowsProps> = ({ speed, angle, height }) => {
  const arrowRef = useRef<THREE.Group>(null);
  const rad = (angle * Math.PI) / 180;

  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <group ref={arrowRef} rotation={[0, -rad, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[-10, i * (height / 4), 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 5]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.2, 0.5, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

interface Building3DProps {
  params: {
    floors: number;
    floorHeight: number;
    windSpeed: number;
    windAngle: number;
  };
}

export const Building3D: React.FC<Building3DProps> = ({ params }) => {
  return (
    <div className="w-full h-full min-h-[500px] relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10">
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md p-3 rounded-lg text-white border border-white/20">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          SIMULAÇÃO 3D EM TEMPO REAL
        </h3>
        <p className="text-xs opacity-70">Balneário Camboriú - Edificação Técnica</p>
      </div>

      <React.Suspense fallback={<div className="flex items-center justify-center h-full text-white">Carregando Cena 3D...</div>}>
        <div className="w-full h-full">
          <Canvas key={params.floors}>
            <PerspectiveCamera makeDefault position={[20, 20, 20]} />
            <OrbitControls enableDamping dampingFactor={0.05} />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

            <Building floors={params.floors} floorHeight={params.floorHeight} />
            <WindArrows speed={params.windSpeed} angle={params.windAngle} height={params.floors * params.floorHeight} />

            <Environment preset="city" />
            <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#111827" roughness={0.8} />
            </mesh>

            <gridHelper args={[100, 20, "#334155", "#1e293b"]} position={[0, 0, 0]} />
          </Canvas>
        </div>
      </React.Suspense>

      <div className="absolute bottom-4 right-4 z-10 text-[10px] text-white/50 uppercase tracking-widest">
        Mouse p/ orbitar • Scroll p/ zoom
      </div>
    </div>
  );
};
