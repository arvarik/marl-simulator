import { describe, it, expect } from 'vitest';
import { createOrder, getProspectorOrders, getRationalistOrders, getMarketMakerOrders } from '../agents';
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

describe('Market Maker Strategy', () => {
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

    const marketMakerState: AgentState = {
        cash: 10000,
        inventory: 0,
        avgEntry: 0,
        wealth: 10000,
        params: { gamma: 0.1, spreadWidth: 2 } // gamma controls inventory skew, spreadWidth controls bid-ask spread
    };

    it('neutral inventory: centers quotes around current price', () => {
        const orders = getMarketMakerOrders(baseSimState, marketMakerState);
        expect(orders).toHaveLength(2);

        // Reservation price = 100 - (0.1 * 0) = 100
        // Bid = 100 - (2/2) = 99
        // Ask = 100 + (2/2) = 101

        const bid = orders.find(o => o.side === 1);
        const ask = orders.find(o => o.side === -1);

        expect(bid?.price).toBe(99);
        expect(ask?.price).toBe(101);
    });

    it('positive inventory: skews quotes lower to encourage selling', () => {
        const state = { ...marketMakerState, inventory: 10 };
        // Reservation price = 100 - (0.1 * 10) = 99
        // Bid = 99 - 1 = 98
        // Ask = 99 + 1 = 100

        const orders = getMarketMakerOrders(baseSimState, state);
        const bid = orders.find(o => o.side === 1);
        const ask = orders.find(o => o.side === -1);

        expect(bid?.price).toBe(98);
        expect(ask?.price).toBe(100);
    });

    it('negative inventory: skews quotes higher to encourage buying', () => {
        const state = { ...marketMakerState, inventory: -10 };
        // Reservation price = 100 - (0.1 * -10) = 101
        // Bid = 101 - 1 = 100
        // Ask = 101 + 1 = 102

        const orders = getMarketMakerOrders(baseSimState, state);
        const bid = orders.find(o => o.side === 1);
        const ask = orders.find(o => o.side === -1);

        expect(bid?.price).toBe(100);
        expect(ask?.price).toBe(102);
    });

    it('returns correct order structure', () => {
        const orders = getMarketMakerOrders(baseSimState, marketMakerState);
        expect(orders).toHaveLength(2);
        orders.forEach(order => {
            expect(order.agentId).toBe('MarketMaker');
            expect(order.quantity).toBe(5);
        });
        expect(orders.some(o => o.side === 1)).toBe(true);
        expect(orders.some(o => o.side === -1)).toBe(true);
    });
});
