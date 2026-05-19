import { NextRequest } from 'next/server';
import { BookingStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const ALL_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const courtId = parseInt(idStr, 10);
    if (Number.isNaN(courtId)) throw new AppError(400, 'BAD_REQUEST', 'ID không hợp lệ');

    const date = req.nextUrl.searchParams.get('date');
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

    const peakStart = parseInt(court.peakStart.split(':')[0], 10);
    const peakEnd = parseInt(court.peakEnd.split(':')[0], 10);

    const slots = ALL_SLOTS.map((time) => {
      const hour = parseInt(time.split(':')[0], 10);
      const isPeak = hour >= peakStart && hour < peakEnd;

      const isBooked = bookings.some((b) => {
        const bStart = parseInt(b.startTime.split(':')[0], 10);
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

    return ok({ courtId, date, slots });
  } catch (err) {
    return handleError(err);
  }
}
