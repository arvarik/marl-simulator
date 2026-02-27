import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Store Actions', () => {
    beforeEach(() => {
        useStore.getState().resetSimulation();
    });

    it('stepEpoch advances the simulation epoch and generates orders internally', () => {
        const initialEpoch = useStore.getState().epoch;

        // Calling stepEpoch without arguments
        // We expect this to internally call getAllAgentOrders and processEpoch
        useStore.getState().stepEpoch();

        const newEpoch = useStore.getState().epoch;
        expect(newEpoch).toBe(initialEpoch + 1);

        // We can also check if history was updated, which implies processEpoch ran
        const history = useStore.getState().history;
        expect(history.length).toBeGreaterThan(1);
    });
});
