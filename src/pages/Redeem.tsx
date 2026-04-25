import { MobileShell } from "@/components/MobileShell";
import { merchants, user } from "@/data/mock";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Wallet, Receipt, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useLocalizedOffer } from "@/hooks/useLocalizedOffers";
import { useLocale } from "@/context/LocaleContext";
import { useActivity } from "@/context/ActivityContext";

const Redeem = () => {
  const { id } = useParams();
  const offer = useLocalizedOffer(id);
  const locale = useLocale();
  const { addRedemption } = useActivity();
  const merchantTpl = merchants.find(m => m.id === offer.merchantId);
  const merchant = { ...merchantTpl, name: offer.merchant };
  const [shown, setShown] = useState(false);
  useEffect(() => {
    addRedemption(offer);
    const t = setTimeout(() => setShown(true), 50);
    return () => clearTimeout(t);
  }, [addRedemption, offer]);

  const code = "SC-" + (offer.id.toUpperCase().replace("-", "")) + "-9X4K";

  return (
    <MobileShell hideNav>
      <div className="px-5 pt-12 pb-6 bg-gradient-success text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className={cn("relative grid place-items-center transition-spring", shown ? "scale-100 opacity-100" : "scale-50 opacity-0")}>
          <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur grid place-items-center">
            <CheckCircle2 className="h-12 w-12" strokeWidth={2.5} />
          </div>
        </div>
        <div className="relative text-center mt-4">
          <p className="text-[11px] uppercase tracking-wider opacity-90 font-semibold">Payment confirmed</p>
          <h1 className="font-display font-extrabold text-2xl mt-1">{locale.formatPrice(offer.finalPrice)} paid</h1>
          <p className="text-sm opacity-90 mt-1">to {merchant.name}</p>
        </div>
      </div>

      <section className="-mt-4 mx-5 relative rounded-3xl bg-card border border-border shadow-elev-lg p-5">
        <div className="flex flex-col items-center">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Show this at the counter</p>
          <div className="mt-3 h-44 w-44 rounded-2xl bg-secondary p-3">
            <QrPlaceholder />
          </div>
          <p className="mt-3 font-mono text-sm font-bold tracking-widest text-foreground">{code}</p>
        </div>

        <div className="mt-5 pt-5 border-t border-dashed border-border space-y-2.5">
          <Row label="Offer" value={offer.title} />
          <Row label="Merchant" value={merchant.name} />
          <Row label="AI match" value={offer.scoreLabel ?? "Generated offer"} />
          <Row label="Original" value={locale.formatPrice(offer.originalPrice)} muted strike />
          <Row label={`Discount (${offer.discount}%)`} value={`− ${locale.formatPrice(offer.originalPrice - offer.finalPrice)}`} accent />
          <div className="pt-2.5 mt-2.5 border-t border-border flex items-center justify-between">
            <span className="font-display font-bold text-foreground">Total paid</span>
            <span className="font-display font-extrabold text-lg text-foreground">{locale.formatPrice(offer.finalPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> City Wallet •••• {user.cardLast4}</span>
            <span>Auth #84210</span>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-2xl bg-success/10 border border-success/20 p-4 flex items-start gap-3">
          <Receipt className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-foreground">Merchant credited instantly</p>
            <p className="text-xs text-muted-foreground mt-0.5">{merchant.name} received {locale.formatPrice(offer.finalPrice)}. A digital receipt has been added to your Activity.</p>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-5 bg-gradient-to-t from-background via-background to-transparent pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <Link to="/" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary text-primary-foreground py-4 font-display font-bold text-base shadow-elev-md hover:bg-primary-deep transition-base">
          <Home className="h-4 w-4" /> Back to Wallet
        </Link>
      </div>
    </MobileShell>
  );
};

const Row = ({ label, value, muted, strike, accent }: { label: string; value: string; muted?: boolean; strike?: boolean; accent?: boolean }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={cn("text-muted-foreground", muted && "text-muted-foreground/70")}>{label}</span>
    <span className={cn("font-semibold text-foreground", strike && "line-through text-muted-foreground", accent && "text-primary")}>{value}</span>
  </div>
);

const QrPlaceholder = () => {
  // Pseudo-random but stable QR-style grid
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const cornerInner = corner && ((x === 0 || x === 6 || x === 14 || x === 20 || y === 0 || y === 6 || y === 14 || y === 20));
    if (corner) return cornerInner ? 1 : ((x > 1 && x < 5 && y > 1 && y < 5) || (x > 15 && x < 19 && y > 1 && y < 5) || (x > 1 && x < 5 && y > 15 && y < 19)) ? 1 : 0;
    return ((x * 7 + y * 13 + (x ^ y)) % 3) === 0 ? 1 : 0;
  });
  return (
    <div className="h-full w-full grid bg-white rounded-lg p-1.5" style={{ gridTemplateColumns: "repeat(21, 1fr)", gridTemplateRows: "repeat(21, 1fr)", gap: "1px" }}>
      {cells.map((c, i) => <div key={i} className={c ? "bg-foreground" : "bg-transparent"} />)}
    </div>
  );
};

export default Redeem;
