#!/usr/bin/env node
// Self-hosts the Excalidraw font assets under public/, so the scratchpad canvas
// doesn't depend on unpkg.com at runtime. Runs on postinstall and before build;
// the destination is gitignored since it's a copy of an installed package, not
// source — this keeps 13MB of binary fonts out of git history.
import { cp, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "node_modules/@excalidraw/excalidraw/dist/prod/fonts");
const dest = path.join(root, "public/excalidraw-assets/fonts");

try {
  await access(src);
} catch {
  console.warn("[copy-excalidraw-fonts] source not found, skipping (excalidraw not installed?)");
  process.exit(0);
}

await cp(src, dest, { recursive: true });
console.log(`[copy-excalidraw-fonts] copied fonts -> public/excalidraw-assets/fonts`);
