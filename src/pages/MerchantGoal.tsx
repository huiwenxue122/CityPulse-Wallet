import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, MerchantShell, merchant } from "@/components/MerchantModeShared";
import { api } from "@/lib/api";

const goals = [
  "Fill quiet hours",
  "Sell slow inventory",
  "Attract event traffic",
  "Bring in new customers",
];

const products = ["Coffee + pastry", "Hot drinks", "Fresh pastry box", "Sandwiches"];
const tones = ["Cozy & local", "Premium", "Student-friendly", "Playful"];

const Chip = ({ label, selected = false, onClick }: { label: string; selected?: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
      selected
        ? "bg-primary text-primary-foreground shadow-elev-sm"
        : "border border-border bg-secondary/60 text-foreground"
    }`}
  >
    {label}
  </button>
);

const MerchantGoal = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState("Fill quiet hours");
  const [selectedProduct, setSelectedProduct] = useState(merchant.products);
  const [selectedTone, setSelectedTone] = useState(merchant.tone);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [maxDiscount, setMaxDiscount] = useState(15);
  const [radius, setRadius] = useState(900);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOffer = async () => {
    setIsGenerating(true);
    try {
      const products =
        selectedProduct === "Coffee + pastry"
          ? ["coffee", "pastry"]
          : [selectedProduct.toLowerCase()];
      await api.saveMerchantGoal({
        merchantId: "m_001",
        merchantName: "Chloe’s Café",
        goal: selectedGoal,
        timeWindow: { start: startTime, end: endTime },
        maxDiscountPercent: maxDiscount,
        radiusMeters: radius,
        products,
        tone: selectedTone,
      });
      const offer = await api.generateOffer();
      window.localStorage.setItem("citypulse_latest_offer_id", offer.offerId);
      toast.success("AI offer generated");
      navigate("/merchant/review");
    } catch (error) {
      console.error(error);
      toast.error("Could not generate offer. Is the API server running?");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MerchantShell title="Set Goal">
    <Card>
      <h2 className="font-display font-bold text-base text-foreground">Set business goal</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose what you want to improve. The AI will generate the actual offer.
      </p>

      <div className="mt-4 border-t border-border pt-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {goals.map((goal) => (
            <Chip key={goal} label={goal} selected={goal === selectedGoal} onClick={() => setSelectedGoal(goal)} />
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Guardrails</h3>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-secondary/60 px-3 py-2">
            <span className="text-xs font-bold text-muted-foreground">Time window</span>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="min-w-0 rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-bold text-foreground"
              />
              <span className="text-xs font-bold text-muted-foreground">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="min-w-0 rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-bold text-foreground"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm font-bold text-foreground">
              <span>Max discount</span>
              <span>{maxDiscount}%</span>
            </div>
            <input
              className="mt-1.5 w-full accent-primary"
              type="range"
              min="5"
              max="40"
              value={maxDiscount}
              onChange={(event) => setMaxDiscount(Number(event.target.value))}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm font-bold text-foreground">
              <span>Radius</span>
              <span>{radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}</span>
            </div>
            <input
              className="mt-1.5 w-full accent-primary"
              type="range"
              min="200"
              max="2000"
              step="100"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product focus</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {products.map((product) => (
            <Chip key={product} label={product} selected={product === selectedProduct} onClick={() => setSelectedProduct(product)} />
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand tone</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {tones.map((tone) => (
            <Chip key={tone} label={tone} selected={tone === selectedTone} onClick={() => setSelectedTone(tone)} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={generateOffer}
        disabled={isGenerating}
        className="mt-4 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-display font-bold text-primary-foreground shadow-elev-sm disabled:opacity-70"
      >
        {isGenerating ? "Generating offer..." : "Let AI generate offer"}
      </button>
    </Card>
  </MerchantShell>
  );
};

export default MerchantGoal;
