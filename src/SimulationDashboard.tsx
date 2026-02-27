import { useMemo, useState } from 'react';
import { useStore } from './store';
import { getAllAgentOrders } from './agents';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { EpochLog } from './types';

function EpochLogItem({ log }: { log: EpochLog }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-zinc-950/50 rounded border border-white/5 flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 text-xs hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-zinc-400">Epoch {log.epoch}</span>
          <span className="font-mono text-emerald-500/70">${log.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <span>{log.actions.length} events</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>
      {isOpen && (
        <div className="p-2 border-t border-white/5 flex flex-col gap-1.5 bg-black/20">
          {log.actions.length > 0 ? log.actions.map((action, i: number) => (
            <div key={i} className="text-[10px] font-mono grid grid-cols-[80px_1fr] gap-2">
              <span className="text-zinc-500 truncate">{action.agentId}</span>
              <span className={action.action.includes('MARGIN CALL') ? 'text-rose-400' : 'text-zinc-300'}>{action.action}</span>
            </div>
          )) : (
            <span className="text-[10px] text-zinc-600 font-mono text-center">No events this epoch</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the primary simulation dashboard including the active Price Action,
 * Agent Wealth Race (Mark-to-Market), the pending Limit Order Book, and the live event log.
 */
export function SimulationDashboard() {
  const store = useStore();
  const { epoch, history, wealthHistory, agents, logs } = store;

  // 1. Price Action Data
  const priceData = useMemo(() => {
    return history.map((price, index) => ({
      epoch: index,
      price,
    }));
  }, [history]);

  const rationalistIntrinsicValue = agents['Rationalist']?.params.intrinsicValue || 100;

  // 2. Wealth Race Data
  const wealthData = useMemo(() => {
    // We assume all agents have the same wealthHistory length
    const length = wealthHistory['Prospector']?.length || 0;
    const data = [];
    for (let i = 0; i < length; i++) {
      data.push({
        epoch: i,
        Prospector: wealthHistory['Prospector']?.[i] || 0,
        Rationalist: wealthHistory['Rationalist']?.[i] || 0,
        Momentum: wealthHistory['Momentum']?.[i] || 0,
        MeanRevertor: wealthHistory['MeanRevertor']?.[i] || 0,
        MarketMaker: wealthHistory['MarketMaker']?.[i] || 0,
        NoiseTrader: wealthHistory['NoiseTrader']?.[i] || 0,
      });
    }
    return data;
  }, [wealthHistory]);

  // 3. Market Depth / LOB (Top 5 Bids and Asks)
  const { bids, asks } = useMemo(() => {
    const orders = getAllAgentOrders(store, agents);
    const sortedBids = orders.filter(o => o.side === 1).sort((a, b) => b.price - a.price).slice(0, 5);
    const sortedAsks = orders.filter(o => o.side === -1).sort((a, b) => a.price - b.price).slice(0, 5);

    return { bids: sortedBids, asks: sortedAsks };
  }, [store, agents]); // Update when epoch changes

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      {/* Top Section: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 shrink-0">
        {/* Price Action Chart */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Price Action</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="epoch" stroke="#ffffff40" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} stroke="#ffffff40" tick={{ fill: '#ffffff40', fontSize: 12 }} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <ReferenceLine y={rationalistIntrinsicValue} stroke="#60a5fa" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Intrinsic Value', fill: '#60a5fa', fontSize: 12 }} />
                <Line type="stepAfter" dataKey="price" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Wealth Race */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Agent Wealth Race (MtM)</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="epoch" stroke="#ffffff40" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} stroke="#ffffff40" tick={{ fill: '#ffffff40', fontSize: 12 }} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="Prospector" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Rationalist" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Momentum" stroke="#fb7185" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="MeanRevertor" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="MarketMaker" stroke="#c084fc" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="NoiseTrader" stroke="#f472b6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Section: Horizontal LOB */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 flex flex-col shrink-0">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center justify-between">
          <span>Limit Order Book (LOB)</span>
          <span className="text-xs font-mono text-zinc-500">Epoch {epoch} Pending</span>
        </h3>

        <div className="grid grid-cols-3 gap-6 text-sm font-mono">
          {/* Sellers (Asks) - Column 1 */}
          <div className="flex flex-col gap-1 h-56 overflow-y-auto pr-2 scrollbar-thin">
            <div className="text-xs text-rose-400 font-semibold mb-1">Sellers (Asks) - Higher Prices</div>
            <div className="grid grid-cols-3 text-xs text-zinc-500 mb-1 border-b border-white/5 pb-1">
              <span>AGENT</span>
              <span className="text-right">PRICE</span>
              <span className="text-right">QTY</span>
            </div>
            {asks.length > 0 ? asks.map((ask, i) => (
              <div key={`ask-${i}`} className="grid grid-cols-3 text-rose-400/90 py-1 hover:bg-white/5 rounded px-1">
                <span className="truncate pr-2">{ask.agentId}</span>
                <span className="text-right">${ask.price.toFixed(2)}</span>
                <span className="text-right">{ask.quantity}</span>
              </div>
            )) : (
              <div className="text-center text-zinc-600 py-4 text-xs">No asks pending</div>
            )}
          </div>

          {/* Current Price - Column 2 */}
          <div className="flex flex-col items-center justify-center border-x border-white/10 px-4 h-56">
            <span className="text-xs text-zinc-500 uppercase mb-2">Current Market Price</span>
            <span className="text-emerald-400 font-bold text-3xl">${store.currentPrice.toFixed(2)}</span>
          </div>

          {/* Buyers (Bids) - Column 3 */}
          <div className="flex flex-col gap-1 h-56 overflow-y-auto pr-2 scrollbar-thin">
            <div className="text-xs text-emerald-400 font-semibold mb-1">Buyers (Bids) - Lower Prices</div>
            <div className="grid grid-cols-3 text-xs text-zinc-500 mb-1 border-b border-white/5 pb-1">
              <span>AGENT</span>
              <span className="text-right">PRICE</span>
              <span className="text-right">QTY</span>
            </div>
            {bids.length > 0 ? bids.map((bid, i) => (
              <div key={`bid-${i}`} className="grid grid-cols-3 text-emerald-400/90 py-1 hover:bg-white/5 rounded px-1">
                <span className="truncate pr-2">{bid.agentId}</span>
                <span className="text-right">${bid.price.toFixed(2)}</span>
                <span className="text-right">{bid.quantity}</span>
              </div>
            )) : (
              <div className="text-center text-zinc-600 py-4 text-xs">No bids pending</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Logs (Vertical Panel) */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 flex flex-col flex-1 min-h-0">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center justify-between">
          <span>Event Logs</span>
          <span className="text-xs font-mono text-zinc-500">Live Stream</span>
        </h3>
        {/* We use a vertical flex container that scrolls vertically */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
          {logs.map((log: EpochLog) => (
            <EpochLogItem key={log.epoch} log={log} />
          ))}
          {logs.length === 0 && (
            <div className="w-full text-center text-zinc-600 py-8 text-xs">No logs recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
