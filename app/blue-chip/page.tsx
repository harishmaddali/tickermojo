import type { Metadata } from "next";
import { getBlueChipFinancials } from "@/app/actions/blue-chip";
import { BlueChipTable } from "@/components/BlueChipTable";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Blue chip financials",
  description:
    "Latest financial summaries for Nifty 50 blue-chip companies listed on NSE and BSE.",
};

export default async function BlueChipPage() {
  const data = await getBlueChipFinancials();
  const generated = new Date(data.generatedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  return (
    <>
      <PageIntro
        eyebrow={data.index}
        title="Blue chip financials"
        description={data.description}
      >
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Stat label="Companies" value={data.companies.length} />
          <Stat label="With data" value={data.records.length} />
        </dl>
      </PageIntro>

      <p className="mb-6 text-sm text-[var(--muted)]">
        Figures sourced from{" "}
        <a
          href="https://www.bseindia.com"
          className="underline hover:text-[var(--foreground)]"
        >
          BSE India
        </a>{" "}
        financial results. Revenue and profit are in ₹ crore for the latest
        annual fiscal year. Last updated {generated} IST.
      </p>

      <BlueChipTable records={data.records} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Blue chip company list
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          All {data.companies.length} {data.index} constituents tracked in this
          dataset.
        </p>
        <ul className="mt-4 columns-2 gap-x-8 text-sm sm:columns-3 md:columns-4">
          {data.companies.map((ticker) => (
            <li key={ticker} className="mb-1.5 font-mono text-[13px]">
              {ticker}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-lg font-medium">
        {value.toLocaleString("en-IN")}
      </dd>
    </div>
  );
}
