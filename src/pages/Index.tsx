import { MobileShell } from "@/components/MobileShell";
import { WalletCard } from "@/components/WalletCard";
import { CityContextCard } from "@/components/CityContextCard";
import { OfferCard } from "@/components/OfferCard";
import { offers, user } from "@/data/mock";
import { ArrowDownToLine, ArrowUpFromLine, Send, Plus, Bell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const bestOffer = offers[0];
  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Guten Tag,</p>
          <h1 className="font-display font-extrabold text-xl text-foreground">{user.name.split(" ")[0]}</h1>
        </div>
        <button className="relative h-10 w-10 grid place-items-center rounded-full bg-secondary border border-border">
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </button>
      </header>

      <section className="px-5 animate-slide-up">
        <WalletCard />
      </section>

      <section className="px-5 mt-5 grid grid-cols-4 gap-2">
        {[
          { icon: ArrowDownToLine, label: "Top up" },
          { icon: Send, label: "Send" },
          { icon: ArrowUpFromLine, label: "Pay" },
          { icon: Plus, label: "More" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary transition-base">
            <span className="h-9 w-9 grid place-items-center rounded-full bg-card shadow-elev-sm">
              <Icon className="h-4 w-4 text-primary" />
            </span>
            <span className="text-[11px] font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </section>

      <section className="px-5 mt-6 animate-slide-up" style={{ animationDelay: "60ms" }}>
        <CityContextCard />
      </section>

      <section className="px-5 mt-6 animate-slide-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display font-bold text-[15px] text-foreground">Best offer near you</h2>
          </div>
          <Link to="/offers" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        <OfferCard offer={bestOffer} />
      </section>

      <section className="px-5 mt-5 animate-slide-up" style={{ animationDelay: "180ms" }}>
        <h2 className="font-display font-bold text-[15px] text-foreground mb-3">More for your afternoon</h2>
        <div className="space-y-3">
          {offers.slice(1, 3).map(o => <OfferCard key={o.id} offer={o} compact />)}
        </div>
      </section>
    </MobileShell>
  );
};

export default Index;
