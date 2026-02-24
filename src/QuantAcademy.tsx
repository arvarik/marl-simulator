import { useState } from 'react';
import { useStore } from './store';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { ChevronDown, ChevronUp, BookOpen, BarChart2, Lightbulb, Activity } from 'lucide-react';

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-zinc-900/30 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors text-left"
      >
        <span className="font-semibold text-zinc-200">{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
      </button>
      {isOpen && (
        <div className="p-5 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Educational dashboard detailing the math, parameters, and behaviors of each agent.
 * Also acts as a master post-mortem to review terminal simulation states.
 */
export function QuantAcademy() {
  const agents = useStore((state) => state.agents);
  const [selectedScenario, setSelectedScenario] = useState('trap');

  // Terminal State Matrix Data
  const sortedAgents = Object.entries(agents).map(([id, state]) => {
    const startWealth = 10000;
    const roi = ((state.wealth - startWealth) / startWealth) * 100;
    return {
      id,
      wealth: state.wealth,
      roi,
      inventory: state.inventory,
      cash: state.cash
    };
  }).sort((a, b) => b.wealth - a.wealth);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          Quant Academy
        </h3>
        <p className="text-zinc-400">
          A comprehensive deep dive into the PhD-level theories governing the MARL Synthetic Economy. Understand the underlying math, the post-mortem of market scenarios, and analyze terminal states.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">

        {/* Section 1: Mathematical Foundations */}
        <section>
          <h4 className="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Mathematical Foundations & Agent Behaviors
          </h4>
          <div className="prose prose-invert prose-zinc max-w-none">
            <Accordion title="1. Prospector: Kahneman-Tversky Value Function" defaultOpen>
              <p>
                The Prospector agent mimics human behavioral biases using <strong>Prospect Theory</strong>, a Nobel Prize-winning psychological model. It dictates that humans feel the pain of a loss much more intensely than the joy of an equivalent gain.
                The value function <InlineMath math="v(x)" /> evaluates unrealized Profit & Loss (PnL):
              </p>
              <BlockMath math="v(x) = \begin{cases} x^\alpha & \text{if } x \ge 0 \\ -\lambda(-x)^\alpha & \text{if } x < 0 \end{cases}" />
              <p>
                <strong>How UI sliders alter behavior:</strong><br />
                <ul>
                  <li><strong>Loss Aversion (<InlineMath math="\lambda" />):</strong> If the Prospector buys a stock at $100 and it drops to $90, a rational trader might sell to cut losses. A high <InlineMath math="\lambda" /> paralyzes the Prospector; they refuse to sell, and instead buy <em>more</em> at $90 to "average down," desperately hoping for a bounce back to break-even.</li>
                  <li><strong>Gain Sensitivity (<InlineMath math="\alpha" />):</strong> If the stock goes from $100 to $102, a high <InlineMath math="\alpha" /> causes the Prospector to panic-sell immediately to lock in the tiny $2 win, missing out on massive long-term trends.</li>
                </ul>
              </p>
            </Accordion>

            <Accordion title="2. Rationalist: Expected Utility Theory">
              <p>
                The Rationalist operates on pure fundamental analysis, assuming the asset has a true, underlying <em>Intrinsic Value (<InlineMath math="V_t" />)</em>. Think of it as a strict value investor like Warren Buffett.
                It submits limit orders according to:
              </p>
              <BlockMath math="\text{Side} = \begin{cases} \text{Buy (Bid)} & \text{if } P_t < V_t \\ \text{Sell (Ask)} & \text{if } P_t > V_t \end{cases}" />
              <p>
                <strong>Example:</strong> If Intrinsic Value is set to $100, but the market price spikes to $105, the Rationalist immediately starts short-selling the asset, providing a gravitational pull back down to $100. Adjusting the slider dynamically forces the entire market ecosystem to find a new equilibrium.
              </p>
            </Accordion>

            <Accordion title="3. Momentum Trader: Market Kinematics">
              <p>
                The Trend Chaser. This agent calculates the discrete derivative (velocity) of the price over a recent lookback window <InlineMath math="k" />.
              </p>
              <BlockMath math="\Delta P = P_t - P_{t-k}" />
              <p>
                If <InlineMath math="\Delta P > \text{Threshold}" />, it executes an aggressive market order, riding the trend. This amplifies volatility and can trigger cascading liquidations.
              </p>
              <p>
                <strong>Example:</strong> A lookback of 5 epochs and a threshold of $2.00 means if the price has moved more than $2 in the last 5 ticks, the Momentum trader jumps in. Lowering the threshold makes them hyper-reactive to tiny blips.
              </p>
            </Accordion>

            <Accordion title="4. Mean-Revertor: Statistical Arbitrage">
              <p>
                A standard pairs-trading/stat-arb approach. The agent calculates a Z-score against a rolling Simple Moving Average (SMA) of the price.
              </p>
              <BlockMath math="Z = \frac{P_t - \mu_{SMA}}{\sigma}" />
              <p>
                If the Z-score exceeds a critical threshold, it bets against the trend. For example, if the SMA is $100 and the price suddenly jumps to $110, the Z-score spikes to +3.0. The Mean-Revertor will short-sell, assuming the $110 is a transient anomaly that must return to $100. However, if the fundamental value actually changed, it gets run over (The Contrarian Trap).
              </p>
            </Accordion>

            <Accordion title="5. Market Maker: Avellaneda-Stoikov Model">
              <p>
                This agent provides liquidity on both sides of the Limit Order Book (LOB) to earn the spread. To avoid toxic inventory buildup (holding too much long or short), it skews its quotes using a reservation price <InlineMath math="P^r_t" />:
              </p>
              <BlockMath math="P^r_t = P_t - \gamma \cdot Q_t" />
              <p>
                Where <InlineMath math="Q_t" /> is current inventory and <InlineMath math="\gamma" /> is the inventory penalty. It then quotes a spread width <InlineMath math="\delta" /> symmetrically around <InlineMath math="P^r_t" />.
              </p>
              <p>
                <strong>Example:</strong> If the Market Maker ends up buying too much stock (<InlineMath math="Q_t = +10" />), it becomes terrified of the price dropping. A high <InlineMath math="\gamma" /> penalty forcefully lowers <InlineMath math="P^r_t" />. The Market Maker drops its Bid price so no one else sells to it, and drops its Ask price to incentivize buyers to take the inventory off its hands.
              </p>
            </Accordion>

            <Accordion title="6. Noise Trader: External Retail Flow">
              <p>
                To prevent Market Microstructure deadlocks (where all limit order providers stare at each other waiting for the price to cross the spread), we inject random External Retail flow.
              </p>
              <p>
                This agent acts as a market-taker, submitting aggressive limit orders at random intervals with a small random slippage (e.g., 1-3%) designed to intentionally cross the Market Maker's spread. This provides the necessary stochastic "noise" to keep the continuous double auction flowing. Adjusting the probability and volume parameters controls the baseline chaos of the simulation.
              </p>
            </Accordion>

            <Accordion title="7. Short Selling, Borrow Rates, and Margin Calls">
              <p>
                Agents can hold <strong>negative inventory</strong> by borrowing shares to sell them, hoping to buy them back cheaper later. However, this is not free.
              </p>
              <p>
                <strong>Borrow Rate (Interest):</strong> Every epoch, any agent with a short position must pay an interest fee based on the current market value of their borrowed shares. A high interest rate will rapidly bleed a short seller's cash balance.
              </p>
              <p>
                <strong>Margin Calls:</strong> The broker (the simulator) demands a Maintenance Margin (e.g., 20% of the borrowed value) in cash. If an agent's cash drops below this threshold, the broker forcibly liquidates the agent, buying back the borrowed shares at whatever the current market price is. This forced buying creates massive upward price spikes known as "Short Squeezes."
              </p>
            </Accordion>
          </div>
        </section>

        {/* Section 2: The Simulation Trace Post-Mortem */}
        <section>
          <h4 className="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Activity className="w-5 h-5 text-rose-400" />
            Scenario Post-Mortems
          </h4>
          <div className="bg-zinc-900/40 rounded-xl border border-white/5 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h5 className="font-semibold text-lg text-rose-200">Tracing Market Crushes & Events</h5>
                <p className="text-sm text-zinc-400 mt-1">
                  Select a scenario from the dropdown to trace exactly how the mathematical agents react tick-by-tick.
                </p>
              </div>
              <select
                className="bg-zinc-800 border border-white/10 text-zinc-200 text-sm rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-rose-500 min-w-[200px]"
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
              >
                <option value="trap">Fundamental Collapse</option>
                <option value="shock">Systemic Shock</option>
                <option value="crash">Flash Crash</option>
                <option value="freeze">Liquidity Freeze</option>
                <option value="fomo">Retail FOMO</option>
              </select>
            </div>

            {/* Content: Fundamental Collapse */}
            {selectedScenario === 'trap' && (
              <div className="relative border-l border-white/10 ml-3 pl-6 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-blue-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <h6 className="font-bold text-zinc-200">1. The Rationalist Dumps</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    Upon shock injection, the Rationalist instantly recognizes the asset is massively overpriced at $100. It immediately spams aggressive Sell limit orders down to the new $50 Intrinsic Value, instantly chewing through the Market Maker's standing Bids and crashing the Midpoint.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-amber-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">2. Behavioral Ruin (The Bag Holder)</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The Prospector, holding a long position from before the shock, enters the loss domain. Paralyzed by a maximized Loss Aversion (<InlineMath math="\lambda = 5.0" />), it refuses to sell and cut its losses. Instead, it aggressively buys more shares as the price plummets to "average down," acting as a toxic liquidity sponge.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-emerald-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">3. The Contrarian Trap</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The Mean-Revertor's Z-score spikes deeply negative (-3.0) as the price craters away from the historical 10-epoch Simple Moving Average. It blindly buys the dip, assuming the crash is a transient anomaly. Because the fundamental value has structurally shifted to $50, the Mean-Revertor bleeds immense cash buying a falling knife.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-rose-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">4. Margin Calls & Liquidations</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    As the price continues to drop, the Prospector and Mean-Revertor exhaust their cash reserves trying to catch the bottom. If they run out of money while holding massive underwater positions, the broker triggers a <strong>[MARGIN CALL]</strong>, forcing a chaotic liquidation.
                  </p>
                </div>
              </div>
            )}

            {/* Content: Systemic Shock */}
            {selectedScenario === 'shock' && (
              <div className="relative border-l border-white/10 ml-3 pl-6 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-blue-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <h6 className="font-bold text-zinc-200">1. The Rationalist Spikes the Bid</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The Rationalist's intrinsic value is pushed to $142.85. It suddenly sees the $100 price as a massive discount and immediately starts placing aggressive Buy Limit Orders, destroying the Ask side of the Limit Order Book.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-rose-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">2. Kinematic Amplification</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The sudden spike caused by the Rationalist triggers the Momentum trader. The discrete derivative <InlineMath math="\Delta P" /> blows past its threshold. The Momentum agent buys aggressively, exacerbating the upward shock and driving the price even higher.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-purple-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">3. Market Maker Squeeze</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The Market Maker suffers severe <em>Adverse Selection</em>. By constantly selling to the Rationalist and Momentum trader as the price rises, it accumulates a massive short position. As the price climbs higher, its short position plunges into heavy negative wealth.
                  </p>
                </div>
              </div>
            )}

            {/* Content: Flash Crash */}
            {selectedScenario === 'crash' && (
              <div className="relative border-l border-white/10 ml-3 pl-6 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-emerald-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                  <h6 className="font-bold text-zinc-200">1. Mean-Revertor Hyper-Sensitivity</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    By dropping the Z-Score threshold to 0.1, the Mean-Revertor begins short-selling at the absolute slightest upward tick, or aggressively buying at the slightest downward tick, providing a wall of toxic liquidity that combats any natural price discovery.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-rose-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">2. Momentum Lag (The Whales)</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    By maximizing the Momentum lookback window, the Momentum trader becomes a slow-moving whale. It ignores short-term noise but eventually hits a threshold based on a very old price. When it finally acts, it drops a massive, delayed order that shocks the hyper-sensitive Mean-Revertor.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-amber-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">3. Cascading Destabilization</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    Because the Mean-Revertor was over-leveraged fighting tiny noise, the delayed Momentum whale-order instantly pushes the Mean-Revertor into a Margin Call scenario, forcing them to liquidate and causing a violent, unnatural swing in the opposite direction.
                  </p>
                </div>
              </div>
            )}

            {/* Content: Liquidity Freeze */}
            {selectedScenario === 'freeze' && (
              <div className="relative border-l border-white/10 ml-3 pl-6 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-purple-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                  <h6 className="font-bold text-zinc-200">1. The Market Maker Panics</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    Maxing out the Inventory Penalty (<InlineMath math="\gamma = 0.5" />) makes the Market Maker absolutely terrified of holding any shares (long or short). If it holds just 2 shares, it will drastically lower its Bid price by a full $1.00 to avoid buying more.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-zinc-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">2. Spreads Widen (The Freeze)</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    Because the Market Maker is aggressively skewing its prices away from the current market price to shed inventory, the gap (spread) between the best Bid and best Ask widens massively.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-pink-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">3. Deadlock</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    With spreads so wide, the Noise Trader's slippage tolerance is no longer enough to cross the book. The Rationalist and Mean-Revertor's limit orders also sit unfilled in the chasm. Trading volume dries up completely as the market freezes.
                  </p>
                </div>
              </div>
            )}

            {/* Content: Retail FOMO */}
            {selectedScenario === 'fomo' && (
              <div className="relative border-l border-white/10 ml-3 pl-6 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-pink-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.8)]"></div>
                  <h6 className="font-bold text-zinc-200">1. The Retail Flood</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The Noise Trader probability is cranked to 100%, and their max volume triples. Suddenly, large, random market orders are hammering the limit order book every single epoch, chewing through the Market Maker's standing liquidity and forcing the price to jump erratically.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-rose-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">2. Momentum Chases Noise</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    Because the Momentum trader's lookback window was dropped to just 2 epochs and its threshold lowered, it becomes hyper-reactive. It misinterprets the random Retail Noise as a "trend" and starts aggressively buying the top of random spikes, exacerbating the volatility.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-purple-500 w-3 h-3 rounded-full"></div>
                  <h6 className="font-bold text-zinc-200">3. Market Maker Profits (But Sweats)</h6>
                  <p className="text-sm text-zinc-400 mt-1">
                    The Market Maker is earning massive spread fees from the constant retail flow. However, it is also being violently thrown into deep long and short inventory positions. If its inventory penalty is low, it risks bankruptcy; if it's high, it rides out the storm as the most profitable agent in the sim.
                  </p>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Section 3: Terminal State Matrix & Discussion */}
        <section>
          <h4 className="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            Terminal State Matrix
          </h4>

          <div className="bg-zinc-900/40 rounded-xl border border-white/5 overflow-hidden mb-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-800/50 text-xs uppercase font-mono text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Agent Strategy</th>
                  <th className="px-6 py-3 text-right">Wealth (MtM)</th>
                  <th className="px-6 py-3 text-right">ROI %</th>
                  <th className="px-6 py-3 text-right">Inventory</th>
                  <th className="px-6 py-3">Risk Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {sortedAgents.map((agent, i) => (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                      <span className="text-zinc-500">#{i + 1}</span>
                      <span className={
                        agent.id === 'Prospector' ? 'text-amber-400' :
                          agent.id === 'Rationalist' ? 'text-blue-400' :
                            agent.id === 'Momentum' ? 'text-rose-400' :
                              agent.id === 'MeanRevertor' ? 'text-emerald-400' :
                                agent.id === 'MarketMaker' ? 'text-purple-400' :
                                  'text-pink-400'
                      }>{agent.id}</span>
                    </td>
                    <td className="px-6 py-4 text-right">${agent.wealth.toFixed(2)}</td>
                    <td className={`px-6 py-4 text-right ${agent.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {agent.roi > 0 ? '+' : ''}{agent.roi.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right">{agent.inventory}</td>
                    <td className="px-6 py-4 text-zinc-400 font-sans text-xs">
                      {agent.id === 'Rationalist' ? 'Fundamental Anchor' :
                        agent.id === 'MarketMaker' ? 'Market Neutral / Liquidity' :
                          agent.id === 'Momentum' ? 'Trend Following / High Vol' :
                            agent.id === 'MeanRevertor' ? 'Contrarian / Mean-reversion' :
                              agent.id === 'NoiseTrader' ? 'Stochastic / Noise' :
                                'Behavioral / Biased'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none bg-zinc-900/30 p-6 rounded-xl border border-white/5">
            <h5 className="text-zinc-200 mt-0">Topics for Further Exploration</h5>
            <ul>
              <li>
                <strong>What happens if the Borrow Rate (Interest) is cranked to 5%?</strong><br />
                Holding a short position becomes incredibly expensive. Agents like the Mean-Revertor or Market Maker who accumulate negative inventory will bleed cash rapidly every single epoch. This dramatically accelerates Margin Calls, triggering forced buy-backs that result in violent "Short Squeezes."
              </li>
              <li>
                <strong>What happens if the Rationalist is removed?</strong><br />
                Without an agent anchoring the price to a fundamental intrinsic value, the market becomes susceptible to <em>hyper-inflationary momentum bubbles</em>. The Momentum trader chases phantom trends, and without a Rationalist to step in and sell the top of the bubble, the price diverges to infinity (or zero).
              </li>
              <li>
                <strong>What happens if the Noise Trader is muted (0% Probability)?</strong><br />
                A Limit Order Deadlock occurs. The Market Maker quotes at $99 and $101. The Rationalist expects the price to be $100. Without a chaotic retail trader willing to cross the spread and take the $101 ask, all the smart algorithms simply stare at each other waiting for the price to move, freezing the simulation.
              </li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
