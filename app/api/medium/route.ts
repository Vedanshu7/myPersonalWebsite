import { NextResponse } from "next/server";

export const revalidate = 86400;

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
}

function extractText(xml: string, tag: string): string {
  const cdataMatch = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
    "i",
  ).exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  return plainMatch ? plainMatch[1].trim() : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetches and parses the latest Medium posts for the configured user.
 *
 * @returns A JSON response with a `posts` array of {@link MediumPost} objects, or an empty array on failure.
 *
 * @remarks
 * Revalidates every 24 hours via the `next.revalidate` fetch option.
 */
export async function GET() {
  try {
    const res = await fetch("https://medium.com/feed/@vedanshu7.joshi", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ posts: [] });

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

    const posts: MediumPost[] = itemMatches.slice(0, 4).map((m) => {
      const item = m[1];
      const title = extractText(item, "title");
      const link =
        extractText(item, "link") ||
        (/<link[^>]*>(https?:\/\/[^<]+)<\/link>/i.exec(item)?.[1] ?? "");
      const pubDate = extractText(item, "pubDate");
      const rawDesc = extractText(item, "description") || extractText(item, "content:encoded");
      const excerpt =
        stripHtml(rawDesc).slice(0, 140).trimEnd() + (rawDesc.length > 140 ? "…" : "");

      return { title, link, pubDate, excerpt };
    });

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
