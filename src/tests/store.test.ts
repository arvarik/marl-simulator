import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Store Actions', () => {
  beforeEach(() => {
    useStore.getState().resetSimulation();
  });

  it('updateAgentParam updates a specific parameter for an agent', () => {
    const agentId = 'Prospector';
    const paramName = 'lossAversion';
    const newValue = 5.0;

    // Verify initial state
    const initialValue = useStore.getState().agents[agentId].params[paramName];
    expect(initialValue).not.toBe(newValue);

    // Action
    useStore.getState().updateAgentParam(agentId, paramName, newValue);

    // Assertion
    const updatedValue = useStore.getState().agents[agentId].params[paramName];
    expect(updatedValue).toBe(newValue);
  });

  it('updateAgentParam does not affect other parameters of the same agent', () => {
    const agentId = 'Prospector';
    const targetParam = 'lossAversion';
    const otherParam = 'gainSensitivity';
    const newValue = 5.0;

    const initialOtherValue = useStore.getState().agents[agentId].params[otherParam];

    // Action
    useStore.getState().updateAgentParam(agentId, targetParam, newValue);

    // Assertion
    const currentOtherValue = useStore.getState().agents[agentId].params[otherParam];
    expect(currentOtherValue).toBe(initialOtherValue);
  });

  it('updateAgentParam does not affect other agents', () => {
    const targetAgentId = 'Prospector';
    const otherAgentId = 'Rationalist';
    const paramName = 'lossAversion';

    // Rationalist has 'intrinsicValue'
    const otherAgentParam = 'intrinsicValue';

    const initialOtherAgentParamValue = useStore.getState().agents[otherAgentId].params[otherAgentParam];

    // Action
    useStore.getState().updateAgentParam(targetAgentId, paramName, 5.0);

    // Assertion
    const currentOtherAgentParamValue = useStore.getState().agents[otherAgentId].params[otherAgentParam];
    expect(currentOtherAgentParamValue).toBe(initialOtherAgentParamValue);
  });

  it('resetSimulation resets agent parameters to initial state', () => {
    const agentId = 'Prospector';
    const paramName = 'lossAversion';
    const newValue = 99.9;

    const initialValue = useStore.getState().agents[agentId].params[paramName];

    // Modify state
    useStore.getState().updateAgentParam(agentId, paramName, newValue);
    expect(useStore.getState().agents[agentId].params[paramName]).toBe(newValue);

    // Action
    useStore.getState().resetSimulation();

    // Assertion
    const resetValue = useStore.getState().agents[agentId].params[paramName];
    expect(resetValue).toBe(initialValue);
  });
});
