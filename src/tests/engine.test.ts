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
});
