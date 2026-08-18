export type Exchange = "NSE" | "BSE";

export type Company = {
  name: string;
  nseTicker: string | null;
  bseTicker: string | null;
  bseCode: string | null;
  sector: string;
};

export type BlueChipFinancialRecord = {
  ticker: string;
  name: string | null;
  sourceUrl: string;
  currentPrice: string | null;
  marketCap: string | null;
  peRatio: string | null;
  bookValue: string | null;
  dividendYield: string | null;
  roce: string | null;
  roe: string | null;
  faceValue: string | null;
  fiscalYear: string | null;
  revenue: string | null;
  netProfit: string | null;
  operatingProfit: string | null;
  opmPercent: string | null;
  eps: string | null;
  fetchedAt: string;
};

export type BlueChipFinancials = {
  index: string;
  description: string;
  companies: string[];
  records: BlueChipFinancialRecord[];
  errors: { ticker: string; error: string }[];
  generatedAt: string;
  source: string;
};
