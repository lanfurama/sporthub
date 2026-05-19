import { BookingStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';

export function generateRef(): string {
  return 'SH' + Math.floor(100000 + Math.random() * 900000).toString();
}

// Parse "HH:MM" to decimal hours (e.g. "09:30" → 9.5)
export function timeToDecimal(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

export async function checkSlotAvailable(
  courtId: number,
  date: string,
  time: string,
  duration: number,
  excludeBookingId?: string,
): Promise<boolean> {
  const newStart = timeToDecimal(time);
  const newEnd = newStart + duration;

  const existing = await prisma.booking.findMany({
    where: {
      courtId,
      bookingDate: new Date(date),
      status: { notIn: [BookingStatus.cancelled, BookingStatus.rejected] },
      ...(excludeBookingId ? { NOT: { id: excludeBookingId } } : {}),
    },
    select: { startTime: true, durationHours: true },
  });

  return !existing.some((b) => {
    const bStart = timeToDecimal(b.startTime);
    const bEnd = bStart + parseFloat(b.durationHours.toString());
    return newStart < bEnd && newEnd > bStart;
  });
}

export async function calcPrice(
  court: { priceNormal: number; pricePeak: number; peakStart: string; peakEnd: string },
  time: string,
  duration: number,
  membership: { planConfig: { courtDiscountPct: number }; creditBalance: number } | null,
  creditAmount = 0,
) {
  const hour = parseInt(time.split(':')[0]);
  const peakStart = parseInt(court.peakStart.split(':')[0]);
  const peakEnd = parseInt(court.peakEnd.split(':')[0]);
  const isPeak = hour >= peakStart && hour < peakEnd;
  const basePrice = Math.round((isPeak ? court.pricePeak : court.priceNormal) * duration);
  const discountPct = membership?.planConfig.courtDiscountPct ?? 0;
  const discountAmount = Math.round((basePrice * discountPct) / 100);
  const maxCredit = membership
    ? Math.min(creditAmount, membership.creditBalance, basePrice - discountAmount)
    : 0;
  const finalPrice = basePrice - discountAmount - maxCredit;
  return { basePrice, discountAmount, creditUsed: maxCredit, finalPrice };
}
