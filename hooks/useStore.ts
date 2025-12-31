
import { useState, useCallback, useEffect, useMemo } from 'react';
import { BlockType, GameState, Recipe, Mob } from '../types';

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 2; // Radius of chunks around player

const generateChunk = (cx: number, cz: number) => {
  const blocks: Record<string, BlockType> = {};
  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      const worldX = cx * CHUNK_SIZE + x;
      const worldZ = cz * CHUNK_SIZE + z;
      
      const nx = worldX / 20;
      const nz = worldZ / 20;
      const noise = Math.sin(nx) * Math.cos(nz) + Math.sin(nx * 0.5) * 0.5;
      const h = Math.floor((noise + 1) * 6) + 3;

      for (let y = 0; y <= h; y++) {
        let type: BlockType = 'stone';
        if (y === h) {
          if (h < 5) type = 'sand';
          else type = 'grass';
          
          // Add some random interactive objects
          if (cx === 0 && cz === 0 && worldX === 5 && worldZ === 5) {
            blocks[`${worldX},${y+1},${worldZ}`] = 'crafting_table';
          }
          if (Math.random() > 0.99) {
            blocks[`${worldX},${y+1},${worldZ}`] = 'lever';
          }
        } else if (y > h - 3) {
          type = 'dirt';
        }
        blocks[`${worldX},${y},${worldZ}`] = type;
      }
      if (h < 5) {
        for (let y = h + 1; y <= 5; y++) {
          blocks[`${worldX},${y},${worldZ}`] = 'water';
        }
      }
    }
  }
  return blocks;
};

export const useStore = () => {
  const [state, setState] = useState<GameState>({
    chunks: {},
    inventory: [
      { type: 'wood', count: 64 },
      { type: 'dirt', count: 64 },
      { type: 'stone', count: 64 },
      { type: 'crafting_table', count: 5 },
      { type: 'lever', count: 10 },
      { type: 'redstone_lamp', count: 10 },
    ],
    selectedSlot: 0,
    health: 100,
    hunger: 100,
    stamina: 100,
    time: 0.1,
    isCraftingOpen: false,
    gameMode: 'survival',
    mobs: [],
    weather: 'clear',
    playerPosition: [0, 20, 0],
  });

  const getBlock = useCallback((x: number, y: number, z: number) => {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunkKey = `${cx},${cz}`;
    return state.chunks[chunkKey]?.[`${x},${y},${z}`];
  }, [state.chunks]);

  useEffect(() => {
    const px = Math.floor(state.playerPosition[0] / CHUNK_SIZE);
    const pz = Math.floor(state.playerPosition[2] / CHUNK_SIZE);
    
    let neededChunks: Record<string, Record<string, BlockType>> = { ...state.chunks };
    let changed = false;

    for (let x = px - RENDER_DISTANCE; x <= px + RENDER_DISTANCE; x++) {
      for (let z = pz - RENDER_DISTANCE; z <= pz + RENDER_DISTANCE; z++) {
        const key = `${x},${z}`;
        if (!neededChunks[key]) {
          neededChunks[key] = generateChunk(x, z);
          changed = true;
        }
      }
    }

    if (changed) {
      setState(prev => ({ ...prev, chunks: neededChunks }));
    }
  }, [state.playerPosition]);

  const addBlock = useCallback((x: number, y: number, z: number, type: BlockType) => {
    setState((prev) => {
      const cx = Math.floor(x / CHUNK_SIZE);
      const cz = Math.floor(z / CHUNK_SIZE);
      const chunkKey = `${cx},${cz}`;
      const newChunks = { ...prev.chunks };
      if (!newChunks[chunkKey]) newChunks[chunkKey] = {};
      newChunks[chunkKey][`${x},${y},${z}`] = type;
      return { ...prev, chunks: newChunks };
    });
  }, []);

  const removeBlock = useCallback((x: number, y: number, z: number) => {
    setState((prev) => {
      const cx = Math.floor(x / CHUNK_SIZE);
      const cz = Math.floor(z / CHUNK_SIZE);
      const chunkKey = `${cx},${cz}`;
      const newChunks = { ...prev.chunks };
      if (newChunks[chunkKey]) {
        delete newChunks[chunkKey][`${x},${y},${z}`];
      }
      return { ...prev, chunks: newChunks };
    });
  }, []);

  const setPlayerPos = (pos: [number, number, number]) => {
    setState(s => ({ ...s, playerPosition: pos }));
  };

  const interactBlock = (x: number, y: number, z: number) => {
    setState(prev => {
      const cx = Math.floor(x / CHUNK_SIZE);
      const cz = Math.floor(z / CHUNK_SIZE);
      const chunkKey = `${cx},${cz}`;
      const type = prev.chunks[chunkKey]?.[`${x},${y},${z}`];
      
      if (type === 'crafting_table') return { ...prev, isCraftingOpen: true };
      
      if (type === 'lever' || type === 'lever_on') {
        const newChunks = { ...prev.chunks };
        const newState = type === 'lever' ? 'lever_on' : 'lever';
        newChunks[chunkKey][`${x},${y},${z}`] = newState;
        
        // Toggle neighbors for redstone logic
        const neighbors = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
        neighbors.forEach(([dx, dy, dz]) => {
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;
          const ncx = Math.floor(nx / CHUNK_SIZE);
          const ncz = Math.floor(nz / CHUNK_SIZE);
          const nKey = `${ncx},${ncz}`;
          const blockKey = `${nx},${ny},${nz}`;
          const nType = newChunks[nKey]?.[blockKey];
          
          if (nType === 'redstone_lamp' && newState === 'lever_on') newChunks[nKey][blockKey] = 'redstone_lamp_on';
          else if (nType === 'redstone_lamp_on' && newState === 'lever') newChunks[nKey][blockKey] = 'redstone_lamp';
        });
        
        return { ...prev, chunks: newChunks };
      }
      
      return prev;
    });
  };

  const setSlot = (i: number) => setState(s => ({ ...s, selectedSlot: i }));
  const toggleCrafting = (o?: boolean) => setState(s => ({ ...s, isCraftingOpen: o ?? !s.isCraftingOpen }));

  return { 
    state, 
    addBlock, 
    removeBlock, 
    interactBlock, 
    setSlot, 
    toggleCrafting, 
    setPlayerPos,
    getBlock
  };
};
