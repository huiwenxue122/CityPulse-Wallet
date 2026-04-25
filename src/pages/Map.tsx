import { MobileShell } from "@/components/MobileShell";
import { offers } from "@/data/mock";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const Map = () => {
  const [selected, setSelected] = useState(offers[0]);

  return (
    <MobileShell>
      <div className="relative h-[60vh] bg-secondary overflow-hidden">
        {/* Stylized map background */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220 16% 88%)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="600" fill="hsl(220 20% 96%)" />
            <rect width="400" height="600" fill="url(#grid)" />
            {/* River Spree */}
            <path d="M 0 380 Q 100 360 200 400 T 400 390 L 400 430 Q 300 420 200 440 T 0 420 Z" fill="hsl(210 60% 88%)" />
            {/* Roads */}
            <path d="M 0 250 L 400 220" stroke="white" strokeWidth="14" />
            <path d="M 0 250 L 400 220" stroke="hsl(220 16% 90%)" strokeWidth="1" />
            <path d="M 220 0 L 200 600" stroke="white" strokeWidth="14" />
            <path d="M 220 0 L 200 600" stroke="hsl(220 16% 90%)" strokeWidth="1" />
            <path d="M 0 480 L 400 500" stroke="white" strokeWidth="10" />
            {/* Parks */}
            <circle cx="120" cy="480" r="55" fill="hsl(140 40% 82%)" />
            <rect x="280" y="60" width="90" height="70" rx="8" fill="hsl(140 40% 82%)" />
          </svg>

          {/* Pins */}
          {offers.map(o => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-full transition-spring",
                selected.id === o.id ? "z-20 scale-110" : "z-10 scale-100"
              )}
              style={{ left: `${o.coords.x}%`, top: `${o.coords.y}%` }}
            >
              <div className={cn(
                "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl rounded-bl-sm shadow-elev-md font-semibold text-xs",
                selected.id === o.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
              )}>
                <span className="text-base">{o.emoji}</span>
                <span>-{o.discount}%</span>
              </div>
            </button>
          ))}

          {/* User location */}
          <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-4 w-4">
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-dot" />
              <span className="absolute inset-1 rounded-full bg-primary border-2 border-white shadow-elev-md" />
            </div>
          </div>
        </div>

        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <div className="rounded-2xl bg-card/95 backdrop-blur px-3 py-2 shadow-elev-md flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Berlin Mitte</p>
          </div>
          <button className="h-10 w-10 grid place-items-center rounded-full bg-card shadow-elev-md">
            <Navigation className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      <section className="px-5 -mt-6 relative">
        <div className="rounded-2xl bg-card border border-border shadow-elev-lg p-4">
          <div className="flex items-start gap-3">
            <div className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br grid place-items-center text-2xl flex-shrink-0", selected.color)}>
              {selected.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{selected.merchant}</p>
              <h3 className="font-display font-bold text-base text-foreground mt-0.5">{selected.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{selected.distanceM}m · {selected.expiresInMin}m left</p>
            </div>
            <div className="flex-shrink-0 rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-sm font-bold">
              -{selected.discount}%
            </div>
          </div>
          <Link to={`/offer/${selected.id}`} className="block mt-3 w-full rounded-xl bg-primary text-primary-foreground py-3 text-center font-display font-bold text-sm hover:bg-primary-deep transition-base">
            View offer
          </Link>
        </div>
      </section>
    </MobileShell>
  );
};

export default Map;
