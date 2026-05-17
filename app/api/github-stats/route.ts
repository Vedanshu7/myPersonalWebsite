import { NextResponse } from "next/server";
import { fetchGithubStats } from "@/lib/github";

export const revalidate = 86400;

export interface GithubStats {
  publicRepos: number;
  followers: number;
  totalStars: number;
}

/**
 * Fetches public GitHub statistics (repo count, followers, total stars) for the configured username.
 *
 * @returns A JSON response with a {@link GithubStats} object, or zeroed-out stats on failure.
 *
 * @remarks
 * Revalidates every 24 hours via the `revalidate` export.
 */
export async function GET() {
  const stats = await fetchGithubStats();
  return NextResponse.json(stats);
}
