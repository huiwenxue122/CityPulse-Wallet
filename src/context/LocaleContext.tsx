import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cityCenter } from "@/data/mock";
import { reverseGeocode } from "@/lib/localOffers";

type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "CNY" | "CHF";

const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  "United States": "USD",
  "USA": "USD",
  "Canada": "CAD",
  "United Kingdom": "GBP",
  "England": "GBP",
  "Scotland": "GBP",
  "Wales": "GBP",
  "Australia": "AUD",
  "Japan": "JPY",
  "China": "CNY",
  "Switzerland": "CHF",
  // Eurozone
  "Germany": "EUR", "France": "EUR", "Spain": "EUR", "Italy": "EUR",
  "Netherlands": "EUR", "Belgium": "EUR", "Austria": "EUR", "Portugal": "EUR",
  "Ireland": "EUR", "Finland": "EUR", "Greece": "EUR",
};

// Rough conversion from base EUR-priced offers. Demo only.
const FX_FROM_EUR: Record<Currency, number> = {
  EUR: 1, USD: 1.08, GBP: 0.85, CAD: 1.48, AUD: 1.65,
  JPY: 168, CNY: 7.85, CHF: 0.96,
};

type LocaleValue = {
  geo: { lat: number; lng: number } | null;
  district: string;
  city: string;
  country: string;
  currency: Currency;
  symbol: string;
  /** Convert a EUR-denominated price into the active currency. */
  convert: (eurAmount: number) => number;
  /** Format a EUR-denominated price into the active currency string. */
  formatPrice: (eurAmount: number, opts?: { withSymbol?: boolean }) => string;
  setGeo: (geo: { lat: number; lng: number }) => void;
};

const SYMBOLS: Record<Currency, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
  JPY: "¥", CNY: "¥", CHF: "CHF ",
};

const LocaleContext = createContext<LocaleValue | null>(null);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [place, setPlace] = useState<{ district: string; city: string; country: string }>({
    district: "Berlin Mitte",
    city: "Berlin",
    country: "Germany",
  });

  useEffect(() => {
    if (!geo) return;
    let cancelled = false;
    reverseGeocode(geo.lat, geo.lng).then((p) => {
      if (cancelled || !p) return;
      setPlace({ district: p.district, city: p.city, country: p.country });
    });
    return () => { cancelled = true; };
  }, [geo]);

  const value = useMemo<LocaleValue>(() => {
    const currency: Currency = COUNTRY_TO_CURRENCY[place.country] ?? "USD";
    const symbol = SYMBOLS[currency];
    const rate = FX_FROM_EUR[currency];
    const convert = (eur: number) => eur * rate;
    const formatPrice = (eur: number, opts?: { withSymbol?: boolean }) => {
      const v = convert(eur);
      const fractionDigits = currency === "JPY" ? 0 : 2;
      const num = v.toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
      return opts?.withSymbol === false ? num : `${symbol}${num}`;
    };
    return {
      geo,
      district: place.district,
      city: place.city,
      country: place.country,
      currency,
      symbol,
      convert,
      formatPrice,
      setGeo,
    };
  }, [geo, place]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};

export const fallbackCenter = cityCenter;
