'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/lib/auth-store';
import AdminSidebar from '@/components/AdminSidebar';
import QueryProvider from '@/components/QueryProvider';

type Role = 'guest' | 'member' | 'staff' | 'admin' | 'super_admin';

const ROLE_RANK: Record<Role, number> = {
  guest: 0,
  member: 1,
  staff: 2,
  admin: 3,
  super_admin: 4,
};

function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  // Wait for zustand/persist to rehydrate from localStorage before applying the
  // role gate. Without this, an authenticated staff user is redirected to /en/login
  // on every full-page load because the initial client render runs with the store's
  // default state (isAuthenticated=false) before the persist middleware restores the
  // user/token from storage.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist || persist.hasHydrated?.()) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      router.replace('/en/login');
      return;
    }
    if ((ROLE_RANK[user.role as Role] ?? 0) < ROLE_RANK.staff) {
      router.replace('/en');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated || !user) return null;
  if ((ROLE_RANK[user.role as Role] ?? 0) < ROLE_RANK.staff) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-[220px] p-6 md:p-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AdminShell>{children}</AdminShell>
        </QueryProvider>
      </body>
    </html>
  );
}
