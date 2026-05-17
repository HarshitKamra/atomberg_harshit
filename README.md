# AtomGoals — In-House Goal Setting & Tracking Portal

Enterprise-grade goal management platform built for **Atomberg ATOMQUEST Hackathon 1.0**.

## Features

- **Phase 1:** Goal creation, thrust areas, UoM types, weightage validation (100% total, min 10%, max 8 goals), manager approval workflow, shared departmental KPIs
- **Phase 2:** Quarterly check-ins (Q1–Q4), planned vs actual, status tracking, manager comments
- **Progress engine:** Auto-calculated scores per UoM (Min/Max/Timeline/Zero-based)
- **Schedule enforcement:** May (goals), Jul/Oct/Jan/Mar–Apr (check-ins) — bypass with `DEMO_MODE=true`
- **Roles:** Employee, Manager (L1), Admin/HR
- **Analytics:** QoQ trends, thrust area distribution, heatmaps, manager effectiveness
- **Reports:** CSV & Excel export
- **Audit trail:** All changes logged with before/after

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon / Docker locally) |
| ORM | Prisma |
| Auth | NextAuth.js (credentials) |
| Charts | Recharts |

## Quick Start

```bash
npm install

# Start Postgres (Docker) — or use a Neon URL in .env
docker compose up -d

npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Copy `.env.example` → `.env` if you don't have one yet.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@atomberg.com | demo123 |
| Manager | manager@atomberg.com | demo123 |
| Admin | admin@atomberg.com | demo123 |

Use **Quick demo login** buttons on the login page for one-click access.

## Environment Variables

See `.env.example`. Required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (local or Vercel) |
| `NEXTAUTH_SECRET` | Session signing secret |
| `DEMO_MODE` | `true` = all quarterly windows open (demo) |

## Deploy to Vercel (live demo)

**Full step-by-step:** see **[DEPLOY.md](./DEPLOY.md)**

Summary: Neon (free Postgres) → seed DB once → GitHub → Vercel → set env vars → redeploy with `NEXTAUTH_URL`.

## Project Structure

```
src/app/(dashboard)/   # Employee, Manager, Admin pages
src/app/api/           # REST API routes
src/components/        # UI components & goal editor
src/lib/               # Auth, Prisma, progress, schedule
prisma/                # Schema & seed
```

## User Journeys

1. **Employee:** Login → Create goals → Submit → Quarterly check-ins
2. **Manager:** Login → Approve team goals → Conduct check-ins with comments
3. **Admin:** Login → Manage users/cycles → Unlock goals → Export reports → View audit logs

## Architecture

See `/architecture` in the app for ER diagram, tech stack, and feature roadmap.

## License

MIT — Built for Atomberg Hackathon demo purposes.
