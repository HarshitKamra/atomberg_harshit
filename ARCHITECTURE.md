# AtomGoals — System Architecture Document

## 1. High-Level Architecture Overview

AtomGoals uses a **modern three-tier architecture** deployed on **Vercel (Frontend + Backend) + Neon (Database)**:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│         Web Browser (Employee/Manager/Admin)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Vercel)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Frontend: Next.js 14 + React + Tailwind + Recharts     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Authentication: NextAuth.js (JWT + Credentials)        │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Backend: Next.js API Routes                             │ │
│  │ • Goals Management, Manager Approvals, Admin Functions  │ │
│  │ • Check-ins, Analytics, Reports, Audit Trail            │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Business Logic: Goal Service, Progress Engine, Audit    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         DATA ACCESS LAYER: Prisma ORM                        │
│    Type-safe queries, migrations, schema management          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER (Neon PostgreSQL)                    │
│  User, Department, GoalSheet, Goal, QuarterlyCheckIn,       │
│  SharedGoal, Cycle, CheckInWindow, AuditLog, etc.           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Justification

| Layer | Technology | Why Chosen |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 | Full-stack framework, API routes, SSR/SSG, fast development |
| **UI Framework** | React 18 | Component-based, large ecosystem, team familiarity |
| **Styling** | Tailwind CSS | Utility-first, rapid prototyping, built-in responsive design |
| **Charts** | Recharts | Production-grade, responsive, theme support |
| **Backend** | Next.js API Routes | Serverless, co-located with frontend, no separate server needed |
| **Authentication** | NextAuth.js 4.24 | Industry-standard, JWT support, session management, type-safe |
| **Database** | PostgreSQL | ACID compliance, relational queries, role-based access |
| **ORM** | Prisma 5.22 | Type-safe, schema-driven, auto-migrations, excellent DX |
| **Export** | SheetJS (xlsx) | CSV & XLSX generation, streaming support, widely used |
| **Deployment** | Vercel | Optimized for Next.js, serverless, auto-scaling, CDN |

---

## 3. Frontend Architecture

### 3.1 Page Structure
```
src/app/
├── (dashboard)/                    # Auth-protected layout
│   ├── employee/
│   │   ├── page.tsx               # My Dashboard
│   │   ├── goals/page.tsx          # Create & manage goals
│   │   ├── checkins/page.tsx       # Quarterly check-ins
│   │   └── layout.tsx
│   ├── manager/
│   │   ├── page.tsx               # Team Dashboard
│   │   ├── approvals/page.tsx      # Goal approvals
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── page.tsx               # HR Dashboard
│   │   ├── users/page.tsx          # User management
│   │   ├── cycles/page.tsx         # Cycle configuration
│   │   ├── shared-goals/page.tsx   # Departmental KPIs
│   │   └── reports/page.tsx        # Export reports
│   ├── analytics/page.tsx          # Analytics dashboards
│   ├── architecture/page.tsx       # Architecture docs
│   └── layout.tsx                  # Dashboard shell
├── login/page.tsx                  # Login & quick demo
├── api/                            # Backend routes
├── layout.tsx                      # Root layout
└── page.tsx                        # Home (redirect)
```

### 3.2 Component Hierarchy
```
DashboardShell (Layout Wrapper)
├── Sidebar (Navigation)
│   ├── Role-based menu items
│   └── Quick links
├── Main Content Area
│   ├── GoalEditor (Employee goals)
│   ├── ApprovalWorkflow (Manager)
│   ├── CheckInForm (Progress tracking)
│   ├── Dashboard Cards
│   └── Charts (Recharts)
└── Footer
```

### 3.3 State Management
- **React hooks** (useState, useEffect) — No Redux needed (low complexity)
- **Fetch API** — Client-side API calls
- **NextAuth.js session** — User state via `useSession()`

---

## 4. Backend Architecture

### 4.1 API Routes Organization
```
/api/
├── goals/
│   ├── route.ts          # GET (fetch sheet), POST implicitly via next.js
│   ├── save/route.ts     # POST (save draft)
│   └── submit/route.ts   # POST (submit for approval)
├── checkins/
│   └── route.ts          # GET (fetch by quarter), POST (save check-in)
├── manager/
│   ├── approve/route.ts  # POST (approve/reject sheet)
│   ├── assign-goal/route.ts
│   └── team/route.ts     # GET (direct reports + status)
├── admin/
│   ├── users/route.ts    # GET users
│   ├── windows/route.ts  # GET cycles, PATCH windows
│   ├── unlock/route.ts   # POST (unlock goal sheet)
│   └── shared-goals/route.ts # GET, POST
├── analytics/route.ts    # GET (trends, heatmaps, stats)
├── audit/route.ts        # GET (audit logs)
├── reports/
│   └── export/route.ts   # GET (CSV or XLSX)
└── auth/[...nextauth]/route.ts  # NextAuth provider
```

### 4.2 Request Flow
```
Client Request
    ↓
[Middleware: Auth check + session validation]
    ↓
API Route Handler
    ↓
[requireAuth() — Role-based gating]
    ↓
Business Logic (goals-service, progress engine, etc.)
    ↓
[Validation + Error handling]
    ↓
Prisma ORM → PostgreSQL
    ↓
[Audit logging — if data changed]
    ↓
Response (JSON)
    ↓
Client
```

### 4.3 Authentication Flow
```
1. User enters email/password on /login
   ↓
2. NextAuth.js sends to CredentialsProvider
   ↓
3. Provider queries DB: User.findUnique(email)
   ↓
4. bcryptjs compares password hash
   ↓
5. If valid → Create JWT session
   ↓
6. Store session in secure HTTP-only cookie
   ↓
7. User redirected to dashboard (role-based)
   ↓
8. Session available via getServerSession() in API routes
```

---

## 5. Database Architecture

### 5.1 Schema Overview
```
┌─────────────────────────────────┐
│ User (Employee/Manager/Admin)   │
├─────────────────────────────────┤
│ id, email, password, name       │
│ role, departmentId, managerId   │
│ createdAt, updatedAt            │
└──────────┬──────────────────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌─────────────┐  ┌──────────────┐
│ Department  │  │ GoalSheet    │
├─────────────┤  ├──────────────┤
│ id, name    │  │ id, userId   │
│ createdAt   │  │ cycleId      │
└─────────────┘  │ status*      │
                 │ isLocked     │
                 │ approvedById │
                 └──────┬───────┘
                        │
    ┌───────────────────┼───────────────────┐
    ↓                   ↓                   ↓
┌─────────────┐   ┌──────────────┐   ┌────────────────┐
│ Goal        │   │ Cycle        │   │ SharedGoal     │
├─────────────┤   ├──────────────┤   ├────────────────┤
│ id          │   │ id, year     │   │ id, cycleId    │
│ goalSheetId │   │ name         │   │ thrustArea     │
│ title,desc  │   │ isActive     │   │ title, target  │
│ uomType*    │   │ createdAt    │   │ createdById    │
│ target,weight│   └──────┬───────┘   └────────────────┘
│ isShared    │          │
│ sharedGoalId│          ↓
│ deadline    │   ┌──────────────────┐
│ createdAt   │   │ CheckInWindow    │
└──────┬──────┘   ├──────────────────┤
       │          │ id, cycleId      │
       │          │ period* (Q1-Q4)  │
       │          │ opensMonth       │
       │          │ closesMonth      │
       │          │ isOpen           │
       │          └──────────────────┘
       │
       ↓
┌──────────────────────┐
│ QuarterlyCheckIn     │
├──────────────────────┤
│ id, goalId, quarter* │
│ actualAchievement    │
│ completionDate       │
│ status* (NOT_STARTED │
│          ON_TRACK    │
│          COMPLETED)  │
│ progressScore (auto) │
│ employeeComment      │
│ managerComment       │
│ managerId            │
│ completedAt          │
└──────────────────────┘

Additional Tracking:
┌──────────────────┐     ┌──────────────────┐
│ AuditLog         │     │ Notification     │
├──────────────────┤     ├──────────────────┤
│ id, userId       │     │ id, userId       │
│ entityType       │     │ title, message   │
│ entityId         │     │ link, read       │
│ action*          │     │ createdAt        │
│ beforeData (JSON)│     └──────────────────┘
│ afterData (JSON) │
│ metadata         │     ┌──────────────────┐
│ createdAt        │     │ Escalation       │
└──────────────────┘     ├──────────────────┤
                         │ id, type, userId │
                         │ message, status  │
                         │ escalatedTo      │
                         │ createdAt        │
                         └──────────────────┘

* Enum types: 
  - uomType: NUMERIC | PERCENTAGE | TIMELINE | ZERO_BASED
  - UomDirection: MIN | MAX
  - GoalSheetStatus: DRAFT | SUBMITTED | APPROVED | REJECTED
  - Quarter: Q1 | Q2 | Q3 | Q4
  - PeriodType: GOAL_SETTING | Q1 | Q2 | Q3 | Q4
  - AuditAction: CREATE | UPDATE | DELETE | SUBMIT | APPROVE | REJECT | UNLOCK | CHECK_IN
```

### 5.2 Data Relationships
- **User → Department** (many:1) — Multiple employees in one dept
- **User → Manager** (many:1) — Multiple employees report to one manager
- **User → GoalSheet** (1:many) — One user has 1 sheet per cycle
- **GoalSheet → Goal** (1:many) — One sheet has 1-8 goals
- **Goal → QuarterlyCheckIn** (1:many) — One goal has ≤4 check-ins (Q1-Q4)
- **Goal → SharedGoal** (many:1) — Multiple goals link to same departmental KPI
- **GoalSheet → Approver** (many:1) — Manager who approved
- **Cycle → CheckInWindow** (1:many) — One cycle has 5 windows (GOAL_SETTING + Q1-Q4)

---

## 6. Business Logic Layer

### 6.1 Goals Service (`src/lib/goals-service.ts`)
**Handles:**
- Fetching active cycle
- Creating/retrieving goal sheets
- Shared goal syncing (primary owner updates → all linked copies)

```typescript
getActiveCycle()                    // Get current fiscal year
getOrCreateGoalSheet(userId, cycleId)
syncSharedAchievement(sharedGoalId, quarter, actualValue)
```

### 6.2 Progress Engine (`src/lib/progress.ts`)
**Calculates** progress scores using 4 UoM formulas:

| Type | Formula | Purpose |
|------|---------|---------|
| **MIN** | `(actual ÷ target) × 100` | Higher is better (e.g., revenue) |
| **MAX** | `(target ÷ actual) × 100` | Lower is better (e.g., cost, TAT) |
| **TIMELINE** | `100 if on-time, else 100-(days_late×5)` | Deadline-based |
| **ZERO-BASED** | `100 if actual=0, else 0` | Binary success/failure |

```typescript
calculateProgressScore(input: ProgressInput): number
averageProgress(scores: number[]): number  // QoQ calculations
```

### 6.3 Schedule Enforcement (`src/lib/schedule.ts`)
**Validates** quarterly windows:

```
MAY       → GOAL_SETTING window
JULY      → Q1 Check-in window
OCTOBER   → Q2 Check-in window
JANUARY   → Q3 Check-in window
MARCH/APR → Q4 Check-in window
```

Demo mode (`DEMO_MODE=true`) bypasses schedule.

```typescript
isDemoMode(): boolean
getCurrentPeriod(date): PeriodType | null
isPeriodActive(period, date, windowOverrides): boolean
```

### 6.4 Audit Service (`src/lib/audit.ts`)
**Logs all changes** with before/after snapshots:

```typescript
logAudit({
  userId: string,
  entityType: string,    // "GoalSheet", "Goal", etc.
  entityId: string,
  action: string,        // "SUBMIT", "APPROVE", "REJECT", etc.
  before?: object,       // Before snapshot (JSON)
  after?: object,        // After snapshot (JSON)
  metadata?: object      // Extra context
})
```

### 6.5 Validation Layer (`src/lib/validations.ts`)
**Enforces business rules:**

```
✓ Total weightage = 100% (±0.01% tolerance)
✓ Min 10% per goal
✓ Max 100% per goal
✓ Max 8 goals per sheet
✓ At least 1 goal to submit
```

---

## 7. External Integrations

### 7.1 Vercel Deployment
- **Hosting:** Frontend + Backend as serverless functions
- **Auto-scaling:** Handles traffic spikes
- **CDN:** Global edge caching for static assets
- **Environment variables:** Managed in Vercel dashboard

### 7.2 Neon PostgreSQL
- **Cloud database:** No infrastructure management
- **Free tier:** 3GB storage + 3 branches
- **Connection pooling:** Handles concurrent requests
- **Auto-backups:** Daily snapshots

### 7.3 File Export (SheetJS)
- **CSV:** Comma-separated values (Excel compatible)
- **XLSX:** Microsoft Excel format (modern)
- **Streaming:** Memory-efficient for large datasets

---

## 8. Security Architecture

### 8.1 Authentication
```
User Password
    ↓
bcryptjs hashing (salted, 10 rounds)
    ↓
Compare with DB hash
    ↓
Generate JWT token (NextAuth.js)
    ↓
Store in HTTP-only secure cookie
    ↓
Attach to all API requests automatically
```

### 8.2 Authorization
```
API Route Handler
    ↓
middleware.ts: Session validation
    ↓
requireAuth(roles: ["EMPLOYEE" | "MANAGER" | "ADMIN"])
    ↓
Role mismatch? → 403 Forbidden
    ↓
Role match? → Proceed
```

### 8.3 Data Protection
- **Audit logs:** All post-lock changes tracked
- **Soft deletes:** Retention for compliance
- **RBAC:** Employee sees only own data
- **Manager scoping:** Can't access other departments
- **Admin gating:** Admin-only operations require role check

---

## 9. Deployment Architecture

### 9.1 Development Environment
```
Local machine
├── Node.js + npm
├── PostgreSQL (Docker)
├── Next.js dev server (port 3000)
└── Database migrations via Prisma
```

### 9.2 Production Environment
```
GitHub
  ↓
(Push to main branch)
  ↓
Vercel CI/CD Pipeline
  ├── Install dependencies
  ├── Run build: prisma generate && next build
  ├── Deploy to Vercel edge network
  └── DB migrations (manual or automated)
  ↓
Neon PostgreSQL
  ↓
Live at: https://YOUR_APP.vercel.app
```

### 9.3 Database Migration Strategy
```
1. Dev: npm run db:push (apply schema changes locally)
2. Test: Verify changes work
3. Prod: npm run db:push in Vercel build logs OR manually via Neon dashboard
4. Rollback: Neon branches or manual SQL
```

---

## 10. Data Flow Diagrams

### 10.1 Goal Creation Flow
```
Employee clicks "Create Goal"
         ↓
Form input: Thrust Area, Title, UoM, Target, Weightage
         ↓
POST /api/goals/save
         ↓
Backend validates:
  • Weightage total ≤ 100%
  • Each ≥ 10%
  • Max 8 goals
         ↓
Prisma saves to GoalSheet.goals array
         ↓
Client shows success
         ↓
Employee reviews & clicks "SUBMIT FOR APPROVAL"
         ↓
POST /api/goals/submit
         ↓
Backend validates FULL sheet:
  • Total weightage = 100%
  • Has ≥1 goal
  • Meets schedule window
         ↓
Status changed: DRAFT → SUBMITTED
         ↓
Notification created → sent to manager
         ↓
AuditLog: action = "SUBMIT"
```

### 10.2 Approval Flow
```
Manager views /manager/approvals
         ↓
GET /api/manager/team filters: 
  managerId = session.user.id & status = SUBMITTED
         ↓
Manager sees pending goal sheet
         ↓
Manager clicks APPROVE (or REJECT)
         ↓
POST /api/manager/approve
  ├─ Approving:
  │    └─ Validates weightage still = 100%
  │    └─ GoalSheet: status → APPROVED, isLocked = true
  │    └─ Notification → employee
  │    └─ AuditLog: action = "APPROVE"
  └─ Rejecting:
       └─ GoalSheet: status → REJECTED, isLocked = false
       └─ rejectionNote stored
       └─ Notification → employee
       └─ AuditLog: action = "REJECT"
```

### 10.3 Check-in Flow
```
Employee navigates /employee/checkins
         ↓
Must have: isLocked = true (approved goals only)
         ↓
Select Quarter (Q1, Q2, Q3, Q4)
         ↓
For each approved goal:
  • Enter Actual Achievement
  • Select Status (NOT_STARTED, ON_TRACK, COMPLETED)
  • Add comment (optional)
  • Set completion date (if TIMELINE type)
         ↓
POST /api/checkins
         ↓
Backend:
  • Validates period active (e.g., July for Q1)
  • Calculates progress score per UoM formula
  • Saves QuarterlyCheckIn
  • Auto-syncs shared goals (if primary owner)
  • Logs to AuditLog
         ↓
Manager sees update in check-in dashboard
         ↓
Manager POST /api/checkins → add comment
         ↓
Employee sees manager feedback
```

---

## 11. Scalability Considerations

### 11.1 Database Indexing
Recommended indexes for performance:
```sql
CREATE INDEX idx_user_managerId ON "User"("managerId");
CREATE INDEX idx_goalsheet_userId_cycleId ON "GoalSheet"("userId", "cycleId");
CREATE INDEX idx_goal_goalsheetId ON "Goal"("goalSheetId");
CREATE INDEX idx_checkin_goalId_quarter ON "QuarterlyCheckIn"("goalId", "quarter");
CREATE INDEX idx_auditlog_createdAt ON "AuditLog"("createdAt" DESC);
```

### 11.2 Query Optimization
- Use Prisma `select` to fetch only needed fields
- Batch fetch related data (e.g., include: { goals: true })
- Avoid N+1 queries in loops
- Cache cycle data (rarely changes)

### 11.3 Load Considerations
- **Concurrent users:** Vercel auto-scales (pay-per-request)
- **Database connections:** Neon connection pooling included
- **File exports:** Stream large datasets instead of loading all in memory
- **Analytics queries:** Pagination for large result sets

---

## 12. Monitoring & Logging

### 12.1 Error Handling
- API routes wrap in try-catch
- `handleApiError()` normalizes error responses
- Client shows user-friendly error messages
- Full stack traces logged server-side

### 12.2 Audit Trail
- Every goal/sheet/check-in change logged
- Post-lock changes especially tracked
- Before/after snapshots for troubleshooting
- Queryable via `/api/audit` endpoint

### 12.3 Performance Monitoring
- Use Vercel Analytics (built-in)
- Monitor database query times
- Track API response times
- Alert on high error rates

---

## 13. Architecture Decisions & Trade-offs

| Decision | Chosen | Alternative | Why |
|----------|--------|-------------|-----|
| Hosting | Vercel | AWS EC2 | Optimal for Next.js, lower ops overhead |
| Database | PostgreSQL | MySQL | ACID, JSON support, PostGIS if needed |
| Auth | NextAuth.js | Auth0 | Free, self-hosted, no per-user costs |
| State | React hooks | Redux | Overkill for this complexity |
| Charts | Recharts | D3.js | Faster dev, responsive by default |
| ORM | Prisma | TypeORM | Schema-first, auto-migrations, DX |
| Export | SheetJS | PDF libs | Excel more useful for HR workflows |

---

## 14. Future Enhancement Points

- **Microsoft Entra ID SSO:** Swap CredentialsProvider with Azure AD
- **Email notifications:** Integrate nodemailer for transactional emails
- **Teams bot:** Register bot in Azure, send adaptive cards
- **Background jobs:** Use Vercel Cron for escalation checks
- **Caching:** Redis for session storage + query caching
- **Search:** Algolia or PostgreSQL FTS for goal/employee search
- **Mobile app:** React Native sharing same API

---

## 15. Summary Table

| Aspect | Technology | Version |
|--------|-----------|---------|
| **Frontend** | Next.js | 14.2.35 |
| **React** | React | 18 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Charts** | Recharts | 3.8.1 |
| **Backend** | Next.js API Routes | Built-in |
| **Auth** | NextAuth.js | 4.24.14 |
| **ORM** | Prisma | 5.22.0 |
| **Client** | @prisma/client | 5.22.0 |
| **Database** | PostgreSQL | 14+ |
| **Export** | SheetJS (xlsx) | 0.18.5 |
| **Password Hash** | bcryptjs | 3.0.3 |
| **Deployment** | Vercel | Latest |
| **Environment** | Node.js | 18+ |

---

Generated for: **AtomGoals Portal — Atomberg Hackathon Submission**
