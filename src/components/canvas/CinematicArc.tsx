// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useRef, useState, Suspense } from 'react';
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
          emissiveIntensity={2}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

export const CinematicArc = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [dpr, setDpr] = useState(isMobile ? 0.5 : 1);

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-[#020202]">
      <Canvas 
        dpr={dpr} 
        gl={{ 
          powerPreference: "high-performance", 
          antialias: false,
          stencil: false,
          depth: false,
          alpha: false
        }}
      >
        <color attach="background" args={['#020202']} />
        <PerformanceMonitor onDecline={() => setDpr(dpr * 0.75)} onIncline={() => setDpr(Math.min(1.5, dpr * 1.25))} />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        <fog attach="fog" args={['#020202', 2, 12]} />
        
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#F0EBE2" />
        
        <Suspense fallback={null}>
          <Arc />
          <Sparkles count={isMobile ? 10 : 20} scale={15} size={1} speed={0.1} opacity={0.15} color="#F0EBE2" />
          <EffectComposer enableNormalPass={false} resolutionScale={isMobile ? 0.5 : 1}>
            <Bloom luminanceThreshold={0.5} intensity={1} />
            <Noise opacity={0.2} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
