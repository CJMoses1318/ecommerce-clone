import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createOrderFromStripeSession } from "@/lib/order-from-stripe-session";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export async function POST(req: Request) {
  // Lazy init: build must not require Stripe env; runtime returns 503 if unset
  let stripe: Stripe;
  let webhookSecret: string;
  try {
    stripe = getStripe();
    webhookSecret = getStripeWebhookSecret();
  } catch {
    return NextResponse.json(
      { error: "Stripe is not configured for this deployment" },
      { status: 503 },
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        const { created, orderId } =
          await createOrderFromStripeSession(session, stripe);
        if (created && orderId) {
          console.log(`Order created: ${orderId}`);
        } else if (orderId) {
          console.log(
            `Webhook already processed for payment ${session.payment_intent}, skipping`,
          );
        }
      } catch (error) {
        console.error("Error handling checkout.session.completed:", error);
        throw error;
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
