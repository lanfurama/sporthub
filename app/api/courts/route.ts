import { NextRequest, NextResponse } from 'next/server';
import { Prisma, CourtStatus, SportType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
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
