import { create } from 'zustand';
import type { AgentState, SimulationState, Order } from './types';
import { processEpoch } from './engine';

/**
 * The unified global state, combining simulation properties, agent states, and state-mutating actions.
 */
interface GlobalState extends SimulationState {
  /** Record of all agents interacting in the simulation. */
  agents: Record<string, AgentState>;

  // Actions
  /** Toggles the running state of the automated simulation loop. */
  toggleSimulation: () => void;
  /** Updates a specific parameter of the simulation state. */
  updateSimulationParam: (paramName: keyof SimulationState, value: number) => void;
  /** Advances the simulation by one epoch, processing the given orders. */
  stepEpoch: (orders: Order[]) => void;
  /** Resets the simulation and all agents to their initial state. */
  resetSimulation: () => void;
  /** Sets the playback speed delay in milliseconds. */
  setPlaybackSpeed: (speed: number) => void;
  /** Updates a dynamic behavioral parameter for a specific agent. */
  updateAgentParam: (agentId: string, paramName: string, value: number) => void;
}

/**
 * Default starting states for the various agent archetypes.
 */
const initialAgents: Record<string, AgentState> = {
  Prospector: { cash: 10000, inventory: 0, avgEntry: 0, wealth: 10000, params: { lossAversion: 2.25, gainSensitivity: 0.88 } },
  Rationalist: { cash: 10000, inventory: 0, avgEntry: 0, wealth: 10000, params: { intrinsicValue: 100 } },
  Momentum: { cash: 10000, inventory: 0, avgEntry: 0, wealth: 10000, params: { lookbackWindow: 5, threshold: 2 } },
  MeanRevertor: { cash: 10000, inventory: 0, avgEntry: 0, wealth: 10000, params: { smaWindow: 10, zScoreThreshold: 1.5 } },
  MarketMaker: { cash: 10000, inventory: 0, avgEntry: 0, wealth: 10000, params: { gamma: 0.1, spreadWidth: 2 } },
  NoiseTrader: { cash: 10000, inventory: 0, avgEntry: 0, wealth: 10000, params: { tradeProbability: 1.0, maxQuantity: 3 } },
};

/**
 * Default starting state for the simulation environment.
 */
const initialSimulation: SimulationState = {
  epoch: 0,
  currentPrice: 100,
  history: [100],
  wealthHistory: {
    Prospector: [10000],
    Rationalist: [10000],
    Momentum: [10000],
    MeanRevertor: [10000],
    MarketMaker: [10000],
    NoiseTrader: [10000],
  },
  logs: [],
  isRunning: false,
  playbackSpeedMs: 1000,
  borrowRate: 0.0, // 0.0% per epoch
  marginCallThreshold: 0.2, // 20% margin requirement
};

export const useStore = create<GlobalState>((set) => ({
  ...initialSimulation,
  agents: initialAgents,

  toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),

  updateSimulationParam: (paramName: keyof SimulationState, value: number) => set(() => ({
    [paramName]: value
  })),

  stepEpoch: (orders: Order[]) => set((state) => {
    const { nextSimulationState, nextAgents } = processEpoch(state, state.agents, orders);
    return {
      ...nextSimulationState,
      agents: nextAgents,
    };
  }),

  resetSimulation: () => set(() => ({
    ...initialSimulation,
    agents: initialAgents,
  })),

  setPlaybackSpeed: (speed) => set(() => ({ playbackSpeedMs: speed })),

  updateAgentParam: (agentId, paramName, value) => set((state) => ({
    agents: {
      ...state.agents,
      [agentId]: {
        ...state.agents[agentId],
        params: {
          ...state.agents[agentId].params,
          [paramName]: value,
        },
      },
    },
  })),
}));
