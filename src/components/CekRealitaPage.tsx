import React, { useMemo } from 'react';
import { Brain, AlertTriangle, TrendingDown, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function CekRealitaPage() {
  const { balance, balanceHistory, totalDeposit, stats, phase } = useGameStore();

  // Calculate stats based on history and absolute amounts
  const historyStats = useMemo(() => {
    // Perhitungan berdasarkan NOMINAL (Uang), bukan sekadar frekuensi menang/kalah
    const totalTaruhan = stats.totalPlayed;
    const totalHadiah = stats.totalWon;
    
    const totalVolume = totalTaruhan + totalHadiah || 1; // Fallback to avoid NaN
    const taruhanRatioPct = Math.round((totalTaruhan / totalVolume) * 100);

    // Hitung Net Profit / Loss murni (Keuntungan - Modal)
    const netAmount = totalHadiah - totalTaruhan;
    const isNetLoss = netAmount < 0; // True jika Modal > Keuntungan
    const netPercentage = totalTaruhan > 0 
      ? Math.abs((netAmount / totalTaruhan) * 100) 
      : 0;

    // Calculate total loss rate vs deposit (utk grafik line chart tren saldo)
    const lossAmount = totalDeposit - balance;
    const lossRatePct = totalDeposit > 0 ? (lossAmount / totalDeposit) * 100 : 0;
    const isBalanceNetLoss = lossAmount > 0;

    return {
      totalTaruhan,
      totalHadiah,
      taruhanRatioPct: totalTaruhan === 0 && totalHadiah === 0 ? 0 : taruhanRatioPct,
      netPercentage,
      isNetLoss,
      lossRatePct: Math.abs(Math.round(lossRatePct)),
      isBalanceNetLoss
    };
  }, [balance, totalDeposit, stats]);

  // Generate SVG path from balance history
  const chartPath = useMemo(() => {
    if (balanceHistory.length < 2) return "M0 50 L 100 50";
    
    // Reverse history to chronological order for the chart (if it isn't already)
    const data = [...balanceHistory];
    
    // Find min and max for scaling
    // Add some padding to max and min
    const maxVal = Math.max(...data.map(d => d.saldo), totalDeposit);
    const minVal = 0; // Always scale to 0 at the bottom
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      // y is inverted (0 is top, 100 is bottom in SVG)
      const y = 100 - (((d.saldo - minVal) / range) * 80 + 10); // keep it within 10-90% bounds
      return `${x} ${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [balanceHistory, totalDeposit]);

  // Calculate dynamic indicators
  const dopamineLevel = phase === 1 ? '90%' : phase === 2 ? '50%' : '15%';
  const dopamineStatus = phase === 1 ? 'High (Hook)' : phase === 2 ? 'Dropping' : 'Critical (Drain)';
  
  const sunkCostLevel = Math.min((stats.totalPlayed / 500000) * 100, 100);
  const sunkCostStatus = sunkCostLevel < 30 ? 'Low' : sunkCostLevel < 70 ? 'High' : 'Extremely High';

  // Format IDR helper
  const formatIDR = (num: number) => {
    return 'IDR ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="flex flex-col min-h-screen pt-4">
      <section className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tight uppercase italic">
            Dashboard <span className="text-[#00ffff]">Cek Realita</span>
          </h2>
          <p className="text-on-surface-variant font-body max-w-2xl text-sm md:text-base leading-relaxed">
            Forensik digital yang membuktikan secara matematis mengapa sistem slot dirancang untuk memastikan Anda kehilangan segalanya.
          </p>
        </div>

        {/* Dashboard Content: Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Tren Penurunan Saldo (Line Chart Concept) */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 border-t border-l border-[#00ffff]/30">
            <div className="flex justify-between items-start md:items-center mb-8 flex-col md:flex-row gap-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-[#c1fffe]">Tren Penurunan Saldo</h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Analisis Kehancuran Modal (60 Menit Terakhir)</p>
              </div>
              <div className="text-left md:text-right">
                <span className={`text-3xl font-headline font-bold leading-none block md:inline ${historyStats.isBalanceNetLoss ? 'text-tertiary' : 'text-[#00ffff]'}`}>
                  {historyStats.isBalanceNetLoss ? '-' : '+'}{historyStats.lossRatePct}%
                </span>
                <p className={`text-[10px] uppercase mt-1 ${historyStats.isBalanceNetLoss ? 'text-tertiary/60' : 'text-[#00ffff]/60'}`}>
                  {historyStats.isBalanceNetLoss ? 'Total Loss Rate' : 'Total Profit Rate'}
                </p>
              </div>
            </div>
            {/* Visual Mockup of Line Chart */}
            <div className="h-64 relative flex items-end gap-1">
              <div className="absolute inset-0 flex flex-col justify-between py-2 border-l border-b border-outline-variant/30">
                <div className="w-full border-t border-outline-variant/10 text-[10px] text-outline pl-2">{formatIDR(Math.max(...balanceHistory.map(d => d.saldo), totalDeposit))}</div>
                <div className="w-full border-t border-outline-variant/10 text-[10px] text-outline pl-2">{formatIDR(Math.max(...balanceHistory.map(d => d.saldo), totalDeposit) / 2)}</div>
                <div className="w-full border-t border-outline-variant/10 text-[10px] text-outline pl-2">IDR 0</div>
              </div>
              {/* The "Graph" */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d={chartPath} fill="none" stroke="#00ffff" strokeWidth="2" style={{ transition: 'd 0.5s ease-in-out' }}></path>
                <path d={`${chartPath} V 100 H 0 Z`} fill="url(#grad1)" opacity="0.3" style={{ transition: 'd 0.5s ease-in-out' }}></path>
                <defs>
                  <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#00ffff', stopOpacity:1}}></stop>
                    <stop offset="100%" style={{stopColor:'transparent', stopOpacity:1}}></stop>
                  </linearGradient>
                </defs>
              </svg>
              {/* Warning Markers */}
              {historyStats.isBalanceNetLoss && (
                <div className="absolute bottom-[20%] right-[10%] flex flex-col items-center">
                  <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></div>
                  <div className="text-[8px] text-tertiary font-bold bg-black/80 px-1 mt-1 border border-tertiary/30">KEJAR KEKALAHAN</div>
                </div>
              )}
            </div>
          </div>

          {/* Rasio Menang vs Kalah (Donut Chart) */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-high p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-headline font-bold text-[#c1fffe] mb-6 self-start uppercase tracking-widest">Realita Taruhan vs Hadiah</h3>
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              {/* Fake Donut Chart with SVG */}
              <svg className="w-full h-full -rotate-90">
                {/* Background circle (Keuntungan / Hadiah) */}
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="#00ffff" strokeWidth="20"></circle>
                {/* Foreground circle (Kerugian / Taruhan) */}
                <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="#ff6e81" strokeDasharray="251" strokeDashoffset={251 - (251 * historyStats.taruhanRatioPct) / 100} strokeWidth="20" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-headline font-black ${historyStats.isNetLoss && historyStats.totalTaruhan > 0 ? 'text-tertiary' : 'text-[#00ffff]'}`}>
                  {historyStats.netPercentage.toFixed(0)}%
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${historyStats.isNetLoss && historyStats.totalTaruhan > 0 ? 'text-tertiary' : 'text-[#00ffff]'}`}>
                  {historyStats.isNetLoss && historyStats.totalTaruhan > 0 ? 'NET KERUGIAN' : 'NET KEUNTUNGAN'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-auto">
              <div className="p-2 border-l border-[#ff6e81]/30 text-left bg-black/20 rounded-r-lg">
                <p className="text-[10px] text-on-surface-variant uppercase">Total Taruhan</p>
                <p className="text-sm font-bold text-tertiary mt-0.5">{formatIDR(historyStats.totalTaruhan)}</p>
              </div>
              <div className="p-2 border-l border-[#00ffff]/30 text-left bg-black/20 rounded-r-lg">
                <p className="text-[10px] text-on-surface-variant uppercase">Total Hadiah</p>
                <p className="text-sm font-bold text-[#00ffff] mt-0.5">{formatIDR(historyStats.totalHadiah)}</p>
              </div>
            </div>
            {historyStats.totalTaruhan > 0 && (
              <div className="w-full mt-4 p-2.5 bg-tertiary/5 border border-tertiary/10 rounded-lg text-[10px] md:text-xs text-on-surface-variant text-center leading-relaxed">
                Meskipun sering <span className="text-[#00ffff] font-bold">"Menang"</span>, hadiah yang didapat <strong className="text-tertiary">jauh lebih kecil</strong> dari modal yang disedot.
              </div>
            )}
          </div>

          {/* Indikator Kerusakan Psikologis (Custom Widget) */}
          <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-tertiary-container/10 to-transparent p-6 border border-tertiary/10 rounded-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-headline font-bold text-tertiary">Indikator Manipulasi</h3>
                <p className="text-xs text-white/60 mt-1">Tingkat Tekanan Psikologis Pengguna</p>
              </div>
              <Brain className="text-tertiary w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1.5">
                  <span className="text-white/70">Dopamine Loop</span>
                  <span className={phase === 3 ? "text-tertiary" : phase === 2 ? "text-orange-400" : "text-[#00ffff]"}>{dopamineStatus}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 overflow-hidden rounded-full">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: dopamineLevel, backgroundColor: phase === 3 ? '#ff6e81' : phase === 2 ? '#ff9f43' : '#00ffff', boxShadow: '0 0 8px currentColor' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1.5">
                  <span className="text-white/70">Sunk Cost Fallacy Score</span>
                  <span className={sunkCostLevel > 70 ? "text-tertiary" : sunkCostLevel > 30 ? "text-orange-400" : "text-[#00ffff]"}>{sunkCostStatus}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 overflow-hidden rounded-full">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${sunkCostLevel}%`, backgroundColor: sunkCostLevel > 70 ? '#ff6e81' : sunkCostLevel > 30 ? '#ff9f43' : '#00ffff', boxShadow: '0 0 8px currentColor' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1.5">
                  <span className="text-white/70">Near-Miss Frequency</span>
                  <span className="text-[#00ffff]">Engineered High</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 overflow-hidden rounded-full">
                  <div className="h-full bg-[#00ffff] w-full rounded-full shadow-[0_0_8px_rgba(0,255,255,0.5)]"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-black/40 border-l-2 border-tertiary rounded-r-xl">
              <p className="text-[11px] text-[#ff7989] font-medium italic leading-relaxed">
                "Sistem ini mendeteksi bahwa otak Anda sedang dimanipulasi oleh suara denting koin dan animasi 'hampir menang' yang dipicu secara matematis."
              </p>
            </div>
          </div>

          {/* Log Forensik Sesi (Table) */}
          <div className="col-span-12 md:col-span-7 bg-surface-container-low p-6 rounded-2xl">
            <h3 className="text-sm font-headline font-bold text-[#c1fffe] mb-6 uppercase tracking-widest">Log Forensik Sesi Terakhir</h3>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="sticky top-0 bg-surface-container-low z-10">
                  <tr className="text-on-surface-variant border-b border-white/10">
                    <th className="pb-3 font-medium px-2">WAKTU</th>
                    <th className="pb-3 font-medium px-2">AKSI PENGGUNA</th>
                    <th className="pb-3 font-medium px-2">PERUBAHAN SALDO</th>
                    <th className="pb-3 font-medium text-right px-2">SISA SALDO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {balanceHistory.slice().reverse().map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 text-white/60">{entry.time}</td>
                      <td className="py-3 px-2 font-mono">{entry.action.toUpperCase()}</td>
                      <td className={`py-3 px-2 font-mono ${entry.change > 0 ? 'text-[#00ffff]' : entry.change < 0 ? 'text-tertiary' : 'text-white/60'}`}>
                        {entry.change > 0 ? '+' : ''}{formatIDR(entry.change)}
                      </td>
                      <td className="py-3 px-2 font-mono text-right text-white/80">{formatIDR(entry.saldo)}</td>
                    </tr>
                  ))}
                  {balanceHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant">Belum ada aktivitas. Silakan bermain di Simulator.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{balanceHistory.length} Log tercatat dalam memori browser.</p>
            </div>
          </div>

          {/* Risk Education Module */}
          <div className="col-span-12 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-surface-container-highest border-l-4 border-tertiary rounded-2xl relative overflow-hidden">
            <div className="flex-shrink-0 w-16 h-16 bg-tertiary-container/20 rounded-full flex items-center justify-center relative z-10 border border-tertiary/30">
              <AlertTriangle className="text-tertiary w-8 h-8 drop-shadow-[0_0_10px_rgba(255,110,129,0.8)]" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-headline font-bold text-white mb-2 uppercase tracking-wide">Realita Pahit: House Edge Tidak Pernah Tidur</h4>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-4xl font-light">
                Statistik di atas bukan sekadar angka simulasi; itu adalah cerminan algoritma RNG (Random Number Generator) yang diatur secara ketat. Di setiap putaran, secara matematis Anda kehilangan rata-rata 3% hingga 15% dari nilai taruhan Anda. <strong className="text-tertiary font-bold drop-shadow-[0_0_8px_rgba(255,110,129,0.3)]">Simulasi ini membuktikan: satu-satunya cara untuk menang adalah dengan tidak bermain.</strong>
              </p>
            </div>
            {/* Abstract visual element */}
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
              <TrendingDown className="w-64 h-64 text-tertiary" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] border-t border-white/10 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center gap-6">
          <div className="flex gap-6 md:gap-8">
            <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs font-medium" href="#">Terms of Risk</a>
            <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs font-medium" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs font-medium" href="#">Gambling Help</a>
          </div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest text-center font-bold opacity-60">
            © 2024 KiraSlot999. High-Stakes Intelligence Education.
          </p>
          <div className="flex items-center gap-2 text-tertiary/60 bg-tertiary/5 px-4 py-2 rounded-full border border-tertiary/10">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-widest">SLOT ADALAH PENIPUAN MATEMATIS TERSTRUKTUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
