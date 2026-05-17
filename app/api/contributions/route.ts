import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const revalidate = 86400; // Refresh daily.

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

const QUERY = `
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

function parseWeeks(rawWeeks: RawWeek[]): ContributionWeek[] {
  return rawWeeks.map((w) => ({
    days: w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: getLevel(d.contributionCount),
    })),
  }));
}

async function fetchYear(
  token: string,
  username: string,
  from: string,
  to: string,
): Promise<ContributionWeek[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { username, from, to } }),
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const json = await res.json();
  const rawWeeks: RawWeek[] =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
  return parseWeeks(rawWeeks);
}

/**
 * Fetches the GitHub contribution calendar for the configured username across the past two years.
 *
 * @returns A JSON response containing a `weeks` array of {@link ContributionWeek} objects, or an empty array on failure.
 *
 * @remarks
 * Revalidates every 24 hours via the `revalidate` export.
 */
export async function GET() {
  const token = env.GITHUB_TOKEN;
  const username = env.GITHUB_USERNAME;

  try {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    const toStr = today.toISOString();
    const oneYearAgoStr = oneYearAgo.toISOString();
    const twoYearsAgoStr = twoYearsAgo.toISOString();

    // Fetch both years in parallel.
    const [olderWeeks, newerWeeks] = await Promise.all([
      fetchYear(token, username, twoYearsAgoStr, oneYearAgoStr),
      fetchYear(token, username, oneYearAgoStr, toStr),
    ]);

    // Older weeks first (chronological order).
    const weeks = [...olderWeeks, ...newerWeeks];

    return NextResponse.json({ weeks });
  } catch {
    return NextResponse.json({ weeks: [] });
  }
}
