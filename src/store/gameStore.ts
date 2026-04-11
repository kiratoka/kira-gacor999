import { create } from 'zustand';
import { soundEngine } from '../lib/audio';

export const GRID_SIZE = 8;
export const TILE_TYPES = 6; // Added Green Coin
export const COST_PER_MOVE = 5000;
export const COST_RANDOMIZE = 10000;

export interface TileData {
  id: string;
  type: number;
  x: number;
  y: number;
  isMatched: boolean;
  isNew: boolean;
}

export interface GameStats {
  totalPlayed: number;
  totalWon: number;
  netLoss: number;
  moves: number;
}

export interface BalanceHistoryEntry {
  id: string;
  time: string;
  action: string;
  change: number;
  saldo: number;
}

interface GameState {
  grid: TileData[];
  balance: number;
  balanceHistory: BalanceHistoryEntry[];
  totalDeposit: number;
  stats: GameStats;
  isProcessing: boolean;
  combo: number;
  phase: number;
  withdrawAttempted: boolean;
  hasWithdrawn: boolean;
  betMultiplier: number;
  adminTargetWin: number | null;
  
  isSidebarMinimized: boolean;
  toggleSidebar: () => void;
  
  isTutorialActive: boolean;
  tutorialStepIndex: number;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  
  setWithdrawAttempted: (val: boolean) => void;
  setHasWithdrawn: (val: boolean) => void;
  setBetMultiplier: (val: number) => void;
  setAdminTargetWin: (val: number | null) => void;
  initGame: () => void;
  randomizeBoard: () => Promise<void>;
  swapTiles: (x1: number, y1: number, x2: number, y2: number) => Promise<void>;
  topUp: (amount: number) => void;
  addHistoryEntry: (action: string, change: number, newSaldo: number) => void;
}

// Helper to get tile at x,y
const getTile = (grid: TileData[], x: number, y: number) => grid.find(t => t.x === x && t.y === y);

// Helper to check if there are any matches
const findMatches = (grid: TileData[]) => {
  const matches = new Set<string>();
  
  // Horizontal
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE - 2; x++) {
      const t1 = getTile(grid, x, y);
      const t2 = getTile(grid, x + 1, y);
      const t3 = getTile(grid, x + 2, y);
      if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type && t1.type !== -1) {
        matches.add(t1.id);
        matches.add(t2.id);
        matches.add(t3.id);
      }
    }
  }
  
  // Vertical
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE - 2; y++) {
      const t1 = getTile(grid, x, y);
      const t2 = getTile(grid, x, y + 1);
      const t3 = getTile(grid, x, y + 2);
      if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type && t1.type !== -1) {
        matches.add(t1.id);
        matches.add(t2.id);
        matches.add(t3.id);
      }
    }
  }
  
  return Array.from(matches);
};

// Weighted random tile generation
const getRandomTileType = (phase: number, withdrawAttempted: boolean) => {
  // Types: 0:Diamond, 1:Star, 2:Heart, 3:Crown, 4:Coins, 5:GreenCoin
  let weights = [10, 15, 20, 10, 20, 25]; // Default weights
  
  if (phase === 2) {
    weights = [5, 10, 20, 5, 25, 35]; // Less rare, more common
  } else if (phase === 3 || withdrawAttempted) {
    weights = [2, 5, 25, 2, 26, 40]; // Very few rares, mostly green coins and hearts
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return 5; // Fallback to Green Coin
};

// Generate a grid without initial matches
const generateInitialGrid = (phase: number = 1, withdrawAttempted: boolean = false): TileData[] => {
  let grid: TileData[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let type;
      do {
        type = getRandomTileType(phase, withdrawAttempted);
        // Check left 2
        const left1 = grid.find(t => t.x === x - 1 && t.y === y);
        const left2 = grid.find(t => t.x === x - 2 && t.y === y);
        // Check up 2
        const up1 = grid.find(t => t.x === x && t.y === y - 1);
        const up2 = grid.find(t => t.x === x && t.y === y - 2);
        
        const isHorizontalMatch = left1 && left2 && left1.type === type && left2.type === type;
        const isVerticalMatch = up1 && up2 && up1.type === type && up2.type === type;
        
        if (!isHorizontalMatch && !isVerticalMatch) break;
      } while (true);
      
      grid.push({
        id: `init-${x}-${y}-${Math.random()}`,
        type,
        x,
        y,
        isMatched: false,
        isNew: false
      });
    }
  }
  return grid;
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const calculateReward = (type: number, matchCount: number) => {
  // 0:Diamond, 1:Star, 2:Heart, 3:Crown, 4:Coins, 5:GreenCoin
  if (type === 0) return matchCount === 3 ? 1000 : matchCount === 4 ? 3000 : 7000;
  if (type === 3) return matchCount === 3 ? 1500 : matchCount === 4 ? 4000 : 10000;
  if (type === 1) return matchCount === 3 ? 1200 : matchCount === 4 ? 3500 : 8000;
  if (type === 5) return matchCount === 3 ? 800 : matchCount === 4 ? 2000 : 4000;
  // Fallbacks for others
  return matchCount === 3 ? 900 : matchCount === 4 ? 2500 : 5000;
};

const getFormattedTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

export const useGameStore = create<GameState>((set, get) => ({
  grid: [],
  balance: 100000,
  balanceHistory: [{
    id: `init-${Date.now()}`,
    time: getFormattedTime(),
    action: "Mulai Game",
    change: 0,
    saldo: 100000
  }],
  totalDeposit: 100000,
  stats: {
    totalPlayed: 0,
    totalWon: 0,
    netLoss: 0,
    moves: 0
  },
  isProcessing: false,
  combo: 0,
  phase: 1,
  withdrawAttempted: false,
  hasWithdrawn: false,
  betMultiplier: 1,
  adminTargetWin: null,
  
  isSidebarMinimized: false,
  toggleSidebar: () => set(s => ({ isSidebarMinimized: !s.isSidebarMinimized })),
  
  isTutorialActive: true,
  tutorialStepIndex: 0,
  startTutorial: () => set({ isTutorialActive: true, tutorialStepIndex: 0 }),
  nextTutorialStep: () => set(s => ({ tutorialStepIndex: Math.min(s.tutorialStepIndex + 1, 11) })),
  prevTutorialStep: () => set(s => ({ tutorialStepIndex: Math.max(s.tutorialStepIndex - 1, 0) })),
  skipTutorial: () => set({ isTutorialActive: false }),
  
  setWithdrawAttempted: (val) => set({ withdrawAttempted: val }),
  setHasWithdrawn: (val) => set({ hasWithdrawn: val }),
  setBetMultiplier: (val) => set({ betMultiplier: val }),
  setAdminTargetWin: (val) => set({ adminTargetWin: val }),

  addHistoryEntry: (action, change, newSaldo) => set(s => {
    const newEntry: BalanceHistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      time: getFormattedTime(),
      action,
      change,
      saldo: newSaldo
    };
    const newHistory = [...s.balanceHistory, newEntry];
    if (newHistory.length > 100) newHistory.shift(); // Keep last 100
    return { balanceHistory: newHistory };
  }),

  topUp: (amount) => set(s => {
    const newSaldo = s.balance + amount;
    const newEntry: BalanceHistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      time: getFormattedTime(),
      action: "Top Up",
      change: amount,
      saldo: newSaldo
    };
    const newHistory = [...s.balanceHistory, newEntry];
    if (newHistory.length > 100) newHistory.shift();
    return { 
      balance: newSaldo, 
      totalDeposit: s.totalDeposit + amount,
      balanceHistory: newHistory
    };
  }),

  initGame: () => {
    set({
      grid: generateInitialGrid(1, false),
      balance: 100000,
      balanceHistory: [{
        id: `init-${Date.now()}`,
        time: getFormattedTime(),
        action: "Mulai Game",
        change: 0,
        saldo: 100000
      }],
      totalDeposit: 100000,
      stats: { totalPlayed: 0, totalWon: 0, netLoss: 0, moves: 0 },
      isProcessing: false,
      combo: 0,
      phase: 1,
      withdrawAttempted: false,
      hasWithdrawn: false,
      betMultiplier: 1
    });
  },

  randomizeBoard: async () => {
    const state = get();
    if (state.isProcessing || state.isTutorialActive) return;
    if (state.balance < COST_RANDOMIZE) {
      soundEngine.playError();
      return;
    }

    set({ isProcessing: true });
    soundEngine.playSwap(); // Play some sound

    const newSaldo = state.balance - COST_RANDOMIZE;
    get().addHistoryEntry("Acak Papan", -COST_RANDOMIZE, newSaldo);

    set(s => ({
      balance: newSaldo,
      stats: {
        ...s.stats,
        totalPlayed: s.stats.totalPlayed + COST_RANDOMIZE,
        netLoss: (s.stats.totalPlayed + COST_RANDOMIZE) - s.stats.totalWon,
      },
      grid: generateInitialGrid(s.phase, s.withdrawAttempted)
    }));

    await delay(500);
    set({ isProcessing: false });
  },

  swapTiles: async (x1, y1, x2, y2) => {
    const state = get();
    if (state.isProcessing || state.isTutorialActive) return;
    
    // Check adjacency
    const isAdjacent = (Math.abs(x1 - x2) === 1 && y1 === y2) || (Math.abs(y1 - y2) === 1 && x1 === x2);
    if (!isAdjacent) return;

    const currentCost = COST_PER_MOVE * state.betMultiplier;

    if (state.balance < currentCost) {
      soundEngine.playError();
      return;
    }

    set({ isProcessing: true });
    soundEngine.playSwap();

    // Perform swap in state
    let newGrid = [...state.grid];
    const t1Index = newGrid.findIndex(t => t.x === x1 && t.y === y1);
    const t2Index = newGrid.findIndex(t => t.x === x2 && t.y === y2);
    
    if (t1Index === -1 || t2Index === -1) {
      set({ isProcessing: false });
      return;
    }

    // Swap coordinates
    const tempX = newGrid[t1Index].x;
    const tempY = newGrid[t1Index].y;
    newGrid[t1Index] = { ...newGrid[t1Index], x: newGrid[t2Index].x, y: newGrid[t2Index].y };
    newGrid[t2Index] = { ...newGrid[t2Index], x: tempX, y: tempY };
    
    set({ grid: newGrid });
    await delay(250); // Wait for swap animation

    let matches = findMatches(newGrid);
    
    if (matches.length === 0) {
      // Invalid move, swap back
      soundEngine.playError();
      const revertGrid = [...newGrid];
      const rt1Index = revertGrid.findIndex(t => t.id === newGrid[t1Index].id);
      const rt2Index = revertGrid.findIndex(t => t.id === newGrid[t2Index].id);
      
      const rTempX = revertGrid[rt1Index].x;
      const rTempY = revertGrid[rt1Index].y;
      revertGrid[rt1Index] = { ...revertGrid[rt1Index], x: revertGrid[rt2Index].x, y: revertGrid[rt2Index].y };
      revertGrid[rt2Index] = { ...revertGrid[rt2Index], x: rTempX, y: rTempY };
      
      set({ grid: revertGrid, isProcessing: false });
      return;
    }

    // Valid move! Deduct cost
    const newSaldoAfterMove = state.balance - currentCost;
    get().addHistoryEntry(`Main (x${state.betMultiplier})`, -currentCost, newSaldoAfterMove);

    set(s => ({
      balance: newSaldoAfterMove,
      stats: {
        ...s.stats,
        totalPlayed: s.stats.totalPlayed + currentCost,
        netLoss: (s.stats.totalPlayed + currentCost) - s.stats.totalWon,
        moves: s.stats.moves + 1
      },
      combo: 1
    }));

    // Update phase based on moves and bet multiplier
    const moves = get().stats.moves;
    const betMult = get().betMultiplier;
    if (betMult === 5) {
      set({ phase: 3 }); // Force drain phase if betting max
    } else {
      if (moves >= 5 && moves < 15) set({ phase: 2 });
      if (moves >= 15) set({ phase: 3 });
    }

    // Process matches and cascades
    let currentGrid = [...newGrid];
    let currentCombo = 1;

    while (matches.length > 0) {
      // Mark as matched
      currentGrid = currentGrid.map(t => matches.includes(t.id) ? { ...t, isMatched: true } : t);
      set({ grid: currentGrid });
      
      if (currentCombo > 1) {
        soundEngine.playCombo(currentCombo);
      } else {
        soundEngine.playMatch();
      }

      await delay(300); // Wait for explosion animation

      // Calculate reward based on matched types and bet multiplier
      let totalReward = 0;
      const matchedTiles = currentGrid.filter(t => t.isMatched);
      
      // Group by type to calculate rewards accurately if multiple matches happen simultaneously
      const typeCounts: Record<number, number> = {};
      matchedTiles.forEach(t => {
        typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
      });

      Object.entries(typeCounts).forEach(([typeStr, count]) => {
        const type = parseInt(typeStr);
        // If a huge match happens, cap it at 5 for calculation purposes
        const effectiveCount = Math.min(count, 5);
        totalReward += calculateReward(type, effectiveCount) * currentCombo * get().betMultiplier;
      });
      
      // RIGGED LOGIC: Admin Control & Hard Limits
      const currentStats = get().stats;
      const adminTarget = get().adminTargetWin;
      const hasWithdrawn = get().hasWithdrawn;
      
      let maxAllowedWin = currentStats.totalPlayed * 0.7;
      
      if (adminTarget !== null) {
         maxAllowedWin = adminTarget;
      }
      if (hasWithdrawn) {
         maxAllowedWin = 0; // Force lose after withdraw
      }
      
      if (currentStats.totalWon + totalReward > maxAllowedWin && get().phase >= 2) {
         // Nerf the reward secretly if it exceeds the hard limit
         totalReward = Math.floor(totalReward * 0.1); 
      }

      if (totalReward > 0) {
        const newSaldoAfterWin = get().balance + totalReward;
        get().addHistoryEntry(currentCombo > 1 ? `Combo x${currentCombo} Menang` : "Menang", totalReward, newSaldoAfterWin);
        
        set(s => ({
          balance: newSaldoAfterWin,
          stats: {
            ...s.stats,
            totalWon: s.stats.totalWon + totalReward,
            netLoss: s.stats.totalPlayed - (s.stats.totalWon + totalReward)
          }
        }));
      }

      // Remove matched and apply gravity
      currentGrid = currentGrid.filter(t => !t.isMatched);
      
      // Gravity
      for (let x = 0; x < GRID_SIZE; x++) {
        let emptySpots = 0;
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
          const tileIndex = currentGrid.findIndex(t => t.x === x && t.y === y);
          if (tileIndex === -1) {
            emptySpots++;
          } else if (emptySpots > 0) {
            currentGrid[tileIndex] = { ...currentGrid[tileIndex], y: currentGrid[tileIndex].y + emptySpots };
          }
        }
      }
      
      set({ grid: currentGrid });
      await delay(200); // Wait for fall

      // Generate new tiles
      const phase = get().phase;
      const balance = get().balance;
      const withdrawAttempted = get().withdrawAttempted;
      const stats = get().stats;
      const adminTargetWin = get().adminTargetWin;
      const hasWithdrawnState = get().hasWithdrawn;
      
      let newTiles: TileData[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const columnTiles = currentGrid.filter(t => t.x === x).length;
        const missing = GRID_SIZE - columnTiles;
        
        for (let i = 0; i < missing; i++) {
          const y = missing - 1 - i;
          
          let type = getRandomTileType(phase, withdrawAttempted);
          
          // --- RIGGED LOGIC: Prevent Cascades ---
          const forceLose = hasWithdrawnState || (adminTargetWin !== null && stats.totalWon >= adminTargetWin);
          if (withdrawAttempted || phase === 3 || forceLose) {
            const below = currentGrid.find(t => t.x === x && t.y === y + 1) || newTiles.find(t => t.x === x && t.y === y + 1);
            if (below) {
              let attempts = 0;
              while (type === below.type && attempts < 10) {
                type = getRandomTileType(phase, withdrawAttempted);
                attempts++;
              }
            }
            if (withdrawAttempted || forceLose) {
               const left = currentGrid.find(t => t.x === x - 1 && t.y === y) || newTiles.find(t => t.x === x - 1 && t.y === y);
               if (left && type === left.type) {
                  type = (type + 1) % TILE_TYPES;
               }
            }
          }
          
          // --- RIGGED LOGIC: Fake Win (Pity Win) or Admin Forced Win ---
          const needsAdminWin = adminTargetWin !== null && stats.totalWon < adminTargetWin;
          if ((!withdrawAttempted && stats.netLoss > 30000 && Math.random() > 0.8) || (needsAdminWin && Math.random() > 0.5)) {
            const left = currentGrid.find(t => t.x === x - 1 && t.y === y) || newTiles.find(t => t.x === x - 1 && t.y === y);
            if (left) type = left.type; // Force match
          }

          newTiles.push({
            id: `new-${x}-${y}-${Date.now()}-${Math.random()}`,
            type,
            x,
            y,
            isMatched: false,
            isNew: true
          });
        }
      }
      
      currentGrid = [...currentGrid, ...newTiles];
      set({ grid: currentGrid });
      await delay(300); // Wait for spawn animation
      
      // Clear isNew flag
      currentGrid = currentGrid.map(t => ({ ...t, isNew: false }));
      set({ grid: currentGrid });

      matches = findMatches(currentGrid);
      if (matches.length > 0) {
        currentCombo++;
        set({ combo: currentCombo });
      } else {
        // Check for near miss to play sound
        if (phase >= 2 && Math.random() > 0.6) {
           soundEngine.playNearMiss();
        }
      }
    }

    set({ isProcessing: false, combo: 0 });
  }
}));
