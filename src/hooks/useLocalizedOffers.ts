import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalOffers } from "@/lib/localOffers";
import { cityCenter, offers as fallbackOffers } from "@/data/mock";
import { buildOffersFromPlaces, fetchNearbyPlaces } from "@/lib/places";

/** Returns offers built from real nearby OSM places, with demo offers as fallback. */
export const useLocalizedOffers = () => {
  const locale = useLocale();
  const nearbyQuery = useQuery({
    queryKey: ["nearby-places", locale.geo?.lat, locale.geo?.lng],
    queryFn: () => fetchNearbyPlaces(locale.geo!),
    enabled: Boolean(locale.geo),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const fallback = useMemo(() => {
    const origin = locale.geo ?? cityCenter;
    // If we don't have a real geo yet, keep the original Berlin merchant names.
    const district = locale.geo ? locale.district : undefined;
    return buildLocalOffers(origin, district);
  }, [locale.geo, locale.district]);

  const realtimeOffers = useMemo(() => {
    if (!locale.geo || !nearbyQuery.data?.length) return null;
    return buildOffersFromPlaces(locale.geo, nearbyQuery.data, locale.district);
  }, [locale.geo, locale.district, nearbyQuery.data]);

  return {
    offers: realtimeOffers ?? fallback,
    isLoading: nearbyQuery.isLoading,
    isRealtime: Boolean(realtimeOffers),
    error: nearbyQuery.error,
  };
};

export const useLocalizedOffer = (id: string | undefined) => {
  const { offers } = useLocalizedOffers();
  return offers.find((o) => o.id === id) ?? offers[0] ?? fallbackOffers[0];
};
