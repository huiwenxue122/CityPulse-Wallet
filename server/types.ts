export type CityContext = {
  location: string;
  weather: string;
  temperatureC: number;
  time: string;
  demandSignal: string;
  nearbyActivity: string;
  signals: string[];
};

export type MerchantGoal = {
  merchantId: string;
  merchantName: string;
  goal: string;
  timeWindow: { start: string; end: string };
  maxDiscountPercent: number;
  radiusMeters: number;
  products: string[];
  tone: string;
};

export type UserContext = {
  userId: string;
  distanceMeters: number;
  preferences: string[];
};

export type GuardrailCheck = {
  label: string;
  passed: boolean;
};

export type GeneratedOffer = {
  offerId: string;
  merchantId: string;
  merchantName: string;
  title: string;
  headline: string;
  description: string;
  discountPercent: number;
  validMinutes: number;
  products: string[];
  whyNow: string[];
  guardrails: GuardrailCheck[];
  status: "draft" | "active" | "redeemed";
};

export type WalletPass = {
  passId: string;
  userId: string;
  offerId: string;
  title: string;
  merchantName: string;
  discountPercent: number;
  status: "active" | "used";
  qrCode: string;
  createdAt: string;
};

export type Redemption = {
  redemptionId: string;
  userId: string;
  offerId: string;
  merchantName: string;
  basketAmount: number;
  discountAmount: number;
  finalAmount: number;
  redeemedAt: string;
};
