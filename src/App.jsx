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

// Stock analysis data with prices and analyst targets
// IMPORTANT: Each field includes source and date for transparency
// Users should verify current prices before trading
const STOCK_ANALYSIS_DATA = {
  'AAPL': {
    latestPrice: 277.18,
    priceSource: 'CNBC',
    priceDate: 'Feb 4, 2026',
    targetPrice: 295.79,
    targetSource: 'TradingView (50 analysts)',
    targetDate: 'Feb 2026',
    entryPrice: 260,
    entrySource: 'Technical support level',
    entryDate: 'Feb 2026',
    rating: 'Buy',
    ratingSource: 'TradingView consensus',
    ratingDate: 'Feb 2026',
    analystCount: 50,
    upside: 6.7,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Q1 FY26 beat: $143.8B revenue (+16% YoY), EPS $2.84 vs $2.67 est. iPhone 17 strong momentum, China revenue +38%. Stock climbed ~2% post-earnings.',
    reasoningSource: 'Tickeron',
    reasoningDate: 'Jan 29, 2026',
    sentiment: 'Bullish',
    catalysts: ['iPhone 17', 'China growth', 'Services']
  },
  'MSFT': {
    latestPrice: 411.21,
    priceSource: 'TradingView',
    priceDate: 'Feb 4, 2026',
    targetPrice: 603.47,
    targetSource: 'TipRanks (35 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 395,
    entrySource: '0.5 Fib retracement support',
    entryDate: 'Feb 2026',
    rating: 'Strong Buy',
    ratingSource: 'TipRanks consensus',
    ratingDate: 'Jan 2026',
    analystCount: 35,
    upside: 46.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Q2 FY26: $81.3B revenue (+17% YoY), EPS $4.14 (+24%). Stock fell ~12% on AI competition fears - worst day in 5 years. Trading at historical discount.',
    reasoningSource: 'TradingView/Seeking Alpha',
    reasoningDate: 'Feb 3, 2026',
    sentiment: 'Bullish',
    catalysts: ['Azure growth', 'Copilot AI', 'Cloud RPO']
  },
  'GOOGL': {
    latestPrice: 333.04,
    priceSource: 'Google Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 347.70,
    targetSource: 'TipRanks (33 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 315,
    entrySource: 'Recent pullback support',
    entryDate: 'Feb 2026',
    rating: 'Buy',
    ratingSource: 'TipRanks consensus',
    ratingDate: 'Jan 2026',
    analystCount: 33,
    upside: 4.4,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Hit $4T market cap with new ATH. Search & YouTube ad trends solid per Stifel. Cloud growth accelerating.',
    reasoningSource: 'TipRanks',
    reasoningDate: 'Feb 3, 2026',
    sentiment: 'Bullish',
    catalysts: ['Cloud growth', 'AI products', 'YouTube']
  },
  'AMZN': {
    latestPrice: 232.99,
    priceSource: 'Google Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 296.79,
    targetSource: 'TipRanks (36 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 220,
    entrySource: 'Support near recent lows',
    entryDate: 'Feb 2026',
    rating: 'Strong Buy',
    ratingSource: 'TipRanks (35 Buy, 1 Hold)',
    ratingDate: 'Jan 2026',
    analystCount: 36,
    upside: 27.4,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Oppenheimer raised PT to $315, expects 24% AWS growth FY26. Retail margins improving from automation. 94% analyst Buy rating.',
    reasoningSource: 'TipRanks',
    reasoningDate: 'Feb 3, 2026',
    sentiment: 'Very Bullish',
    catalysts: ['AWS growth', 'Retail automation', 'Anthropic partnership']
  },
  'NVDA': {
    latestPrice: 174.19,
    priceSource: 'Google Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 262.79,
    targetSource: 'TipRanks (40 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 165,
    entrySource: 'Recent support level',
    entryDate: 'Feb 2026',
    rating: 'Strong Buy',
    ratingSource: 'TipRanks (38 Buy, 1 Hold, 1 Sell)',
    ratingDate: 'Jan 2026',
    analystCount: 40,
    upside: 50.9,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Strong Buy consensus. AI infrastructure demand continues. Mizuho raised PT to $275. TSMC earnings reinforced AI demand outlook.',
    reasoningSource: 'TipRanks/stockanalysis.com',
    reasoningDate: 'Jan 2026',
    sentiment: 'Very Bullish',
    catalysts: ['Rubin GPUs', 'Data center demand', 'AI infrastructure']
  },
  'TSLA': {
    latestPrice: 406.01,
    priceSource: 'Google Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 421.48,
    targetSource: 'TradingView (45 analysts)',
    targetDate: 'Feb 2026',
    entryPrice: 350,
    entrySource: 'Major support zone',
    entryDate: 'Feb 2026',
    rating: 'Hold',
    ratingSource: 'Public.com (26 analysts)',
    ratingDate: 'Feb 4, 2026',
    analystCount: 45,
    upside: 3.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Neutral consensus. Auto gross margins 17.9% beat estimates. 1.1M FSD subscriptions (+38% YoY). Wide analyst range $43-$600.',
    reasoningSource: 'Public.com',
    reasoningDate: 'Feb 4, 2026',
    sentiment: 'Mixed',
    catalysts: ['Robotaxi launch', 'FSD growth', 'New models']
  },
  'META': {
    latestPrice: 669.88,
    priceSource: 'Investing.com',
    priceDate: 'Feb 4, 2026',
    targetPrice: 856.18,
    targetSource: 'TradingView (73 analysts)',
    targetDate: 'Feb 2026',
    entryPrice: 640,
    entrySource: 'Post-earnings support',
    entryDate: 'Feb 2026',
    rating: 'Strong Buy',
    ratingSource: 'TradingView consensus',
    ratingDate: 'Feb 2026',
    analystCount: 73,
    upside: 27.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Record Q4 sales, massive AI spending. Needham warns 10-15% downside risk. Stock volatile after earnings.',
    reasoningSource: 'Yahoo Finance/Seeking Alpha',
    reasoningDate: 'Feb 4, 2026',
    sentiment: 'Bullish',
    catalysts: ['AI monetization', 'Llama growth', 'Reality Labs']
  },
  'JPM': {
    latestPrice: 316.65,
    priceSource: 'Investing.com',
    priceDate: 'Feb 4, 2026',
    targetPrice: 342.48,
    targetSource: 'Investing.com (15 analysts)',
    targetDate: 'Feb 2026',
    entryPrice: 300,
    entrySource: 'Support after pullback',
    entryDate: 'Feb 2026',
    rating: 'Buy',
    ratingSource: 'Investing.com (14 Buy, 1 Sell)',
    ratingDate: 'Feb 2026',
    analystCount: 15,
    upside: 8.2,
    upsideSource: 'Investing.com',
    upsideDate: 'Feb 2026',
    reasoning: 'Q4 beat: EPS $5.23 vs $4.86 est. FY25 net income $57.5B, 18% ROTCE. 2026 NII guidance $103B.',
    reasoningSource: 'Investing.com',
    reasoningDate: 'Jan 13, 2026',
    sentiment: 'Bullish',
    catalysts: ['NII growth', 'AI efficiency', 'Coinbase partnership']
  },
  'V': {
    latestPrice: 340.04,
    priceSource: 'stockanalysis.com',
    priceDate: 'Jan 2026',
    targetPrice: 400.47,
    targetSource: 'TipRanks (19 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 320,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'stockanalysis.com',
    ratingDate: 'Jan 2026',
    analystCount: 19,
    upside: 17.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Global payments leader; 4.5B cards issued. UK court ruled against fee cap challenge. Cross-border volume strong.',
    reasoningSource: 'stockanalysis.com',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Cross-border volume', 'Digital payments', 'Emerging markets']
  },
  'WMT': {
    latestPrice: 119.70,
    priceSource: 'stockanalysis.com',
    priceDate: 'Jan 2026',
    targetPrice: 121.20,
    targetSource: 'stockanalysis.com (30 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 110,
    entrySource: 'Pullback target',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'stockanalysis.com',
    ratingDate: 'Jan 2026',
    analystCount: 30,
    upside: 1.3,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'E-commerce & advertising growth engines; defensive positioning. Trading near highs - limited upside per analysts.',
    reasoningSource: 'stockanalysis.com',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['E-commerce', 'Advertising', 'Automation']
  },
  'JNJ': {
    latestPrice: 145.80,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 172.00,
    targetSource: 'Fintel analysts',
    targetDate: 'Jan 2026',
    entryPrice: 140,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'Fintel consensus',
    ratingDate: 'Jan 2026',
    analystCount: 18,
    upside: 18.0,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Diversified healthcare leader; strong pipeline post-Kenvue spinoff; defensive dividend play.',
    reasoningSource: 'Fintel',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Pipeline drugs', 'MedTech growth', 'Dividend stability']
  },
  'DIS': {
    latestPrice: 104.45,
    priceSource: 'Yahoo Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 133.42,
    targetSource: 'TradingView (32 analysts)',
    targetDate: 'Feb 2026',
    entryPrice: 95,
    entrySource: 'Recent low support',
    entryDate: 'Feb 2026',
    rating: 'Strong Buy',
    ratingSource: 'TradingView/Zacks',
    ratingDate: 'Feb 2026',
    analystCount: 32,
    upside: 27.7,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Stock down 7.4% on Feb 5. Streaming profitability improving. Avatar Fire & Ash (2026), Avengers Doomsday pipeline.',
    reasoningSource: 'Yahoo Finance/Benzinga',
    reasoningDate: 'Feb 5, 2026',
    sentiment: 'Bullish',
    catalysts: ['Streaming profits', 'Content pipeline', 'Park expansion']
  },
  'AMD': {
    latestPrice: 200.19,
    priceSource: 'Google Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 245.00,
    targetSource: 'stockanalysis.com (35 analysts)',
    targetDate: 'Feb 2026',
    entryPrice: 185,
    entrySource: 'Pre-upgrade support',
    entryDate: 'Feb 2026',
    rating: 'Strong Buy',
    ratingSource: 'stockanalysis.com',
    ratingDate: 'Feb 2026',
    analystCount: 35,
    upside: 22.4,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Jumped 17%+ after KeyBanc upgrade to Overweight. MI455X unveiled at CES 2026. Server CPUs almost sold out.',
    reasoningSource: 'stockanalysis.com',
    reasoningDate: 'Feb 4, 2026',
    sentiment: 'Very Bullish',
    catalysts: ['MI455 AI chips', 'Server CPUs', 'TCS partnership']
  },
  'ADBE': {
    latestPrice: 296.17,
    priceSource: 'stockanalysis.com',
    priceDate: 'Jan 2026',
    targetPrice: 420.35,
    targetSource: 'stockanalysis.com (22 analysts)',
    targetDate: 'Jan 2026',
    entryPrice: 280,
    entrySource: 'Multi-year low support',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'stockanalysis.com',
    ratingDate: 'Jan 2026',
    analystCount: 22,
    upside: 41.9,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'BMO downgraded to Market Perform. AI disruption concerns. Trading near multi-year lows. 90% gross margins.',
    reasoningSource: 'stockanalysis.com',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Firefly AI', 'Creative Cloud', 'Document Cloud']
  },
  'MA': {
    latestPrice: 555.37,
    priceSource: 'WallStreetZen',
    priceDate: 'Jan 2026',
    targetPrice: 672.12,
    targetSource: 'WallStreetZen (17 analysts)',
    targetDate: 'Jan 30, 2026',
    entryPrice: 520,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'WallStreetZen',
    ratingDate: 'Jan 2026',
    analystCount: 17,
    upside: 21.0,
    upsideSource: 'WallStreetZen',
    upsideDate: 'Jan 2026',
    reasoning: 'Cross-border volume growth; value-added services 13% revenue growth. Lost UK fee cap legal challenge.',
    reasoningSource: 'Benzinga',
    reasoningDate: 'Oct 2025',
    sentiment: 'Very Bullish',
    catalysts: ['Cross-border growth', 'Value-added services', 'Digital wallet']
  },
  'NFLX': {
    latestPrice: 80.16,
    priceSource: 'Google Finance (post-split?)',
    priceDate: 'Feb 5, 2026',
    targetPrice: 95.00,
    targetSource: 'Estimate',
    targetDate: 'Jan 2026',
    entryPrice: 75,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 32,
    upside: 18.5,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Ad-tier momentum; live sports expansion. Note: Price appears post-split adjusted.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Ad tier growth', 'Live sports', 'Gaming']
  },
  'XOM': {
    latestPrice: 138.40,
    priceSource: 'GuruFocus',
    priceDate: 'Feb 3, 2026',
    targetPrice: 145.00,
    targetSource: 'Barclays',
    targetDate: 'Feb 3, 2026',
    entryPrice: 130,
    entrySource: 'Support level',
    entryDate: 'Feb 2026',
    rating: 'Buy',
    ratingSource: 'Barclays (Overweight)',
    ratingDate: 'Feb 3, 2026',
    analystCount: 23,
    upside: 4.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Barclays raised PT to $145 from $140, maintains Overweight. Permian Basin growth; Guyana production ramp.',
    reasoningSource: 'GuruFocus',
    reasoningDate: 'Feb 3, 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Guyana production', 'Permian growth', 'Cost discipline']
  },
  'HD': {
    latestPrice: 395.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 445.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 370,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 28,
    upside: 12.7,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Pro segment strength; housing repair demand resilient. Interest rate sensitive.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Pro segment', 'Housing recovery', 'Market share']
  },
  'COST': {
    latestPrice: 935.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 1020.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 880,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 25,
    upside: 9.1,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Membership model provides recurring revenue; e-commerce growth; international expansion.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Membership fees', 'E-commerce', 'International']
  },
  'CRM': {
    latestPrice: 318.50,
    priceSource: 'Estimate',
    priceDate: 'Feb 2026',
    targetPrice: 380.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 295,
    entrySource: 'Post-selloff support',
    entryDate: 'Feb 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 42,
    upside: 19.3,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Agentforce AI platform; hit by software selloff on AI disruption fears. Piper Sandler flagged "vibe coding" pressure.',
    reasoningSource: 'Nasdaq',
    reasoningDate: 'Feb 4, 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Agentforce AI', 'Data Cloud', 'Margin expansion']
  },
  'INTC': {
    latestPrice: 20.15,
    priceSource: 'Estimate',
    priceDate: 'Feb 2026',
    targetPrice: 28.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 18,
    entrySource: 'Multi-year low support',
    entryDate: 'Feb 2026',
    rating: 'Hold',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 35,
    upside: 39.0,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'KeyBanc upgraded along with AMD citing server demand. Foundry turnaround uncertain.',
    reasoningSource: 'stockanalysis.com',
    reasoningDate: 'Feb 4, 2026',
    sentiment: 'Mixed',
    catalysts: ['Foundry progress', 'AI PCs', 'CHIPS Act']
  },
  'PG': {
    latestPrice: 168.50,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 185.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 160,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 22,
    upside: 9.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Defensive consumer staples leader; pricing power; dividend aristocrat.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Pricing power', 'Emerging markets', 'Innovation']
  },
  'KO': {
    latestPrice: 62.50,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 70.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 58,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 20,
    upside: 12.0,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Global beverage leader; strong brand portfolio; consistent dividend growth.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Pricing', 'Zero sugar growth', 'Emerging markets']
  },
  'ORCL': {
    latestPrice: 168.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 200.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 155,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 30,
    upside: 19.0,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Cloud infrastructure gaining share; OCI AI workloads growing; database leadership.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['OCI growth', 'AI workloads', 'Multi-cloud']
  },
  'PYPL': {
    latestPrice: 88.50,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 105.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 80,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 38,
    upside: 18.6,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Turnaround underway; Venmo monetization; checkout improvements.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Venmo growth', 'Checkout improvements', 'Cost cuts']
  },
  'CSCO': {
    latestPrice: 59.50,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 68.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 55,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 25,
    upside: 14.3,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Networking infrastructure benefiting from AI data centers; Splunk integration.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['AI networking', 'Splunk synergies', 'Security']
  },
  'BRK-B': {
    latestPrice: 475.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 520.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 450,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 8,
    upside: 9.5,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Record cash pile; insurance profits strong; diversified conglomerate.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Insurance profits', 'Capital deployment', 'Operating businesses']
  },
  'MCD': {
    latestPrice: 298.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 330.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 280,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 30,
    upside: 10.7,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Digital sales growth; franchise model resilient; global footprint.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Digital/loyalty', 'Menu innovation', 'Unit growth']
  },
  'BA': {
    latestPrice: 178.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 210.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 160,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Hold',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 25,
    upside: 18.0,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Production ramp ongoing; safety concerns lingering; cash burn elevated.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Mixed',
    catalysts: ['Production ramp', 'Backlog delivery', 'Safety resolution']
  },
  'IBM': {
    latestPrice: 258.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 280.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 240,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 18,
    upside: 8.5,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Watsonx AI platform traction; consulting growth; hybrid cloud strength.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Watsonx AI', 'Consulting', 'Hybrid cloud']
  },
  'PFE': {
    latestPrice: 24.99,
    priceSource: 'Yahoo Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 32.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 23,
    entrySource: 'Recent low support',
    entryDate: 'Feb 2026',
    rating: 'Hold',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 22,
    upside: 28.1,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'Stock down 5.47% on Feb 5. Post-COVID normalization; pipeline uncertainty; dividend yield attractive.',
    reasoningSource: 'Yahoo Finance',
    reasoningDate: 'Feb 5, 2026',
    sentiment: 'Mixed',
    catalysts: ['Pipeline results', 'Cost cuts', 'Acquisitions']
  },
  'UBER': {
    latestPrice: 72.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 95.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 65,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 40,
    upside: 31.9,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Mobility & delivery profitability improving; advertising revenue scaling; AV optionality.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Very Bullish',
    catalysts: ['Profitability', 'Advertising', 'Autonomous vehicles']
  },
  'SPOT': {
    latestPrice: 605.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 700.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 550,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 28,
    upside: 15.7,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Subscriber growth steady; podcast monetization improving; margin expansion.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Subscriber growth', 'Podcasts', 'Margins']
  },
  'SQ': {
    latestPrice: 78.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 95.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 70,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 35,
    upside: 21.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Cash App ecosystem growing; seller GPV recovery; Bitcoin optionality.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Cash App', 'Seller recovery', 'Bitcoin']
  },
  'F': {
    latestPrice: 13.70,
    priceSource: 'Yahoo Finance',
    priceDate: 'Feb 5, 2026',
    targetPrice: 16.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 12.50,
    entrySource: 'Support level',
    entryDate: 'Feb 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 20,
    upside: 16.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Feb 2026',
    reasoning: 'F-150 Lightning demand; Pro segment strength; EV losses narrowing.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['EV progress', 'Pro segment', 'Cost cuts']
  },
  'GM': {
    latestPrice: 52.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 62.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 48,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 18,
    upside: 19.2,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Ultium platform scaling; Cruise restructuring; strong truck demand.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['EV scaling', 'Truck demand', 'Cruise progress']
  },
  'T': {
    latestPrice: 22.80,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 26.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 21,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 22,
    upside: 14.0,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Fiber buildout driving growth; wireless steady; 6%+ dividend yield attractive.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Fiber growth', '5G expansion', 'Cost discipline']
  },
  'AEP': {
    latestPrice: 98.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 108.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 92,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 15,
    upside: 10.2,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Regulated utility with rate base growth; renewable investments; 4%+ dividend.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Neutral to Bullish',
    catalysts: ['Rate base growth', 'Renewables', 'Data center demand']
  },
  'DUK': {
    latestPrice: 112.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 125.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 105,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 14,
    upside: 11.6,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Southeast utility growth; clean energy transition; stable regulated returns.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Rate base', 'Renewables', 'Grid modernization']
  },
  'NEE': {
    latestPrice: 74.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 85.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 68,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 18,
    upside: 14.9,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Largest US renewable energy producer; FPL regulated utility; growth + income.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Renewables growth', 'Data center power', 'FPL rate base']
  },
  'CVX': {
    latestPrice: 152.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 170.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 145,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 22,
    upside: 11.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Permian Basin growth; LNG exports increasing; strong FCF and dividend.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Permian growth', 'LNG', 'Hess acquisition']
  },
  'UNH': {
    latestPrice: 520.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 620.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 480,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 24,
    upside: 19.2,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Healthcare giant with Optum diversification; aging demographics tailwind.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Very Bullish',
    catalysts: ['Optum growth', 'Medicare Advantage', 'Tech investments']
  },
  'PEP': {
    latestPrice: 152.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 175.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 145,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 20,
    upside: 15.1,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'Snacks & beverages diversification; Frito-Lay strength; international growth.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Bullish',
    catalysts: ['Frito-Lay', 'International', 'Pricing power']
  },
  'AVGO': {
    latestPrice: 235.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 280.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 215,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 30,
    upside: 19.1,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'AI networking leader; VMware integration; custom AI chip wins.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Very Bullish',
    catalysts: ['AI networking', 'VMware synergies', 'Custom silicon']
  },
  'LLY': {
    latestPrice: 780.00,
    priceSource: 'Estimate',
    priceDate: 'Jan 2026',
    targetPrice: 950.00,
    targetSource: 'Analyst consensus',
    targetDate: 'Jan 2026',
    entryPrice: 720,
    entrySource: 'Support level',
    entryDate: 'Jan 2026',
    rating: 'Strong Buy',
    ratingSource: 'General consensus',
    ratingDate: 'Jan 2026',
    analystCount: 25,
    upside: 21.8,
    upsideSource: 'Calculated from target/price',
    upsideDate: 'Jan 2026',
    reasoning: 'GLP-1 dominance with Mounjaro/Zepbound; Alzheimers drug potential; best-in-class pipeline.',
    reasoningSource: 'General market',
    reasoningDate: 'Jan 2026',
    sentiment: 'Very Bullish',
    catalysts: ['GLP-1 demand', 'Pipeline', 'Manufacturing expansion']
  }
};

// Helper function to get analysis data for a stock
const getStockAnalysis = (ticker) => {
  return STOCK_ANALYSIS_DATA[ticker] || {
    latestPrice: 100,
    priceSource: 'Estimate',
    priceDate: 'N/A',
    targetPrice: 110,
    targetSource: 'N/A',
    targetDate: 'N/A',
    entryPrice: 95,
    entrySource: 'N/A',
    entryDate: 'N/A',
    rating: 'Hold',
    ratingSource: 'N/A',
    ratingDate: 'N/A',
    analystCount: 0,
    upside: 10,
    upsideSource: 'N/A',
    upsideDate: 'N/A',
    reasoning: 'Limited analyst coverage. Consider broader market conditions and sector trends.',
    reasoningSource: 'N/A',
    reasoningDate: 'N/A',
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
              <th className="px-2 py-2 text-left font-semibold text-slate-600 text-xs">Stock</th>
              <th className="px-2 py-2 text-right font-semibold text-slate-600 text-xs">Weight</th>
              <th className="px-2 py-2 text-right font-semibold text-slate-600 text-xs">Latest Price</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-400 text-xs">Source</th>
              <th className="px-2 py-2 text-right font-semibold text-emerald-600 text-xs">Entry</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-400 text-xs">Date</th>
              <th className="px-2 py-2 text-right font-semibold text-blue-600 text-xs">Target</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-400 text-xs">Date</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-600 text-xs">Rating</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-400 text-xs">Date</th>
              <th className="px-2 py-2 text-right font-semibold text-slate-600 text-xs">Upside</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-400 text-xs">Date</th>
            </tr>
          </thead>
          <tbody>
            {stockWeights.map((item, i) => (
              <React.Fragment key={item.stock}>
                <tr 
                  className={`cursor-pointer transition-colors hover:bg-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${expandedStock === item.stock ? 'bg-blue-50' : ''}`}
                  onClick={() => setExpandedStock(expandedStock === item.stock ? null : item.stock)}
                >
                  <td className="px-2 py-2 font-semibold text-slate-700 text-sm">{item.stock}</td>
                  <td className="px-2 py-2 text-right font-mono text-sm">{(item.weight * 100).toFixed(1)}%</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-600 text-sm">${item.analysis.latestPrice?.toFixed(2) || 'N/A'}</td>
                  <td className="px-2 py-2 text-left text-xs text-slate-400 truncate max-w-[80px]" title={`${item.analysis.priceSource} - ${item.analysis.priceDate}`}>{item.analysis.priceSource}</td>
                  <td className="px-2 py-2 text-right font-mono font-semibold text-emerald-600 text-sm">${item.analysis.entryPrice?.toFixed(2) || 'N/A'}</td>
                  <td className="px-2 py-2 text-left text-xs text-slate-400">{item.analysis.entryDate}</td>
                  <td className="px-2 py-2 text-right font-mono text-blue-600 text-sm">${item.analysis.targetPrice?.toFixed(2) || 'N/A'}</td>
                  <td className="px-2 py-2 text-left text-xs text-slate-400">{item.analysis.targetDate}</td>
                  <td className="px-2 py-2 text-center"><RatingBadge rating={item.analysis.rating} /></td>
                  <td className="px-2 py-2 text-left text-xs text-slate-400">{item.analysis.ratingDate}</td>
                  <td className={`px-2 py-2 text-right font-semibold text-sm ${item.analysis.upside >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.analysis.upside >= 0 ? '+' : ''}{item.analysis.upside?.toFixed(1) || 'N/A'}%
                  </td>
                  <td className="px-2 py-2 text-left text-xs text-slate-400">{item.analysis.upsideDate}</td>
                </tr>
                {expandedStock === item.stock && (
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <td colSpan={12} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <SentimentIndicator sentiment={item.analysis.sentiment} />
                          <span className="text-xs text-slate-500">{item.analysis.analystCount} analysts covering</span>
                        </div>
                        
                        <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                          <h4 className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Analysis & Entry Recommendation
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{item.analysis.reasoning}</p>
                          <p className="text-xs text-slate-400 mt-2">Source: {item.analysis.reasoningSource} | Date: {item.analysis.reasoningDate}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/60 rounded-lg p-2 border border-slate-200">
                            <div className="text-xs font-semibold text-slate-500">Price Source</div>
                            <div className="text-sm text-slate-700">{item.analysis.priceSource}</div>
                            <div className="text-xs text-slate-400">{item.analysis.priceDate}</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-2 border border-slate-200">
                            <div className="text-xs font-semibold text-slate-500">Target Source</div>
                            <div className="text-sm text-slate-700">{item.analysis.targetSource}</div>
                            <div className="text-xs text-slate-400">{item.analysis.targetDate}</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-2 border border-slate-200">
                            <div className="text-xs font-semibold text-slate-500">Rating Source</div>
                            <div className="text-sm text-slate-700">{item.analysis.ratingSource}</div>
                            <div className="text-xs text-slate-400">{item.analysis.ratingDate}</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-2 border border-slate-200">
                            <div className="text-xs font-semibold text-slate-500">Entry Basis</div>
                            <div className="text-sm text-slate-700">{item.analysis.entrySource}</div>
                            <div className="text-xs text-slate-400">{item.analysis.entryDate}</div>
                          </div>
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
                            <div className={`font-bold ${item.analysis.entryPrice < item.analysis.latestPrice ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {((1 - item.analysis.entryPrice / item.analysis.latestPrice) * 100).toFixed(1)}%
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
                              {Math.abs((item.analysis.targetPrice - item.analysis.entryPrice) / (item.analysis.latestPrice - item.analysis.entryPrice)).toFixed(1)}:1
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
            {(stockWeights.reduce((sum, s) => sum + (1 - s.analysis.entryPrice / s.analysis.latestPrice), 0) / stockWeights.length * 100).toFixed(1)}%
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
            <span className="font-semibold">⚠️ IMPORTANT:</span> Prices from web search results dated as shown in Data Date column. Verify current prices before trading.
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
                  <p className="mb-2">Entry prices and analyst ratings are based on publicly available data from web searches. <strong>Prices shown are from the dates indicated in the "Data Date" column and may not reflect current market prices.</strong></p>
                  <p>Past performance does not guarantee future results. Always verify current prices and conduct your own research before making investment decisions. Consult with a qualified financial advisor.</p>
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
