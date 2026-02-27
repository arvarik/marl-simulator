import { describe, it, expect } from 'vitest';
import { createOrder, getProspectorOrders, getRationalistOrders, getMeanRevertorOrders } from '../agents';
import type { SimulationState, AgentState } from '../types';

describe('createOrder utility', () => {
    it('creates a proper Order object', () => {
        const order = createOrder('TestAgent', 1, 100, 10);
        expect(order).toEqual({
            agentId: 'TestAgent',
            side: 1,
            price: 100,
            quantity: 10
        });
    });
});

describe('Rationalist Agent Strategy', () => {
    const baseSimState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100],
        wealthHistory: {},
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0,
        marginCallThreshold: 0
    };

    const rationalistState: AgentState = {
        cash: 10000,
        inventory: 0,
        avgEntry: 0,
        wealth: 10000,
        params: { intrinsicValue: 100 }
    };

    it('buys when price is below intrinsic value', () => {
        const state = { ...baseSimState, currentPrice: 90 };
        const orders = getRationalistOrders(state, rationalistState);
        expect(orders).toHaveLength(1);
        expect(orders[0]).toEqual({ agentId: 'Rationalist', side: 1, price: 100, quantity: 1 });
    });

    it('sells when price is above intrinsic value', () => {
        const state = { ...baseSimState, currentPrice: 110 };
        const orders = getRationalistOrders(state, rationalistState);
        expect(orders).toHaveLength(1);
        expect(orders[0]).toEqual({ agentId: 'Rationalist', side: -1, price: 100, quantity: 1 });
    });

    it('does nothing when price equals intrinsic value', () => {
        const state = { ...baseSimState, currentPrice: 100 };
        const orders = getRationalistOrders(state, rationalistState);
        expect(orders).toHaveLength(0);
    });
});

describe('Prospector Agent Strategy (Kahneman-Tversky)', () => {
    const baseSimState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100],
        wealthHistory: {},
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0,
        marginCallThreshold: 0
    };

    it('risk-seeking in losses: averages down when long and PnL is negative', () => {
        const prospectorState: AgentState = {
            cash: 5000,
            inventory: 50,
            avgEntry: 110, // bought at 110, current price is 100 -> underwater
            wealth: 10000,
            params: { lossAversion: 2.0, gainSensitivity: 1.0 }
        };

        // PnL = (100 - 110) * 50 = -500. Prospector should try to buy.
        const orders = getProspectorOrders(baseSimState, prospectorState);
        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(1); // Bid
        expect(orders[0].price).toBeLessThan(100); // Bids below current price
    });

    it('risk-averse in gains: sells to lock in small profit when long and PnL is positive', () => {
        const prospectorState: AgentState = {
            cash: 5000,
            inventory: 50,
            avgEntry: 90, // bought at 90, current price is 100 -> in profit
            wealth: 10000,
            params: { lossAversion: 2.0, gainSensitivity: 1.0 }
        };

        // PnL = (100 - 90) * 50 = +500. Prospector should try to sell.
        const orders = getProspectorOrders(baseSimState, prospectorState);
        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(-1); // Ask
        expect(orders[0].price).toBeGreaterThan(100); // Asks above current price
    });
});

describe('Mean Revertor Agent Strategy', () => {
    const baseSimState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100, 100, 100, 100, 100], // Stable history
        wealthHistory: {},
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0,
        marginCallThreshold: 0
    };

    const meanRevertorState: AgentState = {
        cash: 10000,
        inventory: 0,
        avgEntry: 0,
        wealth: 10000,
        params: { smaWindow: 5, zScoreThreshold: 2.0 }
    };

    it('buys when price is significantly below the mean (low Z-score)', () => {
        // history [100, 100, 100, 100, 100] -> mean = 100, stdDev = 1 (fallback)
        // currentPrice = 97 -> zScore = (97 - 100) / 1 = -3.0
        // -3.0 < -zScoreThreshold (-2.0) -> Buy
        const state = { ...baseSimState, currentPrice: 97 };
        const orders = getMeanRevertorOrders(state, meanRevertorState);
        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(1); // Buy
    });

    it('sells when price is significantly above the mean (high Z-score)', () => {
        // history [100, 100, 100, 100, 100] -> mean = 100, stdDev = 1 (fallback)
        // currentPrice = 103 -> zScore = (103 - 100) / 1 = 3.0
        // 3.0 > zScoreThreshold (2.0) -> Sell
        const state = { ...baseSimState, currentPrice: 103 };
        const orders = getMeanRevertorOrders(state, meanRevertorState);
        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(-1); // Sell
    });

    it('does nothing when Z-score is within threshold', () => {
        // zScore = (101 - 100) / 1 = 1.0
        // 1.0 < 2.0 -> No action
        const state = { ...baseSimState, currentPrice: 101 };
        const orders = getMeanRevertorOrders(state, meanRevertorState);
        expect(orders).toHaveLength(0);
    });
});
