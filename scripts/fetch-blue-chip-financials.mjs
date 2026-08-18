#!/usr/bin/env node
/**
 * Fetches latest financial summaries for Nifty 50 blue-chip companies
 * from Screener.in (public pages).
 */

import { writeFile } from "node:fs/promises";
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
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function normalizeValue(value) {
  return value ? value.replace(/\s+/g, " ").trim() : null;
}

function parseRatios(html) {
  const ratios = {};
  const items = html.matchAll(
    /<li[^>]*>[\s\S]*?<span class="name">([\s\S]*?)<\/span>[\s\S]*?<span class="[^"]*value[^"]*">([\s\S]*?)<\/span>[\s\S]*?<\/li>/g,
  );
  for (const [, rawName, rawValue] of items) {
    const name = stripHtml(rawName);
    const value = stripHtml(rawValue);
    if (name) ratios[name] = value;
  }
  return ratios;
}

function parseCompanyName(html) {
  const match = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/);
  return match ? match[1].trim() : null;
}

function parseAnnualProfitLoss(html) {
  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)];

  for (const [, table] of tables) {
    const headerRow = table.match(/<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>/i);
    if (!headerRow) continue;

    const years = [...headerRow[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(
      (m) => stripHtml(m[1]),
    );

    if (!years.some((year) => /^Mar \d{4}$/.test(year))) continue;

    const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const metrics = {};

    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
        (m) => stripHtml(m[1]),
      );
      if (cells.length < 2) continue;

      const label = cells[0].replace(/\s*\+$/, "").trim();
      if (!label) continue;

      const values = {};
      for (let i = 1; i < cells.length && i - 1 < years.length; i++) {
        const year = years[i - 1];
        if (year && /^Mar \d{4}$/.test(year)) {
          values[year] = cells[i];
        }
      }
      metrics[label] = values;
    }

    if (Object.keys(metrics).length > 0) {
      return { years: years.filter((y) => /^Mar \d{4}$/.test(y)), metrics };
    }
  }

  return null;
}

async function fetchCompany(ticker) {
  const url = `https://www.screener.in/company/${ticker}/consolidated/`;
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${ticker}`);
  }

  const html = await response.text();
  const ratios = parseRatios(html);
  const name = parseCompanyName(html);
  const annual = parseAnnualProfitLoss(html);

  const latestYear = annual?.years.at(-1) ?? null;

  const getMetric = (label) => {
    if (!annual?.metrics[label] || !latestYear) return null;
    return annual.metrics[label][latestYear] ?? null;
  };

  return {
    ticker,
    name,
    sourceUrl: url,
    currentPrice: normalizeValue(ratios["Current Price"]),
    marketCap: normalizeValue(ratios["Market Cap"]),
    peRatio: normalizeValue(ratios["Stock P/E"]),
    bookValue: normalizeValue(ratios["Book Value"]),
    dividendYield: normalizeValue(ratios["Dividend Yield"]),
    roce: normalizeValue(ratios["ROCE"]),
    roe: normalizeValue(ratios["ROE"]),
    faceValue: normalizeValue(ratios["Face Value"]),
    fiscalYear: latestYear,
    revenue: getMetric("Sales") ?? getMetric("Revenue") ?? null,
    netProfit: getMetric("Net Profit") ?? null,
    operatingProfit: getMetric("Operating Profit") ?? null,
    opmPercent: getMetric("OPM %") ?? null,
    eps: getMetric("EPS in Rs") ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  const results = [];
  const errors = [];

  for (const ticker of BLUE_CHIP_TICKERS) {
    try {
      process.stdout.write(`Fetching ${ticker}... `);
      const record = await fetchCompany(ticker);
      results.push(record);
      console.log("ok");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`failed: ${message}`);
      errors.push({ ticker, error: message });
    }
    await sleep(800);
  }

  const output = {
    index: "Nifty 50",
    description:
      "Blue-chip constituents of the Nifty 50 index — large, liquid Indian equities.",
    companies: BLUE_CHIP_TICKERS,
    records: results,
    errors,
    generatedAt: new Date().toISOString(),
    source: "screener.in",
  };

  const outPath = path.join(
    process.cwd(),
    "data",
    "blue-chip-financials.json",
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
