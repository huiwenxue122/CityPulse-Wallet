import { MobileShell } from "@/components/MobileShell";
import { OfferCard } from "@/components/OfferCard";
import { useLocalizedOffers } from "@/hooks/useLocalizedOffers";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LiveOfferMap } from "@/components/LiveOfferMap";
import {
  discoverOfferDirectoryFilters,
  filterOffersByDirectory,
  type OfferDirectoryFilter,
} from "@/lib/offerDirectory";

const Offers = () => {
  const [active, setActive] = useState<OfferDirectoryFilter>("All");
  const { offers } = useLocalizedOffers();
  const filtered = filterOffersByDirectory(offers, active);

  return (
    <MobileShell>
      <LiveOfferMap />

      <section className="px-5 mt-5">
        <h1 className="font-display font-extrabold text-2xl text-foreground">More for you</h1>
      </section>

      <div className="mt-5 px-5 flex items-center gap-2 overflow-x-auto scroll-hide">
        {discoverOfferDirectoryFilters.map(f => (
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
        {filtered.length > 0 ? (
          filtered.map((o, i) => (
            <div key={o.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <OfferCard offer={o} />
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No live matches for {active} right now.
          </div>
        )}
      </section>
    </MobileShell>
  );
};

export default Offers;
