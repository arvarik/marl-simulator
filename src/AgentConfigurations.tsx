import { useStore } from './store';
import { Info } from 'lucide-react';

/**
 * Sidebar component that dynamically renders sliders for every agent's behavioral parameters.
 * Updates the global Zustand store in real-time as users interact with the sliders.
 */
export function AgentConfigurations() {
  const agents = useStore((state) => state.agents);
  const updateAgentParam = useStore((state) => state.updateAgentParam);

  const handleSliderChange = (agentId: string, paramName: string, value: string) => {
    updateAgentParam(agentId, paramName, parseFloat(value));
  };

  const agentConfigs = [
    {
      id: 'Prospector',
      description: 'Kahneman-Tversky value function. Evaluates unrealized PnL.',
      longDescription: 'The Emotional Trader. Uses Prospect Theory to mimic human biases. It holds onto losers too long hoping they bounce back, and sells winners too early to lock in tiny profits.',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      params: [
        { name: 'lossAversion', label: 'Loss Aversion (λ)', min: 1.0, max: 5.0, step: 0.1, tooltip: 'Low: Cuts losers quickly. High: Stubbornly holds onto losers, averaging down aggressively to avoid realizing a loss.' },
        { name: 'gainSensitivity', label: 'Gain Sensitivity (α)', min: 0.1, max: 2.0, step: 0.01, tooltip: 'Low: Lets winners ride. High: Panics and sells winners quickly to lock in tiny profits.' },
      ]
    },
    {
      id: 'Rationalist',
      description: 'Expected Utility Theory based on Intrinsic Value.',
      longDescription: 'The Fundamental Investor. Operates like Warren Buffett, believing the asset has a true underlying value. It buys when the price is below this anchor and sells when it is above.',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      params: [
        { name: 'intrinsicValue', label: 'Intrinsic Value (Vt)', min: 50, max: 200, step: 1, tooltip: 'The true value the agent believes the asset is worth. This acts as a gravitational anchor for the entire market.' },
      ]
    },
    {
      id: 'Momentum',
      description: 'Kinematics based on discrete derivative of price.',
      longDescription: 'The Trend Chaser. Ignores fundamentals and only cares about price action. It amplifies volatility by buying heavily when the price is rocketing up and selling when it is crashing.',
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
      params: [
        { name: 'lookbackWindow', label: 'Lookback Window (k)', min: 1, max: 20, step: 1, tooltip: 'Low: Hyper-reactive, trades on very recent price blips. High: Waits for long-term trends before acting.' },
        { name: 'threshold', label: 'Threshold', min: 0.1, max: 10, step: 0.1, tooltip: 'Low: Needs very little price movement to trigger a trade. High: Needs a massive price spike/crash to start trading.' },
      ]
    },
    {
      id: 'MeanRevertor',
      description: 'Stat-Arb based on Z-score of price vs SMA.',
      longDescription: 'The Contrarian. Believes prices always return to their historical average. It buys into panic and shorts into frenzy, providing liquidity but vulnerable to structural shifts.',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      params: [
        { name: 'smaWindow', label: 'SMA Window', min: 5, max: 50, step: 1, tooltip: 'The moving average timeframe. Low: Tracks recent prices closely. High: Assumes a very long-term historical average.' },
        { name: 'zScoreThreshold', label: 'Z-Score Threshold', min: 0.5, max: 3.0, step: 0.1, tooltip: 'Low: Very sensitive, trades at minor deviations. High: Waits for extreme, rare price spikes before stepping in.' },
      ]
    },
    {
      id: 'MarketMaker',
      description: 'Avellaneda-Stoikov model with inventory penalty.',
      longDescription: 'The Middleman. Does not care about price direction. Just provides liquidity to both buyers and sellers, earning the spread. Penalizes itself if it accidentally accumulates too much inventory.',
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      params: [
        { name: 'gamma', label: 'Inventory Penalty (γ)', min: 0.01, max: 0.5, step: 0.01, tooltip: 'Low: Happy to hold massive inventory risk. High: Terrified of holding inventory; wildly shifts prices to get rid of it.' },
        { name: 'spreadWidth', label: 'Spread Width (δ)', min: 0.5, max: 10, step: 0.5, tooltip: 'Low: Very competitive, tiny profit margins. High: Charges a massive fee to cross the book, slowing down the market.' },
      ]
    },
    {
      id: 'NoiseTrader',
      description: 'External Retail flow to simulate unpredictable market-takers.',
      longDescription: 'The Chaotic Retail. Injects random, unpredictable market orders to cross the spread and prevent the limit order book from deadlocking.',
      color: 'text-pink-400',
      border: 'border-pink-500/30',
      bg: 'bg-pink-500/10',
      params: [
        { name: 'tradeProbability', label: 'Trade Probability', min: 0.0, max: 1.0, step: 0.05, tooltip: 'Low: Rarely trades, market may stall. High: Spams the market with orders, creating high baseline volatility.' },
        { name: 'maxQuantity', label: 'Max Quantity', min: 1, max: 10, step: 1, tooltip: 'Low: Trades tiny amounts. High: Drops massive, unpredictable market orders that chew through liquidity.' },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-8">
      {agentConfigs.map((config) => {
        const agentState = agents[config.id];
        if (!agentState) return null;

        return (
          <div key={config.id} className={`rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 group relative">
                <h3 className={`text-base font-bold tracking-wide ${config.color}`}>{config.id}</h3>
                <Info size={14} className="text-zinc-500 hover:text-zinc-300 cursor-help transition-colors" />
                <div className="absolute left-0 top-6 w-64 p-3 bg-zinc-800 border border-white/10 rounded-md shadow-xl text-xs text-zinc-300 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {config.longDescription}
                </div>
              </div>
              <div className="text-[10px] font-mono text-white/50 bg-black/20 px-1.5 py-0.5 rounded">
                ${agentState.wealth.toFixed(2)}
              </div>
            </div>
            <p className="text-[11px] text-white/60 mb-4 leading-snug">
              {config.description}
            </p>

            <div className="flex-1 flex flex-col gap-3">
              {config.params.map((param) => {
                const value = agentState.params[param.name];
                return (
                  <div key={param.name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] text-white/80 font-mono">
                      <div className="flex items-center gap-1.5 group/param relative">
                        <span>{param.label}</span>
                        <Info size={12} className="text-zinc-500 hover:text-zinc-300 cursor-help transition-colors" />
                        <div className="absolute left-0 bottom-5 w-56 p-2 bg-zinc-800 border border-white/10 rounded-md shadow-xl text-[10px] text-zinc-300 z-50 opacity-0 invisible group-hover/param:opacity-100 group-hover/param:visible transition-all pointer-events-none whitespace-normal leading-tight">
                          {param.tooltip}
                        </div>
                      </div>
                      <span className="bg-black/30 px-1 py-0.5 rounded">{value.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={value}
                      onChange={(e) => handleSliderChange(config.id, param.name, e.target.value)}
                      className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-current"
                      style={{ color: 'inherit' }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-mono text-white/50">
              <div className="flex flex-col">
                <span>CASH</span>
                <span className="text-white/80">${agentState.cash.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span>INVENTORY</span>
                <span className="text-white/80">{agentState.inventory} units</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
