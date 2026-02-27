import { describe, it, expect, vi, afterEach } from 'vitest';
import { createOrder, getProspectorOrders, getRationalistOrders, getNoiseTraderOrders } from '../agents';
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

describe('Noise Trader Agent Strategy', () => {
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

    const noiseTraderState: AgentState = {
        cash: 10000,
        inventory: 0,
        avgEntry: 0,
        wealth: 10000,
        params: { tradeProbability: 0.5, maxQuantity: 10 }
    };

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns no orders when random value exceeds trade probability', () => {
        // Mock random to be > 0.5
        vi.spyOn(Math, 'random').mockReturnValue(0.6);

        const orders = getNoiseTraderOrders(baseSimState, noiseTraderState);
        expect(orders).toHaveLength(0);
    });

    it('places a buy order correctly', () => {
        const randomSpy = vi.spyOn(Math, 'random');
        // Sequence of random calls:
        // 1. tradeProbability check: 0.1 ( < 0.5, so it trades)
        // 2. isBuy check: 0.6 ( > 0.5, so Buy)
        // 3. slippage: 0.5 => result = 0.5 * 0.02 + 0.01 = 0.02 (2% slippage)
        // 4. quantity: 0.8 => floor(0.8 * 10) + 1 = 9
        randomSpy
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.6)
            .mockReturnValueOnce(0.5)
            .mockReturnValueOnce(0.8);

        const orders = getNoiseTraderOrders(baseSimState, noiseTraderState);
        expect(orders).toHaveLength(1);

        const order = orders[0];
        expect(order.side).toBe(1); // Buy
        // Price should be currentPrice * (1 + slippage) = 100 * 1.02 = 102
        expect(order.price).toBeCloseTo(102);
        expect(order.quantity).toBe(9);
        expect(order.agentId).toBe('NoiseTrader');
    });

    it('places a sell order correctly', () => {
        const randomSpy = vi.spyOn(Math, 'random');
        // Sequence of random calls:
        // 1. tradeProbability check: 0.1 ( < 0.5, so it trades)
        // 2. isBuy check: 0.4 ( <= 0.5, so Sell)
        // 3. slippage: 0.0 => result = 0.0 * 0.02 + 0.01 = 0.01 (1% slippage)
        // 4. quantity: 0.0 => floor(0.0 * 10) + 1 = 1
        randomSpy
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.4)
            .mockReturnValueOnce(0.0)
            .mockReturnValueOnce(0.0);

        const orders = getNoiseTraderOrders(baseSimState, noiseTraderState);
        expect(orders).toHaveLength(1);

        const order = orders[0];
        expect(order.side).toBe(-1); // Sell
        // Price should be currentPrice * (1 - slippage) = 100 * 0.99 = 99
        expect(order.price).toBeCloseTo(99);
        expect(order.quantity).toBe(1);
        expect(order.agentId).toBe('NoiseTrader');
    });
});
