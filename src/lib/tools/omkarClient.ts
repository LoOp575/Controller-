/**
 * Omkar Google Maps Extractor API Client
 * Uses OMKAR_API_KEY. OMKAR_GOOGLE_MAPS_API_URL is optional.
 * If Omkar fails, buyerSearchTool will keep falling back to mock data.
 */

import { Buyer, BuyerCategory, BuyerSearchParams } from "@/types";
import { calculateBuyerScore, generateAiNotes } from "./buyerScoreTool";

const DEFAULT_OMKAR_MAPS_ENDPOINTS = [
  "https://google-maps-scraper-api.omkar.cloud/search",
  "https://google-maps-extractor-api.omkar.cloud/search",
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function isOmkarConfigured(): boolean {
  return !!process.env.OMKAR_API_KEY;
}

function getOmkarEndpoints(): string[] {
  const endpoints: string[] = [];

  if (process.env.OMKAR_GOOGLE_MAPS_API_URL) {
    endpoints.push(process.env.OMKAR_GOOGLE_MAPS_API_URL);
  }

  if (process.env.OMKAR_GOOGLE_MAPS_EXTRACTOR_API_URL) {
    endpoints.push(process.env.OMKAR_GOOGLE_MAPS_EXTRACTOR_API_URL);
  }

  if (process.env.OMKAR_API_BASE_URL) {
    const base = process.env.OMKAR_API_BASE_URL.replace(/\/$/, "");
    endpoints.push(`${base}/api/google-maps/search`);
    endpoints.push(`${base}/api/maps/search`);
  }

  if (process.env.OMKAR_USE_DEFAULT_MAPS_ENDPOINTS !== "false") {
    endpoints.push(...DEFAULT_OMKAR_MAPS_ENDPOINTS);
  }

  return [...new Set(endpoints.filter(Boolean))];
}

/**
 * Build search queries based on commodity and city.
 * Creates multiple queries to maximize buyer coverage.
 */
function buildOmkarQueries(params: BuyerSearchParams): string[] {
  const { commodity, city, category } = params;
  const queries: string[] = [];

  if (category) {
    queries.push(`${category.replace(/_/g, " ")} ${city}`);
  }

  // Add commodity-specific queries
  const commodityQueries: Record<string, string[]> = {
    jahe: ["pabrik jamu", "toko herbal", "distributor rempah", "supplier rempah"],
    kencur: ["pabrik jamu", "toko herbal", "supplier rempah"],
    kunyit: ["pabrik jamu", "toko herbal", "distributor rempah"],
    beras: ["toko beras", "grosir sembako", "distributor beras"],
    singkong: ["pabrik tapioka", "produsen keripik", "pabrik tepung"],
    cabai: ["grosir sembako", "distributor sayur", "restoran"],
    bawang: ["grosir sembako", "distributor sayur", "restoran"],
    kopi: ["distributor kopi", "restoran", "cafe"],
  };

  const specificQueries = commodityQueries[commodity.toLowerCase()] || ["distributor pangan", "grosir"];
  for (const q of specificQueries.slice(0, 3)) {
    queries.push(`${q} ${city}`);
  }

  // Deduplicate
  return queries.filter((q, i) => queries.indexOf(q) === i);
}

interface OmkarPlace {
  title?: string;
  name?: string;
  business_name?: string;
  address?: string;
  formatted_address?: string;
  full_address?: string;
  phone?: string;
  phone_number?: string;
  international_phone_number?: string;
  website?: string;
  website_url?: string;
  rating?: number | { value?: number };
  category?: string;
  city?: string;
  email?: string;
}

function pickString(place: OmkarPlace, keys: (keyof OmkarPlace)[]): string {
  for (const key of keys) {
    const value = place[key];
    if (typeof value === "string" && value.trim() && value !== "-") return value.trim();
  }
  return "";
}

function pickRating(place: OmkarPlace): number {
  if (typeof place.rating === "number") return place.rating;
  if (place.rating && typeof place.rating === "object" && typeof place.rating.value === "number") return place.rating.value;
  return 0;
}

function extractPlaces(data: unknown): OmkarPlace[] {
  if (Array.isArray(data)) return data as OmkarPlace[];
  if (!data || typeof data !== "object") return [];

  const root = data as Record<string, unknown>;
  const nested = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : undefined;
  const candidates = [
    root.results,
    root.items,
    root.places,
    root.businesses,
    root.data,
    nested?.results,
    nested?.items,
    nested?.places,
    nested?.businesses,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as OmkarPlace[];
  }

  return [];
}

function inferCategory(place: OmkarPlace, params: BuyerSearchParams, query: string): BuyerCategory {
  if (params.category) return params.category as BuyerCategory;

  const text = `${query} ${place.category || ""}`.toLowerCase();
  if (text.includes("jamu")) return "pabrik_jamu";
  if (text.includes("herbal")) return "toko_herbal";
  if (text.includes("beras")) return "toko_beras";
  if (text.includes("grosir") || text.includes("sembako")) return "grosir_sembako";
  if (text.includes("restoran") || text.includes("restaurant")) return "restoran";
  if (text.includes("katering") || text.includes("catering")) return "katering";
  if (text.includes("hotel")) return "hotel";
  if (text.includes("pasar")) return "pasar_induk";
  if (text.includes("keripik")) return "produsen_keripik";
  if (text.includes("tapioka") || text.includes("tepung")) return "pabrik_tepung_tapioka";
  if (text.includes("rempah")) return "supplier_rempah";
  return "distributor_pangan";
}

async function fetchJson(url: string, init: RequestInit): Promise<unknown | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function callOmkarEndpoint(endpoint: string, query: string, apiKey: string): Promise<OmkarPlace[]> {
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "API-Key": apiKey,
    "x-api-key": apiKey,
    "Authorization": `Bearer ${apiKey}`,
  };

  try {
    const url = new URL(endpoint);
    url.searchParams.set("query", query);
    url.searchParams.set("q", query);
    url.searchParams.set("language", "id");
    url.searchParams.set("limit", "20");
    url.searchParams.set("max", "20");
    url.searchParams.set("api_key", apiKey);

    const getPlaces = extractPlaces(await fetchJson(url.toString(), { method: "GET", headers }));
    if (getPlaces.length > 0) return getPlaces;
  } catch {
    // Try POST below
  }

  const postPlaces = extractPlaces(await fetchJson(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, queries: [query], language: "id", limit: 20, max: 20 }),
  }));

  return postPlaces;
}

export async function searchOmkar(params: BuyerSearchParams): Promise<Buyer[] | null> {
  if (!isOmkarConfigured()) return null;

  const apiKey = process.env.OMKAR_API_KEY!;
  const endpoints = getOmkarEndpoints();
  const queries = buildOmkarQueries(params);

  const allBuyers: Buyer[] = [];
  const seenNames = new Set<string>();

  for (const query of queries) {
    for (const endpoint of endpoints) {
      const places = await callOmkarEndpoint(endpoint, query, apiKey);
      if (places.length === 0) continue;

      for (const place of places.slice(0, 10)) {
        const name = pickString(place, ["title", "name", "business_name"]);
        if (!name) continue;

        const address = pickString(place, ["address", "formatted_address", "full_address"]);
        const dedupeKey = `${name}-${address}`.toLowerCase();
        if (seenNames.has(dedupeKey)) continue;
        seenNames.add(dedupeKey);

        const buyer: Buyer = {
          id: generateId(),
          name,
          category: inferCategory(place, params, query),
          commodity: params.commodity,
          city: pickString(place, ["city"]) || params.city,
          province: params.province || "",
          address: address || params.city,
          phone: pickString(place, ["phone", "phone_number", "international_phone_number"]) || "Tidak tersedia",
          email: pickString(place, ["email"]) || "Tidak tersedia",
          website: pickString(place, ["website", "website_url"]) || "Tidak tersedia",
          rating: pickRating(place),
          source: "omkar",
          buyer_score: 0,
          ai_notes: "",
          outreach_message: "",
          status: "baru_ditemukan",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        buyer.buyer_score = calculateBuyerScore(buyer, params);
        buyer.ai_notes = generateAiNotes(buyer, params, buyer.buyer_score);
        allBuyers.push(buyer);
      }

      // Stop after first working endpoint for this query.
      break;
    }
  }

  if (allBuyers.length === 0) return null;

  allBuyers.sort((a, b) => b.buyer_score - a.buyer_score);
  return allBuyers;
}
