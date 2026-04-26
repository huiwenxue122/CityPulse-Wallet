import { MobileShell } from "@/components/MobileShell";
import { WalletCard } from "@/components/WalletCard";
import { ChevronLeft, CreditCard, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentMethods = () => (
  <MobileShell>
    <header className="px-5 pt-12 pb-4">
      <Link
        to="/profile"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Profile
      </Link>
      <h1 className="font-display font-extrabold text-2xl text-foreground mt-3">
        Cards & Payment Methods
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage the card connected to your city wallet.
      </p>
    </header>

    <section className="px-5 animate-slide-up">
      <WalletCard />
    </section>

    <section className="px-5 mt-5 space-y-3">
      <button className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-elev-sm">
        <span className="h-10 w-10 grid place-items-center rounded-xl bg-secondary">
          <CreditCard className="h-4 w-4 text-foreground" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Default payment card
          </span>
          <span className="block text-xs text-muted-foreground">
            Used for redemptions and city wallet payments.
          </span>
        </span>
      </button>

      <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-secondary/70 py-3 text-sm font-bold text-foreground">
        <Plus className="h-4 w-4" />
        Add payment method
      </button>
    </section>
  </MobileShell>
);

export default PaymentMethods;
