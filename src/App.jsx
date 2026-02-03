import React, { useState, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Play, Settings, TrendingUp, Shield, Zap, Target, RefreshCw, CheckCircle, BarChart3, PieChart } from 'lucide-react';

const SP500_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK-B',
  'JPM', 'V', 'WMT', 'JNJ', 'PG', 'XOM', 'KO', 'DIS', 'MCD', 'NFLX',
  'BA', 'IBM', 'INTC', 'AMD', 'CSCO', 'ADBE', 'ORCL', 'CRM', 'PYPL',
  'UBER', 'SPOT', 'SQ', 'F', 'GM', 'T', 'PFE', 'AEP', 'DUK', 'NEE',
  'CVX', 'HD', 'MA', 'UNH', 'PEP', 'COST', 'AVGO', 'LLY'
];

const RISK_FREE_RATE = 0.04;

// Simple seeded random number generator
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
      // Box-Muller transform for normal distribution
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
  // Select random stocks
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
    n_valid_stocks: numStocks,
    min_var_return: minVar.return,
    min_var_volatility: minVar.volatility,
    min_var_sharpe: minVar.sharpe_ratio,
    max_ret_return: maxRet.return,
    max_ret_volatility: maxRet.volatility,
    max_ret_sharpe: maxRet.sharpe_ratio,
    max_sharpe_return: maxSharpe.return,
    max_sharpe_volatility: maxSharpe.volatility,
    max_sharpe_sharpe: maxSharpe.sharpe_ratio,
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
    
    // Use setTimeout to allow UI updates
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <PieChart className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Monte Carlo Portfolio Optimization</h1>
          </div>
          <p className="text-blue-100 text-sm">S&P 500 Portfolio Simulation • Modern Portfolio Theory</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-blue-200">
            <span>• Minimum Variance</span>
            <span>• Maximum Sharpe Ratio</span>
            <span>• Risk-Free Rate: {(RISK_FREE_RATE * 100)}%</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-blue-200"></div>
            <span> Amadea Schaum</span>
        </div>
        
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
                <span>10</span>
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
                <div className="mt-3 text-xs text-slate-600 bg-white/40 rounded-lg p-2 overflow-x-auto"><span className="font-medium">Stocks:</span> {analysis.bestPortfolios.minVar.stocks}</div>
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
                <div className="mt-3 text-xs text-slate-600 bg-white/40 rounded-lg p-2 overflow-x-auto"><span className="font-medium">Stocks:</span> {analysis.bestPortfolios.maxSharpe.stocks}</div>
              </div>
            </div>
            
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
            
            <div className="mt-6 text-center text-sm text-slate-400">
              {numSimulations} simulations • {numStocks} stocks/portfolio • {historyYears} year(s) history • {analysis.successful.length} successful
            </div>
          </>
        )}
        
        {!analysis && !isRunning && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Optimize</h3>
            <p className="text-slate-500 mb-6">Configure parameters and click "Run Monte Carlo" to start.</p>
            <div className="inline-flex flex-col gap-1 text-sm text-slate-400 bg-slate-50 rounded-lg px-6 py-4">
              <span>• {numStocks} stocks per portfolio</span>
              <span>• {numSimulations} simulations</span>
              <span>• {historyYears} year(s) history ({historyYears * 252} trading days)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
