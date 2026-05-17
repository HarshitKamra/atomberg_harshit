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
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | NextAuth.js (credentials) |
| Charts | Recharts |

## Quick Start

```bash
# Install dependencies
npm install

# Setup database & seed demo data
npm run db:setup

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@atomberg.com | demo123 |
| Manager | manager@atomberg.com | demo123 |
| Admin | admin@atomberg.com | demo123 |

Use **Quick demo login** buttons on the login page for one-click access.

## Environment Variables

Copy `.env.example` to `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
DEMO_MODE="true"
```

## PostgreSQL (Production)

1. Change `provider` in `prisma/schema.prisma` to `postgresql`
2. Set `DATABASE_URL` to your Postgres connection string
3. Run `npm run db:setup`

Or use Docker:

```bash
docker compose up -d
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. Use Neon/Supabase for PostgreSQL
5. Run migrations: `npx prisma db push`

### Azure

- App Service for Next.js
- Azure Database for PostgreSQL
- Entra ID for SSO (bonus feature)

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
