import type { AgentState, Order, SimulationState } from './types';

/**
 * Helper to generate an order object for the simulation engine.
 * @param agentId The identifier of the agent placing the order.
 * @param side The direction (1 for Bid, -1 for Ask).
 * @param price The limit price of the order.
 * @param quantity The number of contracts.
 * @returns A structured Order object.
 */
export const createOrder = (agentId: string, side: 1 | -1, price: number, quantity: number): Order => ({
  agentId,
  side,
  price,
  quantity
});

/**
 * Generates orders for the Prospector agent.
 * Strategy: Employs Kahneman-Tversky Prospect Theory. Exhibits loss aversion by averaging down
 * when underwater, and gain sensitivity by prematurely locking in small profits.
 */
export const getProspectorOrders = (marketState: SimulationState, internalState: AgentState): Order[] => {
  const { currentPrice } = marketState;
  const { inventory, avgEntry, params } = internalState;
  const { lossAversion, gainSensitivity } = params;

  if (inventory === 0) {
    // If no inventory, just place a mild bid to enter
    return [createOrder('Prospector', 1, currentPrice * 0.99, 1)];
  }

  const pnl = (currentPrice - avgEntry) * inventory;

  // Kahneman-Tversky value function heuristics:
  if (inventory > 0) {
    if (pnl > 0) {
      // Long & Profit: Risk-averse in gains, sells prematurely to lock in small wins
      const askPrice = currentPrice * (1 + (0.01 / gainSensitivity));
      return [createOrder('Prospector', -1, askPrice, 1)];
    } else {
      // Long & Loss: Risk-seeking in losses, buys more to average down
      const bidPrice = currentPrice * (1 - (0.01 / lossAversion));
      return [createOrder('Prospector', 1, bidPrice, 1)];
    }
  } else {
    if (pnl > 0) {
      // Short & Profit: Risk-averse in gains, buys to cover short and lock in small wins
      const bidPrice = currentPrice * (1 - (0.01 / gainSensitivity));
      return [createOrder('Prospector', 1, bidPrice, 1)];
    } else {
      // Short & Loss: Risk-seeking in losses, sells more short to average down
      const askPrice = currentPrice * (1 + (0.01 / lossAversion));
      return [createOrder('Prospector', -1, askPrice, 1)];
    }
  }
};

/**
 * Generates orders for the Rationalist agent.
 * Strategy: Follows Expected Utility Theory, acting as a mean-reverting force towards an
 * intrinsic fundamental value, regardless of market momentum.
 */
export const getRationalistOrders = (marketState: SimulationState, internalState: AgentState): Order[] => {
  const { currentPrice } = marketState;
  const { params } = internalState;
  const { intrinsicValue } = params;

  if (currentPrice < intrinsicValue) {
    return [createOrder('Rationalist', 1, intrinsicValue, 1)];
  } else if (currentPrice > intrinsicValue) {
    return [createOrder('Rationalist', -1, intrinsicValue, 1)];
  }
  return [];
};

/**
 * Generates orders for the Momentum agent.
 * Strategy: Calculates the discrete derivative of price over a lookback window.
 * Aggressively crosses the spread to ride strong directional trends.
 */
export const getMomentumOrders = (marketState: SimulationState, internalState: AgentState): Order[] => {
  const { currentPrice, history } = marketState;
  const { params } = internalState;
  const { lookbackWindow, threshold } = params;

  const k = Math.min(Math.floor(lookbackWindow), history.length - 1);
  if (k <= 0) return [];

  const pastPrice = history[history.length - 1 - k];
  const derivative = currentPrice - pastPrice;

  if (derivative > threshold) {
    // Aggressive market buy (crossing spread by ~1%)
    return [createOrder('Momentum', 1, currentPrice * 1.01, 1)];
  } else if (derivative < -threshold) {
    // Aggressive market sell (crossing spread by ~1%)
    return [createOrder('Momentum', -1, currentPrice * 0.99, 1)];
  }
  return [];
};

/**
 * Generates orders for the Mean Revertor agent.
 * Strategy: Identifies statistical pricing anomalies using Z-scores over a moving average window
 * and trades based on the assumption that extreme price movements will revert to the mean.
 */
export const getMeanRevertorOrders = (marketState: SimulationState, internalState: AgentState): Order[] => {
  const { currentPrice, history } = marketState;
  const { params } = internalState;
  const { smaWindow, zScoreThreshold } = params;

  const windowSize = Math.min(Math.floor(smaWindow), history.length);
  if (windowSize <= 1) return [];

  const slice = history.slice(-windowSize);
  const mean = slice.reduce((a, b) => a + b, 0) / windowSize;

  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / windowSize;
  const stdDev = Math.sqrt(variance) || 1; // avoid div by 0

  const zScore = (currentPrice - mean) / stdDev;

  if (zScore > zScoreThreshold) {
    // Short / Sell
    return [createOrder('MeanRevertor', -1, currentPrice * 0.99, 1)];
  } else if (zScore < -zScoreThreshold) {
    // Buy
    return [createOrder('MeanRevertor', 1, currentPrice * 1.01, 1)];
  }
  return [];
};

/**
 * Generates orders for the Market Maker agent.
 * Strategy: Uses an Avellaneda-Stoikov model to post Bids and Asks around a reservation price.
 * The reservation price dynamically adjusts based on the agent's absolute inventory to prevent toxic accumulation.
 */
export const getMarketMakerOrders = (marketState: SimulationState, internalState: AgentState): Order[] => {
  const { currentPrice } = marketState;
  const { inventory, params } = internalState;
  const { gamma, spreadWidth } = params;

  // Avellaneda-Stoikov reservation price
  const reservationPrice = currentPrice - (gamma * inventory);

  const bidPrice = reservationPrice - (spreadWidth / 2);
  const askPrice = reservationPrice + (spreadWidth / 2);

  return [
    createOrder('MarketMaker', 1, bidPrice, 5),
    createOrder('MarketMaker', -1, askPrice, 5)
  ];
};

/**
 * Generates orders for the Noise Trader agent.
 * Strategy: Injects random, irrational retail trading volume into the market
 * that purposely crosses the spread with unpredictable slippage to simulate market takers.
 */
export const getNoiseTraderOrders = (marketState: SimulationState, internalState: AgentState): Order[] => {
  const { currentPrice } = marketState;
  const { params } = internalState;
  // Default values ensure backward compatibility if params are missing
  const {
    tradeProbability,
    maxQuantity,
    buyThreshold = 0.5,
    minSlippage = 0.01,
    slippageWidth = 0.02
  } = params;

  if (Math.random() > tradeProbability) return [];

  // Inject random 'Noise Traders' (External Retail) to simulate market-takers crossing the spread.
  const isBuy = Math.random() > buyThreshold;
  // Simulate a realistic market order crossing the spread with enough slippage (e.g. 1% to 3%)
  // to ensure it overcomes the Market Maker's default spread.
  const slippage = (Math.random() * slippageWidth) + minSlippage;
  const noisePrice = isBuy ? currentPrice * (1 + slippage) : currentPrice * (1 - slippage);
  const noiseQty = Math.floor(Math.random() * maxQuantity) + 1;

  return [createOrder('NoiseTrader', isBuy ? 1 : -1, noisePrice, noiseQty)];
};

/**
 * Aggregates all orders from every active agent into a single list before matching.
 */
export const getAllAgentOrders = (marketState: SimulationState, agents: Record<string, AgentState>): Order[] => {
  const orders: Order[] = [];

  if (agents['Prospector']) orders.push(...getProspectorOrders(marketState, agents['Prospector']));
  if (agents['Rationalist']) orders.push(...getRationalistOrders(marketState, agents['Rationalist']));
  if (agents['Momentum']) orders.push(...getMomentumOrders(marketState, agents['Momentum']));
  if (agents['MeanRevertor']) orders.push(...getMeanRevertorOrders(marketState, agents['MeanRevertor']));
  if (agents['MarketMaker']) orders.push(...getMarketMakerOrders(marketState, agents['MarketMaker']));
  if (agents['NoiseTrader']) orders.push(...getNoiseTraderOrders(marketState, agents['NoiseTrader']));

  return orders;
};
