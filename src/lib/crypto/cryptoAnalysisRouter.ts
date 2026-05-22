import { Artifact } from "@/types";
import { getMexcFundingRate, getMexcSpotKlines, getMexcSpotTicker } from "./mexcClient";
import { getCryptoRankAsset } from "./cryptoRankClient";
import { buildTechnicalSnapshot, Candle } from "./technical";

export interface CryptoAnalysisResult {
  symbol: string;
  interval: string;
  ticker: unknown;
  funding: unknown;
  cryptoRank: unknown;
  candles: Candle[];
  technical: ReturnType<typeof buildTechnicalSnapshot>;
  report: string;
  artifacts: Artifact[];
}

function normalizeSymbol(input: string): string {
  const match = input.toUpperCase().match(/[A-Z0-9]{2,15}(USDT|USDC|USD)?/);
  const symbol = match?.[0] ?? "BTCUSDT";

  if (symbol.endsWith("USDT") || symbol.endsWith("USDC") || symbol.endsWith("USD")) {
    return symbol;
  }

  return `${symbol}USDT`;
}

function extractInterval(input: string): string {
  const text = input.toLowerCase();
  if (text.includes("1m")) return "1m";
  if (text.includes("5m")) return "5m";
  if (text.includes("15m")) return "15m";
  if (text.includes("30m")) return "30m";
  if (text.includes("4h")) return "4h";
  if (text.includes("1d")) return "1d";
  if (text.includes("1h")) return "1h";
  return "15m";
}

export function isCryptoAnalysisRequest(message: string): boolean {
  const text = message.toLowerCase();
  const hasCryptoWord = [
    "crypto",
    "koin",
    "coin",
    "token",
    "entry",
    "tp",
    "sl",
    "stop loss",
    "analisis",
    "futures",
    "mexc",
    "volume",
    "funding",
  ].some((keyword) => text.includes(keyword));

  const hasSymbol = /\b[A-Z0-9]{2,15}(USDT|USDC|USD)\b/.test(message.toUpperCase());
  return hasCryptoWord || hasSymbol;
}

function buildReport(symbol: string, interval: string, technical: ReturnType<typeof buildTechnicalSnapshot>) {
  const bias = technical.trend === "bullish" ? "Bullish Watchlist" : technical.trend === "bearish" ? "Bearish / Wait" : "Neutral Watchlist";

  return `**Crypto Analysis Job**\n\n**Symbol:** ${symbol}\n**Timeframe:** ${interval}\n**Bias:** ${bias}\n**Setup Score:** ${technical.score}/100\n\n**Entry Plan:**\n- Entry Zone: ${technical.entryLow} - ${technical.entryHigh}\n- TP1: ${technical.tp1}\n- TP2: ${technical.tp2}\n- Stop Loss: ${technical.stopLoss}\n- Invalidation: ${technical.invalidation}\n\n**Technical Snapshot:**\n- Last Price: ${technical.lastPrice}\n- EMA12: ${technical.ema12 ?? "n/a"}\n- EMA21: ${technical.ema21 ?? "n/a"}\n- RSI14: ${technical.rsi14 ?? "n/a"}\n- Trend: ${technical.trend}\n- Momentum: ${technical.momentum}\n- Volume Spike Ratio: ${technical.volumeSpikeRatio ?? "n/a"}\n- Support: ${technical.support}\n- Resistance: ${technical.resistance}\n\n**Cara baca:**\nTunggu konfirmasi candle dan volume sebelum entry. Jangan entry buta hanya karena score tinggi. Kalau harga close di bawah SL/invalidation, setup batal.`;
}

export async function runCryptoAnalysisJob(message: string): Promise<CryptoAnalysisResult> {
  const symbol = normalizeSymbol(message);
  const interval = extractInterval(message);

  const [ticker, candles, funding, cryptoRank] = await Promise.allSettled([
    getMexcSpotTicker(symbol),
    getMexcSpotKlines(symbol, interval, 120),
    getMexcFundingRate(symbol),
    getCryptoRankAsset(symbol),
  ]);

  if (candles.status !== "fulfilled") {
    throw new Error(`Failed to fetch MEXC candles: ${candles.reason instanceof Error ? candles.reason.message : String(candles.reason)}`);
  }

  const technical = buildTechnicalSnapshot(candles.value);
  const report = buildReport(symbol, interval, technical);

  const chartPayload = {
    symbol,
    interval,
    candles: candles.value.slice(-80),
    annotations: {
      entryLow: technical.entryLow,
      entryHigh: technical.entryHigh,
      tp1: technical.tp1,
      tp2: technical.tp2,
      stopLoss: technical.stopLoss,
      support: technical.support,
      resistance: technical.resistance,
    },
  };

  const artifacts: Artifact[] = [
    {
      type: "report",
      title: `${symbol} Crypto Analysis Report`,
      content: report,
      language: "markdown",
    },
    {
      type: "chart",
      title: `${symbol} Chart Annotation Payload`,
      content: JSON.stringify(chartPayload, null, 2),
      language: "json",
    },
    {
      type: "json",
      title: `${symbol} Raw Market Data Snapshot`,
      content: JSON.stringify(
        {
          ticker: ticker.status === "fulfilled" ? ticker.value : { error: String(ticker.reason) },
          funding: funding.status === "fulfilled" ? funding.value : { error: String(funding.reason) },
          cryptoRank: cryptoRank.status === "fulfilled" ? cryptoRank.value : { error: String(cryptoRank.reason) },
          technical,
        },
        null,
        2
      ),
      language: "json",
    },
  ];

  return {
    symbol,
    interval,
    ticker: ticker.status === "fulfilled" ? ticker.value : { error: String(ticker.reason) },
    funding: funding.status === "fulfilled" ? funding.value : { error: String(funding.reason) },
    cryptoRank: cryptoRank.status === "fulfilled" ? cryptoRank.value : { error: String(cryptoRank.reason) },
    candles: candles.value,
    technical,
    report,
    artifacts,
  };
}
