import "server-only";

export interface BoardMeta {
  id: string;
  name: string;
  updatedAt: string;
}

const INDEX_KEY = "scratchpad:boards";
const boardKey = (id: string) => `scratchpad:board:${id}`;

/** Serialized Excalidraw scene: the JSON string produced by `serializeAsJSON`. */
export type BoardScene = string;

export async function listBoards(): Promise<BoardMeta[]> {
  const { kv } = await import("@vercel/kv");
  const index = await kv.get<BoardMeta[]>(INDEX_KEY);
  return index ?? [];
}

export async function getBoardScene(id: string): Promise<BoardScene | null> {
  const { kv } = await import("@vercel/kv");
  return await kv.get<BoardScene>(boardKey(id));
}

export async function saveBoardScene(id: string, name: string, scene: BoardScene): Promise<void> {
  const { kv } = await import("@vercel/kv");
  const index = (await kv.get<BoardMeta[]>(INDEX_KEY)) ?? [];
  const meta: BoardMeta = { id, name, updatedAt: new Date().toISOString() };
  const updated = [meta, ...index.filter((b) => b.id !== id)];
  await Promise.all([kv.set(boardKey(id), scene), kv.set(INDEX_KEY, updated)]);
}

export async function renameBoard(id: string, name: string): Promise<void> {
  const { kv } = await import("@vercel/kv");
  const index = (await kv.get<BoardMeta[]>(INDEX_KEY)) ?? [];
  await kv.set(
    INDEX_KEY,
    index.map((b) => (b.id === id ? { ...b, name } : b)),
  );
}

export async function deleteBoard(id: string): Promise<void> {
  const { kv } = await import("@vercel/kv");
  const index = (await kv.get<BoardMeta[]>(INDEX_KEY)) ?? [];
  await Promise.all([
    kv.del(boardKey(id)),
    kv.set(
      INDEX_KEY,
      index.filter((b) => b.id !== id),
    ),
  ]);
}
