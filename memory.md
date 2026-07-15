# 🧠 Project Memory (`memory.md`)

## 1. Snapshot
- **Current Phase:** Phase 0 — Pre-Development Setup (✅ Complete) -> Ready for Phase 1 — Foundation
- **What's Working Right Now:** Initial repository setup with `main` and `dev` branches, root `.gitignore`. Client Vite React app (`/client`) compiles and builds cleanly (`npm run build` verified) with Tailwind CSS v3, shadcn/ui, design tokens, Axios `api.js` instance, and base structure. Server Node/Express app (`/server`) syntax verified with Prisma ORM setup (`prisma/schema.prisma`), Upstash Redis connection verified (`✅ Upstash Redis Connected Successfully`), Railway PostgreSQL TCP Proxy connection verified (`✅ Railway PostgreSQL TCP Proxy Connected Successfully via Prisma`), rate limiting, centralized error handling (`errorHandler.js`), response helpers (`responseHelper.js`), `app.js`, and `server.js`. Deployment configs (`vercel.json` and `railway.json`) created.
- **What's Half-Done:** None. Phase 0 setup fully verified. Ready to begin Phase 1 (Database Schema, Authentication & Authorization, Base Layout).

## 2. Decisions Log
- **2026-07-14:** Confirmed project root is `/Users/anirudhbhatia/acadtracker`. Established `memory.md` per instructions before starting Phase 0 setup. Confirmed strict adherence to cloud-first structure (Railway PostgreSQL, Upstash Redis, Vercel/Railway deployment targets) and exact formula/threshold constraints (75% attendance fixed, SGPA=8.45 confirmed test case, 0-credit subject exclusions).
- **2026-07-14:** Used Tailwind CSS v3.4.17 in `/client` to ensure 100% compatibility with `design.md` Section 12 `tailwind.config.js` and `shadcn/ui` base layer styling.
- **2026-07-15:** Configured local `/server/.env` with Railway PostgreSQL TCP Proxy URL (`turntable.proxy.rlwy.net:13524`) for local schema migrations while keeping `postgres.railway.internal:5432` for production Railway deployment.

## 3. Changes Log
- **2026-07-14:** Initialized `memory.md` with required four-part structure upon starting Phase 0.
- **2026-07-14:** Created root `.gitignore`, initialized Git repository with `main` and `dev` branches.
- **2026-07-14:** Scaffolded `/client` with React + Vite, installed required dependencies (`react-router-dom`, `zustand`, `axios`, `react-hook-form`, `zod`, `recharts`, `react-big-calendar`, `react-hot-toast`, `lucide-react`, `tailwindcss`, `shadcn/ui`). Configured `tailwind.config.js`, `@/` path aliases (`vite.config.js`, `jsconfig.json`), `api.js`, and base client directories (`components/`, `pages/`, `services/`, `hooks/`, `utils/`, `store/`, `routes/`). Verified production build via `npm run build`.
- **2026-07-14:** Scaffolded `/server` with Node.js + Express, installed required dependencies (`express`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `zod`, `cors`, `dotenv`, `express-rate-limit`, `cookie-parser`, `express-async-errors`, `ioredis`). Created `package.json`, `.env.example`, `config/db.js` (Prisma client), `config/redis.js` (Upstash Redis), `middlewares/errorHandler.js`, `utils/responseHelper.js`, `app.js`, `server.js`, `prisma/schema.prisma`, and base server directories. Verified syntax checks.
- **2026-07-14:** Created `/client/vercel.json` (for SPA route rewrites) and `/server/railway.json` (Nixpacks build with `npx prisma generate && node server.js` startCommand). Created local `/server/.env` with provided Upstash credentials and verified Upstash Redis connection (`✅ Upstash Redis Connected`).
- **2026-07-15:** Updated `server/.env` with Railway PostgreSQL TCP Proxy URL (`turntable.proxy.rlwy.net:13524`). Ran `npx prisma generate` and verified connection (`✅ Railway PostgreSQL TCP Proxy Connected Successfully via Prisma`). Marked Phase 0 as ✅ Complete.

## 4. Open Questions / Known Issues
- None currently. Phase 0 complete and verified. Ready to start Phase 1.
