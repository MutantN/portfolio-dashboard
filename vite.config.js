import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function normalizeRating(value) {
  if (!value) return "N/A";
  const v = String(value).toLowerCase();
  if (v.includes("strong buy")) return "Strong Buy";
  if (v.includes("buy")) return "Buy";
  if (v.includes("hold") || v.includes("neutral")) return "Hold";
  if (v.includes("strong sell")) return "Strong Sell";
  if (v.includes("sell")) return "Sell";
  return "N/A";
}

function pickFirstNumber(obj, keys) {
  for (const k of keys) {
    const n = Number(obj?.[k]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function pickFirstString(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

async function fetchFmpJson(url) {
  const r = await fetch(url);
  if (!r.ok) return null;
  const json = await r.json();
  if (json && typeof json === "object" && !Array.isArray(json) && (json["Error Message"] || json.error)) {
    return null;
  }
  return json;
}

function deriveConsensusRating(row) {
  const strongBuy = pickFirstNumber(row, ["strongBuy", "strongBuyCount", "strongBuyRatings"]);
  const buy = pickFirstNumber(row, ["buy", "buyCount", "buyRatings"]);
  const hold = pickFirstNumber(row, ["hold", "holdCount", "holdRatings"]);
  const sell = pickFirstNumber(row, ["sell", "sellCount", "sellRatings"]);
  const strongSell = pickFirstNumber(row, ["strongSell", "strongSellCount", "strongSellRatings"]);
  const total = strongBuy + buy + hold + sell + strongSell;
  if (total <= 0) return { rating: "N/A", analystCount: 0 };

  const score = (2 * strongBuy + 1 * buy + 0 * hold - 1 * sell - 2 * strongSell) / total;
  let rating = "Hold";
  if (score >= 1.25) rating = "Strong Buy";
  else if (score >= 0.5) rating = "Buy";
  else if (score <= -1.25) rating = "Strong Sell";
  else if (score <= -0.5) rating = "Sell";

  return { rating, analystCount: total };
}

async function fetchFmpAnalystData(symbol, fmpToken) {
  if (!fmpToken) {
    return { targetPrice: 0, analystCount: 0, targetDate: "", rating: "N/A", ratingDate: "" };
  }

  const targetCandidates = [
    `https://financialmodelingprep.com/stable/price-target-consensus?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(fmpToken)}`,
    `https://financialmodelingprep.com/stable/price-target-summary?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(fmpToken)}`,
  ];

  let targetRaw = null;
  for (const u of targetCandidates) {
    const json = await fetchFmpJson(u);
    if (!json) continue;
    targetRaw = Array.isArray(json) ? json[0] : json;
    if (targetRaw) break;
  }

  const ratingCandidates = [
    `https://financialmodelingprep.com/stable/grades-consensus?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(fmpToken)}`,
    `https://financialmodelingprep.com/stable/ratings-snapshot?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(fmpToken)}`,
  ];

  let ratingRaw = null;
  for (const u of ratingCandidates) {
    const json = await fetchFmpJson(u);
    if (!json) continue;
    ratingRaw = Array.isArray(json) ? json[0] : json;
    if (ratingRaw) break;
  }

  const targetPrice = pickFirstNumber(targetRaw, ["targetConsensus", "targetPrice", "priceTarget", "targetMean", "targetMedian"]);
  const targetAnalystCount = pickFirstNumber(targetRaw, ["analystCount", "numberAnalystOpinions", "numAnalysts", "numberOfAnalysts"]);
  const targetDate = pickFirstString(targetRaw, ["date", "updatedAt", "publishedDate", "lastUpdated"]);
  const mappedRating = normalizeRating(pickFirstString(ratingRaw, ["ratingRecommendation", "rating", "recommendation", "newGrade"]));
  const derived = deriveConsensusRating(ratingRaw || {});
  const rating = mappedRating !== "N/A" ? mappedRating : derived.rating;
  const analystCount = Math.max(targetAnalystCount, derived.analystCount);
  const ratingDate = pickFirstString(ratingRaw, ["date", "gradingCompany", "publishedDate", "lastUpdated"]);

  return { targetPrice, analystCount, targetDate, rating, ratingDate };
}

function marketDataPlugin(finnhubToken, fmpToken) {
  const quoteCache = new Map();
  const analystCache = new Map();
  const QUOTE_TTL_MS = 60 * 1000;
  const ANALYST_TTL_MS = 6 * 60 * 60 * 1000;

  return {
    name: "market-data-api",
    configureServer(server) {
      const handler = async (req, res, next) => {
        if (!req.url?.startsWith("/api/quotes")) return next();
        if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
        if (!finnhubToken) return sendJson(res, 500, { error: "missing_finnhub_api_key", message: "Set FINNHUB_API_KEY and restart Vite." });

        const url = new URL(req.url, "http://localhost");
        const symbolsParam = url.searchParams.get("symbols") || "";
        const symbols = Array.from(new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))).slice(0, 50);
        if (!symbols.length) return sendJson(res, 400, { error: "missing_symbols" });

        const quotes = {};
        const missing = [];

        for (const symbol of symbols) {
          const now = Date.now();
          const quoteCached = quoteCache.get(symbol);
          const analystCached = analystCache.get(symbol);
          const quoteFresh = quoteCached && now - quoteCached.ts < QUOTE_TTL_MS;
          const analystFresh = analystCached && now - analystCached.ts < ANALYST_TTL_MS;

          if (quoteFresh) {
            const merged = { ...quoteCached.data };
            if (analystFresh) Object.assign(merged, analystCached.data);
            quotes[symbol] = merged;
            continue;
          }

          const endpoint = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(finnhubToken)}`;
          const r = await fetch(endpoint);

          if (r.status === 429) {
            return sendJson(res, 429, { error: "provider_rate_limited", quotes, missing: symbols.filter((s) => !quotes[s]) });
          }
          if (!r.ok) {
            missing.push(symbol);
            continue;
          }

          const q = await r.json();
          const price = Number(q?.c);
          if (!Number.isFinite(price) || price <= 0) {
            missing.push(symbol);
            continue;
          }

          const data = {
            price,
            prev: Number(q?.pc) || 0,
            name: symbol,
            exchange: "US",
            time: Number(q?.t) || Math.floor(now / 1000),
            targetPrice: 0,
            targetDate: "",
            analystCount: 0,
            rating: "N/A",
            ratingDate: "",
          };

          let analystData = analystFresh ? analystCached.data : null;
          if (!analystData && fmpToken) {
            try {
              analystData = await fetchFmpAnalystData(symbol, fmpToken);
              analystCache.set(symbol, { ts: now, data: analystData });
              await sleep(80);
            } catch {
              analystData = null;
            }
          }

          const merged = analystData ? { ...data, ...analystData } : data;
          quotes[symbol] = merged;
          quoteCache.set(symbol, { ts: now, data });
          await sleep(140);
        }

        return sendJson(res, 200, { source: "Finnhub+FMP", quotes, missing });
      };
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      const handler = async (req, res, next) => {
        if (!req.url?.startsWith("/api/quotes")) return next();
        if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
        if (!finnhubToken) return sendJson(res, 500, { error: "missing_finnhub_api_key", message: "Set FINNHUB_API_KEY and restart Vite." });

        const url = new URL(req.url, "http://localhost");
        const symbolsParam = url.searchParams.get("symbols") || "";
        const symbols = Array.from(new Set(symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))).slice(0, 50);
        if (!symbols.length) return sendJson(res, 400, { error: "missing_symbols" });

        const quotes = {};
        const missing = [];

        for (const symbol of symbols) {
          const now = Date.now();
          const quoteCached = quoteCache.get(symbol);
          const analystCached = analystCache.get(symbol);
          const quoteFresh = quoteCached && now - quoteCached.ts < QUOTE_TTL_MS;
          const analystFresh = analystCached && now - analystCached.ts < ANALYST_TTL_MS;

          if (quoteFresh) {
            const merged = { ...quoteCached.data };
            if (analystFresh) Object.assign(merged, analystCached.data);
            quotes[symbol] = merged;
            continue;
          }

          const endpoint = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(finnhubToken)}`;
          const r = await fetch(endpoint);

          if (r.status === 429) {
            return sendJson(res, 429, { error: "provider_rate_limited", quotes, missing: symbols.filter((s) => !quotes[s]) });
          }
          if (!r.ok) {
            missing.push(symbol);
            continue;
          }

          const q = await r.json();
          const price = Number(q?.c);
          if (!Number.isFinite(price) || price <= 0) {
            missing.push(symbol);
            continue;
          }

          const data = {
            price,
            prev: Number(q?.pc) || 0,
            name: symbol,
            exchange: "US",
            time: Number(q?.t) || Math.floor(now / 1000),
            targetPrice: 0,
            targetDate: "",
            analystCount: 0,
            rating: "N/A",
            ratingDate: "",
          };

          let analystData = analystFresh ? analystCached.data : null;
          if (!analystData && fmpToken) {
            try {
              analystData = await fetchFmpAnalystData(symbol, fmpToken);
              analystCache.set(symbol, { ts: now, data: analystData });
              await sleep(80);
            } catch {
              analystData = null;
            }
          }

          const merged = analystData ? { ...data, ...analystData } : data;
          quotes[symbol] = merged;
          quoteCache.set(symbol, { ts: now, data });
          await sleep(140);
        }

        return sendJson(res, 200, { source: "Finnhub+FMP", quotes, missing });
      };
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const finnhubToken = env.FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;
  const fmpToken = env.FMP_API_KEY || process.env.FMP_API_KEY;

  return {
    plugins: [react(), marketDataPlugin(finnhubToken, fmpToken)],
  };
});
