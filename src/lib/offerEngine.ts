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

export const getLocalEventSignal = (now = new Date(), district: string, eventSignal?: LocalEventSignal) => {
  if (eventSignal) return eventSignal.label;

  const day = now.getDay();
  const hour = now.getHours();

  if (day === 6 && hour >= 10 && hour <= 15) return `Weekend market traffic near ${district}`;
  if (day >= 1 && day <= 5 && hour >= 16 && hour <= 19) return `After-work footfall around ${district}`;
  if (hour >= 11 && hour <= 14) return `Lunch break movement near ${district}`;
  return `Everyday local routine in ${district}`;
};

const generatedTitle = (offer: Offer, rule: MerchantRule, badWeather: boolean) => {
  if (badWeather && offer.category === "Café") return "Rainy-Day Coffee Rescue";
  if (rule.goal.includes("inventory")) return `${rule.inventoryFocus} Must-Go Deal`;
  if (rule.goal.includes("lunch")) return "Smart Lunch Window Deal";
  if (rule.tone === "Premium") return "Curated Local Moment";
  if (rule.tone === "Playful") return "Right-Now Local Treat";
  return offer.title;
};

const generatedSubtitle = (offer: Offer, rule: MerchantRule) => {
  if (offer.category === "Café") return `${rule.inventoryFocus} generated for this moment`;
  if (offer.category === "Bakery") return `${rule.inventoryFocus} matched to nearby demand`;
  if (offer.category === "Lunch") return `${rule.inventoryFocus} during a demand window`;
  return offer.subtitle;
};

export const generateContextAwareOffers = (
  offers: Offer[],
  context: SignalContext
): Offer[] => {
  const now = context.now ?? new Date();
  const hour = now.getHours();
  const demand = getDemandPattern(now, context.weather);
  const localEvent = getLocalEventSignal(now, context.district, context.eventSignal);
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
      const distanceScore = Math.max(0, 35 - Math.round(offer.distanceM / 80));
      const weatherScore = badWeather && ["Café", "Bookstore Café", "Lunch"].includes(offer.category) ? 15 : 4;
      const windowScore = isWithinWindow(hour, rule) ? 18 : 6;
      const score = Math.min(99, distanceScore + weatherScore + windowScore + demand.scoreBoost + eventScore);
      const discount = Math.min(rule.maxDiscount, Math.max(8, Math.round(score / 5)));
      const finalPrice = Number((offer.originalPrice * (1 - discount / 100)).toFixed(2));
      const validWindow = `${rule.slowWindow.from}:00-${rule.slowWindow.to}:00`;

      return {
        ...offer,
        title: generatedTitle(offer, rule, badWeather),
        subtitle: generatedSubtitle(offer, rule),
        discount,
        finalPrice,
        expiresInMin: Math.max(20, Math.min(120, rule.slowWindow.to * 60 - hour * 60 || offer.expiresInMin)),
        whyNow: [
          `${offer.distanceM < 1000 ? `${offer.distanceM}m` : `${(offer.distanceM / 1000).toFixed(1)}km`} from you`,
          context.weather ? `${context.weather.weather}, ${context.weather.tempC}C` : "Current city context",
          demand.label,
          localEvent,
          `Merchant goal: ${rule.goal}`,
        ],
        signals: ["location", "weather", "time", "demand", "merchant rules", "local events"],
        score,
        scoreLabel: score >= 75 ? "Best match" : score >= 60 ? "Strong match" : "Context match",
        merchantGoal: rule.goal,
        demandPattern: demand.label,
        localEvent,
        validWindow,
        generatedAt,
        source: context.source,
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
};
