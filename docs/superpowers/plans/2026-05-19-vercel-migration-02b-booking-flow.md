# SportHub Vercel Migration — Phase 2b: Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Customers can complete the booking flow end-to-end on Next.js: select court+slot → enter info → pay → see success page.

**Architecture:**
- Customer-facing endpoints in Phase 2b. Admin-only endpoints (createAdminBooking, updateBookingStatus) deferred to Phase 3.
- Payment webhooks (VNPay/MoMo) ported verbatim — actual provider integration may need env config in Phase 9.
- Slot availability uses TanStack Query `refetchInterval: 5000` (5-second polling) — replaces Socket.io. Phase 4 may optimize to SSE.

**Tech Stack:** Same as Phase 2a + lib/momo, lib/vnpay (server libs to port).

**Estimated time:** 4-6 hours (BookingFlow is 785 lines — biggest single port in the migration).

**Scope NOT in this plan:**
- Admin booking management (createAdminBooking, updateBookingStatus, listBookings admin view, MemberSearch component) → Phase 3
- Polling optimization (SSE) → Phase 4
- Production payment provider config → Phase 9

---

## Pre-flight

- [ ] **Step 0.1: Create worktree via superpowers:using-git-worktrees skill**

Branch: `vercel-migration-02b-booking`. After creation, merge main into the new branch to pick up Phase 1+2a work (EnterWorktree defaults branch from origin/main, not local main).

```bash
git merge main --no-ff -m "Merge main (Phase 1+2a) into Phase 2b branch"
npm install
cp /Users/bcmac/Desktop/projects/sporthub/.env.local .  # copy from main if needed
npx prisma generate
npx tsc --noEmit && echo "BASELINE OK"
```

---

## Phase A: Shared Components

### Task 1: Port Modal, PriceBreakdown, TimeSlotGrid

**Files:** `components/Modal.tsx`, `components/PriceBreakdown.tsx`, `components/TimeSlotGrid.tsx`

These are small (43/71/65 lines). Mostly presentational; mainly need import path fixes.

- [ ] **Step 1.1: Copy all three files**

```bash
cp client/src/components/Modal.tsx components/Modal.tsx
cp client/src/components/PriceBreakdown.tsx components/PriceBreakdown.tsx
cp client/src/components/TimeSlotGrid.tsx components/TimeSlotGrid.tsx
```

- [ ] **Step 1.2: Add `'use client'` directive**

Open each file. If it has hooks (`useState`, `useEffect`) OR event handlers (`onClick`, etc), add `'use client'` as the FIRST line. Modal definitely needs it (interactive). PriceBreakdown might be presentational only — check. TimeSlotGrid is likely interactive (slot click handlers).

- [ ] **Step 1.3: Fix imports if any**

Check each file for `../` imports. Replace with `@/` style if needed (e.g., `../../types` → `@/src/types`).

- [ ] **Step 1.4: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 1.5: Commit**

```bash
git add components/Modal.tsx components/PriceBreakdown.tsx components/TimeSlotGrid.tsx
git commit -m "feat(vercel): port Modal, PriceBreakdown, TimeSlotGrid

Add 'use client' to interactive components.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase B: Plans API + helper

### Task 2: Port plans API endpoint

**Files:** `app/api/plans/route.ts`, `src/lib/api/plans.ts`

Source: `server/src/controllers/plans.controller.ts` — only one action `listPlans` (~10 lines).

- [ ] **Step 2.1: Read source**

```bash
cat server/src/controllers/plans.controller.ts
cat client/src/api/plans.ts
```

- [ ] **Step 2.2: Write app/api/plans/route.ts**

Port `listPlans` to GET handler. Use same pattern as Phase 2a courts: `try { ... return ok(data); } catch (err) { return handleError(err); }`.

Read the source, replicate logic. Likely just `prisma.plan.findMany()` or similar.

- [ ] **Step 2.3: Write src/lib/api/plans.ts**

```bash
cp client/src/api/plans.ts src/lib/api/plans.ts
```

Fix imports:
- `import apiClient from './client'` → `import apiClient from '@/src/lib/api-client'`
- `import type { Plan } from '../types'` → `import type { Plan } from '@/src/types'`

- [ ] **Step 2.4: Typecheck + smoke test**

```bash
npx tsc --noEmit
(npm run dev > /tmp/test.log 2>&1 &)
sleep 8
curl -s http://localhost:3000/api/plans -w "\n[HTTP %{http_code}]\n" | head -c 300
pkill -f "next dev"
```

Expected: 200, returns array of plans (basic/prime/vip) or empty if DB unseeded.

- [ ] **Step 2.5: Commit**

---

## Phase C: Bookings API (Customer Scope)

### Task 3: Port bookings API endpoints for customers

**Files:**
- `app/api/bookings/route.ts` — POST (create), GET (list — current user's bookings only)
- `app/api/bookings/[id]/route.ts` — GET (get one), DELETE (cancel)
- `src/lib/api/bookings.ts` — client helper

Admin endpoints (`POST /admin`, `PATCH /:id/status`) DEFERRED to Phase 3.

Source: `server/src/controllers/bookings.controller.ts` actions:
- `createBooking` lines 88-224 (customer flow with credit/guest pass logic)
- `listBookings` lines 298-354 (filter by user role)
- `getBooking` lines 355-374
- `cancelBooking` lines 417-end

- [ ] **Step 3.1: Read source carefully**

Read `server/src/controllers/bookings.controller.ts` in full. Pay attention to:
- Zod schemas for create
- Credit calculation logic
- Guest pass logic
- Member discount logic
- Booking ref generation (e.g., "SH123456")
- Error codes and AppError throws

- [ ] **Step 3.2: Write app/api/bookings/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext } from '@/src/lib/auth-middleware';
import { handleError, ok } from '@/src/lib/api-response';
// + Zod schemas + types
// + helper functions for credit/pricing/etc.

export async function POST(req: NextRequest) {
  try {
    // Auth optional? Or required?
    // Read source — customer create might be allowed without auth (guest checkout)
    // ... port createBooking logic
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);  // Require auth
    // Filter bookings by ctx.userId (customer sees own bookings only)
    // Admin/staff get all — but that's Phase 3, so for now: customers only
    // ... port listBookings logic
  } catch (err) {
    return handleError(err);
  }
}
```

Port createBooking logic verbatim. Pay attention to:
- Validation of court availability (overlap check)
- Member membership lookup for discount
- Credit balance deduction
- Guest pass deduction
- Atomic transaction (`prisma.$transaction`)
- Booking ref generation

- [ ] **Step 3.3: Write app/api/bookings/[id]/route.ts**

Port `getBooking` and `cancelBooking`. Both require auth (customer can only see/cancel own bookings).

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    const { id } = await params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy booking');
    // Ownership check: customer sees own only
    if (booking.userId !== ctx.userId && !['admin', 'staff', 'super_admin'].includes(ctx.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Không có quyền xem booking này');
    }
    return ok(booking);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    const { id } = await params;
    // ... port cancelBooking logic
    // Customer can cancel own pending bookings
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 3.4: Write src/lib/api/bookings.ts**

Copy from `client/src/api/bookings.ts`. Replace `any` types with proper types. Fix imports. Remove `createAdmin` and `updateStatus` methods (Phase 3 will add them back).

- [ ] **Step 3.5: Typecheck + smoke test**

Smoke test the create flow (need auth token from register/login first):

```bash
EMAIL="2b+$(date +%s)@example.com"
REG=$(curl -sX POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
TOKEN=$(echo "$REG" | grep -oP '"accessToken":"[^"]+"' | head -1 | cut -d'"' -f4)

# Test booking create (needs court in DB)
curl -sX POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"courtId":1,"date":"2026-05-20","time":"10:00","duration":1,"customer":{"name":"Test","phone":"0901234567","email":"a@b.com"}}' \
  -w "\n[HTTP %{http_code}]\n"

# Test list
curl -s http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n[HTTP %{http_code}]\n"
```

If DB has no courts, expect 404 NOT_FOUND on create — that's OK, validates the auth + structure work.

- [ ] **Step 3.6: Commit**

---

## Phase D: Payments API

### Task 4: Port payment libs + endpoints

Server has `vnpay.ts` and `momo.ts` libs that need porting. Plus 3 endpoints: createPayment, vnpayWebhook, momoWebhook.

**Files:**
- `src/lib/vnpay.ts` (port from `server/src/lib/vnpay.ts`)
- `src/lib/momo.ts` (port from `server/src/lib/momo.ts`)
- `app/api/payments/route.ts` — POST (initiate)
- `app/api/payments/vnpay/webhook/route.ts` — POST
- `app/api/payments/momo/webhook/route.ts` — POST

- [ ] **Step 4.1: Read source**

```bash
ls server/src/lib/{vnpay,momo}.ts
head -50 server/src/lib/vnpay.ts
head -50 server/src/lib/momo.ts
head -100 server/src/controllers/payments.controller.ts
```

Note: VNPay/MoMo signature computation uses HMAC. Production needs real env vars (VNPAY_HASH_SECRET, MOMO_PARTNER_CODE, MOMO_SECRET_KEY, etc.). For dev, port as-is — webhooks may not work without real signatures, but the structure must compile.

- [ ] **Step 4.2: Port vnpay.ts + momo.ts as-is**

```bash
cp server/src/lib/vnpay.ts src/lib/vnpay.ts
cp server/src/lib/momo.ts src/lib/momo.ts
```

Fix imports:
- `from '../config/env'` → use `process.env.X` patterns

- [ ] **Step 4.3: Write app/api/payments/route.ts**

Port `createPayment` from `server/src/controllers/payments.controller.ts:17-70`. Likely takes `{bookingId, method}` and returns redirect URL.

- [ ] **Step 4.4: Write VNPay webhook**

`app/api/payments/vnpay/webhook/route.ts` — GET (VNPay uses GET callback) or POST per source. Read source to confirm.

- [ ] **Step 4.5: Write MoMo webhook**

`app/api/payments/momo/webhook/route.ts` — POST.

- [ ] **Step 4.6: Add payments.ts client helper**

`src/lib/api/payments.ts`:

```typescript
import apiClient from '@/src/lib/api-client';

export const paymentsApi = {
  async create(data: { bookingId: string; method: 'vnpay' | 'momo' }): Promise<{ paymentUrl: string }> {
    const res = await apiClient.post('/payments', data);
    return res.data.data;
  },
};
```

- [ ] **Step 4.7: Typecheck + commit**

Smoke test the createPayment endpoint with a real booking ID (or accept 404 if no booking exists). Webhook endpoints can't be easily smoke-tested without real VNPay/MoMo signatures.

---

## Phase E: BookingFlow Page

### Task 5: Port BookingFlow (785 lines)

This is the biggest single file in the migration. Source: `client/src/pages/customer/BookingFlow.tsx`.

**Approach:** Read source in full, port to `app/[lang]/book/page.tsx` with standard transformations (next-intl Link, useRouter, useTranslations, `'use client'`).

- [ ] **Step 5.1: Read full source**

```bash
cat client/src/pages/customer/BookingFlow.tsx
```

Understand structure:
- 3-step wizard (court info → customer info → confirm)
- Uses URL search params (`useSearchParams`) for courtId/date/time
- Pricing logic (court price, peak/normal, discount, credit, guest pass)
- Member lookup (via MemberSearch — admin-only path, may be conditional)
- Payment method selection
- Submit creates booking + redirects

- [ ] **Step 5.2: Write app/[lang]/book/page.tsx**

Apply standard transformations:
- `'use client'` at top
- `useSearchParams` from `next/navigation`
- `useNavigate` → `useRouter` from `next/navigation`
- `useParams` from `next/navigation`
- `<Link to=>` → `<Link href=>` from `@/src/i18n/navigation`
- `useTranslation()` → `useTranslations()`
- Import paths fixed

Keep ALL business logic verbatim:
- Step state machine
- Customer info form
- Pricing calculations
- Member lookup (if customer-only, skip MemberSearch — it's admin-only)
- Payment method selection
- Submit logic

NOTE: If the source uses `MemberSearch`, decide:
- If it's used in admin booking only → comment out or guard with `user.role === 'admin'`
- If it's used in customer flow → defer to Phase 3 (skip in this plan) OR port MemberSearch too

Read the source — if `MemberSearch` usage is conditional on admin role, just stub it for customer scope.

- [ ] **Step 5.3: Polling setup for slot availability**

In the BookingFlow query for `courtsApi.getAvailability(...)`, add `refetchInterval: 5000`:

```typescript
const { data: availability } = useQuery({
  queryKey: ['availability', courtId, date],
  queryFn: () => courtsApi.getAvailability(courtId!, date),
  enabled: !!courtId && !!date,
  refetchInterval: 5000,  // 5-second polling - replaces socket.io slot.locked/released
  refetchOnWindowFocus: true,
});
```

- [ ] **Step 5.4: Typecheck + smoke test**

```bash
npx tsc --noEmit
(npm run dev > /tmp/test.log 2>&1 &)
sleep 10

# BookingFlow page should render (login required for some steps but page itself should 200)
curl -sI http://localhost:3000/en/book | head -3
curl -sI http://localhost:3000/vi/book | head -3

pkill -f "next dev"
```

Expected: both return 200 (page renders even without query params — would show step 1 with court selector or prompt).

- [ ] **Step 5.5: Commit**

---

## Phase F: BookingSuccessPage

### Task 6: Port BookingSuccessPage

Smaller page (88 lines). Source: `client/src/pages/customer/BookingSuccessPage.tsx`.

- [ ] **Step 6.1: Write app/[lang]/booking/success/page.tsx**

Standard transformations. Page reads `bookingId` from search params, fetches booking details, displays summary.

- [ ] **Step 6.2: Smoke test**

```bash
curl -sI http://localhost:3000/en/booking/success | head -3
```

Page should 200 (even without query params — shows generic success screen or redirects).

- [ ] **Step 6.3: Commit**

---

## Phase G: Verification

### Task 7: End-to-end verification

- [ ] **Step 7.1: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 7.2: Lint**

```bash
npm run lint
```

- [ ] **Step 7.3: Production build**

```bash
npm run build
```

- [ ] **Step 7.4: Full E2E with browser**

If Playwright available, walk through:
1. Visit `/en` (HomePage from Phase 2a)
2. Click a court / sport → navigates to `/en/book?courtId=1&...`
3. Step 1: see court info + availability grid (polling every 5s)
4. Step 2: enter customer info
5. Step 3: confirm + click pay → triggers booking create → redirect to success page (or payment URL)

If Playwright not available, curl-based checks:
```bash
# All routes 200
for ROUTE in /en/book /vi/book /en/booking/success /vi/booking/success; do
  echo "$ROUTE: $(curl -sI http://localhost:3000$ROUTE | head -1 | awk '{print $2}')"
done

# API endpoints respond (with proper auth)
EMAIL="verify+$(date +%s)@example.com"
TOKEN=$(curl -sX POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d "{\"name\":\"V\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" | grep -oP '"accessToken":"[^"]+"' | cut -d'"' -f4)

curl -s http://localhost:3000/api/plans -w "\n[HTTP %{http_code}]\n"
curl -s http://localhost:3000/api/bookings -H "Authorization: Bearer $TOKEN" -w "\n[HTTP %{http_code}]\n"
```

- [ ] **Step 7.5: Run review-agent**

Scope: Phase 2b commits. Focus areas:
- Ownership checks on booking endpoints (customer-only sees own bookings)
- Pricing calculation correctness
- Polling interval reasonable (5s) and stops on unmount
- Payment webhook signature verification (or note as deferred)
- BookingFlow form validation

- [ ] **Step 7.6: Apply review fixes**

Critical → fix and commit. Important → document for Phase 9. Minor → defer.

---

## Done Criteria

✅ Phase 2b complete when:
- `npm run build` passes
- `/en/book`, `/en/booking/success`, `/vi/book`, `/vi/booking/success` all return 200
- `POST /api/bookings` creates a booking (requires auth, fails appropriately if court missing)
- `GET /api/bookings` returns current user's bookings
- `GET /api/bookings/[id]` returns booking with ownership check
- `DELETE /api/bookings/[id]` cancels with ownership check
- `GET /api/plans` returns plans
- `POST /api/payments` initiates payment (may fail without real provider config — that's Phase 9)
- VNPay + MoMo webhook endpoints exist (signature verification still works as in source)
- TimeSlotGrid polls every 5s for slot availability
- Old `client/` and `server/` untouched

## Next Plan Preview

**Phase 3 — Admin Pages:**
- AdminLayout + AdminSidebar
- MemberSearch component
- StatCard, ChartCard, Table components
- Admin pages: Dashboard, Bookings, Book (admin booking flow), Members, Products, Orders
- Admin API endpoints: createAdminBooking, updateBookingStatus, member CRUD, product CRUD, order CRUD, analytics
- All admin routes use auth-middleware with `requireMinRole('staff')` or `'admin'`
