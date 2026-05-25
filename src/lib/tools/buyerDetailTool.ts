/**
 * Buyer Detail Tool
 * Fetches detailed buyer information from Google Places API using place_id.
 * Falls back gracefully if API key not available.
 */

export interface BuyerDetail {
  name: string;
  formatted_address: string;
  phone: string;
  website: string;
  rating: number;
  maps_url: string;
  opening_hours: string[];
  place_id: string;
}

export async function fetchBuyerDetail(placeId: string): Promise<BuyerDetail | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const fields = "name,formatted_address,formatted_phone_number,website,rating,url,opening_hours,place_id";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&language=id`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.result) return null;

    const r = data.result;
    return {
      name: r.name || "Unknown",
      formatted_address: r.formatted_address || "Tidak tersedia",
      phone: r.formatted_phone_number || "Tidak tersedia",
      website: r.website || "Tidak tersedia",
      rating: r.rating || 0,
      maps_url: r.url || "",
      opening_hours: r.opening_hours?.weekday_text || [],
      place_id: placeId,
    };
  } catch {
    return null;
  }
}
