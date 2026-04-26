import type { Offer } from "@/data/mock";
import type { LocalEventSignal } from "@/lib/events";
import type { CityWeather } from "@/lib/weather";

export type MerchantRule = {
  id: string;
  categories: string[];
  goal: string;
  inventoryFocus: string;
  maxDiscount: number;
  slowWindow: { from: number; to: number };
  radiusM: number;
  tone: "Cozy & local" | "Student-friendly" | "Premium" | "Playful";
};

type SignalContext = {
  weather?: CityWeather;
  district: string;
  eventSignal?: LocalEventSignal;
  now?: Date;
  source: "demo" | "realtime";
};

const DISPLAY_LOCALE = "en-US";

export const merchantRules: MerchantRule[] = [
  {
    id: "cafe-rainy-footfall",
    categories: ["Café", "Bookstore Café"],
    goal: "Increase afternoon foot traffic",
    inventoryFocus: "Coffee + pastry",
    maxDiscount: 20,
    slowWindow: { from: 14, to: 17 },
    radiusM: 900,
    tone: "Cozy & local",
  },
  {
    id: "bakery-inventory",
    categories: ["Bakery"],
    goal: "Sell slow inventory",
    inventoryFocus: "Fresh pastry box",
    maxDiscount: 30,
    slowWindow: { from: 15, to: 18 },
    radiusM: 1100,
    tone: "Playful",
  },
  {
    id: "lunch-lull",
    categories: ["Lunch"],
    goal: "Boost weekday lunch",
    inventoryFocus: "Warm lunch combo",
    maxDiscount: 18,
    slowWindow: { from: 13, to: 16 },
    radiusM: 1200,
    tone: "Student-friendly",
  },
];

const fallbackRule: MerchantRule = {
  id: "general-local",
  categories: ["*"],
  goal: "Attract new customers",
  inventoryFocus: "Local favorite",
  maxDiscount: 15,
  slowWindow: { from: 12, to: 18 },
  radiusM: 1000,
  tone: "Cozy & local",
};

const isWithinWindow = (hour: number, rule: MerchantRule) =>
  hour >= rule.slowWindow.from && hour < rule.slowWindow.to;

const isBadWeather = (weather?: CityWeather) =>
  Boolean(weather && /rain|drizzle|snow|fog|thunder|overcast/i.test(weather.weather));

const ruleForCategory = (category: string) =>
  merchantRules.find((rule) => rule.categories.includes(category)) ?? fallbackRule;

export const getDemandPattern = (now = new Date(), weather?: CityWeather) => {
  const hour = now.getHours();
  const weekend = [0, 6].includes(now.getDay());

  if (isBadWeather(weather) && hour >= 12 && hour <= 18) {
    return {
      level: "Low",
      label: "Rain-sensitive afternoon foot traffic",
      scoreBoost: 18,
    };
  }

  if (hour >= 13 && hour <= 16) {
    return {
      level: "Low",
      label: "Post-lunch demand lull",
      scoreBoost: 14,
    };
  }

  if (weekend && hour >= 10 && hour <= 16) {
    return {
      level: "High",
      label: "Weekend city browsing",
      scoreBoost: 8,
    };
  }

  if (hour >= 7 && hour <= 10) {
    return {
      level: "High",
      label: "Morning commute demand",
      scoreBoost: 6,
    };
  }

  return {
    level: "Medium",
    label: "Steady neighborhood activity",
    scoreBoost: 10,
  };
};

export const getContextSignal = (
  now = new Date(),
  district: string,
  weather?: CityWeather,
  demandLabel?: string,
  merchantGoal?: string,
  eventSignal?: LocalEventSignal
) => {
  const hour = now.getHours();

  if (weather && /rain|drizzle|snow|fog|thunder|overcast/i.test(weather.weather)) {
    return "Weather shift is changing nearby demand";
  }
  if (demandLabel?.toLowerCase().includes("foot traffic")) {
    return "Commuter traffic rising nearby";
  }
  if (hour >= 16 && hour <= 20) return "Commuter traffic rising nearby";
  if (merchantGoal?.toLowerCase().includes("inventory")) return "Fresh inventory is moving before close";
  if (merchantGoal?.toLowerCase().includes("foot traffic")) return "Nearby foot traffic is building";
  if (eventSignal?.source === "ticketmaster" || eventSignal?.source === "openstreetmap") {
    return "Local activity is picking up nearby";
  }
  return `Current area and timing fit ${district}`;
};

export const getLocalEventSignal = (
  now = new Date(),
  district: string,
  eventSignal?: LocalEventSignal
) => getContextSignal(now, district, undefined, undefined, undefined, eventSignal);

const generatedTitle = (offer: Offer, rule: MerchantRule, badWeather: boolean, hour: number) => {
  if (badWeather && offer.category === "Café") return "Rainy-Day Coffee Rescue";
  if (rule.goal.includes("inventory")) return `${rule.inventoryFocus} Must-Go Deal`;
  if (offer.category === "Lunch" && hour >= 16) return "After-Work Dinner Deal";
  if (rule.goal.includes("lunch")) return "Smart Lunch Window Deal";
  if (rule.tone === "Premium") return "Curated Local Moment";
  if (rule.tone === "Playful") return "Right-Now Local Treat";
  return offer.title;
};

const generatedSubtitle = (offer: Offer, rule: MerchantRule, hour: number) => {
  if (offer.category === "Café") return "A warm coffee combo for this rainy evening";
  if (offer.category === "Bakery") return "Fresh pastries ready for your next stop";
  if (offer.category === "Lunch" && hour >= 16) return "An easy evening meal close to you";
  if (offer.category === "Lunch") return "A quick local meal while you're nearby";
  return offer.subtitle;
};

const recommendationLabel = (offer: Offer, score: number, eventSignal?: LocalEventSignal) => {
  if (eventSignal?.source === "ticketmaster" || eventSignal?.source === "openstreetmap") {
    return "Near tonight’s local activity";
  }
  if (offer.distanceM <= 700) return "Popular around you";
  if (score >= 70) return "Recommended now";
  return "Fits your current area and timing";
};

export const generateContextAwareOffers = (
  offers: Offer[],
  context: SignalContext
): Offer[] => {
  const now = context.now ?? new Date();
  const hour = now.getHours();
  const demand = getDemandPattern(now, context.weather);
  const badWeather = isBadWeather(context.weather);
  const eventScore = context.eventSignal?.source === "openstreetmap"
    ? Math.min(12, 4 + context.eventSignal.nearbyCount)
    : 3;
  const generatedAt = now.toLocaleTimeString(DISPLAY_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return offers
    .map((offer) => {
      const rule = ruleForCategory(offer.category);
      const contextSignal = getContextSignal(
        now,
        context.district,
        context.weather,
        demand.label,
        rule.goal,
        context.eventSignal
      );
      const distanceScore = Math.max(0, 35 - Math.round(offer.distanceM / 80));
      const weatherScore = badWeather && ["Café", "Bookstore Café", "Lunch"].includes(offer.category) ? 15 : 4;
      const windowScore = isWithinWindow(hour, rule) ? 18 : 6;
      const lateLunchPenalty = offer.category === "Lunch" && hour >= 16 ? 22 : 0;
      const score = Math.min(99, Math.max(0, distanceScore + weatherScore + windowScore + demand.scoreBoost + eventScore - lateLunchPenalty));
      const discount = Math.min(rule.maxDiscount, Math.max(8, Math.round(score / 5)));
      const finalPrice = Number((offer.originalPrice * (1 - discount / 100)).toFixed(2));
      const validWindow = `${rule.slowWindow.from}:00-${rule.slowWindow.to}:00`;

      return {
        ...offer,
        title: generatedTitle(offer, rule, badWeather, hour),
        subtitle: generatedSubtitle(offer, rule, hour),
        discount,
        finalPrice,
        expiresInMin: Math.max(20, Math.min(120, rule.slowWindow.to * 60 - hour * 60 || offer.expiresInMin)),
        whyNow: [
          `${offer.distanceM < 1000 ? `${offer.distanceM}m` : `${(offer.distanceM / 1000).toFixed(1)}km`} from you`,
          context.weather ? `${context.weather.weather}, ${context.weather.tempC}C` : "Current city context",
          demand.label,
          contextSignal,
          `Merchant goal: ${rule.goal}`,
        ],
        signals: ["location", "weather", "time", "demand", "merchant rules", "local events"],
        score,
        scoreLabel: recommendationLabel(offer, score, context.eventSignal),
        merchantGoal: rule.goal,
        demandPattern: demand.label,
        localEvent: contextSignal,
        eventSource: context.eventSignal?.source,
        eventVenueType: context.eventSignal?.venueType,
        validWindow,
        generatedAt,
        source: context.source,
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
};
