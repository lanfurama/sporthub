# SportHub Vercel Migration — Phase 3a: Admin Foundation + Dashboard + Bookings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Admin/staff can log in and manage bookings + see dashboard analytics on Next.js. Foundation for remaining admin pages (Phase 3b).

**Architecture:**
- Admin routes live at `/admin/*` (NOT under `[lang]/`) — admin stays English-only per project decision.
- middleware.ts already excludes `/admin` from next-intl handling.
- Admin pages use `<ProtectedRoute requiredRole="staff">` (Client Component wrapper, already in Phase 2a) for the UI gate.
- Admin API routes use `getAuthContext` + `requireMinRole('staff')` from `src/lib/auth-middleware`.
- AdminLayout renders Navbar+Sidebar shell; pages render inside `<Outlet />` equivalent (Next.js layout pattern).

**Estimated time:** 3-4 hours

**Scope NOT in this plan:**
- AdminBookPage (admin creates booking) → Phase 3b
- Members CRUD page + API → Phase 3b
- Products CRUD page + API → Phase 3b
- Orders CRUD page + API → Phase 3b
- Real MemberSearch component → Phase 3b (current stub stays for now)

---

## Pre-flight

- [ ] **Step 0.1: Create worktree**

Branch: `vercel-migration-03a-admin-foundation`. Merge `main` into branch after creation.

```bash
git merge main --no-ff -m "Merge main (Phase 1+2a+2b) into Phase 3a branch"
npm install
cp /Users/bcmac/Desktop/projects/sporthub/.env.local .
npx prisma generate
npx tsc --noEmit && echo "BASELINE OK"
```

---

## Phase A: Admin Shared Components

### Task 1: Port StatCard, ChartCard, Table, AdminSidebar, AdminLayout

**Files:**
- `components/StatCard.tsx` (40 lines)
- `components/ChartCard.tsx` (16 lines)
- `components/Table.tsx` (60 lines — exports `Table`, `TableRow`, `TableCell`)
- `components/AdminSidebar.tsx` (161 lines)
- `app/admin/layout.tsx` (Next.js layout — renders AdminSidebar + children)

- [ ] **Step 1.1: Copy presentational components**

```bash
cp client/src/components/StatCard.tsx components/StatCard.tsx
cp client/src/components/ChartCard.tsx components/ChartCard.tsx
cp client/src/components/Table.tsx components/Table.tsx
```

Add `'use client'` if any has hooks/event handlers. Likely all 3 are pure presentational (just className + children).

- [ ] **Step 1.2: Port AdminSidebar**

```bash
cp client/src/components/AdminSidebar.tsx components/AdminSidebar.tsx
```

Transformations:
- Add `'use client'` at top
- `import { Link, useLocation, useNavigate } from 'react-router-dom'` → `import Link from 'next/link'; import { usePathname, useRouter } from 'next/navigation'`
- `useLocation().pathname` → `usePathname()`
- `useNavigate()` → `useRouter()`; `navigate('/admin/login')` → `router.push('/admin/login')` (or wherever logout redirects)
- `import { bookingsApi } from '../api/bookings'` → `import { bookingsApi } from '@/src/lib/api/bookings'`
- `import { useAuthStore } from '../store/auth.store'` → `import { useAuthStore } from '@/src/lib/auth-store'`
- `<Link to="/admin/dashboard">` → `<Link href="/admin/dashboard">` (next/link uses href, NOT next-intl Link — admin is outside [lang])

The sidebar likely shows a badge with pending bookings count via `bookingsApi.list({status: 'pending'})`. Keep this — admin endpoint now exists in Phase 3a Task 3.

- [ ] **Step 1.3: Write app/admin/layout.tsx (Next.js layout)**

```tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/lib/auth-store';
import { useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

type Role = 'guest' | 'member' | 'staff' | 'admin' | 'super_admin';
const ROLE_RANK: Record<Role, number> = { guest: 0, member: 1, staff: 2, admin: 3, super_admin: 4 };

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/en/login');
      return;
    }
    if ((ROLE_RANK[user.role as Role] ?? 0) < ROLE_RANK.staff) {
      router.replace('/en');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) return null;
  if ((ROLE_RANK[user.role as Role] ?? 0) < ROLE_RANK.staff) return null;

  return (
    <div className="flex min-h-screen bg-bg-page">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-6 md:p-8">{children}</main>
    </div>
  );
}
```

Note: This replaces the old client/src/components/AdminLayout.tsx (which was a 19-line outlet wrapper using react-router). Next.js layouts wrap child routes automatically.

- [ ] **Step 1.4: Typecheck + commit**

```bash
npx tsc --noEmit
git add components/StatCard.tsx components/ChartCard.tsx components/Table.tsx components/AdminSidebar.tsx app/admin/layout.tsx
git commit -m "feat(vercel): port admin shared components + admin layout

- StatCard, ChartCard, Table (presentational, copied verbatim)
- AdminSidebar (next/link + usePathname, links to /admin/* routes)
- app/admin/layout.tsx as Next.js layout (Client Component, role gate)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase B: Admin API Endpoints (Bookings + Analytics)

### Task 2: Extend bookings API for admin scope

**Files to modify/create:**
- `app/api/bookings/route.ts` — UPDATE GET to allow admin to see all bookings (not just own)
- `app/api/bookings/admin/route.ts` — POST createAdminBooking
- `app/api/bookings/[id]/status/route.ts` — PATCH updateBookingStatus

- [ ] **Step 2.1: Update GET /api/bookings to support admin scope**

Currently filters to `customerId: ctx.userId`. Change to:
- If user role >= staff → no customer filter (see all bookings)
- Else → keep `customerId: ctx.userId`

```typescript
// In app/api/bookings/route.ts GET handler, replace:
// const where: Prisma.BookingWhereInput = { customerId: ctx.userId };
// with:
const isAdmin = ['staff', 'admin', 'super_admin'].includes(ctx.role);
const where: Prisma.BookingWhereInput = isAdmin ? {} : { customerId: ctx.userId };
// rest of filters unchanged
```

- [ ] **Step 2.2: Write app/api/bookings/admin/route.ts (createAdminBooking)**

Port from `server/src/controllers/bookings.controller.ts:225-296`. Same pattern as POST /api/bookings but:
- Require `requireMinRole(ctx, 'staff')`
- Uses `AdminBookingSchema` (extends BookingSchema with `payMethod` field)
- Source is `BookingSource.admin`
- Status is `BookingStatus.confirmed` (skip pending)
- Doesn't process guest pass

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BookingSource, BookingStatus, CourtStatus, CreditTxType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';
import { generateRef, checkSlotAvailable, calcPrice } from '@/src/lib/booking-helpers';

const AdminBookingSchema = z.object({
  courtId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(0.5).max(8),
  customer: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^0\d{9}$/),
    email: z.string().email().optional(),
  }),
  memberId: z.string().uuid().optional(),
  useCredit: z.boolean().optional(),
  creditAmount: z.number().int().min(0).optional(),
  payMethod: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');
    const body = await req.json();
    const data = AdminBookingSchema.parse(body);

    const court = await prisma.court.findFirst({ where: { id: data.courtId, status: CourtStatus.active } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    const available = await checkSlotAvailable(data.courtId, data.date, data.time, data.duration);
    if (!available) {
      throw new AppError(409, 'SLOT_NOT_AVAILABLE', `Khung giờ ${data.time} ngày ${data.date} của ${court.name} đã được đặt`);
    }

    let membership = null;
    if (data.memberId) {
      membership = await prisma.membership.findFirst({
        where: { id: data.memberId, status: 'active' },
        include: { planConfig: true },
      });
    }

    const pricing = await calcPrice(court, data.time, data.duration, membership, data.creditAmount);

    let ref = generateRef();
    while (await prisma.booking.findUnique({ where: { ref } })) ref = generateRef();

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          ref,
          courtId: data.courtId,
          customerId: ctx.userId,
          membershipId: data.memberId ?? null,
          customerName: data.customer.name,
          customerPhone: data.customer.phone,
          bookingDate: new Date(data.date),
          startTime: data.time,
          durationHours: data.duration,
          ...pricing,
          payMethod: data.payMethod,
          source: BookingSource.admin,
          status: BookingStatus.confirmed,
          note: data.note,
        },
        include: { court: { select: { name: true } } },
      });

      if (pricing.creditUsed > 0 && membership) {
        await tx.membership.update({
          where: { id: membership.id },
          data: { creditBalance: { decrement: pricing.creditUsed } },
        });
        await tx.creditTransaction.create({
          data: {
            membershipId: membership.id,
            amount: pricing.creditUsed,
            type: CreditTxType.debit,
            referenceType: 'booking',
            referenceId: newBooking.id,
          },
        });
      }

      return newBooking;
    });

    return ok(booking, 201);
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 2.3: Write app/api/bookings/[id]/status/route.ts (updateBookingStatus)**

Port from `server/src/controllers/bookings.controller.ts:375-415`. PATCH method.

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const StatusSchema = z.object({
  status: z.enum([BookingStatus.confirmed, BookingStatus.rejected, BookingStatus.completed] as [BookingStatus, ...BookingStatus[]]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');
    const { id } = await params;
    const body = await req.json();
    const { status, reason } = StatusSchema.parse(body);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    const updated = await prisma.booking.update({
      where: { id },
      data: { status, ...(reason ? { cancelReason: reason } : {}) },
      include: {
        court: { select: { name: true } },
        customer: { select: { email: true } },
      },
    });

    // TODO Phase 9: re-add email confirmation (lib/email.ts not ported yet)

    return ok({ id: updated.id, status: updated.status });
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 2.4: Update src/lib/api/bookings.ts**

Add back the admin methods (deferred in Phase 2b):

```typescript
async createAdmin(data: {
  courtId: number;
  date: string;
  time: string;
  duration: number;
  customer: { name: string; phone: string; email?: string };
  memberId?: string;
  useCredit?: boolean;
  creditAmount?: number;
  payMethod?: string;
  note?: string;
}): Promise<unknown> {
  const res = await apiClient.post('/bookings/admin', data);
  return res.data.data;
},

async updateStatus(
  id: string,
  status: 'confirmed' | 'rejected' | 'completed',
  reason?: string,
): Promise<{ id: string; status: string }> {
  const res = await apiClient.patch(`/bookings/${id}/status`, { status, reason });
  return res.data.data;
},
```

- [ ] **Step 2.5: Typecheck + smoke test**

Smoke test admin booking flow:
1. Register a user
2. Manually promote to staff via Prisma Studio OR directly via SQL/seed
3. Login as staff → get token
4. Test admin endpoints with token

For automated test, skip step 2-3 (no admin user) and just verify endpoints respond with 401/403 for non-admin requests.

- [ ] **Step 2.6: Commit**

### Task 3: Analytics API for Dashboard

**Files:**
- `app/api/analytics/dashboard/route.ts` — GET dashboard data
- `src/lib/api/analytics.ts` — client helper

Source: `server/src/controllers/analytics.controller.ts` — find the `dashboard` function (or whatever returns dashboard data).

- [ ] **Step 3.1: Read source**

```bash
cat server/src/controllers/analytics.controller.ts
cat server/src/routes/analytics.routes.ts
```

The dashboard endpoint returns aggregated data: today's bookings count, revenue, charts, recent bookings, etc.

- [ ] **Step 3.2: Write app/api/analytics/dashboard/route.ts**

Port the dashboard function. Require auth + staff role.

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');
    // ... port logic from server/src/controllers/analytics.controller.ts
    return ok(/* dashboard data */);
  } catch (err) {
    return handleError(err);
  }
}
```

Match the response shape that DashboardPage expects (see client/src/pages/admin/DashboardPage.tsx for the consumed fields).

- [ ] **Step 3.3: Write src/lib/api/analytics.ts**

```bash
cp client/src/api/analytics.ts src/lib/api/analytics.ts
```

Fix imports. Verify the helper matches server response shape.

- [ ] **Step 3.4: Smoke test + commit**

```bash
# Endpoint should require staff auth
curl -sI http://localhost:3000/api/analytics/dashboard | head -3
# Expected: 401 (no auth)
```

---

## Phase C: Admin Pages

### Task 4: Port DashboardPage

**File:** `app/admin/dashboard/page.tsx`

Source: `client/src/pages/admin/DashboardPage.tsx` (209 lines).

- [ ] **Step 4.1: Port the page**

Apply transformations:
- `'use client'` at top
- `useQuery` keeps working (TanStack Query already in Phase 2a)
- `analyticsApi.dashboard()` from `@/src/lib/api/analytics`
- Table from `@/components/Table`
- Badge from `@/components/Badge`
- Spinner from `@/components/Spinner`

No `useRouter`/`useParams` needed (admin doesn't have lang).
No translations (admin is English-only).

- [ ] **Step 4.2: Smoke test**

```bash
# Without auth, should redirect (Client Component layout) OR show empty (depending on render order)
curl -sI http://localhost:3000/admin/dashboard | head -3
# Expected: 200 (renders shell, role gate kicks in client-side)
```

- [ ] **Step 4.3: Commit**

### Task 5: Port AdminBookingsPage (admin bookings management)

**File:** `app/admin/bookings/page.tsx`

Source: `client/src/pages/admin/BookingsPage.tsx` (167 lines).

- [ ] **Step 5.1: Port the page**

Uses:
- `bookingsApi.list({ status, date })` — admin scope (returns all bookings when user is staff+)
- `bookingsApi.updateStatus(id, status, reason)` — admin endpoint added in Task 2
- Filters: status, date
- Table for booking rows
- useMutation for status updates with onSuccess invalidate

Standard transformations: `'use client'`, fix imports.

- [ ] **Step 5.2: Smoke test + commit**

---

## Phase D: Verification

### Task 6: E2E verification

- [ ] **Step 6.1: Typecheck + lint + build**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

- [ ] **Step 6.2: Smoke test all admin routes**

```bash
(npm run dev > /tmp/test.log 2>&1 &)
sleep 10

for ROUTE in /admin /admin/dashboard /admin/bookings; do
  CODE=$(curl -sI http://localhost:3000$ROUTE | head -1 | awk '{print $2}')
  echo "$ROUTE: $CODE"
done

# Admin API requires auth
echo "GET /api/analytics/dashboard (no auth):"
curl -sI http://localhost:3000/api/analytics/dashboard | head -1
echo "POST /api/bookings/admin (no auth):"
curl -sI -X POST http://localhost:3000/api/bookings/admin | head -1

pkill -f "next dev"
```

Expected:
- /admin/* routes: 200 (Client Component shell renders, role gate happens client-side)
- /api/analytics/dashboard, /api/bookings/admin: 401 UNAUTHORIZED

- [ ] **Step 6.3: Browser test (Playwright if available)**

1. Register as customer → cannot access /admin (redirects to /en)
2. Manually promote DB user to 'staff' via Prisma Studio OR seed admin user
3. Login as staff → /admin/dashboard renders + shows stats
4. Navigate to /admin/bookings → see all bookings, can update status

If no admin user available, skip the role-gated parts. Verify role gate redirects work.

- [ ] **Step 6.4: Run review-agent on Phase 3a**

Focus: admin auth gate correctness, race conditions in bookings list (admin sees all), updateBookingStatus authorization.

- [ ] **Step 6.5: Apply fixes if Critical**

---

## Done Criteria

✅ Phase 3a complete when:
- `/admin/dashboard` renders (Client Component, role-gated)
- `/admin/bookings` renders with filters + status update mutation
- Admin API: POST /api/bookings/admin, PATCH /api/bookings/[id]/status work with staff auth
- GET /api/analytics/dashboard works with staff auth
- GET /api/bookings serves admins all bookings (no customer filter)
- typecheck + build pass
- Customer endpoints from Phase 2b still work (no regressions)

## Next Plan Preview

**Phase 3b — Remaining admin pages:**
- Real `components/MemberSearch.tsx` (replaces stub)
- Members API + page (CRUD)
- Products API + page (CRUD)
- Orders API + page (CRUD)
- AdminBookPage (admin creates booking via UI form)
