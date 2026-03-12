/**
 * Shared logic to create an order in Sanity from a Stripe checkout session.
 * Used by: Stripe webhook (primary) and success-page fallback (when webhook missed/delayed).
 */
import type Stripe from "stripe";
import { ORDER_BY_STRIPE_PAYMENT_ID_QUERY } from "@/lib/sanity/queries/orders";
import { client, writeClient } from "@/sanity/lib/client";

/**
 * Creates an order in Sanity from a completed Stripe checkout session.
 * Idempotent: if an order already exists for this payment, does nothing.
 * Also decrements product stock when creating a new order.
 */
export async function createOrderFromStripeSession(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<{ created: boolean; orderId?: string }> {
  const stripePaymentId = session.payment_intent as string;
  if (!stripePaymentId) {
    console.error("Checkout session has no payment_intent");
    return { created: false };
  }

  const existingOrder = await client.fetch(ORDER_BY_STRIPE_PAYMENT_ID_QUERY, {
    stripePaymentId,
  });

  if (existingOrder) {
    return { created: false, orderId: existingOrder._id };
  }

  const {
    clerkUserId,
    userEmail,
    sanityCustomerId,
    productIds: productIdsString,
    quantities: quantitiesString,
  } = session.metadata ?? {};

  if (!clerkUserId || !productIdsString || !quantitiesString) {
    console.error("Missing metadata in checkout session");
    return { created: false };
  }

  const productIds = productIdsString.split(",");
  const quantities = quantitiesString.split(",").map(Number);

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const orderItems = productIds.map((productId, index) => ({
    _key: `item-${index}`,
    product: {
      _type: "reference" as const,
      _ref: productId,
    },
    quantity: quantities[index],
    priceAtPurchase: lineItems.data[index]?.amount_total
      ? lineItems.data[index].amount_total / 100
      : 0,
  }));

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const shippingAddress = session.customer_details?.address;
  const address = shippingAddress
    ? {
        name: session.customer_details?.name ?? "",
        line1: shippingAddress.line1 ?? "",
        line2: shippingAddress.line2 ?? "",
        city: shippingAddress.city ?? "",
        postcode: shippingAddress.postal_code ?? "",
        country: shippingAddress.country ?? "",
      }
    : undefined;

  const order = await writeClient.create({
    _type: "order",
    orderNumber,
    ...(sanityCustomerId && {
      customer: {
        _type: "reference",
        _ref: sanityCustomerId,
      },
    }),
    clerkUserId,
    email: userEmail ?? session.customer_details?.email ?? "",
    items: orderItems,
    total: (session.amount_total ?? 0) / 100,
    status: "paid",
    stripePaymentId,
    address,
    createdAt: new Date().toISOString(),
  });

  await productIds
    .reduce(
      (tx, productId, i) =>
        tx.patch(productId, (p) => p.dec({ stock: quantities[i] })),
      writeClient.transaction(),
    )
    .commit();

  return { created: true, orderId: order._id };
}
