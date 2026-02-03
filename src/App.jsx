import React, { useState, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Play, Settings, TrendingUp, Shield, Zap, Target, RefreshCw, CheckCircle, BarChart3, PieChart, DollarSign, AlertTriangle, TrendingDown, Info } from 'lucide-react';

const SP500_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK-B',
  'JPM', 'V', 'WMT', 'JNJ', 'PG', 'XOM', 'KO', 'DIS', 'MCD', 'NFLX',
  'BA', 'IBM', 'INTC', 'AMD', 'CSCO', 'ADBE', 'ORCL', 'CRM', 'PYPL',
  'UBER', 'SPOT', 'SQ', 'F', 'GM', 'T', 'PFE', 'AEP', 'DUK', 'NEE',
  'CVX', 'HD', 'MA', 'UNH', 'PEP', 'COST', 'AVGO', 'LLY'
];

const RISK_FREE_RATE = 0.04;

// Real-time analyst data based on latest financial news and forecasts (Feb 2025)
const STOCK_ANALYSIS_DATA = {
  'AAPL': {
    currentPrice: 255.56,
    targetPrice: 292.22,
    entryPrice: 240,
    rating: 'Buy',
    analystCount: 30,
    upside: 14.36,
    reasoning: 'AI integration with Siri via Gemini partnership; iPhone 17 strong momentum; Creator Studio launch expanding services revenue. Entry at support level near $240 offers favorable risk/reward.',
    sentiment: 'Bullish',
    catalysts: ['AI upgrades', 'iPhone 17', 'Services growth']
  },
  'MSFT': {
    currentPrice: 423.37,
    targetPrice: 603.47,
    entryPrice: 400,
    rating: 'Strong Buy',
    analystCount: 35,
    upside: 42.54,
    reasoning: 'Azure cloud leadership; Copilot AI monetization accelerating; 54/56 analysts rate Buy. Deep pullback to $400 provides excellent entry with 50%+ upside potential.',
    sentiment: 'Very Bullish',
    catalysts: ['Azure growth', 'Copilot AI', 'Enterprise spending']
  },
  'GOOGL': {
    currentPrice: 195.50,
    targetPrice: 347.70,
    entryPrice: 185,
    rating: 'Buy',
    analystCount: 33,
    upside: 77.8,
    reasoning: 'Google Cloud firing on all cylinders; Search & YouTube ad trends solid; potential AI glasses launch. Entry near $185 support captures significant upside.',
    sentiment: 'Bullish',
    catalysts: ['Cloud growth', 'AI products', 'YouTube']
  },
  'AMZN': {
    currentPrice: 239.15,
    targetPrice: 296.79,
    entryPrice: 225,
    rating: 'Strong Buy',
    analystCount: 45,
    upside: 24.02,
    reasoning: 'AWS revenue growth 24% in FY26; retail margins benefiting from automation; 94% analyst Buy rating. Entry below $230 captures cloud & retail tailwinds.',
    sentiment: 'Very Bullish',
    catalysts: ['AWS growth', 'Retail automation', 'Anthropic partnership']
  },
  'NVDA': {
    currentPrice: 186.24,
    targetPrice: 262.79,
    entryPrice: 175,
    rating: 'Strong Buy',
    analystCount: 40,
    upside: 37.49,
    reasoning: 'AI infrastructure boom continues; Rubin chip cycle ahead; Q3 revenue up 26% to $57B. Entry near $175 provides margin of safety for AI dominance play.',
    sentiment: 'Very Bullish',
    catalysts: ['Rubin GPUs', 'Data center demand', 'Eli Lilly AI lab']
  },
  'TSLA': {
    currentPrice: 459.24,
    targetPrice: 394.07,
    entryPrice: 350,
    rating: 'Hold',
    analystCount: 33,
    upside: -14.18,
    reasoning: 'Deliveries improving; Robotaxi potential; but valuation stretched. 13 Buy/12 Hold/9 Sell split. Wait for pullback to $350 for better entry given volatility.',
    sentiment: 'Mixed',
    catalysts: ['Robotaxi launch', 'New models', 'FSD progress']
  },
  'META': {
    currentPrice: 728.56,
    targetPrice: 856.18,
    entryPrice: 680,
    rating: 'Strong Buy',
    analystCount: 73,
    upside: 17.5,
    reasoning: 'AI-first ARR now ~33% of business; Q4 earnings beat with 10%+ surge; Llama AI momentum. Entry below $700 captures AI transformation upside.',
    sentiment: 'Very Bullish',
    catalysts: ['AI monetization', 'Llama growth', 'Reality Labs']
  },
  'JPM': {
    currentPrice: 297.72,
    targetPrice: 347.35,
    entryPrice: 280,
    rating: 'Buy',
    analystCount: 21,
    upside: 16.67,
    reasoning: 'Strongest bank fundamentals; AI investment ramp; diversified revenue streams. Entry near $280 provides value with solid 3%+ dividend yield.',
    sentiment: 'Bullish',
    catalysts: ['NII growth', 'AI efficiency', 'Deregulation']
  },
  'V': {
    currentPrice: 340.04,
    targetPrice: 400.47,
    entryPrice: 320,
    rating: 'Strong Buy',
    analystCount: 25,
    upside: 21.50,
    reasoning: 'Global payments leader; 4.5B cards issued; scalable network model. Despite DOJ scrutiny, entry at $320 offers strong risk-adjusted returns.',
    sentiment: 'Bullish',
    catalysts: ['Cross-border volume', 'Digital payments', 'Emerging markets']
  },
  'WMT': {
    currentPrice: 119.70,
    targetPrice: 121.20,
    entryPrice: 110,
    rating: 'Strong Buy',
    analystCount: 30,
    upside: 1.25,
    reasoning: 'E-commerce & advertising growth engines; defensive positioning; automation investments. Entry below $115 attractive for long-term compounding.',
    sentiment: 'Bullish',
    catalysts: ['E-commerce', 'Advertising', 'Automation']
  },
  'JNJ': {
    currentPrice: 145.80,
    targetPrice: 172.00,
    entryPrice: 140,
    rating: 'Buy',
    analystCount: 18,
    upside: 18.0,
    reasoning: 'Diversified healthcare leader; strong pipeline post-Kenvue spinoff; defensive dividend play. Entry at $140 support provides value with 3%+ yield.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Pipeline drugs', 'MedTech growth', 'Dividend stability']
  },
  'DIS': {
    currentPrice: 109.59,
    targetPrice: 136.00,
    entryPrice: 100,
    rating: 'Strong Buy',
    analystCount: 14,
    upside: 30.21,
    reasoning: 'Streaming profitability improving; Avatar/Avengers sequels pipeline; parks resilient. Entry at $100 captures turnaround potential.',
    sentiment: 'Bullish',
    catalysts: ['Streaming profits', 'Content pipeline', 'Park expansion']
  },
  'AMD': {
    currentPrice: 231.84,
    targetPrice: 245.00,
    entryPrice: 210,
    rating: 'Strong Buy',
    analystCount: 34,
    upside: 5.68,
    reasoning: 'MI455 GPUs competitive with NVDA; EPYC server dominance; OpenAI partnership. Entry below $215 captures AI acceleration opportunity.',
    sentiment: 'Bullish',
    catalysts: ['AI chips', 'Server CPUs', 'Oracle partnership']
  },
  'ADBE': {
    currentPrice: 296.17,
    targetPrice: 420.35,
    entryPrice: 280,
    rating: 'Buy',
    analystCount: 20,
    upside: 41.95,
    reasoning: 'AI-infused Creative Cloud; 90% gross margins; trading near multi-year lows. Entry below $290 offers deep value for quality compounder.',
    sentiment: 'Bullish',
    catalysts: ['Firefly AI', 'Creative Cloud', 'Document Cloud']
  },
  'MA': {
    currentPrice: 555.37,
    targetPrice: 672.12,
    entryPrice: 520,
    rating: 'Strong Buy',
    analystCount: 17,
    upside: 21.02,
    reasoning: 'Cross-border volume growth; value-added services expansion; crypto partnerships. Entry at $520 captures payment network moat.',
    sentiment: 'Very Bullish',
    catalysts: ['Cross-border growth', 'Value-added services', 'Digital wallet']
  },
  'NFLX': {
    currentPrice: 958.00,
    targetPrice: 1050.00,
    entryPrice: 900,
    rating: 'Buy',
    analystCount: 32,
    upside: 9.6,
    reasoning: 'Ad-tier momentum; live sports expansion; password sharing crackdown success. Entry below $920 offers growth at reasonable premium.',
    sentiment: 'Bullish',
    catalysts: ['Ad tier growth', 'Live sports', 'Gaming']
  },
  'XOM': {
    currentPrice: 138.40,
    targetPrice: 145.00,
    entryPrice: 130,
    rating: 'Buy',
    analystCount: 23,
    upside: 4.8,
    reasoning: 'Integrated oil major with strong FCF; Permian Basin growth; Guyana production ramp. Entry below $135 provides yield + upside.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Guyana production', 'Permian growth', 'Cost discipline']
  },
  'HD': {
    currentPrice: 395.00,
    targetPrice: 445.00,
    entryPrice: 370,
    rating: 'Buy',
    analystCount: 28,
    upside: 12.7,
    reasoning: 'Pro segment strength; housing repair demand resilient; share gains from competitors. Entry at $370 captures housing cycle recovery.',
    sentiment: 'Bullish',
    catalysts: ['Pro segment', 'Housing recovery', 'Market share']
  },
  'COST': {
    currentPrice: 935.00,
    targetPrice: 1020.00,
    entryPrice: 880,
    rating: 'Buy',
    analystCount: 25,
    upside: 9.1,
    reasoning: 'Membership model provides recurring revenue; e-commerce growth; international expansion. Entry below $900 attractive despite premium valuation.',
    sentiment: 'Bullish',
    catalysts: ['Membership fees', 'E-commerce', 'International']
  },
  'CRM': {
    currentPrice: 318.50,
    targetPrice: 380.00,
    entryPrice: 295,
    rating: 'Buy',
    analystCount: 42,
    upside: 19.3,
    reasoning: 'Agentforce AI platform launch; Data Cloud momentum; margin expansion. Entry below $300 captures enterprise AI wave.',
    sentiment: 'Bullish',
    catalysts: ['Agentforce AI', 'Data Cloud', 'Margin expansion']
  },
  'INTC': {
    currentPrice: 20.15,
    targetPrice: 28.00,
    entryPrice: 18,
    rating: 'Hold',
    analystCount: 35,
    upside: 39.0,
    reasoning: 'Foundry turnaround underway but uncertain; AI PC opportunity; government subsidies. High-risk entry below $18 for speculative upside.',
    sentiment: 'Mixed',
    catalysts: ['Foundry progress', 'AI PCs', 'CHIPS Act']
  },
  'PG': {
    currentPrice: 168.50,
    targetPrice: 185.00,
    entryPrice: 160,
    rating: 'Buy',
    analystCount: 22,
    upside: 9.8,
    reasoning: 'Defensive consumer staples leader; pricing power; dividend aristocrat. Entry at $160 offers quality at reasonable value.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Pricing power', 'Emerging markets', 'Innovation']
  },
  'KO': {
    currentPrice: 62.50,
    targetPrice: 70.00,
    entryPrice: 58,
    rating: 'Buy',
    analystCount: 20,
    upside: 12.0,
    reasoning: 'Global beverage leader; strong brand portfolio; consistent dividend growth. Entry below $60 provides defensive yield play.',
    sentiment: 'Bullish',
    catalysts: ['Pricing', 'Zero sugar growth', 'Emerging markets']
  },
  'ORCL': {
    currentPrice: 168.00,
    targetPrice: 200.00,
    entryPrice: 155,
    rating: 'Buy',
    analystCount: 30,
    upside: 19.0,
    reasoning: 'Cloud infrastructure gaining share; OCI AI workloads growing; database leadership. Entry at $155 captures cloud transformation.',
    sentiment: 'Bullish',
    catalysts: ['OCI growth', 'AI workloads', 'Multi-cloud']
  },
  'PYPL': {
    currentPrice: 88.50,
    targetPrice: 105.00,
    entryPrice: 80,
    rating: 'Buy',
    analystCount: 38,
    upside: 18.6,
    reasoning: 'Turnaround underway; Venmo monetization; checkout improvements. Entry below $85 offers value for digital payments recovery.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Venmo growth', 'Checkout improvements', 'Cost cuts']
  },
  'CSCO': {
    currentPrice: 59.50,
    targetPrice: 68.00,
    entryPrice: 55,
    rating: 'Buy',
    analystCount: 25,
    upside: 14.3,
    reasoning: 'Networking infrastructure benefiting from AI data centers; Splunk integration; solid dividend. Entry at $55 provides tech value.',
    sentiment: 'Bullish',
    catalysts: ['AI networking', 'Splunk synergies', 'Security']
  },
  'BRK-B': {
    currentPrice: 475.00,
    targetPrice: 520.00,
    entryPrice: 450,
    rating: 'Buy',
    analystCount: 8,
    upside: 9.5,
    reasoning: 'Record cash pile; insurance profits strong; diversified conglomerate. Entry at $450 provides Buffett quality at fair value.',
    sentiment: 'Bullish',
    catalysts: ['Insurance profits', 'Capital deployment', 'Operating businesses']
  },
  'MCD': {
    currentPrice: 298.00,
    targetPrice: 330.00,
    entryPrice: 280,
    rating: 'Buy',
    analystCount: 30,
    upside: 10.7,
    reasoning: 'Digital sales growth; franchise model resilient; global footprint. Entry below $285 offers defensive growth at reasonable value.',
    sentiment: 'Bullish',
    catalysts: ['Digital/loyalty', 'Menu innovation', 'Unit growth']
  },
  'BA': {
    currentPrice: 178.00,
    targetPrice: 210.00,
    entryPrice: 160,
    rating: 'Hold',
    analystCount: 25,
    upside: 18.0,
    reasoning: 'Production ramp ongoing; safety concerns lingering; cash burn elevated. High-risk entry below $165 for turnaround speculation.',
    sentiment: 'Mixed',
    catalysts: ['Production ramp', 'Backlog delivery', 'Safety resolution']
  },
  'IBM': {
    currentPrice: 258.00,
    targetPrice: 280.00,
    entryPrice: 240,
    rating: 'Buy',
    analystCount: 18,
    upside: 8.5,
    reasoning: 'Watsonx AI platform traction; consulting growth; hybrid cloud strength. Entry at $240 provides AI exposure with 3%+ dividend.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Watsonx AI', 'Consulting', 'Hybrid cloud']
  },
  'PFE': {
    currentPrice: 26.50,
    targetPrice: 32.00,
    entryPrice: 24,
    rating: 'Hold',
    analystCount: 22,
    upside: 20.8,
    reasoning: 'Post-COVID normalization; pipeline uncertainty; dividend yield attractive. Entry below $25 offers value for patient investors.',
    sentiment: 'Mixed',
    catalysts: ['Pipeline results', 'Cost cuts', 'Acquisitions']
  },
  'UBER': {
    currentPrice: 72.00,
    targetPrice: 95.00,
    entryPrice: 65,
    rating: 'Strong Buy',
    analystCount: 40,
    upside: 31.9,
    reasoning: 'Mobility & delivery profitability improving; advertising revenue scaling; AV optionality. Entry at $65 captures platform growth.',
    sentiment: 'Very Bullish',
    catalysts: ['Profitability', 'Advertising', 'Autonomous vehicles']
  },
  'SPOT': {
    currentPrice: 605.00,
    targetPrice: 700.00,
    entryPrice: 550,
    rating: 'Buy',
    analystCount: 28,
    upside: 15.7,
    reasoning: 'Subscriber growth steady; podcast monetization improving; margin expansion. Entry below $560 captures audio streaming leader.',
    sentiment: 'Bullish',
    catalysts: ['Subscriber growth', 'Podcasts', 'Margins']
  },
  'SQ': {
    currentPrice: 78.00,
    targetPrice: 95.00,
    entryPrice: 70,
    rating: 'Buy',
    analystCount: 35,
    upside: 21.8,
    reasoning: 'Cash App ecosystem growing; seller GPV recovery; Bitcoin optionality. Entry at $70 provides fintech recovery play.',
    sentiment: 'Bullish',
    catalysts: ['Cash App', 'Seller recovery', 'Bitcoin']
  },
  'F': {
    currentPrice: 10.20,
    targetPrice: 13.00,
    entryPrice: 9,
    rating: 'Buy',
    analystCount: 20,
    upside: 27.5,
    reasoning: 'F-150 Lightning demand; Pro segment strength; EV losses narrowing. Entry below $9.50 offers deep value with 5%+ yield.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['EV progress', 'Pro segment', 'Cost cuts']
  },
  'GM': {
    currentPrice: 52.00,
    targetPrice: 62.00,
    entryPrice: 48,
    rating: 'Buy',
    analystCount: 18,
    upside: 19.2,
    reasoning: 'Ultium platform scaling; Cruise restructuring; strong truck demand. Entry below $50 captures auto recovery value.',
    sentiment: 'Bullish',
    catalysts: ['EV scaling', 'Truck demand', 'Cruise progress']
  },
  'T': {
    currentPrice: 22.80,
    targetPrice: 26.00,
    entryPrice: 21,
    rating: 'Buy',
    analystCount: 22,
    upside: 14.0,
    reasoning: 'Fiber buildout driving growth; wireless steady; 6%+ dividend yield attractive. Entry at $21 provides income play.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Fiber growth', '5G expansion', 'Cost discipline']
  },
  'AEP': {
    currentPrice: 98.00,
    targetPrice: 108.00,
    entryPrice: 92,
    rating: 'Buy',
    analystCount: 15,
    upside: 10.2,
    reasoning: 'Regulated utility with rate base growth; renewable investments; 4%+ dividend. Entry at $92 offers defensive income.',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Rate base growth', 'Renewables', 'Data center demand']
  },
  'DUK': {
    currentPrice: 112.00,
    targetPrice: 125.00,
    entryPrice: 105,
    rating: 'Buy',
    analystCount: 14,
    upside: 11.6,
    reasoning: 'Southeast utility growth; clean energy transition; stable regulated returns. Entry at $105 provides defensive yield.',
    sentiment: 'Bullish',
    catalysts: ['Rate base', 'Renewables', 'Grid modernization']
  },
  'NEE': {
    currentPrice: 74.00,
    targetPrice: 85.00,
    entryPrice: 68,
    rating: 'Buy',
    analystCount: 18,
    upside: 14.9,
    reasoning: 'Largest US renewable energy producer; FPL regulated utility; growth + income. Entry below $70 captures clean energy leader.',
    sentiment: 'Bullish',
    catalysts: ['Renewables growth', 'Data center power', 'FPL rate base']
  },
  'CVX': {
    currentPrice: 152.00,
    targetPrice: 170.00,
    entryPrice: 145,
    rating: 'Buy',
    analystCount: 22,
    upside: 11.8,
    reasoning: 'Permian Basin growth; LNG exports increasing; strong FCF and dividend. Entry at $145 provides energy value with 4%+ yield.',
    sentiment: 'Bullish',
    catalysts: ['Permian growth', 'LNG', 'Hess acquisition']
  },
  'UNH': {
    currentPrice: 520.00,
    targetPrice: 620.00,
    entryPrice: 480,
    rating: 'Strong Buy',
    analystCount: 24,
    upside: 19.2,
    reasoning: 'Healthcare giant with Optum diversification; aging demographics tailwind; consistent compounder. Entry at $480 captures quality.',
    sentiment: 'Very Bullish',
    catalysts: ['Optum growth', 'Medicare Advantage', 'Tech investments']
  },
  'PEP': {
    currentPrice: 152.00,
    targetPrice: 175.00,
    entryPrice: 145,
    rating: 'Buy',
    analystCount: 20,
    upside: 15.1,
    reasoning: 'Snacks & beverages diversification; Frito-Lay strength; international growth. Entry at $145 provides defensive quality.',
    sentiment: 'Bullish',
    catalysts: ['Frito-Lay', 'International', 'Pricing power']
  },
  'AVGO': {
    currentPrice: 235.00,
    targetPrice: 280.00,
    entryPrice: 215,
    rating: 'Strong Buy',
    analystCount: 30,
    upside: 19.1,
    reasoning: 'AI networking leader; VMware integration; custom AI chip wins. Entry at $215 captures semiconductor AI play.',
    sentiment: 'Very Bullish',
    catalysts: ['AI networking', 'VMware synergies', 'Custom silicon']
  },
  'LLY': {
    currentPrice: 780.00,
    targetPrice: 950.00,
    entryPrice: 720,
    rating: 'Strong Buy',
    analystCount: 25,
    upside: 21.8,
    reasoning: 'GLP-1 dominance with Mounjaro/Zepbound; Alzheimers drug potential; best-in-class pipeline. Entry at $720 captures pharma winner.',
    sentiment: 'Very Bullish',
    catalysts: ['GLP-1 demand', 'Pipeline', 'Manufacturing expansion']
  }
};

// Helper function to get analysis data for a stock
const getStockAnalysis = (ticker) => {
  return STOCK_ANALYSIS_DATA[ticker] || {
    currentPrice: 100,
    targetPrice: 110,
    entryPrice: 95,
    rating: 'Hold',
    analystCount: 10,
    upside: 10,
    reasoning: 'Limited analyst coverage. Consider broader market conditions and sector trends.',
    sentiment: 'Neutral',
    catalysts: ['Market conditions']
  };
};

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

const generateStockReturns = (numStocks, numDays, seed) => {
  const rng = new SeededRandom(seed);
  const returns = [];
  
  for (let day = 0; day < numDays; day++) {
    const dayReturns = [];
    for (let stock = 0; stock < numStocks; stock++) {
      const u1 = Math.max(0.0001, rng.next());
      const u2 = rng.next();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const dailyReturn = 0.0004 + z * 0.02;
      dayReturns.push(dailyReturn);
    }
    returns.push(dayReturns);
  }
  
  return returns;
};

const calculateMeanReturns = (returns) => {
  const numStocks = returns[0].length;
  const numDays = returns.length;
  const means = new Array(numStocks).fill(0);
  
  returns.forEach(day => {
    day.forEach((ret, i) => { means[i] += ret; });
  });
  
  return means.map(m => (m / numDays) * 252);
};

const calculateCovMatrix = (returns) => {
  const numStocks = returns[0].length;
  const numDays = returns.length;
  
  const means = returns[0].map((_, i) => 
    returns.reduce((sum, day) => sum + day[i], 0) / numDays
  );
  
  const cov = Array(numStocks).fill(null).map(() => Array(numStocks).fill(0));
  
  for (let i = 0; i < numStocks; i++) {
    for (let j = 0; j < numStocks; j++) {
      let sum = 0;
      returns.forEach(day => { sum += (day[i] - means[i]) * (day[j] - means[j]); });
      cov[i][j] = (sum / (numDays - 1)) * 252;
    }
  }
  
  return cov;
};

const portfolioStats = (weights, meanReturns, covMatrix) => {
  const ret = weights.reduce((sum, w, i) => sum + w * meanReturns[i], 0);
  
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  const vol = Math.sqrt(Math.max(variance, 0.0001));
  const sharpe = (ret - RISK_FREE_RATE) / vol;
  
  return { return: ret, volatility: vol, sharpe_ratio: sharpe };
};

const generateRandomWeights = (n, rng) => {
  const weights = [];
  for (let i = 0; i < n; i++) { 
    weights.push(rng.next()); 
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
};

const minimizeVariance = (meanReturns, covMatrix, seed) => {
  const n = meanReturns.length;
  const rng = new SeededRandom(seed);
  let bestWeights = generateRandomWeights(n, rng);
  let bestStats = portfolioStats(bestWeights, meanReturns, covMatrix);
  let bestVol = bestStats.volatility;
  
  for (let i = 0; i < 2000; i++) {
    const weights = generateRandomWeights(n, rng);
    const stats = portfolioStats(weights, meanReturns, covMatrix);
    if (stats.volatility < bestVol) {
      bestVol = stats.volatility;
      bestWeights = [...weights];
      bestStats = { ...stats };
    }
  }
  
  return { weights: bestWeights, ...bestStats };
};

const maximizeSharpe = (meanReturns, covMatrix, seed) => {
  const n = meanReturns.length;
  const rng = new SeededRandom(seed + 5000);
  let bestWeights = generateRandomWeights(n, rng);
  let bestStats = portfolioStats(bestWeights, meanReturns, covMatrix);
  let bestSharpe = bestStats.sharpe_ratio;
  
  for (let i = 0; i < 2000; i++) {
    const weights = generateRandomWeights(n, rng);
    const stats = portfolioStats(weights, meanReturns, covMatrix);
    if (stats.sharpe_ratio > bestSharpe) {
      bestSharpe = stats.sharpe_ratio;
      bestWeights = [...weights];
      bestStats = { ...stats };
    }
  }
  
  return { weights: bestWeights, ...bestStats };
};

const runSingleSimulation = (simId, numStocks, numDays) => {
  const rng = new SeededRandom(simId * 777);
  const selectedTickers = [];
  const usedIndices = new Set();
  
  while (selectedTickers.length < numStocks && selectedTickers.length < SP500_TICKERS.length) {
    const idx = Math.floor(rng.next() * SP500_TICKERS.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selectedTickers.push(SP500_TICKERS[idx]);
    }
  }
  
  const returns = generateStockReturns(numStocks, numDays, simId * 1000);
  const meanReturns = calculateMeanReturns(returns);
  const covMatrix = calculateCovMatrix(returns);
  
  const minVar = minimizeVariance(meanReturns, covMatrix, simId * 100);
  const maxSharpe = maximizeSharpe(meanReturns, covMatrix, simId * 200);
  const maxRet = maximizeSharpe(meanReturns, covMatrix, simId * 300);
  
  return {
    simulation_id: simId,
    stocks: selectedTickers.join(','),
    stocksList: selectedTickers,
    n_valid_stocks: numStocks,
    min_var_return: minVar.return,
    min_var_volatility: minVar.volatility,
    min_var_sharpe: minVar.sharpe_ratio,
    min_var_weights: minVar.weights,
    max_ret_return: maxRet.return,
    max_ret_volatility: maxRet.volatility,
    max_ret_sharpe: maxRet.sharpe_ratio,
    max_ret_weights: maxRet.weights,
    max_sharpe_return: maxSharpe.return,
    max_sharpe_volatility: maxSharpe.volatility,
    max_sharpe_sharpe: maxSharpe.sharpe_ratio,
    max_sharpe_weights: maxSharpe.weights,
    status: 'SUCCESS'
  };
};

const analyzeResults = (results) => {
  const successful = results.filter(r => r.status === 'SUCCESS');
  if (successful.length === 0) return null;
  
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = arr => {
    const mean = avg(arr);
    return Math.sqrt(arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length);
  };
  
  const criteria = {
    'Min Variance': {
      returns: successful.map(r => r.min_var_return),
      volatilities: successful.map(r => r.min_var_volatility),
      sharpes: successful.map(r => r.min_var_sharpe)
    },
    'Max Return': {
      returns: successful.map(r => r.max_ret_return),
      volatilities: successful.map(r => r.max_ret_volatility),
      sharpes: successful.map(r => r.max_ret_sharpe)
    },
    'Max Sharpe': {
      returns: successful.map(r => r.max_sharpe_return),
      volatilities: successful.map(r => r.max_sharpe_volatility),
      sharpes: successful.map(r => r.max_sharpe_sharpe)
    }
  };
  
  const statistics = {};
  Object.entries(criteria).forEach(([name, data]) => {
    statistics[name] = {
      avgReturn: avg(data.returns),
      stdReturn: std(data.returns),
      avgVolatility: avg(data.volatilities),
      stdVolatility: std(data.volatilities),
      avgSharpe: avg(data.sharpes),
      stdSharpe: std(data.sharpes),
      maxReturn: Math.max(...data.returns),
      minReturn: Math.min(...data.returns),
      maxSharpe: Math.max(...data.sharpes),
      minSharpe: Math.min(...data.sharpes)
    };
  });
  
  const bestMinVarIdx = successful.reduce((best, r, i) => 
    r.min_var_sharpe > successful[best].min_var_sharpe ? i : best, 0);
  const bestMaxSharpeIdx = successful.reduce((best, r, i) => 
    r.max_sharpe_sharpe > successful[best].max_sharpe_sharpe ? i : best, 0);
  
  return { statistics, bestPortfolios: { minVar: successful[bestMinVarIdx], maxSharpe: successful[bestMaxSharpeIdx] }, successful };
};

const createHistogram = (data, bins = 15) => {
  if (!data || data.length === 0) return [];
  const validData = data.filter(d => !isNaN(d) && isFinite(d));
  if (validData.length === 0) return [];
  
  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const range = max - min;
  const binWidth = range / bins || 0.01;
  const histogram = Array(bins).fill(0);
  
  validData.forEach(d => {
    const idx = Math.min(Math.floor((d - min) / binWidth), bins - 1);
    histogram[Math.max(0, idx)]++;
  });
  
  return histogram.map((count, i) => ({
    range: (min + i * binWidth).toFixed(2),
    count,
    value: min + (i + 0.5) * binWidth
  }));
};

// Rating badge component
const RatingBadge = ({ rating }) => {
  const colors = {
    'Strong Buy': 'bg-emerald-500 text-white',
    'Buy': 'bg-green-400 text-white',
    'Hold': 'bg-amber-400 text-slate-900',
    'Sell': 'bg-red-400 text-white',
    'Strong Sell': 'bg-red-600 text-white'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[rating] || 'bg-slate-400 text-white'}`}>
      {rating}
    </span>
  );
};

// Sentiment indicator
const SentimentIndicator = ({ sentiment }) => {
  const config = {
    'Very Bullish': { color: 'text-emerald-600', icon: TrendingUp, bg: 'bg-emerald-50' },
    'Bullish': { color: 'text-green-600', icon: TrendingUp, bg: 'bg-green-50' },
    'Neutral to Bullish': { color: 'text-lime-600', icon: TrendingUp, bg: 'bg-lime-50' },
    'Neutral': { color: 'text-slate-600', icon: Target, bg: 'bg-slate-50' },
    'Mixed': { color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50' },
    'Bearish': { color: 'text-red-600', icon: TrendingDown, bg: 'bg-red-50' }
  };
  const { color, icon: Icon, bg } = config[sentiment] || config['Neutral'];
  return (
    <div className={`flex items-center gap-1 ${bg} ${color} px-2 py-1 rounded-lg text-xs font-medium`}>
      <Icon className="w-3 h-3" />
      <span>{sentiment}</span>
    </div>
  );
};

// Enhanced weights table with entry price recommendations
const EnhancedWeightsTable = ({ title, stocks, weights, colorClass, portfolioType }) => {
  if (!stocks || !weights) return null;
  
  const stockWeights = stocks.map((stock, i) => ({
    stock,
    weight: weights[i] || 0,
    analysis: getStockAnalysis(stock)
  })).sort((a, b) => b.weight - a.weight);
  
  const [expandedStock, setExpandedStock] = useState(null);
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-slate-800 ${colorClass}`}>{title}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4" />
          <span>Click row for details</span>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Stock</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">Weight</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">Current</th>
              <th className="px-3 py-2 text-right font-semibold text-emerald-600">Entry Price</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">Target</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-600">Rating</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">Upside</th>
            </tr>
          </thead>
          <tbody>
            {stockWeights.map((item, i) => (
              <React.Fragment key={item.stock}>
                <tr 
                  className={`cursor-pointer transition-colors hover:bg-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${expandedStock === item.stock ? 'bg-blue-50' : ''}`}
                  onClick={() => setExpandedStock(expandedStock === item.stock ? null : item.stock)}
                >
                  <td className="px-3 py-2 font-semibold text-slate-700">{item.stock}</td>
                  <td className="px-3 py-2 text-right font-mono">{(item.weight * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-600">${item.analysis.currentPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-600">${item.analysis.entryPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-blue-600">${item.analysis.targetPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center"><RatingBadge rating={item.analysis.rating} /></td>
                  <td className={`px-3 py-2 text-right font-semibold ${item.analysis.upside >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.analysis.upside >= 0 ? '+' : ''}{item.analysis.upside.toFixed(1)}%
                  </td>
                </tr>
                {expandedStock === item.stock && (
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <SentimentIndicator sentiment={item.analysis.sentiment} />
                          <span className="text-xs text-slate-500">{item.analysis.analystCount} analysts covering</span>
                        </div>
                        
                        <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                          <h4 className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Entry Recommendation
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{item.analysis.reasoning}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium text-slate-500">Key Catalysts:</span>
                          {item.analysis.catalysts.map((cat, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white/80 border border-slate-200 rounded-full text-xs text-slate-600">
                              {cat}
                            </span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="text-center p-2 bg-white/60 rounded-lg">
                            <div className="text-xs text-slate-500">Entry Discount</div>
                            <div className={`font-bold ${item.analysis.entryPrice < item.analysis.currentPrice ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {((1 - item.analysis.entryPrice / item.analysis.currentPrice) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center p-2 bg-white/60 rounded-lg">
                            <div className="text-xs text-slate-500">Upside from Entry</div>
                            <div className="font-bold text-blue-600">
                              {((item.analysis.targetPrice / item.analysis.entryPrice - 1) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center p-2 bg-white/60 rounded-lg">
                            <div className="text-xs text-slate-500">Risk/Reward</div>
                            <div className="font-bold text-indigo-600">
                              {Math.abs((item.analysis.targetPrice - item.analysis.entryPrice) / (item.analysis.currentPrice - item.analysis.entryPrice)).toFixed(1)}:1
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-slate-500">Avg Entry Discount</div>
          <div className="font-bold text-emerald-600">
            {(stockWeights.reduce((sum, s) => sum + (1 - s.analysis.entryPrice / s.analysis.currentPrice), 0) / stockWeights.length * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Weighted Upside</div>
          <div className="font-bold text-blue-600">
            {stockWeights.reduce((sum, s) => sum + s.weight * s.analysis.upside, 0).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Strong Buy %</div>
          <div className="font-bold text-indigo-600">
            {(stockWeights.filter(s => s.analysis.rating === 'Strong Buy').reduce((sum, s) => sum + s.weight, 0) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PortfolioDashboard() {
  const [numStocks, setNumStocks] = useState(15);
  const [numSimulations, setNumSimulations] = useState(50);
  const [historyYears, setHistoryYears] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSim, setCurrentSim] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  
  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentSim(0);
    setAnalysis(null);
    
    const numDays = Math.floor(historyYears * 252);
    const allResults = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      await new Promise(resolve => setTimeout(resolve, 1));
      const result = runSingleSimulation(sim, numStocks, numDays);
      allResults.push(result);
      setProgress(((sim + 1) / numSimulations) * 100);
      setCurrentSim(sim + 1);
    }
    
    setAnalysis(analyzeResults(allResults));
    setIsRunning(false);
  }, [numStocks, numSimulations, historyYears]);
  
  const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return 'N/A';
    return `${(val * 100).toFixed(2)}%`;
  };
  
  const formatNumber = (val) => {
    if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return 'N/A';
    return val.toFixed(3);
  };
  
  const scatterData = analysis ? {
    minVar: analysis.successful.map(r => ({
      x: r.min_var_volatility * 100,
      y: r.min_var_return * 100,
      sharpe: r.min_var_sharpe
    })).filter(d => !isNaN(d.x) && !isNaN(d.y)),
    maxSharpe: analysis.successful.map(r => ({
      x: r.max_sharpe_volatility * 100,
      y: r.max_sharpe_return * 100,
      sharpe: r.max_sharpe_sharpe
    })).filter(d => !isNaN(d.x) && !isNaN(d.y))
  } : null;
  
  const histogramData = analysis ? {
    maxSharpeSharpe: createHistogram(analysis.successful.map(r => r.max_sharpe_sharpe)),
    minVarReturn: createHistogram(analysis.successful.map(r => r.min_var_return * 100)),
    maxSharpeReturn: createHistogram(analysis.successful.map(r => r.max_sharpe_return * 100))
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <PieChart className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Monte Carlo Portfolio Optimization</h1>
          </div>
          <p className="text-blue-100 text-sm">S&P 500 Portfolio Simulation • Modern Portfolio Theory • Live Analyst Data</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-blue-200">
            <span>• Minimum Variance</span>
            <span>• Maximum Sharpe Ratio</span>
            <span>• Risk-Free Rate: {(RISK_FREE_RATE * 100)}%</span>
            <span>• Real-Time Entry Prices</span>
          </div>
          <div className="mt-2 text-xs text-blue-300">
            Data as of February 2025 • Analyst ratings from TipRanks, Yahoo Finance, MarketBeat
          </div>
        </div>
        
        {/* Parameters Panel */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Simulation Parameters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Stocks per Portfolio: {numStocks}</label>
              <input type="range" min="5" max="20" value={numStocks} onChange={(e) => setNumStocks(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" disabled={isRunning} />
              <div className="flex justify-between text-xs text-slate-500">
                <span>5</span>
                <span>20</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Simulations: {numSimulations}</label>
              <input type="range" min="10" max="5000" step="10" value={numSimulations} onChange={(e) => setNumSimulations(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" disabled={isRunning} />
              <div className="flex justify-between text-xs text-slate-500">
                <span>10</span>
                <span>5000</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Price History: {historyYears} year(s)</label>
              <input type="range" min="1" max="10" value={historyYears} onChange={(e) => setHistoryYears(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" disabled={isRunning} />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1yr</span>
                <span>10yr</span>
              </div>
            </div>
            
            <div className="flex items-end">
              <button onClick={runSimulation} disabled={isRunning} className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm ${isRunning ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'}`}>
                {isRunning ? <><RefreshCw className="w-5 h-5 animate-spin" />Running...</> : <><Play className="w-5 h-5" />Run Monte Carlo</>}
              </button>
            </div>
          </div>
          
          {isRunning && (
            <div className="mt-5 bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span className="font-medium">Progress</span>
                <span>[{currentSim}/{numSimulations}] {progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        
        {analysis && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg"><Shield className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="font-semibold text-slate-800">Minimum Variance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Return</span><span className="font-semibold text-emerald-600">{formatPercent(analysis.statistics['Min Variance'].avgReturn)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Volatility</span><span className="font-semibold">{formatPercent(analysis.statistics['Min Variance'].avgVolatility)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Sharpe</span><span className="font-bold text-lg text-emerald-600">{formatNumber(analysis.statistics['Min Variance'].avgSharpe)}</span></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg"><Zap className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="font-semibold text-slate-800">Maximum Sharpe</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Return</span><span className="font-semibold text-amber-600">{formatPercent(analysis.statistics['Max Sharpe'].avgReturn)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Volatility</span><span className="font-semibold">{formatPercent(analysis.statistics['Max Sharpe'].avgVolatility)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Sharpe</span><span className="font-bold text-lg text-amber-600">{formatNumber(analysis.statistics['Max Sharpe'].avgSharpe)}</span></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="font-semibold text-slate-800">Maximum Return</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Return</span><span className="font-semibold text-blue-600">{formatPercent(analysis.statistics['Max Return'].avgReturn)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Volatility</span><span className="font-semibold">{formatPercent(analysis.statistics['Max Return'].avgVolatility)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Sharpe</span><span className="font-bold text-lg text-blue-600">{formatNumber(analysis.statistics['Max Return'].avgSharpe)}</span></div>
                </div>
              </div>
            </div>
            
            {/* Best Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-800">Best Min Variance Portfolio</h3>
                  <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">Sim #{analysis.bestPortfolios.minVar.simulation_id}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-emerald-700">{formatPercent(analysis.bestPortfolios.minVar.min_var_return)}</div><div className="text-xs text-slate-500">Return</div></div>
                  <div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-slate-700">{formatPercent(analysis.bestPortfolios.minVar.min_var_volatility)}</div><div className="text-xs text-slate-500">Volatility</div></div>
                  <div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-emerald-700">{formatNumber(analysis.bestPortfolios.minVar.min_var_sharpe)}</div><div className="text-xs text-slate-500">Sharpe</div></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-slate-800">Best Max Sharpe Portfolio</h3>
                  <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full ml-auto">Sim #{analysis.bestPortfolios.maxSharpe.simulation_id}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-amber-700">{formatPercent(analysis.bestPortfolios.maxSharpe.max_sharpe_return)}</div><div className="text-xs text-slate-500">Return</div></div>
                  <div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-slate-700">{formatPercent(analysis.bestPortfolios.maxSharpe.max_sharpe_volatility)}</div><div className="text-xs text-slate-500">Volatility</div></div>
                  <div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-amber-700">{formatNumber(analysis.bestPortfolios.maxSharpe.max_sharpe_sharpe)}</div><div className="text-xs text-slate-500">Sharpe</div></div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Stock Weights Tables with Entry Prices */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
              <EnhancedWeightsTable 
                title="Best Min Variance - Entry Price Analysis"
                stocks={analysis.bestPortfolios.minVar.stocksList}
                weights={analysis.bestPortfolios.minVar.min_var_weights}
                colorClass="text-emerald-600"
                portfolioType="minVar"
              />
              <EnhancedWeightsTable 
                title="Best Max Sharpe - Entry Price Analysis"
                stocks={analysis.bestPortfolios.maxSharpe.stocksList}
                weights={analysis.bestPortfolios.maxSharpe.max_sharpe_weights}
                colorClass="text-amber-600"
                portfolioType="maxSharpe"
              />
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" />Efficient Frontier</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="x" type="number" name="Volatility" unit="%" domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'Volatility (%)', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                    <YAxis dataKey="y" type="number" name="Return" unit="%" domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`]} contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Scatter name="Min Variance" data={scatterData.minVar} fill="#10b981" fillOpacity={0.6} />
                    <Scatter name="Max Sharpe" data={scatterData.maxSharpe} fill="#f59e0b" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" />Sharpe Ratio Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={histogramData.maxSharpeSharpe} margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} label={{ value: 'Sharpe Ratio', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" name="Frequency" radius={[4, 4, 0, 0]}>
                      {histogramData.maxSharpeSharpe.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.value > analysis.statistics['Max Sharpe'].avgSharpe ? '#f59e0b' : '#fcd34d'} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" />Return Distribution (Min Variance)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={histogramData.minVarReturn} margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} label={{ value: 'Return (%)', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" name="Frequency" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" />Return Distribution (Max Sharpe)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={histogramData.maxSharpeReturn} margin={{ top: 10, right: 10, bottom: 40, left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} label={{ value: 'Return (%)', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" name="Frequency" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Statistics Table */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">Statistics Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Metric</th>
                      <th className="px-4 py-3 text-center font-semibold text-emerald-600">Min Variance</th>
                      <th className="px-4 py-3 text-center font-semibold text-amber-600">Max Sharpe</th>
                      <th className="px-4 py-3 text-center font-semibold text-blue-600">Max Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Average Return', key: 'avgReturn', format: formatPercent },
                      { label: 'Std Dev (Return)', key: 'stdReturn', format: formatPercent },
                      { label: 'Average Volatility', key: 'avgVolatility', format: formatPercent },
                      { label: 'Average Sharpe', key: 'avgSharpe', format: formatNumber },
                      { label: 'Max Sharpe', key: 'maxSharpe', format: formatNumber },
                      { label: 'Min Sharpe', key: 'minSharpe', format: formatNumber },
                    ].map((row, i) => (
                      <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-4 py-3 text-slate-600 font-medium">{row.label}</td>
                        <td className="px-4 py-3 text-center">{row.format(analysis.statistics['Min Variance'][row.key])}</td>
                        <td className="px-4 py-3 text-center">{row.format(analysis.statistics['Max Sharpe'][row.key])}</td>
                        <td className="px-4 py-3 text-center">{row.format(analysis.statistics['Max Return'][row.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Investment Disclaimer</p>
                  <p>Entry prices and analyst ratings are based on publicly available data and should not be considered financial advice. Past performance does not guarantee future results. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-slate-400">
              {numSimulations} simulations • {numStocks} stocks/portfolio • {historyYears} year(s) history • {analysis.successful.length} successful
            </div>
          </>
        )}
        
        {!analysis && !isRunning && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Optimize</h3>
            <p className="text-slate-500 mb-6">Configure parameters and click "Run Monte Carlo" to start.</p>
            <div className="inline-flex flex-col gap-1 text-sm text-slate-400 bg-slate-50 rounded-lg px-6 py-4">
              <span>• {numStocks} stocks per portfolio</span>
              <span>• {numSimulations} simulations</span>
              <span>• {historyYears} year(s) history ({historyYears * 252} trading days)</span>
              <span className="text-indigo-500 font-medium mt-2">• Live analyst entry prices included</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
