import { Link } from "react-router-dom";
import { Offer } from "@/data/mock";
import { Clock, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/places";

const fmtCountdown = (min: number) => {
  if (min < 60) return `${min}m left`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m left`;
};

export const OfferCard = ({ offer, compact = false }: { offer: Offer; compact?: boolean }) => (
  <Link
    to={`/offer/${offer.id}`}
    className="group block rounded-2xl bg-card border border-border shadow-elev-sm hover:shadow-elev-md transition-base overflow-hidden active:scale-[0.99]"
  >
    <div className="relative p-4">
      <div className="flex items-start gap-3">
        <div className={cn("relative flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br grid place-items-center text-2xl shadow-elev-sm", offer.color)}>
          <span className="drop-shadow-sm">{offer.emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{offer.merchant}</p>
              <h3 className="font-display font-bold text-[15px] leading-tight text-foreground mt-0.5 line-clamp-2">{offer.title}</h3>
            </div>
            <div className="flex-shrink-0 rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-sm font-bold">
              -{offer.discount}%
            </div>
          </div>

          {!compact && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{offer.subtitle}</p>
          )}

          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{formatDistance(offer.distanceM)}</span>
            <span className="flex items-center gap-1 text-warning"><Clock className="h-3 w-3" />{fmtCountdown(offer.expiresInMin)}</span>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-border flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Why now: </span>
            {offer.whyNow.join(" · ")}
          </p>
        </div>
      )}
    </div>
  </Link>
);
