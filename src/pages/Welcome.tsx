import { Link } from "react-router-dom";
import { ArrowRight, Signal, Store, Wallet } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

const Welcome = () => (
  <MobileShell hideNav>
    <main className="relative flex min-h-screen flex-col overflow-hidden px-5 py-8">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute left-7 top-24 h-32 w-32 rounded-full ring-1 ring-primary/10" />
      <div className="pointer-events-none absolute left-12 top-29 h-20 w-20 rounded-full ring-1 ring-primary/10" />
      <div className="pointer-events-none absolute right-8 top-20 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_8px_hsl(var(--primary)/0.08)]" />
      <div className="pointer-events-none absolute right-16 top-40 h-1.5 w-1.5 rounded-full bg-primary/50 shadow-[0_0_0_7px_hsl(var(--primary)/0.05)]" />

      <section className="relative flex flex-col items-center pt-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-[1.4rem] bg-primary text-primary-foreground shadow-[0_18px_38px_hsl(var(--primary)/0.25)]">
          <Signal className="h-7 w-7" />
        </div>
        <p className="mt-5 font-display text-[34px] font-extrabold leading-none tracking-tight text-primary">
          CityPulse Wallet
        </p>
        <h1 className="mt-3 max-w-[16rem] font-display text-xl font-extrabold leading-tight text-foreground">
          Your city, matched to your moment.
        </h1>
      </section>

      <section className="relative mt-8 flex-1">
        <div className="rounded-[1.85rem] bg-card/92 p-4 shadow-[0_18px_44px_hsl(220_30%_8%/0.07)] ring-1 ring-border/55">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.06)]">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-extrabold text-foreground">Continue to your wallet</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                View nearby offers, saved passes, and wallet checkout.
              </p>
            </div>
          </div>
          <Link
            to="/customer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-display font-extrabold text-primary-foreground shadow-[0_14px_28px_hsl(var(--primary)/0.22)] transition-base active:scale-[0.99]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/customer"
            className="mt-2.5 flex w-full items-center justify-center rounded-2xl bg-secondary/75 py-3 text-sm font-display font-bold text-foreground transition-base active:scale-[0.99]"
          >
            Sign in with email
          </Link>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[1.45rem] bg-card/70 px-4 py-3 shadow-[inset_0_0_0_1px_hsl(220_16%_92%/0.7)]">
          <div>
            <p className="text-sm font-bold text-foreground">Are you a local business?</p>
          </div>
          <Link
            to="/merchant"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/8 px-3 py-2 text-xs font-display font-extrabold text-primary transition-base active:scale-[0.98]"
          >
            <Store className="h-3.5 w-3.5" />
            Open Merchant Mode
          </Link>
        </div>
      </section>

      <p className="relative pt-6 text-center text-[11px] font-semibold text-muted-foreground">
        Secure city wallet access
      </p>
    </main>
  </MobileShell>
);

export default Welcome;
