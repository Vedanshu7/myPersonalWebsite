import {
  workEvents as defaultWorkEvents,
  educationEvents as defaultEducationEvents,
  technologyList,
} from "@/lib/data";
import type { TimelineEvent, Technology } from "@/lib/data";

export interface EditableContent {
  bio: string;
  yearsExperience: string;
  projectCount: string;
  techCount: string;
  workEvents: TimelineEvent[];
  educationEvents: TimelineEvent[];
  techStack: Technology[];
  contactEmail: string;
}

const DEFAULTS: EditableContent = {
  bio: "I'm a software engineer with a Master's from Purdue University, building full-stack products and the systems behind them, agentic AI workflows, data pipelines, and cloud-native services. I like owning the whole path: from the interface a user touches to the infrastructure that keeps it fast and reliable at scale.",
  yearsExperience: "4+",
  projectCount: "13+",
  techCount: "57+",
  workEvents: defaultWorkEvents,
  educationEvents: defaultEducationEvents,
  techStack: technologyList,
  contactEmail: "vedanshu7.joshi@gmail.com",
};

/** Reads editable site content from KV; falls back to hardcoded defaults on any failure. */
export async function getEditableContent(): Promise<EditableContent> {
  try {
    const { kv } = await import("@vercel/kv");
    const stored = await kv.get<EditableContent>("site-content");
    if (!stored) return DEFAULTS;

    return {
      ...DEFAULTS,
      ...stored,
      workEvents: stored.workEvents ?? DEFAULTS.workEvents,
      educationEvents: stored.educationEvents ?? DEFAULTS.educationEvents,
      techStack: stored.techStack ?? DEFAULTS.techStack,
      contactEmail: stored.contactEmail ?? DEFAULTS.contactEmail,
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Persists updated site content to KV storage.
 *
 * @param data - The full {@link EditableContent} object to write.
 */
export async function setEditableContent(data: EditableContent): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set("site-content", data);
}
