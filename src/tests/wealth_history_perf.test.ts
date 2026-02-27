import { describe, it, expect } from 'vitest';
import { processEpoch } from '../engine';
import type { SimulationState, AgentState, Order } from '../types';

describe('Performance Benchmark: processEpoch Wealth History', () => {
    const NUM_AGENTS = 100;
    const NUM_EPOCHS = 2000;

    const baseAgents: Record<string, AgentState> = {};
    const wealthHistory: Record<string, number[]> = {};

    for (let i = 0; i < NUM_AGENTS; i++) {
        const id = `Agent_${i}`;
        baseAgents[id] = {
            cash: 10000,
            inventory: 0,
            avgEntry: 0,
            wealth: 10000,
            params: {}
        };
        wealthHistory[id] = [10000];
    }

    const currentState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100],
        wealthHistory: wealthHistory,
        logs: [],
        isRunning: true,
        playbackSpeedMs: 0,
        borrowRate: 0,
        marginCallThreshold: 0.2
    };

    it(`should complete ${NUM_EPOCHS} epochs with ${NUM_AGENTS} agents efficiently`, () => {
        const startTime = performance.now();

        let state = currentState;
        let currentAgents = baseAgents;

        for (let i = 0; i < NUM_EPOCHS; i++) {
            // Minimal orders to ensure processEpoch runs, but focus is on state update overhead
            const orders: Order[] = [];
            const result = processEpoch(state, currentAgents, orders);

            // Update state for next iteration
            state = {
                ...result.nextSimulationState,
                isRunning: true,
                playbackSpeedMs: 0,
                borrowRate: 0,
                marginCallThreshold: 0.2
            };
            currentAgents = result.nextAgents;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log(`\nBenchmark Result:\n${NUM_EPOCHS} epochs with ${NUM_AGENTS} agents took ${duration.toFixed(2)}ms`);

        // Basic assertion to ensure it ran
        expect(state.epoch).toBe(NUM_EPOCHS);
    });
});
