import { Link } from "react-router-dom";
import {
  Card,
  MerchantShell,
  merchant,
} from "@/components/MerchantModeShared";

const Merchant = () => (
  <MerchantShell title="Merchant Mode">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-foreground">Current goal</h2>
            <p className="mt-1 font-display text-lg font-extrabold text-foreground">{merchant.goal}</p>
            <p className="mt-1 text-sm text-muted-foreground">AI generates offers only within your guardrails.</p>
          </div>
          <Link to="/merchant/goal" className="shrink-0 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground">
            Change goal
          </Link>
        </div>
        <div className="mt-3 space-y-1.5 text-xs font-bold text-foreground">
          <p>{merchant.timeWindow} · Max {merchant.maxDiscount} · {merchant.radius} radius</p>
          <p>{merchant.products} · {merchant.tone}</p>
        </div>
      </Card>

      <Card className="border-primary/15">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display font-bold text-base text-foreground">Active AI offer</h2>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
            Ready to activate
          </span>
        </div>
        <p className="mt-2 font-display text-lg font-extrabold text-foreground">{merchant.offerTitle}</p>
        <p className="mt-1 text-sm font-bold text-primary">{merchant.offerDetail} · {merchant.shortValidity}</p>
        <div className="mt-3 rounded-xl bg-secondary/60 p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Why now</p>
          <p className="mt-1 text-xs font-semibold text-foreground">Overcast, 9°C · demand shifting · quiet window</p>
        </div>
        <Link to="/merchant/review" className="mt-3 block rounded-xl border border-border bg-card py-2.5 text-center text-sm font-display font-bold text-foreground">
          Review offer
        </Link>
      </Card>

      <Card>
        <h2 className="font-display font-bold text-base text-foreground">Results today</h2>
        <p className="mt-2 text-sm font-bold text-foreground">shown · 5 redeemed · €61.40 revenue</p>
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Latest redemptions</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span><span className="text-muted-foreground">18:28</span> · Coffee Rescue</span>
              <span className="text-success">$6.87</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span><span className="text-muted-foreground">17:41</span> · Lunch Deal</span>
              <span className="text-success">$11.61</span>
            </div>
          </div>
        </div>
      </Card>
  </MerchantShell>
);

export default Merchant;
