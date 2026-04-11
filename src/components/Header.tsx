import React from 'react';
import { Wallet, Bell } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Header() {
  const isSidebarMinimized = useGameStore(state => state.isSidebarMinimized);

  return (
    <header className={`fixed top-0 w-full z-30 transition-all duration-300 ${isSidebarMinimized ? 'md:pl-20' : 'md:pl-64'}`}>
      <div className="bg-black/60 backdrop-blur-xl border-b border-primary-container/20 px-6 py-4 flex justify-between items-center shadow-[0_0_15px_rgba(0,255,255,0.1)]">
        <div className="flex items-center gap-8">
          <div className="md:hidden text-2xl font-black italic tracking-tighter text-primary-container font-headline">KiraSlot999</div>
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-primary-container border-b-2 border-primary-container pb-1 font-label text-xs uppercase tracking-widest cursor-pointer">Simulator</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label text-xs uppercase tracking-widest cursor-pointer">Kenapa Ini Penipuan</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label text-xs uppercase tracking-widest cursor-pointer">Matematika Sebenarnya</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button className="p-2 text-primary-container hover:bg-primary-container/10 transition-all rounded cursor-pointer">
              <Wallet className="w-6 h-6" />
            </button>
            <button className="p-2 text-primary-container hover:bg-primary-container/10 transition-all rounded cursor-pointer">
              <Bell className="w-6 h-6" />
            </button>
          </div>
          <button className="bg-primary-container text-on-primary-container px-6 py-2 font-bold font-label text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all active:scale-95 rounded-sm cursor-pointer">
            Daftar Edukasi
          </button>
        </div>
      </div>
    </header>
  );
}
