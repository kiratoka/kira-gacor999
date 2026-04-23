import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDrag } from '@use-gesture/react';
import { useGameStore, GRID_SIZE, TILE_TYPES, COST_RANDOMIZE, COST_PER_MOVE } from '../store/gameStore';
import { cn } from '../lib/utils';
import { Gem, Star, Heart, Crown, Coins, CircleDollarSign, Shuffle } from 'lucide-react';
import { soundEngine } from '../lib/audio';

const TILE_ICONS = [Gem, Star, Heart, Crown, Coins, CircleDollarSign];
// Removed drop-shadow from icons to reduce rendering cost
const TILE_COLORS = [
  'text-cyan-400',
  'text-blue-500',
  'text-purple-500',
  'text-pink-500',
  'text-emerald-400',
  'text-lime-400'
];

const TILE_BG = [
  'bg-cyan-950/40 border-cyan-500/30',
  'bg-blue-950/40 border-blue-500/30',
  'bg-purple-950/40 border-purple-500/30',
  'bg-pink-950/40 border-pink-500/30',
  'bg-emerald-950/40 border-emerald-500/30',
  'bg-lime-950/40 border-lime-500/30'
];

// Base colors for dynamic glows (simplified)
const GLOW_COLORS = [
  'rgba(34,211,238,', // Cyan
  'rgba(59,130,246,', // Blue
  'rgba(168,85,247,', // Purple
  'rgba(236,72,153,', // Pink
  'rgba(52,211,153,', // Emerald
  'rgba(163,230,53,'  // Lime
];

interface TileProps {
  tile: any;
  size: number;
  onSwap: (x1: number, y1: number, x2: number, y2: number) => Promise<void>;
  isProcessing: boolean;
  setHoldingTileId: (id: string | null) => void;
}

const Tile = React.memo(({ tile, size, onSwap, isProcessing, setHoldingTileId }: TileProps) => {
  const Icon = TILE_ICONS[tile.type];
  const glowColor = GLOW_COLORS[tile.type];
  
  const [isHovered, setIsHovered] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [{ mx, my }, setDrag] = useState({ mx: 0, my: 0 });
  const [showRipple, setShowRipple] = useState(false);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const bind = useDrag(({ down, movement: [x, y], distance, cancel, first }) => {
    if (isProcessing) return;
    
    if (first) {
      holdTimerRef.current = setTimeout(() => {
        setIsHeld(true);
        setHoldingTileId(tile.id);
      }, 150);
      
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 200);
      soundEngine.playTap(); 
    }
    
    if (down) {
      setDrag({ mx: x, my: y });
      if (distance[0] > 5 || distance[1] > 5) {
        setIsDragging(true);
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
      }
    } else {
      setDrag({ mx: 0, my: 0 });
      setIsHeld(false);
      setIsDragging(false);
      setHoldingTileId(null);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }

    // Threshold for swipe
    if (distance[0] > size / 1.5 || distance[1] > size / 1.5) {
      if (Math.abs(x) > Math.abs(y)) {
        // Horizontal
        if (x > 0 && tile.x < GRID_SIZE - 1) onSwap(tile.x, tile.y, tile.x + 1, tile.y);
        else if (x < 0 && tile.x > 0) onSwap(tile.x, tile.y, tile.x - 1, tile.y);
      } else {
        // Vertical
        if (y > 0 && tile.y < GRID_SIZE - 1) onSwap(tile.x, tile.y, tile.x, tile.y + 1);
        else if (y < 0 && tile.y > 0) onSwap(tile.x, tile.y, tile.x, tile.y - 1);
      }
      cancel();
      setDrag({ mx: 0, my: 0 });
      setIsHeld(false);
      setIsDragging(false);
      setHoldingTileId(null);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }
  });

  const bindProps = (bind as any)();
  const isInteracting = isHovered || isHeld || isDragging;

  return (
    <motion.div
      {...bindProps}
      layout
      initial={tile.isNew ? { y: -200, opacity: 0, scale: 0.5 } : false}
      animate={{
        x: tile.x * size + mx,
        y: tile.y * size + my,
        opacity: tile.isMatched ? 0 : 1,
        scale: tile.isMatched ? 1.5 : (isHeld ? 1.1 : (isHovered ? 1.04 : 1)),
        zIndex: isHeld || isDragging ? 50 : (tile.isMatched ? 10 : 1)
      }}
      whileTap={{ scale: tile.isMatched ? 1.5 : 0.97 }}
      transition={{
        type: 'spring',
        stiffness: isDragging ? 800 : 400,
        damping: isDragging ? 40 : 25,
        mass: 0.8,
        scale: { type: 'spring', stiffness: 500, damping: 20, mass: 0.5 },
        opacity: { duration: 0.15 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute flex items-center justify-center p-1 touch-none cursor-pointer"
      style={{ 
        width: size, 
        height: size,
        willChange: isInteracting ? 'transform, opacity' : 'auto'
      }}
    >
      {/* Ripple Effect (Click State) - No Blur */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            initial={{ opacity: 0.5, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              backgroundColor: `${glowColor}0.3)`,
              boxShadow: `0 0 10px ${glowColor}0.4)`
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Tile Content */}
      <motion.div 
        animate={{
          boxShadow: isHeld 
            ? `0 0 16px ${glowColor}0.5)` 
            : isHovered 
              ? `0 0 8px ${glowColor}0.3)`
              : `0 0 0px ${glowColor}0)`
        }}
        transition={{
          boxShadow: { duration: 0.1, ease: "easeOut" }
        }}
        className={cn(
          "w-full h-full rounded-xl border flex items-center justify-center transition-colors duration-150 relative overflow-hidden",
          TILE_BG[tile.type],
          tile.isMatched && "bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]",
          isHeld && "border-white/80 bg-opacity-100"
        )}
      >
        <Icon className={cn(
          "w-3/5 h-3/5 transition-all duration-150 relative z-10", 
          TILE_COLORS[tile.type], 
          tile.isMatched && "text-white"
        )} />
        {tile.type === 5 && <span className="absolute text-[8px] font-black text-lime-950 z-10">1</span>}
      </motion.div>
    </motion.div>
  );
});

export function InteractiveMatch3() {
  const { grid, initGame, swapTiles, isProcessing, combo, phase, randomizeBoard, balance, betMultiplier, setBetMultiplier } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(0);
  const [showRandomizeConfirm, setShowRandomizeConfirm] = useState(false);
  const [holdingTileId, setHoldingTileId] = useState<string | null>(null);

  useEffect(() => {
    if (useGameStore.getState().grid.length === 0) {
      initGame();
    }
    
    const updateSize = () => {
      if (containerRef.current) {
        setTileSize(containerRef.current.offsetWidth / GRID_SIZE);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [initGame]);

  const handleRandomize = useCallback(() => {
    setShowRandomizeConfirm(false);
    randomizeBoard();
  }, [randomizeBoard]);

  const currentCost = COST_PER_MOVE * betMultiplier;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div 
        id="game-board"
        data-tutorial="board"
        ref={containerRef}
        className="w-full aspect-square bg-surface-container-lowest rounded-2xl border border-primary-container/20 shadow-[0_0_20px_rgba(0,255,255,0.05)] relative overflow-hidden poison-grid"
      >
        {/* Dark Overlay when a tile is held - NO BLUR */}
        <AnimatePresence>
          {holdingTileId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/40 z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Combo Indicator */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <span className="text-6xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-br from-primary to-tertiary drop-shadow-[0_0_10px_rgba(255,3,85,0.5)]">
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
            setHoldingTileId={setHoldingTileId}
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
                    ? "bg-cyan-950/50 border border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] scale-105 cursor-pointer" 
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
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showRandomizeConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 p-4"
              style={{ zIndex: 99999 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-surface-container-highest p-6 rounded-2xl border border-primary-container/30 max-w-sm w-full shadow-[0_0_30px_rgba(0,255,255,0.1)]"
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
                    className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold hover:bg-primary transition-colors shadow-[0_0_10px_rgba(0,255,255,0.2)] cursor-pointer"
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
