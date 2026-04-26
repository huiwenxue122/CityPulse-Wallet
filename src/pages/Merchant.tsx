import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  MerchantShell,
  merchant,
} from "@/components/MerchantModeShared";
import { api, type ApiMerchantGoal, type ApiMerchantResults, type ApiOffer } from "@/lib/api";

const Merchant = () => {
  const [goal, setGoal] = useState<ApiMerchantGoal | null>(null);
  const [offer, setOffer] = useState<ApiOffer | null>(null);
  const [results, setResults] = useState<ApiMerchantResults | null>(null);

  useEffect(() => {
    api.getMerchantGoal().then(setGoal).catch(() => setGoal(null));
    api.getActiveOffer().then(setOffer).catch(() => setOffer(null));
    api.getMerchantResults().then(setResults).catch(() => setResults(null));
  }, []);

  const latestRedemptions = results?.latestRedemptions ?? [];

  return (
  <MerchantShell title="Merchant Mode">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-foreground">Current goal</h2>
            <p className="mt-1 font-display text-lg font-extrabold text-foreground">{goal?.goal ?? merchant.goal}</p>
            <p className="mt-1 text-sm text-muted-foreground">AI generates offers only within your guardrails.</p>
          </div>
          <Link to="/merchant/goal" className="shrink-0 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground">
            Change goal
          </Link>
        </div>
        <div className="mt-3 space-y-1.5 text-xs font-bold text-foreground">
          <p>
            {goal ? `${goal.timeWindow.start}–${goal.timeWindow.end}` : merchant.timeWindow} · Max {goal?.maxDiscountPercent ?? 15}% · {goal?.radiusMeters ?? 900}m radius
          </p>
          <p>{goal?.products.join(" + ") ?? merchant.products} · {goal?.tone ?? merchant.tone}</p>
        </div>
      </Card>

      <Card className="border-primary/15">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-bold text-base text-foreground">Active AI offer</h2>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
            Ready to activate
          </span>
        </div>
        <p className="mt-2 font-display text-lg font-extrabold text-foreground">{offer?.title ?? merchant.offerTitle}</p>
        <p className="mt-1 text-sm font-bold text-primary">
          {offer ? `${offer.discountPercent}% off ${offer.products.join(" + ")} · Valid ${offer.validMinutes} min` : `${merchant.offerDetail} · ${merchant.shortValidity}`}
        </p>
        <div className="mt-3 rounded-xl bg-secondary/60 p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Why now</p>
          <p className="mt-1 text-xs font-semibold text-foreground">Overcast, 9°C · demand shifting · quiet window</p>
        </div>
        <Link to="/merchant/review" className="mt-3 block rounded-xl border border-border bg-card py-2.5 text-center text-sm font-display font-bold text-foreground">
          Review offer
        </Link>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-foreground">Results today</h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">Updates after customers use wallet passes.</p>
          </div>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
            Live
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-primary/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Redeemed</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-primary">{results?.redeemed ?? 5}</p>
          </div>
          <div className="rounded-2xl bg-success/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revenue</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-success">${(results?.estimatedRevenue ?? 61.4).toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Latest redemptions</p>
          <div className="mt-2 space-y-1.5">
            {(latestRedemptions.length ? latestRedemptions : [
              { redemptionId: "seed-1", redeemedAt: "18:28", merchantName: "Coffee Rescue", finalAmount: 6.87 },
              { redemptionId: "seed-2", redeemedAt: "17:41", merchantName: "Lunch Deal", finalAmount: 11.61 },
            ]).map((redemption) => (
              <div key={redemption.redemptionId} className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>
                  <span className="text-muted-foreground">
                    {redemption.redeemedAt.includes("T")
                      ? new Date(redemption.redeemedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                      : redemption.redeemedAt}
                  </span> · {redemption.merchantName}
                </span>
                <span className="text-success">${redemption.finalAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
  </MerchantShell>
  );
};

export default Merchant;
