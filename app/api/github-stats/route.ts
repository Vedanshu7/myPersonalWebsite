import { NextResponse } from "next/server";
import { env } from "@/lib/env";

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
  const username = env.GITHUB_USERNAME;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
  };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        next: { revalidate: 86400 },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers,
        next: { revalidate: 86400 },
      }),
    ]);

    if (!userRes.ok) throw new Error("GitHub user fetch failed");

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    const totalStars = Array.isArray(repos)
      ? repos.reduce(
          (sum: number, r: { stargazers_count: number }) => sum + (r.stargazers_count ?? 0),
          0,
        )
      : 0;

    const stats: GithubStats = {
      publicRepos: user.public_repos ?? 0,
      followers: user.followers ?? 0,
      totalStars,
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ publicRepos: 0, followers: 0, totalStars: 0 });
  }
}
