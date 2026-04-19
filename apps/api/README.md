# KitchenFlow — API (`apps/api`)

NestJS HTTP service for **KitchenFlow**: multi-tenant restaurants, staff auth, menu and orders, platform admin (approvals, subscriptions). Persists to **PostgreSQL** via **Prisma**.

**Related docs:** [Monorepo overview](../../README.md) · [Web app](../web/README.md)

---

## Stack

| Piece | Version / notes |
|--------|------------------|
| **NestJS** | 11.x (`@nestjs/common` / `core` / `platform-express`) |
| **Prisma** | 5.22 (`schema.prisma`, migrations, `prisma/seed.ts`) |
| **Auth** | bcrypt-hashed passwords; login returns role + tenant context (see `StoreService`) |

---

## HTTP surface

- **Global prefix:** `api/v1` (e.g. `http://localhost:4000/api/v1/auth/login`)
- **Port:** `process.env.PORT` or **4000**
- **CORS:** Any `http://localhost:*` / `http://127.0.0.1:*` origin is allowed; add **`CORS_ORIGINS`** (comma-separated list) for other front-end URLs.

---

## Modules (src/)

| Path | Role |
|------|------|
| `auth/` | `POST /auth/login` — body `{ role, email, password }` (`CUSTOMER` \| `RESTAURANT` \| `ADMIN`) |
| `admin/` | Default owner metadata, restaurant request queue + approve, subscription catalog CRUD |
| `restaurant/` | Per-tenant: profile, subscription read/update, **menu-items** CRUD, **orders** create/list/update, **users** list/create |
| `data/` | `StoreService` — Prisma + bcrypt; shared business logic |
| `prisma/` | `PrismaService`, global module |
| `app.controller.ts` | `GET /api/v1/` — API root |

Restaurant routes live under **`/restaurant/:restaurantId/...`** (see `restaurant.controller.ts` for exact paths).

---

## Environment

Copy **`.env.example`** → **`.env`** in this directory.

| Variable | Purpose |
|----------|---------|
| **`PORT`** | HTTP listen port (default `4000`) |
| **`DATABASE_URL`** | Postgres connection string (local Docker: host port **5434**, db **`restaurant_platform`**) |
| **`CORS_ORIGINS`** | Optional extra allowed browser origins (comma-separated) |

---

## Scripts

From **`apps/api`**:

```bash
npm install
npm run prisma:generate    # or: npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev          # watch mode
```

Other useful commands (see `package.json`):

- **`npm run build`** — `prisma generate` + `nest build`
- **`npm run start:prod`** — `node dist/main`
- **`npm run lint`** / **`npm test`**

---

## Database (local)

From the **repository root**:

```bash
docker compose up -d db
```

Then apply migrations and seed (commands above). Demo accounts are listed in the **Seed demo accounts** table in the [root README](../../README.md).

---

## Prisma

- **`prisma/schema.prisma`** — models (restaurants, users, menu items with optional `imageKey`, orders, subscriptions, …)
- **`prisma/migrations/`** — SQL migrations
- **`prisma/seed.ts`** — invoked via `npm run prisma:seed` (`prisma db seed` → `tsx prisma/seed.ts`)

---

## License

Private / **UNLICENSED** for this product repo (see `package.json`). NestJS itself is MIT — [nestjs.com](https://nestjs.com/).
