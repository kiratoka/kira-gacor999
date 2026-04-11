import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AlertTriangle, TrendingDown, Wallet, TrendingUp, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function GameStats() {
  const { stats, balance, phase, topUp } = useGameStore();
  const [showTopUp, setShowTopUp] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const isProfit = stats.netLoss < 0;
  const displayNetLoss = Math.abs(stats.netLoss);

  const handleTopUp = (amount: number) => {
    topUp(amount);
    setShowTopUp(false);
    setCustomAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div id="saldo-display" data-tutorial="saldo" className="bg-surface-container-high p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary-container" />
            <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Saldo Saat Ini</h3>
          </div>
          <button
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-2 bg-primary-container/10 hover:bg-primary-container/20 text-primary-container px-3 py-1.5 rounded-lg transition-colors border border-primary-container/30 text-xs font-bold shrink-0 relative z-10 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Saldo</span>
          </button>
        </div>
        <div className="text-4xl font-headline font-black text-white relative z-10">
          Rp {balance.toLocaleString('id-ID')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div id="total-main" data-tutorial="total-main" className="bg-surface-container-low p-4 rounded-xl border border-white/5">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Total Deposit/Main</p>
          <p className="text-lg font-headline font-bold text-white">Rp {stats.totalPlayed.toLocaleString('id-ID')}</p>
        </div>
        <div id="total-menang" data-tutorial="total-menang" className="bg-surface-container-low p-4 rounded-xl border border-white/5">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Total Menang</p>
          <p className="text-lg font-headline font-bold text-primary-container">Rp {stats.totalWon.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Net Loss Alert */}
      <div id="net-loss" data-tutorial="houseEdge" className={`p-4 rounded-xl border flex items-start gap-3 ${isProfit ? 'bg-lime-500/10 border-lime-500/30' : 'bg-tertiary-container/10 border-tertiary/30'}`}>
        {isProfit ? <TrendingUp className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" /> : <TrendingDown className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />}
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isProfit ? 'text-lime-400' : 'text-tertiary'}`}>
            {isProfit ? 'Keuntungan Sementara' : 'Kerugian Bersih (House Edge)'}
          </p>
          <p className={`text-xl font-headline font-black ${isProfit ? 'text-lime-400' : 'text-tertiary'}`}>
            {isProfit ? '+' : ''}Rp {displayNetLoss.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-2 leading-relaxed">
            {isProfit 
              ? 'Kamu sedang untung, tapi sistem akan segera mengambilnya kembali.' 
              : 'Secara matematis, sistem dirancang agar angka ini terus bertambah seiring waktu Anda bermain.'}
          </p>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-tertiary">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-tertiary" />
          <p className="text-xs font-bold text-tertiary uppercase tracking-widest">Status Algoritma</p>
        </div>
        <p className="text-sm text-white font-medium">
          {phase === 1 && "Fase 1: Hook (Memberikan kemenangan mudah untuk memancing dopamin)"}
          {phase === 2 && "Fase 2: Transisi (Mulai menyeimbangkan RNG untuk mengambil kembali saldo)"}
          {phase === 3 && "Fase 3: Pengurasan (Sistem aktif mencegah combo dan kemenangan besar)"}
        </p>
      </div>

      {/* Top Up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowTopUp(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface-container-highest border border-primary-container/30 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] w-full max-w-sm"
            >
              <button 
                onClick={() => setShowTopUp(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-headline font-bold text-white mb-2">Tambah Saldo</h3>
              <p className="text-xs text-on-surface-variant mb-6 italic border-l-2 border-primary-container/50 pl-3 py-1">
                "Tambahkan saldo untuk melanjutkan permainan dan mengejar kemenangan."
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[50000, 100000, 200000, 500000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleTopUp(amount)}
                    className="p-3 rounded-xl bg-surface-container-high border border-white/10 hover:border-primary-container/50 hover:bg-primary-container/10 transition-all text-sm font-bold text-white font-mono cursor-pointer"
                  >
                    Rp {(amount / 1000)}k
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-on-surface-variant text-sm font-mono">Rp</span>
                </div>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Nominal lainnya..."
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-container/50 font-mono"
                />
              </div>
              
              <button
                onClick={() => {
                  const val = parseInt(customAmount);
                  if (!isNaN(val) && val > 0) handleTopUp(val);
                }}
                disabled={!customAmount || isNaN(parseInt(customAmount)) || parseInt(customAmount) <= 0}
                className="w-full mt-4 py-3 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Top Up Sekarang
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
