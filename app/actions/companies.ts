"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { CompanyListing, Exchange, ListedCompany } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");

const loadListedCompanies = cache(
  async (exchange: Exchange): Promise<ListedCompany[]> => {
    const filename =
      exchange === "NSE" ? "nse-companies.json" : "bse-companies.json";
    const raw = await readFile(path.join(dataDir, filename), "utf8");
    return JSON.parse(raw) as ListedCompany[];
  },
);

function withExchange(
  companies: ListedCompany[],
  exchange: Exchange,
): CompanyListing[] {
  return companies.map((company) => ({ ...company, exchange }));
}

export async function getCompaniesByExchange(
  exchange: Exchange,
): Promise<CompanyListing[]> {
  const companies = await loadListedCompanies(exchange);
  return withExchange(companies, exchange);
}

export async function getAllCompanies(): Promise<CompanyListing[]> {
  const [nse, bse] = await Promise.all([
    getCompaniesByExchange("NSE"),
    getCompaniesByExchange("BSE"),
  ]);

  return [...nse, ...bse].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCompany(
  exchange: Exchange,
  ticker: string,
): Promise<CompanyListing | null> {
  const companies = await loadListedCompanies(exchange);
  const match = companies.find(
    (company) => company.ticker.toUpperCase() === ticker.toUpperCase(),
  );
  return match ? { ...match, exchange } : null;
}

export async function getMarketStats() {
  const [nse, bse] = await Promise.all([
    loadListedCompanies("NSE"),
    loadListedCompanies("BSE"),
  ]);

  return {
    nse: nse.length,
    bse: bse.length,
    total: nse.length + bse.length,
  };
}
