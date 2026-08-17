import type { Company, Exchange } from "@/lib/types";

export function parseExchange(value: string): Exchange | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === "NSE" || normalized === "BSE") {
    return normalized;
  }
  return null;
}

export function exchangePath(exchange: Exchange): "nse" | "bse" {
  return exchange === "NSE" ? "nse" : "bse";
}

export function tickerHref(exchange: Exchange, ticker: string): string {
  return `/companies/${exchangePath(exchange)}/${encodeURIComponent(ticker)}`;
}

export function companyHref(company: Company): string {
  if (company.nseTicker) {
    return tickerHref("NSE", company.nseTicker);
  }
  if (company.bseCode) {
    return tickerHref("BSE", company.bseCode);
  }
  if (company.bseTicker) {
    return tickerHref("BSE", company.bseTicker);
  }
  return "/";
}

export function bseHref(company: Company): string | null {
  if (company.bseCode) {
    return tickerHref("BSE", company.bseCode);
  }
  if (company.bseTicker) {
    return tickerHref("BSE", company.bseTicker);
  }
  return null;
}
