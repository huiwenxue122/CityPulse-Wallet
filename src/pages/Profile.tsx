import { MobileShell } from "@/components/MobileShell";
import { user } from "@/data/mock";
import { Link, useLocation } from "react-router-dom";
import { Settings, Shield, CreditCard, Bell, HelpCircle, Building2, ChevronRight, User } from "lucide-react";

const items = [
  { icon: CreditCard, label: "Cards & Payment methods", to: "/profile/payment-methods" },
  { icon: Shield, label: "Security & Privacy" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Preferences" },
  { icon: HelpCircle, label: "Support" },
];

const Profile = () => {
  const { pathname } = useLocation();
  const isMerchantMode = pathname.startsWith("/merchant");
  const SwitchIcon = isMerchantMode ? User : Building2;

  return (
    <MobileShell>
    <header className="px-5 pt-12 pb-3">
      <h1 className="font-display font-extrabold text-2xl text-foreground">Profile</h1>
    </header>

    <section className="px-5">
      <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-card grid place-items-center text-primary-foreground font-display font-extrabold text-xl">
          {isMerchantMode ? "CC" : user.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-base text-foreground">
            {isMerchantMode ? "Chloe’s Café" : user.name}
          </p>
          {!isMerchantMode && (
            <p className="text-xs text-muted-foreground truncate">1 payment method connected</p>
          )}
          {isMerchantMode && (
            <p className="mt-1 text-xs font-bold text-success">Merchant account active</p>
          )}
        </div>
      </div>
    </section>

    <section className="px-5 mt-4">
      <Link
        to={isMerchantMode ? "/profile" : "/merchant"}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-elev-sm"
      >
        <SwitchIcon className="h-3.5 w-3.5 text-primary" />
        {isMerchantMode ? "Switch to customer mode" : "Switch to merchant mode"}
      </Link>
    </section>

    <section className="px-5 mt-4 space-y-1">
      {items.map(({ icon: Icon, label, to }) => {
        const content = (
          <>
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-secondary">
            <Icon className="h-4 w-4 text-foreground" />
          </span>
          <span className="flex-1 text-left text-sm font-semibold text-foreground">{label}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </>
        );

        return to ? (
          <Link key={label} to={to} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-base">
            {content}
          </Link>
        ) : (
          <button key={label} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-base">
            {content}
          </button>
        );
      })}
    </section>

    <p className="px-5 mt-6 text-[11px] text-muted-foreground text-center">
      CityPulse Wallet · v0.1
    </p>
    </MobileShell>
  );
};

export default Profile;
