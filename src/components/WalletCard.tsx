import { user } from "@/data/mock";
import { Wifi } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export const WalletCard = () => {
  const locale = useLocale();
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-card text-primary-foreground shadow-card-premium p-6 card-shine">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-80 font-semibold">Sparkassen · City Wallet</p>
          <p className="mt-1 font-display font-extrabold text-2xl">S</p>
        </div>
        <Wifi className="h-5 w-5 rotate-90 opacity-90" />
      </div>

      <div className="relative mt-6">
        <p className="text-xs opacity-70 font-medium">Available balance · {locale.currency}</p>
        <p className="font-display font-extrabold text-4xl tracking-tight mt-1">
          {locale.formatPrice(user.balance)}
        </p>
        <p className="text-xs opacity-80 mt-1">+ {locale.formatPrice(user.walletCredits)} city credits</p>
      </div>

      <div className="relative mt-6 flex items-end justify-between">
        <p className="font-mono text-sm tracking-widest opacity-90">•••• •••• •••• {user.cardLast4}</p>
        <p className="text-xs font-semibold opacity-90">{user.name}</p>
      </div>
    </div>
  );
};
