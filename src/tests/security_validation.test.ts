import { describe, it, expect } from 'vitest';
import { processEpoch } from '../engine';
import type { SimulationState, AgentState, Order } from '../types';

describe('Security Validation: processEpoch', () => {
    const baseSimState: SimulationState = {
        epoch: 0,
        currentPrice: 100,
        history: [100],
        wealthHistory: {
            Attacker: [10000],
            Victim: [10000],
        },
        logs: [],
        isRunning: true,
        playbackSpeedMs: 1000,
        borrowRate: 0,
        marginCallThreshold: 0.2
    };

    const baseAgents: Record<string, AgentState> = {
        Attacker: {
            cash: 10000,
            inventory: 0,
            avgEntry: 0,
            wealth: 10000,
            params: {}
        },
        Victim: {
            cash: 10000,
            inventory: 0,
            avgEntry: 0,
            wealth: 10000,
            params: {}
        }
    };

    it('should ignore bids with negative quantity', () => {
        const orders: Order[] = [
            { agentId: 'Attacker', price: 101, quantity: -10, side: 1 }, // Malicious Bid
            { agentId: 'Victim', price: 99, quantity: 10, side: -1 }     // Normal Ask
        ];

        const result = processEpoch(baseSimState, baseAgents, orders);

        // Expectation: No trade should happen because the bid is invalid.
        // If ignored, Victim's cash remains 10000.
        expect(result.nextAgents['Victim'].cash).toBe(10000);
        expect(result.nextAgents['Victim'].inventory).toBe(0);

        // Attacker should also be unchanged
        expect(result.nextAgents['Attacker'].cash).toBe(10000);
        expect(result.nextAgents['Attacker'].inventory).toBe(0);

        // Logs should not contain the malicious order
        const logActions = result.nextSimulationState.logs[0]?.actions.map(a => a.action) || [];
        const maliciousLog = logActions.find(a => a.includes('Placed Bid') && a.includes('-10'));
        expect(maliciousLog).toBeUndefined();
    });

    it('should ignore asks with zero quantity', () => {
        const orders: Order[] = [
            { agentId: 'Attacker', price: 101, quantity: 10, side: 1 }, // Normal Bid
            { agentId: 'Victim', price: 99, quantity: 0, side: -1 }     // Invalid Ask
        ];

        const result = processEpoch(baseSimState, baseAgents, orders);

        expect(result.nextAgents['Attacker'].cash).toBe(10000);
        expect(result.nextAgents['Attacker'].inventory).toBe(0);
    });
});
