import OpenAI from "openai";
import type { CityContext, GeneratedOffer, MerchantGoal, UserContext } from "../types";

type LlmOfferPayload = Pick<
  GeneratedOffer,
  "title" | "headline" | "description" | "discountPercent" | "validMinutes" | "products" | "whyNow"
>;

const fallbackOffer = (
  merchantGoal: MerchantGoal,
  cityContext: CityContext,
  userContext: UserContext
): LlmOfferPayload => ({
  // Fallback generation happens here when OPENAI_API_KEY is not configured or the LLM call fails.
  title: "Rainy-Day Coffee Rescue",
  headline: `A warm stop ${userContext.distanceMeters}m away`,
  description: "A warm coffee combo for this rainy evening.",
  discountPercent: merchantGoal.maxDiscountPercent,
  validMinutes: 20,
  products: merchantGoal.products,
  whyNow: [
    `${cityContext.weather}, ${cityContext.temperatureC}°C`,
    cityContext.demandSignal,
    cityContext.nearbyActivity,
  ],
});

const parseJson = (content: string): LlmOfferPayload => {
  const cleaned = content.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned) as LlmOfferPayload;
};

const hasUsableOpenAiKey = () => {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && !key.includes("replace_with") && key !== "your_openai_api_key");
};

export const generateOfferWithLlm = async (
  merchantGoal: MerchantGoal,
  cityContext: CityContext,
  userContext: UserContext
): Promise<LlmOfferPayload> => {
  if (!hasUsableOpenAiKey()) {
    return fallbackOffer(merchantGoal, cityContext, userContext);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const controller = new AbortController();
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 8000);

    // The real LLM call happens here. OPENAI_API_KEY stays on the backend only.
    const completionPromise = openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You generate safe, concise, wallet-ready local offers. Return only valid JSON. Never exceed merchant guardrails.",
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                task: "Generate a structured offer JSON.",
                requiredShape: {
                  title: "string",
                  headline: "string",
                  description: "string",
                  discountPercent: "number",
                  validMinutes: "number",
                  products: "string[]",
                  whyNow: "string[]",
                },
                merchantGoal,
                cityContext,
                userContext,
                hardRules: [
                  `discountPercent must be <= ${merchantGoal.maxDiscountPercent}`,
                  `For this demo, set discountPercent to exactly ${merchantGoal.maxDiscountPercent}`,
                  "products must be selected only from merchantGoal.products",
                  "headline should be user-centered and location-aware",
                  "whyNow should explain weather, demand, time, or merchant goal signals",
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      { signal: controller.signal }
    );
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = windowlessTimeout(() => {
        controller.abort();
        reject(new Error(`OpenAI request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const completion = await Promise.race([completionPromise, timeoutPromise]);
    clearTimeout(timeoutHandle!);

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallbackOffer(merchantGoal, cityContext, userContext);
    return parseJson(content);
  } catch (error) {
    console.warn("LLM offer generation failed; using fallback.", error);
    return fallbackOffer(merchantGoal, cityContext, userContext);
  }
};

const windowlessTimeout = (callback: () => void, ms: number) => setTimeout(callback, ms);

export const buildGeneratedOffer = (
  llmOffer: LlmOfferPayload,
  merchantGoal: MerchantGoal
): GeneratedOffer => ({
  offerId: `offer_${Date.now()}`,
  merchantId: merchantGoal.merchantId,
  merchantName: merchantGoal.merchantName,
  title: llmOffer.title,
  headline: llmOffer.headline,
  description: llmOffer.description,
  // For the hackathon demo, make the generated offer visibly reflect the merchant's selected guardrail.
  discountPercent: merchantGoal.maxDiscountPercent,
  validMinutes: llmOffer.validMinutes,
  products: llmOffer.products,
  whyNow: llmOffer.whyNow,
  guardrails: [],
  status: "draft",
});
