import { cityContext } from "@/data/mock";
import { MapPin, Clock, TrendingDown } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export const CityContextCard = () => {
  const locale = useLocale();
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
      <p className="text-[11px] text-muted-foreground font-medium">{cityContext.time}</p>
    </div>

    <div className="mt-3 flex items-center gap-3">
      <div className="text-3xl">{cityContext.weatherEmoji}</div>
      <div className="flex-1">
        <p className="font-display font-bold text-base text-foreground">
          {cityContext.weather}, {cityContext.tempC}°C
        </p>
        <p className="text-xs text-muted-foreground">{cityContext.dayLabel}</p>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-border">
      <Stat icon={<MapPin className="h-3.5 w-3.5" />} label="District" value={locale.district} />
      <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Period" value="Afternoon" />
      <Stat icon={<TrendingDown className="h-3.5 w-3.5" />} label="Demand" value={cityContext.demandLevel} />
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
