'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/lib/auth-store';
import AdminSidebar from '@/components/AdminSidebar';

type Role = 'guest' | 'member' | 'staff' | 'admin' | 'super_admin';

const ROLE_RANK: Record<Role, number> = {
  guest: 0,
  member: 1,
  staff: 2,
  admin: 3,
  super_admin: 4,
};

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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-[220px] p-6 md:p-8">{children}</main>
    </div>
  );
}
