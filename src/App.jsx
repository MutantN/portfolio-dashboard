import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Play, Settings, TrendingUp, Shield, Zap, Target, RefreshCw, CheckCircle, BarChart3, PieChart, AlertTriangle, TrendingDown, Info, Loader2, Wifi, XCircle, SkipForward, Grid3X3 } from 'lucide-react';

const SP500_TICKERS = ['NVDA','AAPL','MSFT','AMZN','GOOGL','GOOG','META','TSLA','AVGO','BRK.B','WMT','LLY','JPM','XOM','V','JNJ','MU','MA','ORCL','COST','ABBV','HD','BAC','PG','CVX','CAT','KO','AMD','GE','NFLX','PLTR','CSCO','MRK','LRCX','PM','AMAT','GS','MS','WFC','RTX','UNH','IBM','TMUS','INTC','MCD','AXP','PEP','LIN','GEV','VZ','TXN','T','AMGN','ABT','NEE','C','GILD','KLAC','BA','TMO','DIS','APH','ANET','CRM','ISRG','TJX','SCHW','BLK','ADI','DE','PGR','SPGI','NOW','BSX','QCOM','LMT','HON','UNP','ADP','PFE','SYK','LOW','ETN','PANW','DHR','COF','MMC','VRTX','COP','MDT','CB','CRWD','BX','ICE','AMT','SO','PLD','BMY','TT','SBUX'];
const RISK_FREE_RATE = 0.04;

// ─── Simulation engine ─────────────────────────────────────────────────────
class SeededRandom{constructor(s){this.seed=s}next(){this.seed=(this.seed*1103515245+12345)&0x7fffffff;return this.seed/0x7fffffff}}
const genRet=(n,d,seed)=>{const rng=new SeededRandom(seed);return Array.from({length:d},()=>Array.from({length:n},()=>{const u1=Math.max(.0001,rng.next()),u2=rng.next();return .0004+Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2)*.02}))};
const calcMean=r=>{const n=r[0].length,d=r.length,m=Array(n).fill(0);r.forEach(day=>day.forEach((v,i)=>m[i]+=v));return m.map(v=>(v/d)*252)};
const calcCov=r=>{const n=r[0].length,d=r.length,mu=r[0].map((_,i)=>r.reduce((s,day)=>s+day[i],0)/d),c=Array(n).fill(null).map(()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<n;j++){let s=0;r.forEach(day=>s+=(day[i]-mu[i])*(day[j]-mu[j]));c[i][j]=(s/(d-1))*252}return c};
const pStats=(w,mu,cv)=>{const ret=w.reduce((s,wi,i)=>s+wi*mu[i],0);let v=0;for(let i=0;i<w.length;i++)for(let j=0;j<w.length;j++)v+=w[i]*w[j]*cv[i][j];const vol=Math.sqrt(Math.max(v,.0001));return{return:ret,volatility:vol,sharpe_ratio:(ret-RISK_FREE_RATE)/vol}};
const randW=(n,rng)=>{const w=Array.from({length:n},()=>rng.next()),s=w.reduce((a,b)=>a+b);return w.map(x=>x/s)};
const optimize=(mu,cv,seed,mode)=>{const n=mu.length,rng=new SeededRandom(seed);let bW=randW(n,rng),bS=pStats(bW,mu,cv);for(let i=0;i<2000;i++){const w=randW(n,rng),s=pStats(w,mu,cv);if(mode==='minVar'?s.volatility<bS.volatility:s.sharpe_ratio>bS.sharpe_ratio){bW=[...w];bS={...s}}}return{weights:bW,...bS}};
const runSim=(id,nS,nD)=>{const rng=new SeededRandom(id*777),tickers=[],used=new Set();while(tickers.length<nS&&tickers.length<SP500_TICKERS.length){const idx=Math.floor(rng.next()*SP500_TICKERS.length);if(!used.has(idx)){used.add(idx);tickers.push(SP500_TICKERS[idx])}}const ret=genRet(nS,nD,id*1000),mu=calcMean(ret),cv=calcCov(ret),mv=optimize(mu,cv,id*100,'minVar'),ms=optimize(mu,cv,id*200,'maxSharpe'),mr=optimize(mu,cv,id*300,'maxSharpe');return{simulation_id:id,stocksList:tickers,covariance_matrix:cv,min_var_return:mv.return,min_var_volatility:mv.volatility,min_var_sharpe:mv.sharpe_ratio,min_var_weights:mv.weights,max_sharpe_return:ms.return,max_sharpe_volatility:ms.volatility,max_sharpe_sharpe:ms.sharpe_ratio,max_sharpe_weights:ms.weights,max_ret_return:mr.return,max_ret_volatility:mr.volatility,max_ret_sharpe:mr.sharpe_ratio,max_ret_weights:mr.weights,status:'SUCCESS'}};
const doAnalyze=results=>{const ok=results.filter(r=>r.status==='SUCCESS');if(!ok.length)return null;const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,std=a=>{const m=avg(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length)};const cr={'Min Variance':{R:ok.map(r=>r.min_var_return),V:ok.map(r=>r.min_var_volatility),S:ok.map(r=>r.min_var_sharpe)},'Max Return':{R:ok.map(r=>r.max_ret_return),V:ok.map(r=>r.max_ret_volatility),S:ok.map(r=>r.max_ret_sharpe)},'Max Sharpe':{R:ok.map(r=>r.max_sharpe_return),V:ok.map(r=>r.max_sharpe_volatility),S:ok.map(r=>r.max_sharpe_sharpe)}};const st={};Object.entries(cr).forEach(([k,d])=>{st[k]={avgReturn:avg(d.R),stdReturn:std(d.R),avgVolatility:avg(d.V),stdVolatility:std(d.V),avgSharpe:avg(d.S),stdSharpe:std(d.S),maxReturn:Math.max(...d.R),minReturn:Math.min(...d.R),maxSharpe:Math.max(...d.S),minSharpe:Math.min(...d.S)}});return{statistics:st,bestMinVar:ok[ok.reduce((b,r,i)=>r.min_var_sharpe>ok[b].min_var_sharpe?i:b,0)],bestMaxSharpe:ok[ok.reduce((b,r,i)=>r.max_sharpe_sharpe>ok[b].max_sharpe_sharpe?i:b,0)],successful:ok}};
const histogram=(data,bins=15)=>{const v=(data||[]).filter(d=>isFinite(d));if(!v.length)return[];const mn=Math.min(...v),mx=Math.max(...v),bw=(mx-mn)/bins||.01,h=Array(bins).fill(0);v.forEach(d=>h[Math.max(0,Math.min(Math.floor((d-mn)/bw),bins-1))]++);return h.map((c,i)=>({range:(mn+i*bw).toFixed(2),count:c,value:mn+(i+.5)*bw}))};

// ─── Finnhub (server-side endpoint via /api/quotes) ───────────────────────

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const PRICE_CACHE_KEY = 'portfolio_dashboard_finnhub_cache_v1';
const PROVIDER_COOLDOWN_MS = 5 * 60 * 1000;
let providerBlockedUntil = 0;
let providerBlockReason = '';

function sleep(ms, signal) {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function retryAfterMs(headerVal) {
  if (!headerVal) return null;
  const n = Number(headerVal);
  if (Number.isFinite(n)) return Math.max(0, n * 1000);
  const abs = Date.parse(headerVal);
  if (!Number.isNaN(abs)) return Math.max(0, abs - Date.now());
  return null;
}

function isProviderBlocked() {
  return Date.now() < providerBlockedUntil;
}

function noteProviderBlocked(reason, retryAfter) {
  const wait = Number.isFinite(retryAfter) ? Math.max(30 * 1000, retryAfter) : PROVIDER_COOLDOWN_MS;
  providerBlockedUntil = Date.now() + wait;
  providerBlockReason = reason || 'Provider returned HTTP 429';
}

function loadPriceCache() {
  try {
    const raw = localStorage.getItem(PRICE_CACHE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return (data && typeof data === 'object') ? data : {};
  } catch {
    return {};
  }
}

function savePriceCache(dataByTicker) {
  try {
    const existing = loadPriceCache();
    const merged = { ...existing, ...dataByTicker };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(merged));
  } catch {
    // ignore storage failures
  }
}

function buildAnalysisDataFromRaw(raw, ticker, sourceLabel = 'Finnhub') {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const marketDate = raw.time
    ? new Date(raw.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : dateStr;
  const prev = Number(raw.prev) || 0;
  const price = Number(raw.price) || 0;
  const change = prev > 0 ? ((price / prev - 1) * 100).toFixed(2) : 0;
  const targetPrice = Number(raw.targetPrice) || 0;
  const upside = price > 0 && targetPrice > 0 ? ((targetPrice / price - 1) * 100) : 0;
  const rating = raw.rating || 'N/A';
  const analystCount = Number(raw.analystCount) || 0;
  const name = raw.name || ticker;
  return {
    latestPrice: price,
    priceSource: `${sourceLabel} (${raw.exchange || 'LIVE'})`,
    priceDate: marketDate,
    targetPrice,
    targetSource: targetPrice > 0 ? 'FMP Consensus' : 'N/A',
    targetDate: raw.targetDate || marketDate,
    entryPrice: +(price * 0.95).toFixed(2),
    entrySource: 'Calculated: 5% below current',
    entryDate: marketDate,
    rating,
    ratingSource: rating !== 'N/A' ? 'FMP' : 'N/A',
    ratingDate: raw.ratingDate || marketDate,
    analystCount,
    upside,
    upsideSource: targetPrice > 0 ? 'Derived from FMP target' : 'N/A',
    upsideDate: targetPrice > 0 ? (raw.targetDate || marketDate) : 'N/A',
    reasoning: `${name}: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change}% vs prev $${prev.toFixed(2)})${targetPrice > 0 ? `, target $${targetPrice.toFixed(2)}` : ''}`,
    reasoningSource: 'Finnhub',
    reasoningDate: marketDate,
    sentiment: rating === 'Strong Buy' || rating === 'Buy' ? 'Bullish' : rating === 'Sell' || rating === 'Strong Sell' ? 'Bearish' : 'Neutral',
    catalysts: [name, `Prev $${prev.toFixed(2)}`, ...(targetPrice > 0 ? [`Target $${targetPrice.toFixed(2)}`] : [])]
  };
}

async function fetchWithRetry(url, signal, { attempts = 4, baseDelayMs = 450 } = {}) {
  if (isProviderBlocked()) {
    throw new Error(`PROVIDER_BLOCKED:${providerBlockReason}`);
  }
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const res = await fetch(url, { signal });
      if (res.ok) return res;
      if (res.status === 429) {
        noteProviderBlocked('Finnhub rate limited (429)', retryAfterMs(res.headers.get('retry-after')));
        throw new Error('429');
      }
      if (!RETRYABLE.has(res.status) || i === attempts - 1) {
        throw new Error(`${res.status}`);
      }
      const retryMs = retryAfterMs(res.headers.get('retry-after'));
      const backoff = retryMs ?? Math.min(5000, baseDelayMs * (2 ** i)) + Math.floor(Math.random() * 200);
      await sleep(backoff, signal);
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      lastErr = e;
      if (i === attempts - 1) throw e;
      await sleep(Math.min(5000, baseDelayMs * (2 ** i)) + Math.floor(Math.random() * 200), signal);
    }
  }
  throw lastErr || new Error('fetch failed');
}

async function fetchFinnhubBatchQuotes(tickers, signal) {
  if (!tickers.length) return {};
  const symbols = tickers.map((t) => t.trim().toUpperCase()).filter(Boolean).join(',');
  const res = await fetchWithRetry(`/api/quotes?symbols=${encodeURIComponent(symbols)}`, signal, { attempts: 3, baseDelayMs: 500 });
  const json = await res.json();
  const out = {};
  for (const [ticker, q] of Object.entries(json.quotes || {})) {
    if (!q?.price || q.price <= 0) continue;
    out[ticker] = {
      price: Number(q.price),
      prev: Number(q.prev) || 0,
      name: q.name || ticker,
      exchange: q.exchange || '',
      time: Number(q.time) || Math.floor(Date.now() / 1000),
      targetPrice: Number(q.targetPrice) || 0,
      targetDate: q.targetDate || '',
      analystCount: Number(q.analystCount) || 0,
      rating: q.rating || 'N/A',
      ratingDate: q.ratingDate || '',
    };
  }
  return out;
}

async function fetchAllLiveData(tickers, signal, onEach) {
  const results = {};
  const BATCH_SIZE = 25;
  const PAUSE_MS = 300;
  const priceCache = loadPriceCache();
  const cacheUpdates = {};

  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    if (signal?.aborted) break;
    const batch = tickers.slice(i, i + BATCH_SIZE);

    let batchQuotes = {};
    try {
      batchQuotes = await fetchFinnhubBatchQuotes(batch, signal);
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      console.warn('[Finnhub] batch quote failed:', e.message);
      if (String(e?.message || '').startsWith('PROVIDER_BLOCKED:')) {
        break;
      }
    }

    for (const t of batch) {
      const raw = batchQuotes[t];
      if (!raw) continue;
      const finalData = buildAnalysisDataFromRaw(raw, t, 'Finnhub');
      results[t] = finalData;
      cacheUpdates[t] = finalData;
      if (onEach) onEach(t, finalData, Object.keys(results).length, tickers.length);
    }
    if (i + BATCH_SIZE < tickers.length) await sleep(PAUSE_MS, signal);
  }

  if (Object.keys(cacheUpdates).length) {
    savePriceCache(cacheUpdates);
  }

  // If provider is blocked/unavailable, backfill missing tickers from cache.
  if (isProviderBlocked() || Object.keys(results).length < tickers.length) {
    for (const t of tickers) {
      if (results[t]) continue;
      const cached = priceCache[t];
      if (!cached) continue;
      const stale = {
        ...cached,
        priceSource: `${cached.priceSource || 'Cached'} - Cached`,
        reasoningSource: 'Local Cache',
        sentiment: cached.sentiment || 'Neutral',
      };
      results[t] = stale;
      if (onEach) onEach(t, stale, Object.keys(results).length, tickers.length);
    }
  }

  return results;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function calcRiskReward(a) {
  if (!a) return null;
  const risk = a.latestPrice - a.entryPrice;
  const reward = a.targetPrice - a.entryPrice;
  if (risk === 0) return Infinity;
  return Math.abs(reward / risk);
}

// ─── UI Components ─────────────────────────────────────────────────────────

const RatingBadge = ({ rating }) => {
  const c = { 'Strong Buy':'bg-emerald-500 text-white','Buy':'bg-green-400 text-white','Hold':'bg-amber-400 text-slate-900','Sell':'bg-red-400 text-white','Strong Sell':'bg-red-600 text-white' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c[rating]||'bg-slate-300 text-slate-600'}`}>{rating}</span>;
};

const SentimentDot = ({ sentiment }) => {
  const cfg = { 'Very Bullish':{c:'text-emerald-600',I:TrendingUp,b:'bg-emerald-50'},'Bullish':{c:'text-green-600',I:TrendingUp,b:'bg-green-50'},'Neutral to Bullish':{c:'text-lime-600',I:TrendingUp,b:'bg-lime-50'},'Neutral':{c:'text-slate-600',I:Target,b:'bg-slate-50'},'Mixed':{c:'text-amber-600',I:AlertTriangle,b:'bg-amber-50'},'Bearish':{c:'text-red-600',I:TrendingDown,b:'bg-red-50'} };
  const { c:color, I:Icon, b:bg } = cfg[sentiment]||cfg['Neutral'];
  return <div className={`flex items-center gap-1 ${bg} ${color} px-2 py-1 rounded-lg text-xs font-medium`}><Icon className="w-3 h-3"/>{sentiment}</div>;
};

const CovarianceMatrixDisplay = ({ title, stocks, covMatrix, colorClass, borderColor, bgGradient }) => {
  const [expanded, setExpanded] = useState(false);
  if (!stocks || !covMatrix || !covMatrix.length) return null;
  const n = stocks.length;
  const allVals = []; for (let i=0;i<n;i++) for (let j=0;j<n;j++) allVals.push(covMatrix[i][j]);
  const minVal = Math.min(...allVals), maxVal = Math.max(...allVals), range = maxVal - minVal || 1;
  const getCellBg = (val) => { const t = (val-minVal)/range; const r=Math.round(t<0.5?220+(255-220)*(t/0.5):255-(255-239)*((t-0.5)/0.5)); const g=Math.round(t<0.5?230+(255-230)*(t/0.5):255-(255-200)*((t-0.5)/0.5)); const b=Math.round(t<0.5?255:255-(255-200)*((t-0.5)/0.5)); return `rgb(${r},${g},${b})`; };
  const diagVals = stocks.map((_,i) => covMatrix[i][i]);
  return (
    <div className={`bg-white rounded-2xl shadow-lg border ${borderColor} overflow-hidden`}>
      <button onClick={()=>setExpanded(!expanded)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgGradient}`}><Grid3X3 className={`w-5 h-5 ${colorClass}`}/></div>
          <div className="text-left"><h3 className="font-semibold text-slate-800">{title}</h3><p className="text-xs text-slate-500">{n}x{n} annualized covariance matrix</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-500"><div>Range: {(minVal*100).toFixed(2)}% - {(maxVal*100).toFixed(2)}%</div><div>Avg var: {(diagVals.reduce((a,b)=>a+b,0)/diagVals.length*100).toFixed(2)}%</div></div>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${expanded?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg border border-slate-200">
            <table className="text-xs border-collapse" style={{minWidth:`${(n+1)*70}px`}}>
              <thead className="sticky top-0 z-10"><tr><th className="px-2 py-2 bg-slate-100 border-b border-r border-slate-200 text-slate-600 font-semibold sticky left-0 z-20 min-w-[60px]">Cov</th>{stocks.map((s,j)=>(<th key={j} className="px-2 py-2 bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold min-w-[65px] text-center">{s}</th>))}</tr></thead>
              <tbody>{stocks.map((rs,i)=>(<tr key={i}><td className="px-2 py-1.5 font-semibold text-slate-600 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">{rs}</td>{stocks.map((_,j)=>{const val=covMatrix[i][j];return(<td key={j} className={`px-2 py-1.5 text-center font-mono border-b border-slate-100 ${i===j?'font-bold':''}`} style={{background:getCellBg(val)}} title={`Cov(${stocks[i]},${stocks[j]})=${val.toFixed(6)}`}>{(val*100).toFixed(2)}</td>)})}</tr>))}</tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-xs text-slate-500">Min Cov</div><div className="font-bold text-blue-600 font-mono">{(minVal*100).toFixed(4)}%</div></div>
            <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-xs text-slate-500">Max Cov</div><div className="font-bold text-red-600 font-mono">{(maxVal*100).toFixed(4)}%</div></div>
            <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-xs text-slate-500">Avg Var</div><div className="font-bold text-slate-700 font-mono">{(diagVals.reduce((a,b)=>a+b,0)/diagVals.length*100).toFixed(4)}%</div></div>
            <div className="bg-slate-50 rounded-lg p-3 text-center"><div className="text-xs text-slate-500">Avg Off-Diag</div><div className="font-bold text-slate-700 font-mono">{(()=>{let s=0,c=0;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i!==j){s+=covMatrix[i][j];c++}return(s/c*100).toFixed(4)})()}%</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

const WeightsTable = ({ title, stocks, weights, colorClass, data, loading }) => {
  if (!stocks || !weights) return null;
  const items = stocks.map((s,i) => ({s,w:weights[i]||0,a:data[s]||null})).sort((a,b)=>b.w-a.w);
  const [exp, setExp] = useState(null);
  const hasData = items.some(x => x.a);
  const dot = loading ? '...' : '\u2014';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-slate-800 ${colorClass}`}>{title}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {loading && <><Loader2 className="w-3 h-3 animate-spin"/>Fetching...</>}
          {!loading && hasData && <><Wifi className="w-3 h-3 text-emerald-500"/>Live</>}
          {!loading && !hasData && <><Info className="w-4 h-4"/>Awaiting data</>}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10"><tr>
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600">Stock</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-slate-600">Weight</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-slate-600">Price</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-emerald-600">Entry</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-blue-600">Target</th>
            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-600">Rating</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-slate-600">Upside</th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-indigo-600">R/R</th>
          </tr></thead>
          <tbody>{items.map(({s,w,a},i)=>{
            const pending=!a;
            const rr=calcRiskReward(a);
            const rrDisplay=rr===null?dot:rr===Infinity?'\u221E:1':`${rr.toFixed(1)}:1`;
            const rrColor=rr===null?'text-slate-300':rr>=3?'text-emerald-600':rr>=1.5?'text-indigo-600':rr>=1?'text-amber-600':'text-red-500';
            return(
              <React.Fragment key={s}>
                <tr className={`cursor-pointer hover:bg-slate-100 transition ${i%2?'bg-slate-50/50':''} ${exp===s?'bg-blue-50':''}`} onClick={()=>setExp(exp===s?null:s)}>
                  <td className="px-2 py-2 font-semibold text-slate-700">{s}</td>
                  <td className="px-2 py-2 text-right font-mono">{(w*100).toFixed(1)}%</td>
                  <td className="px-2 py-2 text-right">{pending?<span className="text-slate-300 text-xs">{dot}</span>:<div className="font-mono text-slate-600">${a.latestPrice.toFixed(2)}<div className="text-xs text-slate-400">{a.priceDate}</div></div>}</td>
                  <td className="px-2 py-2 text-right">{pending?<span className="text-slate-300 text-xs">{dot}</span>:<div className="font-mono font-semibold text-emerald-600">${a.entryPrice.toFixed(2)}<div className="text-xs text-slate-400">{a.entryDate || a.priceDate}</div></div>}</td>
                  <td className="px-2 py-2 text-right">{pending?<span className="text-slate-300 text-xs">{dot}</span>:a.targetPrice>0?<div className="font-mono text-blue-600">${a.targetPrice.toFixed(2)}<div className="text-xs text-slate-400">{a.targetDate || a.priceDate}</div></div>:<span className="text-slate-300 text-xs">\u2014</span>}</td>
                  <td className="px-2 py-2 text-center">{pending?<span className="text-xs text-slate-300">{dot}</span>:a.rating!=='N/A'?<div className="inline-flex flex-col items-center gap-1"><RatingBadge rating={a.rating}/><span className="text-[10px] text-slate-400">{a.ratingDate || a.priceDate}</span></div>:<span className="text-slate-300 text-xs">\u2014</span>}</td>
                  <td className={`px-2 py-2 text-right ${!pending&&a.upside>0?'text-emerald-600':!pending&&a.upside<0?'text-red-500':'text-slate-300'}`}>{pending?dot:a.upside!==0?<span className="font-semibold">{a.upside>=0?'+':''}{a.upside.toFixed(1)}%</span>:'\u2014'}</td>
                  <td className={`px-2 py-2 text-right font-semibold ${rrColor}`}>{a?.targetPrice>0?rrDisplay:pending?dot:'\u2014'}</td>
                </tr>
                {exp===s&&!pending&&(
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50"><td colSpan={8} className="px-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><SentimentDot sentiment={a.sentiment}/><span className="text-xs text-slate-500">{a.analystCount>0?`${a.analystCount} analysts`:'Price data only'}</span></div>
                      <div className="bg-white/70 rounded-lg p-3 border border-blue-100"><p className="text-sm text-slate-700">{a.reasoning}</p><p className="text-xs text-slate-400 mt-1">Source: {a.priceSource}</p></div>
                      <div className="flex flex-wrap gap-2"><span className="text-xs text-slate-500 font-medium">Info:</span>{a.catalysts.map((c,j)=><span key={j} className="px-2 py-0.5 bg-white/80 border border-slate-200 rounded-full text-xs text-slate-600">{c}</span>)}</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-white/60 rounded-lg"><div className="text-xs text-slate-500">Entry Discount</div><div className="font-bold text-emerald-600">{a.latestPrice>0?((1-a.entryPrice/a.latestPrice)*100).toFixed(1):'0'}%</div></div>
                        <div className="text-center p-2 bg-white/60 rounded-lg"><div className="text-xs text-slate-500">Source</div><div className="font-bold text-blue-600 text-xs">{a.priceSource}</div></div>
                        <div className="text-center p-2 bg-white/60 rounded-lg"><div className="text-xs text-slate-500">Market Date</div><div className="font-bold text-slate-600 text-xs">{a.priceDate}</div></div>
                      </div>
                    </div>
                  </td></tr>
                )}
              </React.Fragment>
            )})}</tbody>
        </table>
      </div>
      {hasData&&!loading&&(
        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
          <div><div className="text-xs text-slate-500">Avg Entry Disc.</div><div className="font-bold text-emerald-600">{(items.filter(x=>x.a&&x.a.latestPrice>0).reduce((s,x)=>s+(1-x.a.entryPrice/x.a.latestPrice),0)/Math.max(1,items.filter(x=>x.a&&x.a.latestPrice>0).length)*100).toFixed(1)}%</div></div>
          <div><div className="text-xs text-slate-500">Wtd Upside</div><div className="font-bold text-blue-600">{items.filter(x=>x.a&&x.a.upside).reduce((s,x)=>s+x.w*x.a.upside,0).toFixed(1)}%</div></div>
          <div><div className="text-xs text-slate-500">Avg Price</div><div className="font-bold text-slate-700">${(items.filter(x=>x.a).reduce((s,x)=>s+x.a.latestPrice,0)/Math.max(1,items.filter(x=>x.a).length)).toFixed(2)}</div></div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function PortfolioDashboard() {
  const [numStocks, setNumStocks] = useState(15);
  const [numSims, setNumSims] = useState(50);
  const [histYrs, setHistYrs] = useState(2);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [curSim, setCurSim] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [liveData, setLiveData] = useState({});
  const [fetching, setFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [fetchMsg, setFetchMsg] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    console.log('%c[Market Data] /api/quotes endpoint requires FINNHUB_API_KEY. Add FMP_API_KEY to populate target/rating/upside fields.', 'color:#10b981;font-size:11px');
  }, []);

  const skip = useCallback(() => { abortRef.current?.abort(); setFetching(false); setFetchStatus(Object.keys(liveData).length>0?'partial':'skipped'); }, [liveData]);

  const doFetch = useCallback(async (tickers) => {
    const ac = new AbortController(); abortRef.current = ac;
    setFetching(true); setFetchStatus('loading'); setFetchError(null);
    setFetchMsg(`Fetching ${tickers.length} tickers from Finnhub...`);
    try {
      const result = await fetchAllLiveData(tickers, ac.signal, (ticker, data, loaded, total) => {
        setLiveData(prev => ({ ...prev, [ticker]: data }));
        setFetchMsg(`Finnhub: ${loaded}/${total} (${ticker} \u2713)`);
      });
      const loaded = Object.keys(result).length;
      const missing = tickers.filter(t => !result[t]);
      setFetching(false);
      if (missing.length === 0) { setFetchStatus('success'); setFetchMsg(`All ${loaded} tickers loaded \u2713`); }
      else { setFetchStatus('partial'); setFetchError(`${loaded}/${tickers.length} loaded. Failed: ${missing.join(', ')}`); }
    } catch (err) {
      setFetching(false);
      if (err.name === 'AbortError') return;
      setFetchStatus('error'); setFetchError(err.message);
    }
  }, []);

  const retry = useCallback(() => {
    if (!analysis) return;
    const all = [...new Set([...(analysis.bestMinVar?.stocksList||[]),...(analysis.bestMaxSharpe?.stocksList||[])])].filter(t=>!liveData[t]);
    if (!all.length) { setFetchStatus('success'); return; }
    doFetch(all);
  }, [analysis, liveData, doFetch]);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    setRunning(true); setProgress(0); setCurSim(0);
    setAnalysis(null); setLiveData({}); setFetchStatus(null); setFetchError(null);
    const nDays = Math.floor(histYrs*252), results = [];
    for (let i=0; i<numSims; i++) { await new Promise(r=>setTimeout(r,1)); results.push(runSim(i,numStocks,nDays)); setProgress(((i+1)/numSims)*100); setCurSim(i+1); }
    const a = doAnalyze(results);
    setAnalysis(a); setRunning(false);
    if (a) { const all=[...new Set([...(a.bestMinVar?.stocksList||[]),...(a.bestMaxSharpe?.stocksList||[])])]; if(all.length) doFetch(all); }
  }, [numStocks, numSims, histYrs, doFetch]);

  const fmt=v=>(v==null||!isFinite(v))?'N/A':`${(v*100).toFixed(2)}%`;
  const fN=v=>(v==null||!isFinite(v))?'N/A':v.toFixed(3);
  const scatter=analysis?{mv:analysis.successful.map(r=>({x:r.min_var_volatility*100,y:r.min_var_return*100})).filter(d=>isFinite(d.x)),ms:analysis.successful.map(r=>({x:r.max_sharpe_volatility*100,y:r.max_sharpe_return*100})).filter(d=>isFinite(d.x))}:null;
  const histo=analysis?{sharpe:histogram(analysis.successful.map(r=>r.max_sharpe_sharpe)),mvRet:histogram(analysis.successful.map(r=>r.min_var_return*100)),msRet:histogram(analysis.successful.map(r=>r.max_sharpe_return*100))}:null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2"><PieChart className="w-8 h-8"/><h1 className="text-2xl md:text-3xl font-bold">Monte Carlo Portfolio Optimization</h1></div>
          <p className="text-blue-100 text-sm">S&P 500 Simulation &bull; Modern Portfolio Theory &bull; Finnhub Live Data</p>
          <p className="text-blue-200 text-xs mt-1">Author: Amadea Schaum</p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-5"><Settings className="w-5 h-5 text-slate-600"/><h2 className="text-lg font-semibold text-slate-800">Parameters</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[{l:`Stocks: ${numStocks}`,v:numStocks,set:setNumStocks,mn:5,mx:20,st:1,lo:'5',hi:'20'},{l:`Sims: ${numSims}`,v:numSims,set:setNumSims,mn:10,mx:5000,st:10,lo:'10',hi:'5000'},{l:`History: ${histYrs}yr`,v:histYrs,set:setHistYrs,mn:1,mx:10,st:1,lo:'1yr',hi:'10yr'}].map(({l,v,set,mn,mx,st,lo,hi})=>(
              <div key={l} className="space-y-2"><label className="block text-sm font-medium text-slate-700">{l}</label><input type="range" min={mn} max={mx} step={st} value={v} onChange={e=>set(+e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" disabled={running}/><div className="flex justify-between text-xs text-slate-500"><span>{lo}</span><span>{hi}</span></div></div>
            ))}
            <div className="flex items-end">
              <button onClick={run} disabled={running||fetching} className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all ${running||fetching?'bg-slate-200 text-slate-500':'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'}`}>
                {running?<><RefreshCw className="w-5 h-5 animate-spin"/>Running...</>:<><Play className="w-5 h-5"/>Run Monte Carlo</>}
              </button>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-500"/><span className="text-sm text-slate-600">Finnhub + FMP API</span><span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Server Keys &bull; Cached</span></div>
            {analysis&&!fetching&&<button onClick={()=>{setLiveData({});const all=[...new Set([...(analysis.bestMinVar?.stocksList||[]),...(analysis.bestMaxSharpe?.stocksList||[])])];doFetch(all);}} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"><RefreshCw className="w-3 h-3"/>Refresh</button>}
          </div>
          {running&&(<div className="mt-5 bg-slate-50 rounded-lg p-4"><div className="flex justify-between text-sm text-slate-600 mb-2"><span>Simulation</span><span>[{curSim}/{numSims}] {progress.toFixed(0)}%</span></div><div className="w-full bg-slate-200 rounded-full h-3"><div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-3 rounded-full transition-all" style={{width:`${progress}%`}}/></div></div>)}
        </div>

        {fetchStatus&&(
          <div className={`mb-6 rounded-xl border ${fetchStatus==='loading'?'bg-blue-50 border-blue-200':fetchStatus==='success'?'bg-emerald-50 border-emerald-200':fetchStatus==='partial'?'bg-amber-50 border-amber-200':fetchStatus==='skipped'?'bg-slate-50 border-slate-200':'bg-red-50 border-red-200'}`}>
            <div className="p-4 flex items-start gap-3">
              <div className="flex-1">
                {fetchStatus==='loading'&&<div className="flex items-center gap-2 text-blue-800"><Loader2 className="w-5 h-5 animate-spin flex-shrink-0"/><span className="text-sm">{fetchMsg}</span></div>}
                {fetchStatus==='success'&&<div className="flex items-center gap-2 text-emerald-800"><Wifi className="w-5 h-5"/><span className="font-medium">{fetchMsg}</span></div>}
                {fetchStatus==='partial'&&<div className="flex items-center gap-2 text-amber-800"><AlertTriangle className="w-5 h-5"/><span><b>Partial:</b> {fetchError}</span></div>}
                {fetchStatus==='skipped'&&<div className="flex items-center gap-2 text-slate-600"><SkipForward className="w-5 h-5"/>Skipped.</div>}
                {fetchStatus==='error'&&<div className="text-red-800"><div className="flex items-center gap-2"><XCircle className="w-5 h-5"/><b>Failed:</b> {fetchError}</div></div>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {fetchStatus==='loading'&&<button onClick={skip} className="px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 flex items-center gap-1"><SkipForward className="w-3 h-3"/>Skip</button>}
                {['error','partial','skipped'].includes(fetchStatus)&&<button onClick={retry} className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-1"><RefreshCw className="w-3 h-3"/>Retry</button>}
              </div>
            </div>
          </div>
        )}

        {analysis && (()=>{
          const bMV=analysis.bestMinVar, bMS=analysis.bestMaxSharpe;
          return (<>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {[{k:'Min Variance',I:Shield,ib:'bg-emerald-100',ic:'text-emerald-600',vc:'text-emerald-600'},{k:'Max Sharpe',I:Zap,ib:'bg-amber-100',ic:'text-amber-600',vc:'text-amber-600'},{k:'Max Return',I:TrendingUp,ib:'bg-blue-100',ic:'text-blue-600',vc:'text-blue-600'}].map(({k,I,ib,ic,vc})=>(
                <div key={k} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-4"><div className={`p-2 ${ib} rounded-lg`}><I className={`w-5 h-5 ${ic}`}/></div><h3 className="font-semibold text-slate-800">{k}</h3></div>
                  <div className="space-y-3"><div className="flex justify-between"><span className="text-sm text-slate-500">Avg Return</span><span className={`font-semibold ${vc}`}>{fmt(analysis.statistics[k].avgReturn)}</span></div><div className="flex justify-between"><span className="text-sm text-slate-500">Avg Vol</span><span className="font-semibold">{fmt(analysis.statistics[k].avgVolatility)}</span></div><div className="flex justify-between"><span className="text-sm text-slate-500">Avg Sharpe</span><span className={`font-bold text-lg ${vc}`}>{fN(analysis.statistics[k].avgSharpe)}</span></div></div>
                </div>))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[{p:bMV,l:'Best Min Variance',bg:'from-emerald-50 to-teal-50',bc:'border-emerald-200',ic:'text-emerald-600',badge:'bg-emerald-200 text-emerald-700',vc:'text-emerald-700',I:CheckCircle,rK:'min_var_return',vK:'min_var_volatility',sK:'min_var_sharpe'},{p:bMS,l:'Best Max Sharpe',bg:'from-amber-50 to-orange-50',bc:'border-amber-200',ic:'text-amber-600',badge:'bg-amber-200 text-amber-700',vc:'text-amber-700',I:Target,rK:'max_sharpe_return',vK:'max_sharpe_volatility',sK:'max_sharpe_sharpe'}].map(({p,l,bg,bc,ic,badge,vc,I,rK,vK,sK})=>(
                <div key={l} className={`bg-gradient-to-br ${bg} rounded-2xl p-5 border ${bc}`}>
                  <div className="flex items-center gap-2 mb-3"><I className={`w-5 h-5 ${ic}`}/><h3 className="font-semibold text-slate-800">{l}</h3><span className={`text-xs ${badge} px-2 py-0.5 rounded-full ml-auto`}>#{p.simulation_id}</span></div>
                  <div className="grid grid-cols-3 gap-3 text-center"><div className="bg-white/60 rounded-lg p-3"><div className={`text-lg font-bold ${vc}`}>{fmt(p[rK])}</div><div className="text-xs text-slate-500">Return</div></div><div className="bg-white/60 rounded-lg p-3"><div className="text-lg font-bold text-slate-700">{fmt(p[vK])}</div><div className="text-xs text-slate-500">Vol</div></div><div className="bg-white/60 rounded-lg p-3"><div className={`text-lg font-bold ${vc}`}>{fN(p[sK])}</div><div className="text-xs text-slate-500">Sharpe</div></div></div>
                </div>))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
              <WeightsTable title="Min Variance \u2013 Live Prices" stocks={bMV.stocksList} weights={bMV.min_var_weights} colorClass="text-emerald-600" data={liveData} loading={fetching}/>
              <WeightsTable title="Max Sharpe \u2013 Live Prices" stocks={bMS.stocksList} weights={bMS.max_sharpe_weights} colorClass="text-amber-600" data={liveData} loading={fetching}/>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <CovarianceMatrixDisplay title="Min Variance \u2013 Covariance Matrix" stocks={bMV.stocksList} covMatrix={bMV.covariance_matrix} colorClass="text-emerald-600" borderColor="border-emerald-200" bgGradient="bg-emerald-100"/>
              <CovarianceMatrixDisplay title="Max Sharpe \u2013 Covariance Matrix" stocks={bMS.stocksList} covMatrix={bMS.covariance_matrix} colorClass="text-amber-600" borderColor="border-amber-200" bgGradient="bg-amber-100"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200"><h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400"/>Efficient Frontier</h3><ResponsiveContainer width="100%" height={280}><ScatterChart margin={{top:10,right:10,bottom:40,left:50}}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="x" type="number" unit="%" domain={['auto','auto']} tick={{fontSize:11}} label={{value:'Volatility (%)',position:'insideBottom',offset:-10,fontSize:12}}/><YAxis dataKey="y" type="number" unit="%" domain={['auto','auto']} tick={{fontSize:11}} label={{value:'Return (%)',angle:-90,position:'insideLeft',fontSize:12}}/><Tooltip formatter={v=>[`${Number(v).toFixed(2)}%`]}/><Legend wrapperStyle={{fontSize:12}}/><Scatter name="Min Var" data={scatter.mv} fill="#10b981" fillOpacity={0.6}/><Scatter name="Max Sharpe" data={scatter.ms} fill="#f59e0b" fillOpacity={0.6}/></ScatterChart></ResponsiveContainer></div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200"><h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400"/>Sharpe Distribution</h3><ResponsiveContainer width="100%" height={280}><BarChart data={histo.sharpe} margin={{top:10,right:10,bottom:40,left:50}}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="range" tick={{fontSize:10}} label={{value:'Sharpe',position:'insideBottom',offset:-10,fontSize:12}}/><YAxis tick={{fontSize:11}} label={{value:'Freq',angle:-90,position:'insideLeft',fontSize:12}}/><Tooltip/><Bar dataKey="count" radius={[4,4,0,0]}>{histo.sharpe.map((e,i)=><Cell key={i} fill={e.value>analysis.statistics['Max Sharpe'].avgSharpe?'#f59e0b':'#fcd34d'}/>)}</Bar></BarChart></ResponsiveContainer></div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200"><h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400"/>Returns (Min Var)</h3><ResponsiveContainer width="100%" height={280}><BarChart data={histo.mvRet} margin={{top:10,right:10,bottom:40,left:50}}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="range" tick={{fontSize:10}} label={{value:'Return (%)',position:'insideBottom',offset:-10,fontSize:12}}/><YAxis tick={{fontSize:11}} label={{value:'Freq',angle:-90,position:'insideLeft',fontSize:12}}/><Tooltip/><Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200"><h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400"/>Returns (Max Sharpe)</h3><ResponsiveContainer width="100%" height={280}><BarChart data={histo.msRet} margin={{top:10,right:10,bottom:40,left:50}}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="range" tick={{fontSize:10}} label={{value:'Return (%)',position:'insideBottom',offset:-10,fontSize:12}}/><YAxis tick={{fontSize:11}} label={{value:'Freq',angle:-90,position:'insideLeft',fontSize:12}}/><Tooltip/><Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 mb-6"><h3 className="font-semibold text-slate-800 mb-4">Statistics</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50"><th className="px-4 py-3 text-left text-slate-600">Metric</th><th className="px-4 py-3 text-center text-emerald-600">Min Var</th><th className="px-4 py-3 text-center text-amber-600">Max Sharpe</th><th className="px-4 py-3 text-center text-blue-600">Max Return</th></tr></thead><tbody>{[{l:'Avg Return',k:'avgReturn',f:fmt},{l:'Std Dev',k:'stdReturn',f:fmt},{l:'Avg Vol',k:'avgVolatility',f:fmt},{l:'Avg Sharpe',k:'avgSharpe',f:fN},{l:'Max Sharpe',k:'maxSharpe',f:fN},{l:'Min Sharpe',k:'minSharpe',f:fN}].map((r,i)=>(<tr key={r.k} className={i%2?'bg-slate-50/50':''}><td className="px-4 py-3 text-slate-600 font-medium">{r.l}</td><td className="px-4 py-3 text-center">{r.f(analysis.statistics['Min Variance'][r.k])}</td><td className="px-4 py-3 text-center">{r.f(analysis.statistics['Max Sharpe'][r.k])}</td><td className="px-4 py-3 text-center">{r.f(analysis.statistics['Max Return'][r.k])}</td></tr>))}</tbody></table></div></div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4"><div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"/><div className="text-sm text-amber-800"><p className="font-semibold mb-1">Disclaimer</p><p>Prices from Finnhub and analyst fields from FMP (or local cache if unavailable). <b>Verify before trading.</b> Not financial advice.</p></div></div></div>
            <div className="text-center text-sm text-slate-400">{numSims} sims &bull; {numStocks} stocks &bull; {histYrs}yr &bull; {analysis.successful.length} ok {Object.keys(liveData).length>0&&<span className="text-emerald-500">&bull; {Object.keys(liveData).length} tickers live</span>}</div>
          </>);
        })()}

        {!analysis&&!running&&(
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5"><TrendingUp className="w-10 h-10 text-indigo-500"/></div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Optimize</h3>
            <p className="text-slate-500 mb-4">Click Run. Live prices auto-fetch from Finnhub (server-side API key required).</p>
          </div>
        )}
      </div>
    </div>
  );
}
