import { Buyer, BuyerCategory, BuyerSearchParams } from "@/types";
import { calculateBuyerScore, generateAiNotes } from "./buyerScoreTool";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// ─── Province/City Mapping ────────────────────────────────────────────────

const PROVINCE_CITIES: Record<string, string[]> = {
  "Jawa Barat": ["Bandung", "Bogor", "Bekasi", "Depok", "Cirebon", "Sukabumi", "Garut", "Tasikmalaya", "Karawang", "Subang"],
  "Jawa Tengah": ["Semarang", "Solo", "Surakarta", "Magelang", "Pekalongan", "Purwokerto", "Kudus", "Pati", "Wonogiri"],
  "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Sidoarjo", "Gresik", "Mojokerto", "Jember", "Blitar"],
  "DKI Jakarta": ["Jakarta"],
  "Banten": ["Tangerang", "Serang", "Cilegon"],
  "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul"],
  "Lampung": ["Bandar Lampung", "Metro", "Lampung Tengah"],
  "Sumatera Utara": ["Medan", "Binjai", "Deli Serdang"],
  "Sumatera Barat": ["Padang", "Bukittinggi", "Payakumbuh"],
  "Bali": ["Denpasar", "Gianyar", "Badung"],
};

function getProvinceForCity(city: string): string {
  const c = city.toLowerCase();
  for (const [prov, cities] of Object.entries(PROVINCE_CITIES)) {
    if (cities.some(ct => ct.toLowerCase() === c)) return prov;
  }
  return "Jawa Barat";
}

// ─── Mock Templates ───────────────────────────────────────────────────────

interface MockTemplate {
  namePrefix: string;
  category: BuyerCategory;
  cities: string[];
  provinces: string[];
  hasPhone: boolean;
  ratingRange: [number, number];
}

const TEMPLATES: MockTemplate[] = [
  { namePrefix: "CV Jamu Ibunda", category: "pabrik_jamu", cities: ["Solo", "Semarang", "Surabaya"], provinces: ["Jawa Tengah", "Jawa Timur"], hasPhone: true, ratingRange: [4.0, 4.8] },
  { namePrefix: "Toko Herbal Sehat", category: "toko_herbal", cities: ["Bandung", "Jakarta", "Yogyakarta"], provinces: ["Jawa Barat", "DKI Jakarta", "DI Yogyakarta"], hasPhone: true, ratingRange: [3.8, 4.5] },
  { namePrefix: "PT Distribusi Nusantara", category: "distributor_pangan", cities: ["Jakarta", "Surabaya", "Medan"], provinces: ["DKI Jakarta", "Jawa Timur", "Sumatera Utara"], hasPhone: true, ratingRange: [4.2, 4.9] },
  { namePrefix: "Grosir Berkah Jaya", category: "grosir_sembako", cities: ["Bandung", "Semarang", "Malang"], provinces: ["Jawa Barat", "Jawa Tengah", "Jawa Timur"], hasPhone: true, ratingRange: [3.5, 4.3] },
  { namePrefix: "Restoran Padang Sederhana", category: "restoran", cities: ["Jakarta", "Bandung", "Surabaya"], provinces: ["DKI Jakarta", "Jawa Barat", "Jawa Timur"], hasPhone: true, ratingRange: [4.0, 4.7] },
  { namePrefix: "Katering Barokah", category: "katering", cities: ["Jakarta", "Bogor", "Tangerang"], provinces: ["DKI Jakarta", "Jawa Barat", "Banten"], hasPhone: true, ratingRange: [4.0, 4.5] },
  { namePrefix: "Hotel Grand Nusantara", category: "hotel", cities: ["Denpasar", "Jakarta", "Bandung"], provinces: ["Bali", "DKI Jakarta", "Jawa Barat"], hasPhone: true, ratingRange: [4.3, 4.9] },
  { namePrefix: "Pasar Induk Kramat", category: "pasar_induk", cities: ["Jakarta", "Bandung", "Surabaya"], provinces: ["DKI Jakarta", "Jawa Barat", "Jawa Timur"], hasPhone: true, ratingRange: [3.5, 4.2] },
  { namePrefix: "UMKM Keripik Nusantara", category: "umkm_makanan", cities: ["Malang", "Bandung", "Solo"], provinces: ["Jawa Timur", "Jawa Barat", "Jawa Tengah"], hasPhone: true, ratingRange: [3.8, 4.4] },
  { namePrefix: "PT Tapioka Mandiri", category: "pabrik_tepung_tapioka", cities: ["Bandar Lampung", "Pati", "Wonogiri"], provinces: ["Lampung", "Jawa Tengah", "Jawa Tengah"], hasPhone: true, ratingRange: [4.0, 4.6] },
  { namePrefix: "UD Keripik Makmur", category: "produsen_keripik", cities: ["Malang", "Bandung", "Yogyakarta"], provinces: ["Jawa Timur", "Jawa Barat", "DI Yogyakarta"], hasPhone: true, ratingRange: [3.5, 4.3] },
  { namePrefix: "Toko Beras Makmur", category: "toko_beras", cities: ["Jakarta", "Bandung", "Surabaya", "Semarang"], provinces: ["DKI Jakarta", "Jawa Barat", "Jawa Timur", "Jawa Tengah"], hasPhone: true, ratingRange: [3.8, 4.5] },
  { namePrefix: "CV Rempah Nusantara", category: "supplier_rempah", cities: ["Solo", "Semarang", "Bandung", "Jakarta"], provinces: ["Jawa Tengah", "Jawa Tengah", "Jawa Barat", "DKI Jakarta"], hasPhone: true, ratingRange: [4.0, 4.7] },
];

const AREA_STREETS: Record<string, string[]> = {
  Jakarta: ["Jl. Kramat Raya No. 45", "Jl. Mangga Besar IV/12", "Jl. Hayam Wuruk No. 88"],
  Bandung: ["Jl. Cibaduyut No. 23", "Jl. Pasteur No. 67", "Jl. Asia Afrika No. 112"],
  Surabaya: ["Jl. Tunjungan No. 55", "Jl. Basuki Rahmat No. 32", "Jl. Kembang Jepun No. 78"],
  Semarang: ["Jl. Pandanaran No. 44", "Jl. Pemuda No. 21", "Jl. Gajahmada No. 93"],
  Solo: ["Jl. Slamet Riyadi No. 156", "Jl. Yos Sudarso No. 33", "Jl. Ir. Sutami No. 67"],
  Yogyakarta: ["Jl. Malioboro No. 89", "Jl. Solo Km 7", "Jl. Kaliurang No. 45"],
  Malang: ["Jl. Ijen No. 22", "Jl. Soekarno Hatta No. 88", "Jl. Veteran No. 15"],
  Bogor: ["Jl. Pajajaran No. 34", "Jl. Suryakencana No. 56", "Jl. Raya Tajur No. 78"],
  Medan: ["Jl. Asia No. 12", "Jl. Gatot Subroto No. 88", "Jl. SM Raja No. 45"],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateMockBuyers(params: BuyerSearchParams): Buyer[] {
  const results: Buyer[] = [];
  const count = 8 + Math.floor(Math.random() * 7);
  const targetProvince = params.province || getProvinceForCity(params.city);

  for (let i = 0; i < count; i++) {
    const t = params.category
      ? (TEMPLATES.find(x => x.category === params.category) || pick(TEMPLATES))
      : pick(TEMPLATES);

    const city = Math.random() > 0.4 ? params.city : pick(t.cities);
    const province = getProvinceForCity(city) || targetProvince;
    const streets = AREA_STREETS[city] || [`Jl. Raya ${city} No. ${Math.floor(Math.random() * 200)}`];
    const suffix = ["", " Pusat", " Cabang 2", " Utama", " Baru"][Math.floor(Math.random() * 5)];
    const rating = Math.round((t.ratingRange[0] + Math.random() * (t.ratingRange[1] - t.ratingRange[0])) * 10) / 10;

    const buyer: Buyer = {
      id: generateId(),
      name: `${t.namePrefix}${suffix}`.trim(),
      category: t.category,
      commodity: params.commodity,
      city,
      province,
      address: `${pick(streets)}, ${city}, ${province}`,
      phone: "Tidak tersedia",
      email: "Tidak tersedia",
      website: "Tidak tersedia",
      rating,
      source: "mock_data",
      buyer_score: 0,
      ai_notes: "",
      outreach_message: "",
      status: "baru_ditemukan",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    buyer.buyer_score = calculateBuyerScore(buyer, params);
    buyer.ai_notes = generateAiNotes(buyer, params, buyer.buyer_score);
    results.push(buyer);
  }

  results.sort((a, b) => b.buyer_score - a.buyer_score);
  const seen = new Set<string>();
  return results.filter(b => {
    if (seen.has(b.name)) return false;
    seen.add(b.name);
    return true;
  });
}

// ─── Google Places Search ─────────────────────────────────────────────────

async function searchGooglePlaces(params: BuyerSearchParams): Promise<Buyer[] | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const categoryLabel = params.category?.replace(/_/g, " ") || "supplier pangan";
    const query = `${categoryLabel} ${params.commodity} di ${params.city}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=id`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results?.length) return null;

    const province = params.province || getProvinceForCity(params.city);

    const buyers: Buyer[] = data.results.slice(0, 15).map((p: Record<string, unknown>) => {
      const b: Buyer = {
        id: generateId(),
        name: (p.name as string) || "Unknown",
        category: (params.category || "distributor_pangan") as BuyerCategory,
        commodity: params.commodity,
        city: params.city,
        province,
        address: (p.formatted_address as string) || params.city,
        phone: "Tidak tersedia",
        email: "Tidak tersedia",
        website: "Tidak tersedia",
        rating: (p.rating as number) || 0,
        source: "google_places",
        buyer_score: 0,
        ai_notes: "",
        outreach_message: "",
        status: "baru_ditemukan",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      b.buyer_score = calculateBuyerScore(b, params);
      b.ai_notes = generateAiNotes(b, params, b.buyer_score);
      return b;
    });

    buyers.sort((a, b) => b.buyer_score - a.buyer_score);
    return buyers;
  } catch {
    return null;
  }
}

// ─── Main Search Function ─────────────────────────────────────────────────

export async function searchBuyers(params: BuyerSearchParams): Promise<{ buyers: Buyer[]; mode: "live" | "mock" }> {
  const live = await searchGooglePlaces(params);
  if (live && live.length > 0) return { buyers: live, mode: "live" };
  return { buyers: generateMockBuyers(params), mode: "mock" };
}
