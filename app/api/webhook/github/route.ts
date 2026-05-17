import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { technologyList } from "@/lib/data";
import type { Project } from "@/lib/data";
import { getKVProjects, setKVProjects } from "@/lib/projects";
import { env } from "@/lib/env";

// ── HMAC-SHA256 signature verification ───────────────────────────────────────

async function verifySignature(body: string, signature: string | null): Promise<boolean> {
  if (!signature || !signature.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.GITHUB_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected =
    "sha256=" +
    Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// ── YAML frontmatter parser ───────────────────────────────────────────────────

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const result: Record<string, unknown> = {};
  let currentKey = "";

  for (const line of lines) {
    const kvMatch = line.match(/^([\w][\w\s]*):\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1].trim();
      const val = kvMatch[2].trim();
      result[currentKey] = val !== "" ? val : [];
    } else {
      const listMatch = line.match(/^\s+-\s+(.+)/);
      if (listMatch && currentKey) {
        if (!Array.isArray(result[currentKey])) result[currentKey] = [];
        (result[currentKey] as string[]).push(listMatch[1].trim());
      }
    }
  }
  return result;
}

// ── Tech icon resolution ──────────────────────────────────────────────────────

function resolveTech(name: string): { name: string; img: string } {
  const match = technologyList.find((t) => t.name.toLowerCase() === name.toLowerCase());
  return { name, img: match?.icon ?? "" };
}

// ── Map parsed frontmatter → Project ─────────────────────────────────────────

function toProject(fm: Record<string, unknown>, owner: string, repo: string): Project {
  const techNames = Array.isArray(fm.technologies)
    ? (fm.technologies as string[])
    : typeof fm.technologies === "string"
      ? [fm.technologies]
      : [];

  const projectImg =
    typeof fm.projectImg === "string" && fm.projectImg
      ? fm.projectImg
      : `https://opengraph.githubassets.com/1/${owner}/${repo}`;

  return {
    title: String(fm.title ?? repo),
    type: String(fm.type ?? "Web Application"),
    projectURL: String(fm.projectURL ?? repo.toLowerCase().replace(/\s+/g, "-")),
    projectImg,
    descriptionShort: String(fm.descriptionShort ?? ""),
    descriptionLong: String(fm.descriptionLong ?? fm.descriptionShort ?? ""),
    button: {
      viewCodeUrl: String(fm.viewCodeUrl ?? `https://github.com/${owner}/${repo}`),
      viewProjectUrl: String(fm.viewProjectUrl ?? ""),
    },
    technologyUsed: techNames.map(resolveTech),
  };
}

// ── Webhook handler ───────────────────────────────────────────────────────────

const SAFE_GITHUB_NAME = /^[a-zA-Z0-9._-]{1,100}$/;
const MAX_BODY_BYTES = 1_000_000;

/**
 * Handles GitHub push webhook events and upserts the pushed project to Vercel KV.
 *
 * @param req - The incoming Next.js request containing the GitHub webhook payload.
 * @returns A JSON response indicating success, a skip reason, or an error.
 *
 * @remarks
 * Verifies the HMAC-SHA256 signature before processing. Reads project metadata from `website.md` in the pushed repo.
 */
export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const signature = req.headers.get("x-hub-signature-256");

  if (!(await verifySignature(rawBody, signature))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  if (event !== "push") {
    return NextResponse.json({ skipped: "not a push event" }, { status: 200 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const repoInfo = payload.repository as { name?: string; owner?: { login?: string } } | undefined;
  if (!repoInfo?.owner?.login || !repoInfo?.name) {
    return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
  }
  const owner = repoInfo.owner.login;
  const repo = repoInfo.name;

  if (!SAFE_GITHUB_NAME.test(owner) || !SAFE_GITHUB_NAME.test(repo)) {
    return NextResponse.json({ error: "Invalid repository info" }, { status: 400 });
  }

  // Fetch website.md content via GitHub Contents API
  const contentsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/website.md`,
    {
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.raw+json",
      },
    },
  );

  if (!contentsRes.ok) {
    return NextResponse.json({ error: "Could not fetch website.md" }, { status: 502 });
  }

  const mdContent = await contentsRes.text();
  const fm = parseFrontmatter(mdContent);

  if (!fm.title && !fm.projectURL) {
    return NextResponse.json(
      { error: "website.md missing required fields (title or projectURL)" },
      { status: 422 },
    );
  }

  const newProject = toProject(fm, owner, repo);

  // Upsert into KV (replace existing entry with same projectURL).
  try {
    const existing = await getKVProjects();
    const updated = existing.filter((p) => p.projectURL !== newProject.projectURL);
    await setKVProjects([newProject, ...updated]);
  } catch (err) {
    console.error("[webhook] KV write failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  revalidatePath("/");

  return NextResponse.json({ ok: true, projectURL: newProject.projectURL }, { status: 200 });
}
