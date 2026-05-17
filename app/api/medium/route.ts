import { NextResponse } from "next/server";
import { fetchMediumPosts } from "@/lib/medium";

export const revalidate = 86400;

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
}

/**
 * Fetches and parses the latest Medium posts for the configured user.
 *
 * @returns A JSON response with a `posts` array of {@link MediumPost} objects, or an empty array on failure.
 *
 * @remarks
 * Revalidates every 24 hours via the `revalidate` export.
 */
export async function GET() {
  const posts = await fetchMediumPosts();
  return NextResponse.json({ posts });
}
