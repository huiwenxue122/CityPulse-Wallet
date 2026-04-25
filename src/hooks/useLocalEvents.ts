import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/context/LocaleContext";
import { fallbackEventSignal, fetchLocalEventSignals } from "@/lib/events";

export const useLocalEvents = () => {
  const locale = useLocale();
  const query = useQuery({
    queryKey: ["local-event-signals", locale.geo?.lat, locale.geo?.lng, locale.district],
    queryFn: () => fetchLocalEventSignals(locale.geo!, locale.district),
    enabled: Boolean(locale.geo),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const fallback = fallbackEventSignal(locale.district);

  return {
    signal: query.data ?? fallback,
    isLoading: query.isLoading,
    isRealtime: query.data?.source === "ticketmaster" || query.data?.source === "openstreetmap",
    error: query.error,
  };
};
