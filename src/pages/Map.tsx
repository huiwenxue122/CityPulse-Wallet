import { MobileShell } from "@/components/MobileShell";
import { offers as fallbackOffers, cityCenter } from "@/data/mock";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, LocateFixed, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildLocalOffers,
  buildLocalBounds,
  projectToPct,
} from "@/lib/localOffers";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lat: number; lng: number; accuracy: number }
  | { status: "denied" | "error"; message: string };

const Map = () => {
  const locale = useLocale();
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [selectedId, setSelectedId] = useState<string>(fallbackOffers[0].id);

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
        setGeo({ status: "ready", lat: latitude, lng: longitude, accuracy });
        locale.setGeo({ lat: latitude, lng: longitude });
        toast.success(`Location locked · ±${Math.round(accuracy)}m`);
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

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userGeo = useMemo(() => {
    if (geo.status === "ready") return { lat: geo.lat, lng: geo.lng };
    if (locale.geo) return locale.geo;
    return cityCenter;
  }, [geo, locale.geo]);

  const localOffers = useMemo(
    () => buildLocalOffers(userGeo, locale.district),
    [userGeo, locale.district]
  );
  const bounds = useMemo(() => buildLocalBounds(userGeo), [userGeo]);
  const userPct = useMemo(
    () => projectToPct(bounds, userGeo.lat, userGeo.lng),
    [bounds, userGeo]
  );

  const selected =
    localOffers.find((o) => o.id === selectedId) ?? localOffers[0];
  const isLive = geo.status === "ready";

  return (
    <MobileShell>
      <div className="relative h-[60vh] bg-secondary overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220 16% 88%)" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="userHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="400" height="600" fill="hsl(220 20% 96%)" />
            <rect width="400" height="600" fill="url(#grid)" />
            {/* Decorative roads */}
            <path d="M 0 250 L 400 220" stroke="white" strokeWidth="14" />
            <path d="M 220 0 L 200 600" stroke="white" strokeWidth="14" />
            <path d="M 0 480 L 400 500" stroke="white" strokeWidth="10" />
            {/* Decorative parks */}
            <circle cx="120" cy="480" r="55" fill="hsl(140 40% 82%)" />
            <rect x="280" y="60" width="90" height="70" rx="8" fill="hsl(140 40% 82%)" />
            {/* User halo */}
            <circle
              cx={(userPct.x / 100) * 400}
              cy={(userPct.y / 100) * 600}
              r="90"
              fill="url(#userHalo)"
            />
          </svg>

          {/* Pins */}
          {localOffers.map((o) => {
            const pct = projectToPct(bounds, o.geo.lat, o.geo.lng);
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-full transition-spring",
                  selected.id === o.id ? "z-20 scale-110" : "z-10 scale-100"
                )}
                style={{ left: `${pct.x}%`, top: `${pct.y}%` }}
              >
                <div
                  className={cn(
                    "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl rounded-bl-sm shadow-elev-md font-semibold text-xs",
                    selected.id === o.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border"
                  )}
                >
                  <span className="text-base">{o.emoji}</span>
                  <span>-{o.discount}%</span>
                </div>
              </button>
            );
          })}

          {/* User pin */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-spring"
            style={{ left: `${userPct.x}%`, top: `${userPct.y}%` }}
          >
            <div className="relative h-4 w-4">
              <span
                className={cn(
                  "absolute inset-0 rounded-full animate-pulse-dot",
                  isLive ? "bg-primary/30" : "bg-muted-foreground/30"
                )}
              />
              <span
                className={cn(
                  "absolute inset-1 rounded-full border-2 border-white shadow-elev-md",
                  isLive ? "bg-primary" : "bg-muted-foreground"
                )}
              />
            </div>
          </div>
        </div>

        <div className="absolute top-12 left-5 right-5 flex items-center justify-between gap-2">
          <div className="rounded-2xl bg-card/95 backdrop-blur px-3 py-2 shadow-elev-md flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">
                {locale.district}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">
                {geo.status === "ready" &&
                  `${locale.city} · ${locale.currency} · ±${Math.round(geo.accuracy)}m`}
                {geo.status === "loading" && "Locating…"}
                {geo.status === "denied" && "Location off — demo mode"}
                {geo.status === "error" && "Location unavailable — demo mode"}
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
            <div
              className={cn(
                "h-14 w-14 rounded-2xl bg-gradient-to-br grid place-items-center text-2xl flex-shrink-0",
                selected.color
              )}
            >
              {selected.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {selected.merchant}
              </p>
              <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                {selected.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selected.distanceM < 1000
                  ? `${selected.distanceM}m`
                  : `${(selected.distanceM / 1000).toFixed(1)}km`}
                {" · "}
                {selected.expiresInMin}m left
                {isLive && <span className="ml-1 text-success">• live</span>}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-sm font-bold">
              -{selected.discount}%
            </div>
          </div>
          <Link
            to={`/offer/${selected.id}`}
            className="block mt-3 w-full rounded-xl bg-primary text-primary-foreground py-3 text-center font-display font-bold text-sm hover:bg-primary-deep transition-base"
          >
            View offer
          </Link>
        </div>
      </section>
    </MobileShell>
  );
};

export default Map;
