# SportHub Vercel Migration — Phase 2a: Customer Foundation + HomePage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port customer-facing foundation (Navbar, LanguageSwitcher, Badge, ProtectedRoute) + HomePage + Courts API to Next.js. Customer can browse courts after Phase 2a.

**Architecture:**
- New Next.js app at repo root (Phase 1 already shipped)
- Public courts API (listCourts, getCourt, getCourtAvailability)
- Customer pages use Client Components + TanStack Query
- ProtectedRoute is a Client Component wrapper (Zustand-based, matches old pattern)
- Admin protection deferred to Phase 3

**Tech Stack:** Next.js 15, React 18, TanStack Query 5, framer-motion, lucide-react, Zod 3, Prisma 5

**Estimated time:** 3-4 hours

**Scope NOT in this plan (deferred):**
- BookingFlow (Phase 2b)
- BookingSuccessPage (Phase 2b)
- Admin pages (Phase 3)
- Polling for slot availability (Phase 4)
- Admin court CRUD endpoints (Phase 3)

---

## Pre-flight: Worktree Setup

- [ ] **Step 0.1: Create worktree via superpowers:using-git-worktrees skill**

Branch: `vercel-migration-02a-homepage`. Worktree at `.claude/worktrees/vercel-migration-02a-homepage/`.

- [ ] **Step 0.2: Verify worktree on main HEAD (Phase 1 merged)**

```bash
git log --oneline -3
```
Expected: HEAD is `88bee93 chore: gitignore` (or later) — the Phase 1 merge must be in this branch's history.

- [ ] **Step 0.3: Install deps + verify baseline**

```bash
npm install
npx prisma generate
npx tsc --noEmit && echo "TYPECHECK OK"
```

Expected: all succeed. If typecheck fails, baseline is broken — stop and report.

---

## Phase A: Shared Components

### Task 1: Port Badge component

**Files:** `components/Badge.tsx` (port from `client/src/components/Badge.tsx`)

- [ ] **Step 1.1: Read source**

Open `client/src/components/Badge.tsx` (42 lines). Note its props, className patterns, any imports.

- [ ] **Step 1.2: Copy file**

```bash
cp client/src/components/Badge.tsx components/Badge.tsx
```

- [ ] **Step 1.3: Verify imports work**

Open `components/Badge.tsx`. If it imports anything (probably no imports for Badge — it's pure className), no path changes needed.

- [ ] **Step 1.4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: passes.

- [ ] **Step 1.5: Commit**

```bash
git add components/Badge.tsx
git commit -m "feat(vercel): port Badge component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 2: Port LanguageSwitcher component

**Files:** `components/LanguageSwitcher.tsx` (port from `client/src/components/LanguageSwitcher.tsx`)

The old LanguageSwitcher uses `react-i18next` and `react-router-dom`. Port to use next-intl helpers.

- [ ] **Step 2.1: Read source**

Open `client/src/components/LanguageSwitcher.tsx` (74 lines). Identify hooks used (useNavigate, useParams, useTranslation), dropdown UI structure.

- [ ] **Step 2.2: Write components/LanguageSwitcher.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/src/i18n/navigation';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { SUPPORTED_LANGS, LANG_LABELS, LANG_FLAGS, type SupportedLang } from '@/src/i18n/routing';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ lang: string }>();
  const currentLang = (params?.lang ?? 'en') as SupportedLang;
  const [open, setOpen] = useState(false);

  const handleSelect = (lang: SupportedLang) => {
    setOpen(false);
    router.replace(pathname, { locale: lang });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all"
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Globe size={16} className="text-ink-muted" />
        <span className="text-xs font-bold text-ink uppercase tracking-wider">{currentLang}</span>
        <ChevronDown size={14} className={`text-ink-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-surface border border-border rounded-xl shadow-sport overflow-hidden"
            >
              {SUPPORTED_LANGS.map((lang) => {
                const isActive = lang === currentLang;
                return (
                  <li key={lang} role="option" aria-selected={isActive}>
                    <button
                      onClick={() => handleSelect(lang)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                        isActive ? 'bg-primary/5 text-primary font-bold' : 'text-ink hover:bg-surface-muted'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden>{LANG_FLAGS[lang]}</span>
                        <span>{LANG_LABELS[lang]}</span>
                      </span>
                      {isActive && <Check size={14} />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Key changes from old:
- `useNavigate` → `useRouter` from `@/src/i18n/navigation` (locale-aware)
- `useParams` from `next/navigation` (current locale)
- `useTranslation` not needed (uses LANG_LABELS/FLAGS constants)
- `router.replace(pathname, { locale: lang })` — next-intl signature for locale switching

- [ ] **Step 2.3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 2.4: Commit**

```bash
git add components/LanguageSwitcher.tsx
git commit -m "feat(vercel): port LanguageSwitcher with next-intl router

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase B: Auth Middleware Helper

### Task 3: Write auth-middleware helper for protected API routes

**Files:** `src/lib/auth-middleware.ts`

This wraps Next.js route handlers, verifies JWT, attaches user to request context. Will be used by Phase 2b (bookings) and Phase 3 (admin) routes.

- [ ] **Step 3.1: Write src/lib/auth-middleware.ts**

```typescript
import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/src/lib/jwt';
import { AppError } from '@/src/lib/api-response';

export interface AuthContext {
  userId: string;
  role: string;
  name: string;
}

const ROLE_RANK: Record<string, number> = {
  guest: 0,
  member: 1,
  staff: 2,
  admin: 3,
  super_admin: 4,
};

export function getAuthContext(req: NextRequest): AuthContext {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Thiếu access token');
  }
  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  return { userId: payload.id, role: payload.role, name: payload.name };
}

export function requireMinRole(ctx: AuthContext, minRole: 'member' | 'staff' | 'admin' | 'super_admin'): void {
  const userRank = ROLE_RANK[ctx.role] ?? 0;
  const requiredRank = ROLE_RANK[minRole] ?? 0;
  if (userRank < requiredRank) {
    throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
  }
}
```

Usage pattern in routes:

```typescript
export async function GET(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);             // Throws 401 if no/bad token
    requireMinRole(ctx, 'admin');                 // Throws 403 if insufficient role
    // ... protected logic
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 3.2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3.3: Commit**

```bash
git add src/lib/auth-middleware.ts
git commit -m "feat(vercel): add auth-middleware helper for protected routes

getAuthContext(req) extracts and verifies Bearer token.
requireMinRole(ctx, role) enforces role hierarchy.
Both throw AppError, handled by handleError().

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 4: Write client-side ProtectedRoute wrapper

**Files:** `components/ProtectedRoute.tsx`

Mirrors the old client/src/components/ProtectedRoute.tsx but uses next/navigation.

- [ ] **Step 4.1: Write components/ProtectedRoute.tsx**

```tsx
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/src/lib/auth-store';

type Role = 'guest' | 'member' | 'staff' | 'admin' | 'super_admin';

const ROLE_RANK: Record<Role, number> = {
  guest: 0,
  member: 1,
  staff: 2,
  admin: 3,
  super_admin: 4,
};

interface Props {
  children: ReactNode;
  requiredRole?: Role;
}

export default function ProtectedRoute({ children, requiredRole = 'member' }: Props) {
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace(`/${lang}/login`);
      return;
    }
    const userRank = ROLE_RANK[user.role as Role] ?? 0;
    const requiredRank = ROLE_RANK[requiredRole] ?? 0;
    if (userRank < requiredRank) {
      router.replace(`/${lang}`);
    }
  }, [isAuthenticated, user, requiredRole, router, lang]);

  if (!isAuthenticated || !user) return null;
  const userRank = ROLE_RANK[user.role as Role] ?? 0;
  if (userRank < (ROLE_RANK[requiredRole] ?? 0)) return null;

  return <>{children}</>;
}
```

Note: Server-side protection would be more secure (middleware-based), but the old client pattern was Zustand-based. Keeping the same pattern for compat. Truly sensitive data should be gated server-side at the API route level (via `getAuthContext`).

- [ ] **Step 4.2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4.3: Commit**

```bash
git add components/ProtectedRoute.tsx
git commit -m "feat(vercel): port ProtectedRoute as Client Component wrapper

Uses next/navigation router + useAuthStore. Locale-aware redirects.
Server-side API gating handled separately by auth-middleware.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase C: Navbar

### Task 5: Port Navbar (with LanguageSwitcher integrated)

**Files:** `components/Navbar.tsx` (port from `client/src/components/Navbar.tsx`)

- [ ] **Step 5.1: Write components/Navbar.tsx**

```tsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/src/i18n/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogOut, LayoutDashboard, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/src/lib/auth-store';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const t = useTranslations();
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.92)'],
  );

  const boxShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 0 0 0 rgba(0,0,0,0)', '0 4px 16px -2px rgba(15, 23, 42, 0.08)'],
  );

  const handleLogout = () => {
    logout();
    router.push(`/${lang}/login`);
  };

  return (
    <motion.nav
      style={{ backgroundColor, boxShadow, backdropFilter: 'blur(12px)' }}
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center px-4 md:px-6 border-b border-border/60"
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="SportHub home">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-sport"
          >
            <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </motion.div>
          <span className="text-xl font-display font-bold text-ink tracking-tight">
            Sport<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link href="/" className="text-ink-muted hover:text-ink text-sm font-semibold transition-colors">
            {t('nav.home')}
          </Link>
          <Link href="/book" className="text-ink-muted hover:text-ink text-sm font-semibold transition-colors">
            {t('nav.bookNow')}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-ink leading-none">{user.name}</span>
                <span className="text-[10px] text-primary uppercase tracking-[0.15em] font-bold mt-1">
                  {user.role}
                </span>
              </div>

              {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') && (
                <a
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-surface border border-border text-ink-muted hover:text-primary hover:border-primary/40 transition-all"
                  aria-label={t('nav.dashboard')}
                  title={t('nav.dashboard')}
                >
                  <LayoutDashboard size={18} />
                </a>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-surface border border-border text-ink-muted hover:text-accent hover:border-accent/40 transition-all"
                aria-label={t('nav.logout')}
                title={t('nav.logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm px-4 py-2">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
```

Key changes:
- All `<Link to=...>` → `<Link href=...>` from `@/src/i18n/navigation` (locale-aware)
- `<a href="/admin/dashboard">` for admin (NOT i18n Link — admin is outside [lang])
- `useTranslation()` → `useTranslations()`
- `useNavigate` → `useRouter`

- [ ] **Step 5.2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5.3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat(vercel): port Navbar with LanguageSwitcher

- Uses next-intl Link (locale-aware) for customer routes
- Plain <a> for /admin/dashboard (outside [lang] segment)
- Logout redirects to localized /login

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase D: Courts API

### Task 6: Port courts API endpoints (read-only)

**Files:**
- `app/api/courts/route.ts` — GET (list)
- `app/api/courts/[id]/route.ts` — GET (one)
- `app/api/courts/[id]/availability/route.ts` — GET (slot availability)

Admin CRUD endpoints (POST/PATCH/DELETE) deferred to Phase 3.

Source: `server/src/controllers/courts.controller.ts` lines 18-123.

- [ ] **Step 6.1: Write app/api/courts/route.ts**

```typescript
import { NextRequest } from 'next/server';
import { Prisma, CourtStatus, SportType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const sport = req.nextUrl.searchParams.get('sport');
    const indoor = req.nextUrl.searchParams.get('indoor');
    const status = req.nextUrl.searchParams.get('status') ?? 'active';

    const where: Prisma.CourtWhereInput = {
      ...(indoor !== null ? { isIndoor: indoor === 'true' } : {}),
    };

    if (sport) {
      const sportMap: Record<string, SportType> = {
        Tennis: SportType.Tennis,
        Pickleball: SportType.Pickleball,
        Badminton: SportType.Badminton,
      };
      if (sportMap[sport]) where.sport = sportMap[sport];
    }

    const statusMap: Record<string, CourtStatus> = {
      active: CourtStatus.active,
      maintenance: CourtStatus.maintenance,
      inactive: CourtStatus.inactive,
    };
    where.status = statusMap[status] ?? CourtStatus.active;

    const courts = await prisma.court.findMany({ where, orderBy: { name: 'asc' } });

    return NextResponse.json({ success: true, data: courts, meta: { total: courts.length } });
  } catch (err) {
    return handleError(err);
  }
}
```

Note: returns `{success, data, meta}` (matches Express response shape — has `meta` outside `data` wrapper).

- [ ] **Step 6.2: Write app/api/courts/[id]/route.ts**

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { ok, AppError, handleError } from '@/src/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new AppError(400, 'BAD_REQUEST', 'ID không hợp lệ');

    const court = await prisma.court.findUnique({ where: { id } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    return ok(court);
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 6.3: Write app/api/courts/[id]/availability/route.ts**

```typescript
import { NextRequest } from 'next/server';
import { BookingStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const ALL_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const courtId = parseInt(idStr, 10);
    if (Number.isNaN(courtId)) throw new AppError(400, 'BAD_REQUEST', 'ID không hợp lệ');

    const date = req.nextUrl.searchParams.get('date');
    if (!date) throw new AppError(400, 'BAD_REQUEST', 'Vui lòng cung cấp ngày');

    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(date),
        status: { notIn: [BookingStatus.cancelled, BookingStatus.rejected] },
      },
      select: { startTime: true, durationHours: true },
    });

    const peakStart = parseInt(court.peakStart.split(':')[0], 10);
    const peakEnd = parseInt(court.peakEnd.split(':')[0], 10);

    const slots = ALL_SLOTS.map((time) => {
      const hour = parseInt(time.split(':')[0], 10);
      const isPeak = hour >= peakStart && hour < peakEnd;

      const isBooked = bookings.some((b) => {
        const bStart = parseInt(b.startTime.split(':')[0], 10);
        const bEnd = bStart + parseFloat(b.durationHours.toString());
        return hour >= bStart && hour < bEnd;
      });

      return {
        time,
        duration: 60,
        available: !isBooked,
        isPeak,
        price: isPeak ? court.pricePeak : court.priceNormal,
      };
    });

    return ok({ courtId, date, slots });
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 6.4: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6.5: Smoke test**

```bash
(npm run dev > /tmp/test-task6.log 2>&1 &)
sleep 8

# List courts
echo "=== GET /api/courts ==="
curl -s http://localhost:3000/api/courts | head -c 300

# Single court (try id=1, may 404 if no seed data — that's fine)
echo
echo "=== GET /api/courts/1 ==="
curl -s http://localhost:3000/api/courts/1 -w "\n[HTTP %{http_code}]\n" | head -c 300

# Availability
echo "=== GET /api/courts/1/availability?date=2026-05-20 ==="
curl -s "http://localhost:3000/api/courts/1/availability?date=2026-05-20" -w "\n[HTTP %{http_code}]\n" | head -c 400

pkill -f "next dev" 2>/dev/null
```

Expected: list returns `{success:true, data:[], meta:{total:0}}` if no seed; or array of courts if seeded. 404 for nonexistent ID. Availability returns 14 slots if court 1 exists.

- [ ] **Step 6.6: Commit**

```bash
git add app/api/courts
git commit -m "feat(vercel): port public courts API routes

- GET /api/courts (list with sport/indoor/status filter)
- GET /api/courts/:id (single court)
- GET /api/courts/:id/availability?date=... (slot grid)

Admin CRUD endpoints deferred to Phase 3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 7: Port courtsApi client helper

**Files:** `src/lib/api/courts.ts`

- [ ] **Step 7.1: Read source**

```bash
cat client/src/api/courts.ts
```

- [ ] **Step 7.2: Copy + fix imports**

```bash
cp client/src/api/courts.ts src/lib/api/courts.ts
```

Open the new file. Fix imports:
- `import apiClient from './client'` → `import apiClient from '@/src/lib/api-client'`
- `import type { Court } from '../types'` → `import type { Court } from '@/src/types'`

- [ ] **Step 7.3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 7.4: Commit**

```bash
git add src/lib/api/courts.ts
git commit -m "feat(vercel): port courtsApi client helper

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase E: HomePage

### Task 8: Port HomePage

**Files:** `app/[lang]/page.tsx` (REPLACE current placeholder)

Current `app/[lang]/page.tsx` is the i18n placeholder from Task 3 of Phase 1. Replace with the full HomePage.

Source: `client/src/pages/customer/HomePage.tsx` (452 lines).

- [ ] **Step 8.1: Read source carefully**

Open `client/src/pages/customer/HomePage.tsx` and understand:
- It uses `useState`, `useNavigate`, `useParams`, `useTranslation`, `useQuery`
- It imports Navbar, Spinner, courtsApi
- It defines `SPORTS` constant with icons
- It has hero section, features, courts grid, CTA

- [ ] **Step 8.2: Port the page**

Apply same transformations as Phase 1 pages:
- Add `'use client'` at top
- `useNavigate` → `useRouter` from `next/navigation`
- `useParams` from `next/navigation`
- `Link` from `@/src/i18n/navigation`
- `useTranslation()` → `useTranslations()`
- Import paths: `../../components/Navbar` → `@/components/Navbar`, `../../api/courts` → `@/src/lib/api/courts`, `../../types` → `@/src/types`

Write to `app/[lang]/page.tsx`. The file is ~452 lines — copy verbatim with the transformations above.

Key spots to check:
- All `<Link to=...>` become `<Link href=...>` 
- All `t('key')` calls work
- `useQuery({ queryKey: ['courts', ...], queryFn: ... })` — wrap entire app in QueryClientProvider (see Step 8.3)
- `navigate(\`/\${lang}/book\`)` → `router.push(\`/\${lang}/book\`)` OR use next-intl router and just `'/book'`

- [ ] **Step 8.3: Set up TanStack Query provider**

Create `components/QueryProvider.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

Update `app/[lang]/layout.tsx` to wrap children in QueryProvider:

Open the current `app/[lang]/layout.tsx`. After NextIntlClientProvider, wrap children with `<QueryProvider>`:

```tsx
import QueryProvider from '@/components/QueryProvider';

// Inside the return:
<NextIntlClientProvider messages={messages} locale={lang}>
  <QueryProvider>
    {children}
  </QueryProvider>
</NextIntlClientProvider>
```

- [ ] **Step 8.4: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 8.5: Smoke test**

Make sure DB has at least some seed data (or accept empty list).

```bash
# Optional: seed DB
npm run db:seed

# Start server
(npm run dev > /tmp/test-task8.log 2>&1 &)
sleep 8

# Visit homepage
echo "=== /en (HomePage) ==="
curl -sI http://localhost:3000/en | head -3
echo

# Verify HomePage renders translated content
curl -s http://localhost:3000/en | grep -c "heroTitle\|nav.home\|nav.bookNow"

# Try /vi
echo "=== /vi (HomePage) ==="
curl -sI http://localhost:3000/vi | head -3

pkill -f "next dev" 2>/dev/null
```

Expected: 200 OK, HomePage renders, has Navbar + Hero section.

- [ ] **Step 8.6: Browser test (if Playwright available)**

Visit http://localhost:3000/en. Verify:
- Page loads
- Navbar is fixed at top
- LanguageSwitcher works (click → dropdown → select VI → URL changes to /vi)
- Courts grid shows (empty or with seeded data)
- "Book Now" button visible

If browser test not available, rely on Step 8.5.

- [ ] **Step 8.7: Commit**

```bash
git add app/\[lang\]/page.tsx app/\[lang\]/layout.tsx components/QueryProvider.tsx
git commit -m "feat(vercel): port HomePage with TanStack Query setup

- Add QueryProvider wrapper in [lang]/layout
- HomePage uses useQuery for courts list
- Hero, sports selector, courts grid all functional

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase F: Verification

### Task 9: End-to-end verification

- [ ] **Step 9.1: Typecheck**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 9.2: Lint**

```bash
npm run lint
```
Expected: passes.

- [ ] **Step 9.3: Production build**

```bash
npm run build
```
Expected: build completes. All 5 locale homepages should be marked static (or dynamic depending on TanStack Query setup).

- [ ] **Step 9.4: Browser smoke test**

```bash
npm run dev
```

Manual checks:
1. Visit `http://localhost:3000` → redirects to `/en`
2. HomePage shows: Navbar with logo + nav links + LanguageSwitcher + Login button
3. Click LanguageSwitcher → switches to /vi, all UI strings translate
4. Login (Phase 1 flow) → redirects back to HomePage with user info in Navbar
5. Logout → returns to login page in current locale
6. Visit `/en/book` → 404 (BookingFlow is Phase 2b) — that's expected

Stop dev server.

- [ ] **Step 9.5: Run review-agent on entire Phase 2a**

Dispatch the review-agent for code quality + security review of the changes since Phase 1 merge (base SHA = `88bee93` or latest main HEAD, head SHA = current commit).

- [ ] **Step 9.6: Apply review fixes if any**

If reviewer flags Critical or Important issues, fix them in additional commits.

---

## Done Criteria

✅ Phase 2a complete when:
- `npm run dev` starts and serves
- `/en`, `/vi`, `/ko`, `/ja`, `/ru` all render HomePage with Navbar
- LanguageSwitcher works (URL changes, UI text translates)
- `GET /api/courts` returns courts list
- `GET /api/courts/:id` returns single court (or 404)
- `GET /api/courts/:id/availability?date=...` returns slot grid
- Auth-aware Navbar (shows user info when logged in)
- Logout works (clears tokens, redirects to login)
- `npx tsc --noEmit` passes
- `npm run build` completes
- `client/` and `server/` untouched

## Next Plan Preview

**Phase 2b — Booking Flow:**
- Modal, PriceBreakdown, TimeSlotGrid shared components
- bookings API (create, list, get, update status)
- plans API (list plans, get plan details)
- payments API (initiate VNPay/MoMo, status check)
- BookingFlow page (slot selection, summary, payment)
- BookingSuccessPage
- TanStack Query refetchInterval for slot availability (polling — Phase 4 will optimize to SSE)
