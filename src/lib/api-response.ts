import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import * as jwt from 'jsonwebtoken';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status: number, details?: unknown): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return fail('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', 422, err.flatten().fieldErrors);
  }
  if (err instanceof AppError) {
    return fail(err.code, err.message, err.statusCode);
  }
  if (err instanceof jwt.TokenExpiredError) {
    return fail('TOKEN_EXPIRED', 'Token đã hết hạn', 401);
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return fail('INVALID_TOKEN', 'Token không hợp lệ', 401);
  }
  console.error('[API Error]', err);
  return fail('INTERNAL_ERROR', 'Internal server error', 500);
}
