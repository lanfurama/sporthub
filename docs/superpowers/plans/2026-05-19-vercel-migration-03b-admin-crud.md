# SportHub Vercel Migration — Phase 3b: Admin CRUD Pages Implementation Plan

> Subagent-driven, patterns established from Phase 1+2+3a.

**Goal:** Complete admin pages: Members, Products, Orders, AdminBookPage. Plus admin index + real MemberSearch.

**Estimated time:** 4-5 hours

---

## Pre-flight

- Worktree: `vercel-migration-03b-admin-crud`
- Merge main, install, prisma generate, baseline typecheck.

---

## Task 1: APIs (Members + Products + Orders)

**Files:**
- `app/api/members/route.ts` — GET list (staff+), POST create (admin+)
- `app/api/members/[id]/route.ts` — GET single (auth, owner OR staff+)
- `app/api/members/[id]/credit/route.ts` — POST addCredit (admin+)
- `app/api/products/route.ts` — GET list (public), POST create (admin+)
- `app/api/products/[id]/route.ts` — GET (public), PATCH (admin+), DELETE (admin+)
- `app/api/orders/route.ts` — POST create (optional auth), GET list (staff+)
- `app/api/orders/[id]/route.ts` — GET (auth, owner OR staff+)
- `src/lib/api/members.ts`, `products.ts`, `orders.ts` — client helpers

Port from `server/src/controllers/{members,products,orders}.controller.ts` line-by-line. Use established patterns:
- `getAuthContext` + `requireMinRole` for protected routes
- Zod schemas verbatim
- `ok` / `handleError` / `AppError`
- Next.js 15 async params `{ params }: { params: Promise<{ id: string }> }`

## Task 2: Real MemberSearch + Admin index

**Files:**
- `components/MemberSearch.tsx` — REPLACE the Phase 2b stub
- `app/admin/page.tsx` — redirect to `/admin/dashboard`

MemberSearch source: `client/src/components/MemberSearch.tsx` (113 lines). Transform:
- `'use client'`
- `useTranslation` → `useTranslations` (used in BookingFlow's customer-facing path) — but MemberSearch is also used in admin (English-only). Decide: use `useTranslations` for compatibility; admin pages can pass keys that exist in messages.
- Actually: keep `useTranslations` since it's used by customer BookingFlow. Admin pages will need keys too. Simplest: hardcode admin Strings or add keys.
- Import paths to `@/`

`app/admin/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
export default function AdminIndex() { redirect('/admin/dashboard'); }
```

## Task 3: MembersPage

**File:** `app/admin/members/page.tsx` (port from `client/src/pages/admin/MembersPage.tsx`, 296 lines)

Standard transformations: `'use client'`, `@/` paths, no useTranslation/useRouter/useParams (admin English-only).

## Task 4: ProductsPage

**File:** `app/admin/products/page.tsx` (port from `client/src/pages/admin/ProductsPage.tsx`, 241 lines)

## Task 5: OrdersPage + AdminBookPage

**Files:**
- `app/admin/orders/page.tsx` (213 lines)
- `app/admin/book/page.tsx` (port from `client/src/pages/admin/AdminBookPage.tsx`, 387 lines) — admin booking creation form

AdminBookPage uses MemberSearch + bookingsApi.createAdmin.

## Task 6: Verification

Typecheck + lint + build + smoke test all 5 admin pages + browser test if Playwright available + review-agent.

## Done Criteria

All 5 admin pages render and use their APIs. `/admin` redirects to `/admin/dashboard`. No regressions to Phase 1/2/3a.
