# SportHub - Project Context

## Project Overview
SportHub is a sports court booking platform (React + Vite + TypeScript + Tailwind CSS client, Node.js server). Monorepo with `client/` and `server/` workspaces.

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
- **Client:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, react-router-dom, framer-motion, react-i18next
- **Server:** Node.js (see server/ for details)
- **Monorepo:** npm workspaces
