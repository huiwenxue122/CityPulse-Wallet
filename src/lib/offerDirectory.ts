import type { Offer } from "@/data/mock";

export const homeOfferDirectoryFilters = ["All", "Food", "Events", "Mobility", "Culture"] as const;
export const discoverOfferDirectoryFilters = [
  "All",
  "Nearby",
  "Tonight",
  "Food",
  "Events",
  "Mobility",
  "Culture",
  "Under $20",
] as const;
export const offerDirectoryFilters = discoverOfferDirectoryFilters;

export type OfferDirectoryFilter = (typeof offerDirectoryFilters)[number];

const foodCategories = new Set(["Bakery", "Bookstore Café", "Café", "Lunch"]);

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(term));

const searchableText = (offer: Offer) =>
  [
    offer.category,
    offer.title,
    offer.subtitle,
    offer.merchant,
    offer.localEvent,
    offer.eventSource,
    offer.eventVenueType,
    offer.demandPattern,
    ...offer.signals,
    ...offer.whyNow,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const matchesOfferDirectoryFilter = (
  offer: Offer,
  filter: OfferDirectoryFilter
) => {
  if (filter === "All") return true;
  if (filter === "Nearby") return offer.distanceM <= 1000;
  if (filter === "Tonight") {
    const text = searchableText(offer);
    return offer.expiresInMin <= 240 || includesAny(text, ["tonight", "evening", "show", "starts"]);
  }
  if (filter === "Under $20") return offer.finalPrice < 20;

  const text = searchableText(offer);

  if (filter === "Food") {
    return (
      foodCategories.has(offer.category) ||
      includesAny(text, ["cafe", "café", "bakery", "lunch", "food", "coffee", "pastry", "restaurant"])
    );
  }

  if (filter === "Events") {
    return (
      offer.eventSource === "ticketmaster" ||
      offer.eventSource === "openstreetmap" ||
      includesAny(text, ["event", "venue", "ticket", "show", "starts", "concert"])
    );
  }

  if (filter === "Mobility") {
    return includesAny(text, ["mobility", "transport", "transit", "bike", "scooter", "train", "tram", "bus"]);
  }

  return includesAny(text, ["culture", "museum", "gallery", "theatre", "theater", "arts", "cinema", "kino", "book"]);
};

export const filterOffersByDirectory = (
  offers: Offer[],
  filter: OfferDirectoryFilter
) => offers.filter((offer) => matchesOfferDirectoryFilter(offer, filter));
