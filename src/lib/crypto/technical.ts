export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalSnapshot {
  lastPrice: number;
  ema12: number | null;
  ema21: number | null;
  rsi14: number | null;
  averageVolume20: number | null;
  volumeSpikeRatio: number | null;
  support: number;
  resistance: number;
  trend: "bullish" | "bearish" | "neutral";
  momentum: "strong" | "weak" | "neutral";
  score: number;
  entryLow: number;
  entryHigh: number;
  tp1: number;
  tp2: number;
  stopLoss: number;
  invalidation: string;
}

function roundPrice(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value >= 1000) return Number(value.toFixed(2));
  if (value >= 1) return Number(value.toFixed(4));
  return Number(value.toFixed(8));
}

export function calculateEMA(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;

  for (let i = period; i < values.length; i += 1) {
    ema = values[i] * k + ema * (1 - k);
  }

  return roundPrice(ema);
}

export function calculateRSI(values: number[], period = 14): number | null {
  if (values.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(2));
}

export function buildTechnicalSnapshot(candles: Candle[]): TechnicalSnapshot {
  if (candles.length < 5) {
    throw new Error("Not enough candles for technical analysis.");
  }

  const closes = candles.map((candle) => candle.close);
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const volumes = candles.map((candle) => candle.volume);
  const last = candles[candles.length - 1];
  const recentHighs = highs.slice(-24);
  const recentLows = lows.slice(-24);
  const recentVolumes = volumes.slice(-20);

  const ema12 = calculateEMA(closes, 12);
  const ema21 = calculateEMA(closes, 21);
  const rsi14 = calculateRSI(closes, 14);
  const averageVolume20 = recentVolumes.length
    ? recentVolumes.reduce((sum, value) => sum + value, 0) / recentVolumes.length
    : null;
  const volumeSpikeRatio = averageVolume20 ? last.volume / averageVolume20 : null;

  const support = Math.min(...recentLows);
  const resistance = Math.max(...recentHighs);
  const trend = ema12 && ema21 ? (ema12 > ema21 ? "bullish" : ema12 < ema21 ? "bearish" : "neutral") : "neutral";
  const momentum = rsi14 === null ? "neutral" : rsi14 > 60 ? "strong" : rsi14 < 40 ? "weak" : "neutral";

  let score = 50;
  if (trend === "bullish") score += 15;
  if (trend === "bearish") score -= 15;
  if (momentum === "strong") score += 10;
  if (momentum === "weak") score -= 10;
  if (volumeSpikeRatio && volumeSpikeRatio >= 1.5) score += 10;
  if (volumeSpikeRatio && volumeSpikeRatio < 0.7) score -= 5;
  if (rsi14 && rsi14 > 75) score -= 8;
  if (rsi14 && rsi14 < 25) score -= 8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const range = Math.max(resistance - support, last.close * 0.01);
  const entryLow = trend === "bullish" ? last.close * 0.995 : last.close * 0.985;
  const entryHigh = trend === "bullish" ? last.close * 1.005 : last.close * 0.995;
  const stopLoss = Math.min(support, entryLow - range * 0.25);
  const tp1 = entryHigh + range * 0.35;
  const tp2 = entryHigh + range * 0.7;

  return {
    lastPrice: roundPrice(last.close),
    ema12,
    ema21,
    rsi14,
    averageVolume20: averageVolume20 ? Number(averageVolume20.toFixed(2)) : null,
    volumeSpikeRatio: volumeSpikeRatio ? Number(volumeSpikeRatio.toFixed(2)) : null,
    support: roundPrice(support),
    resistance: roundPrice(resistance),
    trend,
    momentum,
    score,
    entryLow: roundPrice(entryLow),
    entryHigh: roundPrice(entryHigh),
    tp1: roundPrice(tp1),
    tp2: roundPrice(tp2),
    stopLoss: roundPrice(stopLoss),
    invalidation: `Candle close di bawah ${roundPrice(stopLoss)}`,
  };
}
