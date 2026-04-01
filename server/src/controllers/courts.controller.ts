import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma, CourtStatus, SportType, BookingStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

const CourtSchema = z.object({
  name: z.string().min(1).max(100),
  sport: z.enum(['Tennis', 'Pickleball', 'Badminton']),
  surface: z.string().max(50).optional(),
  isIndoor: z.boolean().optional(),
  priceNormal: z.number().int().positive(),
  pricePeak: z.number().int().positive(),
  peakStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  peakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function listCourts(req: Request, res: Response, next: NextFunction) {
  try {
    const { sport, indoor, status = 'active' } = req.query;
    
    console.log(`\n🔍 [Courts API] listCourts called`);
    console.log(`   Query params:`, { sport, indoor, status });
    
    const where: Prisma.CourtWhereInput = {
      ...(indoor !== undefined ? { isIndoor: indoor === 'true' } : {}),
    };
    
    if (sport) {
      const sportMap: Record<string, SportType> = {
        'Tennis': SportType.Tennis,
        'Pickleball': SportType.Pickleball,
        'Badminton': SportType.Badminton,
      };
      if (sportMap[sport as string]) {
        where.sport = sportMap[sport as string];
      }
    }
    
    const statusMap: Record<string, CourtStatus> = {
      'active': CourtStatus.active,
      'maintenance': CourtStatus.maintenance,
      'inactive': CourtStatus.inactive,
    };
    where.status = statusMap[status as string] || CourtStatus.active;
    
    const courts = await prisma.court.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    
    console.log(`   ✅ Found ${courts.length} courts`);
    
    res.json({ success: true, data: courts, meta: { total: courts.length } });
  } catch (err) {
    console.error(`\n❌ [Courts API] listCourts ERROR`);
    console.error(`   Error:`, err);
    if (err instanceof Error) {
      console.error(`   Message:`, err.message);
      console.error(`   Stack:`, err.stack);
    }
    console.error('');
    next(err);
  }
}

export async function getCourt(req: Request, res: Response, next: NextFunction) {
  try {
    const court = await prisma.court.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');
    res.json({ success: true, data: court });
  } catch (err) {
    next(err);
  }
}

export async function getCourtAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const courtId = parseInt(req.params.id);
    const date = req.query.date as string;

    if (!date) throw new AppError(400, 'BAD_REQUEST', 'Vui lòng cung cấp ngày');

    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(date),
        status: { notIn: [BookingStatus.cancelled, BookingStatus.rejected] },
      },
      select: { startTime: true, durationHours: true },
    });

    const ALL_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
    const peakStart = parseInt(court.peakStart.split(':')[0]);
    const peakEnd = parseInt(court.peakEnd.split(':')[0]);

    const slots = ALL_SLOTS.map((time) => {
      const hour = parseInt(time.split(':')[0]);
      const isPeak = hour >= peakStart && hour < peakEnd;

      const isBooked = bookings.some((b) => {
        const bStart = parseInt(b.startTime.split(':')[0]);
        const bEnd = bStart + parseFloat(b.durationHours.toString());
        return hour >= bStart && hour < bEnd;
      });

      return {
        time,
        duration: 60,
        available: !isBooked,
        isPeak,
        price: isPeak ? court.pricePeak : court.priceNormal,
      };
    });

    res.json({ success: true, data: { courtId, date, slots } });
  } catch (err) {
    next(err);
  }
}

export async function createCourt(req: Request, res: Response, next: NextFunction) {
  try {
    const data = CourtSchema.parse(req.body);
    const court = await prisma.court.create({ data });
    res.status(201).json({ success: true, data: court });
  } catch (err) {
    next(err);
  }
}

export async function updateCourt(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const data = CourtSchema.partial().parse(req.body);
    const court = await prisma.court.update({ where: { id }, data });
    res.json({ success: true, data: court });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourt(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await prisma.court.update({ where: { id }, data: { status: CourtStatus.inactive } });
    res.json({ success: true, message: 'Sân đã bị xóa' });
  } catch (err) {
    next(err);
  }
}
