import type { ReactNode } from "react";
import { MobileShell } from "@/components/MobileShell";

export const merchant = {
  name: "Chloe’s Café",
  status: "Live",
  category: "Coffee shop",
  location: "Hamburg · HafenCity",
  goal: "Fill quiet early-evening hours",
  timeWindow: "18:00–20:00",
  maxDiscount: "15%",
  radius: "900m",
  products: "Coffee + pastry",
  tone: "Cozy & local",
  offerTitle: "Rainy-Day Coffee Rescue",
  offerDetail: "15% off coffee + pastry",
  validity: "Valid for 20 minutes",
  shortValidity: "Valid 20 min",
  customerText: "A warm coffee combo for this rainy evening.",
  contextSignal: "Overcast, 9°C · nearby demand is shifting · this window is usually quiet",
};

export const resultsToday = [
  ["Shown", "24"],
  ["Saved", "7"],
  ["Redeemed", "5"],
  ["Est. revenue", "$61.40"],
];

export const liveRedemptions = [
  ["18:28", "Rainy-Day Coffee Rescue", "$6.87"],
  ["17:41", "Smart Lunch Window Deal", "$11.61"],
];

export const MerchantHeader = ({ title }: { title: string }) => (
  <header className="px-5 pt-8 pb-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display font-extrabold text-lg text-foreground">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
          <span className="whitespace-nowrap text-xs font-semibold text-foreground">{merchant.name} · {merchant.status}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-card text-primary-foreground grid place-items-center text-sm font-bold">CC</div>
      </div>
    </div>
  </header>
);

export const MerchantShell = ({ title, children }: { title: string; children: ReactNode }) => (
  <MobileShell>
    <MerchantHeader title={title} />
    <main className="px-5 space-y-3 animate-slide-up">{children}</main>
  </MobileShell>
);

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl bg-card border border-border shadow-elev-sm p-4 ${className}`}>
    {children}
  </section>
);

export const ResultsTodayCard = () => (
  <Card>
    <h2 className="font-display font-bold text-lg text-foreground">Results today</h2>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {resultsToday.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-secondary/60 p-3">
          <p className="font-display text-2xl font-extrabold text-foreground">{value}</p>
          <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  </Card>
);

export const LiveRedemptionsCard = () => (
  <Card>
    <h2 className="font-display font-bold text-lg text-foreground">Live redemptions</h2>
    <p className="mt-1 text-xs text-muted-foreground">
      Simulated checkouts appear here as customers redeem generated offers.
    </p>
    <div className="mt-3 space-y-2">
      {liveRedemptions.map(([time, offer, amount]) => (
        <div key={`${time}-${offer}`} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-3 py-2">
          <p className="min-w-0 truncate text-sm font-semibold text-foreground">
            <span className="text-muted-foreground">{time}</span> · {offer}
          </p>
          <span className="text-sm font-bold text-success">{amount}</span>
        </div>
      ))}
    </div>
  </Card>
);
