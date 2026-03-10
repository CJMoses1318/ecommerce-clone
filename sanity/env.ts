export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-06'

// Use empty string when unset so the app can start (e.g. `next dev`). Set in .env.local for Sanity to work.
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? ''
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
