import Stripe from "stripe";

const API_VERSION = "2026-02-25.clover" as const;

let _stripe: Stripe | null = null;

/**
 * Lazy Stripe client — no top-level init so `next build` succeeds without
 * STRIPE_SECRET_KEY (required only at runtime for checkout/webhooks).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not defined. Set it in Vercel (or .env.local) for checkout and webhooks.",
      );
    }
    _stripe = new Stripe(key, { apiVersion: API_VERSION });
  }
  return _stripe;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not defined. Set it in Vercel for Stripe webhooks.",
    );
  }
  return secret;
}
