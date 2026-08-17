import type { Metadata } from "next";
import { getCompaniesByExchange } from "@/app/actions/companies";
import { CompanyTable } from "@/components/CompanyTable";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "NSE companies",
  description: "Companies listed on the National Stock Exchange of India.",
};

export default async function NsePage() {
  const companies = await getCompaniesByExchange("NSE");

  return (
    <>
      <PageIntro
        eyebrow="National Stock Exchange"
        title="NSE tickers"
        description="Companies listed on NSE. BSE tickers are shown when the same company also trades there."
      />
      <CompanyTable companies={companies} />
    </>
  );
}
