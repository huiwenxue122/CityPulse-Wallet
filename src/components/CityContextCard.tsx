import { MapPin, Clock, Radio } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useCityWeather } from "@/hooks/useCityWeather";
import { useLocalEvents } from "@/hooks/useLocalEvents";
import { useEffect, useMemo, useState } from "react";

const periodForHour = (hour: number) => {
  if (hour < 6) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

const eventSourceLabel = (source: string) => {
  if (source === "ticketmaster") return "Ticketmaster";
  if (source === "openstreetmap") return "OpenStreetMap";
  return "pattern";
};

export const CityContextCard = () => {
  const locale = useLocale();
  const weather = useCityWeather();
  const events = useLocalEvents();
  const [now, setNow] = useState(() => new Date());
  const liveTime = useMemo(
    () => now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    [now]
  );
  const livePeriod = useMemo(() => periodForHour(now.getHours()), [now]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(tick);
  }, []);

  return (
  <div className="rounded-2xl bg-card border border-border shadow-elev-sm p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-pulse-dot" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Live City Context</p>
      </div>
      <p className="text-[11px] text-muted-foreground font-medium">
        {weather.isLoading ? "Updating..." : liveTime}
      </p>
    </div>

    <div className="mt-3 flex items-center gap-3">
      <div className="text-3xl">{weather.weatherEmoji}</div>
      <div className="flex-1">
        <p className="font-display font-bold text-base text-foreground">
          {weather.weather}, {weather.tempC}°C
        </p>
        <p className="text-xs text-muted-foreground">
          {weather.dayLabel}
          {weather.isRealtime ? " · live weather" : " · demo weather"}
        </p>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-border">
      <Stat icon={<MapPin className="h-3.5 w-3.5" />} label="District" value={locale.district} />
      <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Period" value={livePeriod} />
      <Stat icon={<Radio className="h-3.5 w-3.5" />} label="Source" value={weather.isRealtime ? "Live" : "Demo"} />
    </div>
    <div className="mt-3 rounded-xl bg-secondary/60 border border-border px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Local event signal · {eventSourceLabel(events.signal.source)}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-foreground line-clamp-2">{events.signal.label}</p>
    </div>
  </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1 text-muted-foreground">{icon}<span className="text-[10px] font-medium uppercase tracking-wider">{label}</span></div>
    <p className="text-xs font-semibold text-foreground truncate">{value}</p>
  </div>
);
