"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { BlueChipFinancials } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");

const loadBlueChipFinancials = cache(async (): Promise<BlueChipFinancials> => {
  const raw = await readFile(
    path.join(dataDir, "blue-chip-financials.json"),
    "utf8",
  );
  return JSON.parse(raw) as BlueChipFinancials;
});

export async function getBlueChipFinancials(): Promise<BlueChipFinancials> {
  return loadBlueChipFinancials();
}
