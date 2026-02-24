# QuantSim: MARL Synthetic Economy

Welcome to **QuantSim**, an interactive Multi-Agent Reinforcement Learning (MARL) Synthetic Economy. 

At its core, QuantSim is a digital playground where distinct AI traders (agents) buy and sell a single fictional asset from one another in real-time. Instead of just tracking numbers going up and down, this simulator lets you peek under the hood to see *why* markets move the way they do. It demonstrates how different personalities—from deeply emotional retail traders to cold, calculating algorithms—interact to create the living, breathing organism we call the "market."

Whether you are a student of economics, a software engineer interested in fintech, or just someone curious about why stock prices flash crash, this tool is designed to make complex market dynamics visual, interactive, and understandable.

<img width="1685" height="1303" alt="image" src="https://github.com/user-attachments/assets/8491ec14-fe51-4192-8030-18732f3d9707" />

---

## 🚀 Installation & Configuration

Getting the simulator running on your local machine takes just a few steps.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Setup Instructions

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd marl-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the App**:
   Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

---

## 📚 Fundamental Learnings: How Markets Work

Before diving into the complex math, let's establish some basic ground rules of how our synthetic economy operates.

### What is a Market?
In our simulator, a market is simply a place where buyers and sellers meet to exchange an asset. 
- **Bids** are offers to *buy* at a specific price.
- **Asks** are offers to *sell* at a specific price.
- A trade happens when a buyer is willing to pay a price that a seller is willing to accept.

### The Limit Order Book (LOB)
Imagine a ledger that records everyone's desired buying and selling prices. This is the Limit Order Book. If you want to buy a stock for $90, but the cheapest anyone is selling it for is $100, your order sits in the LOB waiting. The "Market Price" you see on the news is simply the price of the *last successful transaction*. Our simulator uses a **Continuous Double Auction (CDA)** matching engine to pair these buyers and sellers instantly.

### Short Selling, Margin Calls, and Borrow Rates
Agents can hold a "negative" inventory by borrowing shares to sell them, hoping the price will drop. 
- **Borrow Rate (Interest):** Holding a short position costs money. The simulator charges a configurable interest fee per epoch.
- **Margin Calls:** If an agent's cash drops too low to cover their short position, the broker forces a liquidation (buying back the shares automatically), which can cause violent upward price spikes known as "Short Squeezes."

### Why Simulate This?
Real-world markets are messy and driven by millions of humans and algorithms. By simulating a smaller market with 6 specific AI agents, we can isolate behaviors. We can see exactly what happens when a "trend chaser" collides with a "value investor," or what happens when a market panic sets in.

---

## 🧠 Deep Dive: The AI Agents & Technical Theory

The simulator features 6 distinct agents. Each represents a well-known archetype in financial markets, governed by specific mathematical models. 

### 1. The Prospector (The Emotional Trader)
* **The Concept**: Humans hate losing more than they like winning. If a stock goes down, an emotional trader might refuse to sell, hoping it bounces back (becoming a "bag holder"). If it goes up a tiny bit, they sell immediately to feel like a winner.
* **The Theory**: **Kahneman-Tversky Prospect Theory**. This Nobel Prize-winning theory models human behavioral biases. 
* **Parameters**: 
  - *Loss Aversion*: How stubbornly they hold onto losers (averaging down).
  - *Gain Sensitivity*: How quickly they sell winners.

### 2. The Rationalist (The Fundamental Investor)
* **The Concept**: Think of Warren Buffett. This agent believes the asset has a "true" underlying value. If the current price is below that value, it's a bargain (buy). If it's above, it's overpriced (sell).
* **The Theory**: **Expected Utility Theory**. 
* **Parameters**:
  - *Intrinsic Value*: The secret "true" price the agent believes the asset is worth. This acts as a gravitational anchor for the whole simulation.

### 3. The Momentum Trader (The Trend Chaser)
* **The Concept**: "The trend is your friend." This agent doesn't care about the underlying value; it only cares about the direction the price is moving. If it's rocketing up, it buys. If it's crashing, it sells.
* **The Theory**: **Market Kinematics**. It calculates the discrete derivative (the rate of change) of the price over a recent time window.
* **Parameters**:
  - *Lookback Window*: How far back in time it looks to determine the trend.
  - *Threshold*: How steep the trend must be to trigger a trade.

### 4. The Mean-Revertor (The Contrarian)
* **The Concept**: "What goes up must come down." This agent believes that prices always eventually return to their historical average. It buys when everyone is panicking and selling, and shorts (bets against) the asset when everyone is buying in a frenzy.
* **The Theory**: **Statistical Arbitrage (Stat-Arb)**. It calculates a Z-Score (a measure of how far the current price deviates from a simple moving average).
* **Parameters**:
  - *SMA Window*: The time frame for the moving average.
  - *Z-Score Threshold*: How extreme the price deviation must be before it steps in to trade.

### 5. The Market Maker (The Middleman)
* **The Concept**: This agent doesn't care if the price goes up or down. It just wants to facilitate trades and collect a tiny fee (the spread) for doing so. It always offers to buy a little lower than the current price and sell a little higher.
* **The Theory**: **Avellaneda-Stoikov Model**. If the Market Maker ends up buying too much of the asset (toxic inventory), it gets nervous and lowers its buying price to discourage more sellers.
* **Parameters**:
  - *Spread Width*: The gap between its buying and selling price.
  - *Inventory Penalty ($\gamma$)*: How aggressively it shifts its prices when it holds too much inventory.

### 6. The Noise Trader (The Chaotic Retail)
* **The Concept**: Markets need a constant stream of unpredictable volume to prevent algorithms from deadlocking. This agent represents the random flow of everyday retail traders buying and selling at market price.
* **The Theory**: **Stochastic Market Takers**. They submit market orders that cross the spread, providing the necessary chaos to keep the limit order book moving.
* **Parameters**:
  - *Trade Probability*: The likelihood they trade in any given epoch.
  - *Max Quantity*: The maximum number of shares they buy/sell at once.

---

## 🎮 How to Use the Simulator & Understand Results

The dashboard is designed as a three-panel "cockpit":

### 1. Left Panel: Agent Configurations
This is your laboratory. You can adjust the mathematical parameters (sliders) for every agent on the fly. Want to see what happens when the Prospector becomes hyper loss-averse? Slide it up! Tooltips are provided next to each metric to explain exactly what changing the value does.

### 2. Center Stage: Simulation Dashboard & Quant Academy
* **Simulation Dashboard**: Hit the **"Play"** button at the top to watch the market come alive. 
  - The **Price Action Chart** tracks the current market price against the Rationalist's Intrinsic Value.
  - The **Agent Wealth Race** graphs the Mark-to-Market (MtM) PnL of all agents. Watch out for sharp drops indicating a Margin Call!
  - The **Limit Order Book (LOB)** visualizes the pending Asks (Sellers) and Bids (Buyers) alongside the live current price.
  - The **Event Logs** stream real-time actions. Expand an epoch to see exactly who bought, sold, or got liquidated.
* **Quant Academy**: Toggle this view in the top header to read a deeply detailed, interactive textbook explaining the mathematics behind the simulation.

### 3. Right Panel: Scenario Deck
Inject macroeconomic shocks into a live market:
* **Systemic Shock**: Instantly changes the fundamental value of the asset upwards.
* **Flash Crash**: Makes the Mean-Revertor hyper-reactive and the Momentum trader look further back.
* **Liquidity Freeze**: Maxes out the Market Maker's fear of holding inventory, severely widening the spread.
* **Retail FOMO**: Floods the market with maximum volume from the Noise Trader and makes Momentum highly aggressive.
* **Fundamental Collapse**: Drops the Intrinsic Value by 50% while maximizing the Prospector's refusal to sell losers.
* **Borrow Rate (Interest)**: A global slider to turn up the heat on short sellers. Crank this up to induce Margin Calls faster!

---

## 📖 Sources for Further Reading

If you want to dive deeper into the academic theories that power this simulation, here are some foundational topics and resources:

**On Behavioral Economics (The Prospector)**
* *Thinking, Fast and Slow* by Daniel Kahneman (A highly accessible book on behavioral biases and Prospect Theory).
* *Prospect Theory: An Analysis of Decision under Risk* (Kahneman & Tversky, 1979) - The original foundational paper.

**On Market Microstructure (The Market Maker & LOB)**
* *High-Frequency Trading: A Practical Guide to Algorithmic Strategies and Trading Systems* by Irene Aldridge.
* *High-frequency trading in a limit order book* (Avellaneda & Stoikov, 2008) - The mathematical model used for our Market Maker agent.

**On Trading Strategies (Momentum & Mean Reversion)**
* *Algorithmic Trading: Winning Strategies and Their Rationale* by Ernie Chan (Excellent overview of Stat-Arb and Momentum).
