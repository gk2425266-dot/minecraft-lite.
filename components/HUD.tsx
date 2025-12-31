
import React, { useState } from 'react';
import { Heart, Utensils, Zap, MessageSquare, Send, Hammer, X, Sun, Swords, CloudRain } from 'lucide-react';
import { GameState, Message, Recipe, GameMode } from '../types';
import { BLOCK_METADATA, CRAFTING_RECIPES } from '../constants';
import { getAIAdvice } from '../services/geminiService';

interface HUDProps {
  state: GameState;
  onSelectSlot: (idx: number) => void;
  onToggleCrafting: (open: boolean) => void;
  onCraftItem: (recipe: Recipe) => void;
  onSetMode: (mode: GameMode) => void;
}

const HUD: React.FC<HUDProps> = ({ state, onSelectSlot, onToggleCrafting, onCraftItem, onSetMode }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'VoxelVerse Oracle Online. Mode: ' + state.gameMode.toUpperCase() + '. Press V to toggle camera.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);
    const aiResponse = await getAIAdvice(userMsg, `Mode: ${state.gameMode}. Stamina: ${state.stamina}. Weather: ${state.weather}.`);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="space-y-3 pointer-events-auto">
          <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
             <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <div className="w-40 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${state.health}%` }}></div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Utensils className="w-4 h-4 text-orange-500 fill-orange-500" />
                <div className="w-40 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${state.hunger}%` }}></div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
                <div className="w-40 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${state.stamina}%` }}></div>
                </div>
             </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => onSetMode('survival')} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${state.gameMode === 'survival' ? 'bg-red-600 border-red-400 text-white' : 'bg-black/40 border-white/10 text-white/50'}`}>SURVIVAL</button>
            <button onClick={() => onSetMode('creative')} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${state.gameMode === 'creative' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-white/50'}`}>CREATIVE</button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white text-[10px] font-mono flex items-center gap-2">
              {state.weather === 'clear' ? <Sun className="w-3 h-3" /> : <CloudRain className="w-3 h-3" />}
              {state.weather.toUpperCase()} | {state.time < 0.5 ? 'AM' : 'PM'}
           </div>
           <button onClick={() => setChatOpen(!chatOpen)} className="pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2">
             <MessageSquare className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Crafting Menu Placeholder - Same as before but with updated styles */}
      {state.isCraftingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-auto">
           <div className="w-96 bg-neutral-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 bg-amber-900/20 flex justify-between items-center">
                 <h2 className="text-white font-black flex items-center gap-2"><Hammer className="w-5 h-5" /> CRAFTING</h2>
                 <button onClick={() => onToggleCrafting(false)} className="text-white/50 hover:text-white"><X /></button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-80">
                 {CRAFTING_RECIPES.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: BLOCK_METADATA[r.result].color }}></div>
                          <span className="text-white text-xs font-bold uppercase">{r.result}</span>
                       </div>
                       <button onClick={() => onCraftItem(r)} className="bg-amber-600 text-white text-[10px] px-3 py-1 rounded-lg font-bold">CRAFT</button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed top-24 right-6 w-80 bg-black/90 border border-white/20 rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-indigo-900/40 text-white font-bold text-xs uppercase tracking-widest">Oracle Terminal</div>
          <div className="h-60 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m, i) => <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-2 rounded-xl ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300'}`}>{m.text}</div></div>)}
          </div>
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none" placeholder="..." />
            <button onClick={handleSend} className="bg-indigo-600 p-2 rounded-lg text-white"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Hotbar */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2 pointer-events-auto bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
          {state.inventory.slice(0, 9).map((item, i) => {
            const isSelected = state.selectedSlot === i;
            return (
              <button key={i} onClick={() => onSelectSlot(i)} className={`relative w-12 h-12 rounded-xl transition-all border-2 ${isSelected ? 'border-white scale-110 bg-white/10' : 'border-transparent hover:bg-white/5'}`} style={{ backgroundColor: BLOCK_METADATA[item.type].color }}>
                <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white drop-shadow-lg">{item.count}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default HUD;
