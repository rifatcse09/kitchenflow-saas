# KitchenFlow — Web (`apps/web`)

Vite + React SPA (customer QR ordering, restaurant portal, platform admin). Data: Nest API in [`../api`](../api/README.md) at `{VITE_API_URL}/api/v1`. Full context: [`README.md`](../../README.md).

**Stack:** React 19 · Vite 8 · TypeScript · react-router-dom 7 · `qrcode`

```bash
cd apps/web
pnpm dev          # http://localhost:5173 — or: npm run dev
pnpm build        # tsc -b && vite build
```

**Env (optional `.env`):** `VITE_API_URL` — API origin only, default `http://localhost:4000`. `VITE_DEMO_RESTAURANT_ID` — demo tenant, default `1`.

**Code:** `src/App.tsx` (routes + auth + fetches) · `customer/` · `restaurant/` · `admin/` · `layout/` · `shared/constants.ts` (`API_BASE`, menu image keys). **Assets:** `public/menu-food/{key}.jpg` (keys match API `imageKey`) · `public/images/`.

**Routes:** `/` → `/customer/welcome`; under `/customer/*`, `/restaurant/*`, `/admin/*` (see root README table). Restaurant nav varies by `restaurantSubRole` after login.
