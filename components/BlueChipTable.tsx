import Link from "next/link";
import { tickerHref } from "@/lib/exchanges";
import type { BlueChipFinancialRecord } from "@/lib/types";

export function BlueChipTable({
  records,
}: {
  records: BlueChipFinancialRecord[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
          <thead className="bg-[var(--table-head)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Ticker</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Market cap</th>
              <th className="px-4 py-3 text-right font-medium">P/E</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              <th className="px-4 py-3 text-right font-medium">Net profit</th>
              <th className="px-4 py-3 text-right font-medium">ROE</th>
              <th className="px-4 py-3 text-right font-medium">FY</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.ticker}
                className="border-t border-[var(--line)] hover:bg-[var(--row-hover)]"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{record.name ?? record.ticker}</div>
                  <a
                    href={record.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
                  >
                    Source
                  </a>
                </td>
                <td className="px-4 py-3 font-mono text-[13px]">
                  <Link
                    href={tickerHref("NSE", record.ticker)}
                    className="rounded bg-[var(--nse-soft)] px-1.5 py-0.5 font-medium text-[var(--nse)]"
                  >
                    {record.ticker}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">
                  {formatCurrency(record.currentPrice)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">
                  {formatMarketCap(record.marketCap)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">
                  {record.peRatio ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">
                  {formatCr(record.revenue)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">
                  {formatCr(record.netProfit)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">
                  {record.roe ? `${record.roe}%` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-[var(--muted)]">
                  {record.fiscalYear ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCurrency(value: string | null) {
  if (!value) return "—";
  return value.startsWith("₹") ? value : `₹${value}`;
}

function formatMarketCap(value: string | null) {
  if (!value) return "—";
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.includes("Cr") ? cleaned : `${cleaned} Cr`;
}

function formatCr(value: string | null) {
  if (!value) return "—";
  return `₹${value} Cr`;
}
