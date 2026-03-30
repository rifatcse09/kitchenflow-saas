---
name: init-project
description: Sets up the KitchenFlow repo by installing deps with pnpm, starting Postgres (docker compose), running Prisma migrations + seed, and starting api + web dev servers. Use when the user asks to "run this project", "set up environment", "migrate", "seed", or "install with pnpm".
---

# Init Project (KitchenFlow) with pnpm

## When to use
Use this skill when the user wants to get the repo running on a new machine with a single guided setup, including:
1. Environment setup
2. Prisma migrations
3. Prisma seed (admin + demo roles + restaurant + menu)
4. Starting the API and Web dev servers

## Guardrails / assumptions
1. Docker is installed and `docker compose` works.
2. Postgres is configured in the repo `docker-compose.yml` under the `db` service.
3. This repo uses pnpm in `apps/api` and `apps/web` (commands will run in those folders).
4. The API must run on port `4000` and web on `5173` (Vite default).
5. If `pnpm` is missing on the machine, enable it via `corepack enable` (or install pnpm globally).

## Steps (agent should execute)

### 1) Ensure Postgres is up
- From repo root:
  - Run: `docker compose up -d db`

### 2) Setup `apps/api` env + install deps
- In `apps/api`:
  - If `.env` does not exist, copy: `cp .env.example .env`
  - Run: `pnpm install`

### 3) Prisma migrations + seed (api)
- In `apps/api`:
  - Run: `pnpm prisma generate`
  - Run: `pnpm prisma migrate deploy`
  - Run: `pnpm prisma:seed`

### 4) Setup `apps/web` env + install deps
- In `apps/web`:
  - If `.env` does not exist, copy: `cp .env.example .env`
  - Run: `pnpm install`

### 5) Start dev servers
Start these in separate terminals/processes (so both stay running):
- API: `cd apps/api && pnpm start:dev`
- Web: `cd apps/web && pnpm dev`

### 6) Final verification
Tell the user:
- Web URL: `http://localhost:5173`
- API base: `http://localhost:4000/api/v1`

Optionally ask them to open:
- `http://localhost:5173/admin/login`
- A guest menu QR demo link (example uses the seeded tenant id):
  - `http://localhost:5173/customer/r/1/t/T12`

## Notes (optional)
- If your Postgres is running on a different host port, update `apps/api/.env` -> `DATABASE_URL` accordingly before running migrations.
- If CORS issues appear in the browser console, ensure the web origin matches what the API CORS config allows.

