import { MobileShell } from "@/components/MobileShell";
import { user } from "@/data/mock";
import { Link } from "react-router-dom";
import { Settings, Shield, CreditCard, Bell, HelpCircle, ExternalLink, Building2, ChevronRight } from "lucide-react";

const items = [
  { icon: CreditCard, label: "Cards & Payment methods" },
  { icon: Shield, label: "Security & Privacy" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Preferences" },
  { icon: HelpCircle, label: "Support" },
];

const Profile = () => (
  <MobileShell>
    <header className="px-5 pt-12 pb-3">
      <h1 className="font-display font-extrabold text-2xl text-foreground">Profile</h1>
    </header>

    <section className="px-5">
      <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-card grid place-items-center text-primary-foreground font-display font-extrabold text-xl">
          {user.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-base text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground font-mono truncate">{user.iban}</p>
        </div>
      </div>
    </section>

    <section className="px-5 mt-4">
      <Link to="/merchant" className="block rounded-2xl bg-gradient-card text-primary-foreground p-4 shadow-card-premium relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-sm">Open Merchant Dashboard</p>
            <p className="text-[11px] opacity-90">Set goals & let AI fill empty hours</p>
          </div>
          <ExternalLink className="h-4 w-4 opacity-90" />
        </div>
      </Link>
    </section>

    <section className="px-5 mt-4 space-y-1">
      {items.map(({ icon: Icon, label }) => (
        <button key={label} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-base">
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-secondary">
            <Icon className="h-4 w-4 text-foreground" />
          </span>
          <span className="flex-1 text-left text-sm font-semibold text-foreground">{label}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </section>

    <p className="px-5 mt-6 text-[11px] text-muted-foreground text-center">
      Sparkassen City Wallet · v0.1 · Berlin Mitte
    </p>
  </MobileShell>
);

export default Profile;
