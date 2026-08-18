# TickerMojo

Browse listed Indian companies and their NSE and BSE stock tickers.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Company lists are loaded from `data/companies.json` through Next.js server actions. Dual-listed names show both NSE and BSE tickers on one row.

Blue-chip financial summaries for Nifty 50 constituents live at `/blue-chip`, backed by `data/blue-chip-financials.json`. Refresh the dataset with:

```bash
npm run fetch:blue-chip
```
