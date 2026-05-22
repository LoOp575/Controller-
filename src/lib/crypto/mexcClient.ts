import { Candle } from "./technical";

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function spotBaseUrl(): string {
  return (readEnv("MEXC_SPOT_BASE_URL") ?? "https://api.mexc.com").replace(/\/$/, "");
}

function contractBaseUrl(): string {
  return (readEnv("MEXC_CONTRACT_BASE_URL") ?? "https://contract.mexc.com").replace(/\/$/, "");
}

function normalizeSpotSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function normalizeContractSymbol(symbol: string): string {
  const clean = normalizeSpotSymbol(symbol);
  if (clean.endsWith("USDT") && !clean.includes("_")) {
    return `${clean.slice(0, -4)}_USDT`;
  }
  return clean;
}

async function fetchJson(url: string) {
  const response = await fetch(url, { next: { revalidate: 20 } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MEXC request failed (${response.status}): ${text.substring(0, 250)}`);
  }
  return response.json();
}

export async function getMexcSpotTicker(symbol: string) {
  const cleanSymbol = normalizeSpotSymbol(symbol);
  const url = `${spotBaseUrl()}/api/v3/ticker/24hr?symbol=${encodeURIComponent(cleanSymbol)}`;
  return fetchJson(url);
}

export async function getMexcSpotKlines(symbol: string, interval = "15m", limit = 120): Promise<Candle[]> {
  const cleanSymbol = normalizeSpotSymbol(symbol);
  const url = `${spotBaseUrl()}/api/v3/klines?symbol=${encodeURIComponent(cleanSymbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;
  const rows = await fetchJson(url);

  if (!Array.isArray(rows)) {
    throw new Error("Unexpected MEXC klines response.");
  }

  return rows.map((row: unknown[]) => ({
    time: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
  }));
}

export async function getMexcFundingRate(symbol: string) {
  const contractSymbol = normalizeContractSymbol(symbol);
  const url = `${contractBaseUrl()}/api/v1/contract/funding_rate/${encodeURIComponent(contractSymbol)}`;
  return fetchJson(url);
}

export async function getMexcContractKline(symbol: string, interval = "Min15") {
  const contractSymbol = normalizeContractSymbol(symbol);
  const url = `${contractBaseUrl()}/api/v1/contract/kline/${encodeURIComponent(contractSymbol)}?interval=${encodeURIComponent(interval)}`;
  return fetchJson(url);
}
