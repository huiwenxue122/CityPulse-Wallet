import { MobileShell } from "@/components/MobileShell";
import { merchants } from "@/data/mock";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, Sparkles, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedOffer } from "@/hooks/useLocalizedOffers";
import { useLocale } from "@/context/LocaleContext";

const OfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const offer = useLocalizedOffer(id);
  const locale = useLocale();
  const merchantTpl = merchants.find(m => m.id === offer.merchantId)!;
  const merchant = { ...merchantTpl, name: offer.merchant, address: offer.address };

  return (
    <MobileShell hideNav>
      <div className={cn("relative h-72 bg-gradient-to-br p-5 pt-12 text-white overflow-hidden", offer.color)}>
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <button onClick={() => navigate(-1)} className="relative h-10 w-10 grid place-items-center rounded-full bg-white/20 backdrop-blur">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="relative mt-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-90 font-semibold">{offer.merchant}</p>
            <h1 className="font-display font-extrabold text-2xl leading-tight mt-1 max-w-[260px]">{offer.title}</h1>
          </div>
          <div className="text-7xl drop-shadow-lg">{offer.emoji}</div>
        </div>
      </div>

      <div className="-mt-6 mx-5 relative rounded-2xl bg-card border border-border shadow-elev-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Your price</p>
            <p className="font-display font-extrabold text-3xl text-foreground">€ {offer.finalPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground line-through">€ {offer.originalPrice.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-primary/10 text-primary px-3 py-2 text-center">
            <p className="font-display font-extrabold text-2xl leading-none">-{offer.discount}%</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5">off</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-border">
          <Info icon={<MapPin className="h-3.5 w-3.5" />} label="Distance" value={`${offer.distanceM}m away`} />
          <Info icon={<Clock className="h-3.5 w-3.5 text-warning" />} label="Expires" value={`${offer.expiresInMin} min`} />
        </div>
      </div>

      <section className="px-5 mt-5">
        <div className="rounded-2xl bg-secondary/60 border border-border p-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Why this, why now</p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {offer.whyNow.map(w => (
              <li key={w} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-display font-bold text-[15px] text-foreground mb-2">Merchant</h3>
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br grid place-items-center text-2xl", offer.color)}>{offer.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{merchant.name}</p>
            <p className="text-xs text-muted-foreground truncate">{merchant.address}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-xs font-semibold text-foreground">{merchant.rating}</span>
              <span className="text-xs text-muted-foreground">· {merchant.category}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h3 className="font-display font-bold text-[15px] text-foreground mb-2">Terms</h3>
        <ul className="rounded-2xl bg-card border border-border p-4 space-y-2">
          {offer.terms.map(t => (
            <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-5 bg-gradient-to-t from-background via-background to-transparent pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <Link
          to={`/redeem/${offer.id}`}
          className="block w-full rounded-2xl bg-primary text-primary-foreground py-4 text-center font-display font-bold text-base shadow-elev-md hover:bg-primary-deep transition-base active:scale-[0.99]"
        >
          Redeem with City Wallet
        </Link>
      </div>
    </MobileShell>
  );
};

const Info = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1 text-muted-foreground">{icon}<span className="text-[10px] font-medium uppercase tracking-wider">{label}</span></div>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default OfferDetail;
