/**
 * Omkar Google Maps Extractor API Client
 * Uses OMKAR_API_KEY and OMKAR_GOOGLE_MAPS_API_URL env vars.
 */

import { Buyer, BuyerCategory, BuyerSearchParams } from "@/types";
import { calculateBuyerScore, generateAiNotes } from "./buyerScoreTool";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function isOmkarConfigured(): boolean {
  return !!(process.env.OMKAR_API_KEY && process.env.OMKAR_GOOGLE_MAPS_API_URL);
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
  return [...new Set(queries)];
}

interface OmkarPlace {
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: { value?: number };
  category?: string;
  city?: string;
  email?: string;
}

export async function searchOmkar(params: BuyerSearchParams): Promise<Buyer[] | null> {
  if (!isOmkarConfigured()) return null;

  const apiKey = process.env.OMKAR_API_KEY!;
  const baseUrl = process.env.OMKAR_GOOGLE_MAPS_API_URL!;
  const queries = buildOmkarQueries(params);

  const allBuyers: Buyer[] = [];
  const seenNames = new Set<string>();

  for (const query of queries) {
    try {
      const url = `${baseUrl}?query=${encodeURIComponent(query)}&api_key=${apiKey}&language=id`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;

      const data = await res.json();
      const places: OmkarPlace[] = Array.isArray(data) ? data : (data.data || data.results || []);

      for (const place of places.slice(0, 10)) {
        const name = place.title || "Unknown";
        if (seenNames.has(name)) continue;
        seenNames.add(name);

        const buyer: Buyer = {
          id: generateId(),
          name,
          category: (params.category || "distributor_pangan") as BuyerCategory,
          commodity: params.commodity,
          city: place.city || params.city,
          province: params.province || "",
          address: place.address || params.city,
          phone: place.phone || "Tidak tersedia",
          email: place.email || "Tidak tersedia",
          website: place.website || "Tidak tersedia",
          rating: place.rating?.value || 0,
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
    } catch {
      // Skip failed queries, continue with next
      continue;
    }
  }

  if (allBuyers.length === 0) return null;

  // Sort by score
  allBuyers.sort((a, b) => b.buyer_score - a.buyer_score);
  return allBuyers;
}
