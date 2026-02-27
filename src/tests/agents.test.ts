import { describe, it, expect } from 'vitest';
import { createOrder, getProspectorOrders, getRationalistOrders, getMomentumOrders } from '../agents';
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

describe('Momentum Agent Strategy', () => {
    const baseSimState: SimulationState = {
        epoch: 10,
        currentPrice: 100,
        history: [100, 101, 102, 103, 104, 105, 100], // Example history
        wealthHistory: {},
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0,
        marginCallThreshold: 0
    };

    const momentumState: AgentState = {
        cash: 10000,
        inventory: 0,
        avgEntry: 0,
        wealth: 10000,
        params: { lookbackWindow: 5, threshold: 2 }
    };

    it('buys when price momentum is positive and exceeds threshold', () => {
        // history length is 7. lookbackWindow is 5.
        // k = min(5, 6) = 5.
        // pastPrice index = 7 - 1 - 5 = 1.
        // history[1] = 100 (if history is [90, 100, ...])

        // Let's construct a specific state for clarity
        // We want pastPrice (index 0 for lookback 5) to be 100.
        // currentPrice 110.
        // derivative = 110 - 100 = 10 > threshold 2.

        const state = {
            ...baseSimState,
            currentPrice: 110,
            history: [100, 100, 100, 100, 100, 100] // history length 6. index 5 is last element.
        };
        // k = min(5, 5) = 5.
        // pastPrice = history[6 - 1 - 5] = history[0] = 100.

        const orders = getMomentumOrders(state, momentumState);
        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(1); // Buy
        expect(orders[0].price).toBeGreaterThan(110); // Aggressive buy
    });

    it('sells when price momentum is negative and exceeds threshold', () => {
        // currentPrice 90. pastPrice 100. derivative = -10 < -2.
        const state = {
            ...baseSimState,
            currentPrice: 90,
            history: [100, 100, 100, 100, 100, 100]
        };

        const orders = getMomentumOrders(state, momentumState);
        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(-1); // Sell
        expect(orders[0].price).toBeLessThan(90); // Aggressive sell
    });

    it('holds when price momentum is within threshold', () => {
        // currentPrice 101. pastPrice 100. derivative = 1. Not > 2.
        const state = {
            ...baseSimState,
            currentPrice: 101,
            history: [100, 100, 100, 100, 100, 100]
        };

        const orders = getMomentumOrders(state, momentumState);
        expect(orders).toHaveLength(0);
    });

    it('does nothing if history is insufficient', () => {
        const state = {
            ...baseSimState,
            currentPrice: 100,
            history: [100] // Length 1
        };
        // lookbackWindow 5.
        // k = min(5, 0) = 0.
        // Should return [].

        const orders = getMomentumOrders(state, momentumState);
        expect(orders).toHaveLength(0);
    });
});
