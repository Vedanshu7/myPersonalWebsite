import { projects as staticProjects } from "@/lib/data";
import type { Project } from "@/lib/data";

const KV_KEY = "portfolio-projects";

/** Retrieves all KV-stored projects; returns an empty array on any failure. */
export async function getKVProjects(): Promise<Project[]> {
  try {
    const { kv } = await import("@vercel/kv");
    const stored = await kv.get<Project[]>(KV_KEY);
    return stored ?? [];
  } catch {
    return [];
  }
}

/**
 * Persists the full project list to KV storage.
 *
 * @param projects - The array of {@link Project} objects to store.
 */
export async function setKVProjects(projects: Project[]): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, projects);
}

/**
 * Merges KV-stored projects with static ones, deduping by projectURL.
 *
 * @param kvProjects - Projects retrieved from Vercel KV storage.
 * @returns Combined list with KV entries first; static entries fill gaps.
 */
export function mergeProjects(kvProjects: Project[]): Project[] {
  const kvUrls = new Set(kvProjects.map((p) => p.projectURL));
  const dedupedStatic = staticProjects.filter((p) => !kvUrls.has(p.projectURL));
  return [...kvProjects, ...dedupedStatic];
}
