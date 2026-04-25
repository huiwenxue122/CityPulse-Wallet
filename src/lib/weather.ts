export type CityWeather = {
  weather: string;
  weatherEmoji: string;
  tempC: number;
  dayLabel: string;
  time: string;
  period: string;
};

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
    is_day?: number;
  };
};

const DISPLAY_LOCALE = "en-US";

const WEATHER_CODE: Record<number, { label: string; day: string; night: string }> = {
  0: { label: "Clear Sky", day: "☀️", night: "🌙" },
  1: { label: "Mostly Clear", day: "🌤️", night: "🌙" },
  2: { label: "Partly Cloudy", day: "⛅", night: "☁️" },
  3: { label: "Overcast", day: "☁️", night: "☁️" },
  45: { label: "Fog", day: "🌫️", night: "🌫️" },
  48: { label: "Rime Fog", day: "🌫️", night: "🌫️" },
  51: { label: "Light Drizzle", day: "🌦️", night: "🌧️" },
  53: { label: "Drizzle", day: "🌦️", night: "🌧️" },
  55: { label: "Heavy Drizzle", day: "🌧️", night: "🌧️" },
  61: { label: "Light Rain", day: "🌦️", night: "🌧️" },
  63: { label: "Rain", day: "🌧️", night: "🌧️" },
  65: { label: "Heavy Rain", day: "🌧️", night: "🌧️" },
  71: { label: "Light Snow", day: "🌨️", night: "🌨️" },
  73: { label: "Snow", day: "🌨️", night: "🌨️" },
  75: { label: "Heavy Snow", day: "❄️", night: "❄️" },
  80: { label: "Rain Showers", day: "🌦️", night: "🌧️" },
  81: { label: "Rain Showers", day: "🌦️", night: "🌧️" },
  82: { label: "Violent Showers", day: "⛈️", night: "⛈️" },
  95: { label: "Thunderstorm", day: "⛈️", night: "⛈️" },
  96: { label: "Thunderstorm", day: "⛈️", night: "⛈️" },
  99: { label: "Thunderstorm", day: "⛈️", night: "⛈️" },
};

const periodForHour = (hour: number) => {
  if (hour < 6) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

const formatDayLabel = (date: Date) =>
  `${date.toLocaleDateString(DISPLAY_LOCALE, { weekday: "long" })} ${periodForHour(date.getHours()).toLowerCase()}`;

export const fetchCurrentWeather = async (
  geo: { lat: number; lng: number }
): Promise<CityWeather> => {
  const params = new URLSearchParams({
    latitude: String(geo.lat),
    longitude: String(geo.lng),
    current: "temperature_2m,weather_code,is_day",
    timezone: "auto",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Weather lookup failed (${res.status})`);
  }

  const data: OpenMeteoResponse = await res.json();
  const current = data.current;

  if (!current?.time || current.temperature_2m == null || current.weather_code == null) {
    throw new Error("Weather lookup returned incomplete data");
  }

  const date = new Date(current.time);
  const code = WEATHER_CODE[current.weather_code] ?? {
    label: "Current Weather",
    day: "🌡️",
    night: "🌡️",
  };
  const isDay = current.is_day !== 0;

  return {
    weather: code.label,
    weatherEmoji: isDay ? code.day : code.night,
    tempC: Math.round(current.temperature_2m),
    dayLabel: formatDayLabel(date),
    time: date.toLocaleTimeString(DISPLAY_LOCALE, { hour: "2-digit", minute: "2-digit" }),
    period: periodForHour(date.getHours()),
  };
};
