// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

const Arc = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[3, -1, -5]} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[4, 0.02, 16, 48]} />
        <meshStandardMaterial
          color="#CC460C"
          emissive="#CC460C"
          emissiveIntensity={3} /* Boost emissive intensity to compensate for missing bloom */
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

export const CinematicArc = () => {
  const [dpr, setDpr] = useState(1);

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-[#020202] glow-backdrop">
      <div className="grain-overlay"></div>
      <Canvas 
        dpr={dpr} 
        gl={{ 
          powerPreference: "high-performance", 
          antialias: false,
          stencil: false,
          depth: true,
          alpha: true /* Set alpha to true to let backdrop glow show through */
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(0.75)} onIncline={() => setDpr(1)} />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        <fog attach="fog" args={['#020202', 2, 12]} />
        
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#F0EBE2" />
        
        <Arc />
        
        {/* Further optimized sparkles */}
        <Sparkles count={15} scale={15} size={1} speed={0.1} opacity={0.1} color="#F0EBE2" />
      </Canvas>
    </div>
  );
};
