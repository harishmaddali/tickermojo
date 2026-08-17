import { getAllCompanies, getMarketStats } from "@/app/actions/companies";
import { CompanyTable } from "@/components/CompanyTable";
import { PageIntro } from "@/components/PageIntro";

export default async function HomePage() {
  const [companies, stats] = await Promise.all([
    getAllCompanies(),
    getMarketStats(),
  ]);

  return (
    <>
      <PageIntro
        eyebrow="India"
        title="Listed companies"
        description="Every company in the TickerMojo universe with its NSE or BSE ticker. Search by name, symbol, or sector."
      >
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <Stat label="Total" value={stats.total} />
          <Stat label="NSE" value={stats.nse} />
          <Stat label="BSE" value={stats.bse} />
        </dl>
      </PageIntro>
      <CompanyTable companies={companies} />
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
