# KitchenFlow

Restaurant ordering platform (QR menu → live kitchen display → customer-ready status), built as a multi-tenant SaaS foundation using **NestJS + React + PostgreSQL + Docker**.

**Package docs:** [Web app — `apps/web`](apps/web/README.md) · [HTTP API — `apps/api`](apps/api/README.md)

**Local services:** `docker compose` in this repo runs **PostgreSQL only** (port **5434** on the host). Run the **NestJS API** (`apps/api`, default port **4000**) and the **Vite web app** (`apps/web`, default **5173**) from each app directory after installing dependencies there.

---

## 1) Product Vision

Enable restaurants and food trucks to accept table-side digital orders through QR codes, route orders instantly to kitchen displays, and reduce order disputes with optional audio/video confirmation.

This README defines the **MVP plan first**, then the scalable roadmap.

---

## 2) Core User Flows

### A. Customer Flow
1. Customer sits at table (or food truck seating area).
2. Scans table QR code.
3. Mobile web app opens restaurant menu.
4. Browses categories: Appetizers, Entrees, Drinks, Desserts.
5. Adds items, quantity, and notes/special requests.
6. (Optional) records audio/video order confirmation.
7. Submits order.
8. Sees live order status (`Pending` -> `Cooking` -> `Ready`).

### B. Kitchen Flow
1. New order appears instantly on kitchen display.
2. Kitchen sees table/order number, items, timestamp, notes.
3. If needed, kitchen/admin can review attached recording.
4. Kitchen updates status to `Cooking` and then `Ready`.

### C. Notification Flow
1. Status change to `Ready` triggers notification event.
2. Customer receives:
   - In-app real-time status update (MVP default).
   - Optional browser push (phase 2).
   - Optional SMS/WhatsApp (phase 3, paid provider).

### D. Restaurant Admin Flow
1. Owner/manager logs into dashboard.
2. Manages menu categories/items/prices/availability.
3. Views live and historical orders.
4. Reviews audio/video confirmations for dispute handling.

### E. Platform Admin (Rifat) Flow
1. Approves/controls restaurant onboarding.
2. Manages subscriptions/licensing.
3. Monitors tenant usage and platform analytics.

### Web app routes (browse all UI)

Run the Vite dev server (`apps/web`), then open paths relative to the app origin (default **http://localhost:5173**).

| Area | Paths |
|------|--------|
| **Root** | `/` → redirects to `/customer/welcome` |
| **Customer** | `/customer/welcome` · **`/customer/r/:restaurantId/t/:tableCode`** (QR deep link) · `/customer/menu` · `/customer/cart` · `/customer/tracking` · `/customer/login` · `/customer/register` · `/customer/record-audio` · `/customer/record-video` · `/customer/sign-out` |
| **Restaurant** | `/restaurant/login` · `/restaurant/register` · `/restaurant/onboarding` · `/restaurant/dashboard` · `/restaurant/live-map` · `/restaurant/media` · `/restaurant/team` · `/restaurant/menu` · **`/restaurant/qr-codes`** (printable table URLs) · `/restaurant/orders-history` · `/restaurant/subscription` · `/restaurant/orders` · `/restaurant/kds` · `/restaurant/order/:id` · `/restaurant/sign-out` |
| **Platform admin** | `/admin/login` · `/admin/dashboard` · `/admin/restaurants` · `/admin/billing` · `/admin/subscriptions` · `/admin/activity` · `/admin/sign-out` |

Log in per portal (customer / restaurant staff / admin) to see the full sidebar or top navigation. The API (`apps/api`, default **http://localhost:4000**) should be running if you need live data. REST endpoints use the global prefix **`/api/v1`** (see below).

**Static prototype:** `ui-design-prototype.html` at the repo root. Open the file in a browser (not served by Vite unless you wire it up).

### Repository layout (`apps/web` & `apps/api`)

**`apps/web/`**: React (Vite) SPA, feature folders by portal:

```
apps/web/
  public/
    menu-food/           # Menu thumbnails: {imageKey}.jpg (keys in shared/constants.ts)
    images/              # Hero / static imagery used by CSS
  src/
    App.tsx              # Routes, auth/session state, API calls
    main.tsx
    admin/               # Platform SaaS screens (barrel: index.ts)
    customer/            # Guest / QR ordering flow
    restaurant/          # Tenant staff: KDS, menu, onboarding, subscription, etc.
    layout/              # PortalLayout (drawer vs sidebar), redirects
    shared/
      types.ts           # Shared TypeScript types
      constants.ts       # PRODUCT_NAME, API_BASE, VITE_*, menu image keys
      components/        # e.g. ScreenFrame
```

**`apps/api/`**: NestJS HTTP API (global prefix **`api/v1`**) + **Prisma**. See [`apps/api/README.md`](apps/api/README.md) for scripts, env, and route summary.

```
apps/api/
  prisma/
    schema.prisma        # Tenants, users, menu, orders, subscriptions, …
    seed.ts              # Default admin, customer, tenants, demo logins
    migrations/          # SQL migrations (PostgreSQL)
  src/
    main.ts              # Bootstrap, CORS, setGlobalPrefix('api/v1'), PORT
    app.module.ts
    prisma/              # PrismaService (global module)
    app.controller.ts    # GET /api/v1/ (root)
    auth/                # POST /api/v1/auth/login
    admin/               # /api/v1/admin/* (requests, subscriptions, …)
    restaurant/          # /api/v1/restaurant/* (menu, orders, users, …)
    data/                # StoreService (Prisma + bcrypt)
```

**Database (local):** From the repo root, start Postgres (`docker compose up -d db`), then in **`apps/api`** copy **`.env.example`** → **`.env`**, run **`npx prisma migrate deploy`**, then **`npm run prisma:seed`**. The API must be able to reach **`DATABASE_URL`** (default `postgresql://postgres:postgres@localhost:5434/restaurant_platform`).

**Local URLs:** **Frontend (Vite):** [http://localhost:5173](http://localhost:5173) · **API:** [http://localhost:4000](http://localhost:4000) · **Postgres (Docker maps to host):** `localhost:5434`

**Install / run (copy-paste):**

```bash
docker compose up -d db
cd apps/api && cp .env.example .env   # if you don’t have .env yet
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

In a **second terminal**, start the web UI:

```bash
cd apps/web && npm install && npm run dev
```

(Use **pnpm** in each `apps/*` folder if you prefer; see the package READMEs.)

**Seed demo accounts** (bcrypt-hashed in DB):

| Role | Email | Password |
|------|--------|----------|
| Platform admin | `admin@mdrifatul.info` | `123456` |
| Customer | `customer@demo.com` | `customer123` |
| Restaurant owner (approved tenant id **1**) | `john@smokeyhouse.com` | `owner123` |
| Manager | `manager@bbq.com` | `manager123` |
| Kitchen (KDS) | `kds@bbq.com` | `kds123` |
| Pending onboarding (login blocked until admin approves) | `ava@tacorush.com`, `pending@grillco.com` | `owner123` |

The web app uses **`VITE_DEMO_RESTAURANT_ID`** (default **1**) when resolving demo tenant context; seed keeps approved tenant id **1** stable.

**REST base URL:** `{API_ORIGIN}/api/v1`, e.g. `http://localhost:4000/api/v1/auth/login`  
`VITE_API_URL` in the web app should be **only the origin** (no `/api/v1`); the client appends `/api/v1` automatically.

**Frontend → backend connection**

1. Start the API (`apps/api`, default port **4000**) so CORS allows `http://localhost:5173` (Vite).
2. The React app reads **`import.meta.env.VITE_API_URL`** and builds **`API_BASE` = `{VITE_API_URL}/api/v1`** in `apps/web/src/shared/constants.ts`. All `fetch()` calls in `App.tsx` use that base (e.g. `/auth/login`, `/admin/...`).
3. **`.env` file:** optional for local dev. If unset, the code falls back to **`http://localhost:4000`**. Use a file when the API runs elsewhere (another port, Docker hostname, staging). Copy **`apps/web/.env.example`** to **`.env`** or **`.env.local`** and set `VITE_API_URL=...`. Restart `npm run dev` after changing env vars.
4. Only variables prefixed with **`VITE_`** are exposed to the browser (Vite rule).

---

## 3) Recommended Tech Stack (Chosen)

## Frontend
- **React** (Vite) for:
  - Customer ordering UI
  - Kitchen display UI
  - Restaurant admin dashboard
- Optional: Next.js later for SEO/public pages.

## Backend
- **NestJS** (REST API + WebSocket Gateway)
- Authentication/authorization with JWT + role guards.
- Multi-tenant aware business logic.

## Data Layer
- **PostgreSQL** as primary database (see Docker Compose in repo root).
- **Prisma** ORM (`apps/api/prisma`) with migrations and **`prisma/seed.ts`** for local defaults.

## Realtime
- WebSockets via NestJS gateway + Socket.IO adapter.
- Channels scoped by restaurant ID for tenant isolation.

## Media Storage
- MVP: local mounted storage in Docker volume.
- Scale: S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.).

## Infrastructure
- **Docker + Docker Compose**
- Services:
  - `api` (NestJS)
  - `web` (React)
  - `db` (PostgreSQL)
  - `redis` (optional now, useful for queues/realtime scaling)

---

## 4) MVP Feature Scope

### Must Have (Phase 1)
- QR-based table/session entry.
- Digital menu with categories.
- Cart/order builder with notes.
- Submit order API.
- Kitchen live order screen.
- Status updates: `Pending`, `Cooking`, `Ready`.
- Customer live status screen.
- Restaurant admin menu + order management.

### Should Have (Phase 2)
- Optional audio upload for confirmation.
- Optional video upload for confirmation.
- Browser push notifications.
- Basic analytics (orders/day, avg prep time).

### Later (Phase 3)
- SMS/WhatsApp notification integration.
- Multi-tenant billing/subscriptions.
- Advanced analytics + exports.
- Audit logs, backups, observability.

---

## 5) Proposed High-Level System Architecture

1. Customer scans QR code with encoded route:
   - `https://app.domain.com/r/{restaurantSlug}/t/{tableCode}`
2. React app resolves tenant + table context.
3. Customer interacts with menu/cart UI.
4. React calls NestJS API to create order.
5. API writes order to PostgreSQL.
6. API emits WebSocket event to kitchen/admin channels.
7. Kitchen app receives event and updates live queue.
8. Kitchen changes order status via API.
9. API persists status and emits update to customer channel.
10. Customer UI updates in real time.

---

## 6) Domain Model (Initial)

Core entities:
- `PlatformAdmin`
- `Restaurant`
- `RestaurantUser` (Owner, Manager, KitchenStaff)
- `Table`
- `Category`
- `MenuItem`
- `Order`
- `OrderItem`
- `OrderMedia` (audio/video metadata)
- `OrderStatusHistory`
- `Subscription` (phase 3)

Order status enum:
- `PENDING`
- `COOKING`
- `READY`
- `CANCELLED` (optional, recommended)

---

## 7) API Modules (NestJS)

- `auth` - login, JWT, role guards.
- `restaurants` - tenant config and metadata.
- `tables` - QR table mapping.
- `menu` - categories/items CRUD and read endpoints.
- `orders` - create order, list orders, order details.
- `kitchen` - kitchen queue + status transitions.
- `media` - upload/retrieve audio/video attachments.
- `notifications` - in-app events, push hooks, future SMS.
- `admin` - platform-level controls.

---

## 8) Realtime Event Contract (MVP)

Server emits:
- `order.created`
- `order.updated`
- `order.status.changed`

Payload minimum:
- `restaurantId`
- `orderId`
- `tableCode`
- `status`
- `timestamp`

---

## 9) Security + Multi-Tenancy Basics

- Every request is scoped by `restaurantId`.
- Role-based access:
  - Customer (public session by table token)
  - KitchenStaff
  - Manager/Owner
  - PlatformAdmin
- Validate file uploads (size/type) for media.
- Store media URLs outside public DB fields if sensitive.
- Add audit trail for status changes and admin actions.

---

## 10) Dockerized development (current)

**Checked in today:** `docker-compose.yml` defines **`db`** only (Postgres **16**, host port **5434** → container **5432**, database **`restaurant_platform`**).

API and web are started **locally** (see § install/run above). Optional extra services (Redis, in-compose API/web) remain roadmap items.

**API env** (see `apps/api/.env.example`): `PORT`, `DATABASE_URL`. **CORS:** localhost / 127.0.0.1 Vite origins are allowed by default; set **`CORS_ORIGINS`** (comma-separated) for additional front-end origins.

**Web env:** `VITE_API_URL` (origin only; client calls `/api/v1/...`), optional `VITE_DEMO_RESTAURANT_ID`.

---

## 11) Build Plan (Execution Order)

### Sprint 1 - Foundation
- Initialize monorepo structure (`apps/api`, `apps/web`).
- Bootstrap NestJS + React.
- Add Docker Compose + Postgres.
- Implement auth, restaurant, table, and menu models.

### Sprint 2 - Core Ordering
- Customer menu and cart.
- Order creation + order item persistence.
- Kitchen queue screen.
- WebSocket order creation events.

### Sprint 3 - Status + Dashboard
- Kitchen status transitions.
- Customer live status screen.
- Restaurant admin menu/order pages.
- Basic order history filters.

### Sprint 4 - Media + Hardening
- Optional audio/video upload.
- Media attach/view in admin and kitchen.
- Validation, rate limits, and audit logs.
- QA pass + deploy MVP.

---

## 12) Cost Strategy (MVP to Scale)

Low-cost first:
- No SMS at launch.
- In-app real-time + on-screen status only.
- Local or low-cost object storage.
- Single VPS deployment with Docker.

Paid later:
- SMS/WhatsApp notifications.
- Scalable object storage/CDN.
- Multi-region infra and advanced observability.
- Billing/subscription management tooling.

---

## 13) Why This Stack (vs Firebase)

- Better control for custom business logic.
- Cleaner path to multi-tenant SaaS.
- Easier custom billing/licensing model.
- Lower lock-in and predictable architecture growth.

---

## 14) Implementation status (high level)

**In this repository today:** `apps/web` + `apps/api`, Prisma schema and migrations, seed data, auth login by role, restaurant registration and admin approval flow, tenant menu CRUD (with `imageKey` aligned to web `public/menu-food/*.jpg`), orders, subscriptions admin surface, and the customer / restaurant / admin UIs wired to **`/api/v1`**.

**Still roadmap / partial:** full WebSocket customer–kitchen realtime as described in §8–9, compose-packaged API/web, Redis, SMS/push, and production hardening as listed in MVP phases above.

---

## 15) IP and Brand Notice

The concept, branding, and system structure for **KitchenFlow** are represented as protected intellectual property by Rifat per your provided statement.

