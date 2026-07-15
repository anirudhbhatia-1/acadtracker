# 🧠 Project Memory (`memory.md`)

## 1. Snapshot
- **Current Phase:** Phase 1 — Foundation (🟡 In Progress — Sections 1.1, 1.2, 1.3 Complete)
- **What's Working Right Now:** Initial repository setup with `main` and `dev` branches, root `.gitignore`. Client Vite React app (`/client`) compiles and builds cleanly (`npm run build` verified) with Tailwind CSS v3, shadcn/ui, design tokens, Axios `api.js` instance, and base structure. Server Node/Express app (`/server`) syntax verified with complete Prisma ORM setup (`prisma/schema.prisma`), Upstash Redis connection (`✅ Upstash Redis Connected Successfully`), Railway PostgreSQL TCP Proxy connection (`✅ Railway PostgreSQL TCP Proxy Connected Successfully via Prisma`), rate limiting (`authLimiter`), centralized error handling (`errorHandler.js`), response helpers (`responseHelper.js`), and fully tested Auth & Onboarding REST APIs (`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/me`, `POST /onboarding/select-course`).
- **What's Half-Done:** Phase 1 Chunk 3 (Frontend Auth & Onboarding Pages & Zustand Store — Sections 1.4 & 1.5) ready to begin next.

## 2. Decisions Log
- **2026-07-14:** Confirmed project root is `/Users/anirudhbhatia/acadtracker`. Established `memory.md` per instructions before starting Phase 0 setup. Confirmed strict adherence to cloud-first structure (Railway PostgreSQL, Upstash Redis, Vercel/Railway deployment targets) and exact formula/threshold constraints (75% attendance fixed, SGPA=8.45 confirmed test case, 0-credit subject exclusions).
- **2026-07-14:** Used Tailwind CSS v3.4.17 in `/client` to ensure 100% compatibility with `design.md` Section 12 `tailwind.config.js` and `shadcn/ui` base layer styling.
- **2026-07-15:** Configured local `/server/.env` with Railway PostgreSQL TCP Proxy URL (`turntable.proxy.rlwy.net:13524`) for local schema migrations while keeping `postgres.railway.internal:5432` for production Railway deployment.
- **2026-07-15:** Added explicit relation onDelete behaviors (`Cascade` and `SetNull`) across all Prisma models to ensure relational integrity and match physical deletion vs archival constraints (`isArchived`).
- **2026-07-15:** Standardized `responseHelper.js` parameter signatures (`sendSuccess(res, data, message, statusCode)` and `sendError(res, message, statusCode, errorCode, details)`) across all middlewares (`validate`, `auth`, `admin`) and controllers (`auth`, `onboarding`).

## 3. Changes Log
- **2026-07-14:** Initialized `memory.md` with required four-part structure upon starting Phase 0.
- **2026-07-14:** Created root `.gitignore`, initialized Git repository with `main` and `dev` branches.
- **2026-07-14:** Scaffolded `/client` with React + Vite, installed required dependencies (`react-router-dom`, `zustand`, `axios`, `react-hook-form`, `zod`, `recharts`, `react-big-calendar`, `react-hot-toast`, `lucide-react`, `tailwindcss`, `shadcn/ui`). Configured `tailwind.config.js`, `@/` path aliases (`vite.config.js`, `jsconfig.json`), `api.js`, and base client directories (`components/`, `pages/`, `services/`, `hooks/`, `utils/`, `store/`, `routes/`). Verified production build via `npm run build`.
- **2026-07-14:** Scaffolded `/server` with Node.js + Express, installed required dependencies (`express`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `zod`, `cors`, `dotenv`, `express-rate-limit`, `cookie-parser`, `express-async-errors`, `ioredis`). Created `package.json`, `.env.example`, `config/db.js` (Prisma client), `config/redis.js` (Upstash Redis), `middlewares/errorHandler.js`, `utils/responseHelper.js`, `app.js`, `server.js`, `prisma/schema.prisma`, and base server directories. Verified syntax checks.
- **2026-07-14:** Created `/client/vercel.json` (for SPA route rewrites) and `/server/railway.json` (Nixpacks build with `npx prisma generate && node server.js` startCommand). Created local `/server/.env` with provided Upstash credentials and verified Upstash Redis connection (`✅ Upstash Redis Connected`).
- **2026-07-15:** Updated `server/.env` with Railway PostgreSQL TCP Proxy URL (`turntable.proxy.rlwy.net:13524`). Ran `npx prisma generate` and verified connection (`✅ Railway PostgreSQL TCP Proxy Connected Successfully via Prisma`). Marked Phase 0 as ✅ Complete.
- **2026-07-15:** Started Phase 1. Wrote full `server/prisma/schema.prisma` (8 models, 8 enums) and `server/prisma/seed.js`. Ran `npx prisma migrate dev --name init_schema` and verified admin seeding (`admin@university.edu`, ID: `cmrlofsrq0000bf7ckzc7euai`) against Railway PostgreSQL.
- **2026-07-15:** Completed Phase 1 Sections 1.2 & 1.3 (Auth & Onboarding Backend Modules). Created `validate.middleware.js`, `auth.middleware.js`, `admin.middleware.js`, `auth.schema.js`, `auth.controller.js`, `auth.routes.js`, `onboarding.schema.js`, `onboarding.controller.js`, `onboarding.routes.js`, and mounted them in `app.js`. Standardized `responseHelper.js` signatures and verified all endpoints via supertest suite (`🎉 ALL AUTH & ONBOARDING ENDPOINTS PASSED WITH 100% SUCCESS!`).

## 4. Open Questions / Known Issues
- None currently. Phase 1 Sections 1.1, 1.2, and 1.3 complete and verified. Ready for Sections 1.4 & 1.5.
