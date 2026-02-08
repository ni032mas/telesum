# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram Chat Summary Bot — Web UI for collecting messages from Telegram chats, summarizing them via LLM CLI (Claude, Gemini, or Qwen), and viewing/sending results.

## Commands

```bash
npm install                          # Install all deps (root + client + server via postinstall)
npm run dev                          # Concurrent: client (5173) + server (3001)
npm run build                        # Build client (Vite) + server (tsc)
npm start                            # Production: Express serves API + static on port 3001
```

Type-checking (no tests configured yet):
```bash
cd client && npx tsc -b --noEmit     # Type-check client
cd server && npx tsc --noEmit        # Type-check server
cd client && npm run lint             # ESLint (client only, flat config)
```

## Architecture

```
client/ (React 19 + Vite + Tailwind v4)
  └─ api/ fetch wrappers ──→  server/ (Express + TypeScript)
                                 ├─ routes/     ──→ services/
                                 ├─ services/
                                 │   ├─ telegram.ts   GramJS userbot (auth, read messages)
                                 │   ├─ bot.ts        node-telegram-bot-api (send summaries)
                                 │   ├─ llm.ts        spawn CLI, pass prompt via stdin
                                 │   ├─ summarize.ts  orchestrator + EventEmitter → SSE
                                 │   ├─ config.ts     regex-based .env read/write
                                 │   └─ database.ts   better-sqlite3 (data/telesum.db)
                                 └─ types/index.ts   shared interfaces
```

### Key patterns

- **Monorepo without workspaces**: root `package.json` uses `concurrently` + `install:all` script. Client and server are independent npm projects.
- **Server module system**: CommonJS (`module: "commonjs"` in tsconfig). GramJS imported via `require()` to avoid ESM interop issues.
- **Client module system**: ESNext with Vite bundler. Path alias `@/*` → `./src/*`.
- **LLM integration**: All CLI tools receive the full prompt (with messages inlined) via **stdin** using `child_process.spawn`. The prompt template `prompt.md` uses `{messages}` and `{hours}` placeholders.
- **Real-time progress**: `summarize.ts` emits events via `EventEmitter` → `routes/summarize.ts` streams them as SSE → client subscribes via `hooks/use-sse.ts`.
- **Telegram auth**: 3-step HTTP flow. Singleton GramJS client. Session persisted as `TG_SESSION` (StringSession base64) in `.env`.
- **Config management**: `.env` parsed/written line-by-line with regex to preserve comments and ordering. Secrets masked in API responses (first 4 chars + `***`).
- **Production serving**: Express checks if `client/dist/` exists, serves it as static + SPA catch-all.

### API endpoints

```
GET/PUT  /api/config                 — read/update .env (secrets masked in response)
GET/PUT  /api/config/prompt          — read/update prompt.md template
POST     /api/auth/send-code         — Telegram auth step 1
POST     /api/auth/verify-code       — step 2 (returns passwordRequired if 2FA)
POST     /api/auth/verify-password   — step 3 (2FA)
GET      /api/auth/status            — { authenticated: bool }
GET      /api/chats                  — source chats with metadata (requires auth)
POST     /api/summarize              — fire-and-forget, returns { started: true }
GET      /api/summarize/status       — SSE stream (progress events)
GET      /api/summaries?limit=&offset= — paginated list
GET/DELETE /api/summaries/:id        — single summary CRUD
```

## Git

### Setup
```bash
git config core.hooksPath .githooks
```

### Rules
- **No direct commits** to `dev` or `main` (enforced by pre-commit hook)
- Feature branches: `feature/*` or `fix/*` off `dev`
- Only `release/*` and `hotfix/*` merge into `main`
- **Conventional commits** enforced by commit-msg hook: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `build:`, `ci:`, `perf:`, `revert:`
- No co-authors in commit messages
- Force pushes and branch deletion blocked on `dev` and `main`

## Code Style

- Comments in English
- `const`-style naming; avoid mutable globals
- Client: `@/` path alias for all imports
- Server: `require()` for GramJS imports, standard ES imports for everything else
- shadcn/ui components in `client/src/components/ui/` — standard forwardRef pattern with `cn()` utility
