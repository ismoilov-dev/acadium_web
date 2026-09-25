# Acadium — Web Panel

Admin panel for **learning centers (CENTER_ADMIN)** and **teachers (TEACHER)**: students, teachers, parents, groups, schedule, attendance, homework, grading, arena debates, notifications and device approvals.
Students and parents use the Flutter mobile app.

React 18 · Vite · TypeScript (strict) · Tailwind + shadcn-style Radix UI · TanStack Query · React Router 6 · react-hook-form + zod · i18next (UZ / RU / EN) · Recharts · Leaflet/OSM · dayjs (Asia/Tashkent).

## Setup

```bash
npm install
cp .env.example .env        # already points at the live API
npm run dev                 # http://localhost:5173
```

| Variable            | Default                          |
| ------------------- | -------------------------------- |
| `VITE_API_BASE_URL` | `https://acadium-go.duckdns.org` |
| `VITE_WS_BASE_URL`  | `wss://acadium-go.duckdns.org`   |

Scripts: `npm run build` (typecheck + build), `npm run lint`, `npm run format`, `npm run preview`.

## Signing in

1. Enter the phone number (`+998 XX XXX XX XX`). No password.
2. A browser that's never been used gets a **"Kirishni tasdiqlang"** screen: approve the request from an already-trusted device (mobile app → Devices, or this panel → Profil → Qurilmalar), then press **"Tasdiqladim — kirish"**.
3. The panel routes by role; STUDENT/PARENT see a "use the mobile app" screen.

The device id is a UUID stored in `localStorage` (`acadium.device_id`); the JWT is in `acadium.token`. On 401 the client refreshes once, then logs out.

## Deploy

**Netlify** — `netlify.toml` and `public/_redirects` are included (SPA fallback to `index.html`). Build `npm run build`, publish `dist`, set the two env vars.

**Vercel** — `vercel.json` rewrites all paths to `index.html`. Framework preset: Vite.

## Docs

- `PLAN.md` — routes, API mapping, architecture decisions
- `DESIGN_TOKENS.md` — colors, fonts, radii, shadows taken from the landing page
- `BACKEND_TODO.md` — missing endpoints/fields for the Go backend
