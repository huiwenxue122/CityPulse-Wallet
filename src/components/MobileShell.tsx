import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export const MobileShell = ({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) => (
  <div className="min-h-screen bg-gradient-hero">
    <div className={`mx-auto max-w-md min-h-screen bg-background relative shadow-elev-lg ${hideNav ? "pb-6" : "pb-28"}`}>
      {children}
      {!hideNav && <BottomNav />}
    </div>
  </div>
);
