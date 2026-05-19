import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { ok, handleError } from '@/src/lib/api-response';

export async function GET(_req: NextRequest) {
  try {
    const plans = await prisma.membershipPlanConfig.findMany({ orderBy: { priceVnd: 'asc' } });
    return ok(plans);
  } catch (err) {
    return handleError(err);
  }
}
