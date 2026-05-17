# AtomGoals — In-House Goal Setting & Tracking Portal

**Enterprise-grade goal management platform** built for **Atomberg ATOMQUEST Hackathon 1.0**.

A complete digital solution for employee goal setting, quarterly progress tracking, manager approvals, and organizational analytics. Eliminates silos between employees, managers, and HR while providing real-time visibility into goal achievement and performance trends.

---

## 🎯 What This Project Does

AtomGoals is a **full-cycle performance management system** that handles:

1. **Goal Creation (Phase 1)** — Employees define annual goals with validated weightage
2. **Manager Approval** — L1 managers review and approve/reject with inline edits
3. **Quarterly Check-ins (Phase 2)** — Employees log progress; managers add feedback
4. **Progress Scoring** — Auto-calculated achievement scores using 4 measurement types
5. **Departmental KPIs** — Admins push shared goals to multiple employees
6. **Real-time Analytics** — QoQ trends, heatmaps, manager effectiveness dashboards
7. **Audit Trail** — Complete change history with before/after snapshots
8. **CSV/Excel Reports** — Export achievement data for HR reviews

---

## ✨ Key Features

### ✅ **Phase 1 — Goal Creation & Approval**
- Employee interface to create and submit goal sheets
- **8 Thrust Areas:** Revenue Growth, Customer Experience, Operational Excellence, Innovation & Digital, People & Culture, Quality & Compliance, Cost Optimization, Sustainability
- **4 UoM Types:** Numeric, Percentage, Timeline, Zero-based
- **Smart Validation:**
  - Total weightage must equal **exactly 100%**
  - Minimum **10%** weightage per goal
  - Maximum **8 goals** per employee per cycle
- Manager approval workflow with inline target/weightage editing
- Ability to reject with notes — employee can rework
- Goals locked after approval (read-only for employee)
- Shared departmental KPIs — admins push to multiple employees
- Shared goals: targets locked, weightage adjustable

### ✅ **Phase 2 — Quarterly Check-ins**
- Employees log actual achievement vs planned targets
- Status tracking: Not Started / On Track / Completed
- Manager check-in module with structured comments
- **Auto-calculated Progress Scores** using 4 algorithms:
  | UoM Type | Formula | Example |
  |----------|---------|---------|
  | **Min** (higher better) | Achievement ÷ Target × 100 | Sales Revenue |
  | **Max** (lower better) | Target ÷ Achievement × 100 | TAT, Cost |
  | **Timeline** | On-time: 100pts, -5pts/overdue day | Project completion |
  | **Zero-based** | If 0 → 100%, else 0% | Safety incidents |

### ✅ **Schedule Enforcement**
Quarterly windows automatically control when actions are permitted:
| Period | Window Opens | Purpose |
|--------|---|---|
| Goal Setting | May | Create, submit & approve goals |
| Q1 Check-in | July | Progress update |
| Q2 Check-in | October | Progress update |
| Q3 Check-in | January | Progress update |
| Q4/Annual | March-April | Final achievement capture |

**Demo Mode:** Set `DEMO_MODE=true` to bypass schedule and open all windows

### ✅ **Three User Roles**
| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| **Employee** | My Dashboard & Goals | View/edit goals (pre-submit), quarterly check-ins, progress tracking |
| **Manager (L1)** | Team Dashboard | Approve/reject goals, inline editing, conduct check-ins, team analytics |
| **Admin/HR** | HR Dashboard | User management, cycle configuration, unlock goals, export reports, audit logs |

### ✅ **Analytics & Reporting**
- **QoQ Trend Lines** — Average goal achievement across quarters
- **Heatmaps** — Employee × department progress visualization
- **Goal Distribution** — Breakdown by Thrust Area and UoM type
- **Manager Effectiveness** — Check-in completion rate per manager
- **Completion Dashboard** — Real-time % of approved goals
- **CSV/XLSX Export** — Full achievement report for HR review
- **Audit Trail** — Complete change history with timestamps and user attribution

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 + React 18 | Full-stack framework, fast rendering, built-in API routes |
| **Styling** | Tailwind CSS | Utility-first, responsive design, accessible components |
| **Charts** | Recharts | Production-grade analytics, responsive, theme support |
| **Backend** | Next.js API Routes | Serverless, co-located with frontend, minimal deployment overhead |
| **Database** | PostgreSQL | ACID compliance, relational queries, role-based access control |
| **ORM** | Prisma 5.22 | Type-safe queries, schema-driven development, migrations |
| **Authentication** | NextAuth.js 4.24 | JWT sessions, credentials provider, secure by default |
| **Export** | SheetJS (xlsx) | CSV & Excel generation, streaming support |

---

## 📋 Database Schema Overview

### Core Entities
```
User (Employee/Manager/Admin)
├── Department (team assignment)
├── Manager (hierarchy/reporting lines)
├── GoalSheets (1 per user per cycle)
│   ├── Goals (1-8 per sheet)
│   │   ├── QuarterlyCheckIns (Q1-Q4 progress)
│   │   └── SharedGoal reference
│   └── Approver (manager who approved)
├── SharedGoals (departmental KPIs)
│   └── Goals linked across employees
├── AuditLogs (all post-lock changes)
├── Notifications (in-app alerts)
└── Escalations (workflow alerts)

Cycle (annual performance year)
├── CheckInWindows (GOAL_SETTING, Q1-Q4)
└── GoalSheets & SharedGoals (linked to cycle)
```

### Key Relationships
- **User → GoalSheet** (1:many) — One user has multiple goal sheets (one per cycle)
- **GoalSheet → Goal** (1:many) — One sheet contains 1-8 goals
- **Goal → QuarterlyCheckIn** (1:4) — One goal has check-ins for Q1, Q2, Q3, Q4
- **Goal → SharedGoal** (many:1) — Multiple employees can link to same departmental KPI
- **GoalSheet → Approver** (many:1) — Manager who approved the sheet
- **AuditLog** → All entities — Tracks every change post-lock

---

## 🔄 Complete User Workflows

### **Employee Workflow**
```
1. Login (employee@atomberg.com)
   ↓
2. My Dashboard
   • View current cycle & completion rate
   • See pending check-in windows
   • View locked goals
   ↓
3. My Goals & Tasks
   • Create up to 8 goals
   • Select Thrust Area, UoM, Target, Weightage
   • System validates: total = 100%, each ≥ 10%
   • SAVE (draft stored)
   ↓
4. Submit for Approval
   • Once ready, click SUBMIT
   • Goals become SUBMITTED status
   • Manager receives notification
   ↓
5. Wait for Manager Review
   • Dashboard shows "Status: SUBMITTED"
   • Cannot edit once submitted
   ↓
6. Goal Approved or Rejected
   • If APPROVED: Goals locked, notification sent
   • If REJECTED: Receive rejection note, return to DRAFT for rework
   ↓
7. Quarterly Check-ins (Once Approved & Locked)
   • July (Q1): Log actual achievement, status, comments
   • October (Q2): Update progress
   • January (Q3): Update progress
   • March-April (Q4): Final achievement capture
   • System auto-calculates progress score per UoM formula
   ↓
8. View Performance
   • See progress % for each goal
   • View manager comments
   • Check trend across quarters
```

### **Manager Workflow**
```
1. Login (manager@atomberg.com)
   ↓
2. Team Dashboard
   • View all direct reports
   • See goal sheet statuses: DRAFT, SUBMITTED, APPROVED, REJECTED
   • Quick stats: Team size, pending approvals, avg progress
   ↓
3. Goal Approvals
   • See list of SUBMITTED sheets waiting approval
   • Review employee's goals, targets, weightage
   • Option 1: APPROVE
      - Inline edit targets/weightage if needed
      - Validate still = 100% total
      - Click Approve → locked
   • Option 2: REJECT
      - Enter rejection reason
      - Return to DRAFT for rework
   ↓
4. Monitor Team Progress
   • View Q1/Q2/Q3/Q4 check-ins
   • See actual achievement vs targets
   • Add structured comments to check-ins
   • Identify employees at risk
   ↓
5. Team Analytics
   • Department-level progress trends
   • Individual goal distribution
   • Performance vs targets
```

### **Admin Workflow**
```
1. Login (admin@atomberg.com)
   ↓
2. HR Dashboard
   • View org-wide completion rate
   • See goal sheet counts by status
   • Monitor check-in completion %
   ↓
3. Manage Users
   • View all users (Employee/Manager/Admin)
   • Assign managers to employees
   • Manage departments
   ↓
4. Manage Cycles & Windows
   • View current cycle (year)
   • Toggle quarterly windows ON/OFF
   • Manually open/close periods as needed
   ↓
5. Create Shared Goals (Departmental KPIs)
   • Admin or Manager creates shared goal
   • Push to multiple employees
   • Employee can adjust weightage only
   • Primary owner's achievement syncs to all linked goals
   ↓
6. Unlock Goals (Exception Handling)
   • If employee needs to rework after approval
   • Admin unlocks goal sheet
   • Audit log captures unlock reason
   ↓
7. Export Reports
   • Download CSV or XLSX
   • Includes: Employee, Goal, Target, Actual, Achievement %, Status
   • Filter by cycle, department, date range
   ↓
8. View Audit Trail
   • See all changes: who, what, when
   • Before/after snapshots
   • Timestamps for each action
   ↓
9. Analytics
   • QoQ goal achievement trends
   • Heatmaps: employee × department progress
   • Goal distribution by thrust area & UoM
   • Manager effectiveness (% goals approved, check-ins completed)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** & npm
- **PostgreSQL 14+** (or Docker)
- **.env file** with database URL

### Installation

```bash
# 1. Clone and install
git clone <your-repo-url>
cd atomberg
npm install

# 2. Setup database
# Option A: Docker (local PostgreSQL)
docker compose up -d

# Option B: Neon (cloud PostgreSQL)
# Copy connection string to .env as DATABASE_URL

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

# 4. Initialize database schema and seed
npm run db:setup

# 5. Start development server
npm run dev
```

**Access:** [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo Credentials

Three pre-configured user accounts for quick testing:

| Role | Email | Password | Manager | Team |
|------|-------|----------|---------|------|
| **Employee** | employee@atomberg.com | demo123 | manager@atomberg.com | Engineering |
| **Employee** | employee2@atomberg.com | demo123 | manager@atomberg.com | Engineering |
| **Manager** | manager@atomberg.com | demo123 | — | 2 direct reports |
| **Manager** | manager.sales@atomberg.com | demo123 | — | 1 direct report |
| **Employee** | sales@atomberg.com | demo123 | manager.sales@atomberg.com | Sales |
| **Admin** | admin@atomberg.com | demo123 | — | System access |

**Quick Login:** Click demo role buttons on login page for instant access.

---

## 🎮 How to Test All Features

### **Test 1: Complete Employee Goal Creation & Submission**
```
1. Login: employee@atomberg.com / demo123
2. Go to "My Goals & Tasks"
3. Create 3 goals with different UoMs:
   - Goal 1: Revenue Growth (NUMERIC, MIN) — Target: 100, Weightage: 40%
   - Goal 2: Cost Reduction (NUMERIC, MAX) — Target: 50, Weightage: 35%
   - Goal 3: Project Deadline (TIMELINE) — Deadline: Dec 31, Weightage: 25%
   ✓ Total = 100% (system validates automatically)
4. Click SUBMIT FOR APPROVAL
5. ✓ Status changes to SUBMITTED
6. ✓ Notification sent to manager@atomberg.com
```

### **Test 2: Manager Approval Workflow**
```
1. Login: manager@atomberg.com / demo123
2. Go to "Goal Approvals"
3. ✓ See pending goal sheet from employee@atomberg.com
4. Review goals and click APPROVE
   (Can optionally inline-edit targets/weightage)
5. ✓ Goals locked, status → APPROVED
6. ✓ Notification sent back to employee
```

### **Test 3: Quarterly Check-in**
```
1. Login: employee@atomberg.com / demo123
2. Go to "Quarterly Check-ins"
3. ✓ Can now see approved goals
4. Select Q1 quarter
5. For each goal, enter:
   - Actual Achievement (e.g., 85)
   - Status (On Track / Completed / Not Started)
   - Comment (optional)
6. ✓ System auto-calculates progress score
7. Go to Manager check-in view
8. Manager adds comment: "Great progress!"
9. ✓ Score calculated: 85 ÷ 100 × 100 = 85%
```

### **Test 4: Analytics & Reports**
```
1. Login: admin@atomberg.com / demo123
2. Go to "Analytics"
3. ✓ See QoQ trend line showing Q1 average
4. ✓ View thrust area distribution chart
5. ✓ See UoM type pie chart
6. Go to "Export Reports"
7. Download CSV or XLSX
8. ✓ Contains all goals + achievements for review
```

### **Test 5: Shared Goals (Departmental KPIs)**
```
1. Login: admin@atomberg.com / demo123
2. Go to "Shared Goals"
3. Create: "Improve NPS Score" (PERCENTAGE, target 75%)
4. Assign to multiple employees
5. ✓ Employees see goal in their sheet (weightage adjustable)
6. Primary owner updates: actual = 78%
7. ✓ All linked employees' goals sync to 78%
```

---

## 📐 Validation Rules (Enforced)

### Weightage Validation
```
✓ Total across all goals MUST = 100% (±0.01% tolerance)
✓ Each goal MUST have ≥ 10% weightage
✓ Each goal MUST have ≤ 100% weightage
✓ Maximum 8 goals per employee per cycle
✓ Minimum 1 goal to submit
✗ If validation fails → Cannot submit, clear error shown
```

### Schedule Enforcement
```
✓ Goals can only be created/submitted during "GOAL_SETTING" window (May)
✓ Check-ins can only be submitted during active quarterly window
✓ Demo mode (DEMO_MODE=true) opens all windows
✗ Outside active window → API returns "Window not open" error
```

### Shared Goal Rules
```
✓ Admin/Manager creates shared goal
✓ Employees receive goal with locked target
✓ Employees can adjust only weightage
✓ Primary owner's achievement syncs to all linked copies
✗ Employee cannot edit shared goal title/target
```

---

## 🔌 API Endpoints

### Employee Endpoints
```
POST   /api/goals/save           # Save draft goals
POST   /api/goals/submit         # Submit for manager approval
GET    /api/goals                # Fetch employee's goal sheet
POST   /api/checkins             # Submit quarterly check-in
GET    /api/checkins             # Fetch check-ins by quarter
```

### Manager Endpoints
```
GET    /api/manager/team         # Fetch direct reports + their statuses
POST   /api/manager/approve      # Approve/reject goal sheet
POST   /api/manager/approve      # Add check-in comments
```

### Admin Endpoints
```
GET    /api/admin/users          # List all users
POST   /api/admin/windows        # Toggle quarterly windows
PATCH  /api/admin/windows        # Update window status
GET    /api/admin/shared-goals   # Fetch departmental KPIs
POST   /api/admin/shared-goals   # Create shared goal
POST   /api/admin/unlock         # Unlock goal sheet
GET    /api/audit                # Fetch audit trail
```

### Shared Endpoints
```
GET    /api/analytics            # QoQ trends, heatmaps, manager stats
GET    /api/reports/export       # Export CSV or XLSX
```

---

## 📊 Progress Scoring Formulas

All progress scores auto-calculated on quarterly check-ins:

### 1️⃣ **MIN (Higher is Better)**
Used for: Revenue, Customer Satisfaction, Quality metrics
```
Progress Score = (Actual Achievement ÷ Target) × 100
Capped at 100%

Example:
  Target: 100 units
  Actual: 85 units
  Score: (85 ÷ 100) × 100 = 85%
```

### 2️⃣ **MAX (Lower is Better)**
Used for: Cost, TAT, Error rates
```
Progress Score = (Target ÷ Actual Achievement) × 100
Capped at 100%

Example:
  Target: 4 days TAT
  Actual: 5 days
  Score: (4 ÷ 5) × 100 = 80%
```

### 3️⃣ **TIMELINE (Deadline-based)**
Used for: Project completion, milestones
```
If completion date ≤ deadline: Score = 100%
If completion date > deadline: Score = 100% - (overdue days × 5)
Minimum: 0%

Example:
  Deadline: Dec 31, 2025
  Actual completion: Jan 5, 2026 (5 days late)
  Score: 100 - (5 × 5) = 75%
```

### 4️⃣ **ZERO-BASED (Binary Success)**
Used for: Safety incidents, compliance violations
```
If actual = 0: Score = 100%
If actual ≠ 0: Score = 0%

Example:
  Target: 0 safety incidents
  Actual: 0 incidents
  Score: 100%
```

---

## 📁 Project Structure

```
atomberg/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Role-specific dashboards
│   │   │   ├── employee/         # Employee pages
│   │   │   │   ├── page.tsx      # My Dashboard
│   │   │   │   ├── goals/        # Create/manage goals
│   │   │   │   └── checkins/     # Quarterly check-ins
│   │   │   ├── manager/          # Manager pages
│   │   │   │   ├── page.tsx      # Team Dashboard
│   │   │   │   └── approvals/    # Goal approval workflow
│   │   │   ├── admin/            # Admin pages
│   │   │   │   ├── page.tsx      # HR Dashboard
│   │   │   │   ├── users/        # User management
│   │   │   │   ├── cycles/       # Cycle configuration
│   │   │   │   └── shared-goals/ # Departmental KPIs
│   │   │   ├── analytics/        # Analytics & charts
│   │   │   └── architecture/     # Architecture docs
│   │   ├── api/                  # Backend endpoints
│   │   │   ├── goals/            # Goal CRUD
│   │   │   ├── checkins/         # Check-in CRUD
│   │   │   ├── manager/          # Manager actions
│   │   │   ├── admin/            # Admin actions
│   │   │   ├── analytics/        # Analytics data
│   │   │   ├── audit/            # Audit logs
│   │   │   ├── auth/             # NextAuth
│   │   │   └── reports/          # Export endpoints
│   │   ├── login/                # Login page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home → redirect to login
│   ├── components/
│   │   ├── goals/
│   │   │   └── goal-editor.tsx   # Interactive goal form
│   │   ├── layout/
│   │   │   ├── dashboard-shell.tsx   # Layout wrapper
│   │   │   └── sidebar.tsx           # Navigation
│   │   └── ui/                   # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts               # NextAuth config & session
│   │   ├── auth-options.ts       # NextAuth providers
│   │   ├── goals-service.ts      # Goal business logic
│   │   ├── progress.ts           # Scoring algorithms
│   │   ├── schedule.ts           # Window enforcement
│   │   ├── audit.ts              # Audit logging
│   │   ├── validations.ts        # Weightage validation
│   │   ├── prisma.ts             # ORM singleton
│   │   ├── api.ts                # Response helpers
│   │   ├── db-enums.ts           # Type definitions
│   │   └── utils.ts              # Utilities
│   ├── types/
│   │   └── next-auth.d.ts        # Session type extensions
│   ├── middleware.ts             # Auth middleware
│   └── app/
│       ├── globals.css           # Global styles
│       └── layout.tsx            # Root layout
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Initial data
├── public/                       # Static assets
├── .env.example                  # Environment template
├── docker-compose.yml            # Local PostgreSQL
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🔑 Environment Variables

```bash
# .env (required)
DATABASE_URL=postgresql://user:password@localhost:5432/atomberg_goals
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# .env (optional)
DEMO_MODE=true                    # Open all quarterly windows
NODE_ENV=development              # development | production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# or use any 32+ character random string
```

---

## 🌐 Deployment

### Deploy to Vercel + Neon (Recommended)

**See [DEPLOY.md](./DEPLOY.md) for complete step-by-step guide**

Quick summary:
1. Create Neon PostgreSQL database (free tier)
2. Set `DATABASE_URL` in Vercel environment
3. Push code to GitHub
4. Connect GitHub repo to Vercel
5. Set `NEXTAUTH_SECRET` in Vercel dashboard
6. Deploy — database auto-migrates

---

## ✅ Requirements Checklist (Hackathon Submission)

### Phase 1 — Goal Creation & Approval ✅ COMPLETE
- [x] Employee goal creation interface
- [x] Thrust area selection (8 predefined)
- [x] UoM types: Numeric, %, Timeline, Zero-based
- [x] Target & weightage assignment
- [x] Validation: 100% total, min 10%, max 8 goals
- [x] Manager approval workflow with inline edits
- [x] Rejection with notes & rework capability
- [x] Goals locked on approval
- [x] Shared goals (departmental KPIs)
- [x] Shared goal weightage adjustability

### Phase 2 — Quarterly Check-ins ✅ COMPLETE
- [x] Employee check-in interface per quarter
- [x] Actual achievement logging
- [x] Status: Not Started / On Track / Completed
- [x] Manager check-in comments
- [x] Planned vs actual display
- [x] Progress score auto-calculation (all 4 UOM formulas)

### Schedule Enforcement ✅ COMPLETE
- [x] GOAL_SETTING: May
- [x] Q1: July
- [x] Q2: October
- [x] Q3: January
- [x] Q4: March-April
- [x] Demo mode bypass

### User Roles ✅ COMPLETE
- [x] Employee dashboard & workflows
- [x] Manager dashboard & approvals
- [x] Admin/HR dashboard

### Reporting & Governance ✅ COMPLETE
- [x] Achievement report (CSV)
- [x] Achievement report (XLSX)
- [x] Completion dashboard
- [x] Audit trail with before/after
- [x] Who/what/when tracking

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Development with hot reload
npm run dev

# Production build
npm run build
npm run start

# Database operations
npm run db:setup           # Migrate + seed
npm run db:push            # Migrate schema
npm run db:seed            # Run seed script
```

---

## 📝 Notes for Evaluators

### Known Working Paths

**Employee → Manager Flow (Confirmed Working):**
1. Employee: `sales@atomberg.com` / `demo123`
2. Manager: `manager.sales@atomberg.com` / `demo123`
3. Employee submits goals → Manager sees pending → Can approve

**Why:** This employee-manager pair has the correct relationship in seed data.

### User Manager Assignment

⚠️ **Important:** When creating new employees, ensure they have a manager assigned in the database, otherwise they won't appear in their manager's dashboard.

You can manually assign using Admin panel or by directly updating the database:
```sql
UPDATE "User" SET "managerId" = <manager_id> WHERE email = '<employee_email>';
```

### Demo Mode

For presentations/demos, set `DEMO_MODE=true` in `.env` to:
- Open all quarterly windows (don't wait for specific months)
- Allow goal creation/check-ins anytime
- Test complete workflows in one session

---

## 📞 Support

For issues or questions:
1. Check the `/architecture` page in the app
2. Review this README
3. Check `DEPLOY.md` for deployment issues
4. Examine seed data in `prisma/seed.ts` for test data structure

---

## 📄 License

MIT — Built for Atomberg Hackathon 1.0 demo purposes.
