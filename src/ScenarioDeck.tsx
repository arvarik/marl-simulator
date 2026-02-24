import { useState } from 'react';
import { useStore } from './store';
import { AlertTriangle, Zap, Snowflake, RotateCcw, TrendingUp, TrendingDown, Percent, Layers } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Component providing macro-economic 'interventions'. 
 * Allow users to interact heavily with the simulation and observing the resulting chaos or order.
 */
export function ScenarioDeck() {
  const updateAgentParam = useStore((state) => state.updateAgentParam);
  const updateSimulationParam = useStore((state) => state.updateSimulationParam);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const triggerSystemicShock = () => {
    setActiveScenario('shock');
    updateAgentParam('Rationalist', 'intrinsicValue', 142.85);
  };

  const triggerFlashCrash = () => {
    setActiveScenario('crash');
    updateAgentParam('MeanRevertor', 'zScoreThreshold', 0.1);
    updateAgentParam('Momentum', 'lookbackWindow', 20);
  };

  const triggerLiquidityFreeze = () => {
    setActiveScenario('freeze');
    updateAgentParam('MarketMaker', 'gamma', 0.5);
  };

  const triggerRetailFOMO = () => {
    setActiveScenario('fomo');
    updateAgentParam('NoiseTrader', 'tradeProbability', 1.0);
    updateAgentParam('NoiseTrader', 'maxQuantity', 10);
    updateAgentParam('Momentum', 'lookbackWindow', 2);
    updateAgentParam('Momentum', 'threshold', 0.5);
  };

  const triggerValueTrap = () => {
    setActiveScenario('trap');
    updateAgentParam('Rationalist', 'intrinsicValue', 50);
    updateAgentParam('Prospector', 'lossAversion', 5.0);
  };

  const resetScenarios = () => {
    setActiveScenario(null);
    updateAgentParam('Rationalist', 'intrinsicValue', 100);
    updateAgentParam('MeanRevertor', 'zScoreThreshold', 1.5);
    updateAgentParam('Momentum', 'lookbackWindow', 5);
    updateAgentParam('Momentum', 'threshold', 2);
    updateAgentParam('MarketMaker', 'gamma', 0.1);
    updateAgentParam('NoiseTrader', 'tradeProbability', 1.0);
    updateAgentParam('NoiseTrader', 'maxQuantity', 3);
    updateAgentParam('Prospector', 'lossAversion', 2.25);
    updateSimulationParam('borrowRate', 0.0);
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Scenario Deck
        </h3>
        <button
          onClick={resetScenarios}
          className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400 hover:text-zinc-100 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
          title="Reset to default parameters"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
      <p className="text-[11px] text-zinc-400 leading-snug mb-2">
        Inject runtime interventions to observe how the models adapt to sudden shifts.
      </p>

      {/* Systemic Shock */}
      <div className={cn(
        "rounded-xl p-4 flex flex-col transition-all duration-300 border",
        activeScenario === 'shock'
          ? "bg-rose-500/20 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          : "bg-rose-500/5 border-rose-500/20"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400">
            <AlertTriangle size={16} />
          </div>
          <h4 className="font-semibold text-rose-100 text-sm">Systemic Shock</h4>
        </div>
        <p className="text-[11px] text-rose-200/70 mb-4 flex-1 leading-snug">
          Instantly shifts the Rationalist's Intrinsic Value up to $142.85.
        </p>
        <button
          onClick={triggerSystemicShock}
          className={cn(
            "w-full py-2 text-xs font-semibold rounded-lg border transition-colors",
            activeScenario === 'shock'
              ? "bg-rose-500 text-white border-rose-400"
              : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/50"
          )}
        >
          {activeScenario === 'shock' ? 'Active' : 'Trigger'}
        </button>
      </div>

      {/* Flash Crash */}
      <div className={cn(
        "rounded-xl p-4 flex flex-col transition-all duration-300 border",
        activeScenario === 'crash'
          ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          : "bg-amber-500/5 border-amber-500/20"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
            <Zap size={16} />
          </div>
          <h4 className="font-semibold text-amber-100 text-sm">Flash Crash</h4>
        </div>
        <p className="text-[11px] text-amber-200/70 mb-4 flex-1 leading-snug">
          Drops Mean-Revertor's Z-score threshold and maxes Momentum lookback.
        </p>
        <button
          onClick={triggerFlashCrash}
          className={cn(
            "w-full py-2 text-xs font-semibold rounded-lg border transition-colors",
            activeScenario === 'crash'
              ? "bg-amber-500 text-white border-amber-400"
              : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50"
          )}
        >
          {activeScenario === 'crash' ? 'Active' : 'Trigger'}
        </button>
      </div>

      {/* Liquidity Freeze */}
      <div className={cn(
        "rounded-xl p-4 flex flex-col transition-all duration-300 border",
        activeScenario === 'freeze'
          ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          : "bg-cyan-500/5 border-cyan-500/20"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
            <Snowflake size={16} />
          </div>
          <h4 className="font-semibold text-cyan-100 text-sm">Liquidity Freeze</h4>
        </div>
        <p className="text-[11px] text-cyan-200/70 mb-4 flex-1 leading-snug">
          Maxes Market Maker's inventory penalty (γ = 0.5), widening spreads.
        </p>
        <button
          onClick={triggerLiquidityFreeze}
          className={cn(
            "w-full py-2 text-xs font-semibold rounded-lg border transition-colors",
            activeScenario === 'freeze'
              ? "bg-cyan-500 text-white border-cyan-400"
              : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/50"
          )}
        >
          {activeScenario === 'freeze' ? 'Active' : 'Trigger'}
        </button>
      </div>

      {/* Retail FOMO */}
      <div className={cn(
        "rounded-xl p-4 flex flex-col transition-all duration-300 border",
        activeScenario === 'fomo'
          ? "bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.3)]"
          : "bg-pink-500/5 border-pink-500/20"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-pink-500/20 rounded-lg text-pink-400">
            <TrendingUp size={16} />
          </div>
          <h4 className="font-semibold text-pink-100 text-sm">Retail FOMO</h4>
        </div>
        <p className="text-[11px] text-pink-200/70 mb-4 flex-1 leading-snug">
          Maxes out Noise Trader flow and makes Momentum hyper-reactive to trends.
        </p>
        <button
          onClick={triggerRetailFOMO}
          className={cn(
            "w-full py-2 text-xs font-semibold rounded-lg border transition-colors",
            activeScenario === 'fomo'
              ? "bg-pink-500 text-white border-pink-400"
              : "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border-pink-500/50"
          )}
        >
          {activeScenario === 'fomo' ? 'Active' : 'Trigger'}
        </button>
      </div>

      {/* Fundamental Collapse */}
      <div className={cn(
        "rounded-xl p-4 flex flex-col transition-all duration-300 border",
        activeScenario === 'trap'
          ? "bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          : "bg-purple-500/5 border-purple-500/20"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
            <TrendingDown size={16} />
          </div>
          <h4 className="font-semibold text-purple-100 text-sm">Fundamental Collapse</h4>
        </div>
        <p className="text-[11px] text-purple-200/70 mb-4 flex-1 leading-snug">
          Rationalist value plummets to $50. Prospector refuses to sell (Loss Aversion = 5.0).
        </p>
        <button
          onClick={triggerValueTrap}
          className={cn(
            "w-full py-2 text-xs font-semibold rounded-lg border transition-colors",
            activeScenario === 'trap'
              ? "bg-purple-500 text-white border-purple-400"
              : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/50"
          )}
        >
          {activeScenario === 'trap' ? 'Active' : 'Trigger'}
        </button>
      </div>

      {/* Global Interest Rate Slider */}
      <div className="rounded-xl p-4 flex flex-col border border-white/10 bg-zinc-900/40 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400">
            <Percent size={16} />
          </div>
          <h4 className="font-semibold text-zinc-200 text-sm">Borrow Rate (Interest)</h4>
        </div>
        <p className="text-[11px] text-zinc-400 mb-4 flex-1 leading-snug">
          Cost of short selling per epoch. Higher rates force short squeezes faster.
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-white/80 font-mono">
            <span>Rate per Epoch</span>
            {/* Displaying value as a percentage. The store holds it as a decimal (e.g. 0.001 is 0.1%) */}
            <span className="bg-black/30 px-1 py-0.5 rounded">
              {(useStore((state) => state.borrowRate) * 100).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={useStore((state) => state.borrowRate) * 100}
            onChange={(e) => {
              const percentage = parseFloat(e.target.value);
              // Convert back to decimal for the store
              useStore.getState().updateSimulationParam('borrowRate', percentage / 100);
            }}
            className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
