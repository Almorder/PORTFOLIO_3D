import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

export const CinematicParticles = () => {
  const ref = useRef<any>(null);
  
  const sphere = useMemo(() => {
    const pts = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random()) * 10;
        pts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pts[i * 3 + 2] = r * Math.cos(phi);
    }
    return pts;
  }, []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#CC460C" 
          size={0.05} 
          sizeAttenuation={true} 
          depthWrite={false} 
          opacity={0.6}
        />
      </Points>
    </group>
  );
};
