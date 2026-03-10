"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatActions } from "@/lib/store/chat-store-provider";

interface AskAISimilarButtonProps {
  productName: string;
}

/**
 * Opens the AI chat with a prefilled request for similar products.
 */
export function AskAISimilarButton({ productName }: AskAISimilarButtonProps) {
  const { openChatWithMessage } = useChatActions();

  const handleClick = () => {
    const safeName = productName.trim() || "this product";
    openChatWithMessage(
      `Show me furniture similar to "${safeName}" — same style or use case.`,
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50"
      onClick={handleClick}
    >
      <Sparkles className="h-4 w-4" />
      <span className="text-sm font-medium">Ask AI for similar</span>
    </Button>
  );
}
