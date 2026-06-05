import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const Orb = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* Position excentrée (style Denis Villeneuve / Arrival) */}
      <mesh ref={meshRef} position={[4, 0, -4]} scale={3.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#CC460C"  // Ember Orange
          emissive="#501a05"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          distort={0.4}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
};

export const HeroOrb = () => {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <fog attach="fog" args={['#050403', 5, 15]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} color="#F0EBE2" />
        <directionalLight position={[-10, -10, -10]} intensity={1} color="#CC460C" />
        <Orb />
        
        {/* Légères étincelles cinématiques (Sparkles) */}
        <Sparkles count={100} scale={15} size={1.5} speed={0.2} opacity={0.2} color="#CC460C" />
      </Canvas>
    </div>
  );
};
