import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

function requireProjectId(): string {
  const id = projectId || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!id) {
    throw new Error(
      "Sanity configuration missing: set NEXT_PUBLIC_SANITY_PROJECT_ID (and NEXT_PUBLIC_SANITY_DATASET) in Vercel Environment Variables.",
    );
  }
  return id;
}

let _client: SanityClient | null = null;
let _writeClient: SanityClient | null = null;

function getReadClient(): SanityClient {
  if (!_client) {
    const id = requireProjectId();
    _client = createClient({
      projectId: id,
      dataset:
        dataset || process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion,
      useCdn: true,
      perspective: "published",
    });
  }
  return _client;
}

function getWriteClient(): SanityClient {
  if (!_writeClient) {
    const id = requireProjectId();
    _writeClient = createClient({
      projectId: id,
      dataset:
        dataset || process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    });
  }
  return _writeClient;
}

/**
 * Lazy Sanity client — does not call createClient at module load.
 * Required so `next build` on Vercel succeeds when env is only set at runtime.
 */
export const client: SanityClient = new Proxy({} as SanityClient, {
  get(_target, prop) {
    const c = getReadClient();
    const value = (c as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(c);
    }
    return value;
  },
});

export const writeClient: SanityClient = new Proxy({} as SanityClient, {
  get(_target, prop) {
    const c = getWriteClient();
    const value = (c as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(c);
    }
    return value;
  },
});
