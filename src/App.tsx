import { useState, useEffect } from 'react';
import { useStore } from './store';
import { Play, Pause, StepForward, RotateCcw, BookOpen, Activity, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, BookA } from 'lucide-react';
import { cn } from './utils';
import { AgentConfigurations } from './AgentConfigurations';
import { SimulationDashboard } from './SimulationDashboard';
import { ScenarioDeck } from './ScenarioDeck';
import { QuantAcademy } from './QuantAcademy';
import { Glossary } from './Glossary';

function App() {
  const store = useStore();
  const { epoch, currentPrice, isRunning, toggleSimulation, resetSimulation } = store;
  const [activeView, setActiveView] = useState<'dashboard' | 'academy' | 'glossary'>('dashboard');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const handleStepEpoch = () => {
    useStore.getState().stepEpoch();
  };

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      intervalId = window.setInterval(handleStepEpoch, store.playbackSpeedMs);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isRunning, store.playbackSpeedMs]);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200 font-sans grid grid-rows-[auto_1fr] grid-cols-[auto_1fr_auto] h-screen overflow-hidden">
      {/* Top Header */}
      <header className="col-span-3 border-b border-white/10 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="p-1.5 -ml-2 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Agent Configurations"
          >
            {isLeftSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>

          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            QuantSim: MARL Synthetic Economy
          </h1>

          <div className="h-6 w-px bg-white/10"></div>

          {/* Toggle View */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeView === 'dashboard'
                  ? "bg-white/10 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <Activity size={16} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('academy')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeView === 'academy'
                  ? "bg-white/10 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <BookOpen size={16} />
              Quant Academy
            </button>
            <button
              onClick={() => setActiveView('glossary')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeView === 'glossary'
                  ? "bg-white/10 text-purple-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <BookA size={16} />
              Glossary
            </button>
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          {/* Metrics */}
          <div className="flex items-center gap-6 text-sm font-mono">
            <div className="flex flex-col">
              <span className="text-zinc-500 uppercase text-[10px]">Epoch</span>
              <span className="text-rose-400 font-semibold leading-tight">{epoch}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 uppercase text-[10px]">Market Price</span>
              <span className="text-emerald-400 font-semibold leading-tight">${currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Global Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetSimulation}
            className="p-2 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
            title="Reset Simulation"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleStepEpoch}
            className="p-2 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
            title="Step +1 Epoch"
            disabled={isRunning}
          >
            <StepForward size={18} />
          </button>
          <button
            onClick={toggleSimulation}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium text-sm",
              isRunning
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
            )}
          >
            {isRunning ? (
              <>
                <Pause size={18} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Play</span>
              </>
            )}
          </button>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="p-1.5 -mr-2 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Scenario Deck"
          >
            {isRightSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
        </div>
      </header>

      {/* Left Sidebar: Agent Configurations */}
      {isLeftSidebarOpen && (
        <aside className="w-80 border-r border-white/10 bg-zinc-900/30 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-zinc-900/50 shrink-0">
            <h2 className="font-semibold text-zinc-200 text-sm">Agent Configurations</h2>
            <p className="text-[10px] text-zinc-500 mt-1">Adjust mathematical heuristics</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <AgentConfigurations />
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="p-6 bg-zinc-950 overflow-y-auto w-full h-full relative scrollbar-thin">
        {activeView === 'dashboard' ? (
          <SimulationDashboard />
        ) : activeView === 'academy' ? (
          <QuantAcademy />
        ) : (
          <Glossary />
        )}
      </main>

      {/* Right Sidebar: Scenario Deck */}
      {isRightSidebarOpen && (
        <aside className="w-80 border-l border-white/10 bg-zinc-900/30 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-zinc-900/50 shrink-0">
            <h2 className="font-semibold text-zinc-200 text-sm">Scenario Deck</h2>
            <p className="text-[10px] text-zinc-500 mt-1">Trigger macro-economic events</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <ScenarioDeck />
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;