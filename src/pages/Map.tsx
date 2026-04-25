import { MobileShell } from "@/components/MobileShell";
import { offers as fallbackOffers, cityCenter } from "@/data/mock";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, LocateFixed, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";
import { useLocalizedOffers } from "@/hooks/useLocalizedOffers";
import { formatDistance } from "@/lib/places";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lat: number; lng: number; accuracy: number }
  | { status: "denied" | "error"; message: string };

const TILE_SIZE = 256;
const DEFAULT_MAP_ZOOM = 16;
const MIN_MAP_ZOOM = 14;
const MAX_MAP_ZOOM = 18;
const MAP_VIEW = { width: 400, height: 600 };
const TILE_SUBDOMAINS = ["a", "b", "c"];

const latLngToWorldPixel = (
  geo: { lat: number; lng: number },
  zoom: number
) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((geo.lat * Math.PI) / 180);
  const x = ((geo.lng + 180) / 360) * scale;
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
};

const worldPixelToLatLng = (
  pixel: { x: number; y: number },
  zoom: number
) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (pixel.x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * pixel.y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
};

const getPointStyle = (
  center: { lat: number; lng: number },
  point: { lat: number; lng: number },
  zoom: number
) => {
  const centerPx = latLngToWorldPixel(center, zoom);
  const pointPx = latLngToWorldPixel(point, zoom);
  return {
    left: `${MAP_VIEW.width / 2 + pointPx.x - centerPx.x}px`,
    top: `${MAP_VIEW.height / 2 + pointPx.y - centerPx.y}px`,
  };
};

const buildMapTiles = (center: { lat: number; lng: number }, zoom: number) => {
  const centerPx = latLngToWorldPixel(center, zoom);
  const topLeft = {
    x: centerPx.x - MAP_VIEW.width / 2,
    y: centerPx.y - MAP_VIEW.height / 2,
  };
  const minTileX = Math.floor(topLeft.x / TILE_SIZE);
  const maxTileX = Math.floor((topLeft.x + MAP_VIEW.width) / TILE_SIZE);
  const minTileY = Math.floor(topLeft.y / TILE_SIZE);
  const maxTileY = Math.floor((topLeft.y + MAP_VIEW.height) / TILE_SIZE);
  const tileCount = 2 ** zoom;
  const tiles: Array<{
    key: string;
    url: string;
    left: number;
    top: number;
  }> = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      const subdomain =
        TILE_SUBDOMAINS[Math.abs(x + y) % TILE_SUBDOMAINS.length];
      tiles.push({
        key: `${x}-${y}`,
        url: `https://${subdomain}.tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: x * TILE_SIZE - topLeft.x,
        top: y * TILE_SIZE - topLeft.y,
      });
    }
  }

  return tiles;
};

const clampMapZoom = (zoom: number) =>
  Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, zoom));

const isInteractiveElement = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest("a, button"));

const Map = () => {
  const locale = useLocale();
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [selectedId, setSelectedId] = useState<string>(fallbackOffers[0].id);
  const { offers: localOffers, isLoading, isRealtime } = useLocalizedOffers();
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [mapCenter, setMapCenter] = useState(cityCenter);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    centerPx: { x: number; y: number };
  } | null>(null);

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

  useEffect(() => {
    setMapCenter(userGeo);
  }, [userGeo]);

  const mapTiles = useMemo(
    () => buildMapTiles(mapCenter, mapZoom),
    [mapCenter, mapZoom]
  );
  const userPointStyle = useMemo(
    () => getPointStyle(mapCenter, userGeo, mapZoom),
    [mapCenter, mapZoom, userGeo]
  );

  const selected =
    localOffers.find((o) => o.id === selectedId) ?? localOffers[0];
  const isLive = geo.status === "ready" && isRealtime;
  const zoomIn = () => setMapZoom((zoom) => clampMapZoom(zoom + 1));
  const zoomOut = () => setMapZoom((zoom) => clampMapZoom(zoom - 1));
  const recenterMap = () => setMapCenter(userGeo);
  const handleMapPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (isInteractiveElement(event.target)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      centerPx: latLngToWorldPixel(mapCenter, mapZoom),
    };
  };
  const handleMapPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setMapCenter(
      worldPixelToLatLng(
        { x: drag.centerPx.x - dx, y: drag.centerPx.y - dy },
        mapZoom
      )
    );
  };
  const handleMapPointerUp = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <MobileShell>
      <div className="relative h-[60vh] bg-secondary overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[#e5e3df]"
          aria-label="Real street map"
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={handleMapPointerUp}
          onPointerCancel={handleMapPointerUp}
          style={{ touchAction: "none" }}
        >
          {mapTiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              draggable={false}
              className="absolute h-64 w-64 select-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/20 pointer-events-none" />
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-1 right-1 rounded bg-white/85 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-sm"
          >
            © OSM
          </a>
          <div className="absolute right-3 top-28 z-30 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-elev-md backdrop-blur">
            <button
              onClick={zoomIn}
              disabled={mapZoom >= MAX_MAP_ZOOM}
              className="grid h-10 w-10 place-items-center text-lg font-bold text-foreground disabled:opacity-40"
              aria-label="Zoom in"
            >
              +
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={zoomOut}
              disabled={mapZoom <= MIN_MAP_ZOOM}
              className="grid h-10 w-10 place-items-center text-xl font-bold text-foreground disabled:opacity-40"
              aria-label="Zoom out"
            >
              -
            </button>
          </div>
          <button
            onClick={recenterMap}
            className="absolute bottom-6 left-3 z-30 rounded-full bg-card/95 px-3 py-2 text-[11px] font-bold text-foreground shadow-elev-md backdrop-blur active:scale-95 transition-base"
            aria-label="Center map on my location"
          >
            Recenter
          </button>

          {/* Pins */}
          {localOffers.map((o) => {
            const pointStyle = getPointStyle(mapCenter, o.geo, mapZoom);
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-full transition-spring",
                  selected.id === o.id ? "z-20 scale-110" : "z-10 scale-100"
                )}
                style={pointStyle}
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
            style={userPointStyle}
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
                  `${locale.city} · ${isLoading ? "finding places" : isRealtime ? "live places" : "demo offers"} · ±${Math.round(geo.accuracy)}m`}
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
                {formatDistance(selected.distanceM)}
                {" · "}
                {selected.expiresInMin}m left
                {isRealtime && <span className="ml-1 text-success">• live place</span>}
              </p>
              {selected.localEvent && (
                <p className="text-[11px] text-primary font-medium mt-1 line-clamp-1">
                  Event: {selected.localEvent}
                </p>
              )}
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
