import type { MetadataRoute } from "next";

/** Returns the robots.txt rules for the site, blocking admin and API routes from crawlers. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://vedanshujoshi.com/sitemap.xml",
  };
}
