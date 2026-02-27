import { describe, it, expect } from 'vitest';
import { processEpoch } from '../engine';
import type { SimulationState, AgentState } from '../types';

describe('Margin Call Logic', () => {
    const baseSimState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100],
        wealthHistory: {
            ShortSeller: [10000],
        },
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0.01, // 1% borrow rate
        marginCallThreshold: 0.5 // 50% maintenance margin
    };

    it('triggers a margin call when cash is below maintenance margin', () => {
        const shortSeller: AgentState = {
            cash: 4000,
            inventory: -100, // Short 100 shares
            avgEntry: 100,
            wealth: 4000 - (100 * 100), // -6000 (net wealth is negative here, but margin check is based on cash vs borrowed value)
            params: {}
        };

        // Current price = 100
        // Borrowed Value = 100 * 100 = 10000
        // Maintenance Margin = 10000 * 0.5 = 5000
        // Cash = 4000
        // 4000 < 5000 -> Should liquidate

        const currentAgents = { ShortSeller: shortSeller };
        const result = processEpoch(baseSimState, currentAgents, []);

        const updatedAgent = result.nextAgents['ShortSeller'];

        // Should be liquidated
        expect(updatedAgent.inventory).toBe(0);
        expect(updatedAgent.avgEntry).toBe(0);

        // Cash should be reduced by cost to cover: 100 shares * $100 = $10000
        // Initial Cash: 4000
        // Interest: 10000 * 0.01 = 100
        // Cash after interest: 3900
        // Cost to cover: 10000
        // Final Cash: 3900 - 10000 = -6100
        expect(updatedAgent.cash).toBe(-6100);

        // Check logs
        const logs = result.nextSimulationState.logs[0].actions;
        const liquidationLog = logs.find(l => l.action.includes('Liquidated'));
        expect(liquidationLog).toBeDefined();
        expect(liquidationLog?.action).toContain('Liquidated 100 units');
    });

    it('does not trigger margin call when cash is sufficient', () => {
        const shortSeller: AgentState = {
            cash: 6000,
            inventory: -100,
            avgEntry: 100,
            wealth: -4000,
            params: {}
        };

        // Borrowed Value = 10000
        // Maintenance Margin = 5000
        // Cash = 6000
        // 6000 > 5000 -> Safe

        const currentAgents = { ShortSeller: shortSeller };
        const result = processEpoch(baseSimState, currentAgents, []);

        const updatedAgent = result.nextAgents['ShortSeller'];

        expect(updatedAgent.inventory).toBe(-100);
        // Cash should only decrease by interest
        // Interest: 10000 * 0.01 = 100
        expect(updatedAgent.cash).toBe(5900);
    });
});
