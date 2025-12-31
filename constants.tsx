
import { BlockType, Recipe } from './types';

export const BLOCK_SIZE = 1;
export const WORLD_SIZE = 40; // Slightly smaller default for higher performance on web
export const WORLD_HEIGHT = 20;

export const BLOCK_METADATA: Record<BlockType, { color: string; roughness: number; metalness: number; emissive?: string }> = {
  grass: { color: '#4d7c0f', roughness: 0.8, metalness: 0 },
  dirt: { color: '#451a03', roughness: 0.9, metalness: 0 },
  stone: { color: '#57534e', roughness: 0.6, metalness: 0.1 },
  wood: { color: '#78350f', roughness: 0.7, metalness: 0 },
  jungle_wood: { color: '#3f2b1d', roughness: 0.8, metalness: 0 },
  leaf: { color: '#166534', roughness: 1.0, metalness: 0 },
  water: { color: '#1d4ed8', roughness: 0.1, metalness: 0.2, emissive: '#1e3a8a' },
  sand: { color: '#fde047', roughness: 0.9, metalness: 0 },
  snow: { color: '#f8fafc', roughness: 0.4, metalness: 0 },
  ice: { color: '#93c5fd', roughness: 0.05, metalness: 0.1 },
  cactus: { color: '#15803d', roughness: 0.9, metalness: 0 },
  gold: { color: '#eab308', roughness: 0.2, metalness: 0.8, emissive: '#854d0e' },
  diamond: { color: '#22d3ee', roughness: 0.1, metalness: 0.5, emissive: '#0891b2' },
  lava: { color: '#ea580c', roughness: 0.5, metalness: 0, emissive: '#fb923c' },
  obsidian: { color: '#1e1b4b', roughness: 0.1, metalness: 0.3 },
  crafting_table: { color: '#a16207', roughness: 0.6, metalness: 0 },
  lever: { color: '#4b5563', roughness: 0.5, metalness: 0.2 },
  lever_on: { color: '#4b5563', roughness: 0.5, metalness: 0.2, emissive: '#ef4444' },
  redstone_lamp: { color: '#450a0a', roughness: 0.8, metalness: 0 },
  redstone_lamp_on: { color: '#f87171', roughness: 0.1, metalness: 0, emissive: '#ef4444' },
};

export const CRAFTING_RECIPES: Recipe[] = [
  { result: 'crafting_table', resultCount: 1, ingredients: [{ type: 'wood', count: 4 }] },
  { result: 'redstone_lamp', resultCount: 1, ingredients: [{ type: 'stone', count: 4 }, { type: 'gold', count: 1 }] },
  { result: 'lever', resultCount: 1, ingredients: [{ type: 'stone', count: 1 }, { type: 'wood', count: 1 }] },
  { result: 'obsidian', resultCount: 1, ingredients: [{ type: 'stone', count: 4 }, { type: 'lava', count: 1 }] },
];
