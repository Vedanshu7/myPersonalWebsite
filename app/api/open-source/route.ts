import { NextResponse } from "next/server";
import { env } from "@/lib/env";

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

async function searchGitHub(query: string, token: string): Promise<OpenSourceItem[]> {
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=50`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.items ?? [];

  return items.map((item: Record<string, unknown>) => {
    const isPR = Boolean(item.pull_request);
    const repoUrl = String(item.repository_url ?? "").replace(
      "https://api.github.com/repos/",
      "https://github.com/",
    );
    const repoParts = String(item.repository_url ?? "").split("/");
    const repo = repoParts.slice(-2).join("/");

    let state: OpenSourceItem["state"] = item.state === "open" ? "open" : "closed";
    if (isPR) {
      const pr = item.pull_request as Record<string, unknown>;
      if (pr.merged_at) state = "merged";
    }

    return {
      id: Number(item.id),
      type: isPR ? "pr" : "issue",
      title: String(item.title ?? ""),
      url: String(item.html_url ?? ""),
      repo,
      repoUrl,
      state,
      createdAt: String(item.created_at ?? ""),
    } satisfies OpenSourceItem;
  });
}

/**
 * Returns open-source contributions (PRs and issues) authored by the configured GitHub user on external repos.
 *
 * @returns A JSON response with an `items` array of {@link OpenSourceItem} objects.
 *
 * @remarks
 * Excludes closed unmerged PRs. Results are cached for 24 hours via the `s-maxage` header.
 */
export async function GET() {
  const query = `author:${env.GITHUB_USERNAME} -user:${env.GITHUB_USERNAME} is:public`;
  const items = await searchGitHub(query, env.GITHUB_TOKEN);

  // Remove closed (unmerged) PRs — keep merged PRs, open PRs, and all issues.
  const filtered = items.filter((item) => !(item.type === "pr" && item.state === "closed"));

  // Sort by date descending.
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(
    { items: filtered },
    { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate" } },
  );
}
