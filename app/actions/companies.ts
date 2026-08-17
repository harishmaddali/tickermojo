"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Company, Exchange } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");

const loadCompanies = cache(async (): Promise<Company[]> => {
  const raw = await readFile(path.join(dataDir, "companies.json"), "utf8");
  return JSON.parse(raw) as Company[];
});

export async function getAllCompanies(): Promise<Company[]> {
  return loadCompanies();
}

export async function getCompaniesByExchange(
  exchange: Exchange,
): Promise<Company[]> {
  const companies = await loadCompanies();
  return companies.filter((company) =>
    exchange === "NSE" ? company.nseTicker : company.bseTicker,
  );
}

export async function getCompany(
  exchange: Exchange,
  ticker: string,
): Promise<Company | null> {
  const companies = await loadCompanies();
  const needle = ticker.toUpperCase();

  if (exchange === "NSE") {
    return (
      companies.find((company) => company.nseTicker === needle) ?? null
    );
  }

  return (
    companies.find((company) => company.bseCode === needle) ??
    companies.find(
      (company) => company.bseTicker === needle && !company.bseCode,
    ) ??
    companies.find((company) => company.bseTicker === needle) ??
    null
  );
}

export async function getMarketStats() {
  const companies = await loadCompanies();
  const nse = companies.filter((company) => company.nseTicker).length;
  const bse = companies.filter((company) => company.bseTicker).length;
  const dual = companies.filter(
    (company) => company.nseTicker && company.bseTicker,
  ).length;

  return {
    total: companies.length,
    nse,
    bse,
    dual,
  };
}
