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
