"use server";

import { revalidatePath } from "next/cache";
import { setEditableContent, type EditableContent } from "@/lib/content";
import { auth, signOut } from "@/auth";

/** Signs the current session user out and redirects to the home page. */
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

/**
 * Saves editable site content from the admin form to Vercel KV.
 *
 * @param formData - Form data containing bio, stats counters, and JSON-encoded event/tech arrays.
 * @returns An object with `success: true` on success, or an `error` message string.
 */
export async function saveContentAction(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  let workEvents, educationEvents, techStack;
  try {
    workEvents = JSON.parse(formData.get("workEvents") as string);
    educationEvents = JSON.parse(formData.get("educationEvents") as string);
    techStack = JSON.parse(formData.get("techStack") as string);
  } catch {
    return { error: "Invalid JSON in form data" };
  }

  const content: EditableContent = {
    bio: (formData.get("bio") as string) ?? "",
    yearsExperience: (formData.get("yearsExperience") as string) ?? "6+",
    projectCount: (formData.get("projectCount") as string) ?? "13+",
    techCount: (formData.get("techCount") as string) ?? "34+",
    contactEmail: (formData.get("contactEmail") as string) ?? "",
    workEvents,
    educationEvents,
    techStack,
  };

  try {
    await setEditableContent(content);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { error: "Failed to save. Is Vercel KV configured?" };
  }
}
