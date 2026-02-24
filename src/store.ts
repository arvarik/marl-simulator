import { create } from 'zustand';
import type { AgentState, SimulationState, Order, AgentActionLog, EpochLog } from './types';

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
    const currentEpochLogs: AgentActionLog[] = [];
    orders.forEach(o => {
      currentEpochLogs.push({
        agentId: o.agentId,
        action: `Placed ${o.side === 1 ? 'Bid' : 'Ask'} for ${o.quantity} units at $${o.price.toFixed(2)}`
      });
    });

    // Separate incoming orders into bids (side: 1) and asks (side: -1).
    // Sort: bids descending by price, asks ascending by price.
    // Create new array references to avoid mutating the parameters directly if they were passed by ref
    const bids = orders.filter(o => o.side === 1).map(o => ({ ...o })).sort((a, b) => b.price - a.price);
    const asks = orders.filter(o => o.side === -1).map(o => ({ ...o })).sort((a, b) => a.price - b.price);

    let currentPrice = state.currentPrice;

    // Deep clone agents to avoid mutating state directly
    const nextAgents: Record<string, AgentState> = {};
    for (const [key, agent] of Object.entries(state.agents)) {
      nextAgents[key] = { ...agent };
    }

    // Match: While bids and asks exist and bids[0].price >= asks[0].price
    while (bids.length > 0 && asks.length > 0 && bids[0].price >= asks[0].price) {
      const bid = bids[0];
      const ask = asks[0];

      // Clear: clearing price is midpoint
      const clearingPrice = (bid.price + ask.price) / 2.0;
      const executedQuantity = Math.min(bid.quantity, ask.quantity);

      currentEpochLogs.push({
        agentId: bid.agentId,
        action: `Bought ${executedQuantity} units at $${clearingPrice.toFixed(2)}`
      });
      currentEpochLogs.push({
        agentId: ask.agentId,
        action: `Sold ${executedQuantity} units at $${clearingPrice.toFixed(2)}`
      });

      // Helper function for updating average entry
      const updateAgentPosition = (agent: AgentState, qty: number, price: number) => {
        const isBuying = qty > 0;
        const isLong = agent.inventory > 0;
        const isShort = agent.inventory < 0;

        agent.cash -= qty * price;

        if (agent.inventory === 0) {
          // Opening new position
          agent.inventory = qty;
          agent.avgEntry = price;
        } else if ((isLong && isBuying) || (isShort && !isBuying)) {
          // Adding to existing position
          const totalCost = (Math.abs(agent.inventory) * agent.avgEntry) + (Math.abs(qty) * price);
          agent.inventory += qty;
          agent.avgEntry = totalCost / Math.abs(agent.inventory);
        } else {
          // Reducing existing position
          agent.inventory += qty;
          // If position flipped from long to short or short to long
          if ((isLong && agent.inventory < 0) || (isShort && agent.inventory > 0)) {
            agent.avgEntry = price; // The flipped portion is at the new price
          } else if (agent.inventory === 0) {
            agent.avgEntry = 0;
          }
          // If just reduced but not flipped, avgEntry remains unchanged
        }
      };

      // Settle
      const buyer = nextAgents[bid.agentId];
      if (buyer) updateAgentPosition(buyer, executedQuantity, clearingPrice);

      const seller = nextAgents[ask.agentId];
      if (seller) updateAgentPosition(seller, -executedQuantity, clearingPrice);

      currentPrice = clearingPrice;

      // Deduct filled quantities
      bid.quantity -= executedQuantity;
      ask.quantity -= executedQuantity;

      // Pop from array if quantity reaches 0
      if (bid.quantity <= 0) bids.shift();
      if (ask.quantity <= 0) asks.shift();
    }

    // Mark-to-Market wealth update, Borrow Fees, and Margin Calls
    const nextWealthHistory: Record<string, number[]> = {};
    for (const id in nextAgents) {
      const agent = nextAgents[id];

      // 1. Borrowing Cost (Interest on negative inventory value)
      if (agent.inventory < 0) {
        // Calculate the current value of the borrowed shares
        const borrowedValue = Math.abs(agent.inventory) * currentPrice;
        // Deduct interest from cash
        const interestFee = borrowedValue * state.borrowRate;
        agent.cash -= interestFee;
      }

      // Calculate intermediate wealth
      agent.wealth = agent.cash + (agent.inventory * currentPrice);

      // 2. Margin Call / Forced Liquidation
      if (agent.inventory < 0) {
        const borrowedValue = Math.abs(agent.inventory) * currentPrice;
        const maintenanceMargin = borrowedValue * state.marginCallThreshold;

        // If cash buffer drops below required maintenance margin, force liquidate!
        // The broker forcibly buys back the shares at whatever the current price is to close the short.
        if (agent.cash < maintenanceMargin) {
          console.warn(`[MARGIN CALL] Agent ${id} liquidated at Epoch ${state.epoch + 1}!`);
          currentEpochLogs.push({
            agentId: id,
            action: `[MARGIN CALL] Liquidated ${Math.abs(agent.inventory)} units at $${currentPrice.toFixed(2)}`
          });
          // Cost to buy back the shares
          const costToCover = Math.abs(agent.inventory) * currentPrice;
          agent.cash -= costToCover;
          agent.inventory = 0;
          agent.avgEntry = 0;
          // Recalculate wealth after forced liquidation
          agent.wealth = agent.cash + (agent.inventory * currentPrice);
        }
      }

      nextWealthHistory[id] = [...(state.wealthHistory[id] || []), agent.wealth];
    }

    const newLog: EpochLog = {
      epoch: state.epoch + 1,
      price: currentPrice,
      actions: currentEpochLogs,
    };

    // Keep the last 50 logs to prevent memory bloat
    const nextLogs = [newLog, ...state.logs].slice(0, 50);

    return {
      epoch: state.epoch + 1,
      currentPrice,
      history: [...state.history, currentPrice],
      wealthHistory: nextWealthHistory,
      logs: nextLogs,
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
