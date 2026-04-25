import { MobileShell } from "@/components/MobileShell";
import { CityContextCard } from "@/components/CityContextCard";
import { OfferCard } from "@/components/OfferCard";
import { useLocalizedOffers } from "@/hooks/useLocalizedOffers";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const Offers = () => {
  const [active, setActive] = useState("All");
  const { offers, isLoading, isRealtime } = useLocalizedOffers();
  const filters = useMemo(
    () => ["All", ...Array.from(new Set(offers.map((o) => o.category)))],
    [offers]
  );
  useEffect(() => {
    if (!filters.includes(active)) setActive("All");
  }, [active, filters]);
  const filtered = active === "All" ? offers : offers.filter(o => o.category === active);

  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {isRealtime ? "Live Nearby Places" : "AI Offer Feed"}
              </p>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-foreground mt-1">Curated for now</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Looking up real places near you..."
                : `${offers.length} ${isRealtime ? "real places" : "demo offers"} matched to this moment`}
            </p>
          </div>
          <button className="h-10 w-10 grid place-items-center rounded-full bg-secondary border border-border">
            <SlidersHorizontal className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </header>

      <section className="px-5 mt-4">
        <CityContextCard />
      </section>

      <div className="mt-5 px-5 flex items-center gap-2 overflow-x-auto scroll-hide">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-base",
              active === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="px-5 mt-4 space-y-3 pb-6">
        {filtered.map((o, i) => (
          <div key={o.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <OfferCard offer={o} />
          </div>
        ))}
      </section>
    </MobileShell>
  );
};

export default Offers;
