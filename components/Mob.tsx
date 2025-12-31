
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import { Mob as MobType } from '../types';

const Mob: React.FC<{ data: MobType }> = ({ data }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = data.pos[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef} position={data.pos}>
      <Box args={data.type === 'golem' ? [1.2, 2.5, 1.2] : [0.8, 1.8, 0.8]}>
        <meshStandardMaterial 
          color={data.type === 'golem' ? '#4b5563' : '#dc2626'} 
          emissive={data.type === 'stalker' ? '#7f1d1d' : 'black'}
          emissiveIntensity={2}
        />
      </Box>
      {/* Eyes */}
      <mesh position={[0, 0.8, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
};

export default Mob;
