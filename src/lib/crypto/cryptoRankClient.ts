function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function baseUrl(): string | null {
  const value = readEnv("CRYPTORANK_BASE_URL");
  return value ? value.replace(/\/$/, "") : null;
}

function apiKey(): string | null {
  return readEnv("CRYPTORANK_API_KEY");
}

export function isCryptoRankConfigured(): boolean {
  return apiKey() !== null && baseUrl() !== null;
}

export async function getCryptoRankAsset(symbol: string) {
  const key = apiKey();
  const base = baseUrl();

  if (!key || !base) {
    return {
      configured: false,
      note: "CRYPTORANK_API_KEY atau CRYPTORANK_BASE_URL belum diset.",
    };
  }

  const cleanSymbol = symbol.replace(/USDT$/i, "").toUpperCase();
  const url = `${base}/currencies?api_key=${encodeURIComponent(key)}&symbols=${encodeURIComponent(cleanSymbol)}`;

  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    const text = await response.text();
    return {
      configured: true,
      error: `CryptoRank request failed (${response.status}): ${text.substring(0, 250)}`,
    };
  }

  return response.json();
}
