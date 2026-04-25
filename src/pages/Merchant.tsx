import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { merchantAnalytics } from "@/data/mock";
import { Sparkles, Target, Clock, Tag, MapPin, Palette, ArrowLeft, TrendingUp, Receipt, Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

const goals = ["Increase afternoon foot traffic", "Sell slow inventory", "Attract new customers", "Boost weekday lunch"];
const tones = ["Cozy & local", "Student-friendly", "Premium", "Playful"];
const inventories = ["Pastries", "Coffee drinks", "Sandwiches", "Books"];

const Merchant = () => {
  const locale = useLocale();
  const [goal, setGoal] = useState(goals[0]);
  const [maxDiscount, setMaxDiscount] = useState(20);
  const [slowFrom, setSlowFrom] = useState(14);
  const [slowTo, setSlowTo] = useState(17);
  const [inventory, setInventory] = useState(inventories[0]);
  const [radius, setRadius] = useState(800);
  const [tone, setTone] = useState(tones[0]);

  const preview = useMemo(() => {
    const titles: Record<string, string> = {
      "Cozy & local": "Rainy Afternoon Comfort Deal",
      "Student-friendly": "Study Break Treat",
      "Premium": "Curator's Afternoon Selection",
      "Playful": "Sweet o'clock!",
    };
    const subs: Record<string, string> = {
      "Cozy & local": `${maxDiscount}% off ${inventory.toLowerCase()} + warm drink at your café`,
      "Student-friendly": `${maxDiscount}% off ${inventory.toLowerCase()} — perfect study fuel`,
      "Premium": `${maxDiscount}% off our finest ${inventory.toLowerCase()} pairing`,
      "Playful": `${maxDiscount}% off ${inventory.toLowerCase()} — yes, really`,
    };
    return {
      title: titles[tone],
      subtitle: subs[tone],
      window: `${slowFrom}:00 – ${slowTo}:00`,
      whyNow: [
        goal.toLowerCase().includes("afternoon") ? "Demand drops between 14–17:00" : "Targeting your stated goal",
        `Pushed to wallets within ${radius}m`,
        `Tone matched: ${tone.toLowerCase()}`,
      ],
    };
  }, [goal, maxDiscount, slowFrom, slowTo, inventory, radius, tone]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">Sparkassen City Wallet</p>
              <h1 className="font-display font-extrabold text-lg text-foreground">Merchant Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
              <span className="text-xs font-semibold text-foreground">Café Mitte · Live</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-card text-primary-foreground grid place-items-center text-sm font-bold">CM</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-6 lg:py-8 grid lg:grid-cols-3 gap-6">
        {/* Left: KPIs + Builder */}
        <section className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI icon={<Sparkles className="h-4 w-4" />} label="Offers generated" value={merchantAnalytics.offersGenerated.toString()} trend="+12%" />
            <KPI icon={<Target className="h-4 w-4" />} label="Conversion" value={`${merchantAnalytics.conversionRate}%`} trend="+3.4pp" />
            <KPI icon={<Receipt className="h-4 w-4" />} label="Redemptions" value={merchantAnalytics.redemptions.toString()} trend="+8" />
            <KPI icon={<TrendingUp className="h-4 w-4" />} label="Incr. revenue" value={`€${merchantAnalytics.incrementalRevenue}`} trend="+€240" />
          </div>

          <div className="rounded-3xl bg-card border border-border shadow-elev-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Offer rules</h2>
                <p className="text-xs text-muted-foreground">AI generates the actual offer. You set the guardrails.</p>
              </div>
              <button className="text-xs font-semibold text-primary flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Reset</button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Field icon={<Target className="h-4 w-4" />} label="Goal">
                <ChipGroup options={goals} value={goal} onChange={setGoal} />
              </Field>

              <Field icon={<Tag className="h-4 w-4" />} label={`Max discount · ${maxDiscount}%`}>
                <input
                  type="range" min={5} max={40} step={5}
                  value={maxDiscount} onChange={e => setMaxDiscount(+e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>5%</span><span>40%</span></div>
              </Field>

              <Field icon={<Clock className="h-4 w-4" />} label="Slow hours">
                <div className="flex items-center gap-2">
                  <TimeInput value={slowFrom} onChange={setSlowFrom} />
                  <span className="text-muted-foreground">–</span>
                  <TimeInput value={slowTo} onChange={setSlowTo} />
                </div>
              </Field>

              <Field icon={<Sparkles className="h-4 w-4" />} label="Inventory focus">
                <ChipGroup options={inventories} value={inventory} onChange={setInventory} />
              </Field>

              <Field icon={<MapPin className="h-4 w-4" />} label={`Target radius · ${radius}m`}>
                <input
                  type="range" min={200} max={2000} step={100}
                  value={radius} onChange={e => setRadius(+e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>200m</span><span>2km</span></div>
              </Field>

              <Field icon={<Palette className="h-4 w-4" />} label="Brand tone">
                <ChipGroup options={tones} value={tone} onChange={setTone} />
              </Field>
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border shadow-elev-sm p-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-4">Performance · This week</h2>
            <div className="flex items-end gap-3 h-48">
              {merchantAnalytics.weeklyData.map(d => {
                const max = 50;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end gap-1 h-40">
                      <div className="flex-1 bg-primary/15 rounded-t-md" style={{ height: `${(d.offers / max) * 100}%` }} />
                      <div className="flex-1 bg-primary rounded-t-md" style={{ height: `${(d.redemptions / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary/15" />Offers shown</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Redemptions</span>
            </div>
          </div>
        </section>

        {/* Right: Live Preview */}
        <aside className="space-y-4">
          <div className="rounded-3xl bg-card border border-border shadow-elev-sm p-5 sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">AI Live Preview</p>
              </div>
              <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Updating</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">As it appears in customer wallets within {radius}m.</p>

            {/* Mock phone */}
            <div className="rounded-3xl bg-gradient-hero p-3 border border-border">
              <div className="rounded-2xl bg-card border border-border p-4 shadow-elev-sm">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-2xl">☕</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Café Mitte</p>
                        <h3 className="font-display font-bold text-[15px] leading-tight text-foreground mt-0.5">{preview.title}</h3>
                      </div>
                      <div className="rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-sm font-bold">-{maxDiscount}%</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{preview.subtitle}</p>
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{radius}m radius</span>
                      <span className="flex items-center gap-1 text-warning"><Clock className="h-3 w-3" />{preview.window}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Why now: </span>{preview.whyNow.join(" · ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <Row label="Goal" value={goal} />
              <Row label="Window" value={preview.window} />
              <Row label="Tone" value={tone} />
            </div>

            <button className="mt-5 w-full rounded-2xl bg-primary text-primary-foreground py-3 font-display font-bold text-sm hover:bg-primary-deep transition-base">
              Activate offer
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Customers in radius will see this within ~30 seconds</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-1.5 text-foreground mb-2">
      <span className="text-primary">{icon}</span>
      <label className="text-xs font-semibold uppercase tracking-wider">{label}</label>
    </div>
    {children}
  </div>
);

const ChipGroup = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)} className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-base",
        value === o ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"
      )}>{o}</button>
    ))}
  </div>
);

const TimeInput = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <select value={value} onChange={e => onChange(+e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
    {Array.from({ length: 24 }, (_, i) => i).map(h => <option key={h} value={h}>{h}:00</option>)}
  </select>
);

const KPI = ({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) => (
  <div className="rounded-2xl bg-card border border-border p-4 shadow-elev-sm">
    <div className="flex items-center justify-between">
      <span className="h-8 w-8 grid place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="text-[10px] font-semibold text-success">{trend}</span>
    </div>
    <p className="font-display font-extrabold text-2xl text-foreground mt-2">{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground truncate">{value}</span>
  </div>
);

export default Merchant;
