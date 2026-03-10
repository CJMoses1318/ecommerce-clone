"use client";

import { SanityApp } from "@sanity/sdk-react";
import { useEffect, useState } from "react";

/**
 * Defers SanityApp to client-only mount to avoid SSR error:
 * "Missing getServerSnapshot" from @sanity/sdk-react (useSyncExternalStore in AuthBoundary).
 * Renders a minimal loading state until mounted, then wraps children with SanityApp.
 */
function SanityProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading…
        </div>
      </div>
    );
  }

  const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true,
  };

  return (
    <SanityApp config={config} fallback={<div>Loading...</div>}>
      {children}
    </SanityApp>
  );
}

export default SanityProvider;