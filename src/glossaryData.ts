export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  deepDive: {
    meaning: string;
    analogy: string;
    agentUsage: string;
  };
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Adverse Selection",
    definition: "The risk that a trader (like a Market Maker) takes the losing side of a trade against someone with better information or a strong directional trend.",
    category: "Market Microstructure",
    deepDive: {
      meaning: "In financial markets, adverse selection occurs when one party in a transaction has information the other does not, or when the market structure forces a liquidity provider to consistently trade against a massive, unstoppable trend. The liquidity provider ends up accumulating a position that immediately loses value.",
      analogy: "Imagine offering to buy umbrellas from anyone for $10, and sell them to anyone for $12. Suddenly, a torrential downpour starts. Everyone wants to buy your umbrellas for $12. You make a small profit, but now you have no umbrellas when they are actually worth $30. Alternatively, if a drought starts, everyone sells you their useless umbrellas for $10, and you are stuck holding inventory that is now worthless.",
      agentUsage: "The Market Maker agent is deeply vulnerable to this. If the Momentum trader or Rationalist knows the price is going to $150, they will relentlessly buy from the Market Maker's Asks at $101, $102, $103. The Market Maker earns a tiny spread fee but accumulates a massive short position that plunges into negative wealth. It uses the Inventory Penalty (γ) to try and mitigate this risk."
    }
  },
  {
    term: "Ask (Offer)",
    definition: "A limit order representing a seller's willingness to sell a specific quantity of an asset at a specific, minimum price.",
    category: "Trading Basics",
    deepDive: {
      meaning: "An Ask is half of the Limit Order Book equation. It is a standing, passive order that says, 'I am willing to part with my shares, but I will not accept a single penny less than X price.' Asks are always placed above the current market clearing price; otherwise, they would execute immediately as a market order.",
      analogy: "Think of listing your house for sale. You put it on the market with an asking price of $500,000. You are the 'seller' placing an 'Ask'. You won't accept $450,000, but if someone comes along and offers $500,000 (or more), the transaction occurs.",
      agentUsage: "Every agent uses Asks to exit long positions or enter short positions. The Rationalist places Asks when the market price exceeds its Intrinsic Value. The Market Maker constantly maintains Asks slightly above the current price to capture the spread."
    }
  },
  {
    term: "Avellaneda-Stoikov Model",
    definition: "A mathematical framework used by Market Makers to optimally set their Bid and Ask prices based on inventory risk.",
    category: "Algorithms",
    deepDive: {
      meaning: "Developed in 2008 by Marco Avellaneda and Sasha Stoikov, this model revolutionized high-frequency trading. It proves that a market maker shouldn't just quote symmetrically around the 'fair price'. Instead, they must calculate a 'Reservation Price'—a personal fair value that skews upwards or downwards depending on how much inventory they are holding, protecting them from bankruptcy.",
      analogy: "Imagine a used car dealer. If their lot is completely empty, they will bid aggressively (pay more) to buy cars, and price their current stock high. If their lot is overflowing with 100 unsold cars (toxic inventory), they will slash their selling prices to get rid of them, and refuse to buy any more unless someone offers them a ridiculous bargain.",
      agentUsage: "The Market Maker agent runs this exact formula every epoch: Reservation Price = Current Price - (Gamma * Inventory). It then places its Bids and Asks symmetrically around this new, skewed Reservation Price, dynamically managing its risk exposure."
    }
  },
  {
    term: "Bid",
    definition: "A limit order representing a buyer's willingness to buy a specific quantity of an asset at a specific, maximum price.",
    category: "Trading Basics",
    deepDive: {
      meaning: "A Bid is the counterpart to the Ask. It is a passive limit order stating, 'I want to acquire this asset, but I will pay no more than X price.' The highest Bid in the order book represents the maximum price any known buyer is currently willing to pay.",
      analogy: "Think of an auction for a painting. You raise your paddle and shout '$1,000!' You have just placed a Bid. You want the painting, but you are setting a strict ceiling on your willingness to pay.",
      agentUsage: "Agents place Bids to enter long positions or cover short positions. The Mean-Revertor places Bids when its Z-Score drops deeply negative, assuming the asset is temporarily oversold. The Market Maker constantly maintains Bids slightly below the current price."
    }
  },
  {
    term: "Borrow Rate (Interest)",
    definition: "The cost associated with holding a short position, usually charged by a broker to a short-seller.",
    category: "Short Selling",
    deepDive: {
      meaning: "When a trader shorts an asset, they don't actually own the shares they are selling. They must borrow them from a broker. The broker charges a continuous interest fee (a percentage of the total borrowed value) for the privilege of holding that borrowed asset.",
      analogy: "It's like renting a lawnmower from a hardware store to sell to your neighbor, hoping to buy a cheaper one later to return to the store. Every day you haven't returned a lawnmower to the store, they charge you a $5 rental fee. If it takes you too long, the rental fees will completely wipe out whatever profit you made from the sale.",
      agentUsage: "In the simulation, any agent with a negative inventory (like the Mean-Revertor or Market Maker) must pay the configurable Borrow Rate every single epoch. The cash is deducted directly from their wealth. High rates can quickly bankrupt an over-leveraged short seller."
    }
  },
  {
    term: "Clearing Price",
    definition: "The exact price at which a trade is executed when a Bid and an Ask cross in the Limit Order Book.",
    category: "Market Microstructure",
    deepDive: {
      meaning: "When a buyer's Bid price is equal to or greater than a seller's Ask price, a trade must occur. But what is the exact price? In many modern matching engines (and this simulation), it executes at the midpoint or the price of the resting limit order. This simulator calculates it as the exact average of the crossing Bid and Ask.",
      analogy: "You offer to buy a vintage watch for up to $120. A seller offers to part with it for as low as $100. You meet in the middle and shake hands at $110. Both parties leave feeling like they got a slightly better deal than their strict limit.",
      agentUsage: "The Continuous Double Auction engine calculates `(Bid + Ask) / 2.0` to determine the Clearing Price. It then instantly updates the global 'Current Market Price' on the dashboard to reflect this newly established equilibrium."
    }
  },
  {
    term: "Continuous Double Auction (CDA)",
    definition: "The matching mechanism used by almost all modern financial exchanges, processing Bids and Asks continuously.",
    category: "Market Microstructure",
    deepDive: {
      meaning: "Unlike a 'Call Auction' (where everyone submits orders secretly and the market executes them all at once at a specific time, like the market open), a CDA operates continuously. Orders are processed in real-time, and trades occur instantly the millisecond a Bid and an Ask overlap.",
      analogy: "Imagine a chaotic trading pit where buyers are constantly yelling out prices they want to pay, and sellers are yelling out prices they want to receive. The moment someone yells 'I'll pay $50!' and someone else yells 'I'll sell for $50!', a referee instantly rings a bell, swaps their assets, and updates the scoreboard for everyone to see.",
      agentUsage: "The simulator's core `stepEpoch` function is a pure implementation of a CDA. It takes every order from every agent, sorts the Bids descending, sorts the Asks ascending, and aggressively matches them until the spread is re-established."
    }
  },
  {
    term: "Derivative (Discrete)",
    definition: "The mathematical rate of change of the asset's price over a specific time window, measuring the velocity of a trend.",
    category: "Mathematics",
    deepDive: {
      meaning: "In calculus, a derivative measures how a function changes at a specific point. Because financial markets move in discrete 'ticks' or epochs rather than smooth continuous lines, we use a discrete derivative. It is simply the difference between the current price and a past price.",
      analogy: "If you are driving a car, your current location is your 'price'. The discrete derivative is your speedometer. It doesn't care where you are (whether you are in New York or LA), it only cares how fast you are moving and in what direction.",
      agentUsage: "The Momentum trader calculates `Current Price - Price[k epochs ago]`. If this velocity exceeds its Threshold parameter, the agent assumes a massive trend is underway and aggressively buys or sells to ride the momentum."
    }
  },
  {
    term: "Expected Utility Theory",
    definition: "A theory assuming agents make rational decisions based on calculating the expected payoff relative to fundamental value.",
    category: "Algorithms",
    deepDive: {
      meaning: "Classical economics assumes humans are perfectly rational actors who always seek to maximize their utility (wealth). In finance, this translates to assuming an asset has an objective 'fair value'. If the market price deviates from this value, a rational actor will trade to capture the guaranteed eventual return to equilibrium.",
      analogy: "If a $100 bill goes on sale for $80, a purely rational actor will buy as many as possible, knowing with absolute mathematical certainty that the underlying utility of the object is $100. They ignore the panic of the crowd selling it for $80.",
      agentUsage: "The Rationalist agent is governed entirely by Expected Utility. It completely ignores price trends, moving averages, and inventory risk. It only cares about the gap between the Current Price and its Intrinsic Value slider, acting as a gravitational anchor for the simulation."
    }
  },
  {
    term: "Flash Crash",
    definition: "A sudden, drastic drop in the market price of an asset, often caused by cascading algorithmic liquidations.",
    category: "Market Events",
    deepDive: {
      meaning: "Flash crashes occur when the market's liquidity suddenly evaporates while sell pressure remains high. This is often triggered by high-frequency algorithms turning off (widening spreads) or cascading margin calls forcing traders to sell at any price, causing the asset to plummet 5%, 10%, or more in a matter of seconds, before usually snapping back.",
      analogy: "Imagine a crowded theater where someone yells 'Fire!' Everyone rushes the exit (selling), but the doors are narrow (low liquidity). People are willing to drop all their belongings just to get out. Once the panic subsides and people realize there was no fire, they calmly walk back in to retrieve their items (the price rebounds).",
      agentUsage: "You can trigger this in the Scenario Deck. By dropping the Mean-Revertor's Z-Score threshold and maximizing the Momentum trader's lookback, the algorithms create a perfect storm of toxic liquidity and massive delayed sell orders that instantly crater the Limit Order Book."
    }
  },
  {
    term: "Gain Sensitivity (α)",
    definition: "A parameter in Prospect Theory dictating how quickly a trader wants to lock in a profit.",
    category: "Behavioral Economics",
    deepDive: {
      meaning: "In Kahneman and Tversky's value function, the alpha curve determines risk aversion in the domain of gains. Humans have a psychological need to secure a 'win', even if it mathematically makes more sense to let the profits run.",
      analogy: "You are on a game show. You've won $1,000. The host offers you a coin flip: heads you win $3,000, tails you lose everything. Even though the expected value of the flip is $1,500, a highly gain-sensitive person will refuse the flip and walk away with the $1,000 to ensure they don't leave empty-handed.",
      agentUsage: "The Prospector agent uses this parameter. If the slider is set very high, the moment the Prospector is up by even $0.50 on a trade, they will panic and place an Ask to sell and lock it in, completely missing out on larger, structural bull runs."
    }
  },
  {
    term: "Intrinsic Value",
    definition: "The perceived 'true' or fundamental value of an asset, derived from objective metrics rather than market sentiment.",
    category: "Trading Basics",
    deepDive: {
      meaning: "Intrinsic value is the core of fundamental analysis (e.g., discounted cash flow models). It asserts that an asset's price should reflect its actual ability to generate cash or utility, completely independent of whether the market is currently in a euphoric bubble or a depressive crash.",
      analogy: "A house has an intrinsic value based on the cost of its bricks, its square footage, and the rental income it can generate. If a neighborhood rumor causes everyone to offer $10 for the house, its market price is $10, but its intrinsic value is still hundreds of thousands of dollars.",
      agentUsage: "The Rationalist agent's entire strategy revolves around the Intrinsic Value slider. By changing this slider, you are telling the Rationalist that the underlying company just had a massive breakthrough or a terrible earnings report, and it will forcefully drag the rest of the market algorithms to that new price."
    }
  }
,
  {
    term: "Inventory Penalty (γ)",
    definition: "A parameter in the Avellaneda-Stoikov model dictating how fearful the Market Maker is of holding too much of the asset.",
    category: "Algorithms",
    deepDive: {
      meaning: "In algorithmic market making, holding inventory is dangerous because the price might crash while you own it. The gamma penalty is a mathematical fear factor. As the absolute value of the Market Maker's inventory grows, it exponentially skews its quotes to discourage traders from adding to its toxic position.",
      analogy: "A grocery store owner has 5,000 perishable apples and 0 bananas. They are terrified the apples will rot (the price will drop). They will slash the price of apples to get rid of them, and offer a premium to anyone who can supply them with bananas to balance their risk.",
      agentUsage: "If you slide the Inventory Penalty up to 0.50, the Market Maker becomes hyper-sensitive to holding risk. If it holds just 2 shares, it will drastically lower its Bid price to avoid buying more, widening the spread and potentially freezing the market."
    }
  },
  {
    term: "Kahneman-Tversky Prospect Theory",
    definition: "A behavioral economic theory describing how humans make decisions involving risk, proving they are not perfectly rational.",
    category: "Behavioral Economics",
    deepDive: {
      meaning: "This theory earned Daniel Kahneman the Nobel Prize. It mathematically maps the psychological asymmetry between winning and losing. Humans exhibit 'loss aversion' (pain of losing $100 > joy of winning $100) and evaluate outcomes relative to a reference point (like their average entry price), rather than absolute final wealth.",
      analogy: "You bought a concert ticket for $100. You discover it is currently reselling for $300 online. A rational actor would sell it for $300 if they wouldn't pay $300 to go to the concert. But prospect theory explains the 'Endowment Effect': because you already own the ticket, the idea of giving it up feels like a loss of $300, even though you only paid $100, so you refuse to sell it.",
      agentUsage: "The Prospector agent uses the exact Kahneman-Tversky piecewise function `v(x)` to evaluate its unrealized Profit & Loss. It becomes paralyzed when holding underwater positions (refusing to cut losses) and anxious when holding winning positions (selling too early)."
    }
  },
  {
    term: "Limit Order Book (LOB)",
    definition: "A real-time, electronic ledger that records all outstanding Bids (buy orders) and Asks (sell orders) for an asset.",
    category: "Market Microstructure",
    deepDive: {
      meaning: "The LOB is the beating heart of modern finance. It is an organized queue of all passive trading intent. It provides 'market depth', showing not just the current price, but how much volume is available to buy or sell at every single price point above and below the current equilibrium.",
      analogy: "Think of an old-school bulletin board in a town square where people post index cards saying 'I want to buy 5 chickens for $2 each' or 'I want to sell 10 chickens for $3 each'. The LOB is the digital version of this board, sorting everyone's cards so the best deals are always at the very top.",
      agentUsage: "Every agent in the simulation interacts with the LOB. The Market Maker populates both sides to capture the spread, while the Rationalist populates only one side based on its fundamental valuation."
    }
  },
  {
    term: "Loss Aversion (λ)",
    definition: "A parameter in Prospect Theory representing a trader's extreme psychological reluctance to realize a loss.",
    category: "Behavioral Economics",
    deepDive: {
      meaning: "Loss aversion is the cognitive bias that makes the psychological impact of losing significantly more severe than the impact of winning an equivalent amount. This leads to the 'Disposition Effect', where traders hold onto losing investments far too long, hoping they rebound to avoid the psychological pain of hitting the 'sell' button at a loss.",
      analogy: "You enter a casino with $500. You lose $400 in the first hour. Instead of cutting your losses and leaving with $100, the pain of being down $400 drives you to make reckless, high-risk bets with your last $100 in a desperate attempt to get back to 'even'.",
      agentUsage: "The Prospector agent's loss aversion slider dictates how stubbornly they hold onto losers. A high value means they will aggressively buy more shares of a crashing stock to 'average down' their entry price, becoming a toxic liquidity sponge until they go bankrupt."
    }
  },
  {
    term: "Margin Call",
    definition: "A forced liquidation by a broker when a trader's cash reserves can no longer safely cover their borrowed positions.",
    category: "Short Selling",
    deepDive: {
      meaning: "When you trade on margin or short sell, you are using the broker's money or shares. The broker demands you keep a 'maintenance margin' (a cash buffer) to ensure you can cover your debts. If the market moves aggressively against you, your buffer shrinks. If it falls below the minimum, the broker steps in, takes control of your account, and forcibly closes your position at whatever the current market price is.",
      analogy: "You take out a mortgage to buy a house, putting down 20%. The housing market crashes, and your house is suddenly worth less than the loan amount. The bank issues a margin call, demanding you deposit more cash immediately. If you can't, they foreclose on your house and sell it at a massive loss.",
      agentUsage: "If an agent (like the Mean-Revertor or Market Maker) accumulates massive negative inventory, and the price suddenly spikes, their required margin skyrockets. The simulator checks their cash buffer every epoch. If it fails, they are instantly liquidated, causing a massive forced buy order."
    }
  },
  {
    term: "Mark-to-Market (MtM)",
    definition: "A method of measuring the fair value of an account by valuing its open positions at the current market price.",
    category: "Trading Basics",
    deepDive: {
      meaning: "In fast-moving markets, your true wealth is not just the cash in your account, but the immediate liquidation value of all your assets. Mark-to-Market accounting continuously updates the value of a portfolio based on the latest Closing Price, regardless of what the trader originally paid for the assets.",
      analogy: "You have $10,000 in your bank account and own 10 bars of gold you bought for $1,000 each. The price of gold plummets to $500. Your raw cash is still $10,000, but your Mark-to-Market wealth is now $15,000 (Cash + Current Value of Gold). You feel poorer because on paper, you are.",
      agentUsage: "The Agent Wealth Race chart tracks the MtM value of all 6 agents every single epoch. It is calculated identically for everyone: `Cash + (Inventory * Current Market Price)`."
    }
  },
  {
    term: "Mean Reversion",
    definition: "A financial theory suggesting that asset prices will eventually return (revert) to their long-term historical average or mean.",
    category: "Algorithms",
    deepDive: {
      meaning: "This strategy relies on the assumption that markets overreact to news in the short term, but eventually snap back to reality. It involves identifying an asset's historical average and betting against extreme deviations from that average.",
      analogy: "Imagine a dog on a long leash walking in a park. The owner walking a straight line is the 'Moving Average'. The dog might suddenly sprint far to the left to chase a squirrel, or far to the right to sniff a tree, but eventually, the leash pulls taut and the dog must return (revert) back to the owner's path.",
      agentUsage: "The Mean-Revertor agent calculates a Simple Moving Average (SMA) and a standard deviation. If the price jumps too high above the SMA, it shorts the asset. If the price drops too far below the SMA, it buys it, providing liquidity but leaving itself vulnerable to structural paradigm shifts."
    }
  },
  {
    term: "Short Selling",
    definition: "A strategy used to profit from a falling price by borrowing shares, selling them, and buying them back cheaper.",
    category: "Short Selling",
    deepDive: {
      meaning: "When you believe an asset is overpriced, you can short sell it. This involves borrowing shares from someone who owns them (for a fee), immediately selling those borrowed shares on the open market, and keeping the cash. Later, you must buy the shares back to return them to the lender. Your profit is the difference between the high selling price and the low buying price.",
      analogy: "You know the latest iPhone is selling for $1,000 today, but a new model comes out next week, so the old one will drop to $800. You borrow your friend's new iPhone today, sell it for $1,000, keep the cash, and next week you buy a replacement for $800 to give back to your friend. You just made $200 in profit.",
      agentUsage: "Agents holding negative inventory (like -5 units) are currently short selling. If the Rationalist sees the market price spike above its Intrinsic Value, it will continuously short sell into the rally to force the price back down to equilibrium."
    }
  },
  {
    term: "Short Squeeze",
    definition: "A rapid increase in the price of an asset that occurs when there is a lack of supply and an excess of demand from short sellers who are being forced to cover.",
    category: "Market Events",
    deepDive: {
      meaning: "A short squeeze is a terrifying event for bears. When heavily shorted stock starts rising unexpectedly, short sellers begin taking massive losses. Their brokers issue Margin Calls, forcing them to buy back shares immediately. This flood of forced buying drives the price even higher, triggering more margin calls, creating a vicious, self-sustaining loop of explosive upward price action.",
      analogy: "Imagine a room full of people who all borrowed their neighbor's car and sold it. Suddenly, everyone's neighbor demands their car back right now. There are only two cars available for sale in town. The price of those two cars is going to skyrocket because the borrowers are absolutely desperate and legally obligated to buy them at any price.",
      agentUsage: "If you crank the global Borrow Rate (Interest) slider to 5%, any agent with negative inventory (like the Mean-Revertor) will rapidly bleed cash. This triggers Margin Calls much faster, forcing them to buy back their shorts and causing massive upward spikes on the Price Action chart."
    }
  },
  {
    term: "Slippage",
    definition: "The difference between the expected price of a trade and the price at which the trade is actually executed.",
    category: "Market Microstructure",
    deepDive: {
      meaning: "Slippage occurs during periods of high volatility or when a trader submits a market order that is larger than the available volume at the best Bid/Ask price. The order 'slips' down the Limit Order Book, chewing through worse and worse prices until it is fully filled.",
      analogy: "You see a sign for 'Gas $2.00 a gallon'. You pull in, but by the time you reach the pump, the sign changes to $2.10. You need gas to get to work, so you accept the $2.10 price. You just experienced 10 cents of slippage.",
      agentUsage: "The Noise Trader accepts a random amount of slippage (1% to 3%) to ensure its market orders cross the Market Maker's spread. It acts as a market-taker, sacrificing price for immediate execution speed."
    }
  },
  {
    term: "Spread",
    definition: "The price gap between the highest Bid (what a buyer is willing to pay) and the lowest Ask (what a seller is willing to accept).",
    category: "Market Microstructure",
    deepDive: {
      meaning: "The spread is the primary source of profit for Market Makers and the primary transaction cost for retail investors. A narrow ('tight') spread indicates a highly liquid, efficient market where buyers and sellers agree on value. A wide spread indicates uncertainty, fear, or a lack of liquidity.",
      analogy: "A currency exchange booth at an airport offers to buy your Euros for $1.00 each, but will sell you Euros for $1.10 each. The $0.10 difference is the spread. It is the cost of doing business and the profit margin for the booth.",
      agentUsage: "The Market Maker agent quotes a Spread Width (δ) around its Reservation Price. If you increase the Inventory Penalty (γ) during a 'Liquidity Freeze' scenario, the Market Maker becomes terrified of risk and drastically widens its spread to protect itself."
    }
  },
  {
    term: "Statistical Arbitrage (Stat-Arb)",
    definition: "A quantitative trading strategy that employs complex mathematical models to identify pricing inefficiencies.",
    category: "Algorithms",
    deepDive: {
      meaning: "Stat-Arb relies on the law of large numbers and heavy statistical modeling (like cointegration or mean-reversion) to find tiny pricing anomalies across correlated assets or historical averages. It assumes these anomalies will eventually correct themselves.",
      analogy: "Imagine two perfectly synchronized clocks ticking side by side. Suddenly, one clock ticks a second faster. A stat-arb trader bets that the fast clock is broken and will eventually slow down to match the other clock, profiting from the eventual resynchronization.",
      agentUsage: "The Mean-Revertor is our Stat-Arb agent. It tracks the historical Simple Moving Average (SMA) and calculates how many standard deviations the current price has drifted. When the Z-Score hits the critical threshold, it pounces on the perceived inefficiency."
    }
  },
  {
    term: "Z-Score",
    definition: "A statistical measurement describing a value's relationship to the mean (average) of a group of values, measured in terms of standard deviations.",
    category: "Mathematics",
    deepDive: {
      meaning: "In finance, a Z-score tells you exactly how extreme a price move is relative to its recent historical volatility. A Z-score of 0 means the price is exactly average. A Z-score of +3.0 means the price has spiked so high it represents a 99.7% statistical anomaly, making it an incredibly rare event.",
      analogy: `If the average height of a man is 5'9", a man who is 5'10" has a low Z-score. He is slightly taller than average, but completely normal. A man who is 7'2" has a massive Z-score. He is an extreme statistical outlier.`,
      agentUsage: "The Mean-Revertor agent uses the Z-Score Threshold slider. A low threshold (e.g., 0.5) makes the agent hyper-reactive, trading on minor fluctuations. A high threshold (e.g., 3.0) means the agent waits patiently for extreme 'Flash Crash' style anomalies before deploying its capital."
    }
  }
].sort((a, b) => a.term.localeCompare(b.term));