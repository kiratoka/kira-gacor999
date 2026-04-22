import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Server, Shuffle, TrendingDown, Lock, Zap,
  ChevronDown, AlertTriangle, BarChart2, Settings, CreditCard,
  Activity, Target, Brain, ArrowRight, Info
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionProps {
  id: string;
  children: React.ReactNode;
}

interface PhaseCardProps {
  phase: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  weights: number[];
  active: boolean;
  onClick: () => void;
}

interface WeightBarProps {
  label: string;
  color: string;
  weight: number;
  maxWeight: number;
  index: number;
}

// ─── Tile Labels & Colors (matching InteractiveMatch3) ───────────────────────

const TILE_LABELS = ['Diamond', 'Star', 'Heart', 'Crown', 'Coins', 'Green Coin'];
const TILE_HEX = ['#00e5ff', '#3b82f6', '#a855f7', '#ec4899', '#34d399', '#a3e635'];

// Phase weights from gameStore.ts
const PHASE_WEIGHTS: Record<number, number[]> = {
  1: [10, 15, 20, 10, 20, 25],
  2: [5, 10, 20, 5, 25, 35],
  3: [2, 5, 25, 2, 26, 40],
};

// ─── Sub Components ───────────────────────────────────────────────────────────

function WeightBar({ label, color, weight, maxWeight, index }: WeightBarProps) {
  const pct = Math.round((weight / maxWeight) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3"
    >
      <span className="text-[11px] font-mono w-24 shrink-0" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }}
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
      <span className="text-[11px] font-mono w-8 text-right" style={{ color }}>
        {weight}%
      </span>
    </motion.div>
  );
}

function PhaseCard({ phase, label, desc, icon, color, weights, active, onClick }: PhaseCardProps) {
  const total = weights.reduce((a, b) => a + b, 0);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        active
          ? 'bg-surface-container border-opacity-60'
          : 'bg-surface-container-low border-white/5 hover:bg-surface-container'
      }`}
      style={{ borderColor: active ? color : undefined }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
          {icon}
        </div>
        <div>
          <span className="text-[10px] font-label uppercase tracking-widest" style={{ color }}>
            Fase {phase}
          </span>
          <p className="text-sm font-bold text-white">{label}</p>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
      {active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-2"
        >
          {TILE_LABELS.map((lbl, i) => (
            <WeightBar
              key={i}
              index={i}
              label={lbl}
              color={TILE_HEX[i]}
              weight={Math.round((weights[i] / total) * 100)}
              maxWeight={100}
            />
          ))}
        </motion.div>
      )}
    </motion.button>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto">
      <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">{children}</pre>
    </div>
  );
}

function InfoTag({ children, color = '#00e5ff' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40`, color }}
    >
      {children}
    </span>
  );
}

function Section({ id, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-28">
      {children}
    </section>
  );
}

// ─── Animated RNG Demo ────────────────────────────────────────────────────────

function RNGDemo() {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    const weights = PHASE_WEIGHTS[phase];
    let interval = 0;
    let count = 0;
    const maxCount = 12;

    const tick = () => {
      setResult(Math.floor(Math.random() * 6));
      count++;
      if (count < maxCount) {
        interval = window.setTimeout(tick, 50 + count * 15);
      } else {
        // Final weighted pick
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        let picked = 5;
        for (let i = 0; i < weights.length; i++) {
          if (r < weights[i]) { picked = i; break; }
          r -= weights[i];
        }
        setResult(picked);
        setHistory(prev => [picked, ...prev].slice(0, 20));
        setRolling(false);
      }
    };
    tick();
  };

  const phaseCounts = TILE_LABELS.map((_, i) => history.filter(h => h === i).length);

  return (
    <div className="bg-surface-container-low p-5 rounded-2xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-label uppercase tracking-widest text-primary-container">Demo RNG Berbobot</h4>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPhase(p); setHistory([]); setResult(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                phase === p
                  ? 'text-white'
                  : 'bg-white/5 text-on-surface-variant hover:bg-white/10'
              }`}
              style={phase === p ? {
                backgroundColor: p === 1 ? '#00e5ff20' : p === 2 ? '#ff9f4320' : '#ff2d6b20',
                border: `1px solid ${p === 1 ? '#00e5ff' : p === 2 ? '#ff9f43' : '#ff2d6b'}60`,
                color: p === 1 ? '#00e5ff' : p === 2 ? '#ff9f43' : '#ff2d6b',
              } : { border: '1px solid transparent' }}
            >
              Fase {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={roll}
          disabled={rolling}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
          style={{ backgroundColor: '#00e5ff20', border: '1px solid #00e5ff50', color: '#00e5ff' }}
        >
          <Shuffle className="w-4 h-4" />
          {rolling ? 'Rolling...' : 'Roll Tile'}
        </button>

        <AnimatePresence mode="wait">
          {result !== null && (
            <motion.div
              key={result}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border"
              style={{
                backgroundColor: `${TILE_HEX[result]}15`,
                borderColor: `${TILE_HEX[result]}40`,
              }}
            >
              <span className="text-sm font-bold" style={{ color: TILE_HEX[result] }}>
                {TILE_LABELS[result]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Distribusi {history.length} Roll</p>
          {TILE_LABELS.map((lbl, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] font-mono w-24" style={{ color: TILE_HEX[i] }}>{lbl}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${history.length > 0 ? (phaseCounts[i] / history.length) * 100 : 0}%`,
                    backgroundColor: TILE_HEX[i],
                  }}
                />
              </div>
              <span className="text-[11px] font-mono w-6 text-right text-on-surface-variant">{phaseCounts[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Withdraw Flow Demo ───────────────────────────────────────────────────────

function WithdrawDemo() {
  const [step, setStep] = useState<'idle' | 'loading' | 'stuck' | 'fail' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const run = () => {
    if (step === 'loading') return;
    setAttempt(a => a + 1);
    setStep('loading');
    setProgress(0);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 90) {
        p = 90;
        clearInterval(iv);
        setProgress(90);
        setStep('stuck');
        setTimeout(() => {
          setStep(attempt === 1 ? 'success' : 'fail');
        }, 2500);
      } else {
        setProgress(p);
      }
    }, 400);
  };

  const reset = () => { setStep('idle'); setProgress(0); };

  return (
    <div className="bg-surface-container-low p-5 rounded-2xl border border-white/5 space-y-4">
      <h4 className="text-xs font-label uppercase tracking-widest text-primary-container">Simulasi Proses Withdraw</h4>

      <div className="space-y-3">
        {step === 'idle' && (
          <button
            onClick={run}
            className="w-full py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #00b8cc)', color: '#003d42' }}
          >
            Tarik Saldo Rp 100.000
          </button>
        )}

        {(step === 'loading' || step === 'stuck') && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-on-surface-variant">
              <span>{step === 'stuck' ? '⚠ Menunggu verifikasi bank...' : 'Menghubungi server...'}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.4 }}
                style={{ background: step === 'stuck' ? '#ff9f43' : '#00e5ff' }}
              />
            </div>
            {step === 'stuck' && (
              <p className="text-[11px] text-yellow-400 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Progress berhenti di 90%...
              </p>
            )}
          </div>
        )}

        {step === 'fail' && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl border flex items-start gap-2" style={{ backgroundColor: '#ff2d6b10', borderColor: '#ff2d6b40' }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ff2d6b' }} />
              <p className="text-xs" style={{ color: '#ff8fa3' }}>
                {attempt % 2 === 0 ? 'Sistem sedang sibuk. Silakan coba lagi nanti.' : 'Verifikasi gagal. Akun Anda sedang ditinjau.'}
              </p>
            </div>
            <button onClick={run} className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ backgroundColor: '#ff2d6b15', border: '1px solid #ff2d6b40', color: '#ff2d6b' }}>
              Coba Lagi
            </button>
            <button onClick={reset} className="w-full py-2 rounded-xl text-xs cursor-pointer bg-white/5 text-on-surface-variant">
              Reset
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-2">
            <div className="p-3 rounded-xl border flex items-start gap-2" style={{ backgroundColor: '#00e5ff10', borderColor: '#00e5ff40' }}>
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary-container" />
              <p className="text-xs text-primary-container">Penarikan berhasil! (Tapi kamu akan kembali bermain...)</p>
            </div>
            <button onClick={reset} className="w-full py-2 rounded-xl text-xs cursor-pointer bg-white/5 text-on-surface-variant">
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="text-[11px] text-on-surface-variant leading-relaxed p-3 rounded-lg bg-black/30 border border-white/5">
        <strong className="text-white">Catatan:</strong> Progress bar sengaja dirancang untuk membuat frustrasi.
        Sistem pertama kali membiarkan penarikan berhasil agar pemain percaya, lalu mempersulit seterusnya.
      </div>
    </div>
  );
}

// ─── TOC ──────────────────────────────────────────────────────────────────────

const TOC_ITEMS = [
  { id: 'overview', label: 'Gambaran Umum', icon: <Brain className="w-3.5 h-3.5" /> },
  { id: 'phase', label: 'Sistem Fase', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'rng', label: 'RNG Berbobot', icon: <Shuffle className="w-3.5 h-3.5" /> },
  { id: 'drop', label: 'Dynamic Drop Logic', icon: <Server className="w-3.5 h-3.5" /> },
  { id: 'reward', label: 'Pemotongan Hadiah', icon: <TrendingDown className="w-3.5 h-3.5" /> },
  { id: 'admin', label: 'Admin Control Panel', icon: <Settings className="w-3.5 h-3.5" /> },
  { id: 'withdraw', label: 'Manipulasi Withdraw', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: 'nearmiss', label: 'Near Miss & Ilusi', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'conclusion', label: 'Kesimpulan', icon: <Target className="w-3.5 h-3.5" /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LogikaPage() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    TOC_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: '#00e5ff08' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: '#ff2d6b08' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-20 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-6">
              <InfoTag><Brain className="w-3 h-3" /> Intelligence Report #1024</InfoTag>
              <InfoTag color="#ff2d6b"><AlertTriangle className="w-3 h-3" /> Technical Deep Dive</InfoTag>
            </div>
            <h1 className="font-headline font-black text-5xl md:text-6xl leading-none mb-4">
              <span className="text-white">MATEMATIKA DI BALIK</span>
              <br />
              <span style={{ color: '#00e5ff' }}>ALGORITMA MATCH-3</span>
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-base leading-relaxed mt-4">
              Membongkar sistem manipulasi 'puzzle' yang memastikan keberuntungan hanyalah
              barisan kode yang telah ditentukan sebelumnya. Setiap klik, setiap tile, setiap
              "hampir menang" — semua sudah diprogram.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-1">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3 px-3">
              Daftar Isi
            </p>
            {TOC_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm cursor-pointer ${
                  activeSection === item.id
                    ? 'text-primary-container font-bold'
                    : 'text-on-surface-variant hover:text-white'
                }`}
                style={activeSection === item.id ? {
                  backgroundColor: '#00e5ff10',
                  borderLeft: '2px solid #00e5ff',
                } : { borderLeft: '2px solid transparent' }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="space-y-20 min-w-0">

          {/* ── 1. Overview ── */}
          <Section id="overview">
            <SectionHeader
              number="01"
              title="Gambaran Umum Sistem"
              tag="SERVER-SIDE CONTROL"
              tagColor="#ff2d6b"
            />
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {[
                {
                  icon: <Server className="w-5 h-5" />, color: '#00e5ff',
                  title: 'Hasil Ditentukan di Server',
                  desc: 'Saat kamu menekan tombol swap, server sudah menentukan hasil akhirnya sebelum animasi dimulai. Visual hanyalah "buffering" dari keputusan yang sudah dibuat.',
                },
                {
                  icon: <EyeOff className="w-5 h-5" />, color: '#ff9f43',
                  title: 'Ilusi Keahlian',
                  desc: 'Berbeda dengan puzzle game murni, di sini kamu tidak bisa "bermain cerdas". Strategi apapun tidak mengubah probabilitas yang sudah diatur secara algoritmik.',
                },
                {
                  icon: <TrendingDown className="w-5 h-5" />, color: '#ff2d6b',
                  title: 'House Edge Tersembunyi',
                  desc: 'Setiap gerakan memotong saldo (Rp 5.000 × bet multiplier). Hadiah yang diberikan secara matematis selalu lebih kecil dari total yang dipotong.',
                },
                {
                  icon: <Lock className="w-5 h-5" />, color: '#a855f7',
                  title: 'Tiga Lapisan Manipulasi',
                  desc: 'Sistem beroperasi dengan 3 mekanisme berlapis: Fase Algoritma → RNG Berbobot → Pemotongan Hadiah. Kamu kalah di setiap lapisan.',
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl border"
                  style={{ backgroundColor: `${card.color}08`, borderColor: `${card.color}25` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                      {card.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white">{card.title}</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl bg-surface-container-high border border-white/5">
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Alur Keputusan Sistem</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {['Pemain Geser Tile', 'Server Hitung Phase & Balance', 'Tentukan Hasil (Win/Lose)', 'Generate Tile Baru', 'Jalankan Animasi'].map((step, i, arr) => (
                  <React.Fragment key={i}>
                    <span className="px-3 py-1.5 rounded-lg font-medium text-xs" style={{
                      backgroundColor: i === 0 ? '#00e5ff15' : i === arr.length - 1 ? '#ff2d6b15' : '#ffffff08',
                      border: `1px solid ${i === 0 ? '#00e5ff40' : i === arr.length - 1 ? '#ff2d6b40' : '#ffffff15'}`,
                      color: i === 0 ? '#00e5ff' : i === arr.length - 1 ? '#ff2d6b' : '#ffffff99',
                    }}>{step}</span>
                    {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-on-surface-variant shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Section>

          {/* ── 2. Fase ── */}
          <Section id="phase">
            <SectionHeader number="02" title="Sistem Tiga Fase" tag="PHASE ALGORITHM" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Game ini secara otomatis meningkatkan kesulitan berdasarkan jumlah gerakan.
              Semakin banyak bermain, semakin kecil peluang kemenangan — tanpa pemberitahuan apapun.
            </p>

            <div className="space-y-3">
              <PhaseCard
                phase={1} active={activePhase === 1} onClick={() => setActivePhase(1)}
                label="Hook — Kemenangan Mudah" color="#00e5ff"
                icon={<Zap className="w-4 h-4 text-cyan-400" />}
                desc="0–4 gerakan pertama. Tile langka (Diamond, Crown) lebih sering muncul. Tujuan: memancing dopamin dan rasa percaya diri."
                weights={PHASE_WEIGHTS[1]}
              />
              <PhaseCard
                phase={2} active={activePhase === 2} onClick={() => setActivePhase(2)}
                label="Transisi — Mulai Dikuras" color="#ff9f43"
                icon={<BarChart2 className="w-4 h-4 text-orange-400" />}
                desc="5–14 gerakan. Tile langka berkurang drastis. Green Coin (hadiah kecil) mendominasi. Pemain mulai merugi tapi belum sadar."
                weights={PHASE_WEIGHTS[2]}
              />
              <PhaseCard
                phase={3} active={activePhase === 3} onClick={() => setActivePhase(3)}
                label="Drain — Pengurasan Aktif" color="#ff2d6b"
                icon={<TrendingDown className="w-4 h-4 text-red-400" />}
                desc="≥15 gerakan (atau bet x5 langsung masuk Fase 3). Tile Diamond & Crown hampir tidak ada. Sistem aktif mencegah cascade dan combo besar."
                weights={PHASE_WEIGHTS[3]}
              />
            </div>

            <CodeBlock>{`// Dari gameStore.ts — Transisi fase otomatis
const moves = get().stats.moves;
const betMult = get().betMultiplier;

if (betMult === 5) {
  set({ phase: 3 }); // Langsung Fase Drain jika bet maksimal!
} else {
  if (moves >= 5 && moves < 15) set({ phase: 2 });
  if (moves >= 15)              set({ phase: 3 });
}`}</CodeBlock>
          </Section>

          {/* ── 3. RNG ── */}
          <Section id="rng">
            <SectionHeader number="03" title="RNG Berbobot (Bukan Acak!)" tag="WEIGHTED RANDOM" tagColor="#a855f7" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              "RNG" (Random Number Generator) terdengar adil, tapi sistem ini menggunakan
              <strong className="text-white"> weighted random</strong> — setiap tile punya bobot probabilitas berbeda,
              dan bobot itu berubah sesuai fase. Di Fase 3, probabilitas Diamond hanya 2% vs Green Coin 40%.
            </p>

            <RNGDemo />

            <div className="mt-4">
              <CodeBlock>{`// Dari gameStore.ts — getRandomTileType()
// Tipe: 0:Diamond, 1:Star, 2:Heart, 3:Crown, 4:Coins, 5:GreenCoin

let weights = [10, 15, 20, 10, 20, 25]; // Fase 1 (default)

if (phase === 2) {
  weights = [5, 10, 20, 5, 25, 35];     // Fase 2
} else if (phase === 3 || withdrawAttempted) {
  weights = [2, 5, 25, 2, 26, 40];      // Fase 3 / Setelah Withdraw
}

// Tile dengan hadiah terbesar (Crown: Rp 10.000) 
// hanya punya bobot 2% di Fase 3!`}</CodeBlock>
            </div>
          </Section>

          {/* ── 4. Dynamic Drop ── */}
          <Section id="drop">
            <SectionHeader number="04" title="Dynamic Drop Logic" tag="SERVER-SIDE TILE GENERATION" tagColor="#00e5ff" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Tile baru yang jatuh setelah match <strong className="text-white">bukan acak murni</strong>.
              Di Fase 3 dan setelah withdraw, sistem secara aktif memastikan tile baru
              <em className="text-white"> tidak membentuk match</em> dengan tile di bawahnya.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: '#00e5ff08', borderColor: '#00e5ff25' }}>
                <p className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">Mode Normal (Fase 1)</p>
                <div className="space-y-2 text-xs text-on-surface-variant">
                  <p>✓ Tile baru berpotensi membentuk cascade</p>
                  <p>✓ Combo multi-level dimungkinkan</p>
                  <p>✓ "Pity win" aktif jika rugi &gt; Rp 30.000</p>
                  <p>✓ Admin target win memaksa match</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: '#ff2d6b08', borderColor: '#ff2d6b25' }}>
                <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#ff2d6b' }}>Mode Drain (Fase 3)</p>
                <div className="space-y-2 text-xs text-on-surface-variant">
                  <p>✗ Tile baru sengaja di-mismatch dengan tile bawah</p>
                  <p>✗ Tile kiri juga di-check untuk anti-cascade</p>
                  <p>✗ Setelah withdraw: paksa mismatch semua arah</p>
                  <p>✗ Cascade hampir tidak mungkin terjadi</p>
                </div>
              </div>
            </div>

            <CodeBlock>{`// Dari gameStore.ts — Logic tile generation anti-cascade
const forceLose = hasWithdrawn || 
  (adminTarget !== null && stats.totalWon >= adminTarget);

if (withdrawAttempted || phase === 3 || forceLose) {
  // Cek tile di bawah — pastikan tipe BERBEDA
  const below = currentGrid.find(t => t.x === x && t.y === y + 1);
  if (below) {
    let attempts = 0;
    while (type === below.type && attempts < 10) {
      type = getRandomTileType(phase, withdrawAttempted);
      attempts++;
    }
  }
  // Jika sudah withdraw: cek tile kiri juga
  if (withdrawAttempted || forceLose) {
    const left = currentGrid.find(t => t.x === x - 1 && t.y === y);
    if (left && type === left.type) {
      type = (type + 1) % TILE_TYPES; // Paksa ganti tipe!
    }
  }
}`}</CodeBlock>
          </Section>

          {/* ── 5. Reward Nerfing ── */}
          <Section id="reward">
            <SectionHeader number="05" title="Pemotongan Hadiah Diam-Diam" tag="REWARD NERFING" tagColor="#ff9f43" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Bahkan saat kamu berhasil match, sistem bisa memotong hadiah hingga
              <strong className="text-white"> 90%</strong> secara diam-diam. Kamu melihat animasi menang,
              tapi saldo yang masuk jauh lebih kecil dari yang dijanjikan paytable.
            </p>

            <div className="p-5 rounded-xl border mb-4 space-y-4" style={{ backgroundColor: '#ff9f4308', borderColor: '#ff9f4325' }}>
              <p className="text-xs font-label uppercase tracking-widest" style={{ color: '#ff9f43' }}>Contoh Skenario</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Kamu Match', value: '5× Crown', sub: 'Paytable: Rp 10.000', color: '#ec4899' },
                  { label: 'Hadiah Normal', value: 'Rp 10.000', sub: 'Sebelum nerfing', color: '#ff9f43' },
                  { label: 'Hadiah Aktual', value: 'Rp 1.000', sub: 'Dipotong 90%!', color: '#ff2d6b' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <p className="text-[10px] text-on-surface-variant mb-1">{item.label}</p>
                    <p className="text-base font-black" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <CodeBlock>{`// Dari gameStore.ts — Rigged reward logic
let maxAllowedWin = stats.totalPlayed * 0.7; // Max 70% dari modal

if (adminTarget !== null) {
  maxAllowedWin = adminTarget; // Admin override
}
if (hasWithdrawn) {
  maxAllowedWin = 0; // Force kalah total setelah withdraw!
}

// Jika hadiah melebihi batas yang diizinkan di Fase 2+
if (stats.totalWon + totalReward > maxAllowedWin && phase >= 2) {
  totalReward = Math.floor(totalReward * 0.1); // Potong 90%!
}`}</CodeBlock>
          </Section>

          {/* ── 6. Admin Panel ── */}
          <Section id="admin">
            <SectionHeader number="06" title="Admin Control Panel" tag="OPERATOR CONTROL" tagColor="#a855f7" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Operator memiliki kemampuan untuk mengatur batas kemenangan pemain secara real-time.
              Fitur ini tersembunyi dari pemain, tapi berdampak langsung pada setiap tile yang muncul
              dan setiap hadiah yang diterima.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {[
                {
                  color: '#a855f7',
                  title: 'Target Win Tetap',
                  desc: 'Admin bisa set batas kemenangan pemain di angka tertentu (mis. Rp 50.000). Setelah tercapai, sistem otomatis masuk mode drain.',
                },
                {
                  color: '#ff2d6b',
                  title: 'Auto Mode (Default)',
                  desc: 'Tanpa override, sistem menggunakan formula 70% dari total modal yang sudah dipakai sebagai batas kemenangan maksimal.',
                },
                {
                  color: '#ff9f43',
                  title: 'Force Lose Mode',
                  desc: 'Setelah pemain berhasil withdraw pertama kali, flag hasWithdrawn aktif dan maxAllowedWin di-set ke 0 — pemain tidak bisa menang.',
                },
                {
                  color: '#34d399',
                  title: 'Pity Win (Fase 1)',
                  desc: 'Jika rugi > Rp 30.000 dan belum withdraw, sistem kadang memaksa tile baru membentuk match — agar pemain tidak kabur.',
                },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ backgroundColor: `${item.color}08`, borderColor: `${item.color}25` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <p className="text-xs font-bold" style={{ color: item.color }}>{item.title}</p>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: '#a855f708', borderColor: '#a855f725' }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#a855f7' }} />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <strong style={{ color: '#a855f7' }}>USER_ID & PROFIT_RATIO:</strong> Dalam banyak platform judi online nyata,
                setiap akun memiliki profil keuntungan yang bisa disesuaikan oleh operator. Pemain yang sering menang
                akan di-flag dan mendapat distribusi tile yang lebih buruk secara otomatis.
              </p>
            </div>
          </Section>

          {/* ── 7. Withdraw ── */}
          <Section id="withdraw">
            <SectionHeader number="07" title="Manipulasi Sistem Withdraw" tag="WITHDRAWAL TRICKS" tagColor="#ff2d6b" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Sistem withdraw dirancang dengan beberapa lapisan frustrasi: syarat turnover (TO),
              progress bar palsu, error acak, dan "pity success" pertama untuk membangun kepercayaan.
            </p>

            <WithdrawDemo />

            <div className="mt-4 space-y-2">
              {[
                { step: '1', text: 'Syarat Turnover Rp 300.000 — Harus main sebanyak itu dulu baru bisa tarik', color: '#ff9f43' },
                { step: '2', text: 'Progress bar sengaja macet di 90% selama ~3 detik untuk menambah ketegangan', color: '#ff9f43' },
                { step: '3', text: 'Withdraw pertama berhasil (membangun kepercayaan)', color: '#34d399' },
                { step: '4', text: 'Setelah berhasil withdraw, flag hasWithdrawn = true → maxAllowedWin = 0', color: '#ff2d6b' },
                { step: '5', text: 'Withdraw berikutnya selalu gagal dengan error acak', color: '#ff2d6b' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-white/5">
                  <span className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    {item.step}
                  </span>
                  <p className="text-xs text-on-surface-variant">{item.text}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 8. Near Miss ── */}
          <Section id="nearmiss">
            <SectionHeader number="08" title="Near Miss & Ilusi Kemenangan" tag="PSYCHOLOGICAL TRICKS" tagColor="#00e5ff" />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Near miss adalah ketika kamu "hampir menang" — dua tile Crown berjejer tapi yang ketiga
              tidak ada. Ini bukan kebetulan; sistem secara aktif menghasilkan pola ini di Fase 2 dan 3
              untuk memicu naluri "sedikit lagi!" dan mendorong terus bermain.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: <Eye className="w-5 h-5" />, color: '#00e5ff',
                  title: 'Visual Animation Buffering',
                  desc: 'Animasi berjalan mulus seolah tile "jatuh secara alami", padahal posisi akhir sudah ditentukan sebelum animasi dimulai.',
                },
                {
                  icon: <Activity className="w-5 h-5" />, color: '#ff9f43',
                  title: 'Near Miss Sound',
                  desc: 'Suara khusus (playNearMiss) dimainkan saat tidak ada match di Fase 2+. Frekuensi menurun untuk memberi kesan "gagal hampir sukses".',
                },
                {
                  icon: <Brain className="w-5 h-5" />, color: '#a855f7',
                  title: 'Dopamin Loop',
                  desc: 'Fase 1 memberi kemenangan cepat untuk membangun ekspektasi. Fase 2-3 menghancurkan ekspektasi itu perlahan — siklus yang menyebabkan kecanduan.',
                },
              ].map((card, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ backgroundColor: `${card.color}08`, borderColor: `${card.color}25` }}>
                  <div className="p-2 rounded-lg w-fit mb-3" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                    {card.icon}
                  </div>
                  <p className="text-sm font-bold text-white mb-2">{card.title}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <CodeBlock>{`// Dari gameStore.ts — Near Miss sound trigger
matches = findMatches(currentGrid);
if (matches.length > 0) {
  currentCombo++;
} else {
  // Tidak ada match → mungkin near miss
  if (phase >= 2 && Math.random() > 0.6) {
    soundEngine.playNearMiss(); // Suara "hampir menang"
  }
}`}</CodeBlock>
          </Section>

          {/* ── 9. Conclusion ── */}
          <Section id="conclusion">
            <div className="p-8 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: '#ff2d6b06', borderColor: '#ff2d6b30' }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: '#ff2d6b08' }} />
              <p className="text-xs font-label uppercase tracking-widest mb-4" style={{ color: '#ff2d6b' }}>
                ⚠ Kesimpulan
              </p>
              <h2 className="font-headline font-black text-3xl text-white mb-4 leading-tight">
                Mesin ini bukan dirancang<br />untuk <span style={{ color: '#00e5ff' }}>ditantang</span>,<br />
                melainkan untuk <span style={{ color: '#ff2d6b' }}>mengeksploitasi</span>.
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6 max-w-xl">
                Setiap elemen — dari animasi, suara, tile yang jatuh, hingga progress bar withdraw —
                adalah bagian dari sistem psikologis yang dirancang untuk membuatmu terus bermain
                sambil menguras saldo secara sistematis.
              </p>

              <div className="p-5 rounded-xl border" style={{ backgroundColor: '#00e5ff06', borderColor: '#00e5ff30' }}>
                <p className="text-xs font-label uppercase tracking-widest text-primary-container mb-3">Satu-Satunya Kemenangan Mutlak:</p>
                <p className="text-lg font-headline font-bold text-white italic">
                  "Satu-satunya cara untuk menang melawan algoritma adalah dengan tidak menekan tombol 'Play'."
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Lapisan Manipulasi', value: '3+' },
                  { label: 'Hadiah Dipotong (Fase 3)', value: '90%' },
                  { label: 'Diamond di Fase 3', value: '2%' },
                  { label: 'Max Kemenangan Izin', value: '70%' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-2xl font-black" style={{ color: '#00e5ff' }}>{stat.value}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  number, title, tag, tagColor = '#00e5ff'
}: {
  number: string; title: string; tag: string; tagColor?: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[10px] font-mono text-on-surface-variant">{number}</span>
        <div className="h-px flex-1 bg-white/5" />
        <InfoTag color={tagColor}>{tag}</InfoTag>
      </div>
      <h2 className="text-2xl font-headline font-black text-white">{title}</h2>
    </div>
  );
}