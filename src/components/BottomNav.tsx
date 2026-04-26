import { NavLink, useLocation } from "react-router-dom";
import { SlidersHorizontal, Sparkles, Store, Ticket, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", icon: Wallet, label: "Home", exact: true },
  { to: "/discover", icon: Sparkles, label: "Discover" },
  { to: "/passes", icon: Ticket, label: "Passes" },
  { to: "/profile", icon: User, label: "Profile" },
];

const merchantItems = [
  { to: "/merchant", icon: Store, label: "Home", exact: true },
  { to: "/merchant/goal", icon: SlidersHorizontal, label: "Goal" },
  { to: "/merchant/review", icon: Sparkles, label: "Offer" },
  { to: "/merchant/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const navItems = pathname.startsWith("/merchant") ? merchantItems : items;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-nav pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around px-2 pt-2 pb-2">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <NavLink to={to} className="flex flex-col items-center gap-1 py-1.5 transition-base">
                <div
                  className={cn(
                    "flex items-center justify-center h-9 w-12 rounded-xl transition-spring",
                    active ? "bg-primary/10" : "bg-transparent"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-base", active ? "text-primary" : "text-muted-foreground")} />
                </div>
                <span className={cn("text-[10px] font-medium tracking-wide", active ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
