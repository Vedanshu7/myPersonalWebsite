"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { BoardMeta } from "@/lib/boards";
import {
  listBoardsAction,
  loadBoardAction,
  saveBoardAction,
  deleteBoardAction,
} from "@/app/actions/boards";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <p className="p-8 font-mono text-xs text-neutral-500">Loading canvas…</p> },
);

// Excalidraw fetches its fonts at runtime; pin them to the installed version.
declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH?: string;
  }
}
if (typeof window !== "undefined") {
  window.EXCALIDRAW_ASSET_PATH = "https://unpkg.com/@excalidraw/excalidraw@0.18.1/dist/prod/";
}

type ExcalidrawAPI = {
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
};

type SaveState = "saved" | "dirty" | "saving" | "error";

const AUTOSAVE_MS = 4000;

interface WhiteboardProps {
  initialBoards: BoardMeta[];
}

export default function Whiteboard({ initialBoards }: WhiteboardProps) {
  const [boards, setBoards] = useState<BoardMeta[]>(initialBoards);
  const [activeId, setActiveId] = useState<string | null>(initialBoards[0]?.id ?? null);
  const [boardName, setBoardName] = useState(initialBoards[0]?.name ?? "");
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [sceneReady, setSceneReady] = useState(initialBoards.length === 0);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const apiRef = useRef<ExcalidrawAPI | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serializeRef = useRef<((els: never, state: never, files: never, type: "local") => string) | null>(null);
  const skipNextChange = useRef(true);

  // serializeAsJSON lives in the same client-only bundle as the component.
  useEffect(() => {
    import("@excalidraw/excalidraw").then((mod) => {
      serializeRef.current = mod.serializeAsJSON as typeof serializeRef.current;
    });
  }, []);

  const loadBoard = useCallback(async (id: string, name: string) => {
    setSceneReady(false);
    setActiveId(id);
    setBoardName(name);
    setSaveState("saved");
    skipNextChange.current = true;
    const res = await loadBoardAction(id);
    if (res.scene) {
      try {
        const parsed = JSON.parse(res.scene);
        setInitialData({
          elements: parsed.elements ?? [],
          appState: { ...(parsed.appState ?? {}), collaborators: new Map() },
          files: parsed.files ?? {},
        });
      } catch {
        setInitialData(null);
      }
    } else {
      setInitialData(null);
    }
    setSceneReady(true);
  }, []);

  useEffect(() => {
    if (initialBoards.length > 0) {
      void loadBoard(initialBoards[0].id, initialBoards[0].name);
    }
  }, [initialBoards, loadBoard]);

  const doSave = useCallback(async () => {
    const api = apiRef.current;
    const serialize = serializeRef.current;
    if (!api || !serialize || !activeId) return;

    setSaveState("saving");
    const scene = serialize(
      api.getSceneElements() as never,
      api.getAppState() as never,
      api.getFiles() as never,
      "local",
    );
    const res = await saveBoardAction(activeId, boardName || "Untitled", scene);
    if (res.success) {
      setSaveState("saved");
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      const refreshed = await listBoardsAction();
      if (refreshed.boards) setBoards(refreshed.boards);
    } else {
      setSaveState("error");
    }
  }, [activeId, boardName]);

  const doSaveRef = useRef(doSave);
  useEffect(() => {
    doSaveRef.current = doSave;
  }, [doSave]);

  const handleChange = useCallback(() => {
    // Excalidraw fires onChange during mount/scene-load; don't mark those dirty.
    if (skipNextChange.current) {
      skipNextChange.current = false;
      return;
    }
    setSaveState((s) => (s === "saving" ? s : "dirty"));
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => void doSaveRef.current(), AUTOSAVE_MS);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void doSaveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  const handleNew = useCallback(async () => {
    const id = crypto.randomUUID();
    const name = `Board ${new Date().toLocaleDateString([], { month: "short", day: "numeric" })}`;
    const empty = JSON.stringify({ type: "excalidraw", version: 2, elements: [], appState: {}, files: {} });
    const res = await saveBoardAction(id, name, empty);
    if (res.success) {
      const refreshed = await listBoardsAction();
      if (refreshed.boards) setBoards(refreshed.boards);
      void loadBoard(id, name);
    }
  }, [loadBoard]);

  const handleDelete = useCallback(async () => {
    if (!activeId) return;
    if (!window.confirm(`Delete "${boardName}"? This cannot be undone.`)) return;
    await deleteBoardAction(activeId);
    const refreshed = await listBoardsAction();
    const remaining = refreshed.boards ?? [];
    setBoards(remaining);
    if (remaining.length > 0) {
      void loadBoard(remaining[0].id, remaining[0].name);
    } else {
      setActiveId(null);
      setBoardName("");
      setInitialData(null);
      setSceneReady(true);
    }
  }, [activeId, boardName, loadBoard]);

  const statusText = useMemo(() => {
    switch (saveState) {
      case "saving":
        return "Saving…";
      case "dirty":
        return "Unsaved changes";
      case "error":
        return "Save failed — retry with ⌘S";
      default:
        return lastSavedAt ? `Saved · ${lastSavedAt}` : "Saved";
    }
  }, [saveState, lastSavedAt]);

  return (
    <div className="h-screen flex flex-col bg-black">
      <header className="flex items-center gap-3 px-4 h-12 border-b border-neutral-800 shrink-0">
        <Link
          href="/admin"
          className="font-mono text-xs text-neutral-500 hover:text-white transition-colors"
        >
          ← Admin
        </Link>
        <div className="w-px h-4 bg-neutral-800" />

        <select
          value={activeId ?? ""}
          onChange={(e) => {
            const b = boards.find((x) => x.id === e.target.value);
            if (b) void loadBoard(b.id, b.name);
          }}
          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 font-mono text-xs text-white focus:outline-none focus:border-neutral-600"
        >
          {boards.length === 0 && <option value="">No boards</option>}
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          value={boardName}
          onChange={(e) => {
            setBoardName(e.target.value);
            setSaveState("dirty");
          }}
          placeholder="Board name"
          disabled={!activeId}
          className="bg-transparent border border-neutral-800 rounded px-2 py-1 font-mono text-xs text-white w-44 focus:outline-none focus:border-neutral-600 disabled:opacity-40"
        />

        <button
          onClick={handleNew}
          className="font-mono text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded px-2.5 py-1 transition-colors"
        >
          + New
        </button>
        <button
          onClick={() => void doSave()}
          disabled={!activeId}
          className="font-mono text-xs text-black bg-white hover:bg-neutral-200 rounded px-2.5 py-1 transition-colors disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          disabled={!activeId}
          className="font-mono text-xs text-red-400/70 hover:text-red-400 border border-neutral-800 rounded px-2.5 py-1 transition-colors disabled:opacity-40"
        >
          Delete
        </button>

        <span
          className={`ml-auto font-mono text-[11px] ${
            saveState === "error"
              ? "text-red-400"
              : saveState === "dirty"
                ? "text-yellow-500/80"
                : "text-neutral-500"
          }`}
        >
          {statusText}
        </span>
      </header>

      <div className="flex-1 min-h-0">
        {activeId === null ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="font-mono text-sm text-neutral-500">No boards yet.</p>
            <button
              onClick={handleNew}
              className="font-mono text-xs text-black bg-white hover:bg-neutral-200 rounded px-4 py-2 transition-colors"
            >
              Create your first board
            </button>
          </div>
        ) : sceneReady ? (
          <Excalidraw
            key={activeId}
            excalidrawAPI={(api) => {
              apiRef.current = api as unknown as ExcalidrawAPI;
            }}
            initialData={initialData as never}
            onChange={handleChange}
            theme="dark"
          />
        ) : (
          <p className="p-8 font-mono text-xs text-neutral-500">Loading board…</p>
        )}
      </div>
    </div>
  );
}
