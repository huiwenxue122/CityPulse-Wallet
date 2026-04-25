import { MobileShell } from "@/components/MobileShell";
import { offers, cityCenter } from "@/data/mock";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, LocateFixed, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { haversineMeters, geoToMapPct, isInBounds } from "@/lib/geo";
import { toast } from "sonner";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lat: number; lng: number; accuracy: number; outOfArea: boolean }
  | { status: "denied" | "error"; message: string };

const Map = () => {
  const [selected, setSelected] = useState(offers[0]);
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error", message: "Geolocation not supported" });
      toast.error("Your browser doesn't support geolocation");
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const inArea = isInBounds(latitude, longitude);
        setGeo({
          status: "ready",
          lat: latitude,
          lng: longitude,
          accuracy,
          outOfArea: !inArea,
        });
        toast.success(
          inArea
            ? `Location locked · ±${Math.round(accuracy)}m`
            : "You're outside Berlin Mitte — showing demo center"
        );
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setGeo({
          status: denied ? "denied" : "error",
          message: denied ? "Location permission denied" : err.message,
        });
        toast.error(denied ? "Location permission denied" : "Couldn't get location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Auto-prompt once on mount
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effective coordinates used for distance + pin position
  const userGeo = useMemo(() => {
    if (geo.status === "ready" && !geo.outOfArea) return { lat: geo.lat, lng: geo.lng };
    return cityCenter;
  }, [geo]);

  const userPinPct = useMemo(() => geoToMapPct(userGeo.lat, userGeo.lng), [userGeo]);

  // Live distances
  const offersWithDistance = useMemo(
    () =>
      offers.map((o) => ({
        ...o,
        distanceM: haversineMeters(userGeo, o.geo),
      })),
    [userGeo]
  );

  const selectedLive =
    offersWithDistance.find((o) => o.id === selected.id) ?? offersWithDistance[0];

  const isLive = geo.status === "ready" && !geo.outOfArea;

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
            <path d="M 0 380 Q 100 360 200 400 T 400 390 L 400 430 Q 300 420 200 440 T 0 420 Z" fill="hsl(210 60% 88%)" />
            <path d="M 0 250 L 400 220" stroke="white" strokeWidth="14" />
            <path d="M 0 250 L 400 220" stroke="hsl(220 16% 90%)" strokeWidth="1" />
            <path d="M 220 0 L 200 600" stroke="white" strokeWidth="14" />
            <path d="M 220 0 L 200 600" stroke="hsl(220 16% 90%)" strokeWidth="1" />
            <path d="M 0 480 L 400 500" stroke="white" strokeWidth="10" />
            <circle cx="120" cy="480" r="55" fill="hsl(140 40% 82%)" />
            <rect x="280" y="60" width="90" height="70" rx="8" fill="hsl(140 40% 82%)" />
          </svg>

          {/* Pins */}
          {offersWithDistance.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-full transition-spring",
                selectedLive.id === o.id ? "z-20 scale-110" : "z-10 scale-100"
              )}
              style={{ left: `${o.coords.x}%`, top: `${o.coords.y}%` }}
            >
              <div className={cn(
                "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl rounded-bl-sm shadow-elev-md font-semibold text-xs",
                selectedLive.id === o.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
              )}>
                <span className="text-base">{o.emoji}</span>
                <span>-{o.discount}%</span>
              </div>
            </button>
          ))}

          {/* User location pin */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-spring"
            style={{ left: `${userPinPct.x}%`, top: `${userPinPct.y}%` }}
          >
            <div className="relative h-4 w-4">
              <span className={cn(
                "absolute inset-0 rounded-full animate-pulse-dot",
                isLive ? "bg-primary/30" : "bg-muted-foreground/30"
              )} />
              <span className={cn(
                "absolute inset-1 rounded-full border-2 border-white shadow-elev-md",
                isLive ? "bg-primary" : "bg-muted-foreground"
              )} />
            </div>
          </div>
        </div>

        <div className="absolute top-12 left-5 right-5 flex items-center justify-between gap-2">
          <div className="rounded-2xl bg-card/95 backdrop-blur px-3 py-2 shadow-elev-md flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">Berlin Mitte</p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">
                {geo.status === "ready" && !geo.outOfArea && `Live · ±${Math.round(geo.accuracy)}m`}
                {geo.status === "ready" && geo.outOfArea && "Demo center (outside area)"}
                {geo.status === "loading" && "Locating…"}
                {geo.status === "denied" && "Location off"}
                {geo.status === "error" && "Location unavailable"}
                {geo.status === "idle" && "Tap locate"}
              </p>
            </div>
          </div>
          <button
            onClick={requestLocation}
            disabled={geo.status === "loading"}
            className="h-10 w-10 grid place-items-center rounded-full bg-card shadow-elev-md flex-shrink-0 active:scale-95 transition-base"
            aria-label="Use my location"
          >
            {geo.status === "loading" ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : isLive ? (
              <LocateFixed className="h-4 w-4 text-primary" />
            ) : (
              <Navigation className="h-4 w-4 text-primary" />
            )}
          </button>
        </div>
      </div>

      <section className="px-5 -mt-6 relative">
        <div className="rounded-2xl bg-card border border-border shadow-elev-lg p-4">
          <div className="flex items-start gap-3">
            <div className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br grid place-items-center text-2xl flex-shrink-0", selectedLive.color)}>
              {selectedLive.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{selectedLive.merchant}</p>
              <h3 className="font-display font-bold text-base text-foreground mt-0.5">{selectedLive.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedLive.distanceM < 1000
                  ? `${selectedLive.distanceM}m`
                  : `${(selectedLive.distanceM / 1000).toFixed(1)}km`}
                {" · "}{selectedLive.expiresInMin}m left
                {isLive && <span className="ml-1 text-success">• live</span>}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-sm font-bold">
              -{selectedLive.discount}%
            </div>
          </div>
          <Link to={`/offer/${selectedLive.id}`} className="block mt-3 w-full rounded-xl bg-primary text-primary-foreground py-3 text-center font-display font-bold text-sm hover:bg-primary-deep transition-base">
            View offer
          </Link>
        </div>
      </section>
    </MobileShell>
  );
};

export default Map;
