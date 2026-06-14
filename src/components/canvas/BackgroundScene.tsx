import { Canvas } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { CinematicParticles } from './CinematicParticles';

export const BackgroundScene = () => {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none bg-bg">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#F0EBE2" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#CC460C" />
        
        {/* Particules fluides de fond */}
        <CinematicParticles />

        {/* Floating Sparks contextuels */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Sparkles count={50} scale={12} size={2} speed={0.4} opacity={0.3} color="#F0EBE2" />
        </Float>
      </Canvas>
    </div>
  );
};
