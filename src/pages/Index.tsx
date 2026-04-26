import { MobileShell } from "@/components/MobileShell";
import { CityContextCard } from "@/components/CityContextCard";
import { OfferCard } from "@/components/OfferCard";
import { Link } from "react-router-dom";
import { useLocalizedOffers } from "@/hooks/useLocalizedOffers";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  filterOffersByDirectory,
  homeOfferDirectoryFilters,
  type OfferDirectoryFilter,
} from "@/lib/offerDirectory";

const Index = () => {
  const [active, setActive] = useState<OfferDirectoryFilter>("All");
  const [now, setNow] = useState(() => new Date());
  const { offers, isLoading, isRealtime } = useLocalizedOffers();
  const filteredOffers = filterOffersByDirectory(offers, active);
  const bestOffer = filteredOffers[0];
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);
  const momentLabel = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }, [now]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <MobileShell>
      <header className="px-5 pt-12">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          {greeting}, Claire Xue
        </h1>
      </header>

      <section className="px-5 pt-4 animate-slide-up" style={{ animationDelay: "60ms" }}>
        <CityContextCard featuredOffer={bestOffer} />
      </section>

      <section className="px-5 mt-6 animate-slide-up" style={{ animationDelay: "120ms" }}>
        <div className="flex justify-end mb-3">
          <Link to="/discover" className="text-xs font-semibold text-primary">
            {isLoading ? "Finding..." : isRealtime ? "View map" : "See all"}
          </Link>
        </div>
        <div className="mb-3 flex items-center gap-2 overflow-x-auto scroll-hide">
          {homeOfferDirectoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-base",
                active === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        {!bestOffer && (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No live matches for {active} right now.
          </div>
        )}
      </section>

      {filteredOffers.length > 1 && (
        <section className="px-5 mt-5 animate-slide-up" style={{ animationDelay: "180ms" }}>
          <h2 className="font-display font-bold text-[15px] text-foreground mb-3">More for your {momentLabel}</h2>
          <div className="space-y-3">
            {filteredOffers.slice(1, 3).map(o => <OfferCard key={o.id} offer={o} compact />)}
          </div>
        </section>
      )}
    </MobileShell>
  );
};

export default Index;
