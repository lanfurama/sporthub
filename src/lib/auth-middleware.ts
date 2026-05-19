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

export function requireMinRole(
  ctx: AuthContext,
  minRole: 'member' | 'staff' | 'admin' | 'super_admin',
): void {
  const userRank = ROLE_RANK[ctx.role] ?? 0;
  const requiredRank = ROLE_RANK[minRole] ?? 0;
  if (userRank < requiredRank) {
    throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
  }
}
