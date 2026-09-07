import type { MetadataRoute } from "next";
import { getMergedProjects } from "@/lib/projects";
import { SITE_URL as BASE } from "@/lib/site";

/**
 * Generates the XML sitemap including all static and KV-stored project URLs.
 *
 * @returns An array of sitemap entries consumed by Next.js to build `/sitemap.xml`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getMergedProjects();
  const projectUrls = projects.map((p) => ({
    url: `${BASE}/project/${p.projectURL}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projectUrls,
  ];
}
