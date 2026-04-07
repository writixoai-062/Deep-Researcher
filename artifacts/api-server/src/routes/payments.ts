import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";

const router: IRouter = Router();

const LS_API_KEY     = process.env.LEMONSQUEEZY_API_KEY     || "";
const LS_SIGN_SECRET = process.env.LEMONSQUEEZY_SIGNING_SECRET || "";

// LemonSqueezy store & product config
const STORE_ID           = "317490";
const VARIANT_PRO        = "1492101";
const VARIANT_BUSINESS   = "1492105";

// POST /api/create-checkout
// Body: { plan: "pro" | "business", email?: string, userId?: string }
router.post("/create-checkout", async (req: Request, res: Response) => {
  if (!LS_API_KEY) {
    res.status(503).json({ error: "Payment system not configured." });
    return;
  }

  const { plan, email, userId } = req.body as {
    plan?: string;
    email?: string;
    userId?: string;
  };

  if (!plan || !["pro", "business"].includes(plan)) {
    res.status(400).json({ error: "plan must be 'pro' or 'business'" });
    return;
  }

  const variantId = plan === "pro" ? VARIANT_PRO : VARIANT_BUSINESS;

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_options: {
          embed: false,
          media: true,
          logo: true,
        },
        checkout_data: {
          email: email || undefined,
          custom: {
            user_id:  userId  || "",
            plan_type: plan,
          },
        },
        product_options: {
          enabled_variants: [parseInt(variantId, 10)],
          redirect_url: process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}/thoughtscope/?checkout=success`
            : "https://mentics.app/?checkout=success",
          receipt_button_text: "Return to Menticx",
        },
        expires_at: null,
      },
      relationships: {
        store: {
          data: { type: "stores", id: STORE_ID },
        },
        variant: {
          data: { type: "variants", id: variantId },
        },
      },
    },
  };

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method:  "POST",
      headers: {
        "Accept":        "application/vnd.api+json",
        "Content-Type":  "application/vnd.api+json",
        "Authorization": `Bearer ${LS_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LemonSqueezy API error ${response.status}: ${text}`);
    }

    const data = await response.json() as { data: { attributes: { url: string } } };
    const checkoutUrl = data.data?.attributes?.url;

    if (!checkoutUrl) throw new Error("No checkout URL returned");

    res.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "Failed to create checkout", details: message });
  }
});

// POST /api/webhook  — LemonSqueezy payment webhooks
// Verifies HMAC signature, updates user plan on order_created
router.post(
  "/webhook",
  (req: Request, res: Response, next) => {
    // We need the raw body to verify the signature
    // Express already parsed JSON, so use the raw buffer
    (req as any)._rawBody = JSON.stringify(req.body);
    next();
  },
  async (req: Request, res: Response) => {
    const signature = req.headers["x-signature"] as string | undefined;

    if (!LS_SIGN_SECRET || !signature) {
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    // Verify HMAC-SHA256 signature
    const rawBody = (req as any)._rawBody || "";
    const expected = crypto
      .createHmac("sha256", LS_SIGN_SECRET)
      .update(rawBody)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const event     = req.headers["x-event-name"] as string | undefined;
    const payload   = req.body as Record<string, unknown>;
    const meta       = (payload.meta as Record<string, unknown>) || {};
    const customData = (meta.custom_data as Record<string, unknown>) || {};

    const userId   = (customData.user_id   as string) || "";
    const planType = (customData.plan_type as string) || "pro";

    console.log(`[webhook] event=${event} userId=${userId} plan=${planType}`);

    // On successful order, log the plan upgrade
    // (actual DB update would go here with Supabase admin SDK)
    if (event === "order_created") {
      console.log(`[webhook] ORDER SUCCESS: userId=${userId} → plan=${planType}`);
      // TODO: Update Supabase profiles table with admin key
      // For now the frontend handles it via Supabase client after redirect
    }

    if (event === "subscription_cancelled" || event === "order_refunded") {
      console.log(`[webhook] CANCELLED/REFUNDED: userId=${userId}`);
    }

    res.status(200).json({ received: true });
  }
);

// GET /api/plans — returns available plans info
router.get("/plans", (_req: Request, res: Response) => {
  res.json({
    plans: [
      {
        id: "free",
        name: "Free",
        price: 0,
        credits: 5,
        features: ["5 credits/month", "2 specialized agents", "Basic AI analysis", "Email support"],
      },
      {
        id: "pro",
        name: "Pro",
        price: 9.99,
        credits: 100,
        variantId: VARIANT_PRO,
        features: ["100 credits/month", "All 10 agents", "Deep AI analysis", "Priority support", "PDF & JSON export"],
      },
      {
        id: "business",
        name: "Business",
        price: 29.99,
        credits: -1,
        variantId: VARIANT_BUSINESS,
        features: ["Unlimited credits", "All Pro features", "API access", "Team collaboration", "SSO support"],
      },
    ],
  });
});

export default router;
