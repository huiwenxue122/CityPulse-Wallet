import { MobileShell } from "@/components/MobileShell";
import { CheckCircle2, Coffee, Film, Landmark, QrCode, Ticket, Train } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api, type ApiPass } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type PassTab = "active" | "upcoming" | "used";

type Pass = {
  id: string;
  kind: "movie" | "offer" | "transit" | "event" | "used";
  tab: PassTab;
  generated?: boolean;
  title: string;
  merchant: string;
  meta: string;
  detail: string;
  icon: React.ReactNode;
  tone: string;
};

const passes: Pass[] = [
  {
    id: "city-kino",
    kind: "movie",
    tab: "active",
    title: "19:00 movie ticket",
    merchant: "City Kino Hamburg",
    meta: "Seat B12 · Ready to scan",
    detail: "Valid tonight from 18:30",
    icon: <Film className="h-5 w-5" />,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "kaffee-hafen",
    kind: "offer",
    tab: "active",
    title: "15% off hot drink",
    merchant: "Kaffee Hafen",
    meta: "Current offer · 900m away",
    detail: "Show QR before checkout",
    icon: <Coffee className="h-5 w-5" />,
    tone: "bg-amber-500/10 text-amber-700",
  },
  {
    id: "tram-pass",
    kind: "transit",
    tab: "active",
    title: "Evening Tram Pass",
    merchant: "Boston Transit",
    meta: "Zone 1 · Valid after 18:00",
    detail: "Tap or show QR at boarding",
    icon: <Train className="h-5 w-5" />,
    tone: "bg-success/10 text-success",
  },
  {
    id: "museum-night",
    kind: "event",
    tab: "upcoming",
    title: "Museum Night Entry",
    merchant: "Museum of Fine Arts",
    meta: "Starts at 20:30",
    detail: "QR unlocks 30 minutes before start",
    icon: <Landmark className="h-5 w-5" />,
    tone: "bg-purple-500/10 text-purple-700",
  },
  {
    id: "dunkin-used",
    kind: "used",
    tab: "used",
    title: "Lunch Deal",
    merchant: "Dunkin'",
    meta: "Used at 12:40",
    detail: "Receipt saved to pass history",
    icon: <CheckCircle2 className="h-5 w-5" />,
    tone: "bg-secondary text-muted-foreground",
  },
];

const primaryAction = (pass: Pass) => {
  if (pass.kind === "offer") {
    return { label: "Redeem", icon: <Ticket className="h-3.5 w-3.5" /> };
  }
  if (pass.kind === "transit") {
    return { label: "Show pass", icon: <QrCode className="h-3.5 w-3.5" /> };
  }
  return { label: "Show QR", icon: <QrCode className="h-3.5 w-3.5" /> };
};

const Activity = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [tab, setTab] = useState<PassTab>(
    initialTab === "used" || initialTab === "upcoming" || initialTab === "active"
      ? initialTab
      : "active"
  );
  const [apiPasses, setApiPasses] = useState<ApiPass[]>([]);
  const [redeemingPassId, setRedeemingPassId] = useState<string | null>(null);
  useEffect(() => {
    api.getPasses().then(setApiPasses).catch(() => setApiPasses([]));
  }, []);

  const uniqueApiPasses = apiPasses.filter((pass, index, currentPasses) =>
    currentPasses.findIndex((candidate) => candidate.offerId === pass.offerId) === index
  );

  const backendPasses: Pass[] = uniqueApiPasses.map((pass) => ({
    id: pass.passId,
    kind: pass.status === "used" ? "used" : "offer",
    tab: pass.status === "used" ? "used" : "active",
    generated: true,
    title: `${pass.discountPercent}% off ${pass.title}`,
    merchant: pass.merchantName,
    meta: pass.status === "used" ? "Redeemed just now" : "Ready to redeem",
    detail: `QR ${pass.qrCode}`,
    icon: pass.status === "used" ? <CheckCircle2 className="h-5 w-5" /> : <Coffee className="h-5 w-5" />,
    tone: pass.status === "used" ? "bg-secondary text-muted-foreground" : "bg-amber-500/10 text-amber-700",
  }));
  const allPasses = [...backendPasses, ...passes];
  const visiblePasses = allPasses.filter((pass) => pass.tab === tab);
  const scanReadyCount = visiblePasses.filter((pass) =>
    ["movie", "transit", "event"].includes(pass.kind)
  ).length;
  const summary =
    tab === "active"
      ? `${visiblePasses.length} active passes · ${scanReadyCount} ready to scan`
      : tab === "upcoming"
        ? `${visiblePasses.length} upcoming pass · starts soon`
        : `${visiblePasses.length} used pass · receipt saved`;

  const handleRedeemPass = async (pass: Pass) => {
    if (!pass.generated || pass.tab !== "active") return;
    setRedeemingPassId(pass.id);
    try {
      const result = await api.redeemPass(pass.id, 12);
      setApiPasses((currentPasses) =>
        currentPasses.map((currentPass) =>
          currentPass.passId === result.pass.passId ? result.pass : currentPass
        )
      );
      toast.success("Pass redeemed");
      setTab("used");
    } catch (error) {
      console.error(error);
      toast.error("Could not redeem pass");
    } finally {
      setRedeemingPassId(null);
    }
  };

  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-3">
        <h1 className="font-display font-extrabold text-2xl text-foreground">My Passes</h1>
      </header>

      <div className="px-5">
        <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-2xl">
          {(["active", "upcoming", "used"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-2 rounded-xl text-xs font-semibold capitalize transition-base",
                tab === t ? "bg-card text-foreground shadow-elev-sm" : "text-muted-foreground"
              )}
            >
              {t === "active" ? "Active" : t === "upcoming" ? "Upcoming" : "Used"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">{summary}</p>
      </div>

      <section className="mt-5 px-5 space-y-3">
        {visiblePasses.map((pass) => {
          const action = primaryAction(pass);

          return (
          <div key={pass.id} className="rounded-2xl bg-card border border-border p-4 shadow-elev-sm">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-2xl grid place-items-center flex-shrink-0", pass.tone)}>
                {pass.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {pass.merchant}
                  </p>
                  {pass.generated && (
                    <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-success">
                      New wallet pass
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                  {pass.title}
                </h3>
                <p className="text-xs font-semibold text-primary mt-1">{pass.meta}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{pass.detail}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => handleRedeemPass(pass)}
                disabled={redeemingPassId === pass.id}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary text-primary-foreground py-2 text-xs font-bold disabled:opacity-70"
              >
                {action.icon}
                {redeemingPassId === pass.id ? "Redeeming..." : action.label}
              </button>
              <button className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground">
                Details
              </button>
            </div>
          </div>
          );
        })}
      </section>
    </MobileShell>
  );
};

export default Activity;
