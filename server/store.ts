import type { CityContext, GeneratedOffer, MerchantGoal, Redemption, WalletPass } from "./types";

export const cityContext: CityContext = {
  location: "Hamburg HafenCity",
  weather: "Overcast",
  temperatureC: 9,
  time: "18:45",
  demandSignal: "nearby demand is shifting",
  nearbyActivity: "evening foot traffic rising",
  signals: ["Weather shift", "Nearby demand", "Merchant goal"],
};

export let merchantGoal: MerchantGoal = {
  merchantId: "m_001",
  merchantName: "Chloe’s Café",
  goal: "Fill quiet early-evening hours",
  timeWindow: { start: "18:00", end: "20:00" },
  maxDiscountPercent: 15,
  radiusMeters: 900,
  products: ["coffee", "pastry"],
  tone: "Cozy & local",
};

export const offers = new Map<string, GeneratedOffer>();
export let latestOfferId: string | null = null;
export let activeOfferId: string | null = null;

export const passes: WalletPass[] = [];
export const redemptions: Redemption[] = [];

export const merchantResults = {
  shown: 24,
  saved: 7,
  redeemed: 5,
  estimatedRevenue: 61.4,
};

export const setMerchantGoal = (goal: MerchantGoal) => {
  merchantGoal = goal;
  return merchantGoal;
};

export const saveGeneratedOffer = (offer: GeneratedOffer) => {
  offers.set(offer.offerId, offer);
  latestOfferId = offer.offerId;
  return offer;
};

export const activateOffer = (offerId: string) => {
  const offer = offers.get(offerId);
  if (!offer) return null;
  offer.status = "active";
  offers.set(offerId, offer);
  activeOfferId = offerId;
  return offer;
};

export const getLatestOffer = () => (latestOfferId ? offers.get(latestOfferId) ?? null : null);
export const getActiveOffer = () => (activeOfferId ? offers.get(activeOfferId) ?? null : null);
