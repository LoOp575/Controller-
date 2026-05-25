import { Buyer, BuyerCategory, BuyerSearchParams } from "@/types";
import { calculateBuyerScore, generateAiNotes } from "./buyerScoreTool";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

interface MockTemplate { namePrefix: string; category: BuyerCategory; cities: string[]; hasPhone: boolean; ratingRange: [number, number]; }

const TEMPLATES: MockTemplate[] = [
  { namePrefix: "CV Jamu Ibunda", category: "pabrik_jamu", cities: ["Solo","Semarang","Surabaya"], hasPhone: true, ratingRange: [4.0,4.8] },
  { namePrefix: "Toko Herbal Sehat", category: "toko_herbal", cities: ["Bandung","Jakarta","Yogyakarta"], hasPhone: true, ratingRange: [3.8,4.5] },
  { namePrefix: "PT Distribusi Nusantara", category: "distributor_pangan", cities: ["Jakarta","Surabaya","Medan"], hasPhone: true, ratingRange: [4.2,4.9] },
  { namePrefix: "Grosir Berkah Jaya", category: "grosir_sembako", cities: ["Bandung","Semarang","Malang"], hasPhone: true, ratingRange: [3.5,4.3] },
  { namePrefix: "Restoran Padang Sederhana", category: "restoran", cities: ["Jakarta","Bandung","Surabaya"], hasPhone: true, ratingRange: [4.0,4.7] },
  { namePrefix: "Katering Barokah", category: "katering", cities: ["Jakarta","Bogor","Tangerang"], hasPhone: true, ratingRange: [4.0,4.5] },
  { namePrefix: "Hotel Grand Nusantara", category: "hotel", cities: ["Bali","Jakarta","Bandung"], hasPhone: true, ratingRange: [4.3,4.9] },
  { namePrefix: "Pasar Induk Kramat", category: "pasar_induk", cities: ["Jakarta","Bandung","Surabaya"], hasPhone: true, ratingRange: [3.5,4.2] },
  { namePrefix: "UMKM Keripik Nusantara", category: "umkm_makanan", cities: ["Malang","Bandung","Solo"], hasPhone: true, ratingRange: [3.8,4.4] },
  { namePrefix: "PT Tapioka Mandiri", category: "pabrik_tepung_tapioka", cities: ["Lampung","Pati","Wonogiri"], hasPhone: true, ratingRange: [4.0,4.6] },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function genPhone(): string {
  return pick(["0812","0813","0821","0857","0878"]) + Math.floor(Math.random()*90000000+10000000);
}

function generateMockBuyers(params: BuyerSearchParams): Buyer[] {
  const results: Buyer[] = [];
  const count = 8 + Math.floor(Math.random() * 7);
  for (let i = 0; i < count; i++) {
    const t = params.category ? (TEMPLATES.find(x=>x.category===params.category) || pick(TEMPLATES)) : pick(TEMPLATES);
    const city = Math.random() > 0.4 ? params.city : pick(t.cities);
    const suffix = ["", " Pusat", " Cabang 2", " Utama"][Math.floor(Math.random()*4)];
    const rating = Math.round((t.ratingRange[0] + Math.random()*(t.ratingRange[1]-t.ratingRange[0]))*10)/10;
    const buyer: Buyer = {
      id: generateId(), name: `${t.namePrefix}${suffix}`.trim(), category: t.category,
      commodity: params.commodity, city, address: `Jl. Raya ${city} No. ${Math.floor(Math.random()*200)}`,
      phone: t.hasPhone ? genPhone() : "kontak tidak tersedia", website: "-",
      rating, source: "mock_data", buyer_score: 0, ai_notes: "", outreach_message: "",
      status: "baru_ditemukan", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    buyer.buyer_score = calculateBuyerScore(buyer, params);
    buyer.ai_notes = generateAiNotes(buyer, params, buyer.buyer_score);
    results.push(buyer);
  }
  results.sort((a,b) => b.buyer_score - a.buyer_score);
  const seen = new Set<string>();
  return results.filter(b => { if (seen.has(b.name)) return false; seen.add(b.name); return true; });
}

async function searchGooglePlaces(params: BuyerSearchParams): Promise<Buyer[] | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  try {
    const query = `${params.category?.replace(/_/g," ")||"supplier pangan"} ${params.commodity} di ${params.city}`;
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=id`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results?.length) return null;
    const buyers: Buyer[] = data.results.slice(0,15).map((p: Record<string,unknown>) => {
      const b: Buyer = {
        id: generateId(), name: (p.name as string)||"Unknown",
        category: (params.category || "distributor_pangan") as BuyerCategory,
        commodity: params.commodity, city: params.city,
        address: (p.formatted_address as string)||params.city,
        phone: "kontak tidak tersedia", website: "-",
        rating: (p.rating as number)||0, source: "google_places",
        buyer_score: 0, ai_notes: "", outreach_message: "",
        status: "baru_ditemukan", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      b.buyer_score = calculateBuyerScore(b, params);
      b.ai_notes = generateAiNotes(b, params, b.buyer_score);
      return b;
    });
    buyers.sort((a,b) => b.buyer_score - a.buyer_score);
    return buyers;
  } catch { return null; }
}

export async function searchBuyers(params: BuyerSearchParams): Promise<{ buyers: Buyer[]; mode: "live"|"mock" }> {
  const live = await searchGooglePlaces(params);
  if (live && live.length > 0) return { buyers: live, mode: "live" };
  return { buyers: generateMockBuyers(params), mode: "mock" };
}
