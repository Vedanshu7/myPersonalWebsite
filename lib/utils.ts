import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind class names, resolving conflicts via tailwind-merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns the absolute base URL for internal API calls. */
export function getBaseUrl(): string {
  // VERCEL_URL is injected by the platform at runtime; access directly to avoid pulling server-only into client bundles.
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
}
