import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InteractiveMatch3 } from './components/InteractiveMatch3';
import { GameStats } from './components/GameStats';
import { SpotlightTutorial } from './components/SpotlightTutorial';
import { Paytable } from './components/Paytable';
import { Withdraw } from './components/Withdraw';
import { AdminPanel } from './components/AdminPanel';
import { BalanceChart } from './components/BalanceChart';
import { LogikaPage } from './components/LogikaPage';
import { Dices, LineChart, Brain, GraduationCap } from 'lucide-react';
import { useGameStore } from './store/gameStore';

export type PageId = 'simulator' | 'logika';

export default function App() {
  const isSidebarMinimized = useGameStore(state => state.isSidebarMinimized);
  const [currentPage, setCurrentPage] = useState<PageId>('simulator');

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary-container/30">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className={`pt-24 min-h-screen relative z-10 pb-24 md:pb-6 transition-all duration-300 ${isSidebarMinimized ? 'md:pl-20' : 'md:pl-64'}`}>

        {currentPage === 'simulator' && (
          <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* ── Bento Grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                {/* ── Left Column ── */}
                <div className="lg:col-span-3 flex flex-col gap-4">

                  {/* Hero */}
                  <div className="bg-surface-container-low p-5 neon-border-cyan rounded-2xl">
                    <h2 className="text-xl font-headline font-bold text-primary-container leading-tight mb-1.5">
                      Simulator Permata Beracun
                    </h2>
                    <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                      Visual mewah hanyalah distraksi. Rasakan bagaimana sistem perlahan menguras saldo Anda.
                    </p>
                  </div>

                  {/* Rules */}
                  <div className="bg-surface-container-high p-5 rounded-2xl">
                    <h3 className="font-label text-[10px] uppercase tracking-[0.2rem] text-tertiary font-bold mb-3">
                      Aturan Main
                    </h3>
                    <ul className="space-y-2.5 text-xs text-on-surface-variant">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-container font-bold mt-0.5 shrink-0">•</span>
                        <span>Geser permata untuk mencocokkan 3 atau lebih secara horizontal / vertikal.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-tertiary font-bold mt-0.5 shrink-0">•</span>
                        <span>Setiap geseran memotong saldo sesuai taruhan yang dipilih.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-container font-bold mt-0.5 shrink-0">•</span>
                        <span>Cocokkan lebih banyak tile untuk memicu combo dan hadiah berlipat.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Paytable */}
                  <Paytable />
                </div>

                {/* ── Center Column ── */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <InteractiveMatch3 />
                </div>

                {/* ── Right Column ── */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <GameStats />
                  <AdminPanel />
                  <Withdraw />
                </div>
              </div>

              {/* ── Balance Chart ── */}
              <BalanceChart />

            </div>
          </div>
        )}

        {currentPage === 'logika' && <LogikaPage />}
      </main>

      {currentPage === 'simulator' && <SpotlightTutorial />}

      {/* Background Decorations */}
      <div className="fixed top-0 right-0 -z-0 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-0 w-[400px] h-[400px] bg-tertiary/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low flex justify-around items-center p-4 border-t border-white/5 z-50">
        <button onClick={() => setCurrentPage('simulator')} className={`flex flex-col items-center ${currentPage === 'simulator' ? 'text-primary-container' : 'text-on-surface-variant'}`}>
          <Dices className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Simulator</span>
        </button>
        <button onClick={() => setCurrentPage('logika')} className={`flex flex-col items-center ${currentPage === 'logika' ? 'text-primary-container' : 'text-on-surface-variant'}`}>
          <Brain className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Logika</span>
        </button>
        <a href="#" className="flex flex-col items-center text-on-surface-variant">
          <LineChart className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Realita</span>
        </a>
        <a href="#" className="flex flex-col items-center text-on-surface-variant">
          <GraduationCap className="w-6 h-6" />
          <span className="text-[10px] font-label mt-1 uppercase">Edukasi</span>
        </a>
      </nav>
    </div>
  );
}