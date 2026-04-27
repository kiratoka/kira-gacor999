import React from 'react';
import { Dices, LineChart, Brain, GraduationCap, CircleHelp, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { PageId } from '../App';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { balance, isSidebarMinimized, toggleSidebar } = useGameStore();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 bg-surface-container-low border-r border-white/5 shadow-2xl shadow-primary-container/10 transition-all duration-300 ${
        isSidebarMinimized ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`p-6 flex items-center ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
        {!isSidebarMinimized && (
          <h1 className="text-primary-container font-bold text-xl font-headline tracking-tighter truncate">KiraGacor999</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={isSidebarMinimized ? 'Perbesar Sidebar' : 'Perkecil Sidebar'}
        >
          {isSidebarMinimized ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {!isSidebarMinimized && (
        <div className="px-4 py-2 mb-6">
          <div className="bg-surface-container-highest p-4 rounded-sm border-l-4 border-primary-container">
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Saldo Simulasi</p>
            <h2 className="text-xl font-headline font-bold text-primary-container truncate">Rp {balance.toLocaleString('id-ID')}</h2>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 space-y-1 overflow-x-hidden">
        {[
          { id: 'simulator' as PageId, label: 'Simulator', icon: <Dices className="w-5 h-5" /> },
          { id: 'realita' as PageId, label: 'Cek Realita', icon: <LineChart className="w-5 h-5" /> },
          { id: 'logika' as PageId, label: 'Logika Penipuan', icon: <Brain className="w-5 h-5" /> },
        ].map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center py-3 font-bold transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-primary-container/10 text-primary-container border-r-4 border-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
              } ${isSidebarMinimized ? 'px-0 justify-center' : 'px-4'}`}
              title={item.label}
            >
              <span className={isSidebarMinimized ? 'mr-0' : 'mr-3 shrink-0'}>{item.icon}</span>
              {!isSidebarMinimized && <span className="font-label truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}