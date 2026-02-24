/**
 * Represents a limit order placed by an agent.
 */
export interface Order {
  /** The unique identifier of the agent placing the order. */
  agentId: string;
  /** The direction of the order: 1 for Buy (Bid), -1 for Sell (Ask). */
  side: 1 | -1;
  /** The price at which the order is placed. */
  price: number;
  /** The number of units to buy or sell. */
  quantity: number;
}

/**
 * Represents the financial state and agent-specific parameters of a single trading agent.
 */
export interface AgentState {
  /** Current cash balance available to the agent. */
  cash: number;
  /** Current net position (positive for long, negative for short). */
  inventory: number;
  /** The weighted average entry price of the current inventory. */
  avgEntry: number;
  /** Total marked-to-market wealth (cash + inventory * currentPrice). */
  wealth: number;
  /** Dynamic agent-specific behavioral parameters (e.g., risk appetite, lookback windows). */
  params: Record<string, number>;
}

/**
 * Represents a single logged action performed by an agent during an epoch.
 */
export interface AgentActionLog {
  /** The ID of the agent performing the action. */
  agentId: string;
  /** A human-readable description of the action. */
  action: string;
}

/**
 * Represents a summary of all activities that occurred during a single simulation step (epoch).
 */
export interface EpochLog {
  /** The sequential step number of the simulation. */
  epoch: number;
  /** The clearing price at the end of this epoch. */
  price: number;
  /** A list of actions (orders, trades, margin calls) that occurred. */
  actions: AgentActionLog[];
}

/**
 * Represents the global state of the simulation.
 */
export interface SimulationState {
  /** The current sequential step number. */
  epoch: number;
  /** The current market price of the simulated asset. */
  currentPrice: number;
  /** Time series of historical market prices. */
  history: number[];
  /** Historical wealth traces for all agents, keyed by agentId. */
  wealthHistory: Record<string, number[]>;
  /** Recent simulation activity logs (typically capped to a fixed length). */
  logs: EpochLog[];
  /** Whether the simulation loop is currently actively advancing epochs. */
  isRunning: boolean;
  /** The delay in milliseconds between each auto-advancing epoch. */
  playbackSpeedMs: number;
  /** The interest rate applied to short positions per epoch. */
  borrowRate: number;
  /** The margin requirement percentage. If an agent's cash drops below this threshold of their short value, they are liquidated. */
  marginCallThreshold: number;
}
