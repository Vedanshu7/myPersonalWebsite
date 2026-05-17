# vedanshujoshi.com

Personal portfolio website built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS. Features a live GitHub contribution grid, admin panel for editing site content, GitHub webhook integration for automatic project updates, and full SEO metadata.

Live: [vedanshujoshi.com](https://vedanshujoshi.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 3 + CSS variables |
| Animation | Framer Motion 12 |
| Auth | Auth.js v5 (GitHub OAuth) |
| Storage | Vercel KV (Upstash Redis) |
| Validation | Zod 4 |
| Analytics | Google Analytics 4 |

---

## Features

- **GitHub contribution grid** — fetches 2 years of contribution data via GitHub GraphQL API
- **Dynamic projects** — static projects in `lib/data.ts` + KV-stored projects pushed via GitHub webhook
- **GitHub webhook** — push a `website.md` to any repo and it auto-upserts to the portfolio
- **Medium feed** — latest posts pulled from RSS and shown in the Writing section
- **Open-source contributions** — GitHub Search API shows PRs and issues on external repos
- **Full SEO** — `sitemap.xml`, `robots.txt`, PWA manifest, JSON-LD structured data, OG and Twitter cards

---

## Project Structure

```
app/
  actions/        Server Actions (save content, logout)
  admin/          Admin dashboard and login page
  api/            Route handlers — contributions, github-stats, medium, open-source, webhook
  project/        Dynamic [projectName] page
  layout.tsx      Root layout, metadata, fonts, providers
  page.tsx        Home page — async server component
  globals.css     CSS variables and global utilities

components/
  sections/       Page sections (Hero, About, Projects, Skills, Experience, Writing, etc.)
  ui/             Headless Radix-based UI primitives
  *.tsx           Layout-level components (NavBar, Footer, ScrollReveal, etc.)

hooks/            usePinnedScroll — scroll-linked animation values
lib/
  data.ts         Static project/timeline/tech data and all shared types
  env.ts          Zod-validated environment variables (server-only)
  utils.ts        cn() and getBaseUrl()
  content.ts      KV read/write for editable site content
  projects.ts     KV read/write for projects
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Vedanshu7/website.git
cd website
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | How to get it |
|---|---|
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) — fine-grained PAT with `read:user` scope |
| `GITHUB_USERNAME` | Your GitHub username |
| `GITHUB_WEBHOOK_SECRET` | Any random secret — `openssl rand -hex 20` |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel dashboard → Storage → KV |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (optional) |
| `NEXT_PUBLIC_FORMSPREE_URL` | [formspree.io](https://formspree.io) form endpoint |

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint (zero warnings enforced)
npm run type-check    # TypeScript strict check
npm run format        # Prettier write
npm run format:check  # Prettier check (used in CI)
```

---

## GitHub Webhook Integration

Push a `website.md` file to any public GitHub repo and it will automatically appear in the Projects section.

**1. Add the webhook to your repo:**
- Repo → Settings → Webhooks → Add webhook
- Payload URL: `https://vedanshujoshi.com/api/webhook/github`
- Content type: `application/json`
- Secret: your `GITHUB_WEBHOOK_SECRET`
- Events: just `push`

**2. Create `website.md` in the repo root:**

```markdown
---
title: My Project
type: Web Application
projectURL: my-project
descriptionShort: One-line summary.
descriptionLong: Full description shown on the project detail page.
viewCodeUrl: https://github.com/username/repo
viewProjectUrl: https://my-project.com
projectImg: https://example.com/screenshot.png
technologies:
  - React
  - TypeScript
  - Node.js
---
```

The webhook handler verifies the HMAC-SHA256 signature, fetches `website.md`, parses the frontmatter, and upserts the project into Vercel KV. The home page revalidates automatically.

---

## Deployment

The site is deployed on Vercel. Add all variables from `.env.example` in **Project → Settings → Environment Variables**. The `KV_REST_API_URL` and `KV_REST_API_TOKEN` values are auto-injected when you connect a KV database from the Vercel Storage tab.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vedanshu7/website)

Or deploy via CLI:

```bash
npm i -g vercel
vercel
```
