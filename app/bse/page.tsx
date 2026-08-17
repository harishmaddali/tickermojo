import type { Metadata } from "next";
import { getCompaniesByExchange } from "@/app/actions/companies";
import { CompanyTable } from "@/components/CompanyTable";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "BSE companies",
  description: "Companies listed on the Bombay Stock Exchange.",
};

export default async function BsePage() {
  const companies = await getCompaniesByExchange("BSE");

  return (
    <>
      <PageIntro
        eyebrow="Bombay Stock Exchange"
        title="BSE tickers"
        description="Companies listed on BSE. NSE tickers are shown when the same company also trades there."
      />
      <CompanyTable companies={companies} />
    </>
  );
}
