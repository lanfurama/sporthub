import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { ok, AppError, handleError } from '@/src/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new AppError(400, 'BAD_REQUEST', 'ID không hợp lệ');

    const court = await prisma.court.findUnique({ where: { id } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    return ok(court);
  } catch (err) {
    return handleError(err);
  }
}
