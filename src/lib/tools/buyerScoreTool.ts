import { Buyer, BuyerCategory, BuyerSearchParams, BuyerScoreResult } from "@/types";

/**
 * Buyer Score Calculator
 * Formula:
 * - 30% relevansi kategori bisnis terhadap komoditas
 * - 20% lokasi/wilayah (dekat = score tinggi)
 * - 15% potensi repeat order
 * - 15% kontak tersedia (ada nomor HP/WA = score tinggi)
 * - 10% rating/review
 * - 10% kecocokan komoditas
 */

const COMMODITY_CATEGORY_MAP: Record<string, BuyerCategory[]> = {
  jahe: ["pabrik_jamu", "toko_herbal", "supplier_rempah", "restoran", "katering", "umkm_makanan"],
  kencur: ["pabrik_jamu", "toko_herbal", "supplier_rempah", "umkm_makanan"],
  kunyit: ["pabrik_jamu", "toko_herbal", "supplier_rempah", "restoran", "katering"],
  beras: ["toko_beras", "grosir_sembako", "restoran", "katering", "hotel", "pasar_induk", "distributor_pangan"],
  singkong: ["pabrik_tepung_tapioka", "produsen_keripik", "umkm_makanan", "pasar_induk"],
  cabai: ["restoran", "katering", "grosir_sembako", "pasar_induk", "distributor_pangan", "supplier_rempah"],
  bawang: ["restoran", "katering", "grosir_sembako", "pasar_induk", "distributor_pangan", "supplier_rempah"],
  kopi: ["restoran", "hotel", "distributor_pangan", "umkm_makanan"],
  lada: ["restoran", "katering", "distributor_pangan", "grosir_sembako", "supplier_rempah"],
  temulawak: ["pabrik_jamu", "toko_herbal", "supplier_rempah"],
  lengkuas: ["restoran", "katering", "umkm_makanan", "pasar_induk", "supplier_rempah"],
  pala: ["distributor_pangan", "pabrik_jamu", "toko_herbal", "supplier_rempah"],
  cengkeh: ["pabrik_jamu", "distributor_pangan", "toko_herbal", "supplier_rempah"],
  kemiri: ["restoran", "katering", "grosir_sembako", "pasar_induk", "supplier_rempah"],
};

const PROVINCE_GROUPS: Record<string, string[]> = {
  jawa_barat: ["bandung", "bogor", "bekasi", "depok", "cirebon", "sukabumi", "garut", "tasikmalaya", "karawang", "subang"],
  jawa_tengah: ["semarang", "solo", "surakarta", "magelang", "pekalongan", "purwokerto", "kudus", "pati", "wonogiri"],
  jawa_timur: ["surabaya", "malang", "kediri", "sidoarjo", "gresik", "mojokerto", "jember", "blitar"],
  dki_jakarta: ["jakarta"],
  banten: ["tangerang", "serang", "cilegon"],
  yogyakarta: ["yogyakarta", "sleman", "bantul"],
  lampung: ["bandar lampung", "metro"],
  sumut: ["medan", "binjai"],
};

function getCategoryScore(commodity: string, category: BuyerCategory): number {
  const normalized = commodity.toLowerCase().trim();
  const relevant = COMMODITY_CATEGORY_MAP[normalized];
  if (relevant && relevant.includes(category)) {
    const idx = relevant.indexOf(category);
    return Math.max(60, 100 - idx * 8);
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
  for (const cities of Object.values(PROVINCE_GROUPS)) {
    if (cities.some(c => b.includes(c) || c.includes(b)) && cities.some(c => s.includes(c) || c.includes(s))) return 70;
  }
  const javaAll = Object.values(PROVINCE_GROUPS).flat();
  if (javaAll.some(c => b.includes(c)) && javaAll.some(c => s.includes(c))) return 45;
  return 25;
}

function getRepeatOrderScore(category: BuyerCategory): number {
  const high: BuyerCategory[] = ["restoran", "katering", "hotel", "pabrik_jamu", "pabrik_tepung_tapioka"];
  const med: BuyerCategory[] = ["grosir_sembako", "distributor_pangan", "pasar_induk", "toko_beras", "supplier_rempah"];
  if (high.includes(category)) return 90;
  if (med.includes(category)) return 70;
  return 50;
}

function getContactScore(phone: string, email: string, website: string): number {
  let score = 0;
  if (phone && phone !== "Tidak tersedia" && phone.length > 5) score += 50;
  if (email && email !== "Tidak tersedia") score += 25;
  if (website && website !== "Tidak tersedia" && website !== "-") score += 25;
  return score || 10;
}

function getRatingScore(rating: number): number {
  if (rating >= 4.5) return 100;
  if (rating >= 4.0) return 80;
  if (rating >= 3.5) return 60;
  if (rating >= 3.0) return 40;
  return 20;
}

function getCommodityMatchScore(commodity: string, category: BuyerCategory): number {
  const normalized = commodity.toLowerCase().trim();
  const relevant = COMMODITY_CATEGORY_MAP[normalized];
  if (relevant && relevant.includes(category)) return 90;
  for (const [key, cats] of Object.entries(COMMODITY_CATEGORY_MAP)) {
    if (normalized.includes(key) && cats.includes(category)) return 60;
  }
  return 30;
}

export function calculateBuyerScore(
  buyer: Pick<Buyer, "category" | "city" | "phone" | "email" | "website" | "rating">,
  params: BuyerSearchParams
): number {
  const catScore = getCategoryScore(params.commodity, buyer.category as BuyerCategory);
  const locScore = getLocationScore(buyer.city, params.city);
  const repeatScore = getRepeatOrderScore(buyer.category as BuyerCategory);
  const contactScore = getContactScore(buyer.phone, buyer.email, buyer.website);
  const ratingScore = getRatingScore(buyer.rating);
  const commodityMatch = getCommodityMatchScore(params.commodity, buyer.category as BuyerCategory);

  return Math.min(100, Math.max(0, Math.round(
    catScore * 0.30 +
    locScore * 0.20 +
    repeatScore * 0.15 +
    contactScore * 0.15 +
    ratingScore * 0.10 +
    commodityMatch * 0.10
  )));
}

export function getBuyerScoreResult(
  buyer: Pick<Buyer, "category" | "city" | "phone" | "email" | "website" | "rating">,
  params: BuyerSearchParams
): BuyerScoreResult {
  const score = calculateBuyerScore(buyer, params);
  const cat = (buyer.category as string).replace(/_/g, " ");

  let level: BuyerScoreResult["level"];
  let reason: string;

  if (score >= 75) {
    level = "Prioritas tinggi";
    reason = `Buyer sangat relevan (${cat}) untuk ${params.commodity} di ${params.city}. Peluang repeat order tinggi.`;
  } else if (score >= 50) {
    level = "Potensial";
    reason = `Buyer cukup relevan (${cat}) untuk ${params.commodity}. Perlu verifikasi kebutuhan.`;
  } else {
    level = "Rendah";
    reason = `Buyer kurang cocok (${cat}) untuk ${params.commodity}. Relevansi kategori rendah.`;
  }

  return { score, level, reason };
}

export function generateAiNotes(
  buyer: Pick<Buyer, "name" | "category" | "city" | "rating" | "phone">,
  params: BuyerSearchParams,
  score: number
): string {
  const cat = (buyer.category as string).replace(/_/g, " ");
  const notes: string[] = [];

  if (score >= 75) {
    notes.push(`Cocok karena ${cat} kemungkinan membutuhkan ${params.commodity} secara rutin.`);
  } else if (score >= 50) {
    notes.push(`Cocok untuk supply ${params.commodity} skala kecil-menengah.`);
  } else {
    notes.push(`Relevansi rendah. ${buyer.name} (${cat}) mungkin kurang cocok untuk ${params.commodity}.`);
  }

  if (buyer.city.toLowerCase() === params.city.toLowerCase()) {
    notes.push("Lokasi sama, pengiriman mudah.");
  }

  if (buyer.rating >= 4.0) {
    notes.push(`Rating tinggi (${buyer.rating}), bisnis terpercaya.`);
  }

  if (!buyer.phone || buyer.phone === "Tidak tersedia") {
    notes.push("Kontak belum tersedia, perlu riset lebih lanjut.");
  }

  return notes.join(" ");
}
