import type { CityContext, GeneratedOffer, GuardrailCheck, MerchantGoal, UserContext } from "../types";

const minutesFromTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const normalize = (value: string) => value.toLowerCase().trim();

export const validateAndApplyGuardrails = (
  offer: GeneratedOffer,
  merchantGoal: MerchantGoal,
  cityContext: CityContext,
  userContext: UserContext
) => {
  // Guardrail validation happens after both LLM and fallback generation.
  const allowedProducts = new Set(merchantGoal.products.map(normalize));
  const originalDiscount = offer.discountPercent;
  const discountPercent = Math.min(originalDiscount, merchantGoal.maxDiscountPercent);
  const products = offer.products
    .map(normalize)
    .filter((product) => allowedProducts.has(product));
  const start = minutesFromTime(merchantGoal.timeWindow.start);
  const end = minutesFromTime(merchantGoal.timeWindow.end);
  const now = minutesFromTime(cityContext.time);
  const withinTimeWindow = start <= end ? now >= start && now <= end : now >= start || now <= end;

  const guardrails: GuardrailCheck[] = [
    {
      label: `Discount within ${merchantGoal.maxDiscountPercent}% limit`,
      passed: discountPercent <= merchantGoal.maxDiscountPercent,
    },
    {
      label: "Product eligible",
      passed: products.length > 0,
    },
    {
      label: "Time window matched",
      passed: withinTimeWindow,
    },
    {
      label: `Radius limited to ${merchantGoal.radiusMeters}m`,
      passed: userContext.distanceMeters <= merchantGoal.radiusMeters,
    },
  ];

  return {
    ...offer,
    discountPercent,
    products: products.length ? products : merchantGoal.products,
    guardrails,
  };
};
