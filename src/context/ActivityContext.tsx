import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { activity as seedActivity, type Offer } from "@/data/mock";

export type ActivityItem = {
  id: string;
  type: string;
  merchant: string;
  amount: number;
  label: string;
  time: string;
  icon: string;
};

type ActivityContextValue = {
  items: ActivityItem[];
  addRedemption: (offer: Offer) => void;
};

const STORAGE_KEY = "city-wallet-activity";
const ActivityContext = createContext<ActivityContextValue | null>(null);

const nowLabel = () =>
  `Today, ${new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ActivityItem[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : seedActivity;
    } catch {
      return seedActivity;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addRedemption = useCallback((offer: Offer) => {
    setItems((current) => {
      const redemptionId = `redeem-${offer.id}`;
      if (current.some((item) => item.id === redemptionId)) return current;

      return [
        {
          id: redemptionId,
          type: "redeemed",
          merchant: offer.merchant,
          amount: -offer.finalPrice,
          label: offer.title,
          time: nowLabel(),
          icon: offer.emoji,
        },
        {
          id: `generated-${offer.id}`,
          type: "offer_generated",
          merchant: offer.merchant,
          amount: 0,
          label: offer.scoreLabel ?? "AI offer generated",
          time: nowLabel(),
          icon: "✨",
        },
        ...current,
      ];
    });
  }, []);

  const value = useMemo<ActivityContextValue>(
    () => ({
      items,
      addRedemption,
    }),
    [addRedemption, items]
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivity = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
  return ctx;
};
