#!/usr/bin/env node
/**
 * Fetches latest financial summaries for Nifty 50 blue-chip companies
 * from the Bombay Stock Exchange (BSE) India public APIs.
 *
 * Data sources per company:
 * - getScripHeaderData: live current price and company name
 * - ListofScripData: market cap, face value, ISIN, BSE company page URL
 * - TabResults?tabtype=RESULTS: latest annual revenue, net profit, EPS, OPM %
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Nifty 50 constituents (TMCV replaced TATAMOTORS after the 2025 demerger). */
const BLUE_CHIP_TICKERS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "HINDUNILVR",
  "ITC",
  "SBIN",
  "BHARTIARTL",
  "KOTAKBANK",
  "LT",
  "AXISBANK",
  "BAJFINANCE",
  "ASIANPAINT",
  "MARUTI",
  "TITAN",
  "SUNPHARMA",
  "WIPRO",
  "ULTRACEMCO",
  "NESTLEIND",
  "POWERGRID",
  "NTPC",
  "ONGC",
  "TMCV",
  "ADANIENT",
  "HCLTECH",
  "TECHM",
  "JSWSTEEL",
  "TATASTEEL",
  "COALINDIA",
  "BAJAJFINSV",
  "M&M",
  "INDUSINDBK",
  "DIVISLAB",
  "DRREDDY",
  "CIPLA",
  "GRASIM",
  "APOLLOHOSP",
  "EICHERMOT",
  "BRITANNIA",
  "HEROMOTOCO",
  "ADANIPORTS",
  "TRENT",
  "SHRIRAMFIN",
  "HINDALCO",
  "BPCL",
  "TATACONSUM",
  "SBILIFE",
  "HDFCLIFE",
  "BEL",
];

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REFERER = "https://www.bseindia.com/";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: REFERER,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const text = await response.text();
  // Some BSE endpoints return a JSON-encoded JSON string.
  let data = text;
  while (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      break;
    }
  }
  return data;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "--" || value === "") {
    return null;
  }
  const cleaned = String(value).replace(/,/g, "").replace(/[\s₹Cr]/gi, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatCurrency(value) {
  if (value === null || value === undefined) return null;
  const num = parseNumber(value);
  if (num === null) return String(value).trim() || null;
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatValue(value, { fractionDigits = 2 } = {}) {
  if (value === null || value === undefined) return null;
  const num = parseNumber(value);
  if (num === null) return String(value).trim() || null;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

async function fetchHeader(scripCode) {
  const url =
    "https://api.bseindia.com/BseIndiaAPI/api/getScripHeaderData/w?Debtflag=&scripcode=" +
    encodeURIComponent(scripCode) +
    "&seriesid=";
  return fetchJson(url);
}

async function fetchListData(scripCode) {
  const url =
    "https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w?scripcode=" +
    encodeURIComponent(scripCode) +
    "&Group=&segment=Equity&status=Active";
  const data = await fetchJson(url);
  return Array.isArray(data) ? data[0] : null;
}

async function fetchTabResults(scripCode) {
  const url =
    "https://api.bseindia.com/BseIndiaAPI/api/TabResults/w?scripcode=" +
    encodeURIComponent(scripCode) +
    "&tabtype=RESULTS";
  const data = await fetchJson(url);
  if (!data || !Array.isArray(data.resultinCr)) return null;
  return data;
}

function getTabMetric(tabResults, titleRe) {
  const row = tabResults.resultinCr.find((r) => titleRe.test(r.title));
  return row?.v3 ?? null;
}

async function fetchCompany(ticker, bseCode) {
  const [header, listData, tabResults] = await Promise.all([
    fetchHeader(bseCode),
    fetchListData(bseCode),
    fetchTabResults(bseCode),
  ]);

  const name =
    header?.Cmpname?.FullN ??
    listData?.Issuer_Name ??
    listData?.Scrip_Name ??
    null;

  const currentPriceRaw =
    header?.CurrRate?.LTP ?? header?.Header?.LTP ?? null;

  const marketCapRaw = listData?.Mktcap ?? null;
  const faceValueRaw = listData?.FACE_VALUE ?? null;
  const sourceUrl =
    listData?.NSURL ??
    (header?.Cmpname?.SEOUrlEQ
      ? `https://www.bseindia.com${header.Cmpname.SEOUrlEQ}`
      : `https://www.bseindia.com/stock-share-price/${bseCode}`);

  const fiscalYear = tabResults?.col4 ?? null;
  const revenue = getTabMetric(tabResults, /^Revenue$/i);
  const netProfit = getTabMetric(tabResults, /^Net Profit$/i);
  const eps = getTabMetric(tabResults, /^EPS$/i);
  const opmPercent = getTabMetric(tabResults, /^OPM %$/i);

  let peRatio = null;
  const priceNum = parseNumber(currentPriceRaw);
  const epsNum = parseNumber(eps);
  if (priceNum !== null && epsNum !== null && epsNum > 0) {
    peRatio = (priceNum / epsNum).toFixed(2);
  }

  return {
    ticker,
    name,
    sourceUrl,
    currentPrice: formatCurrency(currentPriceRaw),
    marketCap: marketCapRaw ? `₹ ${formatValue(marketCapRaw)} Cr` : null,
    peRatio,
    bookValue: null,
    dividendYield: null,
    roce: null,
    roe: null,
    faceValue: faceValueRaw ? formatCurrency(faceValueRaw) : null,
    fiscalYear,
    revenue: formatValue(revenue, { fractionDigits: 2 }),
    netProfit: formatValue(netProfit, { fractionDigits: 2 }),
    operatingProfit: null,
    opmPercent: formatValue(opmPercent, { fractionDigits: 2 }),
    eps: formatValue(eps, { fractionDigits: 2 }),
    fetchedAt: new Date().toISOString(),
  };
}

function findBseCode(ticker, companies) {
  const byNse = companies.find((c) => c.nseTicker === ticker);
  if (byNse?.bseCode) return byNse.bseCode;

  const byBse = companies.find((c) => c.bseTicker === ticker);
  if (byBse?.bseCode) return byBse.bseCode;

  // Fallback for companies known by a substring in their name.
  const byName = companies.find((c) =>
    c.name?.toLowerCase().includes(ticker.toLowerCase())
  );
  if (byName?.bseCode) return byName.bseCode;

  return null;
}

async function main() {
  const companies = JSON.parse(
    await readFile(
      new URL("../data/companies.json", import.meta.url),
      "utf8"
    )
  );

  const results = [];
  const errors = [];

  for (const ticker of BLUE_CHIP_TICKERS) {
    try {
      process.stdout.write(`Fetching ${ticker}... `);
      const bseCode = findBseCode(ticker, companies);
      if (!bseCode) {
        throw new Error(`No BSE scrip code found for ${ticker}`);
      }
      const record = await fetchCompany(ticker, bseCode);
      results.push(record);
      console.log("ok");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`failed: ${message}`);
      errors.push({ ticker, error: message });
    }
    await sleep(400);
  }

  const output = {
    index: "Nifty 50",
    description:
      "Blue-chip constituents of the Nifty 50 index — large, liquid Indian equities.",
    companies: BLUE_CHIP_TICKERS,
    records: results,
    errors,
    generatedAt: new Date().toISOString(),
    source: "BSE India",
  };

  const outPath = path.join(
    process.cwd(),
    "data",
    "blue-chip-financials.json"
  );
  await writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${results.length} records to ${outPath}`);
  if (errors.length) {
    console.log(`Failed: ${errors.map((e) => e.ticker).join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
