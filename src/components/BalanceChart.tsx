import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { History, TrendingDown } from 'lucide-react';

export function BalanceChart() {
  const { balanceHistory } = useGameStore();
  const [hoveredData, setHoveredData] = useState<any>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-highest border border-primary-container/30 p-3 rounded-xl shadow-xl">
          <p className="text-xs text-on-surface-variant mb-1">{data.time}</p>
          <p className="text-sm font-bold text-white mb-1">{data.action}</p>
          <p className="text-xs font-mono text-primary-container">
            Saldo: Rp {data.saldo.toLocaleString('id-ID')}
          </p>
          {data.change !== 0 && (
            <p className={`text-xs font-mono mt-1 ${data.change > 0 ? 'text-lime-400' : 'text-error'}`}>
              {data.change > 0 ? '+' : ''}Rp {data.change.toLocaleString('id-ID')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-surface-container-high p-4 sm:p-6 rounded-2xl border border-white/5 w-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-label text-xs uppercase tracking-[0.2rem] text-primary-container font-bold flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Grafik Saldo Real-Time
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Visualisasi pergerakan saldo kamu. Perhatikan tren penurunannya.
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={balanceHistory}
              margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
              onMouseMove={(e) => {
                if (e.activePayload) {
                  setHoveredData(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
            >
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff50" 
                fontSize={10} 
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="#ffffff50" 
                fontSize={10}
                tickFormatter={(val) => `Rp ${(val/1000)}k`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00e5ff', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area 
                type="monotone" 
                dataKey="saldo" 
                stroke="#00e5ff" 
                strokeWidth={2} 
                fillOpacity={1}
                fill="url(#colorSaldo)"
                activeDot={{ r: 6, fill: '#00e5ff', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={300}
              />
              {hoveredData && (
                <ReferenceDot 
                  x={hoveredData.time} 
                  y={hoveredData.saldo} 
                  r={6} 
                  fill="#00e5ff" 
                  stroke="#fff" 
                  strokeWidth={2} 
                  isFront={true}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History List Section */}
      <div className="lg:col-span-1 bg-surface-container-high p-4 sm:p-6 rounded-2xl border border-white/5 w-full flex flex-col">
        <h3 className="font-label text-xs uppercase tracking-[0.2rem] text-primary-container font-bold flex items-center gap-2 mb-4">
          <History className="w-4 h-4" />
          Riwayat Permainan
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar" style={{ maxHeight: '300px' }}>
          {[...balanceHistory].reverse().map((entry) => (
            <div 
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                hoveredData?.id === entry.id 
                  ? 'bg-primary-container/10 border-primary-container/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                  : 'bg-surface-container-highest border-white/5 hover:bg-white/10'
              }`}
              onMouseEnter={() => setHoveredData(entry)}
              onMouseLeave={() => setHoveredData(null)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant font-mono">{entry.time}</span>
                <span className="text-sm font-bold text-white">{entry.action}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-mono font-bold ${
                  entry.change > 0 ? 'text-lime-400' : entry.change < 0 ? 'text-error' : 'text-on-surface-variant'
                }`}>
                  {entry.change > 0 ? '+' : ''}{entry.change !== 0 ? `Rp ${entry.change.toLocaleString('id-ID')}` : '-'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  Rp {entry.saldo.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
