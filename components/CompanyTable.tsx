"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { companyHref } from "@/lib/exchanges";
import type { CompanyListing } from "@/lib/types";

const PAGE_SIZE = 50;

export function CompanyTable({ companies }: { companies: CompanyListing[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return companies;
    }

    return companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(needle) ||
        company.ticker.toLowerCase().includes(needle) ||
        company.sector.toLowerCase().includes(needle)
      );
    });
  }, [companies, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)]">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Company, ticker, or sector"
            className="h-10 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none ring-[var(--header)] placeholder:text-[var(--muted)] focus:ring-2"
          />
        </label>
        <p className="text-sm text-[var(--muted)] sm:pt-5">
          {filtered.length.toLocaleString("en-IN")} companies
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-[var(--table-head)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">NSE</th>
              <th className="px-5 py-3 font-medium">BSE</th>
              <th className="px-5 py-3 font-medium">Sector</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-[var(--muted)]"
                >
                  No companies match that search.
                </td>
              </tr>
            ) : (
              visible.map((company) => (
                <tr
                  key={`${company.exchange}-${company.ticker}`}
                  className="border-t border-[var(--line)] hover:bg-[var(--row-hover)]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={companyHref(company.exchange, company.ticker)}
                      className="font-medium text-[var(--foreground)] hover:underline"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-[13px]">
                    {company.exchange === "NSE" ? (
                      <TickerLink exchange="NSE" ticker={company.ticker} />
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-[13px]">
                    {company.exchange === "BSE" ? (
                      <TickerLink exchange="BSE" ticker={company.ticker} />
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {company.sector}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3 text-sm sm:px-5">
        <p className="text-[var(--muted)]">
          Page {currentPage} of {pageCount.toLocaleString("en-IN")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function TickerLink({
  exchange,
  ticker,
}: {
  exchange: CompanyListing["exchange"];
  ticker: string;
}) {
  return (
    <Link
      href={companyHref(exchange, ticker)}
      className={
        exchange === "NSE"
          ? "rounded bg-[var(--nse-soft)] px-1.5 py-0.5 font-medium text-[var(--nse)]"
          : "rounded bg-[var(--bse-soft)] px-1.5 py-0.5 font-medium text-[var(--bse)]"
      }
    >
      {ticker}
    </Link>
  );
}
