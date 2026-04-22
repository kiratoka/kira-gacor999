import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CreditCard, AlertCircle, Loader2, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Withdraw() {
  const { balance, stats, setWithdrawAttempted, hasWithdrawn, setHasWithdrawn } = useGameStore();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleWithdraw = () => {
    if (balance < 50000) {
      setError("Minimal penarikan Rp 50.000");
      return;
    }
    if (stats.totalPlayed < 300000) {
      setError(`Syarat turnover belum tercapai. Kurang Rp ${(300000 - stats.totalPlayed).toLocaleString('id-ID')}`);
      return;
    }
    
    setIsWithdrawing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    setWithdrawAttempted(true);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) {
        currentProgress = 90;
        clearInterval(interval);
        
        setTimeout(() => {
          if (!hasWithdrawn && stats.totalWon >= 50000) {
            setProgress(100);
            setSuccess("Penarikan berhasil diproses.");
            setHasWithdrawn(true);
            setIsWithdrawing(false);
          } else {
            setError(Math.random() > 0.5 ? "Sistem sedang sibuk. Silakan coba lagi nanti." : "Verifikasi gagal. Akun Anda sedang ditinjau.");
          }
        }, 3000);
      }
      setProgress(Math.min(currentProgress, 90));
    }, 500);
  };

  return (
    // ↓ removed the old "mt-6" — parent gap-4 handles spacing now
    <div className="space-y-4">
      <div id="withdraw-section" data-tutorial="withdraw" className="bg-surface-container-high p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-label text-xs uppercase tracking-[0.2rem] text-primary-container font-bold">Tarik Saldo</h3>
            <p className="text-xs text-on-surface-variant mt-1">Minimal penarikan: Rp 50.000 & TO Rp 300.000</p>
          </div>
          <CreditCard className="w-6 h-6 text-primary-container opacity-50" />
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isWithdrawing ? "Memproses..." : "Tarik Sekarang"}
        </button>

        <AnimatePresence>
          {(isWithdrawing || success || error) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {isWithdrawing && !error && !success && (
                <>
                  <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                    <span>Menghubungi server bank...</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary-container"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear", duration: 0.5 }}
                    />
                  </div>
                </>
              )}
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-tertiary-container/20 border border-tertiary/30 rounded-lg flex items-start gap-2 text-tertiary"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-lime-500/10 border border-lime-500/20 rounded-xl flex items-start gap-2"
                >
                  <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-lime-400 leading-relaxed">{success}</p>
                </motion.div>
              )}
              
              {!error && !success && progress === 90 && (
                <div className="flex items-center gap-2 text-xs text-primary-container mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Menunggu verifikasi akhir...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Moral Message */}
      <div
        id="moral-message"
        data-tutorial="withdraw-moral"
        style={{
          backgroundColor: 'rgba(255,45,107,0.06)',
          border: '1px solid rgba(255,45,107,0.28)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 0 28px rgba(255,45,107,0.08)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255,45,107,0.15)',
              borderRadius: '10px',
              border: '1px solid rgba(255,45,107,0.3)',
              flexShrink: 0,
            }}
          >
            <AlertTriangle style={{ width: '18px', height: '18px', color: '#ff2d6b' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#ff2d6b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                textShadow: '0 0 10px rgba(255,45,107,0.4)',
              }}
            >
              Fakta Tersembunyi
            </h4>
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,160,180,0.8)',
                lineHeight: 1.7,
                fontStyle: 'italic',
                margin: 0,
                borderLeft: '2px solid rgba(255,45,107,0.3)',
                paddingLeft: '12px',
              }}
            >
              "Meskipun kamu berhasil menang, itu bisa jadi hanya keberuntungan yang diatur. Bahkan jika
              kamu berhasil menarik Rp 50.000, itu bukan berarti kamu mengalahkan sistem. Banyak pemain lain
              terus kalah untuk menutupi kemenangan tersebut. Dan kemungkinan besar, kamu akan kembali
              bermain dan kehilangan lebih banyak."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}