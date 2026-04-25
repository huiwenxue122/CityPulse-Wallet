import { mapBounds } from "@/data/mock";

export const haversineMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};

/** Project lat/lng into 0–100 % SVG coords for the stylized Mitte map. */
export const geoToMapPct = (lat: number, lng: number) => {
  const x =
    ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
  const y =
    ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
};

export const isInBounds = (lat: number, lng: number) =>
  lat >= mapBounds.minLat &&
  lat <= mapBounds.maxLat &&
  lng >= mapBounds.minLng &&
  lng <= mapBounds.maxLng;
