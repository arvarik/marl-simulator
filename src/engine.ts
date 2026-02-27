import type { AgentState, SimulationState, Order, AgentActionLog, EpochLog } from './types';

export interface EngineResult {
    nextSimulationState: Omit<SimulationState, 'isRunning' | 'playbackSpeedMs' | 'borrowRate' | 'marginCallThreshold'>;
    nextAgents: Record<string, AgentState>;
}

/**
 * Pure function that processes a single epoch of the continuous double auction market.
 * It matches Bids and Asks, updates agent inventories, settles mark-to-market wealth,
 * deducts borrowing costs, and executes margin calls.
 */
export function processEpoch(
    currentState: SimulationState,
    currentAgents: Record<string, AgentState>,
    orders: Order[]
): EngineResult {
    const currentEpochLogs: AgentActionLog[] = [];

    orders.forEach(o => {
        currentEpochLogs.push({
            agentId: o.agentId,
            action: `Placed ${o.side === 1 ? 'Bid' : 'Ask'} for ${o.quantity} units at $${o.price.toFixed(2)}`
        });
    });

    // Separate incoming orders into bids (side: 1) and asks (side: -1).
    // Sort: bids descending by price, asks ascending by price.
    const bids = orders.filter(o => o.side === 1).map(o => ({ ...o })).sort((a, b) => b.price - a.price);
    const asks = orders.filter(o => o.side === -1).map(o => ({ ...o })).sort((a, b) => a.price - b.price);

    let currentPrice = currentState.currentPrice;

    // Deep clone agents to avoid mutating state directly
    const nextAgents: Record<string, AgentState> = {};
    for (const [key, agent] of Object.entries(currentAgents)) {
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
    const nextWealthHistory: Record<string, number[]> = { ...currentState.wealthHistory };
    for (const id in nextAgents) {
        const agent = nextAgents[id];

        // 1. Borrowing Cost (Interest on negative inventory value)
        if (agent.inventory < 0) {
            // Calculate the current value of the borrowed shares
            const borrowedValue = Math.abs(agent.inventory) * currentPrice;
            // Deduct interest from cash
            const interestFee = borrowedValue * currentState.borrowRate;
            agent.cash -= interestFee;
        }

        // Calculate intermediate wealth
        agent.wealth = agent.cash + (agent.inventory * currentPrice);

        // 2. Margin Call / Forced Liquidation
        if (agent.inventory < 0) {
            const borrowedValue = Math.abs(agent.inventory) * currentPrice;
            const maintenanceMargin = borrowedValue * currentState.marginCallThreshold;

            // If cash buffer drops below required maintenance margin, force liquidate!
            if (agent.cash < maintenanceMargin) {
                console.warn(`[MARGIN CALL] Agent ${id} liquidated at Epoch ${currentState.epoch + 1}!`);
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

        // Optimization: Append to existing array to avoid quadratic copying
        if (nextWealthHistory[id]) {
            nextWealthHistory[id].push(agent.wealth);
        } else {
            nextWealthHistory[id] = [agent.wealth];
        }
    }

    const newLog: EpochLog = {
        epoch: currentState.epoch + 1,
        price: currentPrice,
        actions: currentEpochLogs,
    };

    // Keep the last 50 logs to prevent memory bloat
    const nextLogs = [newLog, ...currentState.logs].slice(0, 50);

    return {
        nextSimulationState: {
            epoch: currentState.epoch + 1,
            currentPrice,
            history: [...currentState.history, currentPrice],
            wealthHistory: nextWealthHistory,
            logs: nextLogs,
        },
        nextAgents
    };
}
