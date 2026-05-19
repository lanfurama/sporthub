# SportHub Vercel Migration — Phase 1: Foundation + Auth (POC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Next.js 15 App Router at project root, migrate Prisma + i18n + auth feature end-to-end. After this plan: dev server runs, user can log in/register via Next.js, foundation ready for migrating remaining features.

**Architecture:**
- Single Next.js 15 App Router app at repo root (replaces Vite client + Express server)
- `next-intl` for `/:lang/` routing (replaces `react-i18next` URL pattern)
- Prisma at root pointing to user's own PostgreSQL server
- Express routes ported to Next.js Route Handlers (`app/api/.../route.ts`)
- Old `client/` and `server/` directories KEPT during this plan (reference material). Cutover in final phase.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Prisma 5, next-intl, zod, bcrypt, jsonwebtoken, framer-motion, lucide-react, axios, Zustand, TanStack Query

**Estimated time:** 4-6 hours

---

## Pre-flight: Worktree Setup

This plan does heavy structural changes. Execute in an isolated git worktree to keep `main` safe until cutover.

- [ ] **Step 0.1: Create worktree using superpowers:using-git-worktrees skill**

Branch name: `vercel-migration-01-foundation`. The worktree will be at `../sporthub-vercel-migration-01-foundation`.

- [ ] **Step 0.2: Verify worktree clean**

```bash
git status
```
Expected: `On branch vercel-migration-01-foundation`, nothing to commit.

---

## Phase 1: Next.js Scaffolding

### Task 1: Initialize Next.js at repo root

**Files:**
- Create: `package.json` (replaces existing root package.json)
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/page.tsx` (temp redirect)
- Create: `app/globals.css`
- Create: `.gitignore` updates

- [ ] **Step 1.1: Backup existing root package.json (keep for reference)**

```bash
cp package.json package.json.old-workspaces
```

- [ ] **Step 1.2: Write new root package.json**

```json
{
  "name": "sporthub",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "old:dev": "concurrently -n server,client -c blue,green \"cd server && npm run dev\" \"cd client && npm run dev\""
  },
  "dependencies": {
    "next": "^15.0.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-intl": "^3.26.0",
    "@prisma/client": "^5.22.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8",
    "axios": "^1.7.7",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.59.0",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.460.0",
    "date-fns": "^4.1.0",
    "react-hook-form": "^7.71.2",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "recharts": "^3.8.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "concurrently": "^9.2.1"
  }
}
```

Note: Removed `"workspaces"` config — old `client/` and `server/` directories will be standalone (reference only). The `old:dev` script preserves access to legacy dev mode if needed.

- [ ] **Step 1.3: Install dependencies**

```bash
rm -rf node_modules package-lock.json
npm install
```
Expected: exits 0. Some peer-dep warnings are OK.

- [ ] **Step 1.4: Write next.config.mjs**

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 1.5: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "client", "server", "Template Code"]
}
```

- [ ] **Step 1.6: Write tailwind.config.ts (port from client/tailwind.config.js)**

```bash
cp client/tailwind.config.js tailwind.config.js.tmp
```

Then write `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // COPY ENTIRE `theme` SECTION from client/tailwind.config.js
  },
  plugins: [],
};

export default config;
```

Open `client/tailwind.config.js`, copy the entire `theme: {}` block contents into the placeholder above. Remove the `tailwind.config.js.tmp` file after.

- [ ] **Step 1.7: Write postcss.config.mjs**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 1.8: Write app/globals.css (port from client/src/index.css)**

```bash
mkdir -p app
cp client/src/index.css app/globals.css
```

- [ ] **Step 1.9: Write app/layout.tsx (root layout)**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportHub',
  description: 'Sports court booking platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Note: `<html>` and `<body>` tags will live in `app/[lang]/layout.tsx` so locale attrs can be set per-language.

- [ ] **Step 1.10: Write temporary app/page.tsx (redirect to /en)**

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
```

- [ ] **Step 1.11: Update root .gitignore**

Add to `.gitignore` (check for existing entries first):

```
# Next.js
.next/
out/
*.tsbuildinfo
next-env.d.ts

# Env
.env
.env.local
.env*.local
```

- [ ] **Step 1.12: Run dev server smoke test**

```bash
npm run dev
```
Expected: Server starts on http://localhost:3000. Visit `http://localhost:3000` → redirects to `http://localhost:3000/en` → shows 404 (no `[lang]` layout yet). That's expected.

Stop the server with Ctrl-C.

- [ ] **Step 1.13: Commit**

```bash
git add -A
git commit -m "feat(vercel): scaffold Next.js 15 App Router at repo root

- Add Next.js, Tailwind, TypeScript config
- Set up root layout and redirect to /en
- Keep old client/ and server/ directories as reference

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2: Prisma Setup

### Task 2: Move Prisma to root and set up client

**Files:**
- Create: `prisma/schema.prisma` (copy from `server/prisma/schema.prisma`)
- Create: `prisma/seed.ts` (copy from `server/prisma/seed.ts`)
- Create: `src/lib/prisma.ts` (singleton)
- Create: `.env.local` (gitignored)
- Create: `.env.example`

- [ ] **Step 2.1: Copy Prisma schema and seed to root**

```bash
mkdir -p prisma
cp server/prisma/schema.prisma prisma/schema.prisma
cp server/prisma/seed.ts prisma/seed.ts
cp server/prisma/seed.sql prisma/seed.sql 2>/dev/null || true
```

- [ ] **Step 2.2: Verify prisma/schema.prisma has correct generator output path**

Open `prisma/schema.prisma`. Find the `generator client` block. It should look like:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

If it has a custom `output` path (e.g., pointing into server/), remove the `output` line so Prisma generates into default location (node_modules/@prisma/client).

- [ ] **Step 2.3: Write src/lib/prisma.ts (singleton for Next.js hot reload safety)**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 2.4: Write .env.local (DEV ONLY, gitignored)**

Use the user's current `server/.env` values. Read it first:

```bash
cat server/.env
```

Then write `.env.local`:

```bash
# Database — points to user's own PostgreSQL server
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"

# Auth
JWT_SECRET="<copy from server/.env>"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Optional: Google OAuth (if used)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

Note: For Vercel deployment, `?sslmode=require` is mandatory because Vercel connects over Internet.

- [ ] **Step 2.5: Write .env.example (committed)**

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/sporthub?sslmode=require"

# Auth
JWT_SECRET="change-this-to-a-long-random-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```

- [ ] **Step 2.6: Generate Prisma client**

```bash
npx prisma generate
```
Expected: `✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in <time>`

- [ ] **Step 2.7: Smoke test Prisma connection**

Create temporary file `scripts/check-db.ts`:

```typescript
import { prisma } from '../src/lib/prisma';

async function main() {
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log('DB connection OK:', result);
  const userCount = await prisma.user.count();
  console.log(`Total users: ${userCount}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('DB connection FAILED:', err);
  process.exit(1);
});
```

Run:

```bash
npx tsx scripts/check-db.ts
```
Expected: prints `DB connection OK: [ { ok: 1n } ]` and total user count.

- [ ] **Step 2.8: Delete the temp check script and commit**

```bash
rm scripts/check-db.ts
rmdir scripts 2>/dev/null || true
git add -A
git commit -m "feat(vercel): move Prisma schema to root, add singleton client

- Copy schema + seed from server/prisma to /prisma
- Add src/lib/prisma.ts with hot-reload safe singleton
- Configure DATABASE_URL via .env.local

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3: i18n with next-intl

### Task 3: Set up next-intl + middleware

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/navigation.ts`
- Create: `middleware.ts`
- Create: `messages/en.json` (copy from `client/src/i18n/locales/en.json`)
- Create: `messages/ko.json`, `ja.json`, `vi.json`, `ru.json`
- Create: `app/[lang]/layout.tsx`
- Create: `app/[lang]/page.tsx` (HomePage placeholder)

- [ ] **Step 3.1: Copy translation JSON files**

```bash
mkdir -p messages
cp client/src/i18n/locales/en.json messages/en.json
cp client/src/i18n/locales/ko.json messages/ko.json
cp client/src/i18n/locales/ja.json messages/ja.json
cp client/src/i18n/locales/vi.json messages/vi.json
cp client/src/i18n/locales/ru.json messages/ru.json
```

- [ ] **Step 3.2: Write src/i18n/routing.ts**

```typescript
import { defineRouting } from 'next-intl/routing';

export const SUPPORTED_LANGS = ['en', 'ko', 'ja', 'vi', 'ru'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  vi: 'Tiếng Việt',
  ru: 'Русский',
};

export const LANG_FLAGS: Record<SupportedLang, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  ja: '🇯🇵',
  vi: '🇻🇳',
  ru: '🇷🇺',
};

export const routing = defineRouting({
  locales: SUPPORTED_LANGS,
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

- [ ] **Step 3.3: Write src/i18n/request.ts**

```typescript
import { hasLocale } from 'next-intl/server';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3.4: Write src/i18n/navigation.ts (typed Link/redirect helpers)**

```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 3.5: Write middleware.ts at repo root**

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all routes except: api, _next, static files, admin (admin stays English-only)
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
};
```

- [ ] **Step 3.6: Write app/[lang]/layout.tsx**

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type SupportedLang } from '@/src/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!routing.locales.includes(lang as SupportedLang)) {
    notFound();
  }

  setRequestLocale(lang);
  const messages = await getMessages();

  return (
    <html lang={lang}>
      <body>
        <NextIntlClientProvider messages={messages} locale={lang}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3.7: Write app/[lang]/page.tsx (HomePage placeholder)**

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations();

  return (
    <main className="min-h-screen flex items-center justify-center bg-court-pattern">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-ink">
          SportHub — i18n working ({lang})
        </h1>
        <p className="mt-4 text-ink-muted">
          {t('home.welcome', { defaultValue: 'Welcome key not found — translations OK if you see this' })}
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3.8: Remove temp app/page.tsx (root redirect now redundant — middleware handles it)**

```bash
rm app/page.tsx
```

- [ ] **Step 3.9: Smoke test i18n routing**

```bash
npm run dev
```

Visit in browser:
- `http://localhost:3000` → should redirect to `/en`
- `http://localhost:3000/en` → shows "SportHub — i18n working (en)"
- `http://localhost:3000/vi` → shows "SportHub — i18n working (vi)"
- `http://localhost:3000/ko` → shows "SportHub — i18n working (ko)"
- `http://localhost:3000/zz` → 404

Stop the dev server.

- [ ] **Step 3.10: Commit**

```bash
git add -A
git commit -m "feat(vercel): set up next-intl with /:lang/ routing

- Add routing config supporting en, ko, ja, vi, ru
- Copy translation JSON files to /messages
- Add middleware for locale detection and redirect
- Admin routes bypassed (stay English-only)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4: Auth API Routes

### Task 4: Port auth helper libs

**Files:**
- Create: `src/lib/jwt.ts` (port from `server/src/lib/jwt.ts`)
- Create: `src/lib/otp.ts` (port from `server/src/lib/otp.ts`)
- Create: `src/lib/sms.ts` (port from `server/src/lib/sms.ts`)
- Create: `src/lib/oauth.ts` (port from `server/src/lib/oauth.ts`)
- Create: `src/lib/api-response.ts` (response helpers + AppError + error formatter)

- [ ] **Step 4.1: Copy helper libs as-is**

```bash
mkdir -p src/lib
cp server/src/lib/jwt.ts src/lib/jwt.ts
cp server/src/lib/otp.ts src/lib/otp.ts
cp server/src/lib/sms.ts src/lib/sms.ts
cp server/src/lib/oauth.ts src/lib/oauth.ts
cp server/src/lib/logger.ts src/lib/logger.ts 2>/dev/null || true
```

- [ ] **Step 4.2: Fix Prisma import paths in each lib file**

Open each of `src/lib/jwt.ts`, `src/lib/otp.ts`, `src/lib/sms.ts`, `src/lib/oauth.ts`. Replace any line like:

```typescript
import { prisma } from './prisma';
```

with:

```typescript
import { prisma } from '@/src/lib/prisma';
```

For env imports — old code may use `import { env } from '../config/env'`. Replace with `process.env.VARIABLE_NAME` directly (Next.js exposes env vars natively).

- [ ] **Step 4.3: Write src/lib/api-response.ts (replaces error.middleware.ts)**

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status: number, details?: unknown): NextResponse {
  return NextResponse.json({ success: false, error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return fail('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', 422, err.flatten().fieldErrors);
  }
  if (err instanceof AppError) {
    return fail(err.code, err.message, err.statusCode);
  }
  console.error('[API Error]', err);
  return fail('INTERNAL_ERROR', 'Internal server error', 500);
}
```

- [ ] **Step 4.4: Run typecheck on libs**

```bash
npx tsc --noEmit
```
Expected: no errors related to `src/lib/`. If any errors about missing types, install them (e.g., `npm install @types/X`).

- [ ] **Step 4.5: Commit**

```bash
git add -A
git commit -m "feat(vercel): port auth helper libs (jwt, otp, sms, oauth)

- Copy from server/src/lib with Prisma import path fixes
- Add api-response helpers replacing Express error middleware

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 5: Implement auth Route Handlers

**Files to create (one per Express controller action):**
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/admin/login/route.ts`
- `app/api/auth/admin/verify-2fa/route.ts`
- `app/api/auth/google/route.ts`
- `app/api/auth/google/callback/route.ts`

For each handler: read the corresponding action in `server/src/controllers/auth.controller.ts` (lines 48-326) and port the logic. Pattern below.

- [ ] **Step 5.1: Write app/api/auth/register/route.ts**

```typescript
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/src/lib/jwt';
import { ok, fail, AppError, handleError } from '@/src/lib/api-response';

const RegisterSchema = z
  .object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8),
  })
  .refine((d) => d.phone || d.email, { message: 'phone hoặc email là bắt buộc' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    if (data.email) {
      const exists = await prisma.user.findUnique({ where: { email: data.email } });
      if (exists) throw new AppError(409, 'EMAIL_TAKEN', 'Email đã được sử dụng');
    }
    if (data.phone) {
      const exists = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (exists) throw new AppError(409, 'PHONE_TAKEN', 'Số điện thoại đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        passwordHash,
        role: UserRole.guest,
      },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });

    const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role, name: user.name });

    return ok({ user, tokens: { accessToken, refreshToken, expiresIn: 900 } }, 201);
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 5.2: Test register endpoint**

Start dev server: `npm run dev`. In another terminal:

```bash
curl -sX POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test+'"$(date +%s)"'@example.com","password":"password123"}' \
  | head -c 500
```

Expected: JSON `{"success":true,"data":{"user":{...},"tokens":{...}}}` with status 201.

If the email-uniqueness logic triggers, change the email each time you re-test. Stop the dev server.

- [ ] **Step 5.3: Write app/api/auth/login/route.ts**

Port from `server/src/controllers/auth.controller.ts:87-133`:

```typescript
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/src/lib/jwt';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const LoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = LoginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isActive: true,
      },
      include: {
        memberships: {
          where: { status: 'active' },
          select: { plan: true },
          take: 1,
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role, name: user.name });

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email ?? '',
        phone: user.phone ?? undefined,
        role: user.role,
        plan: user.memberships[0]?.plan ?? null,
      },
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    });
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 5.4: Test login endpoint**

```bash
npm run dev
# In another terminal:
curl -sX POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"<email from step 5.2>","password":"password123"}'
```
Expected: `{"success":true,"data":{"user":{...},"tokens":{...}}}` with status 200.

Stop dev server.

- [ ] **Step 5.5: Write app/api/auth/forgot-password/route.ts**

Port from `server/src/controllers/auth.controller.ts:135-152`. Same pattern as Step 5.1: extract zod schema, parse `req.json()`, call existing libs (`generateOTP`, `sendOTP`), return `ok(...)` or `handleError`.

- [ ] **Step 5.6: Write app/api/auth/reset-password/route.ts**

Port from `auth.controller.ts:154-180`.

- [ ] **Step 5.7: Write app/api/auth/refresh/route.ts**

Port from `auth.controller.ts:182-209`.

- [ ] **Step 5.8: Write app/api/auth/admin/login/route.ts**

Port from `auth.controller.ts:211-248`. Note: file at `app/api/auth/admin/login/route.ts`.

- [ ] **Step 5.9: Write app/api/auth/admin/verify-2fa/route.ts**

Port from `auth.controller.ts:250-301`. File at `app/api/auth/admin/verify-2fa/route.ts`.

- [ ] **Step 5.10: Write app/api/auth/google/route.ts (GET)**

Port from `auth.controller.ts:303-310`. Use `export async function GET(req: NextRequest)` instead of POST.

```typescript
import { NextRequest } from 'next/server';
import { getGoogleAuthUrl } from '@/src/lib/oauth';
import { ok, handleError } from '@/src/lib/api-response';

export async function GET(_req: NextRequest) {
  try {
    const authUrl = await getGoogleAuthUrl();
    return ok({ authUrl });
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 5.11: Write app/api/auth/google/callback/route.ts (GET)**

Port from `auth.controller.ts:312-325`. Read `code` from URL query, not body.

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleGoogleCallback } from '@/src/lib/oauth';
import { ok, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const { code: validated } = z.object({ code: z.string() }).parse({ code });
    const result = await handleGoogleCallback(validated);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
```

- [ ] **Step 5.12: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5.13: Smoke-test all auth endpoints**

```bash
npm run dev
```

Test each in another terminal:

```bash
# Register (use unique email)
EMAIL="test+$(date +%s)@example.com"
curl -sX POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" | head -c 200
echo

# Login
TOKEN=$(curl -sX POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$EMAIL\",\"password\":\"password123\"}" \
  | sed -nE 's/.*"refreshToken":"([^"]+)".*/\1/p')
echo "Got refresh token: ${TOKEN:0:30}..."

# Refresh
curl -sX POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$TOKEN\"}" | head -c 200
echo
```
Expected: all three return `success: true`. Stop dev server.

- [ ] **Step 5.14: Commit**

```bash
git add -A
git commit -m "feat(vercel): port auth API routes to Next.js Route Handlers

All 9 endpoints from server/src/controllers/auth.controller.ts:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/refresh
- POST /api/auth/admin/login
- POST /api/auth/admin/verify-2fa
- GET  /api/auth/google
- GET  /api/auth/google/callback

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 5: Auth Pages

### Task 6: Port Zustand auth store + axios client

**Files:**
- Create: `src/lib/api-client.ts` (axios instance)
- Create: `src/lib/auth-store.ts` (Zustand store, port from `client/src/store/auth.store.ts`)
- Create: `src/lib/api/auth.ts` (port from `client/src/api/auth.ts`)

- [ ] **Step 6.1: Read existing client/src/api/index.ts and client/src/store/auth.store.ts**

Open both files to see exact shape. They use axios + Zustand patterns.

- [ ] **Step 6.2: Write src/lib/api-client.ts**

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}
```

Note: `baseURL: '/api'` instead of `http://localhost:3001/api` — Next.js serves API from same origin.

- [ ] **Step 6.3: Copy auth store**

```bash
cp client/src/store/auth.store.ts src/lib/auth-store.ts
```

Open `src/lib/auth-store.ts`. If it imports anything from `../api/`, update the path to `@/src/lib/api/...`. If types come from `../types/...`, update paths.

- [ ] **Step 6.4: Copy auth API helper**

```bash
mkdir -p src/lib/api
cp client/src/api/auth.ts src/lib/api/auth.ts
```

Open `src/lib/api/auth.ts`. Update axios import to point at `@/src/lib/api-client`.

- [ ] **Step 6.5: Verify typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6.6: Commit**

```bash
git add -A
git commit -m "feat(vercel): port axios client, auth store, auth API helper

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 7: Port shared components (Spinner only — minimum needed for auth pages)

**Files:**
- Create: `components/Spinner.tsx`

- [ ] **Step 7.1: Copy Spinner**

```bash
mkdir -p components
cp client/src/components/Spinner.tsx components/Spinner.tsx
```

- [ ] **Step 7.2: Verify typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 7.3: Commit**

```bash
git add components/Spinner.tsx
git commit -m "feat(vercel): port Spinner component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 8: Port LoginPage

**Files:**
- Create: `app/[lang]/login/page.tsx`

- [ ] **Step 8.1: Write app/[lang]/login/page.tsx**

This is a Client Component (uses hooks). Use `'use client'` directive. Replace `react-router-dom` with `next-intl/navigation`. Source: `client/src/pages/auth/LoginPage.tsx`.

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/src/i18n/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/lib/auth-store';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const t = useTranslations();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      const adminRoles = ['admin', 'super_admin', 'staff'];
      if (adminRoles.includes(user.role)) {
        router.replace('/admin/dashboard');
      } else {
        router.replace(`/${lang}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        t('auth.loginFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 py-12 bg-court-pattern">
      <div className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <Link href="/" className="flex items-center gap-3 mb-3" aria-label="SportHub home">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-sport">
              <Activity className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-display font-bold text-ink tracking-tight">
              Sport<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="text-xs text-ink-muted font-semibold tracking-wide">{t('auth.platformTagline')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sport-card p-6 md:p-8"
        >
          <h1 className="text-2xl font-display font-bold text-ink mb-1">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-ink-muted mb-6">{t('auth.loginSubtitle')}</p>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 px-3.5 py-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger-text text-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-ink-muted">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold text-ink-muted">
                  {t('auth.password')}
                </label>
                <Link href="/login" tabIndex={-1} aria-hidden="true" className="text-xs font-bold text-ink-subtle pointer-events-none select-none">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <Spinner size={18} />
                  {t('auth.authenticating')}
                </>
              ) : (
                <>
                  {t('auth.loginButton')}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-ink-muted">
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="text-primary font-bold hover:text-primary-hover hover:underline">
                {t('auth.registerLink')}
              </Link>
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-[11px] text-ink-subtle font-medium">{t('auth.copyright')}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2: Run dev server and test login page renders**

```bash
npm run dev
```

Visit `http://localhost:3000/en/login`. Expected: page renders with all fields, translations show. Try logging in with the user created in Phase 4 — should redirect to `/en`. Stop dev server.

- [ ] **Step 8.3: Commit**

```bash
git add -A
git commit -m "feat(vercel): port LoginPage to Next.js App Router

- Replace react-router-dom with next-intl navigation
- Use next-intl useTranslations hook
- Use next/navigation useRouter

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 9: Port RegisterPage

**Files:**
- Create: `app/[lang]/register/page.tsx`

- [ ] **Step 9.1: Port RegisterPage following same pattern as LoginPage**

Source: `client/src/pages/auth/RegisterPage.tsx`. Apply same transformations:
- Add `'use client'` directive at top
- Replace `useNavigate` → `useRouter` from `next/navigation`
- Replace `Link` from `react-router-dom` → `Link` from `@/src/i18n/navigation`
- Replace `useTranslation()` → `useTranslations()` from `next-intl`
- Replace `useParams` from `react-router-dom` → `useParams` from `next/navigation`
- Use `<Link href="/login">` etc — next-intl handles prefixing

Write to `app/[lang]/register/page.tsx`.

- [ ] **Step 9.2: Test register page**

Start dev server. Visit `http://localhost:3000/en/register`. Verify page renders, translations work, can register a new user. Stop dev server.

- [ ] **Step 9.3: Commit**

```bash
git add -A
git commit -m "feat(vercel): port RegisterPage to Next.js App Router

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 6: Verification

### Task 10: End-to-end auth smoke test

- [ ] **Step 10.1: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 10.2: Run lint**

```bash
npm run lint
```
Expected: passes or shows only warnings.

- [ ] **Step 10.3: Run production build**

```bash
npm run build
```
Expected: Build completes. Note any pages missing `generateStaticParams` — for now we only have `[lang]/page.tsx`, `[lang]/login/page.tsx`, `[lang]/register/page.tsx` which inherit from layout's `generateStaticParams`.

- [ ] **Step 10.4: Manual browser test using Playwright**

Run:

```bash
npm run dev
```

In a browser, walk through:
1. Visit `http://localhost:3000` → redirects to `/en`
2. Click any language switcher (not yet ported — manually visit `/vi/login`) → translations swap
3. Visit `/en/register` → fill form with unique email → submit → redirects to `/en`
4. Open DevTools → Application → localStorage → confirm `accessToken` is set
5. Visit `/en/login` → fill same credentials → redirects to `/en`
6. Visit `/en` → shows "i18n working (en)"

Stop dev server.

- [ ] **Step 10.5: Code review using review-agent**

Run the project review-agent on the new code:

```bash
# (Use Claude Agent tool: subagent_type=review-agent)
# Scope: app/, src/, components/, middleware.ts, prisma/, messages/
# Focus: API correctness, type safety, security, i18n setup
```

Apply any high-priority fixes inline before continuing.

- [ ] **Step 10.6: Final commit if any fixes were made**

```bash
git add -A
git commit -m "fix(vercel): address review feedback for Phase 1 foundation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 10.7: Push branch to remote (optional, for PR or backup)**

```bash
git push -u origin vercel-migration-01-foundation
```

---

## Done Criteria

✅ Plan complete when:
- `npm run dev` starts and serves on http://localhost:3000
- `/en`, `/vi`, `/ko`, `/ja`, `/ru` all return localized HomePage placeholder
- `POST /api/auth/register` creates a new user
- `POST /api/auth/login` returns tokens
- `/en/login` and `/en/register` pages render and work end-to-end
- `npx tsc --noEmit` passes
- `npm run build` completes
- Old `client/` and `server/` directories untouched

## Next Plan Preview

After this plan: write **Phase 2 — Customer Pages** plan covering:
- HomePage (courts listing, requires courts API)
- BookingFlow (slot selection, requires bookings/courts/payments APIs)
- BookingSuccessPage
- Navbar with LanguageSwitcher
- Shared customer components (Badge, PriceBreakdown, MemberSearch, TimeSlotGrid, Modal, etc.)
