import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // GitHub
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
  GITHUB_USERNAME: z.string().min(1, "GITHUB_USERNAME is required"),
  GITHUB_WEBHOOK_SECRET: z.string().min(1, "GITHUB_WEBHOOK_SECRET is required"),

  // Auth.js (GitHub OAuth)
  AUTH_GITHUB_ID: z.string().min(1, "AUTH_GITHUB_ID is required"),
  AUTH_GITHUB_SECRET: z.string().min(1, "AUTH_GITHUB_SECRET is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  // Vercel KV (Upstash Redis)
  KV_REST_API_URL: z.url(),
  KV_REST_API_TOKEN: z.string().min(1, "KV_REST_API_TOKEN is required"),

  // Optional — injected by Vercel at runtime
  VERCEL_URL: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, "Must be a valid GA4 measurement ID (e.g. G-XXXXXXXXXX)")
    .optional(),
  NEXT_PUBLIC_FORMSPREE_URL: z.url(),
});

function parseEnv() {
  const serverResult = serverSchema.safeParse(process.env);
  const clientResult = clientSchema.safeParse(process.env);

  const errors: string[] = [];

  if (!serverResult.success) {
    for (const issue of serverResult.error.issues) {
      errors.push(`  ${issue.path.join(".")}: ${issue.message}`);
    }
  }
  if (!clientResult.success) {
    for (const issue of clientResult.error.issues) {
      errors.push(`  ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  if (errors.length > 0) {
    console.error("❌ Invalid environment variables:\n" + errors.join("\n"));
    throw new Error("Environment validation failed — check your .env.local");
  }

  return {
    ...serverResult.data!,
    ...clientResult.data!,
  };
}

// Validated at module load time — fails fast with clear errors.
export const env = parseEnv();
