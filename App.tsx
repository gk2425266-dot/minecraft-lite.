
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Environment, SoftShadows, KeyboardControls, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import Block from './components/Block';
import Player from './components/Player';
import Weather from './components/Weather';
import HUD from './components/HUD';
import { useStore } from './hooks/useStore';

const LoadingScreen = () => (
  <Html center>
    <div className="flex flex-col items-center gap-4 bg-black/80 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <div className="text-white font-black tracking-widest uppercase text-sm animate-pulse">
        Initializing VoxelVerse...
      </div>
      <div className="text-white/40 text-[10px] font-mono">Loading Shaders & Infinite Chunks</div>
    </div>
  </Html>
);

const App: React.FC = () => {
  const { state, addBlock, removeBlock, interactBlock, setSlot, toggleCrafting, setPlayerPos, getBlock } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const keyboardMap = useMemo(() => [
    { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
    { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
    { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
    { name: 'right', keys: ['KeyD', 'ArrowRight'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'shift', keys: ['ShiftLeft', 'ShiftRight'] },
  ], []);

  const sunPos = useMemo(() => {
    const angle = state.time * Math.PI * 2;
    return [Math.cos(angle) * 100, Math.sin(angle) * 100, 50] as [number, number, number];
  }, [state.time]);

  const visibleBlocks = useMemo(() => {
    const entries: [string, string][] = [];
    if (!state.chunks) return entries;
    Object.values(state.chunks).forEach(chunk => {
      Object.entries(chunk).forEach(([key, type]) => {
        entries.push([key, type]);
      });
    });
    return entries;
  }, [state.chunks]);

  if (!isMounted) return <div className="w-full h-full bg-slate-950" />;

  return (
    <KeyboardControls map={keyboardMap}>
      <div className="w-full h-full bg-slate-950 relative">
        <Canvas 
          shadows 
          camera={{ fov: 75, position: [0, 20, 0] }} 
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          flat
        >
          <Suspense fallback={<LoadingScreen />}>
            <Sky sunPosition={sunPos} turbidity={0.1} rayleigh={0.5} />
            {state.time < 0.3 || state.time > 0.7 ? <Stars radius={100} depth={50} count={2000} factor={4} /> : null}
            
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={sunPos} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize={[512, 512]} // Optimized for mobile/web
              shadow-camera-left={-25}
              shadow-camera-right={25}
              shadow-camera-top={25}
              shadow-camera-bottom={-25}
            />

            <Player 
              stamina={state.stamina} 
              onStaminaChange={() => {}} 
              onPosUpdate={setPlayerPos}
              getBlock={getBlock}
            />
            
            <Weather type={state.weather} />

            <group>
              {visibleBlocks.map(([key, type]) => {
                const [x, y, z] = key.split(',').map(Number);
                return (
                  <Block 
                    key={key} 
                    position={[x, y, z]} 
                    type={type as any}
                    onAdd={(pos) => addBlock(pos[0], pos[1], pos[2], state.inventory[state.selectedSlot]?.type || 'dirt')}
                    onRemove={(pos) => removeBlock(pos[0], pos[1], pos[2])}
                    onInteract={(pos) => interactBlock(pos[0], pos[1], pos[2])}
                  />
                );
              })}
            </group>

            <Environment preset="night" blur={1} />
            <SoftShadows size={2} samples={10} focus={0} />
          </Suspense>
        </Canvas>

        <HUD 
          state={state} 
          onSelectSlot={setSlot} 
          onToggleCrafting={onToggleCrafting => toggleCrafting(onToggleCrafting)}
          onCraftItem={() => {}} 
          onSetMode={() => {}}
        />
        
        <div className="absolute top-4 left-4 text-white/40 text-[9px] font-mono pointer-events-none uppercase tracking-widest leading-relaxed">
          VoxelVerse Infinite [VERCEL_OPTIMIZED]<br/>
          CHUNKS: {Object.keys(state.chunks).length}<br/>
          BLOCKS: {visibleBlocks.length}<br/>
          XYZ: {state.playerPosition[0].toFixed(1)}, {state.playerPosition[1].toFixed(1)}, {state.playerPosition[2].toFixed(1)}
        </div>
      </div>
    </KeyboardControls>
  );
};

export default App;
