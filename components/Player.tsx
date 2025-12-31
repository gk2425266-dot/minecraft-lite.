
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
  
  // Physics constants
  const GRAVITY = -30;
  const JUMP_FORCE = 10;
  const SPEED = 7;
  const SPRINT_MULTIPLIER = 1.6;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') setIsThirdPerson(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame((state, delta) => {
    const { forward, backward, left, right, jump, shift } = getKeys() as any;

    // 1. Calculate Horizontal Movement
    const isSprinting = shift && stamina > 4;
    const currentSpeed = isSprinting ? SPEED * SPRINT_MULTIPLIER : SPEED;
    
    if (isSprinting && (forward || backward || left || right)) {
      onStaminaChange(-10 * delta);
    }

    const direction = new THREE.Vector3();
    direction.z = Number(forward) - Number(backward);
    direction.x = Number(right) - Number(left);
    direction.normalize();

    // Get camera rotation but ignore pitch for movement
    const moveVector = new THREE.Vector3(direction.x, 0, direction.z);
    moveVector.applyQuaternion(camera.quaternion);
    moveVector.y = 0; // Lock to plane
    moveVector.normalize().multiplyScalar(currentSpeed);

    // 2. Vertical Physics (Gravity & Jump)
    velocity.current.y += GRAVITY * delta;
    
    // Check if on ground
    const px = Math.floor(camera.position.x);
    const py = Math.floor(camera.position.y - 1.6); // Feet level
    const pz = Math.floor(camera.position.z);
    const blockBelow = getBlock(px, py, pz);
    
    const onGround = !!blockBelow && blockBelow !== 'water';

    if (onGround && velocity.current.y < 0) {
      velocity.current.y = 0;
      if (jump) velocity.current.y = JUMP_FORCE;
    }

    // 3. Apply Velocity & Collision Detection
    const nextX = camera.position.x + moveVector.x * delta;
    const nextZ = camera.position.z + moveVector.z * delta;
    const nextY = camera.position.y + velocity.current.y * delta;

    // Simple Collision Check (Wall stop)
    const blockAtHead = getBlock(Math.floor(nextX), Math.floor(nextY), Math.floor(nextZ));
    const blockAtFeet = getBlock(Math.floor(nextX), Math.floor(nextY - 1), Math.floor(nextZ));

    if (!blockAtHead && !blockAtFeet) {
      camera.position.x = nextX;
      camera.position.z = nextZ;
    }
    
    camera.position.y = nextY;

    // Prevent falling into void (reset if needed)
    if (camera.position.y < -10) {
      camera.position.y = 30;
      velocity.current.y = 0;
    }

    onPosUpdate([camera.position.x, camera.position.y, camera.position.z]);
  });

  return (
    <>
      <PointerLockControls />
      {isThirdPerson && (
        <mesh position={[0, -1, -4]} castShadow>
          <capsuleGeometry args={[0.4, 1, 4, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      )}
    </>
  );
};

export default Player;
