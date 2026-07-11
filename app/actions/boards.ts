"use server";

import { auth } from "@/auth";
import {
  listBoards,
  getBoardScene,
  saveBoardScene,
  renameBoard,
  deleteBoard,
  type BoardMeta,
} from "@/lib/boards";

async function requireAuth(): Promise<boolean> {
  const session = await auth();
  return !!session;
}

export async function listBoardsAction(): Promise<{ boards?: BoardMeta[]; error?: string }> {
  if (!(await requireAuth())) return { error: "Unauthorized" };
  return { boards: await listBoards() };
}

export async function loadBoardAction(id: string): Promise<{ scene?: string | null; error?: string }> {
  if (!(await requireAuth())) return { error: "Unauthorized" };
  return { scene: await getBoardScene(id) };
}

export async function saveBoardAction(
  id: string,
  name: string,
  scene: string,
): Promise<{ success?: boolean; error?: string }> {
  if (!(await requireAuth())) return { error: "Unauthorized" };
  if (!id || !name.trim()) return { error: "Board id and name are required" };
  try {
    await saveBoardScene(id, name.trim(), scene);
    return { success: true };
  } catch (err) {
    console.error("[boards] save failed:", err);
    return { error: "Save failed — the board may be too large for KV" };
  }
}

export async function renameBoardAction(
  id: string,
  name: string,
): Promise<{ success?: boolean; error?: string }> {
  if (!(await requireAuth())) return { error: "Unauthorized" };
  if (!name.trim()) return { error: "Name is required" };
  await renameBoard(id, name.trim());
  return { success: true };
}

export async function deleteBoardAction(id: string): Promise<{ success?: boolean; error?: string }> {
  if (!(await requireAuth())) return { error: "Unauthorized" };
  await deleteBoard(id);
  return { success: true };
}
