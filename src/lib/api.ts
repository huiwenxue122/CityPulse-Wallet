export type ApiGuardrail = {
  label: string;
  passed: boolean;
};

export type ApiMerchantGoal = {
  merchantId: string;
  merchantName: string;
  goal: string;
  timeWindow: { start: string; end: string };
  maxDiscountPercent: number;
  radiusMeters: number;
  products: string[];
  tone: string;
};

export type ApiOffer = {
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
  guardrails: ApiGuardrail[];
  status: "draft" | "active" | "redeemed";
};

export type ApiPass = {
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

export type ApiMerchantResults = {
  shown: number;
  saved: number;
  redeemed: number;
  estimatedRevenue: number;
  latestRedemptions: Array<{
    redemptionId: string;
    merchantName: string;
    offerId: string;
    finalAmount: number;
    redeemedAt: string;
  }>;
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const request = async <T>(path: string, init?: RequestInit, timeoutMs = 20000): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: controller.signal,
    ...init,
  }).finally(() => window.clearTimeout(timeout));
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const api = {
  getMerchantGoal: () => request<ApiMerchantGoal>("/api/merchant/goal"),
  saveMerchantGoal: (goal: ApiMerchantGoal) =>
    request<ApiMerchantGoal>("/api/merchant/goal", { method: "POST", body: JSON.stringify(goal) }),
  generateOffer: (input = { userId: "u_001", merchantId: "m_001" }) =>
    request<ApiOffer>("/api/offers/generate", { method: "POST", body: JSON.stringify(input) }),
  getLatestOffer: () => request<ApiOffer | null>("/api/offers/latest"),
  activateOffer: (offerId: string) =>
    request<ApiOffer>(`/api/offers/${offerId}/activate`, { method: "POST" }),
  getActiveOffer: () => request<ApiOffer | null>("/api/offers/active"),
  addOfferToWallet: (offerId: string, basketAmount = 12) =>
    request<{ alreadyInWallet?: boolean; discountAmount: number; finalAmount: number; pass: ApiPass }>("/api/wallet/passes", {
      method: "POST",
      body: JSON.stringify({ userId: "u_001", offerId, basketAmount }),
    }),
  redeemOffer: (offerId: string, basketAmount = 12) =>
    request<{ alreadyInWallet?: boolean; alreadyRedeemed?: boolean; discountAmount: number; finalAmount: number; pass: ApiPass }>("/api/redeem", {
      method: "POST",
      body: JSON.stringify({ userId: "u_001", offerId, basketAmount }),
    }),
  getPasses: () => request<ApiPass[]>("/api/wallet/passes?userId=u_001"),
  redeemPass: (passId: string, basketAmount = 12) =>
    request<{ alreadyRedeemed?: boolean; discountAmount: number; finalAmount: number; pass: ApiPass }>(
      `/api/wallet/passes/${passId}/redeem`,
      { method: "POST", body: JSON.stringify({ basketAmount }) }
    ),
  getMerchantResults: () => request<ApiMerchantResults>("/api/merchant/results"),
};
