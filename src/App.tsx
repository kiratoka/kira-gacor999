import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InteractiveMatch3 } from './components/InteractiveMatch3';
import { GameStats } from './components/GameStats';
import { SpotlightTutorial } from './components/SpotlightTutorial';
import { Paytable } from './components/Paytable';
import { Withdraw } from './components/Withdraw';
import { AdminPanel } from './components/AdminPanel';
import { BalanceChart } from './components/BalanceChart';
import { Dices, LineChart, Brain, GraduationCap } from 'lucide-react';
import { useGameStore } from './store/gameStore';

export default function App() {
  const isSidebarMinimized = useGameStore(state => state.isSidebarMinimized);

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary-container/30">
      <Sidebar />
      <Header />
      
      <main className={`pt-24 min-h-screen p-6 relative z-10 pb-24 md:pb-6 transition-all duration-300 ${isSidebarMinimized ? 'md:pl-20' : 'md:pl-64'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel: Info */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-surface-container-low p-6 neon-border-cyan rounded-2xl">
                <h2 className="text-2xl font-headline font-bold text-primary-container leading-tight mb-2">Simulator Permata Beracun</h2>
                <p className="text-sm text-on-surface-variant font-body">
                  Visual mewah hanyalah distraksi. Coba mainkan dan rasakan bagaimana sistem perlahan menguras saldo Anda.
                </p>
              </div>
              
              <div className="bg-surface-container-high p-6 rounded-2xl space-y-4">
                <h3 className="font-label text-xs uppercase tracking-[0.2rem] text-tertiary font-bold">Aturan Main</h3>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-container font-bold">•</span>
                    <span>Geser permata untuk mencocokkan 3 atau lebih.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tertiary font-bold">•</span>
                    <span>Setiap geseran memotong saldo sesuai taruhan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-container font-bold">•</span>
                    <span>Cocokkan lebih banyak untuk combo.</span>
                  </li>
                </ul>
              </div>

              <Paytable />
            </div>

            {/* Center Panel: Game Grid */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <InteractiveMatch3 />
            </div>

            {/* Right Panel: Stats */}
            <div className="lg:col-span-4 space-y-6">
              <GameStats />
              <AdminPanel />
              <Withdraw />
            </div>
          </div>

          {/* Bottom Panel: Real-time Balance Chart */}
          <div className="w-full">
            <BalanceChart />
          </div>

        </div>
      </main>

      <SpotlightTutorial />

      {/* Background Decorations */}
      <div className="fixed top-0 right-0 -z-0 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-0 w-[400px] h-[400px] bg-tertiary/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      {/* Mobile Bottom Nav (Simplified) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low flex justify-around items-center p-4 border-t border-white/5 z-50">
        <a href="#" className="flex flex-col items-center text-primary-container">
          <Dices className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Simulator</span>
        </a>
        <a href="#" className="flex flex-col items-center text-on-surface-variant">
          <LineChart className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Realita</span>
        </a>
        <a href="#" className="flex flex-col items-center text-on-surface-variant">
          <Brain className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Logika</span>
        </a>
        <a href="#" className="flex flex-col items-center text-on-surface-variant">
          <GraduationCap className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Edukasi</span>
        </a>
      </nav>
    </div>
  );
}
