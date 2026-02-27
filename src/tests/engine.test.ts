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
        },
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0,
        marginCallThreshold: 0.2
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
        }
    };

    it('matches a simple bid and ask and updates inventory and cash', () => {
        const orders: Order[] = [
            { agentId: 'Buyer', price: 101, quantity: 10, side: 1 },
            { agentId: 'Seller', price: 99, quantity: 10, side: -1 }
        ];

        const result = processEpoch(baseSimState, baseAgents, orders);
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

    it('triggers margin call liquidation when agent cannot meet maintenance margin', () => {
        // Setup specific state for margin call scenario
        const marginCallState: SimulationState = {
            ...baseSimState,
            currentPrice: 25,
            marginCallThreshold: 0.5, // 50% maintenance margin
            borrowRate: 0 // No borrow fees to isolate margin logic
        };

        const marginAgents: Record<string, AgentState> = {
            ShortSeller: {
                cash: 100,
                inventory: -10, // Short 10 units
                avgEntry: 20, // Entered at 20 (now price is 25, so losing money)
                wealth: 100 + (-10 * 25), // -150 wealth
                params: {}
            }
        };

        // Current Price: 25
        // Borrowed Value: abs(-10) * 25 = 250
        // Maintenance Margin: 250 * 0.5 = 125
        // Cash: 100
        // Since Cash (100) < Maintenance Margin (125), liquidation should occur.

        const result = processEpoch(marginCallState, marginAgents, []);

        const liquidatedAgent = result.nextAgents['ShortSeller'];

        // 1. Inventory should be reset to 0
        expect(liquidatedAgent.inventory).toBe(0);

        // 2. Cash should be reduced by cost to cover
        // Cost to cover = 10 * 25 = 250
        // New Cash = 100 - 250 = -150
        expect(liquidatedAgent.cash).toBe(-150);

        // 3. Avg Entry should be 0
        expect(liquidatedAgent.avgEntry).toBe(0);

        // 4. Verify log entry
        const logs = result.nextSimulationState.logs;
        const currentEpochLogs = logs[0].actions;
        const marginLog = currentEpochLogs.find(log => log.action.includes('[MARGIN CALL]'));

        expect(marginLog).toBeDefined();
        expect(marginLog?.agentId).toBe('ShortSeller');
        expect(marginLog?.action).toContain('Liquidated 10 units at $25.00');
    });
});
