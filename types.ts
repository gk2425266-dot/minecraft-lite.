
export type BlockType = 
  | 'grass' | 'dirt' | 'stone' | 'wood' | 'leaf' | 'water' | 'sand' | 'snow' 
  | 'gold' | 'diamond' | 'lava' | 'crafting_table' | 'jungle_wood' | 'cactus' 
  | 'ice' | 'obsidian' | 'lever' | 'lever_on' | 'redstone_lamp' | 'redstone_lamp_on';

export type GameMode = 'survival' | 'creative' | 'hardcore';

export interface Mob {
  id: string;
  type: 'golem' | 'stalker';
  pos: [number, number, number];
  health: number;
}

export interface InventoryItem {
  type: BlockType;
  count: number;
}

export interface GameState {
  chunks: Record<string, Record<string, BlockType>>; // Keyed by "cx,cz", value is block map "x,y,z"
  inventory: InventoryItem[];
  selectedSlot: number;
  health: number;
  hunger: number;
  stamina: number;
  time: number;
  isCraftingOpen: boolean;
  gameMode: GameMode;
  mobs: Mob[];
  weather: 'clear' | 'rain' | 'snow';
  playerPosition: [number, number, number];
}

export interface Message {
  role: 'user' | 'ai';
  text: string;
}

export interface Recipe {
  result: BlockType;
  resultCount: number;
  ingredients: { type: BlockType; count: number }[];
}
