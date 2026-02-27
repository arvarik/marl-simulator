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

    it('deducts borrowing costs for agents with negative inventory', () => {
        const simState: SimulationState = {
            ...baseSimState,
            borrowRate: 0.1, // 10% borrow rate
            currentPrice: 100
        };

        const agents: Record<string, AgentState> = {
            ShortSeller: {
                cash: 1000,
                inventory: -10,
                avgEntry: 100,
                wealth: 0, // Recalculated by engine
                params: {}
            },
            LongBuyer: {
                cash: 1000,
                inventory: 10,
                avgEntry: 100,
                wealth: 2000,
                params: {}
            }
        };

        // Process epoch with no orders to isolate borrowing cost
        const result = processEpoch(simState, agents, []);

        // ShortSeller:
        // Borrowed value = abs(-10) * 100 = 1000
        // Interest fee = 1000 * 0.1 = 100
        // Expected cash = 1000 - 100 = 900
        expect(result.nextAgents['ShortSeller'].cash).toBe(900);

        // LongBuyer:
        // No negative inventory, so no interest fee.
        // Expected cash = 1000
        expect(result.nextAgents['LongBuyer'].cash).toBe(1000);
    });
});
