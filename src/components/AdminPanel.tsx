import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Settings, ShieldAlert } from 'lucide-react';

export function AdminPanel() {
  const { adminTargetWin, setAdminTargetWin } = useGameStore();
  const [customValue, setCustomValue] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customValue);
    if (!isNaN(val)) {
      setAdminTargetWin(val);
    }
  };

  return (
    <div id="admin-panel" data-tutorial="admin-panel" className="bg-purple-950/20 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-900/50 rounded-lg border border-purple-500/30">
          <Settings className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="font-label text-xs uppercase tracking-widest text-purple-400 font-bold">Kontrol Sistem (Simulasi Admin)</h3>
      </div>

      <p className="text-xs text-purple-200/70 leading-relaxed mb-6">
        Dalam banyak sistem judi online, kemenangan pemain dapat diatur. Sistem dapat menentukan siapa yang menang, kapan menang, dan berapa jumlahnya.
      </p>

      <div className="space-y-4">
        <p className="text-[10px] font-label uppercase tracking-widest text-purple-300/50">Target Kemenangan Pemain</p>
        <div className="grid grid-cols-3 gap-2">
          {[10000, 25000, 50000].map(val => (
            <button
              key={val}
              onClick={() => setAdminTargetWin(val)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${adminTargetWin === val ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:bg-purple-900/60'}`}
            >
              Rp {val.toLocaleString('id-ID')}
            </button>
          ))}
        </div>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Custom (Rp)"
            className="flex-1 bg-purple-950/40 border border-purple-500/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-purple-400"
          />
          <button type="submit" className="px-4 py-2 bg-purple-900/60 text-purple-300 rounded-xl text-xs font-bold border border-purple-500/20 hover:bg-purple-800/60">
            Set
          </button>
        </form>
        <button 
          onClick={() => setAdminTargetWin(null)}
          className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${adminTargetWin === null ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:bg-purple-900/60'}`}
        >
          Auto (RNG Manipulasi Default)
        </button>
      </div>
    </div>
  );
}
