import { getMeanRevertorOrders } from '../agents';
import type { AgentState, SimulationState } from '../types';

// Setup Mock Simulation State
const historyLength = 100000;
const history = new Array(historyLength).fill(0).map((_, i) => 100 + Math.sin(i / 100) * 10);
const marketState: SimulationState = {
    epoch: 0,
    currentPrice: history[historyLength - 1],
    history: history,
    wealthHistory: {},
    logs: [],
    isRunning: true,
    playbackSpeedMs: 1000,
    borrowRate: 0,
    marginCallThreshold: 0
};

// Setup Mock Agent State
const agentState: AgentState = {
    cash: 10000,
    inventory: 0,
    avgEntry: 0,
    wealth: 10000,
    params: {
        smaWindow: 50000,
        zScoreThreshold: 2
    }
};

// Warmup
for (let i = 0; i < 100; i++) {
    getMeanRevertorOrders(marketState, agentState);
}

// Benchmark
const iterations = 5000;
const start = performance.now();

for (let i = 0; i < iterations; i++) {
    getMeanRevertorOrders(marketState, agentState);
}

const end = performance.now();
const duration = end - start;

console.log(`Execution time: ${duration.toFixed(2)}ms`);
console.log(`Average time per call: ${(duration / iterations).toFixed(4)}ms`);
