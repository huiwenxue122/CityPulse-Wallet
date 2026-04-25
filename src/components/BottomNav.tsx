import { NavLink, useLocation } from "react-router-dom";
import { Wallet, Sparkles, Map, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Wallet, label: "Wallet" },
  { to: "/offers", icon: Sparkles, label: "Offers" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/activity", icon: Activity, label: "Activity" },
  { to: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-nav pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-around px-2 pt-2 pb-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
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
