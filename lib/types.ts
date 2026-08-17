export type Exchange = "NSE" | "BSE";

export type ListedCompany = {
  name: string;
  ticker: string;
  sector: string;
};

export type CompanyListing = ListedCompany & {
  exchange: Exchange;
};
