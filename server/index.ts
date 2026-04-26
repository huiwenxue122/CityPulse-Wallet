import "dotenv/config";
import cors from "cors";
import express from "express";
import { buildGeneratedOffer, generateOfferWithLlm } from "./services/llmOfferService";
import { validateAndApplyGuardrails } from "./services/guardrailValidator";
import {
  activateOffer,
  cityContext,
  getActiveOffer,
  getLatestOffer,
  merchantGoal,
  merchantResults,
  offers,
  passes,
  redemptions,
  saveGeneratedOffer,
  setMerchantGoal,
} from "./store";
import type { MerchantGoal, Redemption, UserContext, WalletPass } from "./types";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";

app.use(cors());
app.use(express.json());

app.get("/api/context/current", (_req, res) => {
  res.json(cityContext);
});

app.get("/api/merchant/goal", (_req, res) => {
  res.json(merchantGoal);
});

app.post("/api/merchant/goal", (req, res) => {
  const body = req.body as Partial<MerchantGoal>;
  const updated = setMerchantGoal({
    ...merchantGoal,
    ...body,
    timeWindow: body.timeWindow ?? merchantGoal.timeWindow,
    products: body.products ?? merchantGoal.products,
  });
  res.json(updated);
});

app.post("/api/offers/generate", async (req, res, next) => {
  try {
    console.log("[offers/generate] request received");
    const { userId = "u_001", merchantId = "m_001" } = req.body ?? {};
    if (merchantId !== merchantGoal.merchantId) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    const userContext: UserContext = {
      userId,
      distanceMeters: 142,
      preferences: ["coffee", "local cafes", "evening offers"],
    };
    const llmOffer = await generateOfferWithLlm(merchantGoal, cityContext, userContext);
    const generated = buildGeneratedOffer(llmOffer, merchantGoal);
    const validated = validateAndApplyGuardrails(generated, merchantGoal, cityContext, userContext);
    const saved = saveGeneratedOffer(validated);
    merchantResults.shown += 1;
    console.log(`[offers/generate] returning ${saved.offerId} (${saved.title})`);
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.get("/api/offers/latest", (_req, res) => {
  res.json(getLatestOffer());
});

app.post("/api/offers/:offerId/activate", (req, res) => {
  const offer = activateOffer(req.params.offerId);
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  res.json(offer);
});

app.get("/api/offers/active", (_req, res) => {
  res.json(getActiveOffer());
});

app.post("/api/wallet/passes", (req, res) => {
  const { userId = "u_001", offerId, basketAmount = 12 } = req.body ?? {};
  const offer = offers.get(offerId);
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  const existingPass = passes.find((pass) => pass.userId === userId && pass.offerId === offerId);
  if (existingPass) {
    existingPass.status = "active";
    res.json({
      alreadyInWallet: true,
      pass: existingPass,
      discountAmount: 0,
      finalAmount: basketAmount,
    });
    return;
  }

  const createdAt = new Date().toISOString();
  const pass: WalletPass = {
    passId: `pass_${Date.now()}`,
    userId,
    offerId,
    title: offer.title,
    merchantName: offer.merchantName,
    discountPercent: offer.discountPercent,
    status: "active",
    qrCode: `CP-${offerId.toUpperCase()}`,
    createdAt,
  };

  passes.unshift(pass);

  res.json({ pass, discountAmount: 0, finalAmount: basketAmount });
});

app.post("/api/redeem", (req, res) => {
  const { userId = "u_001", offerId, basketAmount = 12 } = req.body ?? {};
  const offer = offers.get(offerId);
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  const existingPass = passes.find((pass) => pass.userId === userId && pass.offerId === offerId);
  if (existingPass) {
    existingPass.status = "active";
    res.json({
      alreadyInWallet: true,
      pass: existingPass,
      discountAmount: 0,
      finalAmount: basketAmount,
    });
    return;
  }

  const createdAt = new Date().toISOString();
  const pass: WalletPass = {
    passId: `pass_${Date.now()}`,
    userId,
    offerId,
    title: offer.title,
    merchantName: offer.merchantName,
    discountPercent: offer.discountPercent,
    status: "active",
    qrCode: `CP-${offerId.toUpperCase()}`,
    createdAt,
  };

  passes.unshift(pass);

  res.json({ pass, discountAmount: 0, finalAmount: basketAmount });
});

app.get("/api/wallet/passes", (req, res) => {
  const userId = String(req.query.userId ?? "u_001");
  const uniquePasses = passes
    .filter((pass) => pass.userId === userId)
    .filter((pass, index, userPasses) =>
      userPasses.findIndex((candidate) => candidate.offerId === pass.offerId) === index
    );

  res.json(uniquePasses);
});

app.post("/api/wallet/passes/:passId/redeem", (req, res) => {
  const { basketAmount = 12 } = req.body ?? {};
  const pass = passes.find((walletPass) => walletPass.passId === req.params.passId);
  if (!pass) {
    res.status(404).json({ error: "Pass not found" });
    return;
  }

  if (pass.status === "used") {
    res.json({ alreadyRedeemed: true, pass, discountAmount: 0, finalAmount: basketAmount });
    return;
  }

  const offer = offers.get(pass.offerId);
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  const discountAmount = Number(((basketAmount * pass.discountPercent) / 100).toFixed(2));
  const finalAmount = Number((basketAmount - discountAmount).toFixed(2));
  const redeemedAt = new Date().toISOString();
  const redemption: Redemption = {
    redemptionId: `redemption_${Date.now()}`,
    userId: pass.userId,
    offerId: pass.offerId,
    merchantName: pass.merchantName,
    basketAmount,
    discountAmount,
    finalAmount,
    redeemedAt,
  };

  pass.status = "used";
  offer.status = "redeemed";
  offers.set(pass.offerId, offer);
  redemptions.unshift(redemption);
  merchantResults.redeemed += 1;
  merchantResults.estimatedRevenue = Number((merchantResults.estimatedRevenue + finalAmount).toFixed(2));

  res.json({ redemption, pass, discountAmount, finalAmount });
});

app.get("/api/merchant/results", (_req, res) => {
  res.json({
    ...merchantResults,
    latestRedemptions: redemptions.slice(0, 2),
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, host, () => {
  console.log(`CityPulse API listening on http://${host}:${port}`);
});
