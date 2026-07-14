# 🧠 Project Memory (`memory.md`)

## 1. Snapshot
- **Current Phase:** Phase 0 — Pre-Development Setup (In Progress)
- **What's Working Right Now:** Initial repository setup with `main` and `dev` branches, root `.gitignore`. Client Vite React app in `/client` building cleanly (`npm run build` verified) with Tailwind CSS v3, shadcn/ui, and configured design tokens, `api.js` Axios instance, and base structure. Server Node/Express app in `/server` syntax verified (`node --check` verified) with Prisma ORM setup, rate limiting, centralized error handling (`errorHandler.js`), response helpers (`responseHelper.js`), `app.js`, and `server.js`. Upstash Redis connection verified (`✅ Upstash Redis Connected`). Deployment configurations (`vercel.json` and `railway.json`) created and committed.
- **What's Half-Done:** Phase 0 Cloud Setup (`DATABASE_URL` internal vs TCP Proxy connection string needed for local development migrations; GitHub repository push & dashboard linkage to Vercel/Railway pending user verification).

## 2. Decisions Log
- **2026-07-14:** Confirmed project root is `/Users/anirudhbhatia/acadtracker`. Established `memory.md` per instructions before starting Phase 0 setup. Confirmed strict adherence to cloud-first structure (Railway PostgreSQL, Upstash Redis, Vercel/Railway deployment targets) and exact formula/threshold constraints (75% attendance fixed, SGPA=8.45 confirmed test case, 0-credit subject exclusions).
- **2026-07-14:** Used Tailwind CSS v3.4.17 in `/client` to ensure 100% compatibility with `design.md` Section 12 `tailwind.config.js` and `shadcn/ui` base layer styling.

## 3. Changes Log
- **2026-07-14:** Initialized `memory.md` with required four-part structure upon starting Phase 0.
- **2026-07-14:** Created root `.gitignore`, initialized Git repository with `main` and `dev` branches.
- **2026-07-14:** Scaffolded `/client` with React + Vite, installed required dependencies (`react-router-dom`, `zustand`, `axios`, `react-hook-form`, `zod`, `recharts`, `react-big-calendar`, `react-hot-toast`, `lucide-react`, `tailwindcss`, `shadcn/ui`). Configured `tailwind.config.js`, `@/` path aliases (`vite.config.js`, `jsconfig.json`), `api.js`, and base client directories (`components/`, `pages/`, `services/`, `hooks/`, `utils/`, `store/`, `routes/`). Verified production build via `npm run build`.
- **2026-07-14:** Scaffolded `/server` with Node.js + Express, installed required dependencies (`express`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `zod`, `cors`, `dotenv`, `express-rate-limit`, `cookie-parser`, `express-async-errors`, `ioredis`). Created `package.json`, `.env.example`, `config/db.js` (Prisma client), `config/redis.js` (Upstash Redis), `middlewares/errorHandler.js`, `utils/responseHelper.js`, `app.js`, `server.js`, `prisma/schema.prisma`, and base server directories. Verified syntax checks.
- **2026-07-14:** Created `/client/vercel.json` (for SPA route rewrites) and `/server/railway.json` (Nixpacks build with `npx prisma generate && node server.js` startCommand). Created local `/server/.env` with provided Upstash credentials and verified Upstash Redis connection (`✅ Upstash Redis Connected`).

## 4. Open Questions / Known Issues
- Railway `DATABASE_URL` provided (`postgres.railway.internal:5432`) is Railway's internal private network URL (for production server container on Railway). For local development/running Prisma migrations from the local workspace, the Railway **TCP Proxy / Public URL** (e.g., `roundhouse.proxy.rlwy.net:12345`) is needed.
