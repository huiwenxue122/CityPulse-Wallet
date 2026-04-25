import { useQuery } from "@tanstack/react-query";
import { cityContext } from "@/data/mock";
import { useLocale } from "@/context/LocaleContext";
import { fetchCurrentWeather, type CityWeather } from "@/lib/weather";

type CityWeatherResult = CityWeather & {
  isLoading: boolean;
  isRealtime: boolean;
};

export const useCityWeather = (): CityWeatherResult => {
  const locale = useLocale();
  const query = useQuery({
    queryKey: ["city-weather", locale.geo?.lat, locale.geo?.lng],
    queryFn: () => fetchCurrentWeather(locale.geo!),
    enabled: Boolean(locale.geo),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const fallback: CityWeather = {
    weather: cityContext.weather,
    weatherEmoji: cityContext.weatherEmoji,
    tempC: cityContext.tempC,
    dayLabel: cityContext.dayLabel,
    time: cityContext.time,
    period: "Afternoon",
  };

  return {
    ...(query.data ?? fallback),
    isLoading: query.isLoading,
    isRealtime: Boolean(query.data),
  };
};
