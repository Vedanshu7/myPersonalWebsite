import "server-only";
import { env } from "@/lib/env";
import type { OpenSourceItem } from "@/app/api/open-source/route";
import type { ContributionDay, ContributionWeek } from "@/app/api/contributions/route";
import type { GithubStats } from "@/app/api/github-stats/route";

/**
 * Searches GitHub for issues/PRs the configured user took part in on external repos.
 *
 * @returns Filtered, sorted list of {@link OpenSourceItem} objects.
 *
 * @remarks
 * Uses `involves:` rather than `author:` so issues the user commented on, was assigned,
 * or was mentioned in count too — upstream issues are often where the work happens.
 *
 * `involves:` also matches PRs *other people* opened that the user merely reviewed. Those
 * are dropped: rendering another person's PR title under "Open Source" would read as the
 * user's own work. Issues are kept regardless of who opened them, since participating in
 * one is the contribution.
 */
export async function fetchOpenSourceItems(): Promise<OpenSourceItem[]> {
  const query = `involves:${env.GITHUB_USERNAME} -user:${env.GITHUB_USERNAME} is:public`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=100`;

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

  const me = env.GITHUB_USERNAME.toLowerCase();

  const items = raw.map((item) => {
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

    const user = item.user as { login?: string } | undefined;
    const authoredByMe = (user?.login ?? "").toLowerCase() === me;

    return {
      item: {
        id: Number(item.id),
        type: isPR ? "pr" : "issue",
        title: String(item.title ?? ""),
        url: String(item.html_url ?? ""),
        repo,
        repoUrl,
        state,
        createdAt: String(item.created_at ?? ""),
      } satisfies OpenSourceItem,
      isPR,
      authoredByMe,
    };
  });

  const filtered = items
    .filter(({ isPR, authoredByMe }) => !isPR || authoredByMe)
    .map(({ item }) => item);

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return filtered;
}

const CONTRIBUTION_YEARS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      createdAt
      contributionsCollection {
        contributionYears
      }
    }
  }
`;

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

/** Asks GitHub when the account was created and which years it has contributions in. */
async function fetchAccountRange(): Promise<{ years: number[]; createdAt: Date | null }> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_YEARS_QUERY,
      variables: { username: env.GITHUB_USERNAME },
    }),
    next: { revalidate: 86400 },
  });

  if (!res.ok) return { years: [], createdAt: null };
  const json = await res.json();
  const user = json?.data?.user;
  const years: number[] = user?.contributionsCollection?.contributionYears ?? [];
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  return { years: [...years].sort((a, b) => a - b), createdAt };
}

/**
 * Regroups a flat day list into Sunday-aligned weeks.
 *
 * @remarks
 * Per-year calendars overlap at year boundaries (GitHub pads each calendar out to whole
 * weeks), so days are deduped by date before chunking — otherwise boundary weeks would
 * render twice.
 */
function groupIntoWeeks(days: ContributionDay[]): ContributionWeek[] {
  const byDate = new Map<string, ContributionDay>();
  for (const day of days) {
    if (day.date) byDate.set(day.date, day);
  }

  const sorted = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  // Pad the first partial week so column 0 starts on a Sunday.
  const leading = new Date(sorted[0].date + "T12:00:00").getDay();
  const padded: ContributionDay[] = [
    ...Array.from({ length: leading }, () => ({ date: "", count: 0, level: 0 as const })),
    ...sorted,
  ];

  const weeks: ContributionWeek[] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push({ days: padded.slice(i, i + 7) });
  }
  return weeks;
}

/**
 * Fetches the full GitHub contribution calendar, from the user's first contribution
 * year through today.
 *
 * @returns Every {@link ContributionWeek} in chronological order.
 *
 * @remarks
 * GitHub's `contributionsCollection` accepts at most a one-year span, so each year is
 * fetched separately and the results are stitched together.
 */
export async function fetchContributionWeeks(): Promise<ContributionWeek[]> {
  try {
    const { years, createdAt } = await fetchAccountRange();
    if (years.length === 0) return [];

    const now = new Date();

    const perYear = await Promise.all(
      years.map((year) => {
        const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
        // Don't render dead cells for the months before the account existed.
        const from = createdAt && createdAt > yearStart ? createdAt : yearStart;
        const to = yearEnd > now ? now : yearEnd;
        return fetchContributionYear(from.toISOString(), to.toISOString());
      }),
    );

    const days = perYear.flat().flatMap((w) => w.days);
    const floor = createdAt ? createdAt.toISOString().slice(0, 10) : null;
    const inRange = floor ? days.filter((d) => !d.date || d.date >= floor) : days;

    return groupIntoWeeks(inRange);
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
