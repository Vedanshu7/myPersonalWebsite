import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Returns the robots.txt rules for the site, blocking admin and API routes from crawlers. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/scratchpad/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
