
import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BlockType } from '../types';
import { BLOCK_METADATA } from '../constants';
import { ThreeEvent } from '@react-three/fiber';
import { audioService } from '../services/audioService';

interface BlockProps {
  position: [number, number, number];
  type: BlockType;
  onAdd: (pos: [number, number, number]) => void;
  onRemove: (pos: [number, number, number]) => void;
  onInteract: (pos: [number, number, number]) => void;
}

const Block: React.FC<BlockProps> = ({ position, type, onAdd, onRemove, onInteract }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const meta = BLOCK_METADATA[type];
  const isTransparent = type === 'water' || type === 'leaf';
  
  // Animation state
  const [targetScale, setTargetScale] = useState(0); // Start small for "place" animation
  const currentScale = useRef(new THREE.Vector3(0, 0, 0));
  const [jiggle, setJiggle] = useState(0);

  useEffect(() => {
    // Trigger "appear" animation on mount
    setTargetScale(1);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth scaling for placement
    const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 15 * delta);
    meshRef.current.scale.set(s, s, s);

    // Subtle jiggle for interactions
    if (jiggle > 0) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 30) * jiggle;
      setJiggle(prev => Math.max(0, prev - 5 * delta));
    } else {
      meshRef.current.rotation.z = 0;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    if (e.button === 0) { // Left click: Mine
      audioService.playBreakSound();
      onRemove(position);
    } else if (e.button === 2) { // Right click: Interact or Build
      const interactive = ['crafting_table', 'lever', 'lever_on', 'redstone_lamp', 'redstone_lamp_on'];
      
      if (interactive.includes(type)) {
        audioService.playInteractSound();
        setJiggle(0.2); // Visual feedback
        onInteract(position);
      } else {
        const event = e as any;
        const normal = event.normal || event.face?.normal || { x: 0, y: 0, z: 0 };
        const newPos: [number, number, number] = [
          position[0] + normal.x, 
          position[1] + normal.y, 
          position[2] + normal.z
        ];
        
        audioService.playPlaceSound();
        onAdd(newPos);
      }
    }
  };

  // Base dimensions
  const dims: [number, number, number] = type.includes('lever') ? [0.4, 0.4, 0.4] : [1, 1, 1];

  return (
    <Box 
      ref={meshRef}
      position={position} 
      args={dims}
      onPointerDown={handleClick}
      castShadow={type !== 'water'}
      receiveShadow
    >
      <meshStandardMaterial 
        color={meta.color} 
        roughness={meta.roughness} 
        metalness={meta.metalness}
        emissive={meta.emissive || 'black'}
        emissiveIntensity={meta.emissive ? (type.includes('_on') ? 5 : 1) : 0}
        transparent={isTransparent}
        opacity={type === 'water' ? 0.6 : 1}
      />
      {type === 'crafting_table' && (
        <meshStandardMaterial attach="material-4" color="#78350f" roughness={0.5} />
      )}
    </Box>
  );
};

export default React.memo(Block);
