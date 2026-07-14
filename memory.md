# 🧠 Project Memory (`memory.md`)

## 1. Snapshot
- **Current Phase:** Phase 0 — Pre-Development Setup (In Progress)
- **What's Working Right Now:** Initial repository setup with `main` and `dev` branches, root `.gitignore`. Client Vite React app in `/client` building cleanly (`npm run build` verified) with Tailwind CSS v3, shadcn/ui, and configured design tokens (`ink`, `chalk-teal`, `paper`, `deep-ink`, `status-safe`, etc.), Axios `api.js` instance, and base folder structure. Server Node/Express app in `/server` syntax verified (`node --check` verified) with Prisma ORM setup, Upstash Redis client (`redis.js`), rate limiting, centralized error handling (`errorHandler.js`), and base folder structure (`modules/`, `middlewares/`, `config/`, `utils/`).
- **What's Half-Done:** Phase 0 Cloud Setup tasks (creating Railway and Upstash projects, configuring GitHub repo connections, and setting environment variables in dashboards) are pending user execution/verification.

## 2. Decisions Log
- **2026-07-14:** Confirmed project root is `/Users/anirudhbhatia/acadtracker`. Established `memory.md` per instructions before starting Phase 0 setup. Confirmed strict adherence to cloud-first structure (Railway PostgreSQL, Upstash Redis, Vercel/Railway deployment targets) and exact formula/threshold constraints (75% attendance fixed, SGPA=8.45 confirmed test case, 0-credit subject exclusions).
- **2026-07-14:** Used Tailwind CSS v3.4.17 in `/client` to ensure 100% compatibility with `design.md` Section 12 `tailwind.config.js` and `shadcn/ui` base layer styling.

## 3. Changes Log
- **2026-07-14:** Initialized `memory.md` with required four-part structure upon starting Phase 0.
- **2026-07-14:** Created root `.gitignore`, initialized Git repository with `main` and `dev` branches.
- **2026-07-14:** Scaffolded `/client` with React + Vite, installed required dependencies (`react-router-dom`, `zustand`, `axios`, `react-hook-form`, `zod`, `recharts`, `react-big-calendar`, `react-hot-toast`, `lucide-react`, `tailwindcss`, `shadcn/ui`). Configured `tailwind.config.js`, `@/` path aliases (`vite.config.js`, `jsconfig.json`), `api.js`, and base client directories (`components/`, `pages/`, `services/`, `hooks/`, `utils/`, `store/`, `routes/`). Verified production build via `npm run build`.
- **2026-07-14:** Scaffolded `/server` with Node.js + Express, installed required dependencies (`express`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `zod`, `cors`, `dotenv`, `express-rate-limit`, `cookie-parser`, `express-async-errors`, `ioredis`). Created `package.json`, `.env.example`, `config/db.js` (Prisma client), `config/redis.js` (Upstash Redis), `middlewares/errorHandler.js`, `utils/responseHelper.js`, `app.js`, `server.js`, `prisma/schema.prisma`, and base server directories. Verified syntax checks.

## 4. Open Questions / Known Issues
- None currently. Phase 0 code scaffolding complete; waiting for user verification and guidance on Cloud Setup tasks or transition to Phase 1.
