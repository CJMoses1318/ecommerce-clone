import { redirect } from "next/navigation";
import {
  ensureOrderFromSession,
  getCheckoutSession,
} from "@/lib/actions/checkout";
import { SuccessClient } from "./SuccessClient";

export const metadata = {
  title: "Order Confirmed | Furniture Shop",
  description: "Your order has been placed successfully",
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/");
  }

  const result = await getCheckoutSession(sessionId);

  if (!result.success || !result.session) {
    redirect("/");
  }

  // Ensure order exists in Sanity so "My Orders" shows it (handles missed/delayed webhook)
  await ensureOrderFromSession(sessionId);

  return <SuccessClient session={result.session} />;
}
