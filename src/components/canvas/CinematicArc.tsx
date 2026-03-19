// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';

const Arc = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Rotation extrêmement lente, majestueuse, organique
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      {/* Position excentrée (style Denis Villeneuve / Dune) */}
      <mesh ref={meshRef} position={[3, -1, -5]} rotation={[-Math.PI / 4, 0, 0]}>
        {/* Torus = L'Arc du logo Nolan Arc (Rayon 4, Epaisseur 0.02 pour une élégance radicale) */}
        <torusGeometry args={[4, 0.02, 64, 128]} />
        <meshStandardMaterial
          color="#CC460C"  // Ember Orange
          emissive="#CC460C"
          emissiveIntensity={2}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

export const CinematicArc = () => {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-[#020202]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        {/* Brouillard dense pour fondre l'arc dans les ténèbres */}
        <fog attach="fog" args={['#020202', 2, 12]} />
        
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#F0EBE2" />
        
        <Arc />
        
        {/* Légères particules (poussière lumineuse) */}
        <Sparkles count={60} scale={15} size={1} speed={0.1} opacity={0.15} color="#F0EBE2" />
        
        {/* POST-PROCESSING HAUTE FIDÉLITÉ (Le "Whaouh" Effet authentique) */}
        <EffectComposer disableNormalPass>
          {/* Cœur incandescent */}
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
          {/* Du grain cinématique puissant (Référence visuelle à la pellicule) */}
          <Noise opacity={0.35} />
          {/* Assombrir intensément les bords */}
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
