# SportHub - Project Context

## Project Overview
SportHub is a sports court booking platform. **Migration in progress** from Vite + Express monorepo to single Next.js 15 App Router app at repo root (for Vercel deployment).

- **NEW (active):** Next.js 15 + Prisma + next-intl at repo root (Phase 1 + 2a complete and merged to main)
- **OLD (reference only):** `client/` (Vite SPA) and `server/` (Express + Socket.io) — untouched, will be removed at final cutover phase

## Vercel Migration Status

### Phase 1: Foundation + Auth — ✅ COMPLETE (merged to main)
Plan: `docs/superpowers/plans/2026-05-19-vercel-migration-01-foundation.md`

11 commits delivering:
- Next.js 15 App Router at root with Tailwind, TypeScript strict, ESLint
- Prisma at root + DB connection (sslmode=prefer for localhost dev)
- next-intl `/:lang/` routing for 5 locales (en, ko, ja, vi, ru)
- 9 auth Route Handlers ported from Express (register, login, forgot/reset password, refresh, admin login/2FA, Google OAuth)
- Auth helper libs (jwt, otp, sms, oauth, console-wrapper logger, api-response)
- Axios client + Zustand auth store + types
- LoginPage + RegisterPage as Client Components
- All 5 locales render localized HTML; production build passes

**Phase 1 merged.** Verification: typecheck ✓, lint ✓, build ✓, E2E auth flow ✓.

### Phase 2a: Customer Foundation + HomePage — ✅ COMPLETE (merged to main)
Plan: `docs/superpowers/plans/2026-05-19-vercel-migration-02a-customer-homepage.md`

5 commits delivering:
- `components/Badge.tsx` (copied verbatim)
- `components/LanguageSwitcher.tsx` (next-intl router-based dropdown)
- `components/Navbar.tsx` (auth-aware, locale-aware Link)
- `components/ProtectedRoute.tsx` (Client Component wrapper)
- `components/QueryProvider.tsx` (TanStack Query)
- `src/lib/auth-middleware.ts` (getAuthContext + requireMinRole for protected API)
- Public Courts API: `GET /api/courts`, `/api/courts/[id]`, `/api/courts/[id]/availability`
- `src/lib/api/courts.ts` (client helper)
- `app/[lang]/page.tsx` (full HomePage replacing placeholder)
- 6 new `home.*` translation keys added to all 5 locale JSONs
- `{{count}}` → `{count}` ICU conversion for next-intl

Browser E2E verified: locale switching, login round-trip, Navbar auth-aware updates.

### Phase 2a Deferred to Later Phases
- **Courts API filter params** (date/time/duration) — Phase 2b BookingFlow needs them
- **HomePage `today` hydration** — set in `useEffect` to avoid SSG/runtime drift

### Known Issues for Pre-Deploy (Phase 9)
Pre-existing in legacy code, not Phase 1 regressions:
- **Prisma connection pooling** — need PgBouncer or Prisma Accelerate before Vercel serverless deploy
- **No rate limiting** on auth routes (Express had `express-rate-limit` 100/min)
- **SMS `sendSMS` broken** — fetch call sends no body/params; never delivers OTP. Will block 2FA + password-reset in production.
- **Google OAuth missing CSRF `state` param** — vulnerable to authorization-code injection
- **`JWT_REFRESH_SECRET` missing from `.env.example`** — dev falls back to `JWT_SECRET`, dangerous in prod
- **OTP uses `Math.random()`** instead of `crypto.randomInt` — predictable in theory
- **2FA step 2 not bound to step 1** — accepts `identifier+code` independent of who started flow

### Remaining Phases
- **Phase 2b (next):** BookingFlow + BookingSuccessPage + Modal + PriceBreakdown + TimeSlotGrid + bookings/plans/payments API + polling for slot availability
- **Phase 3:** Admin pages (dashboard, bookings, members, products, orders, AdminLayout, MemberSearch, Table, StatCard, ChartCard) + admin-only API endpoints
- **Phase 4:** Replace Socket.io broadcasts with polling via TanStack Query (refetchInterval)
- **Phase 9:** Pre-deploy hardening (Prisma connection pool, rate limit, SMS fix, OAuth CSRF state, OTP crypto.randomInt, JWT_REFRESH_SECRET) + Vercel deploy config
- **Phase 10:** Cutover — delete `client/` and `server/`

### Key Decisions
- **Single Next.js app at repo root** (not monorepo workspace) — simplest for Vercel deployment
- **Root layout returns `children` directly** — `app/[lang]/layout.tsx` owns `<html lang={lang}><body>` to set locale dynamically per request
- **localStorage keys preserved** (`sporthub_token`, `sporthub_auth`) — don't break flow when old client still accessible
- **2-stage migration** — Stage 1 = Next.js + polling (deploy-ready); Stage 2 = SSE realtime + production hardening
- **PostgreSQL on user's own server** — not Neon/Vercel Postgres. Needs SSL + PgBouncer for production

## Legacy i18n Work (old client/, kept for reference)

## i18n Multi-language Feature (In Progress)

### Status Summary
Adding 5-language support (EN default, KO, JA, VI, RU) to customer-facing pages only. Admin pages stay English-only.

### Completed (Tasks 1-10 of 12)
| Task | Status | Commit |
|------|--------|--------|
| 1. Install i18next + config (`i18n/index.ts`, `main.tsx`) | Done | `4155059` |
| 2. English translation file (`en.json`) | Done | `a96b1e9` |
| 3. KO, JA, VI, RU translation files | Done | `b6c7100` |
| 4. LanguageSwitcher component | Done | `16a4f69` |
| 5. App.tsx routing with `/:lang` prefix + LangSync | Done | `b45c6e8` |
| 6. Navbar with LanguageSwitcher + translations | Done | `02090ab` |
| 7. LoginPage + RegisterPage translations | Done | `3acb36b` |
| 8. HomePage translations | Done | `da2c5fb` |
| 9. BookingFlow translations | Done | `f654091` |
| 10. BookingSuccessPage translations | Done | `559f132` |

### Remaining (Next Session)
| Task | Status | What to do |
|------|--------|------------|
| 11. Translate shared components | **NOT STARTED** | Replace `PriceBreakdown.tsx`, `MemberSearch.tsx`, `Badge.tsx`, `Spinner.tsx` with i18n versions. Full code is in plan file. |
| 12. Verify build & test | **NOT STARTED** | Run `npx tsc --noEmit` and `npx vite build` in `client/`, fix any errors. |

### How to Resume
1. Open plan at `docs/superpowers/plans/2026-04-17-i18n-multilang.md` — Tasks 11 and 12 have complete code
2. Task 11: Write 4 component files exactly as specified in plan (they add `useTranslation()` + replace hardcoded strings)
3. Task 12: Run TypeScript check + Vite build, fix any compilation errors
4. After all tasks: run code-reviewer agent on full implementation, then commit

### Key Decisions & Rationale
- **English as default language** — User chose this over Vietnamese (original UI language)
- **URL-based language (`/:lang/`)** — User chose this over localStorage. Enables shareable links in specific language, better SEO
- **Customer pages only** — Admin interface stays English-only per user request. Scope: LoginPage, RegisterPage, HomePage, BookingFlow, BookingSuccessPage, Navbar, shared components
- **react-i18next** — Industry standard for React i18n, good TypeScript support, works with Vite
- **LangSync wrapper component** — Syncs i18n language with URL param. Lives in App.tsx, wraps each customer route
- **LanguageSwitcher on Navbar right side** — Dropdown with flag + native language name, before auth buttons
- **Admin routes unchanged** — No `/:lang` prefix on `/admin/*` routes

### Codebase Review Findings (from review agent)
A review agent analyzed the client codebase and found issues. These were NOT fixed during i18n work (except the `<a href="#">` fix in LoginPage). Address separately:

**High priority:**
- Pricing discount logic hardcoded+duplicated in `BookingFlow.tsx:141-143` and `465` — extract to `utils/pricing.ts`
- `BookingFlow.tsx:122` fetches ALL courts then `find()` — needs `courtsApi.getById()` endpoint
- `catch (err: any)` in 3 files — needs typed error extractor `utils/api-error.ts`

**Medium priority:**
- Design tokens inconsistent in `PriceBreakdown`, `MemberSearch`, `TimeSlotGrid`, `Modal` (old tokens vs dark theme)
- Admin role check duplicated in 3 places — centralize to `utils/roles.ts`
- `HomePage.tsx:100` query `['courts', 'all']` lacks `staleTime`

Full review report is in the conversation history dated 2026-04-17.

## Tech Stack

### New (active development)
- **Framework:** Next.js 15 App Router (single app at repo root)
- **Language:** TypeScript 5.6 strict
- **Styling:** Tailwind CSS 3.4
- **State:** Zustand 5 (with persist middleware)
- **Data:** TanStack Query 5, axios
- **i18n:** next-intl 3.26 (5 locales, URL-prefixed)
- **ORM:** Prisma 5.22 → PostgreSQL (user's own server)
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Zod 3
- **UI:** Radix UI primitives, framer-motion, lucide-react

### Old (reference only — `client/` and `server/`)
- Client: React 18 + Vite + react-router-dom + react-i18next
- Server: Express 4 + Socket.io + Prisma 5
- Both will be deleted at Phase 10 cutover
