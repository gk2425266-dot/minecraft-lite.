
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Weather: React.FC<{ type: 'rain' | 'snow' | 'clear' }> = ({ type }) => {
  const count = 1500;
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!points.current || type === 'clear') return;
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= (type === 'rain' ? 40 : 10) * delta;
      if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 40;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  if (type === 'clear') return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={type === 'rain' ? 0.05 : 0.15}
        color={type === 'rain' ? '#60a5fa' : '#ffffff'}
        transparent
        opacity={0.6}
      />
    </points>
  );
};

export default Weather;
