import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export const MobileShell = ({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) => (
  <div className="min-h-screen bg-gradient-hero">
    <div className="mx-auto max-w-md min-h-screen bg-background relative pb-28 shadow-elev-lg">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  </div>
);
