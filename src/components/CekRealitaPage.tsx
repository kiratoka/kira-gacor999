import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { Brain, AlertTriangle, TrendingDown, ShieldAlert, Activity, Zap, Eye, Lock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

// ─── Lightweight animated counter hook ───────────────────────────────────────
function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

// ─── Fade-in with stagger ─────────────────────────────────────────────────────
function useFadeIn(delay = 0) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return visible;
}

// ─── Reusable Card wrapper ────────────────────────────────────────────────────
function Card({
  children,
  className = '',
  delay = 0,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  const visible = useFadeIn(delay);
  return (
    <div
      className={`${className} ${hover ? 'card-hover' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ProgressBar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 300);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="h-1.5 w-full bg-white/10 overflow-hidden rounded-full">
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80`,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}

// ─── Animated SVG Donut ───────────────────────────────────────────────────────
function DonutChart({ pct }: { pct: number }) {
  const [animPct, setAnimPct] = useState(0);
  const [ready, setReady] = useState(false);
  const circumference = 251;

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimPct(pct);
      setReady(true);
    }, 400);
    return () => clearTimeout(t);
  }, [pct]);

  const offset = circumference - (circumference * animPct) / 100;
  const cyanOffset = ready ? 0 : circumference;

  return (
    <svg className="w-full h-full -rotate-90">
      <circle cx="50%" cy="50%" fill="transparent" r="40%" stroke="#00ffff22" strokeWidth="20" />
      <circle
        cx="50%"
        cy="50%"
        fill="transparent"
        r="40%"
        stroke="#00ffff"
        strokeWidth="20"
        strokeDasharray={circumference}
        strokeDashoffset={cyanOffset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <circle
        cx="50%"
        cy="50%"
        fill="transparent"
        r="40%"
        stroke="#ff6e81"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeWidth="20"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  const visible = useFadeIn(delay);
  return (
    <div
      className="p-3 rounded-xl border bg-black/20 flex flex-col gap-1"
      style={{
        borderColor: `${color}30`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.92)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <p className="text-[10px] uppercase tracking-widest" style={{ color: `${color}99` }}>
        {label}
      </p>
      <p className="text-sm font-bold font-mono leading-none" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CekRealitaPage() {
  const { balance, balanceHistory, totalDeposit, stats, phase } = useGameStore();

  const historyStats = useMemo(() => {
    const totalTaruhan = stats.totalPlayed;
    const totalHadiah = stats.totalWon;
    const totalVolume = totalTaruhan + totalHadiah || 1;
    const taruhanRatioPct = Math.round((totalTaruhan / totalVolume) * 100);
    const netAmount = totalHadiah - totalTaruhan;
    const isNetLoss = netAmount < 0;
    const netPercentage = totalTaruhan > 0 ? Math.abs((netAmount / totalTaruhan) * 100) : 0;
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
      isBalanceNetLoss,
    };
  }, [balance, totalDeposit, stats]);

  // Animated counters
  const animatedLossRate = useAnimatedCounter(historyStats.lossRatePct, 1200);
  const animatedNet = useAnimatedCounter(Math.round(historyStats.netPercentage), 1000);

  const chartPath = useMemo(() => {
    if (balanceHistory.length < 2) return 'M0 50 L 100 50';
    const data = [...balanceHistory];
    const maxVal = Math.max(...data.map((d) => d.saldo), totalDeposit);
    const minVal = 0;
    const range = maxVal - minVal || 1;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (((d.saldo - minVal) / range) * 80 + 10);
      return `${x} ${y}`;
    });
    return `M ${points.join(' L ')}`;
  }, [balanceHistory, totalDeposit]);

  // Animated SVG path via strokeDasharray trick
  const [chartReady, setChartReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  const dopamineLevel = phase === 1 ? 90 : phase === 2 ? 50 : 15;
  const dopamineStatus = phase === 1 ? 'High (Hook)' : phase === 2 ? 'Dropping' : 'Critical Drain';
  const dopamineColor = phase === 3 ? '#ff6e81' : phase === 2 ? '#ff9f43' : '#00ffff';

  const sunkCostLevel = Math.min((stats.totalPlayed / 500000) * 100, 100);
  const sunkCostStatus =
    sunkCostLevel < 30 ? 'Low' : sunkCostLevel < 70 ? 'High' : 'Extremely High';
  const sunkCostColor = sunkCostLevel > 70 ? '#ff6e81' : sunkCostLevel > 30 ? '#ff9f43' : '#00ffff';

  const formatIDR = (num: number) => 'IDR ' + num.toLocaleString('id-ID');

  const accentColor = historyStats.isBalanceNetLoss ? '#ff6e81' : '#00ffff';
  const netColor = historyStats.isNetLoss && historyStats.totalTaruhan > 0 ? '#ff6e81' : '#00ffff';

  return (
    <>
      {/* ─── Global lightweight styles ─────────────────────── */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,255,255,0.08);
        }
        .glow-text-cyan {
          text-shadow: 0 0 20px rgba(0,255,255,0.4);
        }
        .glow-text-red {
          text-shadow: 0 0 20px rgba(255,110,129,0.4);
        }
        .scan-overlay {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,255,0.012) 2px,
            rgba(0,255,255,0.012) 4px
          );
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .table-row-hover:hover {
          background: rgba(0,255,255,0.04);
        }
        .live-dot {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        .float-icon {
          animation: float 4s ease-in-out infinite;
        }
        .forensik-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0,255,255,0.35) rgba(0,255,255,0.04);
        }
        .forensik-scroll::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .forensik-scroll::-webkit-scrollbar-track {
          background: rgba(0,255,255,0.04);
          border-radius: 99px;
        }
        .forensik-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,255,255,0.30);
          border-radius: 99px;
          box-shadow: 0 0 6px rgba(0,255,255,0.4);
        }
        .forensik-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0,255,255,0.55);
          box-shadow: 0 0 10px rgba(0,255,255,0.6);
        }
      `}</style>

      {/* Scan line overlay – very subtle, CSS-only */}
      <div className="scan-overlay" />

      <div className="flex flex-col min-h-screen pt-4 relative z-10">
        <section className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">

          {/* ─── Header ──────────────────────────────────────── */}
          <div
            className="flex flex-col gap-2 mb-10"
            style={{ opacity: 1, animation: 'none' }}
          >
            <div className="flex items-center gap-3 mb-1">
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#00ffff]/20 bg-[#00ffff]/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffff] live-dot" />
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#00ffff]/70 uppercase">
                  Live Analysis
                </span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-black text-white tracking-tight uppercase italic leading-none">
              Dashboard{' '}
              <span className="text-[#00ffff] glow-text-cyan">Cek Realita</span>
            </h2>
            <p className="text-white/40 font-body max-w-2xl text-sm leading-relaxed mt-1">
              Forensik digital yang membuktikan secara matematis mengapa sistem slot dirancang untuk
              memastikan Anda kehilangan segalanya.
            </p>
          </div>

          {/* ─── Bento Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">

            {/* ── 1. Line Chart ──────────────────────────────── */}
            <Card
              className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-2xl border border-white/5 grid-bg relative overflow-hidden"
              delay={0}
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00ffff]/40 rounded-tl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ffff]/20 rounded-br-2xl pointer-events-none" />

              <div className="flex justify-between items-start md:items-center mb-6 flex-col md:flex-row gap-3">
                <div>
                  <h3 className="text-base font-headline font-bold text-[#c1fffe] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00ffff]" />
                    Tren Penurunan Saldo
                  </h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                    Analisis Kehancuran Modal (60 Menit Terakhir)
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <span
                    className={`text-4xl font-headline font-black leading-none ${historyStats.isBalanceNetLoss ? 'glow-text-red' : 'glow-text-cyan'
                      }`}
                    style={{ color: accentColor }}
                  >
                    {historyStats.isBalanceNetLoss ? '-' : '+'}
                    {animatedLossRate}%
                  </span>
                  <p className="text-[9px] uppercase mt-1 tracking-widest" style={{ color: `${accentColor}60` }}>
                    {historyStats.isBalanceNetLoss ? 'Total Loss Rate' : 'Total Profit Rate'}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-56 relative">
                <div className="absolute inset-0 flex flex-col justify-between py-2 border-l border-b border-white/8">
                  {[
                    Math.max(...balanceHistory.map((d) => d.saldo), totalDeposit),
                    Math.max(...balanceHistory.map((d) => d.saldo), totalDeposit) / 2,
                    0,
                  ].map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] text-white/20 pl-1 font-mono">{formatIDR(v)}</span>
                      <div className="flex-1 border-t border-white/5" />
                    </div>
                  ))}
                </div>

                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 0.25 }} />
                      <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Fill */}
                  <path
                    d={`${chartPath} V 100 H 0 Z`}
                    fill="url(#chartGrad)"
                    style={{ opacity: chartReady ? 0.4 : 0, transition: 'opacity 0.8s ease 0.6s' }}
                  />
                  {/* Line with glow */}
                  <path
                    d={chartPath}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="1.8"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: chartReady ? 1 : 0, transition: 'opacity 0.5s ease 0.5s' }}
                  />
                </svg>

                {historyStats.isBalanceNetLoss && (
                  <div
                    className="absolute bottom-[22%] right-[8%] flex flex-col items-center gap-1"
                    style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
                  >
                    <div className="w-2 h-2 bg-[#ff6e81] rounded-full shadow-[0_0_8px_#ff6e81]" />
                    <div className="text-[8px] text-[#ff6e81] font-bold bg-black/90 px-1.5 py-0.5 border border-[#ff6e81]/30 rounded whitespace-nowrap">
                      KEJAR KEKALAHAN
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* ── 2. Donut Chart ─────────────────────────────── */}
            <Card
              className="col-span-12 lg:col-span-4 bg-surface-container-high p-6 rounded-2xl border border-white/5 flex flex-col"
              delay={100}
            >
              <h3 className="text-[10px] font-bold text-[#c1fffe]/70 mb-4 uppercase tracking-[0.2em]">
                Realita Taruhan vs Hadiah
              </h3>

              <div className="relative w-44 h-44 mx-auto flex items-center justify-center mb-5">
                <DonutChart pct={historyStats.taruhanRatioPct} />
                <div className="absolute flex flex-col items-center">
                  <span
                    className="text-4xl font-headline font-black leading-none"
                    style={{ color: netColor }}
                  >
                    {animatedNet}%
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-tight mt-1"
                    style={{ color: `${netColor}99` }}
                  >
                    {historyStats.isNetLoss && historyStats.totalTaruhan > 0
                      ? 'NET KERUGIAN'
                      : 'NET KEUNTUNGAN'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <StatBadge
                  label="Total Taruhan"
                  value={formatIDR(historyStats.totalTaruhan)}
                  color="#ff6e81"
                  delay={300}
                />
                <StatBadge
                  label="Total Hadiah"
                  value={formatIDR(historyStats.totalHadiah)}
                  color="#00ffff"
                  delay={400}
                />
              </div>

              {historyStats.totalTaruhan > 0 && (
                <div className="mt-3 p-2.5 bg-[#ff6e81]/5 border border-[#ff6e81]/10 rounded-xl text-[10px] text-white/40 text-center leading-relaxed">
                  Meski sering{' '}
                  <span className="text-[#00ffff] font-bold">"Menang"</span>, hadiah{' '}
                  <strong className="text-[#ff6e81]">jauh lebih kecil</strong> dari modal yang disedot.
                </div>
              )}
            </Card>

            {/* ── 3. Psychological Indicators ────────────────── */}
            <Card
              className="col-span-12 md:col-span-5 p-6 rounded-2xl border border-[#ff6e81]/10 bg-gradient-to-br from-[#ff6e8108] via-transparent to-transparent"
              delay={200}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-headline font-bold text-[#ff6e81]">
                    Indikator Manipulasi
                  </h3>
                  <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">
                    Tekanan Psikologis Pengguna
                  </p>
                </div>
                <Brain
                  className="text-[#ff6e81] w-7 h-7 float-icon"
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="space-y-5">
                {/* Dopamine */}
                <div className="group">
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-2">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      Dopamine Loop
                    </span>
                    <span style={{ color: dopamineColor }}>{dopamineStatus}</span>
                  </div>
                  <ProgressBar value={dopamineLevel} color={dopamineColor} delay={200} />
                </div>

                {/* Sunk Cost */}
                <div className="group">
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-2">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      Sunk Cost Fallacy
                    </span>
                    <span style={{ color: sunkCostColor }}>{sunkCostStatus}</span>
                  </div>
                  <ProgressBar value={sunkCostLevel} color={sunkCostColor} delay={350} />
                </div>

                {/* Near Miss */}
                <div className="group">
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-2">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Eye className="w-3 h-3" />
                      Near-Miss Frequency
                    </span>
                    <span className="text-[#00ffff]">Engineered High</span>
                  </div>
                  <ProgressBar value={100} color="#00ffff" delay={500} />
                </div>
              </div>

              {/* Quote */}
              <div
                className="mt-6 p-4 bg-black/40 border-l-2 border-[#ff6e81] rounded-r-xl relative overflow-hidden"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#ff6e81]/5 to-transparent pointer-events-none"
                  style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
                />
                <p className="text-[11px] text-[#ff7989]/80 font-medium italic leading-relaxed relative">
                  "Sistem ini mendeteksi bahwa otak Anda sedang dimanipulasi oleh suara denting koin
                  dan animasi 'hampir menang' yang dipicu secara matematis."
                </p>
              </div>
            </Card>

            {/* ── 4. Forensic Log Table ───────────────────────── */}
            <Card
              className="col-span-12 md:col-span-7 bg-surface-container-low p-6 rounded-2xl border border-white/5"
              delay={300}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[10px] font-bold text-[#c1fffe]/70 uppercase tracking-[0.2em]">
                  Log Forensik Sesi
                </h3>
                <div className="flex items-center gap-1.5 text-[9px] text-white/30 uppercase tracking-widest">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#00ffff] live-dot"
                    style={{ animationDelay: '0.5s' }}
                  />
                  {balanceHistory.length} entri
                </div>
              </div>

              <div className="forensik-scroll overflow-x-auto max-h-[280px] overflow-y-auto">
                <table className="w-full text-left text-xs whitespace-nowrap border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-white/30">
                      {['Waktu', 'Aksi', 'Perubahan', 'Saldo'].map((h, i) => (
                        <th
                          key={h}
                          className={`pb-3 font-medium text-[9px] uppercase tracking-widest border-b border-white/8 ${i === 3 ? 'text-right' : ''
                            }`}
                          style={{ paddingLeft: i === 0 ? '0' : '8px' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {balanceHistory
                      .slice()
                      .reverse()
                      .map((entry, idx) => (
                        <tr
                          key={entry.id}
                          className="table-row-hover transition-colors"
                          style={{
                            opacity: 1,
                            animationDelay: `${idx * 30}ms`,
                          }}
                        >
                          <td className="py-2.5 text-white/30 font-mono text-[10px]">
                            {entry.time}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-[10px] text-white/70">
                            {entry.action.toUpperCase()}
                          </td>
                          <td
                            className="py-2.5 px-2 font-mono text-[10px]"
                            style={{
                              color:
                                entry.change > 0
                                  ? '#00ffff'
                                  : entry.change < 0
                                    ? '#ff6e81'
                                    : 'rgba(255,255,255,0.3)',
                            }}
                          >
                            {entry.change > 0 ? '+' : ''}
                            {formatIDR(entry.change)}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-[10px] text-right text-white/60">
                            {formatIDR(entry.saldo)}
                          </td>
                        </tr>
                      ))}
                    {balanceHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-white/20 text-xs"
                        >
                          Belum ada aktivitas. Silakan bermain di Simulator.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 text-center">
                <p className="text-[9px] text-white/20 uppercase tracking-widest">
                  {balanceHistory.length} log tercatat dalam memori browser
                </p>
              </div>
            </Card>

            {/* ── 5. House Edge Warning Banner ───────────────── */}
            <Card
              className="col-span-12 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 rounded-2xl relative overflow-hidden border border-[#ff6e81]/15"
              delay={400}
              hover={false}
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff6e81]/8 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

              <div
                className="flex-shrink-0 w-14 h-14 bg-[#ff6e81]/10 rounded-full flex items-center justify-center border border-[#ff6e81]/20 relative z-10"
                style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
              >
                <AlertTriangle className="text-[#ff6e81] w-7 h-7" />
              </div>

              <div className="relative z-10 flex-1">
                <h4 className="text-lg font-headline font-black text-white uppercase tracking-wide mb-2">
                  Realita Pahit:{' '}
                  <span className="text-[#ff6e81] glow-text-red">
                    House Edge Tidak Pernah Tidur
                  </span>
                </h4>
                <p className="text-white/40 text-sm leading-relaxed max-w-3xl">
                  Statistik di atas bukan sekadar angka simulasi — itu cerminan algoritma RNG yang
                  diatur ketat. Di setiap putaran, secara matematis Anda kehilangan rata-rata{' '}
                  <span className="text-white/70 font-semibold">3%–15%</span> dari nilai taruhan.{' '}
                  <strong className="text-[#ff6e81] font-bold">
                    Simulasi ini membuktikan: satu-satunya cara untuk menang adalah dengan tidak
                    bermain.
                  </strong>
                </p>
              </div>

              <TrendingDown
                className="absolute -right-6 -bottom-6 w-48 h-48 text-[#ff6e81] opacity-5 pointer-events-none"
                style={{ animation: 'float 6s ease-in-out infinite' }}
              />
            </Card>
          </div>
        </section>

        {/* ─── Footer ────────────────────────────────────────── */}
        <footer className="border-t border-white/8 py-10 mt-auto bg-black/40">
          <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center gap-5">
            <div className="flex gap-6 md:gap-8">
              {['Terms of Risk', 'Privacy Policy', 'Gambling Help'].map((link) => (
                <a
                  key={link}
                  className="text-white/20 hover:text-[#ff6e81] transition-colors text-[10px] font-medium uppercase tracking-widest"
                  href="#"
                >
                  {link}
                </a>
              ))}
            </div>
            <p className="text-white/15 text-[9px] uppercase tracking-widest text-center font-bold">
              © 2024 KiraSlot999. High-Stakes Intelligence Education.
            </p>
            <div
              className="flex items-center gap-2 text-[#ff6e81]/50 bg-[#ff6e81]/5 px-4 py-2 rounded-full border border-[#ff6e81]/10"
              style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase">
                Slot Adalah Penipuan Matematis Terstruktur
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}