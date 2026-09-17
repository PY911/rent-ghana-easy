export type Coords = { lat: number; lng: number };

export const GHANA_CITY_COORDS: Record<string, Coords> = {
  Accra: { lat: 5.6037, lng: -0.187 },
  Tema: { lat: 5.6698, lng: -0.0166 },
  Kumasi: { lat: 6.6885, lng: -1.6244 },
  Takoradi: { lat: 4.8961, lng: -1.7554 },
  "Cape Coast": { lat: 5.1053, lng: -1.2466 },
  Tamale: { lat: 9.4008, lng: -0.8393 },
  Ho: { lat: 6.6101, lng: 0.4713 },
  Sunyani: { lat: 7.3349, lng: -2.3268 },
  Koforidua: { lat: 6.0941, lng: -0.2591 },
};

export function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const p1 = (a.lat * Math.PI) / 180;
  const p2 = (b.lat * Math.PI) / 180;
  const dp = p2 - p1;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function nearestCity(coords: Coords) {
  let best = "Accra";
  let bestKm = Infinity;
  for (const [city, c] of Object.entries(GHANA_CITY_COORDS)) {
    const d = distanceKm(coords, c);
    if (d < bestKm) {
      bestKm = d;
      best = city;
    }
  }
  return { city: best, km: bestKm };
}

export function vendorDistanceKm(
  coords: Coords | null,
  vendor: { latitude?: number | null; longitude?: number | null; city?: string | null } | null | undefined,
) {
  if (!coords || !vendor) return null;
  if (typeof vendor.latitude === "number" && typeof vendor.longitude === "number") {
    return distanceKm(coords, { lat: vendor.latitude, lng: vendor.longitude });
  }
  const fallback = vendor.city ? GHANA_CITY_COORDS[vendor.city] : undefined;
  return fallback ? distanceKm(coords, fallback) : null;
}
