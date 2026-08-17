import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/app/actions/companies";
import { parseExchange } from "@/lib/exchanges";

type PageProps = {
  params: Promise<{
    exchange: string;
    ticker: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { exchange: exchangeParam, ticker } = await params;
  const exchange = parseExchange(exchangeParam);
  if (!exchange) {
    return { title: "Company not found" };
  }

  const company = await getCompany(exchange, ticker);
  if (!company) {
    return { title: "Company not found" };
  }

  const symbol = company.nseTicker || company.bseTicker || ticker;
  return {
    title: `${symbol} · ${company.name}`,
    description: `${company.name} listed on the Indian stock market.`,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { exchange: exchangeParam, ticker } = await params;
  const exchange = parseExchange(exchangeParam);
  if (!exchange) {
    notFound();
  }

  const company = await getCompany(exchange, ticker);
  if (!company) {
    notFound();
  }

  const listings = [
    company.nseTicker && "NSE",
    company.bseTicker && "BSE",
  ].filter(Boolean);

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        {listings.join(" and ")} listed
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {company.name}
      </h1>
      <p className="mt-2 text-[var(--muted)]">{company.sector}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <TickerCard label="NSE ticker" value={company.nseTicker} tone="nse" />
        <TickerCard label="BSE ticker" value={company.bseTicker} tone="bse" />
      </dl>
      {company.bseCode ? (
        <p className="mt-4 font-mono text-sm text-[var(--muted)]">
          BSE scrip code {company.bseCode}
        </p>
      ) : null}

      <p className="mt-8">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
        >
          Back to all companies
        </Link>
      </p>
    </article>
  );
}

function TickerCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | null;
  tone: "nse" | "bse";
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-5 py-4">
      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </dt>
      <dd
        className={`mt-2 font-mono text-2xl font-semibold ${
          value
            ? tone === "nse"
              ? "text-[var(--nse)]"
              : "text-[var(--bse)]"
            : "text-[var(--muted)]"
        }`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
