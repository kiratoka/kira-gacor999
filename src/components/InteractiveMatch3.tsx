import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrag } from '@use-gesture/react';
import { useGameStore, GRID_SIZE, TILE_TYPES, COST_RANDOMIZE, COST_PER_MOVE } from '../store/gameStore';
import { cn } from '../lib/utils';
import { Gem, Star, Heart, Crown, Coins, CircleDollarSign, Shuffle } from 'lucide-react';

const TILE_ICONS = [Gem, Star, Heart, Crown, Coins, CircleDollarSign];
const TILE_COLORS = [
  'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
  'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]',
  'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
  'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]',
  'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]' // Green Coin
];

const TILE_BG = [
  'bg-cyan-950/40 border-cyan-500/30',
  'bg-blue-950/40 border-blue-500/30',
  'bg-purple-950/40 border-purple-500/30',
  'bg-pink-950/40 border-pink-500/30',
  'bg-emerald-950/40 border-emerald-500/30',
  'bg-lime-950/40 border-lime-500/30' // Green Coin
];

interface TileProps {
  key?: string;
  tile: any;
  size: number;
  onSwap: (x1: number, y1: number, x2: number, y2: number) => Promise<void>;
  isProcessing: boolean;
}

const Tile = ({ tile, size, onSwap, isProcessing }: TileProps) => {
  const Icon = TILE_ICONS[tile.type];
  
  const bind = useDrag(({ down, movement: [mx, my], distance, cancel }) => {
    if (isProcessing || down) return;
    
    // Threshold for swipe
    if (distance[0] > size / 2 || distance[1] > size / 2) {
      if (Math.abs(mx) > Math.abs(my)) {
        // Horizontal
        if (mx > 0 && tile.x < GRID_SIZE - 1) onSwap(tile.x, tile.y, tile.x + 1, tile.y);
        else if (mx < 0 && tile.x > 0) onSwap(tile.x, tile.y, tile.x - 1, tile.y);
      } else {
        // Vertical
        if (my > 0 && tile.y < GRID_SIZE - 1) onSwap(tile.x, tile.y, tile.x, tile.y + 1);
        else if (my < 0 && tile.y > 0) onSwap(tile.x, tile.y, tile.x, tile.y - 1);
      }
      cancel();
    }
  });

  const bindProps = (bind as any)();

  return (
    <motion.div
      {...bindProps}
      layout
      initial={tile.isNew ? { y: -200, opacity: 0, scale: 0.5 } : false}
      animate={{
        x: tile.x * size,
        y: tile.y * size,
        opacity: tile.isMatched ? 0 : 1,
        scale: tile.isMatched ? 1.5 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8,
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      className="absolute flex items-center justify-center p-1 touch-none cursor-pointer"
      style={{ width: size, height: size, zIndex: tile.isMatched ? 10 : 1 }}
    >
      <div className={cn(
        "w-full h-full rounded-xl border flex items-center justify-center shadow-inner transition-colors",
        TILE_BG[tile.type],
        tile.isMatched && "bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
      )}>
        <Icon className={cn("w-3/5 h-3/5", TILE_COLORS[tile.type], tile.isMatched && "text-white drop-shadow-none")} />
        {tile.type === 5 && <span className="absolute text-[8px] font-black text-lime-950">1</span>}
      </div>
    </motion.div>
  );
};

export function InteractiveMatch3() {
  const { grid, initGame, swapTiles, isProcessing, combo, phase, randomizeBoard, balance, betMultiplier, setBetMultiplier } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(0);
  const [showRandomizeConfirm, setShowRandomizeConfirm] = useState(false);

  useEffect(() => {
    initGame();
    
    const updateSize = () => {
      if (containerRef.current) {
        setTileSize(containerRef.current.offsetWidth / GRID_SIZE);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [initGame]);

  const handleRandomize = () => {
    setShowRandomizeConfirm(false);
    randomizeBoard();
  };

  const currentCost = COST_PER_MOVE * betMultiplier;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div 
        id="game-board"
        data-tutorial="board"
        ref={containerRef}
        className="w-full aspect-square bg-surface-container-lowest rounded-2xl border border-primary-container/20 shadow-[0_0_40px_rgba(0,255,255,0.05)] relative overflow-hidden poison-grid"
      >
        {/* Combo Indicator */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <span className="text-6xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-br from-primary to-tertiary drop-shadow-[0_0_20px_rgba(255,3,85,0.8)]">
                {combo}x
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase Indicator (Subtle) */}
        <div className="absolute top-2 right-2 z-0 opacity-20 pointer-events-none">
          <span className="text-[10px] font-mono text-primary-container">SYS.PHASE_{phase}</span>
        </div>

        {/* Grid Background Cells */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10 pointer-events-none">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>

        {/* Tiles */}
        {tileSize > 0 && grid.map(tile => (
          <Tile 
            key={tile.id} 
            tile={tile} 
            size={tileSize} 
            onSwap={swapTiles} 
            isProcessing={isProcessing} 
          />
        ))}
      </div>
      
      <div className="mt-4 w-full flex flex-col items-center gap-4">
        <div id="bet-multiplier" data-tutorial="bet-multiplier" className="w-full flex flex-col gap-2">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant text-center">Taruhan (Bet Multiplier)</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 5].map(mult => (
              <button
                key={mult}
                onClick={() => setBetMultiplier(mult)}
                disabled={isProcessing}
                className={cn(
                  "px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300",
                  betMultiplier === mult 
                    ? "bg-cyan-950/50 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105 cursor-pointer" 
                    : "bg-surface-container-low border border-white/5 text-on-surface-variant hover:bg-surface-container hover:text-white cursor-pointer"
                )}
              >
                x{mult}
              </button>
            ))}
          </div>
        </div>

        <p id="move-cost" className="text-xs text-on-surface-variant font-label uppercase tracking-widest inline-block px-4 py-2 rounded-full bg-surface-container-low border border-white/5">
          Geser permata untuk mencocokkan (Biaya: Rp {currentCost.toLocaleString('id-ID')})
        </p>

        <button
          data-tutorial="randomize"
          onClick={() => setShowRandomizeConfirm(true)}
          disabled={isProcessing || balance < COST_RANDOMIZE}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-primary-container/30 text-primary-container rounded-xl hover:bg-primary-container/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          Acak Ulang Board (Rp 10.000)
        </button>
      </div>

      {/* Randomize Confirmation Popup */}
      <AnimatePresence>
        {showRandomizeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container-highest p-6 rounded-2xl border border-primary-container/30 max-w-sm w-full shadow-[0_0_50px_rgba(0,255,255,0.1)]"
            >
              <h3 className="text-lg font-headline font-bold text-white mb-2">Acak Ulang Board?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Dengan mengacak ulang, kamu berpeluang mendapatkan kombinasi lebih baik. Lanjutkan?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRandomizeConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container-low text-white font-bold hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleRandomize}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] cursor-pointer"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
