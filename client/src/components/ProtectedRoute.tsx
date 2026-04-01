import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { ReactNode } from 'react';

type Role = 'guest' | 'member' | 'staff' | 'admin' | 'super_admin';

const ROLE_RANK: Record<Role, number> = {
  guest:       0,
  member:      1,
  staff:       2,
  admin:       3,
  super_admin: 4,
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
}

export default function ProtectedRoute({
  children,
  requiredRole = 'member',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRank = ROLE_RANK[user.role as Role] ?? 0;
  const requiredRank = ROLE_RANK[requiredRole] ?? 0;

  if (userRank < requiredRank) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
