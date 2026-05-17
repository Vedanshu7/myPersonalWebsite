import "server-only";
import { env } from "@/lib/env";
import type { OpenSourceItem } from "@/app/api/open-source/route";
import type { ContributionWeek } from "@/app/api/contributions/route";
import type { GithubStats } from "@/app/api/github-stats/route";

/**
 * Searches GitHub issues/PRs for the configured user on external repos.
 *
 * @returns Filtered, sorted list of {@link OpenSourceItem} objects.
 */
export async function fetchOpenSourceItems(): Promise<OpenSourceItem[]> {
  const query = `author:${env.GITHUB_USERNAME} -user:${env.GITHUB_USERNAME} is:public`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const raw: Record<string, unknown>[] = data.items ?? [];

  const items: OpenSourceItem[] = raw.map((item) => {
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

  const filtered = items.filter((item) => !(item.type === "pr" && item.state === "closed"));
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return filtered;
}

const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

type RawDay = { date: string; contributionCount: number };
type RawWeek = { contributionDays: RawDay[] };

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

async function fetchContributionYear(from: string, to: string): Promise<ContributionWeek[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { username: env.GITHUB_USERNAME, from, to },
    }),
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const json = await res.json();
  const rawWeeks: RawWeek[] =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

  return rawWeeks.map((w) => ({
    days: w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: getLevel(d.contributionCount),
    })),
  }));
}

/**
 * Fetches the GitHub contribution calendar for the past two years.
 *
 * @returns Combined list of {@link ContributionWeek} objects in chronological order.
 */
export async function fetchContributionWeeks(): Promise<ContributionWeek[]> {
  try {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    const [olderWeeks, newerWeeks] = await Promise.all([
      fetchContributionYear(twoYearsAgo.toISOString(), oneYearAgo.toISOString()),
      fetchContributionYear(oneYearAgo.toISOString(), today.toISOString()),
    ]);

    return [...olderWeeks, ...newerWeeks];
  } catch {
    return [];
  }
}

/**
 * Fetches public GitHub statistics (repo count, followers, total stars) for the configured user.
 *
 * @returns A {@link GithubStats} object, or zeroed-out stats on failure.
 */
export async function fetchGithubStats(): Promise<GithubStats> {
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

    return {
      publicRepos: user.public_repos ?? 0,
      followers: user.followers ?? 0,
      totalStars,
    };
  } catch {
    return { publicRepos: 0, followers: 0, totalStars: 0 };
  }
}
