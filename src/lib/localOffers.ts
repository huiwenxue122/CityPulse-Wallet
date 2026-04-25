import { offers as templateOffers, type Offer } from "@/data/mock";
import { haversineMeters } from "@/lib/geo";

const METERS_PER_DEG_LAT = 111_320;

// Deterministic offsets (meters) per template index so refreshing position
// keeps the same merchant geometry around the user.
const OFFSETS_M: Array<{ dN: number; dE: number }> = [
  { dN: 180, dE: -240 },
  { dN: -150, dE: 320 },
  { dN: 380, dE: 280 },
  { dN: -340, dE: -180 },
];

const offsetLatLng = (
  origin: { lat: number; lng: number },
  dN: number,
  dE: number
) => {
  const dLat = dN / METERS_PER_DEG_LAT;
  const dLng =
    dE / (METERS_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180));
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
};

/** Build offers re-anchored around the user's real coordinates. */
export const buildLocalOffers = (
  user: { lat: number; lng: number },
  district?: string
): Offer[] => {
  const localBrands = district
    ? [
        { name: `Café ${district}`, address: `Main St · ${district}` },
        { name: `${district} Bakery`, address: `Baker Ln · ${district}` },
        { name: `LunchBox ${district}`, address: `Market Sq · ${district}` },
        { name: `Urban Books & Coffee`, address: `Reading Row · ${district}` },
      ]
    : null;

  return templateOffers.map((tpl, i) => {
    const off = OFFSETS_M[i % OFFSETS_M.length];
    const geo = offsetLatLng(user, off.dN, off.dE);
    const distanceM = haversineMeters(user, geo);
    const brand = localBrands?.[i];
    return {
      ...tpl,
      geo,
      distanceM,
      ...(brand ? { merchant: brand.name, address: brand.address } : {}),
    };
  });
};

/** Adaptive bounds: ~700m square centered on user, then project geo→%. */
export const buildLocalBounds = (user: { lat: number; lng: number }) => {
  const halfMeters = 700;
  const dLat = halfMeters / METERS_PER_DEG_LAT;
  const dLng =
    halfMeters / (METERS_PER_DEG_LAT * Math.cos((user.lat * Math.PI) / 180));
  return {
    minLat: user.lat - dLat,
    maxLat: user.lat + dLat,
    minLng: user.lng - dLng,
    maxLng: user.lng + dLng,
  };
};

export const projectToPct = (
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  lat: number,
  lng: number
) => {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return { x, y };
};

/** Free reverse-geocoding via OpenStreetMap (no key, low volume OK for demo). */
export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const params = new URLSearchParams({
      format: "json",
      lat: String(lat),
      lon: String(lng),
      zoom: "14",
      "accept-language": "en",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      { headers: { Accept: "application/json", "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const district =
      a.suburb || a.neighbourhood || a.city_district || a.quarter || a.town || a.village || null;
    const city = a.city || a.town || a.village || a.municipality || null;
    return {
      district: district || city || "Your area",
      city: city || "—",
      country: a.country || "",
    };
  } catch {
    return null;
  }
};
