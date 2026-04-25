export type LocalEventSignal = {
  label: string;
  source: "openstreetmap" | "pattern";
  nearbyCount: number;
  venueName?: string;
  venueType?: string;
};

type OverpassEventElement = {
  type: string;
  id: number;
  tags?: Record<string, string>;
};

const typeFromTags = (tags: Record<string, string>) => {
  if (tags.amenity === "theatre") return "theatre";
  if (tags.amenity === "arts_centre") return "arts centre";
  if (tags.amenity === "marketplace") return "market";
  if (tags.tourism === "museum") return "museum";
  if (tags.tourism === "gallery") return "gallery";
  if (tags.leisure === "stadium") return "stadium";
  if (tags.amenity === "events_venue") return "event venue";
  return "local venue";
};

export const fallbackEventSignal = (district: string): LocalEventSignal => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  if (day === 6 && hour >= 10 && hour <= 15) {
    return { label: `Weekend market traffic near ${district}`, source: "pattern", nearbyCount: 0 };
  }
  if (day >= 1 && day <= 5 && hour >= 16 && hour <= 19) {
    return { label: `After-work footfall around ${district}`, source: "pattern", nearbyCount: 0 };
  }
  if (hour >= 11 && hour <= 14) {
    return { label: `Lunch break movement near ${district}`, source: "pattern", nearbyCount: 0 };
  }
  return { label: `Everyday local routine in ${district}`, source: "pattern", nearbyCount: 0 };
};

export const fetchLocalEventSignals = async (
  user: { lat: number; lng: number },
  district: string,
  radiusM = 2500
): Promise<LocalEventSignal> => {
  const query = `
    [out:json][timeout:12];
    (
      node["amenity"~"theatre|arts_centre|marketplace|events_venue"]["name"](around:${radiusM},${user.lat},${user.lng});
      way["amenity"~"theatre|arts_centre|marketplace|events_venue"]["name"](around:${radiusM},${user.lat},${user.lng});
      node["tourism"~"museum|gallery"]["name"](around:${radiusM},${user.lat},${user.lng});
      way["tourism"~"museum|gallery"]["name"](around:${radiusM},${user.lat},${user.lng});
      node["leisure"="stadium"]["name"](around:${radiusM},${user.lat},${user.lng});
      way["leisure"="stadium"]["name"](around:${radiusM},${user.lat},${user.lng});
    );
    out center 25;
  `;

  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error(`Local event signal lookup failed (${res.status})`);
  }

  const data: { elements?: OverpassEventElement[] } = await res.json();
  const elements = data.elements ?? [];
  const first = elements[0];

  if (!first?.tags) return fallbackEventSignal(district);

  const venueName = first.tags["name:en"] || first.tags.name || "nearby venue";
  const venueType = typeFromTags(first.tags);

  return {
    label: `${elements.length} nearby event/venue signals, led by ${venueName}`,
    source: "openstreetmap",
    nearbyCount: elements.length,
    venueName,
    venueType,
  };
};
