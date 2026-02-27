import { describe, it, expect } from 'vitest';
import { processEpoch } from '../engine';
import type { SimulationState, AgentState, Order } from '../types';

describe('processEpoch Matching Engine', () => {
    const baseSimState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100],
        wealthHistory: {
            Buyer: [10000],
            Seller: [10000],
            ShortSeller: [10000]
        },
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0.05, // 5% borrow rate for testing
        marginCallThreshold: 0.5 // 50% maintenance margin
    };

    const baseAgents: Record<string, AgentState> = {
        Buyer: {
            cash: 10000,
            inventory: 0,
            avgEntry: 0,
            wealth: 10000,
            params: {}
        },
        Seller: {
            cash: 10000,
            inventory: 0,
            avgEntry: 0,
            wealth: 10000,
            params: {}
        },
        ShortSeller: {
            cash: 1000,
            inventory: -10, // Short 10 units
            avgEntry: 100,
            wealth: 0, // Calculated below
            params: {}
        }
    };

    it('matches a simple bid and ask and updates inventory and cash', () => {
        const orders: Order[] = [
            { agentId: 'Buyer', price: 101, quantity: 10, side: 1 },
            { agentId: 'Seller', price: 99, quantity: 10, side: -1 }
        ];

        // Reset borrow rate for this test to match original behavior
        const state = { ...baseSimState, borrowRate: 0 };
        const result = processEpoch(state, baseAgents, orders);
        const clearingPrice = 100; // Midpoint of 101 and 99

        expect(result.nextSimulationState.currentPrice).toBe(clearingPrice);

        // Buyer should have spent 10 * 100 = 1000 cash, gained 10 inventory
        expect(result.nextAgents['Buyer'].cash).toBe(9000);
        expect(result.nextAgents['Buyer'].inventory).toBe(10);
        expect(result.nextAgents['Buyer'].avgEntry).toBe(100);

        // Seller should have gained 10 * 100 = 1000 cash, lost 10 inventory
        expect(result.nextAgents['Seller'].cash).toBe(11000);
        expect(result.nextAgents['Seller'].inventory).toBe(-10);
        expect(result.nextAgents['Seller'].avgEntry).toBe(100);
    });

    it('applies borrow fees to short positions', () => {
        const agents = { ...baseAgents };
        // ShortSeller has -10 inventory. Current price is 100.
        // Borrowed Value = 10 * 100 = 1000.
        // Borrow Rate = 0.05.
        // Interest Fee = 1000 * 0.05 = 50.

        const result = processEpoch(baseSimState, agents, []);

        expect(result.nextAgents['ShortSeller'].cash).toBe(1000 - 50);
        expect(result.nextAgents['ShortSeller'].inventory).toBe(-10);
    });

    it('executes margin call when cash falls below maintenance margin', () => {
        // Setup: ShortSeller is short 10 units at price 100.
        // Cash: 400.
        // Margin Call Threshold: 0.5 (50%).
        // Borrow Rate: 0 (simplify).

        const state = { ...baseSimState, borrowRate: 0, marginCallThreshold: 0.5 };
        const agents: Record<string, AgentState> = {
            ShortSeller: {
                cash: 400,
                inventory: -10,
                avgEntry: 100,
                wealth: 400 + (-10 * 100), // -600 (not relevant for trigger, just state)
                params: {}
            }
        };

        // Current Price: 100.
        // Borrowed Value: 10 * 100 = 1000.
        // Required Maintenance Margin: 1000 * 0.5 = 500.
        // Current Cash: 400.
        // 400 < 500 -> Margin Call Triggered.

        // Liquidation:
        // Buy back 10 units at 100. Cost: 1000.
        // Cash: 400 - 1000 = -600.
        // Inventory: 0.

        const result = processEpoch(state, agents, []);

        expect(result.nextAgents['ShortSeller'].inventory).toBe(0);
        expect(result.nextAgents['ShortSeller'].cash).toBe(-600);

        // Check logs for margin call
        const logs = result.nextSimulationState.logs[0].actions;
        const marginCallLog = logs.find(l => l.action.includes('[MARGIN CALL]'));
        expect(marginCallLog).toBeDefined();
        expect(marginCallLog?.agentId).toBe('ShortSeller');
    });
});
