import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";
import { getKVProjects } from "@/lib/projects";

const BASE = "https://vedanshujoshi.com";

/**
 * Generates the XML sitemap including all static and KV-stored project URLs.
 *
 * @returns An array of sitemap entries consumed by Next.js to build `/sitemap.xml`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const kvProjects = await getKVProjects();
  const kvUrls = kvProjects.map((p) => ({
    url: `${BASE}/project/${p.projectURL}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticProjectUrls = projects.map((p) => ({
    url: `${BASE}/project/${p.projectURL}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const allProjectUrls = [
    ...staticProjectUrls,
    ...kvUrls.filter((k) => !staticProjectUrls.find((s) => s.url === k.url)),
  ];

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...allProjectUrls,
  ];
}
