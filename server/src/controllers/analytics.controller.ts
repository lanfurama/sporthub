import { Request, Response, NextFunction } from 'express';
import { BookingStatus, MembershipStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 7 ngày gần đây (bao gồm hôm nay)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      todayBookings,
      pendingCount,
      todayRevenue,
      memberCounts,
      recentBookings,
      sourceBreakdown,
      dailyBookingsGrouped,
    ] = await prisma.$transaction([
      prisma.booking.count({ where: { bookingDate: { gte: today, lt: tomorrow }, status: { notIn: [BookingStatus.cancelled, BookingStatus.rejected] } } }),
      prisma.booking.count({ where: { status: BookingStatus.pending } }),
      prisma.booking.aggregate({ where: { bookingDate: { gte: today, lt: tomorrow }, status: BookingStatus.confirmed }, _sum: { finalPrice: true } }),
      prisma.membership.groupBy({ by: ['plan'], where: { status: MembershipStatus.active }, _count: { _all: true }, orderBy: { plan: 'asc' } }),
      prisma.booking.findMany({
        where: { bookingDate: { gte: today, lt: tomorrow } },
        include: { court: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.booking.groupBy({ by: ['source'], where: { bookingDate: { gte: today, lt: tomorrow } }, _count: { _all: true }, orderBy: { source: 'asc' } }),
      prisma.booking.groupBy({
        by: ['bookingDate'],
        where: {
          bookingDate: {
            gte: sevenDaysAgo,
            lt: tomorrow,
          },
          status: {
            notIn: [BookingStatus.cancelled, BookingStatus.rejected],
          },
        },
        _count: { _all: true },
        orderBy: { bookingDate: 'asc' },
      }),
    ]);

    const memberMap = memberCounts.reduce((acc: Record<string, number>, m) => { 
      const count = typeof m._count === 'object' && m._count !== null && '_all' in m._count 
        ? (m._count as { _all: number })._all 
        : 0;
      acc[m.plan] = count;
      return acc;
    }, {} as Record<string, number>);
    const totalMembers = Object.values(memberMap).reduce((a: number, b: number) => a + b, 0);
    const sourceMap = sourceBreakdown.reduce((acc: Record<string, number>, s) => { 
      const count = typeof s._count === 'object' && s._count !== null && '_all' in s._count 
        ? (s._count as { _all: number })._all 
        : 0;
      acc[s.source] = count;
      return acc;
    }, {} as Record<string, number>);

    // Map daily bookings thành array 7 ngày liên tục (kể cả ngày không có booking)
    const groupedByDate = dailyBookingsGrouped.reduce((acc: Record<string, number>, d) => {
      const key = (d.bookingDate as Date).toISOString().split('T')[0];
      const count = typeof d._count === 'object' && d._count !== null && '_all' in d._count
        ? (d._count as { _all: number })._all
        : 0;
      acc[key] = count;
      return acc;
    }, {} as Record<string, number>);

    const dailyBookings = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().split('T')[0];
      return {
        date: key,
        bookings: groupedByDate[key] ?? 0,
      };
    });

    res.json({
      success: true,
      data: {
        today: {
          bookingsCount: todayBookings,
          pendingCount,
          revenue: todayRevenue._sum.finalPrice ?? 0,
        },
        members: { total: totalMembers, ...memberMap },
        recentBookings,
        sourceBreakdown: { online: sourceMap.online ?? 0, admin: sourceMap.admin ?? 0 },
        dailyBookings,
      },
    });
  } catch (err) {
    next(err);
  }
}
