import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BookingStatus, OrderStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { verifyVNPayCallback } from '@/src/lib/vnpay';
import { verifyMoMoCallback } from '@/src/lib/momo';
import { AppError, handleError } from '@/src/lib/api-response';

const QuerySchema = z.object({
  type: z.enum(['booking', 'order']),
  id: z.string(),
});

// VNPay callback uses GET with query params
export async function GET(req: NextRequest) {
  try {
    const queryObj: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const { type, id } = QuerySchema.parse({
      type: queryObj.type,
      id: queryObj.id,
    });

    const result = verifyVNPayCallback(queryObj);
    if (!result.isValid) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Chữ ký không hợp lệ');
    }
    if (result.responseCode !== '00') {
      return NextResponse.json({ success: false, message: 'Thanh toán thất bại' });
    }

    if (type === 'booking') {
      await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.confirmed, payMethod: 'vnpay' },
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: { status: OrderStatus.paid, payMethod: 'vnpay' },
      });
    }

    return NextResponse.json({ success: true, message: 'Thanh toán thành công' });
  } catch (err) {
    return handleError(err);
  }
}

// MoMo IPN uses POST with body params + query for type/id
export async function POST(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type');
    const id = req.nextUrl.searchParams.get('id');
    const { type: validType, id: validId } = QuerySchema.parse({ type, id });

    let body: Record<string, string> = {};
    try {
      body = (await req.json()) as Record<string, string>;
    } catch {
      body = {};
    }
    const result = verifyMoMoCallback(body);

    if (!result.isValid) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Chữ ký không hợp lệ');
    }
    if (result.resultCode !== '0') {
      return NextResponse.json({ success: false, message: 'Thanh toán thất bại' });
    }

    if (validType === 'booking') {
      await prisma.booking.update({
        where: { id: validId },
        data: { status: BookingStatus.confirmed, payMethod: 'momo' },
      });
    } else {
      await prisma.order.update({
        where: { id: validId },
        data: { status: OrderStatus.paid, payMethod: 'momo' },
      });
    }

    return NextResponse.json({ success: true, message: 'Thanh toán thành công' });
  } catch (err) {
    return handleError(err);
  }
}
