import { offers as templateOffers, type Offer } from "@/data/mock";
import { haversineMeters } from "@/lib/geo";

export type NearbyPlace = {
  id: string;
  name: string;
  category: "Café" | "Bakery" | "Lunch";
  address: string;
  lat: number;
  lng: number;
  distanceM: number;
};

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const CATEGORY_META: Record<
  NearbyPlace["category"],
  Pick<Offer, "emoji" | "color" | "title" | "subtitle">
> = {
  Café: {
    emoji: "☕",
    color: "from-amber-500 to-orange-600",
    title: "Nearby Coffee Break",
    subtitle: "A real café close to you",
  },
  Bakery: {
    emoji: "🥐",
    color: "from-rose-500 to-pink-600",
    title: "Fresh Local Bakery Stop",
    subtitle: "Bakery pickup near your location",
  },
  Lunch: {
    emoji: "🍲",
    color: "from-emerald-500 to-teal-600",
    title: "Local Lunch Deal",
    subtitle: "A nearby food spot for right now",
  },
};

const DISCOUNTS = [10, 15, 20, 25, 30, 12, 18, 22];
const EXPIRES_IN_MIN = [38, 47, 55, 68, 82, 95, 110, 125];

const categoryFromTags = (tags: Record<string, string>): NearbyPlace["category"] => {
  if (tags.shop === "bakery") return "Bakery";
  if (tags.amenity === "cafe") return "Café";
  return "Lunch";
};

const formatAddress = (tags: Record<string, string>, fallback: string) => {
  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const city =
    tags["addr:city:en"] ||
    tags["addr:city"] ||
    tags["addr:suburb:en"] ||
    tags["addr:suburb"] ||
    tags["addr:district:en"] ||
    tags["addr:district"];
  const streetLine = [street, houseNumber].filter(Boolean).join(" ");

  if (streetLine && city) return `${streetLine}, ${city}`;
  if (streetLine) return streetLine;
  if (city) return city;
  return fallback;
};

export const formatDistance = (meters: number) =>
  meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

export const fetchNearbyPlaces = async (
  user: { lat: number; lng: number },
  radiusM = 1800
): Promise<NearbyPlace[]> => {
  const query = `
    [out:json][timeout:12];
    (
      node["amenity"="cafe"]["name"](around:${radiusM},${user.lat},${user.lng});
      way["amenity"="cafe"]["name"](around:${radiusM},${user.lat},${user.lng});
      node["shop"="bakery"]["name"](around:${radiusM},${user.lat},${user.lng});
      way["shop"="bakery"]["name"](around:${radiusM},${user.lat},${user.lng});
      node["amenity"~"restaurant|fast_food"]["name"](around:${radiusM},${user.lat},${user.lng});
      way["amenity"~"restaurant|fast_food"]["name"](around:${radiusM},${user.lat},${user.lng});
    );
    out center 40;
  `;

  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error(`Nearby place lookup failed (${res.status})`);
  }

  const data: { elements?: OverpassElement[] } = await res.json();
  const seen = new Set<string>();

  return (data.elements ?? [])
    .map((el): NearbyPlace | null => {
      const tags = el.tags ?? {};
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      const name = (tags["name:en"] || tags.name)?.trim();

      if (!name || lat == null || lng == null) return null;

      const dedupeKey = `${name.toLowerCase()}-${lat.toFixed(4)}-${lng.toFixed(4)}`;
      if (seen.has(dedupeKey)) return null;
      seen.add(dedupeKey);

      return {
        id: `${el.type}-${el.id}`,
        name,
        category: categoryFromTags(tags),
        address: formatAddress(tags, "Address not listed in OpenStreetMap"),
        lat,
        lng,
        distanceM: haversineMeters(user, { lat, lng }),
      };
    })
    .filter((place): place is NearbyPlace => Boolean(place))
    .sort((a, b) => a.distanceM - b.distanceM);
};

export const buildOffersFromPlaces = (
  user: { lat: number; lng: number },
  places: NearbyPlace[],
  district: string
): Offer[] =>
  places.slice(0, 8).map((place, i) => {
    const meta = CATEGORY_META[place.category];
    const discount = DISCOUNTS[i % DISCOUNTS.length];
    const originalPrice = templateOffers[i % templateOffers.length].originalPrice;
    const finalPrice = Number((originalPrice * (1 - discount / 100)).toFixed(2));

    return {
      ...templateOffers[i % templateOffers.length],
      id: place.id,
      merchant: place.name,
      merchantId: place.id,
      category: place.category,
      title: meta.title,
      subtitle: meta.subtitle,
      discount,
      distanceM: haversineMeters(user, { lat: place.lat, lng: place.lng }),
      expiresInMin: EXPIRES_IN_MIN[i % EXPIRES_IN_MIN.length],
      whyNow: [
        `${formatDistance(place.distanceM)} from you`,
        `Real ${place.category.toLowerCase()} in ${district}`,
        "Found live via OpenStreetMap",
      ],
      signals: ["location", "openstreetmap"],
      emoji: meta.emoji,
      color: meta.color,
      originalPrice,
      finalPrice,
      address: place.address,
      coords: templateOffers[i % templateOffers.length].coords,
      geo: { lat: place.lat, lng: place.lng },
    };
  });
