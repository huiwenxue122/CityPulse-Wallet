import { useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalOffers } from "@/lib/localOffers";
import { cityCenter, offers as fallbackOffers } from "@/data/mock";

/** Returns offers re-anchored around the user's real location with localized merchant names. */
export const useLocalizedOffers = () => {
  const locale = useLocale();
  return useMemo(() => {
    const origin = locale.geo ?? cityCenter;
    // If we don't have a real geo yet, keep the original Berlin merchant names.
    const district = locale.geo ? locale.district : undefined;
    return buildLocalOffers(origin, district);
  }, [locale.geo, locale.district]);
};

export const useLocalizedOffer = (id: string | undefined) => {
  const list = useLocalizedOffers();
  return list.find((o) => o.id === id) ?? list[0] ?? fallbackOffers[0];
};
