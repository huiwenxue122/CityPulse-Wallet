import { Bell, MapPin } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useCityWeather } from "@/hooks/useCityWeather";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLocalizedOffers } from "@/hooks/useLocalizedOffers";
import type { Offer } from "@/data/mock";
import { OfferCard } from "@/components/OfferCard";
import { api, type ApiOffer } from "@/lib/api";

const minutesUntilWindowEnd = (validWindow: string | undefined, now: Date) => {
  if (!validWindow) return null;
  const end = validWindow.split("-")[1];
  const [hour, minute = "0"] = end?.split(":") ?? [];
  const endHour = Number(hour);
  const endMinute = Number(minute);

  if (Number.isNaN(endHour) || Number.isNaN(endMinute)) return null;

  const endTime = new Date(now);
  endTime.setHours(endHour, endMinute, 0, 0);
  return Math.round((endTime.getTime() - now.getTime()) / 60000);
};

const pickTodaysBestOffer = (offers: Offer[], now: Date) => {
  const todayOffers = offers.filter((offer) => {
    const windowRemaining = minutesUntilWindowEnd(offer.validWindow, now);
    return offer.expiresInMin > 0 && (windowRemaining == null || windowRemaining > -30);
  });

  return [...(todayOffers.length ? todayOffers : offers)].sort((a, b) => {
    const scoreFor = (offer: Offer) => {
      const windowRemaining = minutesUntilWindowEnd(offer.validWindow, now);
      const urgencyBoost = Math.max(0, 90 - offer.expiresInMin);
      const proximityBoost = Math.max(0, 1200 - offer.distanceM) / 40;
      const realtimeBoost = offer.source === "realtime" ? 18 : 0;
      const eventBoost = offer.eventSource === "ticketmaster" ? 14 : offer.eventSource === "openstreetmap" ? 8 : 0;
      const activeWindowBoost = windowRemaining != null && windowRemaining > 0 ? 12 : 0;
      const lateLunchPenalty = offer.category === "Lunch" && now.getHours() >= 16 ? 80 : 0;

      return (offer.score ?? 0) + urgencyBoost + proximityBoost + realtimeBoost + eventBoost + activeWindowBoost - lateLunchPenalty;
    };

    return scoreFor(b) - scoreFor(a);
  })[0];
};

export const CityContextCard = ({ featuredOffer }: { featuredOffer?: Offer }) => {
  const locale = useLocale();
  const weather = useCityWeather();
  const navigate = useNavigate();
  const { offers } = useLocalizedOffers();
  const [now, setNow] = useState(() => new Date());
  const [activeApiOffer, setActiveApiOffer] = useState<ApiOffer | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const redeemLockRef = useRef(false);
  const bestOffer = useMemo(
    () => featuredOffer ?? pickTodaysBestOffer(offers, now),
    [featuredOffer, offers, now]
  );
  const liveTime = useMemo(
    () => now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    api.getActiveOffer()
      .then(setActiveApiOffer)
      .catch(() => setActiveApiOffer(null));
  }, []);

  const redeemActiveOffer = async () => {
    if (!activeApiOffer || redeemLockRef.current) return;
    redeemLockRef.current = true;
    setIsRedeeming(true);
    try {
      const result = await api.addOfferToWallet(activeApiOffer.offerId, 12);
      toast.success(result.alreadyInWallet ? "This pass is already in your wallet" : "Pass added to your wallet");
      navigate("/passes?tab=active");
    } catch (error) {
      console.error(error);
      toast.error("Could not add pass to wallet");
    } finally {
      redeemLockRef.current = false;
      setIsRedeeming(false);
    }
  };

  const heroTitle = activeApiOffer?.headline ?? bestOffer?.title;
  const heroMerchantLine = activeApiOffer
    ? `${activeApiOffer.merchantName} · ${activeApiOffer.title}`
    : bestOffer
      ? `${bestOffer.merchant} · ${bestOffer.title}`
      : "";
  const heroDiscount = activeApiOffer?.discountPercent ?? bestOffer?.discount;
  const heroDescription = activeApiOffer?.description ?? bestOffer?.subtitle;
  const heroValidMinutes = activeApiOffer?.validMinutes ?? bestOffer?.expiresInMin;
  const signalChips = activeApiOffer?.whyNow?.length
    ? activeApiOffer.whyNow.slice(0, 3)
    : ["142m away", `${weather.weather}, ${weather.tempC}°C`, "Demand shifting"];

  return (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card border border-border shadow-elev-sm p-3 min-w-0">
        <div className="shrink-0 max-w-[120px] rounded-xl bg-secondary/70 px-2.5 py-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="truncate text-xs font-semibold text-foreground">{locale.district}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="text-2xl">{weather.weatherEmoji}</div>
          <p className="truncate font-display font-bold text-sm text-foreground">
            {weather.weather}, {weather.tempC}°C
          </p>
        </div>
        <div className="min-w-[58px] text-right text-[11px] font-semibold text-muted-foreground">
          {weather.isLoading ? "Updating..." : liveTime}
        </div>
      </div>
      <button className="relative h-11 w-11 shrink-0 grid place-items-center rounded-full bg-card border border-border shadow-elev-sm">
        <Bell className="h-4 w-4 text-foreground" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
      </button>
    </div>

    <div className="rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/15 shadow-elev-md p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-14 bottom-4 h-24 w-24 rounded-full bg-success/10 blur-2xl" />
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <p className="font-display text-lg font-extrabold leading-tight text-primary">
          ✦ Matched to your moment
        </p>
        {(activeApiOffer || bestOffer) && (
          <div className="shrink-0 text-right">
            <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-destructive">
              Ends in {heroValidMinutes}m
            </span>
          </div>
        )}
      </div>
      {activeApiOffer || bestOffer ? (
        <div className="relative">
          {activeApiOffer ? (
            <div className="rounded-2xl bg-card border border-border p-4 shadow-elev-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    CityPulse AI offer
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold leading-tight text-foreground">
                    {heroTitle}
                  </h3>
                  <p className="mt-1.5 text-sm font-bold text-primary">{heroMerchantLine}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{heroDescription}</p>
                </div>
                <div className="flex-shrink-0 rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-sm font-bold">
                  -{heroDiscount}%
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {signalChips.map((signal) => (
                  <span key={signal} className="rounded-full bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <OfferCard offer={bestOffer} />
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {activeApiOffer ? (
              <button
                type="button"
                onClick={redeemActiveOffer}
                disabled={isRedeeming}
                className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-display font-bold text-primary-foreground shadow-elev-sm disabled:opacity-70"
              >
                {isRedeeming ? "Redeeming..." : "Use now"}
              </button>
            ) : (
              <Link
                to={`/redeem/${bestOffer.id}`}
                className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-display font-bold text-primary-foreground shadow-elev-sm"
              >
                Use now
              </Link>
            )}
            <button className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-display font-bold text-foreground">
              Save for later
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No live offer matches this category right now.
        </div>
      )}
    </div>
  </div>
  );
};
