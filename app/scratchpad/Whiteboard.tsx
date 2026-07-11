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

// Excalidraw fetches its fonts at runtime. Self-hosted under public/excalidraw-assets
// (copied from node_modules by scripts/copy-excalidraw-fonts.mjs at install/build time)
// so the canvas doesn't depend on unpkg.com being reachable during an interview.
declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH?: string;
  }
}
if (typeof window !== "undefined") {
  window.EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
}

type ExcalidrawAPI = {
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
};

type ExcalidrawUtils = {
  serializeAsJSON: (els: never, state: never, files: never, type: "local") => string;
  getSceneVersion: (els: readonly unknown[]) => number;
};

type SaveState = "saved" | "dirty" | "saving" | "error";

const AUTOSAVE_MS = 4000;
const UNBASELINED = -1;

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
  const utilsRef = useRef<ExcalidrawUtils | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Scene version of the last save; UNBASELINED right after a board loads, so the
  // first onChange (which Excalidraw fires during mount) sets the baseline instead
  // of marking a freshly loaded board dirty.
  const savedVersionRef = useRef<number>(UNBASELINED);
  const saveStateRef = useRef<SaveState>("saved");

  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  useEffect(() => {
    import("@excalidraw/excalidraw").then((mod) => {
      utilsRef.current = {
        serializeAsJSON: mod.serializeAsJSON as ExcalidrawUtils["serializeAsJSON"],
        getSceneVersion: mod.getSceneVersion as ExcalidrawUtils["getSceneVersion"],
      };
    });
  }, []);

  const cancelAutosave = useCallback(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
  }, []);

  const doSave = useCallback(async () => {
    const api = apiRef.current;
    const utils = utilsRef.current;
    if (!api || !utils || !activeId) return;

    cancelAutosave();
    setSaveState("saving");
    saveStateRef.current = "saving";
    const elements = api.getSceneElements();
    const scene = utils.serializeAsJSON(
      elements as never,
      api.getAppState() as never,
      api.getFiles() as never,
      "local",
    );
    const res = await saveBoardAction(activeId, boardName || "Untitled", scene);
    if (res.success) {
      savedVersionRef.current = utils.getSceneVersion(elements);
      setSaveState("saved");
      saveStateRef.current = "saved";
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      const refreshed = await listBoardsAction();
      if (refreshed.boards) setBoards(refreshed.boards);
    } else {
      setSaveState("error");
      saveStateRef.current = "error";
    }
  }, [activeId, boardName, cancelAutosave]);

  const doSaveRef = useRef(doSave);
  useEffect(() => {
    doSaveRef.current = doSave;
  }, [doSave]);

  const loadBoard = useCallback(
    async (id: string, name: string) => {
      // A pending autosave belongs to the board being left; never let it fire
      // after activeId points at the new board.
      cancelAutosave();
      // Don't drop unsaved work on the outgoing board — doSaveRef still closes
      // over the previous activeId/boardName at this point.
      if (saveStateRef.current === "dirty" || saveStateRef.current === "error") {
        await doSaveRef.current();
      }

      setSceneReady(false);
      setActiveId(id);
      setBoardName(name);
      setSaveState("saved");
      saveStateRef.current = "saved";
      savedVersionRef.current = UNBASELINED;

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
    },
    [cancelAutosave],
  );

  useEffect(() => {
    if (initialBoards.length > 0) {
      void loadBoard(initialBoards[0].id, initialBoards[0].name);
    }
  }, [initialBoards, loadBoard]);

  const handleChange = useCallback((elements: readonly unknown[]) => {
    const utils = utilsRef.current;
    if (!utils) return;
    const version = utils.getSceneVersion(elements);

    if (savedVersionRef.current === UNBASELINED) {
      savedVersionRef.current = version;
      return;
    }
    if (version === savedVersionRef.current || saveStateRef.current === "saving") return;

    setSaveState("dirty");
    saveStateRef.current = "dirty";
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
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStateRef.current === "dirty" || saveStateRef.current === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onBeforeUnload);
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

    // Kill any pending autosave and clear the dirty flag, or the deleted board
    // would be flush-saved back into KV by loadBoard on the way out.
    cancelAutosave();
    setSaveState("saved");
    saveStateRef.current = "saved";

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
      savedVersionRef.current = UNBASELINED;
      setSceneReady(true);
    }
  }, [activeId, boardName, cancelAutosave, loadBoard]);

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
          href="/"
          className="font-mono text-xs text-neutral-500 hover:text-white transition-colors"
        >
          ← Home
        </Link>
        <Link
          href="/admin"
          className="font-mono text-xs text-neutral-500 hover:text-white transition-colors"
        >
          Admin
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
            saveStateRef.current = "dirty";
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
