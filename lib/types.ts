export type Exchange = "NSE" | "BSE";

export type Company = {
  name: string;
  nseTicker: string | null;
  bseTicker: string | null;
  bseCode: string | null;
  sector: string;
};
