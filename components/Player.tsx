
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerProps {
  stamina: number;
  onStaminaChange: (val: number) => void;
  onPosUpdate: (pos: [number, number, number]) => void;
  getBlock: (x: number, y: number, z: number) => string | undefined;
}

const Player: React.FC<PlayerProps> = ({ stamina, onStaminaChange, onPosUpdate, getBlock }) => {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const [isThirdPerson, setIsThirdPerson] = useState(false);
  
  const GRAVITY = -25;
  const JUMP_FORCE = 9;
  const SPEED = 6;
  const SPRINT_MULTIPLIER = 1.5;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') setIsThirdPerson(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame((state, delta) => {
    // Delta clamping to prevent huge jumps if frame drops
    const d = Math.min(delta, 0.1);
    const { forward, backward, left, right, jump, shift } = getKeys() as any;

    const isSprinting = shift && stamina > 5;
    const currentSpeed = isSprinting ? SPEED * SPRINT_MULTIPLIER : SPEED;
    
    if (isSprinting && (forward || backward || left || right)) {
      onStaminaChange(-12 * d);
    }

    const direction = new THREE.Vector3();
    direction.z = Number(forward) - Number(backward);
    direction.x = Number(right) - Number(left);
    direction.normalize();

    const moveVector = new THREE.Vector3(direction.x, 0, direction.z);
    moveVector.applyQuaternion(camera.quaternion);
    moveVector.y = 0; 
    moveVector.normalize().multiplyScalar(currentSpeed);

    velocity.current.y += GRAVITY * d;
    
    // Safety check for current position
    const px = Math.floor(camera.position.x);
    const py = Math.floor(camera.position.y - 1.6);
    const pz = Math.floor(camera.position.z);
    
    const blockBelow = getBlock(px, py, pz);
    const onGround = !!blockBelow && blockBelow !== 'water';

    if (onGround && velocity.current.y < 0) {
      velocity.current.y = 0;
      camera.position.y = Math.floor(camera.position.y - 1.6) + 1.6; // Snap to ground
      if (jump) velocity.current.y = JUMP_FORCE;
    }

    const nextX = camera.position.x + moveVector.x * d;
    const nextZ = camera.position.z + moveVector.z * d;
    const nextY = camera.position.y + velocity.current.y * d;

    // Head and foot collisions
    const blockAtHead = getBlock(Math.floor(nextX), Math.floor(nextY), Math.floor(nextZ));
    const blockAtFeet = getBlock(Math.floor(nextX), Math.floor(nextY - 1), Math.floor(nextZ));

    if (!blockAtHead && !blockAtFeet) {
      camera.position.x = nextX;
      camera.position.z = nextZ;
    }
    
    camera.position.y = nextY;

    // Void reset
    if (camera.position.y < -50 || isNaN(camera.position.y)) {
      camera.position.set(0, 30, 0);
      velocity.current.set(0, 0, 0);
    }

    onPosUpdate([camera.position.x, camera.position.y, camera.position.z]);
  });

  return (
    <>
      <PointerLockControls />
      {isThirdPerson && (
        <mesh position={[0, -0.8, -3]} castShadow>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.5} />
        </mesh>
      )}
    </>
  );
};

export default Player;
