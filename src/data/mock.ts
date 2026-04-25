export type Offer = {
  id: string;
  merchant: string;
  merchantId: string;
  category: string;
  title: string;
  subtitle: string;
  discount: number;
  distanceM: number;
  expiresInMin: number;
  whyNow: string[];
  signals: string[];
  emoji: string;
  color: string;
  terms: string[];
  originalPrice: number;
  finalPrice: number;
  address: string;
  coords: { x: number; y: number };
  geo: { lat: number; lng: number };
};

// Bounding box used to map lat/lng → SVG percentage coords on the stylized map.
// Roughly covers Berlin Mitte.
export const mapBounds = {
  minLat: 52.515,
  maxLat: 52.534,
  minLng: 13.385,
  maxLng: 13.420,
};

export const cityCenter = { lat: 52.5244, lng: 13.4025 }; // Berlin Mitte fallback

export const cityContext = {
  district: "Berlin Mitte",
  weather: "Light Rain",
  weatherEmoji: "🌧️",
  tempC: 11,
  dayLabel: "Tuesday afternoon",
  time: "14:32",
  demandLevel: "Low" as const,
  trend: "Quiet streets, indoor demand rising",
};

export const merchants = [
  { id: "cafe-mitte", name: "Café Mitte", category: "Café", address: "Rosenthaler Str. 38, 10178 Berlin", rating: 4.7 },
  { id: "kiez-bakery", name: "Kiez Bakery", category: "Bakery", address: "Auguststraße 11, 10117 Berlin", rating: 4.8 },
  { id: "lunchbox-alex", name: "LunchBox Alexanderplatz", category: "Lunch", address: "Alexanderplatz 7, 10178 Berlin", rating: 4.5 },
  { id: "urban-books", name: "Urban Books & Coffee", category: "Bookstore Café", address: "Tucholskystraße 32, 10117 Berlin", rating: 4.9 },
];

export const offers: Offer[] = [
  {
    id: "of-1",
    merchant: "Café Mitte",
    merchantId: "cafe-mitte",
    category: "Café",
    title: "Rainy Afternoon Comfort Deal",
    subtitle: "Cappuccino + Pastry combo",
    discount: 15,
    distanceM: 350,
    expiresInMin: 47,
    whyNow: ["Light rain in Mitte", "You're 350m away", "Low afternoon demand"],
    signals: ["weather", "location", "demand"],
    emoji: "☕",
    color: "from-amber-500 to-orange-600",
    terms: ["Valid today only", "One per customer", "Dine-in or takeaway", "Cannot combine with other offers"],
    originalPrice: 7.40,
    finalPrice: 6.30,
    address: "Rosenthaler Str. 38",
    coords: { x: 38, y: 42 },
    geo: { lat: 52.5258, lng: 13.4015 },
  },
  {
    id: "of-2",
    merchant: "Kiez Bakery",
    merchantId: "kiez-bakery",
    category: "Bakery",
    title: "End-of-Bake Pastry Box",
    subtitle: "Mixed pastries — fresh, must go",
    discount: 30,
    distanceM: 520,
    expiresInMin: 92,
    whyNow: ["Fresh inventory closing soon", "Walking distance", "First-time visitor bonus"],
    signals: ["inventory", "location", "loyalty"],
    emoji: "🥐",
    color: "from-rose-500 to-pink-600",
    terms: ["Pickup before 17:00", "While supplies last", "Box of 4 pastries"],
    originalPrice: 9.00,
    finalPrice: 6.30,
    address: "Auguststraße 11",
    coords: { x: 55, y: 30 },
    geo: { lat: 52.5275, lng: 13.3960 },
  },
  {
    id: "of-3",
    merchant: "LunchBox Alexanderplatz",
    merchantId: "lunchbox-alex",
    category: "Lunch",
    title: "Late Lunch Power Bowl",
    subtitle: "Warm bowl + hot drink",
    discount: 20,
    distanceM: 780,
    expiresInMin: 28,
    whyNow: ["Cold weather demand", "Lunch rush ended", "Matches your usual spend"],
    signals: ["weather", "demand", "personal"],
    emoji: "🍲",
    color: "from-emerald-500 to-teal-600",
    terms: ["Valid 14:00–17:00", "In-store only", "Choice of 3 bowls"],
    originalPrice: 12.50,
    finalPrice: 10.00,
    address: "Alexanderplatz 7",
    coords: { x: 72, y: 55 },
    geo: { lat: 52.5219, lng: 13.4132 },
  },
  {
    id: "of-4",
    merchant: "Urban Books & Coffee",
    merchantId: "urban-books",
    category: "Bookstore Café",
    title: "Reader's Hour — Coffee + Any Paperback",
    subtitle: "Stay dry, read more",
    discount: 25,
    distanceM: 410,
    expiresInMin: 130,
    whyNow: ["Rainy day reading mood", "Quiet hour at venue", "Matches your interests"],
    signals: ["weather", "demand", "personal"],
    emoji: "📚",
    color: "from-indigo-500 to-violet-600",
    terms: ["Valid until 18:00", "Any in-stock paperback", "Excludes hardcovers"],
    originalPrice: 18.90,
    finalPrice: 14.20,
    address: "Tucholskystraße 32",
    coords: { x: 45, y: 60 },
    geo: { lat: 52.5260, lng: 13.3940 },
  },
];

export const activity = [
  { id: "a1", type: "redeemed", merchant: "Café Mitte", amount: -6.30, label: "Comfort Combo", time: "Today, 14:12", icon: "☕" },
  { id: "a2", type: "offer_generated", merchant: "Kiez Bakery", amount: 0, label: "Offer surfaced", time: "Today, 13:45", icon: "✨" },
  { id: "a3", type: "topup", merchant: "Sparkasse", amount: 50.00, label: "Wallet top-up", time: "Today, 09:02", icon: "↑" },
  { id: "a4", type: "redeemed", merchant: "Urban Books & Coffee", amount: -14.20, label: "Reader's Hour", time: "Mon, 16:30", icon: "📚" },
  { id: "a5", type: "redeemed", merchant: "LunchBox Alexanderplatz", amount: -10.00, label: "Power Bowl", time: "Mon, 13:10", icon: "🍲" },
  { id: "a6", type: "topup", merchant: "Sparkasse", amount: 100.00, label: "Wallet top-up", time: "Sun, 18:00", icon: "↑" },
];

export const merchantAnalytics = {
  offersGenerated: 248,
  offersAccepted: 71,
  redemptions: 58,
  conversionRate: 28.6,
  incrementalRevenue: 1840,
  avgTicket: 6.80,
  weeklyData: [
    { day: "Mon", offers: 32, redemptions: 7 },
    { day: "Tue", offers: 41, redemptions: 12 },
    { day: "Wed", offers: 28, redemptions: 6 },
    { day: "Thu", offers: 36, redemptions: 9 },
    { day: "Fri", offers: 44, redemptions: 14 },
    { day: "Sat", offers: 38, redemptions: 8 },
    { day: "Sun", offers: 29, redemptions: 2 },
  ],
};

export const user = {
  name: "Lena Schmidt",
  iban: "DE89 1005 0000 0123 4567",
  cardLast4: "4451",
  balance: 1247.83,
  walletCredits: 12.50,
};
