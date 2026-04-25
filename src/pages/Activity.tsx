import { MobileShell } from "@/components/MobileShell";
import { activity, merchantAnalytics } from "@/data/mock";
import { ArrowDown, ArrowUp, Sparkles, TrendingUp, Receipt, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";

const Activity = () => {
  const [tab, setTab] = useState<"wallet" | "analytics">("wallet");
  const locale = useLocale();
  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-3">
        <h1 className="font-display font-extrabold text-2xl text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground">Your wallet & local impact</p>
      </header>

      <div className="px-5">
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-2xl">
          {(["wallet", "analytics"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-2 rounded-xl text-xs font-semibold capitalize transition-base",
                tab === t ? "bg-card text-foreground shadow-elev-sm" : "text-muted-foreground"
              )}
            >
              {t === "wallet" ? "Wallet" : "Local Impact"}
            </button>
          ))}
        </div>
      </div>

      {tab === "wallet" ? (
        <section className="mt-5 px-5 space-y-2">
          {activity.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className={cn(
                "h-11 w-11 rounded-xl grid place-items-center text-lg flex-shrink-0",
                a.type === "topup" ? "bg-success/10" : a.type === "offer_generated" ? "bg-primary/10" : "bg-secondary"
              )}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{a.label}</p>
                <p className="text-xs text-muted-foreground truncate">{a.merchant} · {a.time}</p>
              </div>
              {a.amount !== 0 && (
                <p className={cn("font-display font-bold text-sm flex items-center gap-0.5",
                  a.amount > 0 ? "text-success" : "text-foreground"
                )}>
                  {a.amount > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {locale.formatPrice(Math.abs(a.amount))}
                </p>
              )}
              {a.amount === 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">AI</span>
              )}
            </div>
          ))}
        </section>
      ) : (
        <section className="mt-5 px-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <KPI icon={<Sparkles className="h-4 w-4" />} label="Offers generated" value={merchantAnalytics.offersGenerated.toString()} trend="+12%" />
            <KPI icon={<Target className="h-4 w-4" />} label="Conversion" value={`${merchantAnalytics.conversionRate}%`} trend="+3.4pp" />
            <KPI icon={<Receipt className="h-4 w-4" />} label="Redemptions" value={merchantAnalytics.redemptions.toString()} trend="+8" />
            <KPI icon={<TrendingUp className="h-4 w-4" />} label="Revenue" value={locale.formatPrice(merchantAnalytics.incrementalRevenue)} trend={`+${locale.formatPrice(240)}`} />
          </div>

          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-sm text-foreground">This week</p>
              <p className="text-[11px] text-muted-foreground">Offers vs Redemptions</p>
            </div>
            <div className="flex items-end gap-2 h-32">
              {merchantAnalytics.weeklyData.map(d => {
                const max = 50;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end gap-0.5 h-24">
                      <div className="flex-1 bg-primary/15 rounded-t" style={{ height: `${(d.offers / max) * 100}%` }} />
                      <div className="flex-1 bg-primary rounded-t" style={{ height: `${(d.redemptions / max) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-card text-primary-foreground p-4 shadow-card-premium relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <p className="text-[11px] uppercase tracking-wider opacity-90 font-semibold relative">Estimated incremental revenue</p>
            <p className="font-display font-extrabold text-3xl mt-1 relative">€ {merchantAnalytics.incrementalRevenue.toLocaleString()}</p>
            <p className="text-xs opacity-90 mt-1 relative">attributable to AI-targeted offers this month</p>
          </div>
        </section>
      )}
    </MobileShell>
  );
};

const KPI = ({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) => (
  <div className="rounded-2xl bg-card border border-border p-3">
    <div className="flex items-center justify-between">
      <span className="h-7 w-7 grid place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="text-[10px] font-semibold text-success">{trend}</span>
    </div>
    <p className="font-display font-extrabold text-xl text-foreground mt-2">{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

export default Activity;
