import { Link } from "react-router-dom";
import { CheckCircle2, Coffee, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, MerchantShell, merchant } from "@/components/MerchantModeShared";

const reasons = [
  "Overcast, 9°C",
  "Nearby demand is shifting",
  "This window is usually quiet",
];

const guardrails = [
  "Discount within 15% limit",
  "Product eligible",
  "Time window matched",
];

const MerchantReview = () => (
  <MerchantShell title="AI Offer Review">
    <Card className="border-primary/15">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display font-bold text-base text-foreground">AI-generated offer</h2>
        <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
          Ready to activate
        </span>
      </div>
      <div className="mt-3 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 p-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center">
            <Coffee className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-extrabold text-foreground">{merchant.offerTitle}</p>
            <p className="mt-1 text-sm font-bold text-primary">{merchant.offerDetail}</p>
            <p className="mt-1 text-xs font-semibold text-warning">{merchant.shortValidity}</p>
            <p className="mt-2 text-sm text-foreground">“{merchant.customerText}”</p>
          </div>
        </div>
      </div>
    </Card>

    <Card>
      <h2 className="font-display font-bold text-base text-foreground">AI reasoning & checks</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Why</p>
          <div className="mt-2 space-y-1.5">
            {reasons.map((reason) => (
              <div key={reason} className="flex items-start gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {reason}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Checks</p>
          <div className="mt-2 space-y-1.5">
            {guardrails.map((item) => (
              <div key={item} className="flex items-start gap-1.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>

    <div className="space-y-2">
      <button
        type="button"
        onClick={() => toast.success("Offer activated for nearby wallets")}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-display font-bold text-primary-foreground shadow-elev-sm"
      >
        Activate offer
      </button>
      <Link to="/merchant/goal" className="block w-full rounded-xl border border-border bg-card py-2.5 text-center text-sm font-display font-bold text-foreground">
        Edit goal
      </Link>
    </div>
  </MerchantShell>
);

export default MerchantReview;
