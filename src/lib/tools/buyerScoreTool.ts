import { Buyer, BuyerCategory, BuyerSearchParams } from "@/types";

const COMMODITY_CATEGORY_MAP: Record<string, BuyerCategory[]> = {
  jahe: ["pabrik_jamu", "toko_herbal", "restoran", "katering", "umkm_makanan"],
  kencur: ["pabrik_jamu", "toko_herbal", "umkm_makanan"],
  kunyit: ["pabrik_jamu", "toko_herbal", "restoran", "katering"],
  beras: ["grosir_sembako", "restoran", "katering", "hotel", "pasar_induk", "distributor_pangan"],
  singkong: ["pabrik_tepung_tapioka", "produsen_keripik", "umkm_makanan", "pasar_induk"],
  cabai: ["restoran", "katering", "grosir_sembako", "pasar_induk", "distributor_pangan"],
  bawang: ["restoran", "katering", "grosir_sembako", "pasar_induk", "distributor_pangan"],
  kopi: ["restoran", "hotel", "distributor_pangan", "umkm_makanan"],
  lada: ["restoran", "katering", "distributor_pangan", "grosir_sembako"],
  temulawak: ["pabrik_jamu", "toko_herbal"],
  lengkuas: ["restoran", "katering", "umkm_makanan", "pasar_induk"],
};

function getCategoryScore(commodity: string, category: BuyerCategory): number {
  const normalized = commodity.toLowerCase().trim();
  const relevant = COMMODITY_CATEGORY_MAP[normalized];
  if (relevant && relevant.includes(category)) {
    return Math.max(60, 100 - relevant.indexOf(category) * 10);
  }
  for (const [key, cats] of Object.entries(COMMODITY_CATEGORY_MAP)) {
    if (normalized.includes(key) && cats.includes(category)) return 50;
  }
  return 20;
}

function getLocationScore(buyerCity: string, supplierCity: string): number {
  const b = buyerCity.toLowerCase().trim();
  const s = supplierCity.toLowerCase().trim();
  if (b === s) return 100;
  const provinces: Record<string, string[]> = {
    jawa_barat: ["bandung", "bogor", "bekasi", "depok", "cirebon", "sukabumi", "garut"],
    jawa_tengah: ["semarang", "solo", "surakarta", "magelang", "pekalongan"],
    jawa_timur: ["surabaya", "malang", "kediri", "sidoarjo", "gresik"],
    dki_jakarta: ["jakarta"],
  };
  for (const cities of Object.values(provinces)) {
    if (cities.some(c => b.includes(c)) && cities.some(c => s.includes(c))) return 70;
  }
  return 30;
}

export function calculateBuyerScore(
  buyer: Pick<Buyer, "category" | "city" | "phone" | "website" | "rating">,
  params: BuyerSearchParams
): number {
  const catScore = getCategoryScore(params.commodity, buyer.category as BuyerCategory);
  const locScore = getLocationScore(buyer.city, params.city);
  const contactScore = (buyer.phone && buyer.phone !== "kontak tidak tersedia") ? 80 : 10;
  const ratingScore = buyer.rating >= 4.0 ? 80 : buyer.rating >= 3.0 ? 50 : 20;
  const repeatScore = ["restoran","katering","hotel","pabrik_jamu"].includes(buyer.category) ? 90 : 60;

  return Math.min(100, Math.max(0, Math.round(
    catScore * 0.30 + locScore * 0.20 + 60 * 0.15 + contactScore * 0.15 + ratingScore * 0.10 + repeatScore * 0.10
  )));
}

export function generateAiNotes(
  buyer: Pick<Buyer, "name" | "category" | "city" | "rating" | "phone">,
  params: BuyerSearchParams,
  score: number
): string {
  const cat = buyer.category.replace(/_/g, " ");
  if (score >= 75) return `Buyer sangat relevan. ${buyer.name} (${cat}) cocok untuk ${params.commodity}.`;
  if (score >= 50) return `Buyer cukup relevan. ${buyer.name} (${cat}) berpotensi membutuhkan ${params.commodity}.`;
  return `Relevansi rendah. ${buyer.name} (${cat}) mungkin kurang cocok untuk ${params.commodity}.`;
}
