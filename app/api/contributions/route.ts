import { NextResponse } from "next/server";
import { fetchContributionWeeks } from "@/lib/github";

export const revalidate = 86400;

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
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
  const weeks = await fetchContributionWeeks();
  return NextResponse.json({ weeks });
}
