import type { Exchange } from "@/lib/types";

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

export function companyHref(exchange: Exchange, ticker: string): string {
  return `/companies/${exchangePath(exchange)}/${encodeURIComponent(ticker)}`;
}
