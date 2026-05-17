# Deploy AtomGoals to Vercel + Neon (PostgreSQL)

Follow these steps in order. Total time: ~15 minutes.

---

## Part 1 — Neon database (free)

1. Go to [https://neon.tech](https://neon.tech) and sign up (GitHub login is fine).
2. **New Project** → name it `atomberg-goals` → region closest to you.
3. On the dashboard, copy the **connection string** (choose **Prisma** or **URI** format).
   - It looks like:
     ```
     postgresql://neondb_owner:xxxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
4. Keep this tab open — you will paste it into Vercel and use it once locally to seed data.

---

## Part 2 — Seed the production database (once)

On your PC, in the project folder:

```powershell
cd c:\Users\HP\OneDrive\Documents\Desktop\atomberg
```

Temporarily set your Neon URL (replace with your real string):

```powershell
$env:DATABASE_URL="postgresql://YOUR_NEON_CONNECTION_STRING"
npx prisma db push
npm run db:seed
```

You should see: `Seed complete!` and the three demo emails.

> If you skip this step, the live site will build but login/data will fail until tables exist.

---

## Part 3 — Push code to GitHub

```powershell
git init
git add .
git commit -m "AtomGoals portal — ready for Vercel"
git branch -M main
```

Create an empty repo on GitHub (e.g. `atomberg-goals`), then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/atomberg-goals.git
git push -u origin main
```

`.env` is gitignored — secrets stay local.

---

## Part 4 — Vercel deploy

1. Go to [https://vercel.com](https://vercel.com) → **Add New → Project**.
2. Import your GitHub repo.
3. **Environment Variables** (Production):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your **Neon** connection string (same as Part 2) |
| `NEXTAUTH_SECRET` | Long random string (e.g. run `openssl rand -base64 32` in Git Bash, or any 32+ char secret) |
| `NEXTAUTH_URL` | Leave blank for first deploy, then set to `https://YOUR-APP.vercel.app` |
| `DEMO_MODE` | `true` |

4. Click **Deploy** and wait for the build to finish.

---

## Part 5 — Fix auth URL (required)

1. Open your live URL, e.g. `https://atomberg-goals.vercel.app`.
2. Vercel → **Project → Settings → Environment Variables**.
3. Set `NEXTAUTH_URL` to that exact URL (no trailing `/`).
4. **Deployments** → latest → **⋯ → Redeploy**.

Test login: `employee@atomberg.com` / `demo123`.

---

## Local development (optional)

**Option A — Docker Postgres** (matches production engine):

```powershell
docker compose up -d
# .env already points to localhost:5432
npm run db:setup
npm run dev
```

**Option B — Use Neon for local too**

Paste the same Neon `DATABASE_URL` into `.env` and run `npm run dev`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Check Vercel build logs; ensure `DATABASE_URL` is set |
| Login fails on live site | `NEXTAUTH_URL` must match live domain; redeploy |
| No users / DB errors | Run Part 2 (`db push` + `db:seed`) against Neon URL |
| Works locally, not Vercel | Vercel env vars missing or wrong `DATABASE_URL` |

---

## Hackathon submission checklist

- [ ] Live Vercel URL
- [ ] GitHub repo link
- [ ] Demo logins (employee / manager / admin, password `demo123`)
- [ ] Architecture page: `https://YOUR-APP.vercel.app/architecture`
