import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Store: updateSimulationParam', () => {
  beforeEach(() => {
    useStore.getState().resetSimulation();
  });

  it('updates a numeric simulation parameter correctly', () => {
    // Initial state check
    expect(useStore.getState().borrowRate).toBe(0.0);

    // Update parameter
    useStore.getState().updateSimulationParam('borrowRate', 0.05);

    // Verify update
    expect(useStore.getState().borrowRate).toBe(0.05);
  });

  it('updates another numeric simulation parameter correctly', () => {
    // Initial state check
    expect(useStore.getState().playbackSpeedMs).toBe(1000);

    // Update parameter
    useStore.getState().updateSimulationParam('playbackSpeedMs', 500);

    // Verify update
    expect(useStore.getState().playbackSpeedMs).toBe(500);
  });
});
