import { NextResponse } from "next/server";
import { fetchOpenSourceItems } from "@/lib/github";

export const revalidate = 86400;

export interface OpenSourceItem {
  id: number;
  type: "pr" | "issue";
  title: string;
  url: string;
  repo: string;
  repoUrl: string;
  state: "open" | "merged" | "closed";
  createdAt: string;
}

/**
 * Returns open-source contributions (PRs and issues) authored by the configured GitHub user on external repos.
 *
 * @returns A JSON response with an `items` array of {@link OpenSourceItem} objects.
 *
 * @remarks
 * Excludes closed unmerged PRs. Results are cached for 24 hours via the `revalidate` export.
 */
export async function GET() {
  const items = await fetchOpenSourceItems();
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate" } },
  );
}
