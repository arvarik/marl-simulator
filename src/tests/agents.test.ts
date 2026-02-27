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

describe('NoiseTrader Agent Strategy', () => {
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
        params: {
            tradeProbability: 1.0,
            maxQuantity: 5,
            buyThreshold: 0.5,
            minSlippage: 0.01,
            slippageWidth: 0.02
        }
    };

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does not trade if random value > tradeProbability', () => {
        // First random call checks probability. If > tradeProbability, returns [].
        // tradeProbability is 1.0 in state, so let's modify state to 0.5 and mock random to 0.6
        const state = { ...noiseTraderState, params: { ...noiseTraderState.params, tradeProbability: 0.5 } };

        vi.spyOn(Math, 'random').mockReturnValue(0.6);

        const orders = getNoiseTraderOrders(baseSimState, state);
        expect(orders).toHaveLength(0);
    });

    it('places a buy order when random indicates buy', () => {
        // tradeProbability = 1.0, so first check passes.
        // Second random call: isBuy. > buyThreshold (0.5) is Buy.
        // Third random call: slippage = (random * slippageWidth) + minSlippage
        // Fourth random call: quantity = floor(random * maxQuantity) + 1

        const randomSpy = vi.spyOn(Math, 'random');

        // Sequence of return values:
        // 1. 0.1 (check tradeProbability, 0.1 < 1.0 -> continue)
        // 2. 0.6 (isBuy check, 0.6 > 0.5 -> Buy)
        // 3. 0.5 (slippage calc, (0.5 * 0.02) + 0.01 = 0.02)
        // 4. 0.5 (qty calc, floor(0.5 * 5) + 1 = 3)
        randomSpy.mockReturnValueOnce(0.1)
                 .mockReturnValueOnce(0.6)
                 .mockReturnValueOnce(0.5)
                 .mockReturnValueOnce(0.5);

        const orders = getNoiseTraderOrders(baseSimState, noiseTraderState);

        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(1); // Buy
        // Buy price = currentPrice * (1 + slippage) = 100 * (1.02) = 102
        expect(orders[0].price).toBeCloseTo(102);
        expect(orders[0].quantity).toBe(3);
    });

    it('places a sell order when random indicates sell', () => {
        // tradeProbability = 1.0, so first check passes.
        // Second random call: isBuy. <= buyThreshold (0.5) is Sell.

        const randomSpy = vi.spyOn(Math, 'random');

        // Sequence:
        // 1. 0.1 (prob check)
        // 2. 0.4 (isBuy check, 0.4 <= 0.5 -> Sell)
        // 3. 0.5 (slippage calc, (0.5 * 0.02) + 0.01 = 0.02)
        // 4. 0.5 (qty calc)
        randomSpy.mockReturnValueOnce(0.1)
                 .mockReturnValueOnce(0.4)
                 .mockReturnValueOnce(0.5)
                 .mockReturnValueOnce(0.5);

        const orders = getNoiseTraderOrders(baseSimState, noiseTraderState);

        expect(orders).toHaveLength(1);
        expect(orders[0].side).toBe(-1); // Sell
        // Sell price = currentPrice * (1 - slippage) = 100 * (0.98) = 98
        expect(orders[0].price).toBeCloseTo(98);
    });

    it('uses custom slippage parameters correctly', () => {
        const customState = {
            ...noiseTraderState,
            params: {
                ...noiseTraderState.params,
                minSlippage: 0.05,
                slippageWidth: 0.10
            }
        };

        const randomSpy = vi.spyOn(Math, 'random');

        // Sequence:
        // 1. 0.1 (prob check)
        // 2. 0.6 (isBuy -> Buy)
        // 3. 0.5 (slippage calc: (0.5 * 0.10) + 0.05 = 0.10)
        // 4. 0.5 (qty calc)
        randomSpy.mockReturnValueOnce(0.1)
                 .mockReturnValueOnce(0.6)
                 .mockReturnValueOnce(0.5)
                 .mockReturnValueOnce(0.5);

        const orders = getNoiseTraderOrders(baseSimState, customState);

        expect(orders).toHaveLength(1);
        // Price should reflect 10% slippage: 100 * 1.10 = 110
        expect(orders[0].price).toBeCloseTo(110);
    });
});
